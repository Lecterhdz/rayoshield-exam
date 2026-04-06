// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - app.js (VERSIÓN COMPLETA v5.0)
// Guardar con codificación UTF-8
// ─────────────────────────────────────────────────────────────────────

const app = {
    // Estado General
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    respuestaTemporal: null,
    modoActual: 'admin',
    trabajadorActual: null,
    userData: { empresa: '', nombre: '', curp: '', puesto: '' },
    licencia: { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3, features: {} },

    // Firebase
    db: null,
    auth: null,
    currentUser: null,
    isAdmin: false,
    firebaseListo: false,
    sincronizacionActiva: false,

    // Timers y Estado
    timerExamen: null,
    tiempoLimite: 30 * 60 * 1000,
    tiempoInicio: null,
    tiempoRestante: null,
    timerCaso: null,
    tiempoCasoLimite: 40 * 60 * 1000,
    tiempoCasoInicio: null,
    tiempoCasoRestante: null,
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
        
        // Contraseña admin local
        if (!localStorage.getItem('rayoshield_admin_password')) {
            localStorage.setItem('rayoshield_admin_password', 'admin123');
        }
        
        this.modoActual = 'admin';
        this.cargarLicencia();
        this.cargarDatosUsuario();
        this.cargarHistorial();
        this.cargarExamenGuardado();
        
        // Inicializar MultiUsuario
        if (typeof MultiUsuario !== 'undefined') {
            MultiUsuario.init();
        }
        
        // Inicializar Firebase si está disponible
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            this.db = db;
            this.auth = auth;
            this.firebaseListo = true;
            console.log('✅ Firebase conectado');
            
            // Escuchar cambios de autenticación (sin llamar init otra vez)
            if (!this._authListenerSet) {
                this._authListenerSet = true;
                this.auth.onAuthStateChanged(async (user) => {
                    this.currentUser = user;
                    if (user) {
                        try {
                            const adminDoc = await this.db.collection('admins').doc(user.uid).get();
                            this.isAdmin = adminDoc.exists;
                        } catch(e) { this.isAdmin = false; }
                    } else {
                        this.isAdmin = false;
                    }
                    this.actualizarUI();
                    this.actualizarUIMenuPorRol();
                });
            }
        }
        
        this.initPWAInstall();
        this.actualizarUI();
        this.mostrarPantalla('home-screen');
        this.verificarExpiracionLicencia();
        this.actualizarBadgeTrabajadores();
        this.actualizarUIMenuPorRol();
    },

    // ─────────────────────────────────────────────────────────────────
    // DATOS DE USUARIO
    // ─────────────────────────────────────────────────────────────────
    cargarDatosUsuario: function() {
        try {
            const s = localStorage.getItem('rayoshield_usuario');
            if (s) this.userData = JSON.parse(s);
        } catch(e) {}
    },
    
    guardarDatosUsuario: function() {
        localStorage.setItem('rayoshield_usuario', JSON.stringify(this.userData));
        this.actualizarUI();
    },
    
    guardarDatosUsuarioForm: function() {
        const empresa = document.getElementById('user-empresa')?.value.trim();
        const nombre = document.getElementById('user-nombre')?.value.trim();
        const curp = document.getElementById('user-curp')?.value.trim().toUpperCase();
        const puesto = document.getElementById('user-puesto')?.value.trim();
        if (!empresa || !nombre || !curp || !puesto) {
            alert('Completa todos los campos');
            return;
        }
        this.userData = { empresa, nombre, curp, puesto };
        this.guardarDatosUsuario();
        alert('Datos guardados');
        this.volverHome();
    },
    
    cargarHistorial: function() {
        console.log('Historial cargado:', this.obtenerHistorial().length);
    },
    
    cargarExamenGuardado: function() {
        try {
            const s = localStorage.getItem('rayoshield_progreso');
            if (s) this.examenGuardado = JSON.parse(s);
        } catch(e) {}
    },

    // ─────────────────────────────────────────────────────────────────
    // NAVEGACIÓN
    // ─────────────────────────────────────────────────────────────────
    mostrarPantalla: function(id) {
        const pantallasRestringidas = ['license-screen', 'trabajadores-screen', 'info-screen'];
        if (this.esTrabajador() && pantallasRestringidas.includes(id)) {
            alert('Acceso denegado');
            return;
        }
        if (this.timerExamen && id !== 'exam-screen') {
            clearInterval(this.timerExamen);
            this.timerExamen = null;
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
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
        if (this.esTrabajador()) {
            alert('Solo administradores');
            return;
        }
        this.actualizarPerfil();
        this.mostrarPantalla('perfil-screen');
    },
    
    mostrarHistorial: function() {
        this.renderHistorial();
        this.llenarFiltroTrabajadoresHistorial();
        this.mostrarPantalla('history-screen');
    },
    
    mostrarDatosUsuario: function() {
        const e = document.getElementById('user-empresa');
        const n = document.getElementById('user-nombre');
        const c = document.getElementById('user-curp');
        const p = document.getElementById('user-puesto');
        if (e) e.value = this.userData.empresa || '';
        if (n) n.value = this.userData.nombre || '';
        if (c) c.value = this.userData.curp || '';
        if (p) p.value = this.userData.puesto || '';
        this.mostrarPantalla('user-data-screen');
    },
    
    editarPerfil: function() {
        this.mostrarDatosUsuario();
    },
    
    actualizarPerfil: function() {
        document.getElementById('perfil-nombre').textContent = this.userData.nombre || 'Usuario';
        document.getElementById('perfil-nombre-input').value = this.userData.nombre || '';
        document.getElementById('perfil-empresa-input').value = this.userData.empresa || '';
        document.getElementById('perfil-puesto-input').value = this.userData.puesto || '';
        document.getElementById('perfil-curp-input').value = this.userData.curp || '';
        document.getElementById('perfil-plan').textContent = this.licencia.tipo;
        
        const hist = this.obtenerHistorial();
        const aprobados = hist.filter(h => h.estado === 'Aprobado').length;
        const promedio = hist.length > 0 ? Math.round(hist.reduce((a,b) => a + b.score, 0) / hist.length) : 0;
        
        document.getElementById('perf-promedio').textContent = promedio + '%';
        document.getElementById('perf-examenes').textContent = hist.length;
        document.getElementById('perf-aprobados').textContent = aprobados;
        document.getElementById('perfil-examenes').textContent = hist.length + ' Exámenes';
        
        const logroExamen = document.getElementById('logro-examen');
        if (logroExamen && hist.length >= 1) logroExamen.textContent = '✅';
        
        const actividadEl = document.getElementById('perfil-actividad');
        if (actividadEl && hist.length > 0) {
            actividadEl.innerHTML = hist.slice(-5).reverse().map(h => {
                const color = h.estado === 'Aprobado' ? 'g' : 'r';
                return `<div class="act-item"><div class="act-dot ${color}"></div><div class="act-text"><strong>${h.examen}</strong> — ${h.score}% (${h.estado})</div><div class="act-time">${new Date(h.fecha).toLocaleDateString('es-MX')}</div></div>`;
            }).join('');
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // EXÁMENES
    // ─────────────────────────────────────────────────────────────────
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
        const self = this;
        
        CATEGORIAS.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'exam-item';
            div.innerHTML = `<h4>${cat.icono} ${cat.nombre}</h4><p>${cat.norma}</p><small>${cat.descripcion}</small>`;
            div.onclick = () => self.mostrarNiveles(cat);
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
        const self = this;
        
        categoria.niveles.forEach(nivel => {
            const div = document.createElement('div');
            div.className = 'nivel-item';
            div.innerHTML = `<div><h4>👤 ${nivel.nombre}</h4><p>${nivel.preguntas} preguntas</p></div>`;
            div.onclick = () => self.iniciarExamen(nivel.examId);
            container.appendChild(div);
        });
    },
    
    volverACategorias: function() {
        document.getElementById('categorias-view').style.display = 'block';
        document.getElementById('niveles-view').style.display = 'none';
    },
    
    iniciarExamen: function(examId) {
        const self = this;
        cargarExamen(examId).then(exam => {
            self.examenActual = exam;
            self.respuestasUsuario = [];
            self.preguntaActual = 0;
            self.resultadoActual = null;
            self.respuestaTemporal = null;
            document.getElementById('exam-title').textContent = exam.titulo;
            document.getElementById('exam-norma').textContent = exam.norma;
            self.detenerTimer();
            self.iniciarTimerExamen();
            self.mostrarPantalla('exam-screen');
            self.mostrarPregunta();
            self.guardarExamenProgreso();
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
        const self = this;
        
        p.opciones.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `option-btn${self.respuestaTemporal === idx ? ' selected' : ''}`;
            btn.innerHTML = `<strong style="margin-right:10px;">${String.fromCharCode(65 + idx)})</strong> ${opt}`;
            btn.onclick = () => self.seleccionarRespuesta(idx);
            container.appendChild(btn);
        });
        
        if (this.respuestaTemporal !== null) {
            const btnC = document.createElement('button');
            btnC.className = 'btn-continuar';
            btnC.textContent = '➜ Continuar';
            btnC.onclick = () => this.confirmarRespuesta();
            container.appendChild(btnC);
        }
    },
    
    seleccionarRespuesta: function(idx) {
        this.respuestaTemporal = idx;
        this.mostrarPregunta();
    },
    
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
        this.tiempoRestante = this.tiempoLimite;
        const self = this;
        
        this.timerExamen = setInterval(function() {
            self.tiempoRestante = self.tiempoLimite - (Date.now() - self.tiempoInicio);
            if (self.tiempoRestante <= 0) {
                clearInterval(self.timerExamen);
                self.timerExamen = null;
                alert('Tiempo agotado');
                self.mostrarResultado();
                self.eliminarExamenGuardado();
                return;
            }
            self.actualizarTimerUI();
        }, 1000);
    },
    
    actualizarTimerUI: function() {
        const el = document.getElementById('exam-timer');
        if (!el) return;
        const min = Math.floor(this.tiempoRestante / 60000);
        const seg = Math.floor((this.tiempoRestante % 60000) / 1000);
        el.textContent = `${min}:${seg < 10 ? '0' : ''}${seg}`;
        el.style.color = this.tiempoRestante <= 300000 ? '#f44336' : 'var(--ink3)';
    },
    
    detenerTimer: function() {
        if (this.timerExamen) {
            clearInterval(this.timerExamen);
            this.timerExamen = null;
        }
    },
    
    guardarExamenProgreso: function() {
        if (this.examenActual) {
            this.examenGuardado = {
                examenId: this.examenActual.id,
                respuestas: this.respuestasUsuario.slice(),
                preguntaActual: this.preguntaActual,
                fecha: new Date().toISOString()
            };
            localStorage.setItem('rayoshield_progreso', JSON.stringify(this.examenGuardado));
        }
    },
    
    eliminarExamenGuardado: function() {
        this.examenGuardado = null;
        localStorage.removeItem('rayoshield_progreso');
    },
    
    mostrarResultado: function() {
        if (!this.examenActual) return;
        this.detenerTimer();
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        
        document.getElementById('score-number').textContent = this.resultadoActual.score + '%';
        document.getElementById('aciertos').textContent = this.resultadoActual.aciertos;
        document.getElementById('total').textContent = this.resultadoActual.total;
        document.getElementById('min-score').textContent = this.resultadoActual.minScore;
        document.getElementById('result-status').textContent = this.resultadoActual.estado;
        
        const btnCert = document.getElementById('btn-certificado');
        if (btnCert) {
            btnCert.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
        }
        
        this.mostrarPantalla('result-screen');
        this.guardarEnHistorial();
        this.consumirExamen();
    },
    
    consumirExamen: function() {
        if (this.licencia.tipo === 'DEMO') {
            this.licencia.examenesRestantes = Math.max(0, this.licencia.examenesRestantes - 1);
            this.guardarLicencia();
        }
    },
    
    descargarCertificado: function() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') {
            alert('Solo para aprobados');
            return;
        }
        const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
        const usuario = t || this.userData;
        
        if (typeof generarCertificado !== 'function') {
            alert('Error: Función de certificado no cargada');
            return;
        }
        
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
        this.detenerTimerCaso();
        const container = document.getElementById('casos-list');
        if (!container) return;
        container.innerHTML = '';
        document.getElementById('caso-detalle').style.display = 'none';
        document.getElementById('casos-main-buttons').style.display = 'block';
        
        if (typeof CASOS_INVESTIGACION === 'undefined') {
            container.innerHTML = '<p>No hay casos disponibles</p>';
            this.mostrarPantalla('casos-master-screen');
            return;
        }
        
        const self = this;
        let mostrados = 0;
        const maxDemo = 1;
        
        CASOS_INVESTIGACION.forEach(caso => {
            let tieneAcceso = false;
            if (caso.nivel === 'basico' && self.licencia.features.casosBasicos) tieneAcceso = true;
            else if (caso.nivel === 'master' && self.licencia.features.casosMaster) tieneAcceso = true;
            else if (caso.nivel === 'elite' && self.licencia.features.casosElite) tieneAcceso = true;
            else if (caso.nivel === 'pericial' && self.licencia.features.casosPericial) tieneAcceso = true;
            
            if (tieneAcceso) {
                if (self.licencia.tipo === 'DEMO' && mostrados >= maxDemo) return;
                const item = document.createElement('div');
                item.className = 'caso-item';
                item.innerHTML = `<h4>${caso.icono} ${caso.titulo}</h4><p><span class="badge-nivel ${caso.nivel}">${caso.nivel.toUpperCase()}</span> • ${caso.tiempo_estimado}</p><p>${caso.descripcion}</p>`;
                item.onclick = () => self.cargarCasoMaster(caso.id);
                container.appendChild(item);
                mostrados++;
            }
        });
        
        if (container.children.length === 0) {
            container.innerHTML = '<p>No hay casos disponibles para tu plan</p>';
        }
        this.mostrarPantalla('casos-master-screen');
    },
    
    cargarCasoMaster: async function(casoId) {
        const caso = await cargarCasoInvestigacion(casoId);
        if (!caso) {
            alert('Error cargando caso');
            return;
        }
        this.casoActual = caso;
        this.respuestasCaso = {};
        
        document.getElementById('casos-list').style.display = 'none';
        document.getElementById('caso-detalle').style.display = 'block';
        document.getElementById('caso-id').textContent = caso.id || 'N/A';
        document.getElementById('caso-fecha').textContent = caso.fecha_evento || 'N/A';
        document.getElementById('caso-industria').textContent = caso.industria || 'N/A';
        document.getElementById('caso-tiempo').textContent = caso.tiempo_estimado || '15 min';
        
        if (caso.descripcion_evento) {
            const desc = caso.descripcion_evento;
            document.getElementById('caso-descripcion').innerHTML = `<div style="background:var(--bg);padding:15px;border-radius:10px;"><strong>📋 Evento:</strong> ${desc.actividad || ''} - ${desc.evento || ''}</div>`;
        }
        
        if (caso.linea_tiempo) {
            document.getElementById('caso-timeline').innerHTML = `<div class="timeline">${caso.linea_tiempo.map(e => `<div class="timeline-item">${e}</div>`).join('')}</div>`;
        }
        
        const preguntasDiv = document.getElementById('caso-preguntas');
        preguntasDiv.innerHTML = '';
        const self = this;
        
        caso.preguntas.forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = 'pregunta-master';
            div.innerHTML = `<h4>🔍 Pregunta ${idx + 1} - ${p.peso || 0} pts</h4><p>${p.pregunta}</p>`;
            
            if (p.tipo === 'analisis_multiple') {
                p.opciones.forEach((opt, oidx) => {
                    const label = document.createElement('label');
                    label.className = 'opcion-sistemica';
                    label.innerHTML = `<input type="checkbox" name="q${p.id}" value="${oidx}"><span class="texto-opcion">${opt.texto || opt}</span>`;
                    div.appendChild(label);
                });
            } else if (p.tipo === 'respuesta_abierta_guiada') {
                const ta = document.createElement('textarea');
                ta.className = 'respuesta-abierta';
                ta.placeholder = 'Escribe tu análisis aquí...';
                div.appendChild(ta);
                if (p.feedback_guiado) {
                    const hint = document.createElement('div');
                    hint.className = 'pista-experto';
                    hint.innerHTML = `💡 ${p.feedback_guiado}`;
                    div.appendChild(hint);
                }
            } else if (p.tipo === 'plan_accion') {
                p.opciones.forEach((opt, oidx) => {
                    const label = document.createElement('label');
                    label.className = 'accion-item';
                    const jerarquia = opt.jerarquia || 'administrativo';
                    label.innerHTML = `<input type="checkbox" name="plan${p.id}" value="${oidx}"><div><strong>${opt.texto || opt.accion || opt}</strong><br><span class="accion-jerarquia ${jerarquia}">${jerarquia}</span></div>`;
                    div.appendChild(label);
                });
            }
            preguntasDiv.appendChild(div);
        });
        
        document.getElementById('btn-enviar-caso').style.display = 'inline-block';
        this.iniciarTimerCaso();
    },
    
    iniciarTimerCaso: function() {
        this.tiempoCasoInicio = Date.now();
        this.tiempoCasoRestante = this.tiempoCasoLimite;
        const self = this;
        
        let timerEl = document.getElementById('caso-timer');
        if (!timerEl) {
            timerEl = document.createElement('div');
            timerEl.id = 'caso-timer';
            timerEl.style.cssText = 'text-align:center;font-size:24px;font-weight:bold;margin:15px 0;padding:10px;background:var(--bg);border-radius:10px;';
            const casoDetalle = document.getElementById('caso-detalle');
            if (casoDetalle) casoDetalle.insertBefore(timerEl, casoDetalle.firstChild);
        }
        
        this.timerCaso = setInterval(function() {
            self.tiempoCasoRestante = self.tiempoCasoLimite - (Date.now() - self.tiempoCasoInicio);
            if (self.tiempoCasoRestante <= 0) {
                clearInterval(self.timerCaso);
                self.timerCaso = null;
                alert('Tiempo agotado');
                self.enviarRespuestasCaso();
                return;
            }
            const min = Math.floor(self.tiempoCasoRestante / 60000);
            const seg = Math.floor((self.tiempoCasoRestante % 60000) / 1000);
            if (timerEl) timerEl.textContent = `⏱️ ${min}:${seg < 10 ? '0' : ''}${seg}`;
        }, 1000);
    },
    
    actualizarTimerCasoUI: function() {
        const el = document.getElementById('caso-timer');
        if (!el) return;
        const min = Math.floor(this.tiempoCasoRestante / 60000);
        const seg = Math.floor((this.tiempoCasoRestante % 60000) / 1000);
        el.textContent = `⏱️ ${min}:${seg < 10 ? '0' : ''}${seg}`;
    },
    
    detenerTimerCaso: function() {
        if (this.timerCaso) {
            clearInterval(this.timerCaso);
            this.timerCaso = null;
        }
    },
    
    enviarRespuestasCaso: function() {
        if (!this.casoActual) return;
        
        const respuestasPorPregunta = {};
        this.casoActual.preguntas.forEach(pregunta => {
            if (pregunta.tipo === 'analisis_multiple') {
                const checks = document.querySelectorAll(`input[name="q${pregunta.id}"]:checked`);
                respuestasPorPregunta[pregunta.id] = Array.from(checks).map(c => parseInt(c.value));
            } else if (pregunta.tipo === 'respuesta_abierta_guiada') {
                const ta = document.querySelector(`#caso-preguntas textarea`);
                respuestasPorPregunta[pregunta.id] = [ta ? ta.value : ''];
            } else if (pregunta.tipo === 'plan_accion') {
                const checks = document.querySelectorAll(`input[name="plan${pregunta.id}"]:checked`);
                respuestasPorPregunta[pregunta.id] = Array.from(checks).map(c => parseInt(c.value));
            }
        });
        
        const resultado = typeof SmartEvaluationV2 !== 'undefined' ? 
            SmartEvaluationV2.evaluarConDimensiones(respuestasPorPregunta, this.casoActual) :
            { aprobado: true, porcentaje: 85, puntajeTotal: 85, puntajeMaximo: 100, feedback: [], leccion: 'Correcto', conclusion: 'Aprobado' };
        
        this.resultadoCaso = resultado;
        this.mostrarResultadoCaso(resultado);
    },
    
    mostrarResultadoCaso: function(resultado) {
        const resultadoEl = document.getElementById('caso-resultado');
        if (!resultadoEl) return;
        
        resultadoEl.style.display = 'block';
        resultadoEl.scrollIntoView({ behavior: 'smooth' });
        this.detenerTimerCaso();
        document.getElementById('btn-enviar-caso').style.display = 'none';
        
        const nivelCertificado = this.casoActual?.nivel || 'COMPLETADO';
        const estadoTexto = resultado.aprobado ? `✅ APROBADO - Nivel ${nivelCertificado.toUpperCase()}` : '📚 Requiere repaso';
        
        resultadoEl.innerHTML = `<div style="background:var(--white);border-radius:var(--radius);padding:24px;text-align:center;">
            <h2>${resultado.aprobado ? '✅ APROBADO' : '📚 REQUIERE REPASO'}</h2>
            <div style="font-size:56px;font-weight:800;margin:20px 0;">${resultado.porcentaje || 0}%</div>
            <p><strong>Puntaje:</strong> ${resultado.puntajeTotal || 0} / ${resultado.puntajeMaximo || 0}</p>
            <p><strong>Estado:</strong> ${estadoTexto}</p>
            <div class="button-group" style="margin-top:20px;">
                ${resultado.aprobado ? `<button class="btn btn-primary" onclick="app.descargarCertificadoCaso()">📄 Certificado</button>` : ''}
                <button class="btn btn-secondary" onclick="app.volverAListaCasos()">🔄 Otro caso</button>
                <button class="btn btn-secondary" onclick="app.volverHome()">🏠 Inicio</button>
            </div>
        </div>`;
        
        if (resultado.aprobado) {
            this.guardarResultadoCasoHistorial();
        }
    },
    
    guardarResultadoCasoHistorial: function() {
        const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
        const hist = this.obtenerHistorial();
        hist.push({
            examen: this.casoActual?.titulo || 'Caso',
            score: this.resultadoCaso?.porcentaje || 0,
            estado: 'Aprobado',
            fecha: new Date().toISOString(),
            usuario: t ? t.nombre : this.userData.nombre,
            tipoUsuario: t ? 'trabajador' : 'admin',
            trabajadorId: t?.id || null
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
    },
    
    descargarCertificadoCaso: function() {
        if (!this.casoActual || !this.resultadoCaso?.aprobado) {
            alert('No hay certificado disponible');
            return;
        }
        const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
        const usuario = t || this.userData;
        const nivel = this.casoActual.nivel || 'COMPLETADO';
        
        if (typeof generarCertificadoCaso !== 'function') {
            alert('Error: Función de certificado no cargada');
            return;
        }
        
        generarCertificadoCaso(usuario, this.casoActual, this.resultadoCaso, nivel.toUpperCase(), this.licencia.tipo === 'DEMO')
            .then(url => {
                const a = document.createElement('a');
                a.download = `RayoShield_${nivel}_${usuario.nombre.replace(/\s/g, '_')}_${Date.now()}.png`;
                a.href = url;
                a.click();
            }).catch(err => alert('Error generando certificado'));
    },
    
    volverAListaCasos: function() {
        this.detenerTimerCaso();
        document.getElementById('casos-list').style.display = 'block';
        document.getElementById('caso-detalle').style.display = 'none';
        document.getElementById('caso-resultado').style.display = 'none';
        this.casoActual = null;
        this.resultadoCaso = null;
    },

    // ─────────────────────────────────────────────────────────────────
    // HISTORIAL Y REPORTES
    // ─────────────────────────────────────────────────────────────────
    guardarEnHistorial: function() {
        const hist = this.obtenerHistorial();
        const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
        
        hist.push({
            examen: this.examenActual?.titulo || 'Desconocido',
            norma: this.examenActual?.norma || '',
            score: this.resultadoActual?.score || 0,
            estado: this.resultadoActual?.estado || '',
            fecha: new Date().toISOString(),
            usuario: t ? t.nombre : this.userData.nombre,
            tipoUsuario: t ? 'trabajador' : 'admin',
            trabajadorId: t?.id || null
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
        
        if (this.firebaseListo && this.db && t) {
            this.db.collection('resultados').add({
                trabajadorId: t.id,
                trabajadorNombre: t.nombre,
                examen: this.examenActual?.titulo,
                puntaje: this.resultadoActual?.score,
                aprobado: this.resultadoActual?.estado === 'Aprobado',
                fecha: new Date().toISOString()
            }).catch(e => console.warn('Error sync:', e));
        }
    },
    
    obtenerHistorial: function() {
        try {
            const h = localStorage.getItem('rayoshield_historial');
            return h ? JSON.parse(h) : [];
        } catch(e) { return []; }
    },
    
    obtenerHistorialPorTrabajador: function(trabajadorId) {
        const hist = this.obtenerHistorial();
        if (!trabajadorId) return hist;
        return hist.filter(h => h.trabajadorId === trabajadorId);
    },
    
    obtenerHistorialAdmin: function() {
        return this.obtenerHistorial().filter(h => h.tipoUsuario === 'admin');
    },
    
    renderHistorial: function() {
        const list = document.getElementById('history-list');
        if (!list) return;
        
        const filtro = document.getElementById('historial-filtro-trabajador');
        let filtroValor = filtro ? filtro.value : 'todos';
        
        if (this.esTrabajador()) {
            const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
            if (!t) {
                list.innerHTML = '<p>Error: No hay trabajador seleccionado</p>';
                return;
            }
            filtroValor = t.id;
            if (filtro) filtro.style.display = 'none';
        } else if (filtro) {
            filtro.style.display = 'block';
        }
        
        let hist = this.obtenerHistorial();
        
        if (filtroValor === 'admin') {
            hist = hist.filter(h => h.tipoUsuario === 'admin');
        } else if (filtroValor !== 'todos') {
            hist = hist.filter(h => h.trabajadorId === filtroValor);
        }
        
        if (hist.length === 0) {
            list.innerHTML = '<p style="text-align:center;padding:40px;">📭 Sin exámenes registrados</p>';
            return;
        }
        
        list.innerHTML = `<table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:var(--bg);">
                <th style="padding:12px;text-align:left;">Fecha</th>
                <th style="padding:12px;text-align:left;">Usuario</th>
                <th style="padding:12px;text-align:left;">Examen</th>
                <th style="padding:12px;text-align:right;">Puntaje</th>
                <th style="padding:12px;text-align:center;">Estado</th>
            </tr></thead>
            <tbody>
            ${hist.slice(-20).reverse().map(item => `
                <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:12px;">${new Date(item.fecha).toLocaleDateString('es-MX')}</td>
                    <td style="padding:12px;font-weight:600;">${item.usuario || 'N/A'}</td>
                    <td style="padding:12px;">${item.examen}</td>
                    <td style="padding:12px;text-align:right;font-weight:700;">${item.score}%</td>
                    <td style="padding:12px;text-align:center;"><span class="${item.estado === 'Aprobado' ? 'status-ok' : 'status-pend'}">${item.estado === 'Aprobado' ? '✅ Aprobado' : '❌ Reprobado'}</span></td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;
    },
    
    llenarFiltroTrabajadoresHistorial: function() {
        const select = document.getElementById('historial-filtro-trabajador');
        if (!select) return;
        
        const actual = select.value;
        select.innerHTML = '<option value="todos">Todos los usuarios</option><option value="admin">Solo Admin</option>';
        
        if (typeof MultiUsuario !== 'undefined') {
            const trabajadores = MultiUsuario.getTrabajadores();
            trabajadores.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = `👷 ${t.nombre}`;
                select.appendChild(opt);
            });
        }
        select.value = actual;
    },
    
    exportarHistorialPDF: function() {
        const hist = this.obtenerHistorial();
        if (hist.length === 0) { alert('No hay datos para exportar'); return; }
        
        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Historial RayoShield</title>
        <style>body{font-family:Arial;padding:20px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f2f2f2}</style>
        </head><body><h1>Historial de Exámenes</h1><table><tr><th>Fecha</th><th>Usuario</th><th>Examen</th><th>Puntaje</th><th>Estado</th></tr>`;
        
        hist.forEach(h => {
            html += `<tr><td>${new Date(h.fecha).toLocaleDateString()}</td><td>${h.usuario || ''}</td><td>${h.examen}</td><td>${h.score}%</td><td>${h.estado}</td></tr>`;
        });
        
        html += `</table><p>Generado: ${new Date().toLocaleString()}</p></body></html>`;
        const win = window.open();
        win.document.write(html);
        win.print();
    },

    // ─────────────────────────────────────────────────────────────────
    // LICENCIA
    // ─────────────────────────────────────────────────────────────────
    cargarLicencia: function() {
        try {
            const s = localStorage.getItem('rayoshield_licencia');
            if (s) {
                const parsed = JSON.parse(s);
                if (parsed.tipo) this.licencia = parsed;
            }
        } catch(e) {}
    },
    
    guardarLicencia: function() {
        localStorage.setItem('rayoshield_licencia', JSON.stringify(this.licencia));
        this.actualizarUI();
    },
    
    verificarExpiracionLicencia: function() {
        if (this.licencia.expiracion && this.licencia.tipo !== 'DEMO') {
            if (new Date() > new Date(this.licencia.expiracion)) {
                this.licencia = { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3, features: {} };
                this.guardarLicencia();
                alert('Licencia expirada. Modo DEMO.');
            }
        }
    },
    
    validarLicencia: function(clienteId, clave) {
        const licencias = {
            'RS-PKDF-9826-A1B2': { tipo: 'PROFESIONAL', duracion: 365, features: { casosBasicos: true, casosMaster: true } },
            'RS-COZS-2XT6-C3D4': { tipo: 'CONSULTOR', duracion: 365, features: { casosBasicos: true, casosMaster: true, casosElite: true, insignias: true } },
            'RS-EVP4-Y02I-E5F6': { tipo: 'EMPRESARIAL', duracion: 365, features: { whiteLabel: true, predictivo: true, multiUsuario: 50 } }
        };
        const data = licencias[clave.toUpperCase()];
        if (!data) return Promise.resolve({ valido: false, error: 'Clave inválida' });
        
        const expiracion = new Date();
        expiracion.setDate(expiracion.getDate() + data.duracion);
        return Promise.resolve({ valido: true, tipo: data.tipo, clienteId, expiracion: expiracion.toISOString(), features: data.features });
    },
    
    activarLicencia: function() {
        const idEl = document.getElementById('license-id');
        const keyEl = document.getElementById('license-key');
        const clienteId = idEl?.value.trim().toUpperCase() || '';
        const clave = keyEl?.value.trim().toUpperCase() || '';
        if (!clienteId || !clave) { alert('Ingresa ID y clave'); return; }
        
        this.validarLicencia(clienteId, clave).then(res => {
            if (res.valido) {
                this.licencia = {
                    tipo: res.tipo,
                    clave: clave,
                    clienteId: res.clienteId,
                    expiracion: res.expiracion,
                    examenesRestantes: 9999,
                    features: res.features
                };
                this.guardarLicencia();
                alert(`✅ Licencia ${res.tipo} activada`);
                location.reload();
            } else {
                alert('❌ ' + res.error);
            }
        });
    },
    
    activarLicenciaConPlan: function(plan) {
        const datos = {
            'PROFESIONAL': { id: 'PROFESIONAL_001', clave: 'RS-PKDF-9826-A1B2' },
            'CONSULTOR': { id: 'CONSULTOR_001', clave: 'RS-COZS-2XT6-C3D4' },
            'EMPRESARIAL': { id: 'EMPRESARIAL_001', clave: 'RS-EVP4-Y02I-E5F6' }
        };
        if (datos[plan]) {
            const idEl = document.getElementById('license-id');
            const keyEl = document.getElementById('license-key');
            if (idEl) idEl.value = datos[plan].id;
            if (keyEl) keyEl.value = datos[plan].clave;
            document.getElementById('activar-licencia-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    actualizarLicenciaUI: function() {
        const planEl = document.getElementById('licencia-screen-plan');
        if (planEl) planEl.textContent = this.licencia.tipo;
        const clienteEl = document.getElementById('licencia-screen-cliente');
        if (clienteEl) clienteEl.textContent = this.licencia.clienteId || 'N/A';
        
        const features = this.licencia.features || {};
        const container = document.getElementById('licencia-features');
        if (container) {
            let html = '';
            if (features.casosBasicos) html += '<div>✓ Casos BÁSICOS</div>';
            if (features.casosMaster) html += '<div>✓ Casos MASTER</div>';
            if (features.casosElite) html += '<div>✓ Casos ELITE</div>';
            if (features.casosPericial) html += '<div>✓ Casos PERICIAL</div>';
            if (features.insignias) html += '<div>✓ Insignias PNG</div>';
            if (features.whiteLabel) html += '<div>✓ White Label</div>';
            if (features.predictivo) html += '<div>✓ Dashboard Predictivo</div>';
            if (features.multiUsuario) html += `<div>✓ ${features.multiUsuario} Trabajadores</div>`;
            if (!html) html = '<div>Plan DEMO - Características básicas</div>';
            container.innerHTML = html;
        }
    },
    
    aplicarConfiguracionWhiteLabel: function() {
        if (!this.licencia.features?.whiteLabel) return;
        const config = localStorage.getItem('rayoshield_wl_config');
        if (config) {
            const c = JSON.parse(config);
            if (c.color) document.documentElement.style.setProperty('--wl-primary', c.color);
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // MULTIUSUARIO UI
    // ─────────────────────────────────────────────────────────────────
    renderTrabajadores: function() {
        if (typeof MultiUsuario === 'undefined') return;
        const tbody = document.getElementById('trabajadores-tabla');
        const vacio = document.getElementById('trabajadores-vacio');
        if (!tbody) return;
        
        const filtro = document.getElementById('filtro-estado')?.value || 'todos';
        const busqueda = document.getElementById('buscar-trabajador')?.value.toLowerCase() || '';
        
        let trabajadores = MultiUsuario.getTrabajadores();
        if (filtro !== 'todos') trabajadores = trabajadores.filter(t => t.estado === filtro);
        if (busqueda) {
            trabajadores = trabajadores.filter(t => 
                t.nombre.toLowerCase().includes(busqueda) || 
                t.curp.toLowerCase().includes(busqueda) ||
                (t.puesto && t.puesto.toLowerCase().includes(busqueda))
            );
        }
        
        if (trabajadores.length === 0) {
            tbody.innerHTML = '';
            if (vacio) vacio.style.display = 'block';
            return;
        }
        if (vacio) vacio.style.display = 'none';
        
        tbody.innerHTML = trabajadores.map(t => {
            const prog = MultiUsuario.getProgresoByTrabajador(t.id);
            return `<tr style="border-bottom:1px solid var(--border);">
                <td style="padding:14px;"><div style="font-weight:600;">${t.nombre}</div><div style="font-size:11px;color:var(--ink4);">${t.curp}</div></td>
                <td style="padding:14px;">${t.puesto || 'N/A'}<br><small>${t.area || ''}</small></td>
                <td style="padding:14px;">${prog.total_examenes} exámenes<br><small>${prog.total_casos} casos</small></td>
                <td style="padding:14px;font-weight:700;color:${prog.promedio >= 80 ? 'var(--green)' : 'var(--amber)'};">${prog.promedio}%</td>
                <td style="padding:14px;"><span class="${t.estado === 'activo' ? 'status-ok' : 'status-pend'}">${t.estado === 'activo' ? '✅ Activo' : '⏸️ Inactivo'}</span></td>
                <td style="padding:14px;text-align:center;">
                    <button class="tbl-btn view" onclick="app.verProgresoTrabajador('${t.id}')">📊</button>
                    <button class="tbl-btn" onclick="app.editarTrabajador('${t.id}')">✏️</button>
                    <button class="tbl-btn" style="background:var(--rose-l);color:var(--rose);" onclick="app.eliminarTrabajador('${t.id}')">🗑️</button>
                </td>
            </tr>`;
        }).join('');
        this.actualizarEstadisticasTrabajadores();
        this.actualizarBadgeTrabajadores();
    },
    
    actualizarEstadisticasTrabajadores: function() {
        if (typeof MultiUsuario === 'undefined') return;
        const stats = MultiUsuario.getEstadisticas();
        const el1 = document.getElementById('stat-trabajadores-total');
        const el2 = document.getElementById('stat-trabajadores-activos');
        const el3 = document.getElementById('stat-examenes-total');
        const el4 = document.getElementById('stat-tasa-aprobacion');
        if (el1) el1.textContent = stats.trabajadores_totales;
        if (el2) el2.textContent = stats.trabajadores_activos;
        if (el3) el3.textContent = stats.examenes_totales + stats.casos_totales;
        if (el4) el4.textContent = stats.tasa_aprobacion + '%';
    },
    
    mostrarModalTrabajador: function() {
        document.getElementById('modal-trabajador-titulo').textContent = '👤 Nuevo Trabajador';
        ['id', 'nombre', 'curp', 'puesto', 'area', 'email', 'telefono', 'notas'].forEach(id => {
            const el = document.getElementById(`trabajador-${id}`);
            if (el) el.value = '';
        });
        document.getElementById('modal-trabajador').classList.add('active');
    },
    
    cerrarModalTrabajador: function() {
        document.getElementById('modal-trabajador').classList.remove('active');
    },
    
    guardarTrabajador: function() {
        if (typeof MultiUsuario === 'undefined') { alert('Error'); return; }
        const nombre = document.getElementById('trabajador-nombre')?.value.trim();
        const curp = document.getElementById('trabajador-curp')?.value.trim().toUpperCase();
        const puesto = document.getElementById('trabajador-puesto')?.value.trim();
        if (!nombre || !curp || !puesto) { alert('Nombre, CURP y Puesto son obligatorios'); return; }
        
        const data = {
            nombre, curp, puesto,
            area: document.getElementById('trabajador-area')?.value || '',
            email: document.getElementById('trabajador-email')?.value || '',
            telefono: document.getElementById('trabajador-telefono')?.value || '',
            notas: document.getElementById('trabajador-notas')?.value || ''
        };
        
        const id = document.getElementById('trabajador-id')?.value;
        if (id) {
            MultiUsuario.updateTrabajador(id, data);
            alert('Trabajador actualizado');
        } else {
            MultiUsuario.addTrabajador(data);
            alert('Trabajador registrado');
        }
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
        document.getElementById('trabajador-telefono').value = t.telefono || '';
        document.getElementById('trabajador-notas').value = t.notas || '';
        document.getElementById('modal-trabajador').classList.add('active');
    },
    
    eliminarTrabajador: function(id) {
        if (confirm('¿Eliminar este trabajador?')) {
            MultiUsuario.deleteTrabajador(id);
            this.renderTrabajadores();
            this.actualizarBadgeTrabajadores();
        }
    },
    
    verProgresoTrabajador: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        const prog = MultiUsuario.getProgresoByTrabajador(id);
        alert(`📊 ${t.nombre}\nExámenes: ${prog.total_examenes}\nPromedio: ${prog.promedio}%\nCasos: ${prog.total_casos}`);
    },
    
    mostrarSeleccionarTrabajador: function() {
        const lista = document.getElementById('kiosco-lista');
        if (!lista) return;
        const trabajadores = MultiUsuario.getTrabajadores().filter(t => t.estado === 'activo');
        if (trabajadores.length === 0) {
            lista.innerHTML = '<div style="padding:20px;text-align:center;">No hay trabajadores activos</div>';
        } else {
            lista.innerHTML = trabajadores.map(t => `
                <div onclick="app.seleccionarTrabajadorKiosco('${t.id}')" style="padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;">
                    <div style="font-weight:600;">${t.nombre}</div>
                    <div style="font-size:11px;color:var(--ink4);">${t.curp} • ${t.puesto || 'N/A'}</div>
                </div>
            `).join('');
        }
        document.getElementById('modal-seleccionar-trabajador').classList.add('active');
    },
    
    cerrarModalSeleccionarTrabajador: function() {
        document.getElementById('modal-seleccionar-trabajador').classList.remove('active');
    },
    
    filtrarKioscoTrabajadores: function() {
        const busqueda = document.getElementById('kiosco-buscar')?.value.toLowerCase() || '';
        const items = document.querySelectorAll('#kiosco-lista > div');
        items.forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(busqueda) ? 'block' : 'none';
        });
    },
    
    seleccionarTrabajadorKiosco: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        if (!t) return;
        if (confirm(`👷 Cambiar a modo trabajador\n\nTrabajador: ${t.nombre}\nPuesto: ${t.puesto || 'N/A'}\n\n¿Continuar?`)) {
            this.modoActual = 'trabajador';
            MultiUsuario.setTrabajadorActual(id);
            this.cerrarModalSeleccionarTrabajador();
            this.actualizarTrabajadorActualUI();
            this.actualizarSidebarModoIndicador();
            this.actualizarUIMenuPorRol();
            alert(`✅ Modo trabajador: ${t.nombre}`);
        }
    },
    
    actualizarBadgeTrabajadores: function() {
        const badge = document.getElementById('nav-badge-trabajadores');
        if (badge && typeof MultiUsuario !== 'undefined') {
            const count = MultiUsuario.getTrabajadores().length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    },
    
    actualizarTrabajadorActualUI: function() {
        const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
        const topbarSub = document.getElementById('topbar-sub');
        if (t && topbarSub) {
            topbarSub.textContent = `👷 ${t.nombre} • ${t.puesto}`;
            topbarSub.style.color = 'var(--amber)';
        } else if (topbarSub) {
            topbarSub.textContent = 'Plataforma de certificación';
            topbarSub.style.color = 'var(--ink4)';
        }
    },
    
    actualizarSidebarModoIndicador: function() {
        const btnVolverAdmin = document.getElementById('btn-volver-admin');
        const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
        if (btnVolverAdmin) {
            btnVolverAdmin.style.display = t ? 'block' : 'none';
        }
    },
    
    volverAModoAdmin: function() {
        if (this.verificarPasswordAdmin()) {
            if (typeof MultiUsuario !== 'undefined') MultiUsuario.clearTrabajadorActual();
            this.modoActual = 'admin';
            this.actualizarTrabajadorActualUI();
            this.actualizarSidebarModoIndicador();
            this.actualizarUIMenuPorRol();
            alert('✅ Modo administrador activado');
        }
    },
    
    cerrarSesionTrabajador: function() {
        if (typeof MultiUsuario !== 'undefined') MultiUsuario.clearTrabajadorActual();
        this.modoActual = 'admin';
        this.actualizarTrabajadorActualUI();
        this.actualizarSidebarModoIndicador();
        this.actualizarUIMenuPorRol();
        alert('Sesión de trabajador cerrada');
    },

    // ─────────────────────────────────────────────────────────────────
    // ROLES Y PERMISOS
    // ─────────────────────────────────────────────────────────────────
    esAdmin: function() {
        return this.isAdmin || this.modoActual === 'admin';
    },
    
    esTrabajador: function() {
        return this.modoActual === 'trabajador' && (typeof MultiUsuario !== 'undefined' && MultiUsuario.getTrabajadorActual() !== null);
    },
    
    verificarAccesoAdmin: function(funcionNombre, mostrarAlerta = true) {
        if (this.esTrabajador()) {
            if (mostrarAlerta) alert('⚠️ Solo administradores');
            return false;
        }
        return true;
    },
    
    verificarPasswordAdmin: function() {
        const pwd = prompt('🔐 Contraseña de administrador:');
        if (!pwd) return false;
        const guardada = localStorage.getItem('rayoshield_admin_password') || 'admin123';
        if (pwd !== guardada) {
            alert('Contraseña incorrecta');
            return false;
        }
        return true;
    },
    
    cambiarPasswordAdmin: function() {
        const current = document.getElementById('admin-password-current')?.value;
        const nueva = document.getElementById('admin-password-new')?.value;
        if (!nueva || nueva.length < 6) { alert('Mínimo 6 caracteres'); return; }
        const guardada = localStorage.getItem('rayoshield_admin_password') || 'admin123';
        if (current && current !== guardada) { alert('Contraseña actual incorrecta'); return; }
        localStorage.setItem('rayoshield_admin_password', nueva);
        alert('Contraseña actualizada');
        if (document.getElementById('admin-password-current')) document.getElementById('admin-password-current').value = '';
        if (document.getElementById('admin-password-new')) document.getElementById('admin-password-new').value = '';
    },
    
    actualizarUIMenuPorRol: function() {
        const esTrabajador = this.esTrabajador();
        const elementosRestringidos = ['#nav-badge-trabajadores', '.nav-item[onclick*="mostrarTrabajadores"]', '.nav-item[onclick*="mostrarLicencia"]', '.nav-item[onclick*="mostrarInfo"]'];
        elementosRestringidos.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = esTrabajador ? 'none' : '';
        });
        const btnAdmin = document.getElementById('btn-volver-admin');
        if (btnAdmin) btnAdmin.style.display = esTrabajador ? 'block' : 'none';
    },
    
    actualizarUIPorRol: function() {
        const esAdmin = this.esAdmin();
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = esAdmin ? 'flex' : 'none');
    },
    
    actualizarUI: function() {
        const infoLic = document.getElementById('licencia-info');
        if (infoLic) {
            if (this.licencia.tipo === 'DEMO') {
                infoLic.textContent = `📋 DEMO: ${this.licencia.examenesRestantes}/3 hoy`;
                infoLic.className = 'licencia-info-card demo';
            } else {
                infoLic.textContent = `✅ ${this.licencia.tipo}: ${this.licencia.clienteId}`;
                infoLic.className = 'licencia-info-card activo';
            }
        }
        
        const userInfo = document.getElementById('usuario-info');
        if (userInfo && this.userData.nombre) {
            userInfo.innerHTML = `<strong>👤 ${this.userData.nombre}</strong><br>${this.userData.empresa || ''} • ${this.userData.puesto || ''}`;
        }
        
        const sidebarPlan = document.getElementById('sidebar-license-plan');
        if (sidebarPlan) sidebarPlan.textContent = this.licencia.tipo;
        
        const btnExamen = document.getElementById('btn-comenzar');
        if (btnExamen) {
            const datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
            btnExamen.disabled = !datosOk;
            btnExamen.style.opacity = datosOk ? '1' : '0.5';
        }
        
        this.actualizarLicenciaUI();
        this.actualizarBadgeTrabajadores();
        this.actualizarSidebarModoIndicador();
        this.actualizarUIMenuPorRol();
        this.actualizarUIPorRol();
    },

    // ─────────────────────────────────────────────────────────────────
    // PWA Y EXTRAS
    // ─────────────────────────────────────────────────────────────────
    initPWAInstall: function() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('btn-instalar-pwa');
            if (btn) btn.style.display = 'flex';
        });
    },
    
    instalarPWA: function() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then(() => this.deferredPrompt = null);
        } else {
            alert('Usa el menú del navegador → "Agregar a pantalla principal"');
        }
    },
    
    toggleTema: function() {
        document.body.classList.toggle('tema-claro');
        localStorage.setItem('rayoshield_tema', document.body.classList.contains('tema-claro') ? 'claro' : 'oscuro');
    },
    
    cerrarSesion: function() {
        if (confirm('¿Cerrar sesión? Se borrarán los datos locales.')) {
            if (this.firebaseListo && this.auth) this.auth.signOut();
            localStorage.clear();
            location.reload();
        }
    },
    
    exportarDatos: function() {
        alert('Función de respaldo disponible en planes PROFESIONAL+');
    },
    
    importarDatos: function() {
        alert('Función de respaldo disponible en planes PROFESIONAL+');
    },
    
    limpiarDatosConfirmar: function() {
        if (confirm('⚠️ ¿Eliminar TODOS los datos? Esta acción NO se puede deshacer.')) {
            if (prompt('Escribe "BORRAR" para confirmar') === 'BORRAR') {
                localStorage.clear();
                location.reload();
            }
        }
    },
    
    exportarTodoAFirebase: function() {
        alert('Función en desarrollo');
    },
    
    importarTodoDeFirebase: function() {
        alert('Función en desarrollo');
    },
    
    guardarTrabajadorFirebase: function() {},
    eliminarTrabajadorFirebase: function() {},
    guardarResultadoFirebase: function() {},
    escucharCambiosTrabajadores: function() {},
    cargarTrabajadoresFirebase: function() { return Promise.resolve([]); },
    cargarResultadosFirebase: function() { return Promise.resolve([]); },
    crearTrabajadorConEnlace: async function(datos) {
        alert('Función disponible con Firebase configurado');
        return null;
    }
};

// ═══════════════════════════════════════════════════════════════
// MULTIUSUARIO (Backup Local)
// ═══════════════════════════════════════════════════════════════
const MultiUsuario = {
    init: function() {
        if (!localStorage.getItem('rayoshield_empresa')) {
            localStorage.setItem('rayoshield_empresa', JSON.stringify({ nombre: '', rfc: '', email: '', telefono: '', direccion: '', fecha_registro: new Date().toISOString() }));
        }
        if (!localStorage.getItem('rayoshield_trabajadores')) localStorage.setItem('rayoshield_trabajadores', JSON.stringify([]));
        if (!localStorage.getItem('rayoshield_resultados')) localStorage.setItem('rayoshield_resultados', JSON.stringify([]));
        if (!localStorage.getItem('rayoshield_trabajador_actual')) localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(null));
    },
    getEmpresa: function() { return JSON.parse(localStorage.getItem('rayoshield_empresa')); },
    setEmpresa: function(data) { localStorage.setItem('rayoshield_empresa', JSON.stringify(data)); },
    getTrabajadores: function() { return JSON.parse(localStorage.getItem('rayoshield_trabajadores') || '[]'); },
    addTrabajador: function(t) {
        const arr = this.getTrabajadores();
        t.id = 'TRAB-' + Date.now().toString(36).toUpperCase();
        t.fecha_registro = new Date().toISOString();
        t.estado = 'activo';
        arr.push(t);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr));
        return t;
    },
    updateTrabajador: function(id, data) {
        let arr = this.getTrabajadores();
        arr = arr.map(t => t.id === id ? { ...t, ...data } : t);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr));
    },
    deleteTrabajador: function(id) {
        let arr = this.getTrabajadores();
        arr = arr.filter(t => t.id !== id);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr));
        let resultados = this.getResultados();
        resultados = resultados.filter(r => r.trabajador_id !== id);
        localStorage.setItem('rayoshield_resultados', JSON.stringify(resultados));
    },
    getTrabajadorById: function(id) { return this.getTrabajadores().find(t => t.id === id); },
    setTrabajadorActual: function(id) { localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(id)); },
    getTrabajadorActual: function() { const id = JSON.parse(localStorage.getItem('rayoshield_trabajador_actual')); return id ? this.getTrabajadorById(id) : null; },
    clearTrabajadorActual: function() { localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(null)); },
    getResultados: function() { return JSON.parse(localStorage.getItem('rayoshield_resultados') || '[]'); },
    addResultado: function(r) {
        const arr = this.getResultados();
        r.id = 'RES-' + Date.now().toString(36).toUpperCase();
        r.fecha = new Date().toISOString();
        arr.push(r);
        localStorage.setItem('rayoshield_resultados', JSON.stringify(arr));
    },
    getResultadosByTrabajador: function(id) { return this.getResultados().filter(r => r.trabajador_id === id); },
    getProgresoByTrabajador: function(id) {
        const resultados = this.getResultadosByTrabajador(id);
        const examenes = resultados.filter(r => r.tipo === 'examen');
        const casos = resultados.filter(r => r.tipo === 'caso');
        return {
            total_examenes: examenes.length,
            examenes_aprobados: examenes.filter(r => r.aprobado).length,
            total_casos: casos.length,
            casos_completados: casos.filter(r => r.aprobado).length,
            promedio: examenes.length ? Math.round(examenes.reduce((a, b) => a + b.puntaje, 0) / examenes.length) : 0
        };
    },
    getEstadisticas: function() {
        const trabajadores = this.getTrabajadores();
        const resultados = this.getResultados();
        return {
            trabajadores_totales: trabajadores.length,
            trabajadores_activos: trabajadores.filter(t => t.estado === 'activo').length,
            examenes_totales: resultados.filter(r => r.tipo === 'examen').length,
            casos_totales: resultados.filter(r => r.tipo === 'caso').length,
            tasa_aprobacion: resultados.length ? Math.round((resultados.filter(r => r.aprobado).length / resultados.length) * 100) : 0
        };
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM listo');
    app.init();
});

window.addEventListener('beforeunload', function() {
    if (app.timerExamen) clearInterval(app.timerExamen);
    if (app.timerCaso) clearInterval(app.timerCaso);
});
