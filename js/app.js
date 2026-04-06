// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - app.js (v5.0 - FLUJO COMPLETO CON ENLACES)
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
    empresaActual: null,
    colaSincronizacion: [],

    // Timers
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
        console.log('RayoShield v5.0 - Flujo con enlaces');
        
        // Configuración local
        if (!localStorage.getItem('rayoshield_admin_password')) {
            localStorage.setItem('rayoshield_admin_password', 'admin123');
        }
        
        this.modoActual = 'admin';
        this.cargarLicencia();
        this.cargarDatosUsuario();
        this.cargarHistorial();
        this.cargarExamenGuardado();
        
        if (typeof MultiUsuario !== 'undefined') MultiUsuario.init();
        
        // Inicializar Firebase
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            this.db = db;
            this.auth = auth;
            this.firebaseListo = true;
            console.log('✅ Firebase conectado');
            
            // Escuchar cambios de autenticación
            if (!this._authListenerSet) {
                this._authListenerSet = true;
                this.auth.onAuthStateChanged(async (user) => {
                    this.currentUser = user;
                    if (user) {
                        try {
                            const adminDoc = await this.db.collection('admins').doc(user.uid).get();
                            this.isAdmin = adminDoc.exists;
                            
                            // Si es admin, cargar empresa
                            if (this.isAdmin) {
                                await this.cargarEmpresaFirebase();
                            }
                        } catch(e) { this.isAdmin = false; }
                        
                        // Verificar si viene de un enlace de trabajador
                        this.verificarEnlaceAcceso();
                    } else {
                        this.isAdmin = false;
                        // Modo invitado/DEMO
                    }
                    this.actualizarUI();
                    this.actualizarUIMenuPorRol();
                });
            }
        }
        
        // Verificar enlace en URL (sin autenticación previa)
        this.verificarEnlaceAcceso();
        
        this.initPWAInstall();
        this.actualizarUI();
        this.mostrarPantalla('home-screen');
        this.verificarExpiracionLicencia();
        this.actualizarBadgeTrabajadores();
        this.actualizarUIMenuPorRol();
    },

    // ─────────────────────────────────────────────────────────────────
    // 🔥 FIREBASE - EMPRESA
    // ─────────────────────────────────────────────────────────────────
    cargarEmpresaFirebase: async function() {
        if (!this.firebaseListo || !this.currentUser) return;
        try {
            const querySnapshot = await this.db.collection('empresas')
                .where('adminId', '==', this.currentUser.uid)
                .limit(1)
                .get();
            if (!querySnapshot.empty) {
                this.empresaActual = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                console.log('✅ Empresa cargada:', this.empresaActual.nombre);
            }
        } catch(e) { console.error('Error cargando empresa:', e); }
    },

    // ─────────────────────────────────────────────────────────────────
    // 🔗 GENERAR ENLACE PARA TRABAJADOR (MEJORA CLAVE)
    // ─────────────────────────────────────────────────────────────────
    generarEnlaceTrabajador: async function(nombre, curp, puesto, email = '') {
        if (!this.firebaseListo) {
            alert('❌ Firebase no disponible. No se pueden generar enlaces.');
            return null;
        }
        
        if (!this.isAdmin) {
            alert('❌ Solo administradores pueden generar enlaces.');
            return null;
        }
        
        try {
            // 1. Generar código único de acceso
            const codigoAcceso = Math.random().toString(36).substring(2, 10).toUpperCase();
            const fechaExpiracion = new Date();
            fechaExpiracion.setDate(fechaExpiracion.getDate() + 7); // 7 días de validez
            
            // 2. Crear documento del trabajador en Firestore
            const trabajadorData = {
                nombre: nombre.trim(),
                curp: curp.trim().toUpperCase(),
                puesto: puesto.trim(),
                email: email.trim(),
                empresaId: this.empresaActual?.id || null,
                codigoAcceso: codigoAcceso,
                fechaExpiracionCodigo: firebase.firestore.Timestamp.fromDate(fechaExpiracion),
                estado: 'activo',
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await this.db.collection('trabajadores').add(trabajadorData);
            const trabajadorId = docRef.id;
            
            // 3. Crear enlace único
            const baseUrl = window.location.origin + window.location.pathname;
            const enlace = `${baseUrl}?access=${trabajadorId}&code=${codigoAcceso}`;
            
            // 4. Guardar en localStorage también (backup local)
            const trabajadores = MultiUsuario.getTrabajadores();
            trabajadores.push({
                id: trabajadorId,
                nombre: nombre.trim(),
                curp: curp.trim().toUpperCase(),
                puesto: puesto.trim(),
                email: email.trim(),
                fecha_registro: new Date().toISOString(),
                estado: 'activo'
            });
            localStorage.setItem('rayoshield_trabajadores', JSON.stringify(trabajadores));
            
            console.log('✅ Enlace generado:', enlace);
            
            return {
                success: true,
                enlace: enlace,
                codigo: codigoAcceso,
                trabajadorId: trabajadorId,
                expira: fechaExpiracion.toLocaleDateString('es-MX')
            };
            
        } catch(error) {
            console.error('❌ Error generando enlace:', error);
            alert('Error al generar el enlace: ' + error.message);
            return null;
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // 🔐 VALIDAR ENLACE DE ACCESO (MEJORA CLAVE)
    // ─────────────────────────────────────────────────────────────────
    verificarEnlaceAcceso: async function() {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const trabajadorId = urlParams.get('access');
        const codigo = urlParams.get('code');
        
        if (!trabajadorId || !codigo) return false;
        
        console.log('🔍 Verificando enlace de acceso...');
        
        // Limpiar URL para no re-procesar
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (!this.firebaseListo) {
            alert('❌ Firebase no disponible. No se puede validar el acceso.');
            return false;
        }
        
        try {
            // Buscar trabajador en Firestore
            const docRef = this.db.collection('trabajadores').doc(trabajadorId);
            const doc = await docRef.get();
            
            if (!doc.exists) {
                alert('❌ Enlace inválido: Trabajador no encontrado.');
                return false;
            }
            
            const data = doc.data();
            
            // Verificar código
            if (data.codigoAcceso !== codigo) {
                alert('❌ Enlace inválido: Código de acceso incorrecto.');
                return false;
            }
            
            // Verificar expiración
            if (data.fechaExpiracionCodigo?.toDate() < new Date()) {
                alert('❌ Enlace expirado. Solicita uno nuevo al administrador.');
                return false;
            }
            
            // Verificar estado
            if (data.estado !== 'activo') {
                alert('❌ Cuenta inactiva. Contacta al administrador.');
                return false;
            }
            
            // ✅ TODO OK - Autenticar anónimamente
            if (!this.currentUser) {
                const userCred = await this.auth.signInAnonymously();
                console.log('✅ Autenticación anónima exitosa:', userCred.user.uid);
            }
            
            // Guardar sesión del trabajador
            const trabajadorInfo = {
                id: trabajadorId,
                uid: this.currentUser?.uid,
                nombre: data.nombre,
                curp: data.curp,
                puesto: data.puesto,
                empresaId: data.empresaId
            };
            localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(trabajadorInfo));
            
            // Cambiar modo a trabajador
            this.modoActual = 'trabajador';
            
            // Cargar datos del trabajador como userData
            this.userData = {
                empresa: data.empresaId || '',
                nombre: data.nombre,
                curp: data.curp,
                puesto: data.puesto
            };
            this.guardarDatosUsuario();
            
            alert(`✅ Bienvenido ${data.nombre}\n\nHas accedido correctamente a la plataforma.`);
            this.actualizarUI();
            this.actualizarUIMenuPorRol();
            this.mostrarPantalla('home-screen');
            
            return true;
            
        } catch(error) {
            console.error('❌ Error validando enlace:', error);
            alert('Error al validar el acceso: ' + error.message);
            return false;
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // 👷 GESTIÓN DE TRABAJADORES (Admin)
    // ─────────────────────────────────────────────────────────────────
    mostrarPanelGenerarEnlace: function() {
        if (!this.isAdmin && !this.verificarPasswordAdmin()) {
            alert('⚠️ Solo administradores pueden generar enlaces.');
            return;
        }
        
        const modalHtml = `
            <div id="modal-generar-enlace" class="modal active" style="display:flex;">
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <div class="modal-title">🔗 Generar Enlace para Trabajador</div>
                        <button class="modal-close" onclick="document.getElementById('modal-generar-enlace').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>👤 Nombre Completo *</label>
                            <input type="text" id="invite-nombre" class="df-input" placeholder="Ej: Juan Pérez García">
                        </div>
                        <div class="form-group">
                            <label>🆔 CURP *</label>
                            <input type="text" id="invite-curp" class="df-input" placeholder="PEPJ850101HDFRRR09" style="text-transform:uppercase">
                        </div>
                        <div class="form-group">
                            <label>💼 Puesto *</label>
                            <input type="text" id="invite-puesto" class="df-input" placeholder="Ej: Técnico Eléctrico">
                        </div>
                        <div class="form-group">
                            <label>📧 Email (opcional)</label>
                            <input type="email" id="invite-email" class="df-input" placeholder="juan@empresa.com">
                        </div>
                        <div id="enlace-generado" style="display:none; margin-top:15px; padding:12px; background:var(--green-l); border-radius:8px;">
                            <strong>✅ Enlace generado (válido por 7 días):</strong><br>
                            <code id="link-code" style="word-break:break-all; font-size:12px;"></code>
                            <div style="display:flex; gap:10px; margin-top:10px;">
                                <button onclick="app.copiarEnlace()" class="btn btn-secondary" style="flex:1;">📋 Copiar</button>
                                <button onclick="app.enviarPorWhatsApp()" class="btn btn-primary" style="flex:1;">📱 Enviar WhatsApp</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="document.getElementById('modal-generar-enlace').remove()" class="topbar-btn ghost">Cancelar</button>
                        <button onclick="app.ejecutarGenerarEnlace()" class="topbar-btn primary">🔗 Generar Enlace</button>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal existente si hay
        const existing = document.getElementById('modal-generar-enlace');
        if (existing) existing.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },
    
    ejecutarGenerarEnlace: async function() {
        const nombre = document.getElementById('invite-nombre')?.value.trim();
        const curp = document.getElementById('invite-curp')?.value.trim();
        const puesto = document.getElementById('invite-puesto')?.value.trim();
        const email = document.getElementById('invite-email')?.value.trim();
        
        if (!nombre || !curp || !puesto) {
            alert('⚠️ Completa todos los campos obligatorios (*)');
            return;
        }
        
        const btn = event.target;
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Generando...';
        
        const resultado = await this.generarEnlaceTrabajador(nombre, curp, puesto, email);
        
        btn.disabled = false;
        btn.textContent = originalText;
        
        if (resultado && resultado.success) {
            document.getElementById('enlace-generado').style.display = 'block';
            document.getElementById('link-code').textContent = resultado.enlace;
            
            // Guardar referencia para copiar
            this._ultimoEnlace = resultado.enlace;
        }
    },
    
    copiarEnlace: function() {
        if (this._ultimoEnlace) {
            navigator.clipboard.writeText(this._ultimoEnlace);
            alert('✅ Enlace copiado al portapapeles');
        }
    },
    
    enviarPorWhatsApp: function() {
        if (this._ultimoEnlace) {
            const texto = `📋 *RayoShield Exam* - Acceso a plataforma\n\nHaz clic en el siguiente enlace para realizar tus exámenes:\n\n${this._ultimoEnlace}\n\nEste enlace es personal e intransferible. Válido por 7 días.`;
            window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // 📊 GUARDAR RESULTADOS EN FIREBASE (Sincronización)
    // ─────────────────────────────────────────────────────────────────
    guardarResultadoFirebase: async function(resultado) {
        if (!this.firebaseListo) return;
        
        const t = this.obtenerTrabajadorActual();
        if (!t) return;
        
        try {
            await this.db.collection('resultados').add({
                trabajadorId: t.id,
                trabajadorNombre: t.nombre,
                trabajadorCurp: t.curp,
                empresaId: this.empresaActual?.id || t.empresaId,
                tipo: resultado.tipo || 'examen',
                actividad: resultado.actividad || 'Examen',
                puntaje: resultado.puntaje || resultado.score || 0,
                aprobado: resultado.aprobado || false,
                fecha: new Date().toISOString(),
                fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Resultado sincronizado con Firebase');
        } catch(e) {
            console.warn('⚠️ Sin conexión, guardando en cola:', e);
            this.colaSincronizacion.push(resultado);
            localStorage.setItem('rayoshield_cola_sync', JSON.stringify(this.colaSincronizacion));
        }
    },
    
    sincronizarPendientes: async function() {
        if (!this.firebaseListo) return;
        
        const pendientes = JSON.parse(localStorage.getItem('rayoshield_cola_sync') || '[]');
        if (pendientes.length === 0) return;
        
        console.log(`🔄 Sincronizando ${pendientes.length} resultados pendientes...`);
        
        for (const item of pendientes) {
            await this.guardarResultadoFirebase(item);
        }
        
        localStorage.removeItem('rayoshield_cola_sync');
        this.colaSincronizacion = [];
    },
    
    obtenerTrabajadorActual: function() {
        const local = JSON.parse(localStorage.getItem('rayoshield_trabajador_actual') || 'null');
        return local;
    },

    // ─────────────────────────────────────────────────────────────────
    // 📋 GUARDAR EN HISTORIAL (con Firebase)
    // ─────────────────────────────────────────────────────────────────
    guardarEnHistorial: function() {
        const hist = this.obtenerHistorial();
        const t = this.obtenerTrabajadorActual();
        
        const entrada = {
            examen: this.examenActual?.titulo || 'Desconocido',
            norma: this.examenActual?.norma || '',
            score: this.resultadoActual?.score || 0,
            estado: this.resultadoActual?.estado || '',
            fecha: new Date().toISOString(),
            usuario: t ? t.nombre : this.userData.nombre,
            tipoUsuario: t ? 'trabajador' : 'admin',
            trabajadorId: t?.id || null
        };
        
        hist.push(entrada);
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
        
        // Guardar en Firebase
        if (this.resultadoActual) {
            this.guardarResultadoFirebase({
                tipo: 'examen',
                actividad: this.examenActual?.titulo,
                puntaje: this.resultadoActual.score,
                aprobado: this.resultadoActual.estado === 'Aprobado'
            });
        }
    },

    // ─────────────────────────────────────────────────────────────────
    // 👁️ PERMISOS POR ROL
    // ─────────────────────────────────────────────────────────────────
    puedeVer: function(seccion) {
        const esAdmin = this.isAdmin || this.modoActual === 'admin';
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
    
    esAdmin: function() {
        return this.isAdmin || this.modoActual === 'admin';
    },
    
    esTrabajador: function() {
        return this.modoActual === 'trabajador' && this.obtenerTrabajadorActual() !== null;
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

    // ─────────────────────────────────────────────────────────────────
    // NAVEGACIÓN Y PANTALLAS
    // ─────────────────────────────────────────────────────────────────
    mostrarPantalla: function(id) {
        const restringidas = ['license-screen', 'trabajadores-screen', 'info-screen'];
        if (this.esTrabajador() && restringidas.includes(id)) {
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
        localStorage.setItem('rayoshield_usuario', JSON.stringify(this.userData));
        alert('Datos guardados');
        this.volverHome();
    },
    
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
    
    cargarHistorial: function() {
        console.log('Historial:', this.obtenerHistorial().length);
    },
    
    cargarExamenGuardado: function() {
        try {
            const s = localStorage.getItem('rayoshield_progreso');
            if (s) this.examenGuardado = JSON.parse(s);
        } catch(e) {}
    },
    
    obtenerHistorial: function() {
        try {
            const h = localStorage.getItem('rayoshield_historial');
            return h ? JSON.parse(h) : [];
        } catch(e) { return []; }
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
        
        if (typeof CATEGORIAS !== 'undefined') {
            CATEGORIAS.forEach(cat => {
                const div = document.createElement('div');
                div.className = 'exam-item';
                div.innerHTML = `<h4>${cat.icono} ${cat.nombre}</h4><p>${cat.norma}</p><small>${cat.descripcion}</small>`;
                div.onclick = () => self.mostrarNiveles(cat);
                container.appendChild(div);
            });
        }
        
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
        if (typeof cargarExamen !== 'function') {
            alert('Error: Función cargarExamen no definida');
            return;
        }
        cargarExamen(examId).then(exam => {
            self.examenActual = exam;
            self.respuestasUsuario = [];
            self.preguntaActual = 0;
            self.resultadoActual = null;
            self.respuestaTemporal = null;
            const titleEl = document.getElementById('exam-title');
            const normaEl = document.getElementById('exam-norma');
            if (titleEl) titleEl.textContent = exam.titulo;
            if (normaEl) normaEl.textContent = exam.norma;
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
        const progressText = document.getElementById('progress-text');
        if (progressText) progressText.textContent = `Pregunta ${this.preguntaActual + 1} de ${total}`;
        const questionText = document.getElementById('question-text');
        if (questionText) questionText.textContent = p.texto;
        
        const container = document.getElementById('options-container');
        if (!container) return;
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
        if (typeof calcularResultado !== 'function') {
            alert('Error: Función calcularResultado no definida');
            return;
        }
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        
        const scoreEl = document.getElementById('score-number');
        const aciertosEl = document.getElementById('aciertos');
        const totalEl = document.getElementById('total');
        const minEl = document.getElementById('min-score');
        const statusEl = document.getElementById('result-status');
        const btnCert = document.getElementById('btn-certificado');
        
        if (scoreEl) scoreEl.textContent = this.resultadoActual.score + '%';
        if (aciertosEl) aciertosEl.textContent = this.resultadoActual.aciertos;
        if (totalEl) totalEl.textContent = this.resultadoActual.total;
        if (minEl) minEl.textContent = this.resultadoActual.minScore;
        if (statusEl) statusEl.textContent = this.resultadoActual.estado;
        if (btnCert) btnCert.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
        
        this.mostrarPantalla('result-screen');
        this.guardarEnHistorial();
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
        const t = this.obtenerTrabajadorActual();
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
            const features = this.licencia.features || {};
            if (caso.nivel === 'basico' && features.casosBasicos) tieneAcceso = true;
            else if (caso.nivel === 'master' && features.casosMaster) tieneAcceso = true;
            else if (caso.nivel === 'elite' && features.casosElite) tieneAcceso = true;
            else if (caso.nivel === 'pericial' && features.casosPericial) tieneAcceso = true;
            
            if (tieneAcceso) {
                if (this.licencia.tipo === 'DEMO' && mostrados >= maxDemo) return;
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
        if (typeof cargarCasoInvestigacion !== 'function') {
            alert('Error: Función cargarCasoInvestigacion no definida');
            return;
        }
        const caso = await cargarCasoInvestigacion(casoId);
        if (!caso) {
            alert('Error cargando caso');
            return;
        }
        this.casoActual = caso;
        this.respuestasCaso = {};
        
        document.getElementById('casos-list').style.display = 'none';
        document.getElementById('caso-detalle').style.display = 'block';
        this.iniciarTimerCaso();
        
        // Render simplificado
        const preguntasDiv = document.getElementById('caso-preguntas');
        if (preguntasDiv) preguntasDiv.innerHTML = '<p>Cargando preguntas...</p>';
        document.getElementById('btn-enviar-caso').style.display = 'inline-block';
    },
    
    iniciarTimerCaso: function() {
        this.tiempoCasoInicio = Date.now();
        this.tiempoCasoRestante = this.tiempoCasoLimite;
        const self = this;
        
        this.timerCaso = setInterval(function() {
            self.tiempoCasoRestante = self.tiempoCasoLimite - (Date.now() - self.tiempoCasoInicio);
            if (self.tiempoCasoRestante <= 0) {
                clearInterval(self.timerCaso);
                self.timerCaso = null;
                alert('Tiempo agotado');
                self.enviarRespuestasCaso();
            }
        }, 1000);
    },
    
    detenerTimerCaso: function() {
        if (this.timerCaso) {
            clearInterval(this.timerCaso);
            this.timerCaso = null;
        }
    },
    
    enviarRespuestasCaso: function() {
        if (!this.casoActual) return;
        // Evaluación simulada
        this.resultadoCaso = { aprobado: true, porcentaje: 85 };
        this.mostrarResultadoCaso(this.resultadoCaso);
    },
    
    mostrarResultadoCaso: function(resultado) {
        const resultadoEl = document.getElementById('caso-resultado');
        if (!resultadoEl) return;
        resultadoEl.style.display = 'block';
        resultadoEl.innerHTML = `<div style="padding:20px;text-align:center;"><h2>${resultado.aprobado ? '✅ APROBADO' : '❌ REPROBADO'}</h2><div style="font-size:48px;">${resultado.porcentaje}%</div></div>`;
        document.getElementById('btn-enviar-caso').style.display = 'none';
        this.detenerTimerCaso();
        
        if (resultado.aprobado) {
            this.guardarResultadoFirebase({
                tipo: 'caso',
                actividad: this.casoActual?.titulo,
                puntaje: resultado.porcentaje,
                aprobado: true
            });
        }
    },
    
    volverAListaCasos: function() {
        this.detenerTimerCaso();
        document.getElementById('casos-list').style.display = 'block';
        document.getElementById('caso-detalle').style.display = 'none';
        document.getElementById('caso-resultado').style.display = 'none';
        this.casoActual = null;
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
        if (!this.licencia.features) this.licencia.features = {};
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
    
    activarLicencia: function() {
        const idEl = document.getElementById('license-id');
        const keyEl = document.getElementById('license-key');
        const clienteId = idEl?.value.trim().toUpperCase() || '';
        const clave = keyEl?.value.trim().toUpperCase() || '';
        if (!clienteId || !clave) { alert('Ingresa ID y clave'); return; }
        
        const licencias = {
            'RS-PKDF-9826-A1B2': { tipo: 'PROFESIONAL', duracion: 365, features: { casosBasicos: true, casosMaster: true } },
            'RS-COZS-2XT6-C3D4': { tipo: 'CONSULTOR', duracion: 365, features: { casosBasicos: true, casosMaster: true, casosElite: true, insignias: true } },
            'RS-EVP4-Y02I-E5F6': { tipo: 'EMPRESARIAL', duracion: 365, features: { whiteLabel: true, predictivo: true, multiUsuario: 50 } }
        };
        const data = licencias[clave];
        if (!data) { alert('Clave inválida'); return; }
        
        const expiracion = new Date();
        expiracion.setDate(expiracion.getDate() + data.duracion);
        this.licencia = {
            tipo: data.tipo,
            clave: clave,
            clienteId: clienteId,
            expiracion: expiracion.toISOString(),
            examenesRestantes: 9999,
            features: data.features
        };
        this.guardarLicencia();
        alert(`✅ Licencia ${data.tipo} activada`);
        location.reload();
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

    // ─────────────────────────────────────────────────────────────────
    // UI y RENDERIZADO
    // ─────────────────────────────────────────────────────────────────
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
        }
        
        this.actualizarLicenciaUI();
        this.actualizarBadgeTrabajadores();
        this.actualizarSidebarModoIndicador();
        this.actualizarUIMenuPorRol();
    },
    
    actualizarUIMenuPorRol: function() {
        const esTrabajador = this.esTrabajador();
        const adminElements = ['.nav-item[onclick*="mostrarTrabajadores"]', '.nav-item[onclick*="mostrarLicencia"]', '.nav-item[onclick*="mostrarInfo"]'];
        adminElements.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = esTrabajador ? 'none' : '';
        });
        
        const btnVolver = document.getElementById('btn-volver-admin');
        if (btnVolver) btnVolver.style.display = esTrabajador ? 'block' : 'none';
        
        const topbarSub = document.getElementById('topbar-sub');
        const t = this.obtenerTrabajadorActual();
        if (topbarSub) {
            if (t) topbarSub.textContent = `👷 ${t.nombre} • ${t.puesto}`;
            else topbarSub.textContent = 'Plataforma de certificación';
        }
    },
    
    actualizarSidebarModoIndicador: function() {
        const btnVolver = document.getElementById('btn-volver-admin');
        const t = this.obtenerTrabajadorActual();
        if (btnVolver) btnVolver.style.display = t ? 'block' : 'none';
    },
    
    actualizarBadgeTrabajadores: function() {
        const badge = document.getElementById('nav-badge-trabajadores');
        if (badge && typeof MultiUsuario !== 'undefined') {
            const count = MultiUsuario.getTrabajadores().length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    },
    
    actualizarPerfil: function() {
        const nombreEl = document.getElementById('perfil-nombre');
        if (nombreEl) nombreEl.textContent = this.userData.nombre || 'Usuario';
        const nombreInput = document.getElementById('perfil-nombre-input');
        if (nombreInput) nombreInput.value = this.userData.nombre || '';
        const empresaInput = document.getElementById('perfil-empresa-input');
        if (empresaInput) empresaInput.value = this.userData.empresa || '';
        const puestoInput = document.getElementById('perfil-puesto-input');
        if (puestoInput) puestoInput.value = this.userData.puesto || '';
        const curpInput = document.getElementById('perfil-curp-input');
        if (curpInput) curpInput.value = this.userData.curp || '';
        
        const hist = this.obtenerHistorial();
        const promedio = hist.length ? Math.round(hist.reduce((a,b) => a + b.score, 0) / hist.length) : 0;
        const perfPromedio = document.getElementById('perf-promedio');
        if (perfPromedio) perfPromedio.textContent = promedio + '%';
        const perfExamenes = document.getElementById('perf-examenes');
        if (perfExamenes) perfExamenes.textContent = hist.length;
    },
    
    editarPerfil: function() {
        this.mostrarDatosUsuario();
    },
    
    renderTrabajadores: function() {
        if (typeof MultiUsuario === 'undefined') return;
        const tbody = document.getElementById('trabajadores-tabla');
        if (!tbody) return;
        
        const trabajadores = MultiUsuario.getTrabajadores();
        if (trabajadores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">Sin trabajadores</td></tr>';
            return;
        }
        
        tbody.innerHTML = trabajadores.map(t => {
            const prog = MultiUsuario.getProgresoByTrabajador(t.id);
            return `<tr>
                <td style="padding:12px;"><strong>${t.nombre}</strong><br><small>${t.curp}</small></td>
                <td style="padding:12px;">${t.puesto || '-'}</td>
                <td style="padding:12px;">${prog.total_examenes} exámenes<br><small>${prog.total_casos} casos</small></td>
                <td style="padding:12px;">${prog.promedio}%</td>
                <td style="padding:12px;"><span class="${t.estado === 'activo' ? 'status-ok' : 'status-pend'}">${t.estado}</span></td>
                <td style="padding:12px;">
                    <button class="tbl-btn view" onclick="app.verProgresoTrabajador('${t.id}')">📊</button>
                    <button class="tbl-btn" onclick="app.editarTrabajador('${t.id}')">✏️</button>
                    <button class="tbl-btn" onclick="app.eliminarTrabajador('${t.id}')">🗑️</button>
                </td>
             </tr>`;
        }).join('');
    },
    
    verProgresoTrabajador: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        const prog = MultiUsuario.getProgresoByTrabajador(id);
        alert(`📊 ${t.nombre}\nExámenes: ${prog.total_examenes}\nPromedio: ${prog.promedio}%\nCasos: ${prog.total_casos}`);
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
        if (confirm('¿Eliminar este trabajador?')) {
            MultiUsuario.deleteTrabajador(id);
            this.renderTrabajadores();
            this.actualizarBadgeTrabajadores();
        }
    },
    
    renderHistorial: function() {
        const container = document.getElementById('history-list');
        if (!container) return;
        const hist = this.obtenerHistorial();
        if (hist.length === 0) {
            container.innerHTML = '<p>Sin registros</p>';
            return;
        }
        container.innerHTML = `<table style="width:100%">${hist.slice(-20).reverse().map(h => `<tr><td>${new Date(h.fecha).toLocaleDateString()}</td><td>${h.usuario}</td><td>${h.examen}</td><td>${h.score}%</td><td>${h.estado}</td></tr>`).join('')}</table>`;
    },
    
    llenarFiltroTrabajadoresHistorial: function() {
        const select = document.getElementById('historial-filtro-trabajador');
        if (!select) return;
        select.innerHTML = '<option value="todos">Todos</option><option value="admin">Admin</option>';
        if (typeof MultiUsuario !== 'undefined') {
            MultiUsuario.getTrabajadores().forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.nombre;
                select.appendChild(opt);
            });
        }
    },
    
    exportarHistorialPDF: function() {
        const hist = this.obtenerHistorial();
        if (hist.length === 0) { alert('No hay datos'); return; }
        let html = `<html><head><title>Historial</title></head><body><h1>Historial</h1><table border="1"><tr><th>Fecha</th><th>Usuario</th><th>Examen</th><th>Puntaje</th></tr>`;
        hist.forEach(h => { html += `<tr><td>${new Date(h.fecha).toLocaleDateString()}</td><td>${h.usuario}</td><td>${h.examen}</td><td>${h.score}%</td></tr>`; });
        html += `</table></body></html>`;
        const win = window.open();
        win.document.write(html);
        win.print();
    },
    
    volverAModoAdmin: function() {
        if (this.verificarPasswordAdmin()) {
            localStorage.removeItem('rayoshield_trabajador_actual');
            this.modoActual = 'admin';
            this.userData = { empresa: '', nombre: '', curp: '', puesto: '' };
            this.actualizarUI();
            this.actualizarUIMenuPorRol();
            alert('Modo administrador');
            location.reload();
        }
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
    
    toggleTema: function() {
        document.body.classList.toggle('tema-claro');
        localStorage.setItem('rayoshield_tema', document.body.classList.contains('tema-claro') ? 'claro' : 'oscuro');
    },
    
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
        } else {
            alert('Usa el menú del navegador');
        }
    },
    
    cerrarSesion: function() {
        if (confirm('¿Cerrar sesión?')) {
            if (this.firebaseListo && this.auth) this.auth.signOut();
            localStorage.clear();
            location.reload();
        }
    },
    
    exportarDatos: function() { alert('Disponible en planes PRO'); },
    importarDatos: function() { alert('Disponible en planes PRO'); },
    limpiarDatosConfirmar: function() {
        if (confirm('¿Borrar todo?') && prompt('Escribe "BORRAR"') === 'BORRAR') {
            localStorage.clear();
            location.reload();
        }
    },
    exportarTodoAFirebase: function() { alert('Función en desarrollo'); },
    importarTodoDeFirebase: function() { alert('Función en desarrollo'); },
    guardarTrabajadorFirebase: function() {},
    eliminarTrabajadorFirebase: function() {},
    escucharCambiosTrabajadores: function() {},
    cargarTrabajadoresFirebase: function() { return Promise.resolve([]); },
    cargarResultadosFirebase: function() { return Promise.resolve([]); }
};

// ═══════════════════════════════════════════════════════════════
// MULTIUSUARIO (Backup Local)
// ═══════════════════════════════════════════════════════════════
const MultiUsuario = {
    init: function() {
        if (!localStorage.getItem('rayoshield_trabajadores')) localStorage.setItem('rayoshield_trabajadores', JSON.stringify([]));
        if (!localStorage.getItem('rayoshield_resultados')) localStorage.setItem('rayoshield_resultados', JSON.stringify([]));
        if (!localStorage.getItem('rayoshield_trabajador_actual')) localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(null));
    },
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
        return {
            total_examenes: examenes.length,
            promedio: examenes.length ? Math.round(examenes.reduce((a, b) => a + b.puntaje, 0) / examenes.length) : 0,
            total_casos: resultados.filter(r => r.tipo === 'caso').length
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
