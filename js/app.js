// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - app.js (VERSIÓN FINAL v4.3 - COMPLETA)
// Guardar con codificación UTF-8
// ─────────────────────────────────────────────────────────────────────

const app = {
    // Estado
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    respuestaTemporal: null,
    
    // Usuario
    userData: { empresa: '', nombre: '', curp: '', puesto: '' },
    
    // Licencia
    licencia: { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3, features: {} },
    
    // Timer Examen
    timerExamen: null,
    tiempoLimite: 30 * 60 * 1000,
    tiempoInicio: null,
    tiempoRestante: null,
    
    // Timer Casos
    timerCaso: null,
    tiempoCasoLimite: 40 * 60 * 1000,
    tiempoCasoInicio: null,
    tiempoCasoRestante: null,
    
    // Progreso
    examenGuardado: null,
    
    // Casos
    casoActual: null,
    respuestasCaso: {},
    resultadoCaso: null,
    
    // PWA Install
    deferredPrompt: null,
    
    // ─────────────────────────────────────────────────────────────────────
    // INICIALIZACIÓN
    // ─────────────────────────────────────────────────────────────────────
    init: function() {
        console.log('RayoShield iniciado');
        this.cargarLicencia();
        
        // ✅ Inicializar features si están vacías o no existen
        if (!this.licencia.features || Object.keys(this.licencia.features).length === 0) {
            if (this.licencia.tipo === 'DEMO') {
                this.licencia.features = {
                    casosBasicos: true,
                    casosMaster: false,
                    casosElite: false,
                    casosPericial: false,
                    whiteLabel: false,
                    predictivo: false
                };
            } else if (this.licencia.tipo === 'PROFESIONAL') {
                this.licencia.features = {
                    casosBasicos: true,
                    casosMaster: true,
                    casosElite: false,
                    casosPericial: false,
                    whiteLabel: false,
                    predictivo: false,
                    insignias: false,
                    dashboard: false
                };
            } else if (this.licencia.tipo === 'CONSULTOR') {
                this.licencia.features = {
                    casosBasicos: true,
                    casosMaster: true,
                    casosElite: true,
                    casosPericial: false,
                    whiteLabel: false,
                    predictivo: false,
                    insignias: true,
                    dashboard: 'basico'
                };
            } else if (this.licencia.tipo === 'EMPRESARIAL') {
                this.licencia.features = {
                    casosBasicos: true,
                    casosMaster: true,
                    casosElite: true,
                    casosPericial: true,
                    whiteLabel: true,
                    predictivo: true,
                    insignias: true,
                    dashboard: 'predictivo',
                    multiUsuario: 50
                };
            }
            this.guardarLicencia();
        }
        
        this.cargarDatosUsuario();
        this.cargarHistorial();
        this.cargarExamenGuardado();
        this.initPWAInstall();
        this.actualizarUI();
        this.mostrarPantalla('home-screen');
        this.verificarExpiracionLicencia();
    },
    
    mostrarPantalla: function(id) {
        if (this.timerExamen && id !== 'exam-screen') {
            clearInterval(this.timerExamen);
            this.timerExamen = null;
        }
        document.querySelectorAll('.screen').forEach(function(s) {
            s.classList.remove('active');
        });
        var screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ACTUALIZAR UI
    // ─────────────────────────────────────────────────────────────────────
    actualizarUI: function() {
        var infoLic = document.getElementById('licencia-info');
        if (infoLic) {
            if (this.licencia.tipo === 'DEMO') {
                infoLic.textContent = '📋 DEMO: ' + this.licencia.examenesRestantes + '/3 hoy';
                infoLic.style.color = '#FF9800';
            } else {
                var exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : '∞';
                infoLic.textContent = '✅ ' + this.licencia.tipo + ': ' + this.licencia.clienteId + ' (exp: ' + exp + ')';
                infoLic.style.color = '#4CAF50';
            }
        }
        
        var infoLicDetail = document.getElementById('licencia-info-detail');
        if (infoLicDetail) {
            if (this.licencia.tipo === 'DEMO') {
                infoLicDetail.textContent = '📋 Licencia DEMO - ' + this.licencia.examenesRestantes + ' exámenes hoy';
            } else {
                var exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : 'Sin expiración';
                infoLicDetail.textContent = '✅ ' + this.licencia.tipo + '\nCliente: ' + this.licencia.clienteId + '\nVálido hasta: ' + exp;
            }
        }
        
        var infoUser = document.getElementById('usuario-info');
        if (infoUser && this.userData.nombre) {
            infoUser.innerHTML = '<strong>👤 ' + this.userData.nombre + '</strong><br>' + (this.userData.empresa || '') + ' • ' + (this.userData.puesto || '');
        }
        
        var btnExamen = document.getElementById('btn-comenzar');
        if (btnExamen) {
            var datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
            btnExamen.disabled = !datosOk;
            btnExamen.style.opacity = datosOk ? '1' : '0.5';
        }
        
        var btnCasosMaster = document.getElementById('btn-casos-master');
        if (btnCasosMaster) {
            // ✅ TODOS los planes tienen acceso a casos (al menos 1 básico)
            btnCasosMaster.style.display = 'inline-block';
        }
        
        var btnWhiteLabel = document.getElementById('btn-white-label');
        if (btnWhiteLabel) {
            if (this.licencia.features && this.licencia.features.whiteLabel) {
                btnWhiteLabel.style.display = 'inline-block';
            } else {
                btnWhiteLabel.style.display = 'none';
            }
        }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // LICENCIAS
    // ─────────────────────────────────────────────────────────────────────
    cargarLicencia: function() {
        try {
            var s = localStorage.getItem('rayoshield_licencia');
            if (s) {
                var parsed = JSON.parse(s);
                if (parsed.tipo && parsed.clave !== undefined && parsed.clienteId !== undefined) {
                    this.licencia = parsed;
                }
            }
        } catch(e) { console.log('Licencia por defecto: DEMO'); }
    },
    
    guardarLicencia: function() {
        localStorage.setItem('rayoshield_licencia', JSON.stringify(this.licencia));
        this.actualizarUI();
    },
    
    verificarExpiracionLicencia: function() {
        if (this.licencia.expiracion && this.licencia.tipo !== 'DEMO') {
            var ahora = new Date();
            var expiracion = new Date(this.licencia.expiracion);
            if (ahora > expiracion) {
                console.log('Licencia expirada');
                this.licencia = { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3, features: {} };
                this.guardarLicencia();
                alert('⚠️ Tu licencia ha expirada.\nHas vuelto a la versión DEMO.');
            }
        }
    },
    
    validarLicencia: function(clienteId, clave) {
        if (!/^RS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(clave)) {
            return Promise.resolve({ valido: false, error: 'Formato: RS-XXXX-YYYY-ZZZZ' });
        }
        if (!/^[A-Z0-9_-]{5,}$/i.test(clienteId)) {
            return Promise.resolve({ valido: false, error: 'ID: mínimo 5 caracteres' });
        }
        
        var licenciasValidas = {
            // PLAN DEMO
            'RS-DEMO-2026-DEMO': {
                clienteId: 'DEMO_USER',
                tipo: 'DEMO',
                duracion: 1,
                features: {
                    whiteLabel: false,
                    predictivo: false,
                    auditoria: false,
                    casosBasicos: true,
                    casosMaster: false,
                    casosElite: false,
                    casosPericial: false
                }
            },
            // PLAN PROFESIONAL
            'RS-PROF-2026-A1B2': {
                clienteId: 'PROFESIONAL_001',
                tipo: 'PROFESIONAL',
                duracion: 30,
                features: {
                    whiteLabel: false,
                    predictivo: false,
                    auditoria: false,
                    casosBasicos: true,
                    casosMaster: true,
                    casosElite: false,
                    casosPericial: false,
                    insignias: false,
                    dashboard: false
                }
            },
            // PLAN CONSULTOR
            'RS-CONS-2026-C3D4': {
                clienteId: 'CONSULTOR_001',
                tipo: 'CONSULTOR',
                duracion: 30,
                features: {
                    whiteLabel: false,
                    predictivo: false,
                    auditoria: false,
                    casosBasicos: true,
                    casosMaster: true,
                    casosElite: true,
                    casosPericial: false,
                    insignias: true,
                    dashboard: 'basico'
                }
            },
            // PLAN EMPRESARIAL
            'RS-EMPR-2026-E5F6': {
                clienteId: 'EMPRESARIAL_001',
                tipo: 'EMPRESARIAL',
                duracion: 30,
                features: {
                    whiteLabel: true,
                    predictivo: true,
                    auditoria: false,
                    casosBasicos: true,
                    casosMaster: true,
                    casosElite: true,
                    casosPericial: true,
                    insignias: true,
                    dashboard: 'predictivo',
                    multiUsuario: 50
                }
            }
        };
        
        var licenciaData = licenciasValidas[clave.toUpperCase()];
        if (!licenciaData) {
            return Promise.resolve({ valido: false, error: 'Clave inválida' });
        }
        if (licenciaData.clienteId.toUpperCase() !== clienteId.toUpperCase()) {
            return Promise.resolve({ valido: false, error: 'ID no coincide con esta clave' });
        }
        
        var expiracion = new Date();
        expiracion.setDate(expiracion.getDate() + licenciaData.duracion);
        
        return Promise.resolve({
            valido: true,
            tipo: licenciaData.tipo,
            clienteId: licenciaData.clienteId,
            expiracion: expiracion.toISOString(),
            features: licenciaData.features
        });
    },
    
    activarLicencia: function() {
        var self = this;
        var idEl = document.getElementById('license-id');
        var keyEl = document.getElementById('license-key');
        var clienteId = idEl ? idEl.value.trim().toUpperCase() : '';
        var clave = keyEl ? keyEl.value.trim().toUpperCase() : '';
        
        if (!clienteId || !clave) { alert('⚠️ Ingresa ID y clave'); return; }
        
        if (this.licencia.tipo !== 'DEMO' && this.licencia.expiracion) {
            var hoy = new Date();
            var vence = new Date(this.licencia.expiracion);
            if (hoy < vence) {
                if (this.licencia.clave === clave) {
                    alert('✅ Esta licencia ya está activa.\nVence: ' + vence.toLocaleDateString('es-MX'));
                    return;
                } else {
                    var confirmar = confirm('⚠️ Ya tienes una licencia activa hasta ' + vence.toLocaleDateString('es-MX') + '.\n¿Continuar?');
                    if (!confirmar) return;
                }
            }
        }
        
        var btn = document.querySelector('#license-screen .btn-primary');
        if (btn) { btn.disabled = true; btn.textContent = '⏳ Validando...'; }
        
        this.validarLicencia(clienteId, clave).then(function(res) {
            if (btn) { btn.disabled = false; btn.textContent = '🔓 Activar Licencia'; }
            
            if (res.valido) {
                self.licencia = {
                    tipo: res.tipo,
                    clave: clave,
                    clienteId: res.clienteId,
                    expiracion: res.expiracion,
                    examenesRestantes: 9999,
                    features: res.features || {}
                };
                self.guardarLicencia();
                
                // ✅ Verificar que features no esté vacío
                if (!self.licencia.features || Object.keys(self.licencia.features).length === 0) {
                    console.log('Features vacías, inicializando...');
                    localStorage.removeItem('rayoshield_licencia');
                    location.reload();
                    return;
                }
                
                if (res.features.whiteLabel) {
                    self.aplicarConfiguracionWhiteLabel();
                }
                
                var fecha = new Date(res.expiracion).toLocaleDateString('es-MX');
                alert('✅ Licencia ' + res.tipo + ' activada\nCliente: ' + res.clienteId + '\nVálida hasta: ' + fecha);
                
                if (idEl) idEl.value = '';
                if (keyEl) keyEl.value = '';
                self.actualizarUI();
            } else {
                alert('❌ ' + res.error);
            }
        });
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // DATOS DE USUARIO
    // ─────────────────────────────────────────────────────────────────────
    cargarDatosUsuario: function() {
        try { var s = localStorage.getItem('rayoshield_usuario'); if (s) this.userData = JSON.parse(s); } catch(e) {}
    },
    
    guardarDatosUsuario: function() {
        localStorage.setItem('rayoshield_usuario', JSON.stringify(this.userData));
        this.actualizarUI();
    },
    
    guardarDatosUsuarioForm: function() {
        var e = document.getElementById('user-empresa');
        var n = document.getElementById('user-nombre');
        var c = document.getElementById('user-curp');
        var p = document.getElementById('user-puesto');
        
        if (!e || !n || !c || !p) { alert('Error: campos no encontrados'); return; }
        
        var empresa = e.value.trim(), nombre = n.value.trim(), curp = c.value.trim().toUpperCase(), puesto = p.value.trim();
        
        if (!empresa || !nombre || !curp || !puesto) { alert('Completa todos los campos'); return; }
        
        this.userData = { empresa: empresa, nombre: nombre, curp: curp, puesto: puesto };
        this.guardarDatosUsuario();
        alert('Datos guardados');
        this.volverHome();
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // EXÁMENES
    // ─────────────────────────────────────────────────────────────────────
    verificarLicenciaExamen: function() {
        this.verificarExpiracionLicencia();
        if (this.licencia.tipo === 'DEMO' && this.licencia.examenesRestantes <= 0) { alert('Límite DEMO alcanzado'); return false; }
        return true;
    },
    
    consumirExamen: function() {
        if (this.licencia.tipo === 'DEMO') { this.licencia.examenesRestantes = Math.max(0, this.licencia.examenesRestantes - 1); this.guardarLicencia(); }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // NAVEGACIÓN EXÁMENES (MEJORADA)
    // ─────────────────────────────────────────────────────────────────────
    irASeleccionarExamen: function() {
        var self = this;
        var datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
        if (!datosOk) { 
            alert('Completa tus datos primero'); 
            this.mostrarDatosUsuario(); 
            return; 
        }
        if (!this.verificarLicenciaExamen()) return;
        
        var categoriasView = document.getElementById('categorias-view');
        var nivelesView = document.getElementById('niveles-view');
        var list = document.getElementById('categorias-list');
        
        if (categoriasView) categoriasView.style.display = 'block';
        if (nivelesView) nivelesView.style.display = 'none';
        
        if (!list) {
            console.error('❌ Elemento categorias-list no encontrado');
            return;
        }
        
        list.innerHTML = '';
        
        CATEGORIAS.forEach(function(cat) {
            var item = document.createElement('div');
            item.className = 'exam-item';
            item.innerHTML = '<h4>' + cat.icono + ' ' + cat.nombre + '</h4><p>' + cat.norma + '</p><small>' + cat.descripcion + '</small>';
            item.onclick = function() { self.mostrarNiveles(cat); };
            list.appendChild(item);
        });
        
        this.mostrarPantalla('select-exam-screen');
    },
    
    mostrarNiveles: function(categoria) {
        var self = this;
        var categoriasView = document.getElementById('categorias-view');
        var nivelesView = document.getElementById('niveles-view');
        var tituloEl = document.getElementById('categoria-titulo');
        var normaEl = document.getElementById('categoria-norma');
        var list = document.getElementById('niveles-list');
        
        if (categoriasView) categoriasView.style.display = 'none';
        if (nivelesView) nivelesView.style.display = 'block';
        
        if (tituloEl) tituloEl.textContent = categoria.icono + ' ' + categoria.nombre;
        if (normaEl) normaEl.textContent = categoria.norma;
        
        if (!list) {
            console.error('❌ Elemento niveles-list no encontrado');
            return;
        }
        
        list.innerHTML = '';
        
        categoria.niveles.forEach(function(nivel) {
            var item = document.createElement('div');
            item.className = 'nivel-item';
            item.innerHTML = '<div><h4>👤 ' + nivel.nombre + '</h4><p>Examen de ' + categoria.nombre.toLowerCase() + ' • ' + nivel.preguntas + ' preguntas</p></div>';
            item.onclick = function() { self.iniciarExamen(nivel.examId); };
            list.appendChild(item);
        });
    },

    
    volverACategorias: function() {
        document.getElementById('categorias-view').style.display = 'block';
        document.getElementById('niveles-view').style.display = 'none';
    },
    
    iniciarExamen: function(examId) {
        var self = this;
        cargarExamen(examId).then(function(exam) {
            self.examenActual = exam;
            self.respuestasUsuario = [];
            self.preguntaActual = 0;
            self.resultadoActual = null;
            self.respuestaTemporal = null;
            
            var t = document.getElementById('exam-title'), n = document.getElementById('exam-norma');
            if (t) t.textContent = exam.titulo;
            if (n) n.textContent = exam.norma;
            
            self.detenerTimer();
            self.iniciarTimerExamen();
            self.mostrarPantalla('exam-screen');
            self.mostrarPregunta();
            self.guardarExamenProgreso();
        }).catch(function() { alert('Error cargando examen'); });
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // MOSTRAR PREGUNTA (MEJORADA)
    // ─────────────────────────────────────────────────────────────────────
    mostrarPregunta: function() {
        if (!this.examenActual) return;
        
        var p = this.examenActual.preguntas[this.preguntaActual];
        var total = this.examenActual.preguntas.length;
        var progreso = ((this.preguntaActual + 1) / total) * 100;
        
        var bar = document.getElementById('progress-bar');
        var txt = document.getElementById('progress-text');
        var q = document.getElementById('question-text');
        var cont = document.getElementById('options-container');
        
        if (bar) bar.innerHTML = '<div class="progress-bar-fill" style="width:' + progreso + '%"></div>';
        if (txt) txt.textContent = 'Pregunta ' + (this.preguntaActual + 1) + ' de ' + total;
        if (q) q.textContent = p.texto;
        if (!cont) return;
        
        cont.innerHTML = '';
        var self = this;
        
        p.opciones.forEach(function(opt, idx) {
            var btn = document.createElement('button');
            btn.className = 'option-btn' + (self.respuestaTemporal === idx ? ' selected' : '');
            btn.innerHTML = '<strong style="margin-right:10px;">' + String.fromCharCode(65 + idx) + ')</strong> ' + opt;
            btn.onclick = function() { self.seleccionarRespuesta(idx); };
            cont.appendChild(btn);
        });
        
        if (this.respuestaTemporal !== null) {
            var btnC = document.createElement('button');
            btnC.className = 'btn-continuar';
            btnC.textContent = '➜ Continuar';
            btnC.onclick = function() { self.confirmarRespuesta(); };
            cont.appendChild(btnC);
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
    
    // ─────────────────────────────────────────────────────────────────────
    // TIMER EXAMEN
    // ─────────────────────────────────────────────────────────────────────
    iniciarTimerExamen: function() {
        var self = this;
        this.tiempoInicio = Date.now();
        this.tiempoRestante = this.tiempoLimite;
        
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
        var el = document.getElementById('exam-timer');
        if (!el) return;
        var min = Math.floor(this.tiempoRestante / 60000), seg = Math.floor((this.tiempoRestante % 60000) / 1000);
        el.textContent = min + ':' + (seg < 10 ? '0' : '') + seg;
        el.style.color = this.tiempoRestante <= 300000 ? '#f44336' : '#666';
    },
    
    detenerTimer: function() {
        if (this.timerExamen) { clearInterval(this.timerExamen); this.timerExamen = null; }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // TIMER CASOS MASTER
    // ─────────────────────────────────────────────────────────────────────
    iniciarTimerCaso: function() {
        var self = this;
        this.tiempoCasoInicio = Date.now();
        this.tiempoCasoRestante = (this.casoActual.metadatos_evaluacion && this.casoActual.metadatos_evaluacion.tiempo_estimado_minutos) ?
            this.casoActual.metadatos_evaluacion.tiempo_estimado_minutos * 60 * 1000 : this.tiempoCasoLimite;
        
        var timerEl = document.getElementById('caso-timer');
        if (!timerEl) {
            var casoDetalle = document.getElementById('caso-detalle');
            if (casoDetalle) {
                timerEl = document.createElement('div');
                timerEl.id = 'caso-timer';
                timerEl.style.cssText = 'text-align:center;font-size:24px;font-weight:bold;color:#666;margin:15px 0;padding:10px;background:#f5f5f5;border-radius:10px;';
                casoDetalle.insertBefore(timerEl, casoDetalle.firstChild);
            }
        }
        
        this.timerCaso = setInterval(function() {
            self.tiempoCasoRestante = self.tiempoCasoLimite - (Date.now() - self.tiempoCasoInicio);
            if (self.tiempoCasoRestante <= 0) {
                clearInterval(self.timerCaso);
                self.timerCaso = null;
                alert('⏰ Tiempo agotado. Tu caso se enviará automáticamente.');
                self.enviarRespuestasCaso();
                return;
            }
            self.actualizarTimerCasoUI();
        }, 1000);
    },
    
    actualizarTimerCasoUI: function() {
        var el = document.getElementById('caso-timer');
        if (!el) return;
        var min = Math.floor(this.tiempoCasoRestante / 60000);
        var seg = Math.floor((this.tiempoCasoRestante % 60000) / 1000);
        el.textContent = '⏱️ ' + min + ':' + (seg < 10 ? '0' : '') + seg;
        el.style.color = this.tiempoCasoRestante <= 300000 ? '#f44336' : '#666';
    },
    
    detenerTimerCaso: function() {
        if (this.timerCaso) {
            clearInterval(this.timerCaso);
            this.timerCaso = null;
        }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // PROGRESO GUARDADO
    // ─────────────────────────────────────────────────────────────────────
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
    
    cargarExamenGuardado: function() {
        try { var s = localStorage.getItem('rayoshield_progreso'); if (s) this.examenGuardado = JSON.parse(s); } catch(e) {}
    },
    
    restaurarExamenGuardado: function() {
        if (!this.examenGuardado) return;
        var self = this;
        cargarExamen(this.examenGuardado.examenId).then(function(exam) {
            self.examenActual = exam;
            self.respuestasUsuario = self.examenGuardado.respuestas;
            self.preguntaActual = self.examenGuardado.preguntaActual;
            
            var t = document.getElementById('exam-title'), n = document.getElementById('exam-norma');
            if (t) t.textContent = exam.titulo;
            if (n) n.textContent = exam.norma;
            
            self.detenerTimer();
            self.iniciarTimerExamen();
            self.mostrarPantalla('exam-screen');
            self.mostrarPregunta();
        });
    },
    
    eliminarExamenGuardado: function() {
        this.examenGuardado = null;
        localStorage.removeItem('rayoshield_progreso');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // RESULTADOS EXAMEN
    // ─────────────────────────────────────────────────────────────────────
    mostrarResultado: function() {
        if (!this.examenActual) return;
        this.detenerTimer();
        
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        
        var icon = document.getElementById('result-icon');
        var title = document.getElementById('result-title');
        var score = document.getElementById('score-number');
        var ac = document.getElementById('aciertos');
        var tot = document.getElementById('total');
        var min = document.getElementById('min-score');
        var st = document.getElementById('result-status');
        var btn = document.getElementById('btn-certificado');
        
        if (icon) icon.textContent = getIconoResultado(this.resultadoActual.estado);
        if (title) title.textContent = (this.resultadoActual.estado === 'Aprobado' ? 'APROBADO' : 'REPROBADO') + (this.licencia.tipo === 'DEMO' ? ' (DEMO)' : '');
        if (score) score.textContent = this.resultadoActual.score + '%';
        if (ac) ac.textContent = this.resultadoActual.aciertos;
        if (tot) tot.textContent = this.resultadoActual.total;
        if (min) min.textContent = this.resultadoActual.minScore;
        if (st) { st.textContent = this.resultadoActual.estado; st.className = 'score ' + getColorEstado(this.resultadoActual.estado); }
        
        if (btn) {
            btn.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
            btn.textContent = this.licencia.tipo === 'DEMO' ? 'Certificado (DEMO)' : 'Descargar Certificado';
        }
        
        this.mostrarPantalla('result-screen');
        this.guardarEnHistorial();
        this.consumirExamen();
    },
    
    descargarCertificado: function() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') { alert('Solo para aprobados'); return; }
        
        var self = this;
        
        if (typeof generarCertificado !== 'function') {
            alert('❌ Error: Función de certificado no cargada. Recarga la página (Ctrl+F5).');
            console.error('generarCertificado no está definida');
            return;
        }
        
        generarCertificado(this.userData, this.examenActual, this.resultadoActual).then(function(url) {
            var a = document.createElement('a');
            a.download = 'RayoShield_CERTIFICADO_EXAMEN_' + self.userData.nombre.replace(/\s/g, '_') + '_' + Date.now() + '.png';
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }).catch(function(err) {
            console.error('Error generando certificado:', err);
            alert('❌ Error generando certificado: ' + err.message);
        });
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // DESCARGAR CERTIFICADO DE CASO (CON/SIN MARCA DE AGUA)
    // ─────────────────────────────────────────────────────────────────────
    descargarCertificadoCaso: function(conMarcaDeAgua) {
        if (!this.casoActual || !this.resultadoCaso) {
            alert('❌ No hay certificado disponible');
            return;
        }
        if (!this.resultadoCaso.aprobado) {
            alert('⚠️ Debes aprobar el caso para obtener el certificado');
            return;
        }
        
        var self = this;
        
        // ✅ DETERMINAR NIVEL DEL CERTIFICADO
        var nivelCertificado = '';
        if (this.casoActual.nivel === 'basico') nivelCertificado = 'BÁSICO';
        else if (this.casoActual.nivel === 'master') nivelCertificado = 'MASTER';
        else if (this.casoActual.nivel === 'elite') nivelCertificado = 'ELITE';
        else if (this.casoActual.nivel === 'pericial') nivelCertificado = 'PERICIAL';
        else nivelCertificado = 'COMPLETADO';
        
        // ✅ VERIFICAR QUE LA FUNCIÓN EXISTA
        if (typeof generarCertificadoCaso !== 'function') {
            alert('❌ Error: Función de certificado no cargada. Recarga la página.');
            console.error('generarCertificadoCaso no está definida');
            return;
        }
        
        generarCertificadoCaso(this.userData, this.casoActual, this.resultadoCaso, nivelCertificado, conMarcaDeAgua).then(function(url) {
            var a = document.createElement('a');
            a.download = 'RayoShield_CERTIFICADO_' + nivelCertificado + '_' + self.userData.nombre.replace(/\s/g, '_') + '_' + Date.now() + '.png';
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }).catch(function(err) {
            console.error('Error generando certificado:', err);
            alert('❌ Error generando certificado: ' + err.message);
        });
    },
    // ─────────────────────────────────────────────────────────────────────
    // IMPRIMIR CERTIFICADO DE CASO
    // ─────────────────────────────────────────────────────────────────────
    imprimirCertificadoCaso: function(conMarcaDeAgua) {
        if (!this.casoActual || !this.resultadoCaso) {
            alert('❌ No hay certificado disponible');
            return;
        }
        if (!this.resultadoCaso.aprobado) {
            alert('⚠️ Debes aprobar el caso para imprimir el certificado');
            return;
        }
    
        var self = this;
    
        // ✅ DETERMINAR NIVEL DEL CERTIFICADO
        var nivelCertificado = '';
        if (this.casoActual.nivel === 'basico') nivelCertificado = 'BÁSICO';
        else if (this.casoActual.nivel === 'master') nivelCertificado = 'MASTER';
        else if (this.casoActual.nivel === 'elite') nivelCertificado = 'ELITE';
        else if (this.casoActual.nivel === 'pericial') nivelCertificado = 'PERICIAL';
        else nivelCertificado = 'COMPLETADO';
    
        // ✅ VERIFICAR QUE LA FUNCIÓN EXISTA
        if (typeof generarCertificadoCaso !== 'function') {
            alert('❌ Error: Función de certificado no cargada. Recarga la página.');
            console.error('generarCertificadoCaso no está definida');
            return;
        }
    
        // ✅ GENERAR CERTIFICADO Y ABRIR DIÁLOGO DE IMPRESIÓN
        generarCertificadoCaso(this.userData, this.casoActual, this.resultadoCaso, nivelCertificado, conMarcaDeAgua).then(function(url) {
            // Crear ventana emergente para imprimir
            var printWindow = window.open('', '_blank');
            printWindow.document.write('<html><head><title>Imprimir Certificado</title></head><body style="margin:0;padding:20px;text-align:center;">');
            printWindow.document.write('<img src="' + url + '" style="max-width:100%;height:auto;" onload="window.print();">');
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
        
            // Cerrar ventana después de imprimir (opcional)
            setTimeout(function() {
                // printWindow.close(); // Descomentar si quieres cerrar automáticamente
            }, 5000);
        }).catch(function(err) {
            console.error('Error generando certificado:', err);
            alert('❌ Error generando certificado: ' + err.message);
        });
    },
    // ─────────────────────────────────────────────────────────────────────
    // DESCARGAR INSIGNIA
    // ─────────────────────────────────────────────────────────────────────
    descargarInsignia: function() {
        if (!this.casoActual || !this.resultadoCaso) {
            alert('❌ No hay insignia disponible');
            return;
        }
        if (!this.resultadoCaso.aprobado) {
            alert('⚠️ Debes aprobar el caso para obtener la insignia');
            return;
        }
        
        var self = this;
        
        // ✅ VERIFICAR QUE LA FUNCIÓN EXISTA
        if (typeof generarInsigniaPNG !== 'function') {
            alert('❌ Error: Función de insignia no cargada. Recarga la página.');
            console.error('generarInsigniaPNG no está definida');
            return;
        }
    
        generarInsigniaPNG(this.userData, this.casoActual, this.resultadoCaso).then(function(url) {
            var a = document.createElement('a');
            a.download = 'RayoShield_INSIGNIA_' + self.userData.nombre.replace(/\s/g, '_') + '_' + Date.now() + '.png';
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }).catch(function(err) {
            console.error('Error generando insignia:', err);
            alert('❌ Error generando insignia');
        });
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // NAVEGACIÓN
    // ─────────────────────────────────────────────────────────────────────
    volverHome: function() {
        this.detenerTimer();
        this.detenerTimerCaso();
        this.examenActual = null;
        this.respuestasUsuario = [];
        this.preguntaActual = 0;
        this.resultadoActual = null;
        this.respuestaTemporal = null;
        this.mostrarPantalla('home-screen');
    },
    
    mostrarDatosUsuario: function() {
        var e = document.getElementById('user-empresa'), n = document.getElementById('user-nombre');
        var c = document.getElementById('user-curp'), p = document.getElementById('user-puesto');
        if (e) e.value = this.userData.empresa || '';
        if (n) n.value = this.userData.nombre || '';
        if (c) c.value = this.userData.curp || '';
        if (p) p.value = this.userData.puesto || '';
        this.mostrarPantalla('user-data-screen');
    },
    
    mostrarHistorial: function() {
        var list = document.getElementById('history-list'); if (!list) return;
        var hist = this.obtenerHistorial();
        
        if (hist.length === 0) { list.innerHTML = '<p style="text-align:center;color:#666">Sin exámenes</p>'; }
        else {
            list.innerHTML = '';
            hist.slice(-10).reverse().forEach(function(item) {
                var d = document.createElement('div'); d.className = 'history-item';
                d.innerHTML = '<div><strong>' + item.examen + '</strong><br><small>' + new Date(item.fecha).toLocaleDateString('es-MX') + '</small></div><span class="score ' + getColorEstado(item.estado) + '">' + item.score + '%</span>';
                list.appendChild(d);
            });
        }
        this.mostrarPantalla('history-screen');
    },
    
    mostrarLicencia: function() {
        this.mostrarPantalla('license-screen');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // CASOS CRÍTICOS - INVESTIGACIÓN MASTER (CORREGIDO)
    // ─────────────────────────────────────────────────────────────────────
    irACasosMaster: function() {
        this.detenerTimerCaso();
        
        // ✅ VALIDAR QUE LOS ELEMENTOS EXISTEN ANTES DE ACCEDER
        var casosList = document.getElementById('casos-list');
        var casoDetalle = document.getElementById('caso-detalle');
        var casosMainButtons = document.getElementById('casos-main-buttons');
        
        if (casosList) casosList.style.display = 'block';
        if (casoDetalle) casoDetalle.style.display = 'none';
        if (casosMainButtons) casosMainButtons.style.display = 'block';
        
        if (!casosList) {
            console.error('❌ Elemento casos-list no encontrado');
            alert('Error: La pantalla de casos no está disponible. Recarga la página.');
            return;
        }
        
        casosList.innerHTML = '';
        
        if (typeof CASOS_INVESTIGACION === 'undefined' || CASOS_INVESTIGACION.length === 0) {
            casosList.innerHTML = '<p style="text-align:center;color:var(--ink4);padding:40px 20px;">No hay casos de investigación disponibles aún.</p>';
            this.mostrarPantalla('casos-master-screen');
            return;
        }
        
        var self = this;
        var casosMostrados = 0;
        var maxCasosDemo = 1;
        
        CASOS_INVESTIGACION.forEach(function(caso) {
            var tieneAcceso = false;
            
            if (caso.nivel === 'basico' && self.licencia.features.casosBasicos) tieneAcceso = true;
            else if (caso.nivel === 'master' && self.licencia.features.casosMaster) tieneAcceso = true;
            else if (caso.nivel === 'elite' && self.licencia.features.casosElite) tieneAcceso = true;
            else if (caso.nivel === 'pericial' && self.licencia.features.casosPericial) tieneAcceso = true;
            
            if (tieneAcceso) {
                if (self.licencia.tipo === 'DEMO' && casosMostrados >= maxCasosDemo) {
                    return;
                }
                
                var item = document.createElement('div');
                item.className = 'caso-item';
                item.innerHTML = '<h4>' + caso.icono + ' ' + caso.titulo + '</h4><p><span class="badge-nivel ' + caso.nivel + '">' + caso.nivel.toUpperCase() + '</span> • ' + caso.tiempo_estimado + '</p><p style="color:var(--ink3);font-size:13px;margin-top:8px;line-height:1.5;">' + caso.descripcion + '</p>' + (caso.requisito ? '<p style="color:var(--amber);font-size:12px;margin-top:8px;">📋 Requisito: ' + caso.requisito + '</p>' : '');
                item.onclick = function() { self.cargarCasoMaster(caso.id); };
                casosList.appendChild(item);
                casosMostrados++;
            }
        });
        
        if (casosList.children.length === 0) {
            casosList.innerHTML = '<p style="text-align:center;color:var(--ink4);padding:40px 20px;">No hay casos disponibles para tu plan actual.<br><strong style="color:var(--ink);">Actualiza tu plan para acceder a más casos.</strong></p>';
        }
        
        this.mostrarPantalla('casos-master-screen');
    },
    
    cargarCasoMaster: async function(casoId) {
        var self = this;
        this.casoActual = await cargarCasoInvestigacion(casoId);
        
        if (!this.casoActual) {
            alert('❌ Error cargando el caso');
            return;
        }
        
        document.getElementById('casos-list').style.display = 'none';
        document.getElementById('caso-detalle').style.display = 'block';
        document.getElementById('casos-main-buttons').style.display = 'none';
        document.getElementById('caso-resultado').style.display = 'none';
        
        document.getElementById('caso-id').textContent = this.casoActual.id;
        document.getElementById('caso-fecha').textContent = this.casoActual.fecha_evento;
        document.getElementById('caso-industria').textContent = this.casoActual.industria;
        document.getElementById('caso-tiempo').textContent = (this.casoActual.metadatos_evaluacion && this.casoActual.metadatos_evaluacion.tiempo_estimado_minutos ? this.casoActual.metadatos_evaluacion.tiempo_estimado_minutos : 25) + ' min';
        
        var desc = this.casoActual.descripcion_evento || {};
        document.getElementById('caso-descripcion').innerHTML =
            '<strong>Actividad:</strong> ' + (desc.actividad || 'N/A') + '<br>' +
            '<strong>Equipo:</strong> ' + (desc.equipo || 'N/A') + '<br>' +
            '<strong>Evento:</strong> ' + (desc.evento || 'N/A') + '<br>' +
            '<strong>Resultado:</strong> ' + (desc.resultado || 'N/A') + '<br>' +
            '<strong style="color:#f44336;">Clasificación:</strong> ' + (desc.clasificacion || 'N/A');
        
        // Timeline
        var timelineEl = document.getElementById('caso-timeline');
        timelineEl.innerHTML = '';
        this.casoActual.linea_tiempo.forEach(function(evento) {
            var item = document.createElement('div');
            item.className = 'timeline-item' + (evento.includes('Liberación') ? ' evento-critico' : '');
            item.textContent = evento;
            timelineEl.appendChild(item);
        });
        
        // Energías
        var energiasEl = document.getElementById('caso-energias');
        energiasEl.innerHTML = '';
        var energias = this.casoActual.energias_identificadas;
        Object.keys(energias).forEach(function(tipo) {
            var estado = energias[tipo];
            var clase = estado === 'Aisladas' ? 'aislada' : (estado === 'No aplican' ? 'na' : 'no-aislada');
            var item = document.createElement('div');
            item.className = 'energia-item ' + clase;
            item.innerHTML = '<strong>' + tipo + '</strong><br><small>' + estado + '</small>';
            energiasEl.appendChild(item);
        });
        
        // Preguntas
        var preguntasEl = document.getElementById('caso-preguntas');
        preguntasEl.innerHTML = '';
        this.respuestasCaso = {};
        
        this.casoActual.preguntas.forEach(function(pregunta, idx) {
            var preguntaDiv = document.createElement('div');
            preguntaDiv.className = 'pregunta-master';
            preguntaDiv.innerHTML = '<h4>🔍 Pregunta ' + (idx + 1) + ' (' + pregunta.tipo.replace('_', ' ') + ') - ' + pregunta.peso + ' pts</h4><p>' + pregunta.pregunta + '</p>';
            
            switch(pregunta.tipo) {
                case 'analisis_multiple':
                case 'deteccion_omisiones':
                case 'identificacion_sesgos':
                case 'analisis_normativo':
                case 'deteccion_inconsistencias':
                case 'diagnostico_sistema':
                    preguntaDiv.appendChild(self.renderAnalisisMultiple(pregunta));
                    break;
                case 'respuesta_abierta_guiada':
                case 'redaccion_tecnica':
                    preguntaDiv.appendChild(self.renderRespuestaAbierta(pregunta));
                    break;
                case 'analisis_responsabilidad':
                    preguntaDiv.appendChild(self.renderAnalisisResponsabilidad(pregunta));
                    break;
                case 'plan_accion':
                case 'evaluacion_correctivas':
                    preguntaDiv.appendChild(self.renderPlanAccion(pregunta));
                    break;
                case 'ordenamiento_dinamico':
                case 'matriz_priorizacion':
                    preguntaDiv.appendChild(self.renderOrdenamientoDinamico(pregunta));
                    break;
                case 'calculo_tecnico':
                    preguntaDiv.appendChild(self.renderCalculoTecnico(pregunta));
                    break;
                default:
                    preguntaDiv.appendChild(self.renderAnalisisMultiple(pregunta));
            }
            preguntasEl.appendChild(preguntaDiv);
        });
        
        document.getElementById('btn-enviar-caso').style.display = 'inline-block';
        this.iniciarTimerCaso();
    },
    
    renderAnalisisMultiple: function(pregunta) {
        var container = document.createElement('div');
        var self = this;
        
        pregunta.opciones.forEach(function(opt, idx) {
            var label = document.createElement('label');
            label.className = 'opcion-sistemica';
            label.style.display = 'flex';
            label.style.alignItems = 'flex-start';
            label.style.gap = '12px';
            
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'pregunta-' + pregunta.id;
            checkbox.value = idx;
            checkbox.style.marginTop = '4px';
            
            var textoSpan = document.createElement('span');
            textoSpan.className = 'texto-opcion';
            textoSpan.textContent = opt.texto || opt;
            
            label.appendChild(checkbox);
            label.appendChild(textoSpan);
            
            label.onclick = function(e) {
                if (e.target === checkbox) {
                    label.classList.toggle('seleccionada');
                }
            };
            container.appendChild(label);
        });
        
        return container;
    },
    
    renderRespuestaAbierta: function(pregunta) {
        var container = document.createElement('div');
        var textarea = document.createElement('textarea');
        textarea.className = 'respuesta-abierta';
        textarea.placeholder = 'Escribe tu análisis sistémico aquí... (mínimo 80 caracteres)';
        textarea.id = 'respuesta-' + pregunta.id;
        container.appendChild(textarea);
        
        if (pregunta.feedback_guiado) {
            var pista = document.createElement('div');
            pista.className = 'pista-experto';
            pista.innerHTML = '💡 ' + pregunta.feedback_guiado;
            container.appendChild(pista);
        }
        
        return container;
    },
    
    renderAnalisisResponsabilidad: function(pregunta) {
        var container = document.createElement('div');
        container.className = 'matriz-responsabilidad';
        var self = this;
        
        pregunta.roles.forEach(function(role, roleIdx) {
            var row = document.createElement('div');
            row.className = 'role-row';
            row.innerHTML = '<div class="role-name">' + role.rol + '</div>';
            
            var optionsDiv = document.createElement('div');
            optionsDiv.className = 'role-options';
            
            role.opciones.forEach(function(opt, optIdx) {
                var label = document.createElement('label');
                label.className = 'role-option';
                label.innerHTML = '<input type="radio" name="responsabilidad-' + pregunta.id + '-' + roleIdx + '" value="' + optIdx + '"><span>' + opt.nivel + '</span>';
                label.onclick = function(e) {
                    if (e.target.tagName === 'INPUT') {
                        row.querySelectorAll('input').forEach(function(r) { r.closest('.role-option').classList.remove('seleccionada'); });
                        label.classList.add('seleccionada');
                    }
                };
                optionsDiv.appendChild(label);
            });
            
            row.appendChild(optionsDiv);
            container.appendChild(row);
        });
        
        return container;
    },
    
    renderPlanAccion: function(pregunta) {
        var container = document.createElement('div');
        container.className = 'plan-accion-grid';
        var self = this;
        
        pregunta.opciones.forEach(function(opt, idx) {
            var item = document.createElement('label');
            item.className = 'accion-item';
            var texto = opt.texto || opt.accion || opt;
            var jerarquia = opt.jerarquia || opt.clasificacion || 'administrativo';
            var prioridad = opt.prioridad || '';
            
            item.innerHTML = '<input type="checkbox" name="plan-' + pregunta.id + '" value="' + idx + '" style="margin-top:5px;"><div style="flex:1;"><strong>' + texto + '</strong><div style="margin-top:5px;"><span class="accion-jerarquia ' + jerarquia + '">' + jerarquia + '</span>' + (prioridad ? '<span style="margin-left:10px;font-size:12px;color:#666;">Prioridad: ' + prioridad + '</span>' : '') + '</div></div>';
            
            item.onclick = function(e) {
                if (e.target.tagName === 'INPUT') {
                    item.classList.toggle('seleccionada');
                }
            };
            container.appendChild(item);
        });
        
        return container;
    },
    
    renderOrdenamientoDinamico: function(pregunta) {
        var container = document.createElement('div');
        var self = this;
        
        var instrucciones = document.createElement('p');
        instrucciones.style.cssText = 'color: #666; font-size: 14px; margin: 10px 0;';
        instrucciones.textContent = 'Arrastra los elementos para ordenarlos en la secuencia correcta';
        container.appendChild(instrucciones);
        
        var ordenContainer = document.createElement('div');
        ordenContainer.className = 'orden-container';
        ordenContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; margin: 15px 0;';
        
        pregunta.opciones.forEach(function(opt, idx) {
            var item = document.createElement('div');
            item.className = 'orden-item';
            item.style.cssText = 'display: flex; align-items: center; gap: 15px; padding: 15px; background: #f5f5f5; border-radius: 8px; cursor: move; border: 2px solid #ddd;';
            item.draggable = true;
            item.dataset.index = idx;
            
            var numero = document.createElement('div');
            numero.className = 'orden-numero';
            numero.style.cssText = 'width: 30px; height: 30px; background: #2196F3; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;';
            numero.textContent = idx + 1;
            
            var texto = document.createElement('span');
            texto.style.cssText = 'flex: 1; font-size: 14px;';
            texto.textContent = opt;
            
            item.appendChild(numero);
            item.appendChild(texto);
            
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', idx);
                this.style.opacity = '0.5';
            });
            item.addEventListener('dragend', function() {
                this.style.opacity = '1';
                self.actualizarOrdenNumeros(ordenContainer);
            });
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = '#2196F3';
            });
            item.addEventListener('dragleave', function() {
                this.style.borderColor = '#ddd';
            });
            item.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = '#ddd';
                var fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                var toIdx = parseInt(this.dataset.index);
                if (fromIdx !== toIdx) {
                    var items = Array.from(ordenContainer.children);
                    var fromItem = items[fromIdx];
                    var toItem = items[toIdx];
                    if (fromIdx < toIdx) {
                        ordenContainer.insertBefore(fromItem, toItem.nextSibling);
                    } else {
                        ordenContainer.insertBefore(fromItem, toItem);
                    }
                }
            });
            ordenContainer.appendChild(item);
        });
        
        container.appendChild(ordenContainer);
        
        var inputOrden = document.createElement('input');
        inputOrden.type = 'hidden';
        inputOrden.id = 'respuesta-' + pregunta.id;
        inputOrden.className = 'respuesta-orden';
        container.appendChild(inputOrden);
        
        return container;
    },
    
    actualizarOrdenNumeros: function(container) {
        var items = container.children;
        for (var i = 0; i < items.length; i++) {
            var numero = items[i].querySelector('.orden-numero');
            if (numero) numero.textContent = i + 1;
            items[i].dataset.index = i;
        }
        var inputOrden = container.querySelector('.respuesta-orden');
        if (inputOrden) {
            var orden = [];
            for (var i = 0; i < items.length; i++) {
                orden.push(parseInt(items[i].dataset.index));
            }
            inputOrden.value = JSON.stringify(orden);
        }
    },
    
    renderCalculoTecnico: function(pregunta) {
        var container = document.createElement('div');
        
        if (pregunta.variables) {
            var variablesDiv = document.createElement('div');
            variablesDiv.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;';
            Object.keys(pregunta.variables).forEach(function(variable) {
                var valor = Array.isArray(pregunta.variables[variable]) ? pregunta.variables[variable][0] : pregunta.variables[variable];
                var p = document.createElement('p');
                p.style.cssText = 'margin: 5px 0; font-size: 14px;';
                p.innerHTML = '<strong>' + variable + ':</strong> ' + valor;
                variablesDiv.appendChild(p);
            });
            container.appendChild(variablesDiv);
        }
        
        var inputDiv = document.createElement('div');
        inputDiv.style.cssText = 'margin: 15px 0;';
        var input = document.createElement('input');
        input.type = 'number';
        input.id = 'respuesta-' + pregunta.id;
        input.placeholder = 'Ingresa tu respuesta';
        input.style.cssText = 'width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;';
        inputDiv.appendChild(input);
        container.appendChild(inputDiv);
        
        if (pregunta.ayuda) {
            var ayudaDiv = document.createElement('div');
            ayudaDiv.style.cssText = 'background: #E3F2FD; padding: 12px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2196F3;';
            ayudaDiv.innerHTML = '<strong>💡 Ayuda:</strong> ' + pregunta.ayuda;
            container.appendChild(ayudaDiv);
        }
        
        return container;
    },
    
    enviarRespuestasCaso: function() {
        if (!this.casoActual) return;
        
        var respuestasPorPregunta = {};
        var self = this;
        
        this.casoActual.preguntas.forEach(function(pregunta) {
            switch(pregunta.tipo) {
                case 'analisis_multiple':
                case 'deteccion_omisiones':
                case 'identificacion_sesgos':
                case 'analisis_normativo':
                case 'deteccion_inconsistencias':
                case 'diagnostico_sistema':
                    var checks = document.querySelectorAll('input[name="pregunta-' + pregunta.id + '"]:checked');
                    respuestasPorPregunta[pregunta.id] = Array.from(checks).map(function(c) { return parseInt(c.value); });
                    break;
                case 'respuesta_abierta_guiada':
                case 'redaccion_tecnica':
                    var textarea = document.getElementById('respuesta-' + pregunta.id);
                    respuestasPorPregunta[pregunta.id] = [textarea ? textarea.value : ''];
                    break;
                case 'analisis_responsabilidad':
                    var respuestas = [];
                    pregunta.roles.forEach(function(role, idx) {
                        var selected = document.querySelector('input[name="responsabilidad-' + pregunta.id + '-' + idx + '"]:checked');
                        respuestas.push(selected ? parseInt(selected.value) : undefined);
                    });
                    respuestasPorPregunta[pregunta.id] = respuestas;
                    break;
                case 'plan_accion':
                case 'evaluacion_correctivas':
                    var checks = document.querySelectorAll('input[name="plan-' + pregunta.id + '"]:checked');
                    respuestasPorPregunta[pregunta.id] = Array.from(checks).map(function(c) { return parseInt(c.value); });
                    break;
                case 'ordenamiento_dinamico':
                case 'matriz_priorizacion':
                    var inputOrden = document.getElementById('respuesta-' + pregunta.id);
                    respuestasPorPregunta[pregunta.id] = inputOrden && inputOrden.value ? JSON.parse(inputOrden.value) : [];
                    break;
                case 'calculo_tecnico':
                    var inputCalculo = document.getElementById('respuesta-' + pregunta.id);
                    respuestasPorPregunta[pregunta.id] = [inputCalculo ? parseFloat(inputCalculo.value) : 0];
                    break;
            }
        });
        
        // ✅ SmartEvaluationV2 usa scoring.js como base (mismo score)
        var resultado = SmartEvaluationV2.evaluarConDimensiones(respuestasPorPregunta, this.casoActual);
        this.resultadoCaso = resultado;
        this.mostrarResultadoCaso(resultado);
    },
    
    mostrarResultadoCaso: function(resultado) {
        var resultadoEl = document.getElementById('caso-resultado');
        resultadoEl.style.display = 'block';
        resultadoEl.scrollIntoView({ behavior: 'smooth' });
        this.detenerTimerCaso();
        
        // ✅ DETERMINAR QUÉ BOTONES MOSTRAR SEGÚN PLAN Y NIVEL DEL CASO
        var mostrarCertificado = false;
        var mostrarInsignia = false;
        var conMarcaDeAgua = false;
        
        // DEMO: Solo certificado con marca de agua (sin insignias)
        if (this.licencia.tipo === 'DEMO') {
            mostrarCertificado = true;
            mostrarInsignia = false;
            conMarcaDeAgua = true;
        }
        // PROFESIONAL: Certificado sin marca de agua (sin insignias)
        else if (this.licencia.tipo === 'PROFESIONAL') {
            mostrarCertificado = true;
            mostrarInsignia = false;
            conMarcaDeAgua = false;
        }
        // CONSULTOR: Certificado + Insignia (solo para casos MASTER+)
        else if (this.licencia.tipo === 'CONSULTOR') {
            mostrarCertificado = true;
            mostrarInsignia = resultado.aprobado && this.casoActual.nivel !== 'basico';
            conMarcaDeAgua = false;
        }
        // EMPRESARIAL: Certificado + Insignia (todos los niveles)
        else if (this.licencia.tipo === 'EMPRESARIAL') {
            mostrarCertificado = true;
            mostrarInsignia = resultado.aprobado;
            conMarcaDeAgua = false;
        }
        
        // ✅ DETERMINAR NIVEL DEL CERTIFICADO SEGÚN CASO
        var nivelCertificado = '';
        if (this.casoActual.nivel === 'basico') nivelCertificado = 'BÁSICO';
        else if (this.casoActual.nivel === 'master') nivelCertificado = 'MASTER';
        else if (this.casoActual.nivel === 'elite') nivelCertificado = 'ELITE';
        else if (this.casoActual.nivel === 'pericial') nivelCertificado = 'PERICIAL';
        else nivelCertificado = 'COMPLETADO';
        
        // ✅ GENERAR BOTONES SEGÚN PLAN
        var botonesHTML = '';
        if (resultado.aprobado) {
            botonesHTML = '<div class="button-group" style="margin-top:20px; display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">';
            
            // Botón Certificado (TODOS los planes)
            if (mostrarCertificado) {
                botonesHTML += '<button class="btn btn-primary" onclick="app.descargarCertificadoCaso(' + conMarcaDeAgua + ')" style="background:linear-gradient(135deg,#2196F3,#1976D2);color:white;font-weight:bold; padding:14px 28px;">📄 Descargar Certificado</button>';
            }
            
            // Botón Insignia (solo CONSULTOR y EMPRESARIAL, casos MASTER+)
            if (mostrarInsignia) {
                botonesHTML += '<button class="btn btn-primary" onclick="app.descargarInsignia()" style="background:linear-gradient(135deg,#D4AF37,#FFD700);color:#1a1a1a;font-weight:bold; padding:14px 28px;">🏅 Descargar Insignia</button>';
            }
            
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverAListaCasos()" style="padding:14px 28px;">🔄 Otro caso</button>';
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverHome()" style="padding:14px 28px;">🏠 Inicio</button>';
            botonesHTML += '</div>';
        } else {
            botonesHTML = '<div class="button-group" style="margin-top:20px; display:flex; gap:15px; flex-wrap:wrap; justify-content:center;">';
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverAListaCasos()" style="padding:14px 28px;">🔄 Intentar otro caso</button>';
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverHome()" style="padding:14px 28px;">🏠 Inicio</button>';
            botonesHTML += '</div>';
        }
        
        // ✅ RENDERIZAR RESULTADO
        if (this.licencia.features && this.licencia.features.predictivo && typeof DashboardEngine !== 'undefined') {
            resultadoEl.innerHTML = DashboardEngine.generar(resultado);
        }
        else if (this.licencia.features && this.licencia.features.casosElite && typeof DashboardBasico !== 'undefined') {
            resultadoEl.innerHTML = DashboardBasico.generar(resultado);
        }
        else {
            var claseEstado = resultado.aprobado ? 'aprobado' : 'no-aprobado';
            var icono = resultado.aprobado ? '✅' : '📚';
            var estadoTexto = resultado.aprobado ? '✅ APROBADO - Nivel ' + nivelCertificado : '📚 Requiere repaso';
            
            // ✅ MOSTRAR INSIGNIA SOLO SI APLICA
            var insigniaHTML = '';
            if (mostrarInsignia && resultado.aprobado) {
                var insignia = this.obtenerInsigniaPorPuntaje(resultado.porcentaje);
                insigniaHTML = '<div style="margin:20px 0;padding:20px;background:linear-gradient(135deg,#D4AF37,#FFD700);border-radius:10px;text-align:center;"><div style="font-size:64px;margin-bottom:10px;">' + insignia.icono + '</div><div style="font-size:20px;font-weight:bold;color:#1a1a1a;">Insignia ' + insignia.nombre + '</div><div style="font-size:14px;color:#333;margin-top:5px;">' + insignia.descripcion + '</div></div>';
            }
            
            // ✅ CORREGIR COLORES DE TEXTO PARA FONDOS CLAROS
            resultadoEl.innerHTML = '<div class="resultado-investigacion ' + claseEstado + '"><h2>' + icono + ' Resultado de la Investigación</h2><div class="puntaje-master">' + resultado.porcentaje + '%</div><p><strong>Puntaje:</strong> ' + resultado.puntajeTotal + ' / ' + resultado.puntajeMaximo + '</p><p><strong>Estado:</strong> ' + estadoTexto + '</p><p><strong>Nivel del Caso:</strong> ' + nivelCertificado + '</p>' + insigniaHTML + '</div>' + 
            (resultado.feedback.length > 0 ? '<div style="margin:20px 0;padding:20px;background:#FFF3E0;border-radius:10px;border-left:4px solid #FF9800;"><strong style="color:#E65100;">💡 Retroalimentación:</strong><ul style="margin-top:10px;color:#5D4037;">' + resultado.feedback.map(function(f) { return '<li style="padding:5px 0;">' + f + '</li>'; }).join('') + '</ul></div>' : '') + 
            '<div class="leccion-master" style="background:#E3F2FD;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #2196F3;"><strong style="color:#1565C0;">🎓 Lección Aprendida:</strong><p style="margin-top:10px;color:#0D47A1;line-height:1.6;">' + resultado.leccion + '</p></div>' + 
            '<div style="background:#E8F5E9;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #4CAF50;"><strong style="color:#2E7D32;">📋 Conclusión Oficial:</strong><p style="margin-top:10px;line-height:1.6;color:#1B5E20;">' + resultado.conclusion + '</p></div>' + botonesHTML;

        }
        
        document.getElementById('btn-enviar-caso').style.display = 'none';
    },
    
    obtenerInsigniaPorPuntaje: function(puntaje) {
        if (puntaje >= 95) {
            return { nombre: 'PERICIAL', icono: '⚖️', descripcion: 'Excelencia en investigación de incidentes', color: '#D4AF37' };
        } else if (puntaje >= 90) {
            return { nombre: 'ELITE', icono: '🥇', descripcion: 'Competencia avanzada en análisis SHE', color: '#9C27B0' };
        } else if (puntaje >= 80) {
            return { nombre: 'MASTER', icono: '🥈', descripcion: 'Competencia sólida en investigación', color: '#2196F3' };
        } else if (puntaje >= 75) {
            return { nombre: 'AVANZADO', icono: '🥉', descripcion: 'Competencia en desarrollo', color: '#4CAF50' };
        } else {
            return { nombre: 'PARTICIPACIÓN', icono: '📚', descripcion: 'Continúa practicando', color: '#FF9800' };
        }
    },
    
    volverAListaCasos: function() {
        this.detenerTimerCaso();
        document.getElementById('casos-list').style.display = 'block';
        document.getElementById('caso-detalle').style.display = 'none';
        document.getElementById('casos-main-buttons').style.display = 'block';
        document.getElementById('caso-resultado').style.display = 'none';
        this.casoActual = null;
        this.respuestasCaso = {};
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // WHITE LABEL MANAGER
    // ─────────────────────────────────────────────────────────────────────
    aplicarConfiguracionWhiteLabel: function() {
        if (!this.licencia.features || !this.licencia.features.whiteLabel) {
            return;
        }
        var configGuardada = localStorage.getItem('rayoshield_wl_config');
        if (configGuardada) {
            var config = JSON.parse(configGuardada);
            document.documentElement.style.setProperty('--wl-primary', config.color);
            var logos = document.querySelectorAll('img.logo');
            logos.forEach(function(img) { if (config.logo) img.src = config.logo; });
            var titulos = document.querySelectorAll('.header-content h1');
            titulos.forEach(function(h1) { if (config.nombre) h1.textContent = config.nombre; });
            console.log('✅ White Label aplicado:', config.nombre);
        }
    },
    
    guardarWhiteLabel: function() {
        if (!this.licencia.features || !this.licencia.features.whiteLabel) {
            alert('⚠️ Esta función solo está disponible en planes PRO + White Label o Enterprise.');
            return;
        }
        var nombre = document.getElementById('wl-nombre').value;
        var logo = document.getElementById('wl-logo').value;
        var color = document.getElementById('wl-color').value;
        var email = document.getElementById('wl-email').value;
        
        if(!nombre || !logo) { alert('Nombre y Logo son obligatorios'); return; }
        
        var config = { nombre: nombre, logo: logo, color: color, email: email };
        localStorage.setItem('rayoshield_wl_config', JSON.stringify(config));
        this.aplicarConfiguracionWhiteLabel();
        alert('✅ Marca actualizada correctamente. Recarga la página para ver cambios globales.');
    },
    
    mostrarPanelWhiteLabel: function() {
        if (!this.licencia.features || !this.licencia.features.whiteLabel) {
            alert('⚠️ Esta función solo está disponible en planes PRO + White Label o Enterprise.');
            return;
        }
        var configGuardada = localStorage.getItem('rayoshield_wl_config');
        if (configGuardada) {
            var c = JSON.parse(configGuardada);
            document.getElementById('wl-nombre').value = c.nombre || '';
            document.getElementById('wl-logo').value = c.logo || '';
            document.getElementById('wl-color').value = c.color || '#2196F3';
            document.getElementById('wl-email').value = c.email || '';
        }
        this.mostrarPantalla('white-label-screen');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // INFORMACIÓN
    // ─────────────────────────────────────────────────────────────────────
    mostrarInfo: function() {
        this.mostrarPantalla('info-screen');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // IMPRIMIR DASHBOARD
    // ─────────────────────────────────────────────────────────────────────
    imprimirDashboard: function() {
        var dashboardEl = document.querySelector('.dashboard-container');
        if (dashboardEl) {
            // ✅ Guardar estado actual
            var contenidoOriginal = document.body.innerHTML;
            var scrollPos = window.scrollY;
        
            // ✅ Preparar para imprimir
            document.body.innerHTML = dashboardEl.outerHTML;
        
            // ✅ Imprimir
            window.print();
        
            // ✅ RESTAURAR estado (NO recargar)
            document.body.innerHTML = contenidoOriginal;
            window.scrollTo(0, scrollPos);
        
            // ✅ Re-bindear eventos si es necesario
            this.reiniciarEventosDashboard();
        } else {
            window.print();
        }
    },

    // ✅ NUEVA FUNCIÓN - Reiniciar eventos después de imprimir
    reiniciarEventosDashboard: function() {
        // Restaurar listeners de botones si se perdieron
        var btnImprimir = document.querySelector('button[onclick*="imprimirDashboard"]');
        var btnOtroCaso = document.querySelector('button[onclick*="volverAListaCasos"]');
        // Los botones ya tienen onclick inline, no necesitan re-bind
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // HISTORIAL
    // ─────────────────────────────────────────────────────────────────────
    guardarEnHistorial: function() {
        var hist = this.obtenerHistorial();
        hist.push({
            examen: this.examenActual ? this.examenActual.titulo : 'Desconocido',
            norma: this.examenActual ? this.examenActual.norma : '',
            score: this.resultadoActual ? this.resultadoActual.score : 0,
            estado: this.resultadoActual ? this.resultadoActual.estado : '',
            fecha: this.resultadoActual ? this.resultadoActual.fecha : new Date().toISOString(),
            usuario: this.userData.nombre
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
    },
    
    obtenerHistorial: function() {
        try { var h = localStorage.getItem('rayoshield_historial'); return h ? JSON.parse(h) : []; } catch(e) { return []; }
    },
    
    cargarHistorial: function() { console.log('Historial:', this.obtenerHistorial().length, 'exámenes'); },
    
    // ─────────────────────────────────────────────────────────────────────
    // PWA INSTALL
    // ─────────────────────────────────────────────────────────────────────
    initPWAInstall: function() {
        var self = this;
        window.addEventListener('beforeinstallprompt', function(e) {
            console.log('PWA instalable');
            e.preventDefault();
            self.deferredPrompt = e;
            var c = document.getElementById('pwa-install-container');
            if (c) c.style.display = 'block';
        });
        window.addEventListener('appinstalled', function() {
            console.log('PWA instalada');
            self.deferredPrompt = null;
            var c = document.getElementById('pwa-install-container');
            if (c) c.style.display = 'none';
        });
    },
    
    instalarPWA: function() {
        var self = this;
        if (!this.deferredPrompt) { alert('Menú navegador → "Agregar a pantalla principal"'); return; }
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(function(r) {
            console.log('Instalación:', r.outcome);
            self.deferredPrompt = null;
            var c = document.getElementById('pwa-install-container');
            if (c) c.style.display = 'none';
        });
    }
};

// Iniciar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', function() { console.log('DOM listo'); app.init(); });
window.addEventListener('beforeunload', function() { if (app.timerExamen) clearInterval(app.timerExamen); if (app.timerCaso) clearInterval(app.timerCaso); });



