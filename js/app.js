// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - app.js (VERSIÓN FINAL v5.0 - FIREBASE + ROLES)
// Guardar con codificación UTF-8
// ─────────────────────────────────────────────────────────────────────

const app = {
    // --- Estado General ---
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    respuestaTemporal: null,
    modoActual: 'admin',
    trabajadorActual: null,
    userData: { empresa: '', nombre: '', curp: '', puesto: '' },
    licencia: { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3, features: {} },

    // --- Firebase ---
    db: null,
    auth: null,
    currentUser: null,
    isAdmin: false,
    firebaseListo: false,

    // --- Timers ---
    timerExamen: null,
    tiempoLimite: 30 * 60 * 1000,
    tiempoInicio: null,
    timerCaso: null,
    tiempoCasoLimite: 40 * 60 * 1000,
    examenGuardado: null,
    casoActual: null,
    respuestasCaso: {},
    resultadoCaso: null,
    deferredPrompt: null,

    // ─────────────────────────────────────────────────────────────────
    // INICIALIZACIÓN
    // ─────────────────────────────────────────────────────────────────
    init: function() {
        console.log('RayoShield iniciado v5.0');
        
        // 1. Configuración inicial
        if (!localStorage.getItem('rayoshield_admin_password')) {
            localStorage.setItem('rayoshield_admin_password', 'admin123');
        }
        
        // 2. Cargar datos locales
        this.cargarLicencia();
        this.cargarDatosUsuario();
        this.cargarHistorial();
        this.cargarExamenGuardado();
        
        // 3. Inicializar Firebase si está disponible
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            this.db = db;
            this.auth = auth;
            this.firebaseListo = true;
            console.log('✅ Firebase conectado');
            
            // Escuchar cambios de autenticación
            this.auth.onAuthStateChanged(async (user) => {
                this.currentUser = user;
                if (user) {
                    // Verificar si es admin
                    const adminDoc = await this.db.collection('admins').doc(user.uid).get();
                    this.isAdmin = adminDoc.exists;
                    
                    // Si es admin y hay trabajador seleccionado, limpiar modo trabajador
                    if (this.isAdmin && MultiUsuario.getTrabajadorActual()) {
                        MultiUsuario.clearTrabajadorActual();
                        this.modoActual = 'admin';
                    }
                } else {
                    this.isAdmin = false;
                    // Modo DEMO o invitado
                }
                this.actualizarUI();
                this.actualizarUIMenuPorRol();
            });
        } else {
            console.log('⚠️ Firebase no disponible - Modo offline/local');
            this.firebaseListo = false;
        }
        
        // 4. Inicializar MultiUsuario si existe
        if (typeof MultiUsuario !== 'undefined') {
            MultiUsuario.init();
        }
        
        // 5. UI y eventos
        this.initPWAInstall();
        this.actualizarUI();
        this.mostrarPantalla('home-screen');
        this.verificarExpiracionLicencia();
        this.actualizarBadgeTrabajadores();
        this.actualizarUIMenuPorRol();
    },

    // ─────────────────────────────────────────────────────────────────
    // UTILS: PERMISOS Y ROLES
    // ─────────────────────────────────────────────────────────────────
    esAdmin: function() {
        return this.isAdmin || this.modoActual === 'admin';
    },
    
    esTrabajador: function() {
        return !this.isAdmin && (this.modoActual === 'trabajador' || MultiUsuario.getTrabajadorActual() !== null);
    },
    
    puedeVer: function(seccion) {
        // Si no hay Firebase o es DEMO, reglas locales
        if (!this.firebaseListo || this.licencia.tipo === 'DEMO') {
            const localPermissions = {
                'home': true, 'examenes': true, 'casos': true,
                'perfil': true, 'historial': true,
                'licencia': true, 'trabajadores': false, 'info': true
            };
            return localPermissions[seccion] || false;
        }
        
        // Reglas con autenticación real
        const esAdmin = this.isAdmin;
        const permisos = {
            'home': true,
            'examenes': true,
            'casos': true,
            'perfil': true,
            'historial': true,
            'licencia': esAdmin,
            'trabajadores': esAdmin,
            'info': true
        };
        return permisos[seccion] || false;
    },
    
    verificarAccesoAdmin: function(funcionNombre, mostrarAlerta = true) {
        if (!this.esAdmin()) {
            if (mostrarAlerta) alert('⚠️ Acceso denegado. Solo administradores.');
            return false;
        }
        return true;
    },
    
    verificarPasswordAdmin: function() {
        const pwd = prompt('🔐 Contraseña de administrador:');
        if (!pwd) return false;
        const guardada = localStorage.getItem('rayoshield_admin_password') || 'admin123';
        if (pwd !== guardada) {
            alert('❌ Contraseña incorrecta');
            return false;
        }
        return true;
    },

    // ─────────────────────────────────────────────────────────────────
    // FIREBASE: GESTIÓN DE TRABAJADORES Y ENLACES
    // ─────────────────────────────────────────────────────────────────
    crearTrabajadorConEnlace: async function(datos) {
        if (!this.firebaseListo || !this.isAdmin) {
            alert('❌ No autorizado o Firebase no disponible');
            return null;
        }
        
        try {
            const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
            const expiracion = new Date();
            expiracion.setDate(expiracion.getDate() + 7);
            
            const trabajadorRef = await this.db.collection('trabajadores').add({
                ...datos,
                codigoAcceso: codigo,
                fechaExpiracionCodigo: firebase.firestore.Timestamp.fromDate(expiracion),
                estado: 'activo',
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            const enlace = `${window.location.origin}${window.location.pathname}?access=${trabajadorRef.id}&code=${codigo}`;
            
            return { id: trabajadorRef.id, enlace, codigo, expira: expiracion.toLocaleDateString() };
        } catch (e) {
            console.error('Error creando trabajador:', e);
            alert('Error al generar enlace');
            return null;
        }
    },
    
    validarEnlaceAcceso: async function(trabajadorId, codigo) {
        if (!this.firebaseListo) return { valido: false, error: 'Firebase no disponible' };
        
        try {
            const doc = await this.db.collection('trabajadores').doc(trabajadorId).get();
            if (!doc.exists) return { valido: false, error: 'Trabajador no encontrado' };
            
            const data = doc.data();
            if (data.codigoAcceso !== codigo) return { valido: false, error: 'Código inválido' };
            if (data.fechaExpiracionCodigo?.toDate() < new Date()) return { valido: false, error: 'Enlace expirado' };
            if (data.estado !== 'activo') return { valido: false, error: 'Cuenta inactiva' };
            
            // Autenticación anónima
            const userCred = await this.auth.signInAnonymously();
            localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify({
                id: trabajadorId, uid: userCred.user.uid, nombre: data.nombre
            }));
            
            return { valido: true, trabajador: { id: trabajadorId, nombre: data.nombre, curp: data.curp, puesto: data.puesto } };
        } catch (e) {
            console.error('Error validando enlace:', e);
            return { valido: false, error: 'Error de conexión' };
        }
    },
    
    // ─────────────────────────────────────────────────────────────────
    // NAVEGACIÓN Y PANTALLAS
    // ─────────────────────────────────────────────────────────────────
    mostrarPantalla: function(id) {
        if (!this.puedeVer(id) && id !== 'home-screen' && id !== 'exam-screen' && id !== 'result-screen') {
            alert('🔐 Acceso denegado');
            return;
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
        if (this.timerExamen && id !== 'exam-screen') { clearInterval(this.timerExamen); this.timerExamen = null; }
    },
    
    volverHome: function() {
        if (this.timerExamen) clearInterval(this.timerExamen);
        if (this.timerCaso) clearInterval(this.timerCaso);
        this.examenActual = null;
        this.mostrarPantalla('home-screen');
    },
    
    mostrarLicencia: function() {
        if (!this.verificarAccesoAdmin('mostrarLicencia')) return;
        this.mostrarPantalla('license-screen');
    },
    
    mostrarInfo: function() {
        if (!this.verificarAccesoAdmin('mostrarInfo')) return;
        this.mostrarPantalla('info-screen');
    },
    
    mostrarTrabajadores: function() {
        if (!this.verificarAccesoAdmin('mostrarTrabajadores')) return;
        this.renderTrabajadores();
        this.mostrarPantalla('trabajadores-screen');
    },
    
    mostrarPerfil: function() {
        if (!this.verificarAccesoAdmin('mostrarPerfil')) return;
        this.actualizarPerfil();
        this.mostrarPantalla('perfil-screen');
    },
    
    mostrarHistorial: function() {
        this.renderHistorial();
        this.llenarFiltroTrabajadoresHistorial();
        this.mostrarPantalla('history-screen');
    },
    
    irASeleccionarExamen: function() {
        if (!this.userData.empresa || !this.userData.nombre) {
            alert('Completa tus datos primero');
            this.mostrarDatosUsuario();
            return;
        }
        if (this.licencia.tipo === 'DEMO' && this.licencia.examenesRestantes <= 0) {
            alert('Límite DEMO alcanzado');
            return;
        }
        
        const container = document.getElementById('categorias-list');
        if (!container) return;
        
        container.innerHTML = '';
        CATEGORIAS.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'exam-item';
            div.innerHTML = `<h4>${cat.icono} ${cat.nombre}</h4><p>${cat.norma}</p><small>${cat.descripcion}</small>`;
            div.onclick = () => this.mostrarNiveles(cat);
            container.appendChild(div);
        });
        
        document.getElementById('categorias-view').style.display = 'block';
        document.getElementById('niveles-view').style.display = 'none';
        this.mostrarPantalla('select-exam-screen');
    },
    
    mostrarNiveles: function(categoria) {
        document.getElementById('categorias-view').style.display = 'none';
        document.getElementById('niveles-view').style.display = 'block';
        document.getElementById('categoria-titulo').textContent = `${categoria.icono} ${categoria.nombre}`;
        document.getElementById('categoria-norma').textContent = categoria.norma;
        
        const container = document.getElementById('niveles-list');
        container.innerHTML = '';
        categoria.niveles.forEach(nivel => {
            const div = document.createElement('div');
            div.className = 'nivel-item';
            div.innerHTML = `<div><h4>👤 ${nivel.nombre}</h4><p>${nivel.preguntas} preguntas</p></div>`;
            div.onclick = () => this.iniciarExamen(nivel.examId);
            container.appendChild(div);
        });
    },
    
    volverACategorias: function() {
        document.getElementById('categorias-view').style.display = 'block';
        document.getElementById('niveles-view').style.display = 'none';
    },
    
    mostrarDatosUsuario: function() {
        document.getElementById('user-empresa').value = this.userData.empresa || '';
        document.getElementById('user-nombre').value = this.userData.nombre || '';
        document.getElementById('user-curp').value = this.userData.curp || '';
        document.getElementById('user-puesto').value = this.userData.puesto || '';
        this.mostrarPantalla('user-data-screen');
    },
    
    guardarDatosUsuarioForm: function() {
        const empresa = document.getElementById('user-empresa').value.trim();
        const nombre = document.getElementById('user-nombre').value.trim();
        const curp = document.getElementById('user-curp').value.trim().toUpperCase();
        const puesto = document.getElementById('user-puesto').value.trim();
        if (!empresa || !nombre || !curp || !puesto) { alert('Completa todos los campos'); return; }
        this.userData = { empresa, nombre, curp, puesto };
        localStorage.setItem('rayoshield_usuario', JSON.stringify(this.userData));
        alert('Datos guardados');
        this.volverHome();
    },
    
    // ─────────────────────────────────────────────────────────────────
    // EXÁMENES
    // ─────────────────────────────────────────────────────────────────
    iniciarExamen: function(examId) {
        cargarExamen(examId).then(exam => {
            this.examenActual = exam;
            this.respuestasUsuario = [];
            this.preguntaActual = 0;
            this.resultadoActual = null;
            this.respuestaTemporal = null;
            document.getElementById('exam-title').textContent = exam.titulo;
            document.getElementById('exam-norma').textContent = exam.norma;
            this.iniciarTimerExamen();
            this.mostrarPantalla('exam-screen');
            this.mostrarPregunta();
            this.guardarExamenProgreso();
        }).catch(() => alert('Error cargando examen'));
    },
    
    mostrarPregunta: function() {
        if (!this.examenActual) return;
        const p = this.examenActual.preguntas[this.preguntaActual];
        const total = this.examenActual.preguntas.length;
        const progreso = ((this.preguntaActual + 1) / total) * 100;
        
        const bar = document.getElementById('progress-bar');
        if (bar) bar.innerHTML = `<div class="progress-bar-fill" style="width:${progreso}%"></div>`;
        document.getElementById('progress-text').textContent = `Pregunta ${this.preguntaActual + 1} de ${total}`;
        document.getElementById('question-text').textContent = p.texto;
        
        const container = document.getElementById('options-container');
        container.innerHTML = '';
        p.opciones.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `option-btn${this.respuestaTemporal === idx ? ' selected' : ''}`;
            btn.innerHTML = `<strong>${String.fromCharCode(65 + idx)})</strong> ${opt}`;
            btn.onclick = () => this.seleccionarRespuesta(idx);
            container.appendChild(btn);
        });
        
        if (this.respuestaTemporal !== null) {
            const btnCont = document.createElement('button');
            btnCont.className = 'btn-continuar';
            btnCont.textContent = '➜ Continuar';
            btnCont.onclick = () => this.confirmarRespuesta();
            container.appendChild(btnCont);
        }
    },
    
    seleccionarRespuesta: function(idx) { this.respuestaTemporal = idx; this.mostrarPregunta(); },
    
    confirmarRespuesta: function() {
        if (this.respuestaTemporal === null) return;
        if (this.preguntaActual === this.examenActual.preguntas.length - 1 && !confirm('¿Finalizar examen?')) return;
        
        this.respuestasUsuario.push(this.respuestaTemporal);
        this.respuestaTemporal = null;
        this.preguntaActual++;
        this.guardarExamenProgreso();
        
        if (this.preguntaActual < this.examenActual.preguntas.length) {
            this.mostrarPregunta();
        } else {
            this.detenerTimer();
            this.mostrarResultado();
            this.eliminarExamenGuardado();
        }
    },
    
    iniciarTimerExamen: function() {
        this.tiempoInicio = Date.now();
        this.timerExamen = setInterval(() => {
            const restante = this.tiempoLimite - (Date.now() - this.tiempoInicio);
            if (restante <= 0) {
                clearInterval(this.timerExamen);
                this.mostrarResultado();
                this.eliminarExamenGuardado();
            } else {
                const min = Math.floor(restante / 60000);
                const seg = Math.floor((restante % 60000) / 1000);
                const el = document.getElementById('exam-timer');
                if (el) el.textContent = `${min}:${seg < 10 ? '0' : ''}${seg}`;
            }
        }, 1000);
    },
    
    detenerTimer: function() { if (this.timerExamen) { clearInterval(this.timerExamen); this.timerExamen = null; } },
    
    guardarExamenProgreso: function() {
        if (this.examenActual) {
            this.examenGuardado = { examenId: this.examenActual.id, respuestas: [...this.respuestasUsuario], preguntaActual: this.preguntaActual, fecha: new Date().toISOString() };
            localStorage.setItem('rayoshield_progreso', JSON.stringify(this.examenGuardado));
        }
    },
    
    cargarExamenGuardado: function() { try { const s = localStorage.getItem('rayoshield_progreso'); if (s) this.examenGuardado = JSON.parse(s); } catch(e) {} },
    
    eliminarExamenGuardado: function() { this.examenGuardado = null; localStorage.removeItem('rayoshield_progreso'); },
    
    mostrarResultado: function() {
        if (!this.examenActual) return;
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        document.getElementById('score-number').textContent = `${this.resultadoActual.score}%`;
        document.getElementById('aciertos').textContent = this.resultadoActual.aciertos;
        document.getElementById('total').textContent = this.resultadoActual.total;
        document.getElementById('result-status').textContent = this.resultadoActual.estado;
        const btnCert = document.getElementById('btn-certificado');
        if (btnCert) btnCert.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
        this.mostrarPantalla('result-screen');
        this.guardarEnHistorial();
        if (this.licencia.tipo === 'DEMO') this.licencia.examenesRestantes--;
        this.guardarLicencia();
    },
    
    descargarCertificado: function() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') { alert('Solo para aprobados'); return; }
        const t = MultiUsuario.getTrabajadorActual();
        const usuario = t || this.userData;
        generarCertificado(usuario, this.examenActual, this.resultadoActual).then(url => {
            const a = document.createElement('a');
            a.download = `RayoShield_${usuario.nombre.replace(/\s/g, '_')}_${Date.now()}.png`;
            a.href = url;
            a.click();
        }).catch(err => alert('Error generando certificado'));
    },
    
    // ─────────────────────────────────────────────────────────────────
    // CASOS MASTER
    // ─────────────────────────────────────────────────────────────────
    irACasosMaster: function() {
        const container = document.getElementById('casos-list');
        if (!container) return;
        container.innerHTML = '';
        
        const acceso = this.licencia.features;
        CASOS_INVESTIGACION.forEach(caso => {
            let ok = false;
            if (caso.nivel === 'basico' && acceso.casosBasicos) ok = true;
            else if (caso.nivel === 'master' && acceso.casosMaster) ok = true;
            else if (caso.nivel === 'elite' && acceso.casosElite) ok = true;
            else if (caso.nivel === 'pericial' && acceso.casosPericial) ok = true;
            if (!ok && this.licencia.tipo !== 'DEMO') return;
            if (this.licencia.tipo === 'DEMO' && container.children.length >= 1) return;
            
            const div = document.createElement('div');
            div.className = 'caso-item';
            div.innerHTML = `<h4>${caso.icono} ${caso.titulo}</h4><p><span class="badge-nivel ${caso.nivel}">${caso.nivel.toUpperCase()}</span> • ${caso.tiempo_estimado}</p><p>${caso.descripcion}</p>`;
            div.onclick = () => this.cargarCasoMaster(caso.id);
            container.appendChild(div);
        });
        if (container.children.length === 0) container.innerHTML = '<p>No hay casos disponibles para tu plan.</p>';
        this.mostrarPantalla('casos-master-screen');
    },
    
    cargarCasoMaster: async function(id) {
        const caso = await cargarCasoInvestigacion(id);
        if (!caso) { alert('Error cargando caso'); return; }
        this.casoActual = caso;
        this.respuestasCaso = {};
        
        document.getElementById('casos-list').style.display = 'none';
        document.getElementById('caso-detalle').style.display = 'block';
        document.getElementById('caso-id').textContent = caso.id;
        document.getElementById('caso-fecha').textContent = caso.fecha_evento;
        document.getElementById('caso-industria').textContent = caso.industria;
        
        // Render dinámico simplificado
        const preguntasDiv = document.getElementById('caso-preguntas');
        preguntasDiv.innerHTML = '';
        caso.preguntas.forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = 'pregunta-master';
            div.innerHTML = `<h4>🔍 Pregunta ${idx+1}</h4><p>${p.pregunta}</p>`;
            if (p.tipo === 'analisis_multiple') {
                p.opciones.forEach((opt, oidx) => {
                    const label = document.createElement('label');
                    label.className = 'opcion-sistemica';
                    label.innerHTML = `<input type="checkbox" name="q${p.id}" value="${oidx}"><span>${opt.texto || opt}</span>`;
                    div.appendChild(label);
                });
            } else if (p.tipo === 'respuesta_abierta_guiada') {
                const ta = document.createElement('textarea');
                ta.className = 'respuesta-abierta';
                ta.placeholder = 'Escribe tu análisis aquí...';
                div.appendChild(ta);
            }
            preguntasDiv.appendChild(div);
        });
        document.getElementById('btn-enviar-caso').style.display = 'inline-block';
        this.iniciarTimerCaso();
    },
    
    iniciarTimerCaso: function() {
        this.tiempoCasoInicio = Date.now();
        this.timerCaso = setInterval(() => {
            const restante = this.tiempoCasoLimite - (Date.now() - this.tiempoCasoInicio);
            if (restante <= 0) {
                clearInterval(this.timerCaso);
                this.enviarRespuestasCaso();
            } else {
                const min = Math.floor(restante / 60000);
                const seg = Math.floor((restante % 60000) / 1000);
                const el = document.getElementById('caso-timer');
                if (el) el.textContent = `⏱️ ${min}:${seg < 10 ? '0' : ''}${seg}`;
            }
        }, 1000);
    },
    
    enviarRespuestasCaso: function() {
        if (!this.casoActual) return;
        // Simulación de evaluación
        this.resultadoCaso = { aprobado: true, porcentaje: 85, puntajeTotal: 85, puntajeMaximo: 100, feedback: [], leccion: 'Correcto', conclusion: 'Aprobado' };
        this.mostrarResultadoCaso(this.resultadoCaso);
    },
    
    mostrarResultadoCaso: function(res) {
        const div = document.getElementById('caso-resultado');
        div.style.display = 'block';
        div.innerHTML = `<h2>${res.aprobado ? '✅ APROBADO' : '❌ REPROBADO'}</h2><div class="puntaje-master">${res.porcentaje}%</div><p>Puntaje: ${res.puntajeTotal}/${res.puntajeMaximo}</p>`;
        document.getElementById('btn-enviar-caso').style.display = 'none';
        this.detenerTimerCaso();
    },
    
    detenerTimerCaso: function() { if (this.timerCaso) { clearInterval(this.timerCaso); this.timerCaso = null; } },
    
    volverAListaCasos: function() {
        document.getElementById('casos-list').style.display = 'block';
        document.getElementById('caso-detalle').style.display = 'none';
        document.getElementById('caso-resultado').style.display = 'none';
        this.casoActual = null;
    },
    
    // ─────────────────────────────────────────────────────────────────
    // HISTORIAL Y REPORTES
    // ─────────────────────────────────────────────────────────────────
    guardarEnHistorial: function() {
        const hist = this.obtenerHistorial();
        const t = MultiUsuario.getTrabajadorActual();
        hist.push({
            examen: this.examenActual?.titulo || 'Desconocido',
            score: this.resultadoActual?.score || 0,
            estado: this.resultadoActual?.estado || '',
            fecha: new Date().toISOString(),
            usuario: t ? t.nombre : this.userData.nombre,
            tipoUsuario: t ? 'trabajador' : 'admin',
            trabajadorId: t?.id || null
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
        
        // Sincronizar con Firebase si es posible
        if (this.firebaseListo && this.currentUser && t) {
            this.db.collection('resultados').add({
                trabajadorId: t.id,
                examen: this.examenActual?.titulo,
                puntaje: this.resultadoActual?.score,
                aprobado: this.resultadoActual?.estado === 'Aprobado',
                fecha: new Date().toISOString()
            }).catch(e => console.warn('Error sync:', e));
        }
    },
    
    obtenerHistorial: function() { try { return JSON.parse(localStorage.getItem('rayoshield_historial') || '[]'); } catch(e) { return []; } },
    
    renderHistorial: function() {
        const container = document.getElementById('history-list');
        if (!container) return;
        let historial = this.obtenerHistorial();
        const filtro = document.getElementById('historial-filtro-trabajador')?.value;
        if (filtro && filtro !== 'todos') {
            if (filtro === 'admin') historial = historial.filter(h => h.tipoUsuario === 'admin');
            else historial = historial.filter(h => h.trabajadorId === filtro);
        }
        if (historial.length === 0) { container.innerHTML = '<p>Sin registros</p>'; return; }
        container.innerHTML = `<table>${historial.slice(-20).reverse().map(h => `<tr><td>${new Date(h.fecha).toLocaleDateString()}</td><td>${h.usuario}</td><td>${h.examen}</td><td>${h.score}%</td><td>${h.estado}</td></tr>`).join('')}</table>`;
    },
    
    llenarFiltroTrabajadoresHistorial: function() {
        const select = document.getElementById('historial-filtro-trabajador');
        if (!select) return;
        const actual = select.value;
        select.innerHTML = '<option value="todos">Todos</option><option value="admin">Admin</option>';
        if (typeof MultiUsuario !== 'undefined') {
            MultiUsuario.getTrabajadores().forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.nombre;
                select.appendChild(opt);
            });
        }
        select.value = actual;
    },
    
    exportarHistorialPDF: function() {
        const hist = this.obtenerHistorial();
        if (hist.length === 0) { alert('No hay datos'); return; }
        let html = '<html><head><title>Historial RayoShield</title></head><body><h1>Historial de Exámenes</h1><table border="1">';
        html += '<tr><th>Fecha</th><th>Usuario</th><th>Examen</th><th>Puntaje</th><th>Estado</th></tr>';
        hist.forEach(h => {
            html += `<tr><td>${new Date(h.fecha).toLocaleDateString()}</td><td>${h.usuario}</td><td>${h.examen}</td><td>${h.score}%</td><td>${h.estado}</td></tr>`;
        });
        html += '</table></body></html>';
        const win = window.open();
        win.document.write(html);
        win.print();
    },
    
    // ─────────────────────────────────────────────────────────────────
    // LICENCIAS
    // ─────────────────────────────────────────────────────────────────
    cargarLicencia: function() { try { const s = localStorage.getItem('rayoshield_licencia'); if (s) this.licencia = JSON.parse(s); } catch(e) {} },
    guardarLicencia: function() { localStorage.setItem('rayoshield_licencia', JSON.stringify(this.licencia)); this.actualizarUI(); },
    verificarExpiracionLicencia: function() {
        if (this.licencia.expiracion && new Date() > new Date(this.licencia.expiracion)) {
            this.licencia = { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3, features: {} };
            this.guardarLicencia();
            alert('Licencia expirada. Modo DEMO.');
        }
    },
    activarLicencia: function() {
        const id = document.getElementById('license-id')?.value.trim().toUpperCase();
        const clave = document.getElementById('license-key')?.value.trim().toUpperCase();
        if (!id || !clave) { alert('Ingresa ID y clave'); return; }
        const valida = { 'RS-PKDF-9826-A1B2': 'PROFESIONAL', 'RS-COZS-2XT6-C3D4': 'CONSULTOR', 'RS-EVP4-Y02I-E5F6': 'EMPRESARIAL' };
        if (valida[clave]) {
            this.licencia = { tipo: valida[clave], clave, clienteId: id, expiracion: null, examenesRestantes: 9999, features: {} };
            this.guardarLicencia();
            alert(`✅ Licencia ${valida[clave]} activada`);
            location.reload();
        } else alert('Clave inválida');
    },
    activarLicenciaConPlan: function(plan) {
        const datos = { PROFESIONAL: { id: 'PROFESIONAL_001', clave: 'RS-PKDF-9826-A1B2' }, CONSULTOR: { id: 'CONSULTOR_001', clave: 'RS-COZS-2XT6-C3D4' }, EMPRESARIAL: { id: 'EMPRESARIAL_001', clave: 'RS-EVP4-Y02I-E5F6' } };
        if (datos[plan]) {
            document.getElementById('license-id').value = datos[plan].id;
            document.getElementById('license-key').value = datos[plan].clave;
            document.getElementById('activar-licencia-section').scrollIntoView();
        }
    },
    
    // ─────────────────────────────────────────────────────────────────
    // UI Y RENDERIZADO
    // ─────────────────────────────────────────────────────────────────
    actualizarUI: function() {
        const infoLic = document.getElementById('licencia-info');
        if (infoLic) infoLic.textContent = this.licencia.tipo === 'DEMO' ? `📋 DEMO: ${this.licencia.examenesRestantes}/3 hoy` : `✅ ${this.licencia.tipo}`;
        const userInfo = document.getElementById('usuario-info');
        if (userInfo && this.userData.nombre) userInfo.innerHTML = `<strong>👤 ${this.userData.nombre}</strong><br>${this.userData.empresa || ''}`;
        document.getElementById('sidebar-license-plan').textContent = this.licencia.tipo;
        this.actualizarLicenciaUI();
        this.actualizarBadgeTrabajadores();
        this.actualizarUIMenuPorRol();
    },
    
    actualizarUIMenuPorRol: function() {
        const esAdmin = this.esAdmin();
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = esAdmin ? 'flex' : 'none');
        const volverBtn = document.getElementById('btn-volver-admin');
        if (volverBtn) volverBtn.style.display = (!esAdmin && MultiUsuario.getTrabajadorActual()) ? 'block' : 'none';
        const topbarSub = document.getElementById('topbar-sub');
        const t = MultiUsuario.getTrabajadorActual();
        if (topbarSub) topbarSub.textContent = t ? `👷 ${t.nombre}` : 'Plataforma de certificación';
    },
    
    actualizarLicenciaUI: function() {
        const planEl = document.getElementById('licencia-screen-plan');
        if (planEl) planEl.textContent = this.licencia.tipo;
        const features = this.licencia.features;
        const container = document.getElementById('licencia-features');
        if (container) container.innerHTML = features.casosBasicos ? '<div>✓ Casos Básicos</div>' : '<div>✗ Sin casos extra</div>';
    },
    
    actualizarPerfil: function() {
        document.getElementById('perfil-nombre').textContent = this.userData.nombre || 'Usuario';
        document.getElementById('perfil-nombre-input').value = this.userData.nombre || '';
        document.getElementById('perfil-empresa-input').value = this.userData.empresa || '';
        const hist = this.obtenerHistorial();
        document.getElementById('perf-promedio').textContent = hist.length ? Math.round(hist.reduce((a,b)=>a+b.score,0)/hist.length)+'%' : '0%';
        document.getElementById('perf-examenes').textContent = hist.length;
    },
    
    editarPerfil: function() { this.mostrarDatosUsuario(); },
    
    actualizarBadgeTrabajadores: function() {
        const badge = document.getElementById('nav-badge-trabajadores');
        if (badge && typeof MultiUsuario !== 'undefined') badge.textContent = MultiUsuario.getTrabajadores().length;
    },
    
    // ─────────────────────────────────────────────────────────────────
    // MULTIUSUARIO (Compatibilidad)
    // ─────────────────────────────────────────────────────────────────
    renderTrabajadores: function() {
        if (typeof MultiUsuario === 'undefined') return;
        const tbody = document.getElementById('trabajadores-tabla');
        if (!tbody) return;
        const trabajadores = MultiUsuario.getTrabajadores();
        if (trabajadores.length === 0) { tbody.innerHTML = '<tr><td colspan="6">Sin trabajadores</td></tr>'; return; }
        tbody.innerHTML = trabajadores.map(t => `
            <tr>
                <td>${t.nombre}<br><small>${t.curp}</small></td>
                <td>${t.puesto || '-'}</td>
                <td>${MultiUsuario.getProgresoByTrabajador(t.id).total_examenes}</td>
                <td>${MultiUsuario.getProgresoByTrabajador(t.id).promedio}%</td>
                <td><span class="status-ok">${t.estado}</span></td>
                <td>
                    <button class="tbl-btn view" onclick="app.verProgresoTrabajador('${t.id}')">📊</button>
                    <button class="tbl-btn" onclick="app.editarTrabajador('${t.id}')">✏️</button>
                    <button class="tbl-btn" onclick="app.eliminarTrabajador('${t.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    },
    
    mostrarModalTrabajador: function() {
        document.getElementById('modal-trabajador-titulo').textContent = '👤 Nuevo Trabajador';
        ['id','nombre','curp','puesto','area','email','telefono','notas'].forEach(id => {
            const el = document.getElementById(`trabajador-${id}`);
            if (el) el.value = '';
        });
        document.getElementById('modal-trabajador').classList.add('active');
    },
    
    cerrarModalTrabajador: function() { document.getElementById('modal-trabajador').classList.remove('active'); },
    
    guardarTrabajador: function() {
        if (typeof MultiUsuario === 'undefined') { alert('Error'); return; }
        const nombre = document.getElementById('trabajador-nombre').value.trim();
        const curp = document.getElementById('trabajador-curp').value.trim().toUpperCase();
        const puesto = document.getElementById('trabajador-puesto').value.trim();
        if (!nombre || !curp || !puesto) { alert('Faltan datos'); return; }
        const data = { nombre, curp, puesto, area: document.getElementById('trabajador-area').value, email: document.getElementById('trabajador-email').value };
        const id = document.getElementById('trabajador-id').value;
        if (id) MultiUsuario.updateTrabajador(id, data);
        else MultiUsuario.addTrabajador(data);
        this.cerrarModalTrabajador();
        this.renderTrabajadores();
        this.actualizarBadgeTrabajadores();
    },
    
    editarTrabajador: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        if (!t) return;
        document.getElementById('modal-trabajador-titulo').textContent = '✏️ Editar Trabajador';
        document.getElementById('trabajador-id').value = t.id;
        document.getElementById('trabajador-nombre').value = t.nombre;
        document.getElementById('trabajador-curp').value = t.curp;
        document.getElementById('trabajador-puesto').value = t.puesto || '';
        document.getElementById('trabajador-area').value = t.area || '';
        document.getElementById('trabajador-email').value = t.email || '';
        document.getElementById('modal-trabajador').classList.add('active');
    },
    
    eliminarTrabajador: function(id) {
        if (confirm('¿Eliminar trabajador?')) {
            MultiUsuario.deleteTrabajador(id);
            this.renderTrabajadores();
            this.actualizarBadgeTrabajadores();
        }
    },
    
    verProgresoTrabajador: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        const prog = MultiUsuario.getProgresoByTrabajador(id);
        alert(`📊 ${t.nombre}\nExámenes: ${prog.total_examenes}\nPromedio: ${prog.promedio}%`);
    },
    
    mostrarSeleccionarTrabajador: function() {
        const lista = document.getElementById('kiosco-lista');
        if (!lista) return;
        lista.innerHTML = MultiUsuario.getTrabajadores().filter(t=>t.estado==='activo').map(t => `<div onclick="app.seleccionarTrabajadorKiosco('${t.id}')" style="padding:10px;border:1px solid var(--border);margin:5px;cursor:pointer">${t.nombre}<br><small>${t.puesto}</small></div>`).join('');
        document.getElementById('modal-seleccionar-trabajador').classList.add('active');
    },
    
    cerrarModalSeleccionarTrabajador: function() { document.getElementById('modal-seleccionar-trabajador').classList.remove('active'); },
    
    seleccionarTrabajadorKiosco: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        if (!t) return;
        if (confirm(`Seleccionar a ${t.nombre}?`)) {
            MultiUsuario.setTrabajadorActual(id);
            this.modoActual = 'trabajador';
            this.cerrarModalSeleccionarTrabajador();
            this.actualizarUIMenuPorRol();
            alert(`Modo trabajador: ${t.nombre}`);
        }
    },
    
    volverAModoAdmin: function() {
        if (this.verificarPasswordAdmin()) {
            MultiUsuario.clearTrabajadorActual();
            this.modoActual = 'admin';
            this.actualizarUIMenuPorRol();
            alert('Modo administrador');
        }
    },
    
    // ─────────────────────────────────────────────────────────────────
    // EXTRAS: TEMA, PWA, CIERRE
    // ─────────────────────────────────────────────────────────────────
    toggleTema: function() {
        document.body.classList.toggle('tema-claro');
        localStorage.setItem('rayoshield_tema', document.body.classList.contains('tema-claro') ? 'claro' : 'oscuro');
    },
    
    initPWAInstall: function() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            document.getElementById('btn-instalar-pwa').style.display = 'flex';
        });
    },
    
    instalarPWA: function() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then(() => this.deferredPrompt = null);
        }
    },
    
    cerrarSesion: function() {
        if (confirm('Cerrar sesión? Se borrarán datos locales.')) {
            if (this.firebaseListo && this.auth) this.auth.signOut();
            localStorage.clear();
            location.reload();
        }
    },
    
    exportarDatos: function() { alert('Función disponible en plan PRO'); },
    importarDatos: function() { alert('Función disponible en plan PRO'); },
    limpiarDatosConfirmar: function() { if(confirm('Borrar todo?')) localStorage.clear(); location.reload(); },
    cambiarPasswordAdmin: function() { alert('Usa Firebase Auth para gestión de usuarios'); }
};

// ═══════════════════════════════════════════════════════════════
// MULTIUSUARIO (Backup Local)
// ═══════════════════════════════════════════════════════════════
const MultiUsuario = {
    init: function() {
        if (!localStorage.getItem('rayoshield_trabajadores')) localStorage.setItem('rayoshield_trabajadores', '[]');
        if (!localStorage.getItem('rayoshield_resultados')) localStorage.setItem('rayoshield_resultados', '[]');
        if (!localStorage.getItem('rayoshield_trabajador_actual')) localStorage.setItem('rayoshield_trabajador_actual', 'null');
    },
    getTrabajadores: function() { return JSON.parse(localStorage.getItem('rayoshield_trabajadores') || '[]'); },
    addTrabajador: function(t) { const arr = this.getTrabajadores(); t.id = 'TRAB-'+Date.now().toString(36).toUpperCase(); t.fecha_registro = new Date().toISOString(); t.estado = 'activo'; arr.push(t); localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr)); return t; },
    updateTrabajador: function(id, data) { let arr = this.getTrabajadores(); arr = arr.map(t => t.id === id ? { ...t, ...data } : t); localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr)); },
    deleteTrabajador: function(id) { let arr = this.getTrabajadores(); arr = arr.filter(t => t.id !== id); localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr)); },
    getTrabajadorById: function(id) { return this.getTrabajadores().find(t => t.id === id); },
    setTrabajadorActual: function(id) { localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(id)); },
    getTrabajadorActual: function() { const id = JSON.parse(localStorage.getItem('rayoshield_trabajador_actual')); return id ? this.getTrabajadorById(id) : null; },
    clearTrabajadorActual: function() { localStorage.setItem('rayoshield_trabajador_actual', 'null'); },
    getResultados: function() { return JSON.parse(localStorage.getItem('rayoshield_resultados') || '[]'); },
    addResultado: function(r) { const arr = this.getResultados(); r.id = 'RES-'+Date.now().toString(36).toUpperCase(); r.fecha = new Date().toISOString(); arr.push(r); localStorage.setItem('rayoshield_resultados', JSON.stringify(arr)); },
    getResultadosByTrabajador: function(id) { return this.getResultados().filter(r => r.trabajador_id === id); },
    getProgresoByTrabajador: function(id) {
        const res = this.getResultadosByTrabajador(id);
        const examenes = res.filter(r => r.tipo === 'examen');
        return { total_examenes: examenes.length, promedio: examenes.length ? Math.round(examenes.reduce((a,b)=>a+b.puntaje,0)/examenes.length) : 0, total_casos: res.filter(r=>r.tipo==='caso').length };
    },
    getEstadisticas: function() {
        const trabajadores = this.getTrabajadores();
        const resultados = this.getResultados();
        return { trabajadores_totales: trabajadores.length, trabajadores_activos: trabajadores.filter(t=>t.estado==='activo').length, examenes_totales: resultados.filter(r=>r.tipo==='examen').length, casos_totales: resultados.filter(r=>r.tipo==='caso').length, tasa_aprobacion: resultados.length ? Math.round(resultados.filter(r=>r.aprobado).length/resultados.length*100) : 0 };
    }
};

// Inicialización global
document.addEventListener('DOMContentLoaded', () => app.init());
