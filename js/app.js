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

    // SISTEMA MULTI-USUARIO - AGREGAR AQUÍ
    trabajadorActual: null,   
    
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

        // ✅ Inicializar Multi-Usuario
        if (typeof MultiUsuario !== 'undefined') {
            MultiUsuario.init();
        }
        
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
        this.actualizarBadgeTrabajadores();
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
    // ACTUALIZAR UI (CORREGIDO Y OPTIMIZADO)
    // ─────────────────────────────────────────────────────────────────────
    actualizarUI: function() {
        // ═══════════════════════════════════════════════════════════════
        // LICENCIA INFO (HOME SCREEN)
        // ═══════════════════════════════════════════════════════════════
        var infoLic = document.getElementById('licencia-info');
        if (infoLic) {
            if (this.licencia.tipo === 'DEMO') {
                infoLic.textContent = '📋 DEMO: ' + this.licencia.examenesRestantes + '/3 hoy';
                infoLic.className = 'licencia-info-card demo';
            } else {
                var exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : '∞';
                infoLic.textContent = '✅ ' + this.licencia.tipo + ': ' + this.licencia.clienteId + ' (exp: ' + exp + ')';
                infoLic.className = 'licencia-info-card activo';
            }
        }
        
        // ═══════════════════════════════════════════════════════════════
        // LICENCIA INFO DETAIL (LICENSE SCREEN) - CORREGIR SALTOS DE LÍNEA
        // ═══════════════════════════════════════════════════════════════
        var infoLicDetail = document.getElementById('licencia-info-detail');
        if (infoLicDetail) {
            if (this.licencia.tipo === 'DEMO') {
                infoLicDetail.textContent = '📋 Licencia DEMO - ' + this.licencia.examenesRestantes + ' exámenes hoy';
            } else {
                var exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : 'Sin expiración';
                // ✅ OPCIÓN A: Usar innerHTML con <br> para saltos de línea
                infoLicDetail.innerHTML = '✅ ' + this.licencia.tipo + '<br>Cliente: ' + this.licencia.clienteId + '<br>Válido hasta: ' + exp;
                // ✅ OPCIÓN B: Usar textContent + CSS (descomentar si prefieres esta opción)
                // infoLicDetail.textContent = '✅ ' + this.licencia.tipo + '\nCliente: ' + this.licencia.clienteId + '\nVálido hasta: ' + exp;
                // infoLicDetail.style.whiteSpace = 'pre-line';
            }
        }
        
        // ═══════════════════════════════════════════════════════════════
        // INFO DE USUARIO
        // ═══════════════════════════════════════════════════════════════
        var infoUser = document.getElementById('usuario-info');
        if (infoUser && this.userData.nombre) {
            infoUser.innerHTML = '<strong>👤 ' + this.userData.nombre + '</strong><br>' + 
                               (this.userData.empresa || '') + ' • ' + (this.userData.puesto || '');
            infoUser.className = 'usuario-info-card';
        }
        
        // ═══════════════════════════════════════════════════════════════
        // BOTONES CONDICIONALES
        // ═══════════════════════════════════════════════════════════════
        var btnExamen = document.getElementById('btn-comenzar');
        if (btnExamen) {
            var datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
            btnExamen.disabled = !datosOk;
            btnExamen.style.opacity = datosOk ? '1' : '0.5';
        }
        
        var btnCasosMaster = document.getElementById('btn-casos-master');
        if (btnCasosMaster) {
            btnCasosMaster.style.display = 'inline-block';
        }
        
        var btnWhiteLabel = document.getElementById('btn-white-label');
        if (btnWhiteLabel) {
            // ✅ VALIDACIÓN SEGURA DE FEATURES
            var tieneWhiteLabel = this.licencia.features && this.licencia.features.whiteLabel;
            btnWhiteLabel.style.display = tieneWhiteLabel ? 'inline-block' : 'none';
        }

        // ═══════════════════════════════════════════════════════════════
        // SIDEBAR LICENSE PILL
        // ═══════════════════════════════════════════════════════════════
        var sidebarPlan = document.getElementById('sidebar-license-plan');
        var sidebarExpiry = document.getElementById('sidebar-license-expiry');
        var sidebarPill = document.getElementById('sidebar-license-pill');
        
        if (sidebarPlan) sidebarPlan.textContent = this.licencia.tipo;
        
        if (sidebarExpiry) {
            if (this.licencia.expiracion) {
                var exp = new Date(this.licencia.expiracion);
                var ahora = new Date();
                var dias = Math.ceil((exp - ahora) / (1000 * 60 * 60 * 24));
                sidebarExpiry.textContent = dias + ' días restantes';
                
                if (dias <= 7) {
                    sidebarExpiry.style.color = 'var(--rose)';
                } else if (dias <= 15) {
                    sidebarExpiry.style.color = 'var(--amber)';
                } else {
                    sidebarExpiry.style.color = 'var(--ink4)';
                }
            } else {
                sidebarExpiry.textContent = 'Sin expiración';
                sidebarExpiry.style.color = 'var(--green)';
            }
        }
        
        if (sidebarPill) {
            if (this.licencia.tipo === 'EMPRESARIAL') {
                sidebarPill.style.background = 'linear-gradient(135deg, var(--amber-l), var(--amber))';
                sidebarPill.style.borderColor = 'var(--amber)';
            } else if (this.licencia.tipo === 'CONSULTOR') {
                sidebarPill.style.background = 'linear-gradient(135deg, var(--indigo), var(--blue))';
                sidebarPill.style.borderColor = 'var(--indigo)';
            } else if (this.licencia.tipo === 'PROFESIONAL') {
                sidebarPill.style.background = 'linear-gradient(135deg, var(--blue-l), var(--blue))';
                sidebarPill.style.borderColor = 'var(--blue)';
            } else {
                sidebarPill.style.background = 'linear-gradient(135deg, var(--bg2), var(--border))';
                sidebarPill.style.borderColor = 'var(--border)';
            }
        }        
        // ═══════════════════════════════════════════════════════════════
        // INFO SCREEN
        // ═══════════════════════════════════════════════════════════════
        var infoLicPlan = document.getElementById('info-licencia-plan');
        var infoUsuarioNombre = document.getElementById('info-usuario-nombre');
        var btnInstalarPWA = document.getElementById('btn-instalar-pwa');
        
        if (infoLicPlan) infoLicPlan.textContent = this.licencia.tipo;
        if (infoUsuarioNombre) infoUsuarioNombre.textContent = this.userData.nombre || '—';
        if (btnInstalarPWA && this.deferredPrompt) btnInstalarPWA.style.display = 'flex';
        
        // ✅ ACTUALIZAR UI DE LICENCIA (PANTALLA LICENSE-SCREEN)
        this.actualizarLicenciaUI();
        
        // ✅ ACTUALIZAR BADGE DE TRABAJADORES
        if (typeof this.actualizarBadgeTrabajadores === 'function') {
            this.actualizarBadgeTrabajadores();
            this.actualizarSidebarModoIndicador();
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
            'RS-PKDF-9826-A1B2': {
                clienteId: 'PROFESIONAL_001',
                tipo: 'PROFESIONAL',
                duracion: 15,
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
            'RS-COZS-2XT6-C3D4': {
                clienteId: 'CONSULTOR_001',
                tipo: 'CONSULTOR',
                duracion: 15,
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
            'RS-EVP4-Y02I-E5F6': {
                clienteId: 'EMPRESARIAL_001',
                tipo: 'EMPRESARIAL',
                duracion: 15,
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
    // ACTIVAR LICENCIA CON PLAN PREDEFINIDO
    // ─────────────────────────────────────────────────────────────────────
    activarLicenciaConPlan: function(plan) {
        var datos = {
            'PROFESIONAL': { id: 'PROFESIONAL_001', clave: 'RS-PKDF-9826-A1B2' },
            'CONSULTOR': { id: 'CONSULTOR_001', clave: 'RS-COZS-2XT6-C3D4' },
            'EMPRESARIAL': { id: 'EMPRESARIAL_001', clave: 'RS-EVP4-Y02I-E5F6' }
        };
        
        if (!datos[plan]) {
            alert('❌ Plan no válido');
            return;
        }
        
        document.getElementById('license-id').value = datos[plan].id;
        document.getElementById('license-key').value = datos[plan].clave;
        document.getElementById('activar-licencia-section').scrollIntoView({ behavior: 'smooth' });
        
        // Resaltar campos
        document.getElementById('license-id').style.borderColor = 'var(--blue)';
        document.getElementById('license-key').style.borderColor = 'var(--blue)';
        
        setTimeout(function() {
            document.getElementById('license-id').style.borderColor = 'var(--border)';
            document.getElementById('license-key').style.borderColor = 'var(--border)';
        }, 2000);
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ACTUALIZAR UI DE LICENCIA
    // ─────────────────────────────────────────────────────────────────────
    actualizarLicenciaUI: function() {
        // ✅ VALIDAR QUE ESTAMOS EN LA PANTALLA CORRECTA
        var planEl = document.getElementById('licencia-screen-plan');
        if (!planEl) return; // Si no existe, no estamos en license-screen
       
        // Plan actual
        var clienteEl = document.getElementById('licencia-screen-cliente');
        var expiryEl = document.getElementById('licencia-screen-expiry');
        var daysEl = document.getElementById('licencia-screen-days');
        var featuresEl = document.getElementById('licencia-features');
        
        if (planEl) planEl.textContent = this.licencia.tipo;
        if (clienteEl) clienteEl.textContent = this.licencia.clienteId || 'N/A';
        
        if (expiryEl) {
            if (this.licencia.expiracion) {
                var exp = new Date(this.licencia.expiracion);
                expiryEl.textContent = exp.toLocaleDateString('es-MX');
                
                // Días restantes
                var ahora = new Date();
                var dias = Math.ceil((exp - ahora) / (1000 * 60 * 60 * 24));
                if (daysEl) {
                    if (dias > 0) {
                        daysEl.textContent = dias + ' días restantes';
                        daysEl.style.color = dias > 7 ? 'var(--green)' : 'var(--amber)';
                    } else {
                        daysEl.textContent = 'Expirada';
                        daysEl.style.color = 'var(--rose)';
                    }
                }
            } else {
                expiryEl.textContent = 'Sin expiración';
                if (daysEl) {
                    daysEl.textContent = 'Licencia permanente';
                    daysEl.style.color = 'var(--green)';
                }
            }
        }
        
        // Características
        if (featuresEl) {
            var features = this.licencia.features || {};
            var html = '';
            
            if (features.casosBasicos) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos BÁSICOS</div>';
            if (features.casosMaster) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos MASTER</div>';
            if (features.casosElite) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos ELITE</div>';
            if (features.casosPericial) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos PERICIAL</div>';
            if (features.insignias) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Insignias PNG</div>';
            if (features.dashboard) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Dashboard ' + features.dashboard + '</div>';
            if (features.predictivo) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Riesgo Predictivo</div>';
            if (features.whiteLabel) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> White Label</div>';
            if (features.multiUsuario) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> ' + features.multiUsuario + ' Trabajadores</div>';
            
            if (html === '') {
                html = '<div style="font-size:12px;color:var(--ink4);">Plan DEMO - Características básicas</div>';
            }
            
            featuresEl.innerHTML = html;
        }
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
    
    // ─────────────────────────────────────────────────────────────────────
    // DESCARGAR CERTIFICADO DE EXAMEN (CORREGIDO PARA MULTI-USUARIO)
    // ─────────────────────────────────────────────────────────────────────
    descargarCertificado: function() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') { 
            alert('Solo para aprobados'); 
            return; 
        }
        
        var self = this;
        
        // ✅ VERIFICAR SI HAY TRABAJADOR SELECCIONADO
        var t = MultiUsuario.getTrabajadorActual();
        var usuarioParaCertificado = t ? t : this.userData;
        
        if (typeof generarCertificado !== 'function') {
            alert('❌ Error: Función de certificado no cargada. Recarga la página (Ctrl+F5).');
            console.error('generarCertificado no está definida');
            return;
        }
        
        generarCertificado(usuarioParaCertificado, this.examenActual, this.resultadoActual).then(function(url) {
            var a = document.createElement('a');
            a.download = 'RayoShield_CERTIFICADO_EXAMEN_' + usuarioParaCertificado.nombre.replace(/\s/g, '_') + '_' + Date.now() + '.png';
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
    // DESCARGAR CERTIFICADO DE CASO (CORREGIDO PARA MULTI-USUARIO)
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
        
        // ✅ VERIFICAR SI HAY TRABAJADOR SELECCIONADO
        var t = MultiUsuario.getTrabajadorActual();
        var usuarioParaCertificado = t ? t : this.userData;
        
        // ✅ DETERMINAR NIVEL DEL CERTIFICADO
        var nivelCertificado = '';
        if (this.casoActual.nivel === 'basico') nivelCertificado = 'BÁSICO';
        else if (this.casoActual.nivel === 'master') nivelCertificado = 'MASTER';
        else if (this.casoActual.nivel === 'elite') nivelCertificado = 'ELITE';
        else if (this.casoActual.nivel === 'pericial') nivelCertificado = 'PERICIAL';
        else nivelCertificado = 'COMPLETADO';
        
        if (typeof generarCertificadoCaso !== 'function') {
            alert('❌ Error: Función de certificado no cargada. Recarga la página.');
            console.error('generarCertificadoCaso no está definida');
            return;
        }
        
        generarCertificadoCaso(usuarioParaCertificado, this.casoActual, this.resultadoCaso, nivelCertificado, conMarcaDeAgua).then(function(url) {
            var a = document.createElement('a');
            a.download = 'RayoShield_CERTIFICADO_' + nivelCertificado + '_' + usuarioParaCertificado.nombre.replace(/\s/g, '_') + '_' + Date.now() + '.png';
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
    // DESCARGAR INSIGNIA (CORREGIDO PARA MULTI-USUARIO)
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
        
        // ✅ VERIFICAR SI HAY TRABAJADOR SELECCIONADO
        var t = MultiUsuario.getTrabajadorActual();
        var usuarioParaCertificado = t ? t : this.userData;
        
        if (typeof generarInsigniaPNG !== 'function') {
            alert('❌ Error: Función de insignia no cargada. Recarga la página.');
            console.error('generarInsigniaPNG no está definida');
            return;
        }
        
        generarInsigniaPNG(usuarioParaCertificado, this.casoActual, this.resultadoCaso).then(function(url) {
            var a = document.createElement('a');
            a.download = 'RayoShield_INSIGNIA_' + usuarioParaCertificado.nombre.replace(/\s/g, '_') + '_' + Date.now() + '.png';
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
    // ✅ AGREGAR ESTA FUNCIÓN
    cerrarSesion: function() {
        if (confirm('¿Cerrar sesión? Se borrarán los datos locales.')) {
            localStorage.removeItem('rayoshield_licencia');
            localStorage.removeItem('rayoshield_usuario');
            localStorage.removeItem('rayoshield_historial');
            localStorage.removeItem('rayoshield_progreso');
            location.reload();
        }
    },
    // ✅ AGREGAR ESTA FUNCIÓN
    mostrarPerfil: function() {
        this.actualizarPerfil();
        this.mostrarPantalla('perfil-screen');
    },
    
    // ✅ AGREGAR ESTA FUNCIÓN
    actualizarPerfil: function() {
        document.getElementById('perfil-nombre').textContent = this.userData.nombre || 'Usuario';
        document.getElementById('perfil-nombre-input').value = this.userData.nombre || '';
        document.getElementById('perfil-empresa-input').value = this.userData.empresa || '';
        document.getElementById('perfil-puesto-input').value = this.userData.puesto || '';
        document.getElementById('perfil-curp-input').value = this.userData.curp || '';
        
        document.getElementById('perfil-plan').textContent = this.licencia.tipo;
        
        var hist = this.obtenerHistorial();
        var aprobados = hist.filter(h => h.estado === 'Aprobado').length;
        var promedio = hist.length > 0 ? Math.round(hist.reduce((a,b) => a + b.score, 0) / hist.length) : 0;
        
        document.getElementById('perf-promedio').textContent = promedio + '%';
        document.getElementById('perf-examenes').textContent = hist.length;
        document.getElementById('perf-aprobados').textContent = aprobados;
        document.getElementById('perfil-examenes').textContent = hist.length + ' Exámenes';
        
        var logroExamen = document.getElementById('logro-examen');
        if (hist.length >= 1) { 
            logroExamen.textContent = '✅'; 
            logroExamen.parentElement.style.opacity = '1'; 
        }
        
        var actividadEl = document.getElementById('perfil-actividad');
        if (hist.length > 0) {
            actividadEl.innerHTML = hist.slice(-5).reverse().map(function(h) {
                var color = h.estado === 'Aprobado' ? 'g' : 'r';
                return '<div class="act-item"><div class="act-dot ' + color + '"></div><div class="act-text"><strong>' + h.examen + '</strong> — ' + h.score + '% (' + h.estado + ')</div><div class="act-time">' + new Date(h.fecha).toLocaleDateString('es-MX') + '</div></div>';
            }).join('');
        }
    },
    
    // ✅ AGREGAR ESTA FUNCIÓN
    editarPerfil: function() {
        this.mostrarDatosUsuario();
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
    
    // ─────────────────────────────────────────────────────────────────────
    // MOSTRAR HISTORIAL (ACTUALIZADO)
    // ─────────────────────────────────────────────────────────────────────
    mostrarHistorial: function() {
        this.renderHistorial();
        this.llenarFiltroTrabajadoresHistorial();
        this.mostrarPantalla('history-screen');
    },
    
    // ✅ NUEVA FUNCIÓN - Llenar filtro de trabajadores
    llenarFiltroTrabajadoresHistorial: function() {
        var select = document.getElementById('historial-filtro-trabajador');
        if (!select) return;
        
        // Guardar selección actual
        var seleccionActual = select.value;
        
        // Limpiar opciones (mantener primeras 2)
        select.innerHTML = '<option value="todos">Todos los usuarios</option><option value="admin">Solo Admin</option>';
        
        // Agregar trabajadores
        if (typeof MultiUsuario !== 'undefined') {
            var trabajadores = MultiUsuario.getTrabajadores();
            trabajadores.forEach(function(t) {
                var option = document.createElement('option');
                option.value = t.id;
                option.textContent = '👷 ' + t.nombre;
                select.appendChild(option);
            });
        }
        
        // Restaurar selección
        select.value = seleccionActual;
    },
    
    // ✅ NUEVA FUNCIÓN - Renderizar historial con filtro
    renderHistorial: function() {
        var list = document.getElementById('history-list');
        if (!list) return;
        
        var filtro = document.getElementById('historial-filtro-trabajador');
        var filtroValor = filtro ? filtro.value : 'todos';
        
        var hist = this.obtenerHistorial();
        
        // Aplicar filtro
        if (filtroValor === 'admin') {
            hist = hist.filter(h => h.tipoUsuario === 'admin');
        } else if (filtroValor !== 'todos') {
            hist = hist.filter(h => h.trabajadorId === filtroValor);
        }
        
        if (hist.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--ink4);padding:40px 20px;">📭 Sin exámenes registrados</p>';
            return;
        }
        
        list.innerHTML = '<table style="width:100%;border-collapse:collapse;">' +
            '<thead><tr style="background:var(--bg);">' +
            '<th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--ink4);">Fecha</th>' +
            '<th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--ink4);">Usuario</th>' +
            '<th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:600;color:var(--ink4);">Examen</th>' +
            '<th style="padding:12px 16px;text-align:right;font-size:11px;font-weight:600;color:var(--ink4);">Puntaje</th>' +
            '<th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:600;color:var(--ink4);">Estado</th>' +
            '</tr></thead>' +
            '<tbody>' +
            hist.slice(-20).reverse().map(function(item) {
                var estadoClass = item.estado === 'Aprobado' ? 'status-ok' : 'status-pend';
                var estadoIcono = item.estado === 'Aprobado' ? '✅' : '❌';
                return '<tr style="border-bottom:1px solid var(--border);">' +
                    '<td style="padding:12px 16px;font-size:12px;color:var(--ink3);">' + new Date(item.fecha).toLocaleDateString('es-MX') + '</td>' +
                    '<td style="padding:12px 16px;font-size:12px;color:var(--ink);font-weight:600;">' + (item.usuario || 'N/A') + '</td>' +
                    '<td style="padding:12px 16px;font-size:12px;color:var(--ink2);">' + item.examen + '</td>' +
                    '<td style="padding:12px 16px;font-size:12px;font-weight:700;color:var(--ink);text-align:right;">' + item.score + '%</td>' +
                    '<td style="padding:12px 16px;text-align:center;"><span class="activity-status ' + estadoClass + '">' + estadoIcono + ' ' + item.estado + '</span></td>' +
                    '</tr>';
            }).join('') +
            '</tbody></table>';
    },
    
    mostrarLicencia: function() {
        this.mostrarPantalla('license-screen');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // CASOS CRÍTICOS - INVESTIGACIÓN MASTER (CORREGIDO)
    // ─────────────────────────────────────────────────────────────────────
    irACasosMaster: function() {
        this.detenerTimerCaso();
        
        // ✅ VALIDAR QUE LOS ELEMENTOS EXISTEN
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
    
    // ─────────────────────────────────────────────────────────────────────
    // CARGAR CASO MASTER (CORREGIDO - SOLO ESPERAR CARGA)
    // ─────────────────────────────────────────────────────────────────────
    cargarCasoMaster: async function(casoId) {
        console.log('📋 Cargando caso:', casoId);
        
        // ✅ VALIDAR ELEMENTOS DEL DOM PRIMERO
        var casosList = document.getElementById('casos-list');
        var casoDetalle = document.getElementById('caso-detalle');
        
        if (casosList) casosList.style.display = 'none';
        if (casoDetalle) casoDetalle.style.display = 'block';
        
        // ✅ CARGAR CASO DESDE JSON (ya tienes la función)
        var caso = await cargarCasoInvestigacion(casoId);
        
        if (!caso) {
            console.error('❌ Caso no encontrado:', casoId);
            alert('❌ Error: Caso no encontrado. Verifica el archivo JSON.');
            return;
        }
        
        console.log('✅ Caso cargado:', caso.titulo);
        
        this.casoActual = caso;
        this.respuestasCaso = {};
        
        // ✅ LLENAR FICHA DEL CASO
        var elId = document.getElementById('caso-id');
        var elFecha = document.getElementById('caso-fecha');
        var elIndustria = document.getElementById('caso-industria');
        var elTiempo = document.getElementById('caso-tiempo');
        var elDescripcion = document.getElementById('caso-descripcion');
        var elTimeline = document.getElementById('caso-timeline');
        var elEnergias = document.getElementById('caso-energias');
        var elPreguntas = document.getElementById('caso-preguntas');
        var btnEnviar = document.getElementById('btn-enviar-caso');
        
        if (elId) elId.textContent = caso.id || 'N/A';
        if (elFecha) elFecha.textContent = caso.fecha_evento || 'N/A';
        if (elIndustria) elIndustria.textContent = caso.industria || 'N/A';
        if (elTiempo) elTiempo.textContent = caso.tiempo_estimado || '15 min';
        
        // ✅ DESCRIPCIÓN (tu estructura ya es correcta)
        if (elDescripcion && caso.descripcion_evento) {
            var desc = caso.descripcion_evento;
            elDescripcion.innerHTML = '<div style="background:var(--bg);padding:15px;border-radius:10px;margin:15px 0;">' +
                '<strong>📋 Descripción del Evento:</strong>' +
                '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;">' +
                '<div><strong>Actividad:</strong> ' + (desc.actividad || 'N/A') + '</div>' +
                '<div><strong>Equipo:</strong> ' + (desc.equipo || 'N/A') + '</div>' +
                '<div><strong>Evento:</strong> ' + (desc.evento || 'N/A') + '</div>' +
                '<div><strong>Resultado:</strong> ' + (desc.resultado || 'N/A') + '</div>' +
                '<div><strong style="color:var(--rose);">Clasificación:</strong> ' + (desc.clasificacion || 'N/A') + '</div>' +
                '</div></div>';
        }
        
        // ✅ TIMELINE (tu array ya es correcto)
        if (elTimeline && caso.linea_tiempo) {
            elTimeline.innerHTML = '<div class="timeline">' + caso.linea_tiempo.map(function(evento) {
                var esCritico = evento.toLowerCase().includes('descarga') || evento.toLowerCase().includes('contacto');
                return '<div class="timeline-item' + (esCritico ? ' evento-critico' : '') + '">' + evento + '</div>';
            }).join('') + '</div>';
        }
        
        // ✅ ENERGÍAS (tu objeto ya es correcto)
        if (elEnergias && caso.energias_identificadas) {
            elEnergias.innerHTML = '<div class="energia-grid">' + Object.keys(caso.energias_identificadas).map(function(tipo) {
                var estado = caso.energias_identificadas[tipo];
                var esPeligro = estado.includes('ENERGIZADO') || estado.includes('SIN');
                return '<div class="energia-item ' + (esPeligro ? 'no-aislada' : 'aislada') + '">' +
                    '<strong>' + tipo + '</strong><br><small>' + estado + '</small></div>';
            }).join('') + '</div>';
        }
        
        // ✅ PREGUNTAS (tu array ya es correcto)
        if (elPreguntas && caso.preguntas) {
            console.log('📝 Renderizando', caso.preguntas.length, 'preguntas');
            elPreguntas.innerHTML = '';
            var self = this;
            
            caso.preguntas.forEach(function(pregunta, idx) {
                var preguntaDiv = document.createElement('div');
                preguntaDiv.className = 'pregunta-master';
                preguntaDiv.innerHTML = '<h4>🔍 Pregunta ' + (idx + 1) + ' - ' + pregunta.peso + ' pts</h4><p>' + pregunta.pregunta + '</p>';
                
                if (pregunta.tipo === 'analisis_multiple') {
                    preguntaDiv.appendChild(self.renderAnalisisMultiple(pregunta));
                } else if (pregunta.tipo === 'respuesta_abierta_guiada') {
                    preguntaDiv.appendChild(self.renderRespuestaAbierta(pregunta));
                } else if (pregunta.tipo === 'plan_accion') {
                    preguntaDiv.appendChild(self.renderPlanAccion(pregunta));
                }
                
                elPreguntas.appendChild(preguntaDiv);
            });
        }
        
        // ✅ MOSTRAR BOTÓN ENVIAR
        if (btnEnviar) btnEnviar.style.display = 'inline-block';
        
        // ✅ INICIAR TIMER
        this.iniciarTimerCaso();
        
        console.log('✅ Caso cargado correctamente');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // RENDERIZAR PREGUNTAS DE CASO (ACTUALIZADO CON TEMA SMARTCOT)
    // ─────────────────────────────────────────────────────────────────────
    
    renderAnalisisMultiple: function(pregunta) {
        var container = document.createElement('div');
        var self = this;
        
        pregunta.opciones.forEach(function(opt, idx) {
            var label = document.createElement('label');
            label.className = 'opcion-sistemica';
            label.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--bg);border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;cursor:pointer;transition:all 0.15s;';
            
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'pregunta-' + pregunta.id;
            checkbox.value = idx;
            checkbox.style.marginTop = '4px';
            checkbox.style.width = '18px';
            checkbox.style.height = '18px';
            checkbox.style.cursor = 'pointer';
            
            var textoSpan = document.createElement('span');
            textoSpan.className = 'texto-opcion';
            textoSpan.style.cssText = 'font-size:13px;line-height:1.5;color:var(--ink2);flex:1;';
            textoSpan.textContent = opt.texto || opt;
            
            label.appendChild(checkbox);
            label.appendChild(textoSpan);
            
            label.onclick = function(e) {
                if (e.target === checkbox) {
                    label.classList.toggle('seleccionada');
                    if (label.classList.contains('seleccionada')) {
                        label.style.borderColor = 'var(--blue)';
                        label.style.background = 'var(--blue-l)';
                    } else {
                        label.style.borderColor = 'var(--border)';
                        label.style.background = 'var(--bg)';
                    }
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
        textarea.id = 'respuesta-' + pregunta.id;
        textarea.placeholder = 'Escribe tu análisis sistémico aquí... (mínimo 80 caracteres)';
        textarea.style.cssText = 'width:100%;min-height:120px;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--ink);font-family:var(--font);font-size:14px;resize:vertical;';
        textarea.onfocus = function() {
            this.style.borderColor = 'var(--blue)';
            this.style.background = 'var(--white)';
        };
        textarea.onblur = function() {
            this.style.borderColor = 'var(--border)';
            this.style.background = 'var(--bg)';
        };
        container.appendChild(textarea);
        
        if (pregunta.feedback_guiado) {
            var pista = document.createElement('div');
            pista.className = 'pista-experto';
            pista.style.cssText = 'background:var(--blue-l);padding:12px 14px;border-radius:var(--radius-sm);margin-top:10px;font-size:12px;color:var(--blue);border-left:3px solid var(--blue);';
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
            row.style.cssText = 'background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;';
            
            var roleName = document.createElement('div');
            roleName.className = 'role-name';
            roleName.style.cssText = 'font-size:12px;font-weight:700;color:var(--ink);margin-bottom:8px;';
            roleName.textContent = role.rol;
            row.appendChild(roleName);
            
            var optionsDiv = document.createElement('div');
            optionsDiv.className = 'role-options';
            optionsDiv.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;';
            
            role.opciones.forEach(function(opt, optIdx) {
                var label = document.createElement('label');
                label.className = 'role-option';
                label.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;transition:all 0.15s;';
                
                var radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'responsabilidad-' + pregunta.id + '-' + roleIdx;
                radio.value = optIdx;
                radio.style.width = '16px';
                radio.style.height = '16px';
                radio.style.cursor = 'pointer';
                
                var span = document.createElement('span');
                span.style.cssText = 'font-size:12px;font-weight:500;color:var(--ink);';
                span.textContent = opt.nivel;
                
                label.appendChild(radio);
                label.appendChild(span);
                
                label.onclick = function(e) {
                    if (e.target.tagName === 'INPUT') {
                        row.querySelectorAll('input').forEach(function(r) { 
                            r.closest('label').style.borderColor = 'var(--border)';
                            r.closest('label').style.background = 'var(--white)';
                        });
                        label.style.borderColor = 'var(--blue)';
                        label.style.background = 'var(--blue-l)';
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
            item.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--bg);border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;cursor:pointer;transition:all 0.15s;';
            
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'plan-' + pregunta.id;
            checkbox.value = idx;
            checkbox.style.marginTop = '4px';
            checkbox.style.width = '18px';
            checkbox.style.height = '18px';
            checkbox.style.cursor = 'pointer';
            
            var texto = opt.texto || opt.accion || opt;
            var jerarquia = opt.jerarquia || opt.clasificacion || 'administrativo';
            var prioridad = opt.prioridad || '';
            
            var textoDiv = document.createElement('div');
            textoDiv.style.cssText = 'flex:1;';
            textoDiv.innerHTML = '<strong style="font-size:13px;color:var(--ink);">' + texto + '</strong>' +
                                '<div style="margin-top:5px;">' +
                                '<span class="accion-jerarquia ' + jerarquia + '" style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;font-family:var(--mono);text-transform:uppercase;' +
                                (jerarquia === 'ingenieria' ? 'background:var(--blue-l);color:var(--blue);' : 
                                 jerarquia === 'administrativo' ? 'background:var(--amber-l);color:var(--amber);' : 
                                 'background:var(--green-l);color:var(--green);') + '">' + jerarquia + '</span>' +
                                (prioridad ? '<span style="margin-left:10px;font-size:11px;color:var(--ink3);">• Prioridad: ' + prioridad + '</span>' : '') +
                                '</div>';
            
            item.appendChild(checkbox);
            item.appendChild(textoDiv);
            
            item.onclick = function(e) {
                if (e.target.tagName === 'INPUT') {
                    item.classList.toggle('seleccionada');
                    if (item.classList.contains('seleccionada')) {
                        item.style.borderColor = 'var(--blue)';
                        item.style.background = 'var(--blue-l)';
                    } else {
                        item.style.borderColor = 'var(--border)';
                        item.style.background = 'var(--bg)';
                    }
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
        instrucciones.style.cssText = 'color:var(--ink3);font-size:13px;margin:10px 0;';
        instrucciones.textContent = 'Arrastra los elementos para ordenarlos en la secuencia correcta';
        container.appendChild(instrucciones);
        
        var ordenContainer = document.createElement('div');
        ordenContainer.className = 'orden-container';
        ordenContainer.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin:15px 0;';
        
        pregunta.opciones.forEach(function(opt, idx) {
            var item = document.createElement('div');
            item.className = 'orden-item';
            item.style.cssText = 'display:flex;align-items:center;gap:15px;padding:15px;background:var(--bg);border:2px solid var(--border);border-radius:var(--radius-sm);cursor:move;transition:all 0.15s;';
            item.draggable = true;
            item.dataset.index = idx;
            
            var numero = document.createElement('div');
            numero.className = 'orden-numero';
            numero.style.cssText = 'width:30px;height:30px;background:var(--blue);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-family:var(--mono);font-size:13px;flex-shrink:0;';
            numero.textContent = idx + 1;
            
            var texto = document.createElement('span');
            texto.style.cssText = 'flex:1;font-size:13px;color:var(--ink);';
            texto.textContent = opt;
            
            item.appendChild(numero);
            item.appendChild(texto);
            
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', idx);
                this.style.opacity = '0.5';
                this.style.borderColor = 'var(--blue)';
            });
            item.addEventListener('dragend', function() {
                this.style.opacity = '1';
                this.style.borderColor = 'var(--border)';
                self.actualizarOrdenNumeros(ordenContainer);
            });
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = 'var(--blue)';
                this.style.background = 'var(--blue-l)';
            });
            item.addEventListener('dragleave', function() {
                this.style.borderColor = 'var(--border)';
                this.style.background = 'var(--bg)';
            });
            item.addEventListener('drop', function(e) {
                e.preventDefault();
                this.style.borderColor = 'var(--border)';
                this.style.background = 'var(--bg)';
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
            variablesDiv.style.cssText = 'background:var(--bg);padding:15px;border-radius:var(--radius-sm);margin:15px 0;border:1px solid var(--border);';
            Object.keys(pregunta.variables).forEach(function(variable) {
                var valor = Array.isArray(pregunta.variables[variable]) ? pregunta.variables[variable][0] : pregunta.variables[variable];
                var p = document.createElement('p');
                p.style.cssText = 'margin:5px 0;font-size:13px;color:var(--ink2);';
                p.innerHTML = '<strong style="color:var(--ink);font-family:var(--mono);">' + variable + ':</strong> <span style="font-family:var(--mono);color:var(--blue);font-weight:600;">' + valor + '</span>';
                variablesDiv.appendChild(p);
            });
            container.appendChild(variablesDiv);
        }
        
        var inputDiv = document.createElement('div');
        inputDiv.style.cssText = 'margin:15px 0;';
        var input = document.createElement('input');
        input.type = 'number';
        input.id = 'respuesta-' + pregunta.id;
        input.placeholder = 'Ingresa tu respuesta';
        input.style.cssText = 'width:100%;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;color:var(--ink);font-family:var(--mono);';
        input.onfocus = function() {
            this.style.borderColor = 'var(--blue)';
            this.style.background = 'var(--white)';
        };
        input.onblur = function() {
            this.style.borderColor = 'var(--border)';
            this.style.background = 'var(--bg)';
        };
        inputDiv.appendChild(input);
        container.appendChild(inputDiv);
        
        if (pregunta.ayuda) {
            var ayudaDiv = document.createElement('div');
            ayudaDiv.style.cssText = 'background:var(--blue-l);padding:12px 14px;border-radius:var(--radius-sm);margin:15px 0;border-left:3px solid var(--blue);font-size:12px;color:var(--blue);';
            ayudaDiv.innerHTML = '<strong>💡 Ayuda:</strong> ' + pregunta.ayuda;
            container.appendChild(ayudaDiv);
        }
        
        return container;
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // ENVIAR RESPUESTAS DE CASO (CORREGIDO)
    // ─────────────────────────────────────────────────────────────────────
    enviarRespuestasCaso: function() {
        if (!this.casoActual) {
            console.error('❌ No hay caso actual');
            return;
        }
        
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
        
        // ✅ EVALUAR CON SMART EVALUATION V2
        var resultado = SmartEvaluationV2.evaluarConDimensiones(respuestasPorPregunta, this.casoActual);
        this.resultadoCaso = resultado;
        this.mostrarResultadoCaso(resultado);
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // MOSTRAR RESULTADO DE CASO (CORREGIDO)
    // ─────────────────────────────────────────────────────────────────────
    mostrarResultadoCaso: function(resultado) {
        var resultadoEl = document.getElementById('caso-resultado');
        if (!resultadoEl) {
            console.error('❌ Elemento caso-resultado no encontrado');
            return;
        }
        
        resultadoEl.style.display = 'block';
        resultadoEl.scrollIntoView({ behavior: 'smooth' });
        
        this.detenerTimerCaso();
        
        // ✅ VALIDAR ELEMENTOS DE BOTONES
        var btnEnviar = document.getElementById('btn-enviar-caso');
        var casoBotones = document.getElementById('caso-botones');
        
        if (btnEnviar) btnEnviar.style.display = 'none';
        
        // ✅ DETERMINAR QUÉ BOTONES MOSTRAR SEGÚN PLAN
        var mostrarCertificado = false;
        var mostrarInsignia = false;
        var conMarcaDeAgua = false;
        
        if (this.licencia.tipo === 'DEMO') {
            mostrarCertificado = true;
            mostrarInsignia = false;
            conMarcaDeAgua = true;
        } else if (this.licencia.tipo === 'PROFESIONAL') {
            mostrarCertificado = true;
            mostrarInsignia = false;
            conMarcaDeAgua = false;
        } else if (this.licencia.tipo === 'CONSULTOR') {
            mostrarCertificado = true;
            mostrarInsignia = resultado.aprobado && this.casoActual && this.casoActual.nivel !== 'basico';
            conMarcaDeAgua = false;
        } else if (this.licencia.tipo === 'EMPRESARIAL') {
            mostrarCertificado = true;
            mostrarInsignia = resultado.aprobado;
            conMarcaDeAgua = false;
        }
        
        // ✅ DETERMINAR NIVEL DEL CERTIFICADO
        var nivelCertificado = '';
        if (this.casoActual && this.casoActual.nivel === 'basico') nivelCertificado = 'BÁSICO';
        else if (this.casoActual && this.casoActual.nivel === 'master') nivelCertificado = 'MASTER';
        else if (this.casoActual && this.casoActual.nivel === 'elite') nivelCertificado = 'ELITE';
        else if (this.casoActual && this.casoActual.nivel === 'pericial') nivelCertificado = 'PERICIAL';
        else nivelCertificado = 'COMPLETADO';
        
        // ✅ GENERAR BOTONES
        var botonesHTML = '';
        if (resultado.aprobado) {
            botonesHTML = '<div class="button-group" style="margin-top:20px;display:flex;gap:15px;flex-wrap:wrap;justify-content:center;">';
            
            if (mostrarCertificado) {
                botonesHTML += '<button class="btn btn-primary" onclick="app.descargarCertificadoCaso(' + conMarcaDeAgua + ')" style="background:linear-gradient(135deg,var(--blue),var(--indigo));color:white;font-weight:bold;padding:14px 28px;">📄 Descargar Certificado</button>';
            }
            
            if (mostrarInsignia) {
                botonesHTML += '<button class="btn btn-primary" onclick="app.descargarInsignia()" style="background:linear-gradient(135deg,var(--amber),#f59e0b);color:#1a1a1a;font-weight:bold;padding:14px 28px;">🏅 Descargar Insignia</button>';
            }
            
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverAListaCasos()" style="padding:14px 28px;">🔄 Otro caso</button>';
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverHome()" style="padding:14px 28px;">🏠 Inicio</button>';
            botonesHTML += '</div>';
        } else {
            botonesHTML = '<div class="button-group" style="margin-top:20px;display:flex;gap:15px;flex-wrap:wrap;justify-content:center;">';
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverAListaCasos()" style="padding:14px 28px;">🔄 Intentar otro caso</button>';
            botonesHTML += '<button class="btn btn-secondary" onclick="app.volverHome()" style="padding:14px 28px;">🏠 Inicio</button>';
            botonesHTML += '</div>';
        }
        
        // ✅ RENDERIZAR RESULTADO CON COLORES CORRECTOS
        var claseEstado = resultado.aprobado ? 'aprobado' : 'no-aprobado';
        var icono = resultado.aprobado ? '✅' : '📚';
        var estadoTexto = resultado.aprobado ? '✅ APROBADO - Nivel ' + nivelCertificado : '📚 Requiere repaso';
        
        resultadoEl.innerHTML = '<div class="resultado-investigacion ' + claseEstado + '" style="background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:24px;text-align:center;margin:20px 0;"><h2>' + icono + ' Resultado de la Investigación</h2><div class="puntaje-master" style="font-size:56px;font-weight:800;font-family:var(--mono);color:var(--ink);margin:20px 0;letter-spacing:-2px;">' + resultado.porcentaje + '%</div><p><strong>Puntaje:</strong> ' + resultado.puntajeTotal + ' / ' + resultado.puntajeMaximo + '</p><p><strong>Estado:</strong> ' + estadoTexto + '</p><p><strong>Nivel del Caso:</strong> ' + nivelCertificado + '</p></div>' + 
        (resultado.feedback.length > 0 ? '<div style="margin:20px 0;padding:20px;background:#FFF3E0;border-radius:10px;border-left:4px solid #FF9800;"><strong style="color:#E65100;">💡 Retroalimentación:</strong><ul style="margin-top:10px;color:#5D4037;">' + resultado.feedback.map(function(f) { return '<li style="padding:5px 0;">' + f + '</li>'; }).join('') + '</ul></div>' : '') + 
        '<div class="leccion-master" style="background:var(--bg);padding:20px;border-radius:10px;margin:20px 0;text-align:left;"><strong style="color:var(--ink);font-size:13px;">🎓 Lección Aprendida:</strong><p style="margin-top:10px;color:var(--ink2);font-size:14px;line-height:1.6;">' + resultado.leccion + '</p></div>' + 
        '<div style="background:#E8F5E9;padding:20px;border-radius:10px;margin:20px 0;border-left:4px solid #4CAF50;"><strong style="color:#2E7D32;">📋 Conclusión Oficial:</strong><p style="margin-top:10px;line-height:1.6;color:#1B5E20;">' + resultado.conclusion + '</p></div>' + botonesHTML;
        
        if (casoBotones) casoBotones.style.display = 'none';
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
    
    // ─────────────────────────────────────────────────────────────────────
    // VOLVER A LISTA DE CASOS (CORREGIDO CON VALIDACIONES)
    // ─────────────────────────────────────────────────────────────────────
    volverAListaCasos: function() {
        this.detenerTimerCaso();
        
        // ✅ VALIDAR QUE LOS ELEMENTOS EXISTEN ANTES DE ACCEDER
        var casosList = document.getElementById('casos-list');
        var casoDetalle = document.getElementById('caso-detalle');
        var casosMainButtons = document.getElementById('casos-main-buttons');
        var casoResultado = document.getElementById('caso-resultado');
        var btnEnviar = document.getElementById('btn-enviar-caso');
        
        if (casosList) casosList.style.display = 'block';
        if (casoDetalle) casoDetalle.style.display = 'none';
        if (casosMainButtons) casosMainButtons.style.display = 'block';
        if (casoResultado) casoResultado.style.display = 'none';
        if (btnEnviar) btnEnviar.style.display = 'none';
        
        // ✅ LIMPIAR ESTADO
        this.casoActual = null;
        this.respuestasCaso = {};
        this.resultadoCaso = null;
        
        console.log('✅ Volviendo a lista de casos');
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
    // HISTORIAL (ACTUALIZADO PARA MULTI-USUARIO)
    // ─────────────────────────────────────────────────────────────────────
    guardarEnHistorial: function() {
        var hist = this.obtenerHistorial();
        
        // ✅ VERIFICAR SI HAY TRABAJADOR SELECCIONADO
        var t = MultiUsuario.getTrabajadorActual();
        var usuarioParaHistorial = t ? t.nombre : this.userData.nombre;
        var tipoUsuario = t ? 'trabajador' : 'admin';
        
        hist.push({
            examen: this.examenActual ? this.examenActual.titulo : 'Desconocido',
            norma: this.examenActual ? this.examenActual.norma : '',
            score: this.resultadoActual ? this.resultadoActual.score : 0,
            estado: this.resultadoActual ? this.resultadoActual.estado : '',
            fecha: this.resultadoActual ? this.resultadoActual.fecha : new Date().toISOString(),
            usuario: usuarioParaHistorial,
            tipoUsuario: tipoUsuario,
            trabajadorId: t ? t.id : null
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
    },
    
    obtenerHistorial: function() {
        try { var h = localStorage.getItem('rayoshield_historial'); return h ? JSON.parse(h) : []; } catch(e) { return []; }
    },
    
    // ✅ NUEVA FUNCIÓN - Historial filtrado por trabajador
    obtenerHistorialPorTrabajador: function(trabajadorId) {
        var hist = this.obtenerHistorial();
        if (!trabajadorId) return hist;
        return hist.filter(h => h.trabajadorId === trabajadorId);
    },
    
    // ✅ NUEVA FUNCIÓN - Historial solo del admin
    obtenerHistorialAdmin: function() {
        var hist = this.obtenerHistorial();
        return hist.filter(h => h.tipoUsuario === 'admin');
    },
    
    cargarHistorial: function() { console.log('Historial:', this.obtenerHistorial().length, 'exámenes'); },

// ─────────────────────────────────────────────────────────────────────
// GESTIÓN DE TRABAJADORES (MULTI-USUARIO) - DENTRO DE APP
// ─────────────────────────────────────────────────────────────────────
mostrarTrabajadores: function() {
    this.renderTrabajadores();
    this.mostrarPantalla('trabajadores-screen');
},

renderTrabajadores: function() {
    if (typeof MultiUsuario === 'undefined') {
        console.error('❌ MultiUsuario no está definido');
        return;
    }
    var trabajadores = MultiUsuario.getTrabajadores();
    var filtro = document.getElementById('filtro-estado') ? document.getElementById('filtro-estado').value : 'todos';
    var busqueda = document.getElementById('buscar-trabajador') ? document.getElementById('buscar-trabajador').value.toLowerCase() : '';
    if (filtro !== 'todos') {
        trabajadores = trabajadores.filter(t => t.estado === filtro);
    }
    if (busqueda) {
        trabajadores = trabajadores.filter(t =>
            t.nombre.toLowerCase().includes(busqueda) ||
            t.curp.toLowerCase().includes(busqueda) ||
            (t.puesto && t.puesto.toLowerCase().includes(busqueda))
        );
    }
    var tbody = document.getElementById('trabajadores-tabla');
    var vacio = document.getElementById('trabajadores-vacio');
    if (!tbody) return;
    if (trabajadores.length === 0) {
        tbody.innerHTML = '';
        if (vacio) vacio.style.display = 'block';
        return;
    }
    if (vacio) vacio.style.display = 'none';
    tbody.innerHTML = trabajadores.map(function(t) {
        var progreso = MultiUsuario.getProgresoByTrabajador(t.id);
        var estadoClass = t.estado === 'activo' ? 'status-ok' : 'status-pend';
        var estadoTexto = t.estado === 'activo' ? '✅ Activo' : '⏸️ Inactivo';
        return '<tr style="border-bottom:1px solid var(--border);">' +
            '<td style="padding:14px 18px;">' +
            '<div style="font-weight:600;color:var(--ink);">' + t.nombre + '</div>' +
            '<div style="font-size:11px;color:var(--ink4);font-family:var(--mono);margin-top:4px;">' + t.curp + '</div>' +
            '</td>' +
            '<td style="padding:14px 18px;">' +
            '<div style="color:var(--ink);">' + (t.puesto || 'N/A') + '</div>' +
            '<div style="font-size:11px;color:var(--ink4);">' + (t.area || '') + '</div>' +
            '</td>' +
            '<td style="padding:14px 18px;">' +
            '<div style="color:var(--ink);">' + progreso.total_examenes + ' exámenes</div>' +
            '<div style="font-size:11px;color:var(--ink4);">' + progreso.total_casos + ' casos</div>' +
            '</td>' +
            '<td style="padding:14px 18px;">' +
            '<div style="font-weight:700;color:' + (progreso.promedio >= 80 ? 'var(--green)' : 'var(--amber)') + ';">' + progreso.promedio + '%</div>' +
            '</td>' +
            '<td style="padding:14px 18px;">' +
            '<span class="activity-status ' + estadoClass + '" style="display:inline-block;">' + estadoTexto + '</span>' +
            '</td>' +
            '<td style="padding:14px 18px;text-align:center;">' +
            '<div class="td-actions" style="justify-content:center;">' +
            '<button class="tbl-btn view" onclick="app.verProgresoTrabajador(\'' + t.id + '\')" title="Ver progreso">📊</button>' +
            '<button class="tbl-btn pdf" onclick="app.editarTrabajador(\'' + t.id + '\')" title="Editar">✏️</button>' +
            '<button class="tbl-btn" style="background:var(--rose-l);color:var(--rose);" onclick="app.eliminarTrabajador(\'' + t.id + '\')" title="Eliminar">🗑️</button>' +
            '</div>' +
            '</td>' +
            '</tr>';
    }).join('');
    this.actualizarEstadisticasTrabajadores();
    this.actualizarBadgeTrabajadores();
},

actualizarEstadisticasTrabajadores: function() {
    if (typeof MultiUsuario === 'undefined') return;
    var stats = MultiUsuario.getEstadisticas();
    var el1 = document.getElementById('stat-trabajadores-total');
    var el2 = document.getElementById('stat-trabajadores-activos');
    var el3 = document.getElementById('stat-examenes-total');
    var el4 = document.getElementById('stat-tasa-aprobacion');
    if (el1) el1.textContent = stats.trabajadores_totales;
    if (el2) el2.textContent = stats.trabajadores_activos;
    if (el3) el3.textContent = stats.examenes_totales + stats.casos_totales;
    if (el4) el4.textContent = stats.tasa_aprobacion + '%';
},

mostrarModalTrabajador: function() {
    document.getElementById('modal-trabajador-titulo').textContent = '👤 Nuevo Trabajador';
    document.getElementById('trabajador-id').value = '';
    document.getElementById('trabajador-nombre').value = '';
    document.getElementById('trabajador-curp').value = '';
    document.getElementById('trabajador-puesto').value = '';
    document.getElementById('trabajador-area').value = '';
    document.getElementById('trabajador-email').value = '';
    document.getElementById('trabajador-telefono').value = '';
    document.getElementById('trabajador-notas').value = '';
    document.getElementById('modal-trabajador').classList.add('active');
},

cerrarModalTrabajador: function() {
    document.getElementById('modal-trabajador').classList.remove('active');
},

guardarTrabajador: function() {
    if (typeof MultiUsuario === 'undefined') {
        alert('❌ Error: Sistema Multi-Usuario no cargado');
        return;
    }
    var id = document.getElementById('trabajador-id').value;
    var nombre = document.getElementById('trabajador-nombre').value.trim();
    var curp = document.getElementById('trabajador-curp').value.trim().toUpperCase();
    var puesto = document.getElementById('trabajador-puesto').value.trim();
    var area = document.getElementById('trabajador-area').value.trim();
    var email = document.getElementById('trabajador-email').value.trim();
    var telefono = document.getElementById('trabajador-telefono').value.trim();
    var notas = document.getElementById('trabajador-notas').value.trim();
    if (!nombre || !curp || !puesto) {
        alert('⚠️ Nombre, CURP y Puesto son obligatorios');
        return;
    }
    var data = { nombre, curp, puesto, area, email, telefono, notas };
    if (id) {
        MultiUsuario.updateTrabajador(id, data);
        alert('✅ Trabajador actualizado correctamente');
    } else {
        MultiUsuario.addTrabajador(data);
        alert('✅ Trabajador registrado correctamente');
    }
    this.cerrarModalTrabajador();
    this.renderTrabajadores();
},

editarTrabajador: function(id) {
    if (typeof MultiUsuario === 'undefined') return;
    var t = MultiUsuario.getTrabajadorById(id);
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
    if (typeof MultiUsuario === 'undefined') return;
    if (!confirm('⚠️ ¿Estás seguro de eliminar este trabajador?\nSe eliminarán también todos sus resultados de exámenes y casos.')) {
        return;
    }
    MultiUsuario.deleteTrabajador(id);
    alert('✅ Trabajador eliminado correctamente');
    this.renderTrabajadores();
    this.actualizarBadgeTrabajadores();
},

verProgresoTrabajador: function(id) {
    if (typeof MultiUsuario === 'undefined') return;
    var t = MultiUsuario.getTrabajadorById(id);
    var progreso = MultiUsuario.getProgresoByTrabajador(id);
    var resultados = MultiUsuario.getResultadosByTrabajador(id);
    if (!t) return;
    var infoEl = document.getElementById('progreso-info');
    var historialEl = document.getElementById('progreso-historial');
    if (infoEl) {
        infoEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;">' +
            '<div style="background:var(--bg);padding:15px;border-radius:var(--radius-sm);text-align:center;">' +
            '<div style="font-size:10px;color:var(--ink4);">Nombre</div>' +
            '<div style="font-size:16px;font-weight:700;color:var(--ink);">' + t.nombre + '</div>' +
            '</div>' +
            '<div style="background:var(--bg);padding:15px;border-radius:var(--radius-sm);text-align:center;">' +
            '<div style="font-size:10px;color:var(--ink4);">Puesto</div>' +
            '<div style="font-size:16px;font-weight:700;color:var(--ink);">' + (t.puesto || 'N/A') + '</div>' +
            '</div>' +
            '<div style="background:var(--bg);padding:15px;border-radius:var(--radius-sm);text-align:center;">' +
            '<div style="font-size:10px;color:var(--ink4);">Exámenes</div>' +
            '<div style="font-size:16px;font-weight:700;color:var(--blue);">' + progreso.total_examenes + '</div>' +
            '</div>' +
            '<div style="background:var(--bg);padding:15px;border-radius:var(--radius-sm);text-align:center;">' +
            '<div style="font-size:10px;color:var(--ink4);">Promedio</div>' +
            '<div style="font-size:16px;font-weight:700;color:' + (progreso.promedio >= 80 ? 'var(--green)' : 'var(--amber)') + ';">' + progreso.promedio + '%</div>' +
            '</div>' +
            '</div>';
    }
    if (historialEl) {
        if (resultados.length === 0) {
            historialEl.innerHTML = '<div style="padding:40px;text-align:center;color:var(--ink4);">Sin resultados registrados</div>';
        } else {
            historialEl.innerHTML = '<table style="width:100%;border-collapse:collapse;">' +
                '<thead><tr style="background:var(--bg);"><th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--ink4);">Fecha</th><th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--ink4);">Tipo</th><th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:600;color:var(--ink4);">Actividad</th><th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:600;color:var(--ink4);">Puntaje</th><th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:600;color:var(--ink4);">Estado</th></tr></thead>' +
                '<tbody>' +
                resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(function(r) {
                    var estadoClass = r.aprobado ? 'status-ok' : 'status-pend';
                    var estadoTexto = r.aprobado ? '✅ Aprobado' : '❌ Reprobado';
                    return '<tr style="border-bottom:1px solid var(--border);">' +
                        '<td style="padding:10px 14px;font-size:12px;color:var(--ink3);">' + new Date(r.fecha).toLocaleDateString('es-MX') + '</td>' +
                        '<td style="padding:10px 14px;font-size:12px;color:var(--ink3);">' + (r.tipo === 'examen' ? '📝 Examen' : '⚠️ Caso') + '</td>' +
                        '<td style="padding:10px 14px;font-size:12px;color:var(--ink);">' + r.actividad + '</td>' +
                        '<td style="padding:10px 14px;font-size:12px;font-weight:700;color:var(--ink);text-align:right;">' + r.puntaje + '%</td>' +
                        '<td style="padding:10px 14px;text-align:center;"><span class="activity-status ' + estadoClass + '">' + estadoTexto + '</span></td>' +
                        '</tr>';
                }).join('') +
                '</tbody></table>';
        }
    }
    document.getElementById('modal-progreso-trabajador').classList.add('active');
},

mostrarSeleccionarTrabajador: function() {
    if (typeof MultiUsuario === 'undefined') return;
    var trabajadores = MultiUsuario.getTrabajadores().filter(t => t.estado === 'activo');
    var lista = document.getElementById('kiosco-lista');
    if (!lista) return;
    lista.innerHTML = trabajadores.map(function(t) {
        return '<div onclick="app.seleccionarTrabajadorKiosco(\'' + t.id + '\')" style="padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;cursor:pointer;transition:all 0.15s;" onmouseover="this.style.borderColor=\'var(--blue)\';this.style.background=\'var(--blue-l)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.background=\'var(--bg)\'">' +
            '<div style="font-weight:600;color:var(--ink);">' + t.nombre + '</div>' +
            '<div style="font-size:11px;color:var(--ink4);font-family:var(--mono);">' + t.curp + ' • ' + (t.puesto || 'N/A') + '</div>' +
            '</div>';
    }).join('');
    document.getElementById('modal-seleccionar-trabajador').classList.add('active');
},

cerrarModalSeleccionarTrabajador: function() {
    document.getElementById('modal-seleccionar-trabajador').classList.remove('active');
},

filtrarKioscoTrabajadores: function() {
    var busqueda = document.getElementById('kiosco-buscar').value.toLowerCase();
    var items = document.querySelectorAll('#kiosco-lista > div');
    items.forEach(function(item) {
        var texto = item.textContent.toLowerCase();
        item.style.display = texto.includes(busqueda) ? 'block' : 'none';
    });
},

seleccionarTrabajadorKiosco: function(id) {
    if (typeof MultiUsuario === 'undefined') return;
    
    var t = MultiUsuario.getTrabajadorById(id);
    if (!t) return;
    
    // ✅ MENSAJE DE CONFIRMACIÓN
    var confirmar = confirm('👷 Cambiar a modo trabajador\n\n' +
        'Trabajador: ' + t.nombre + '\n' +
        'Puesto: ' + (t.puesto || 'N/A') + '\n\n' +
        '⚠️ Los próximos exámenes se guardarán a nombre de este trabajador.\n\n' +
        '¿Continuar?');
    
    if (!confirmar) return;
    
    MultiUsuario.setTrabajadorActual(id);
    this.cerrarModalSeleccionarTrabajador();
    this.actualizarTrabajadorActualUI();
    this.actualizarSidebarModoIndicador();
    
    alert('✅ Trabajador seleccionado: ' + t.nombre + '\n\nAhora puede realizar exámenes y casos.');
},    
// ─────────────────────────────────────────────────────────────────────
// ACTUALIZAR BADGE DE TRABAJADORES
// ─────────────────────────────────────────────────────────────────────
actualizarBadgeTrabajadores: function() {
    var badge = document.getElementById('nav-badge-trabajadores');
    if (!badge) return;
    
    if (typeof MultiUsuario === 'undefined') {
        badge.textContent = '0';
        return;
    }
    
    var trabajadores = MultiUsuario.getTrabajadores();
    var count = trabajadores ? trabajadores.length : 0;
    
    badge.textContent = count;
    
    // Mostrar/ocultar badge según cantidad
    if (count > 0) {
        badge.style.display = 'inline-block';
        badge.style.background = count > 10 ? 'var(--rose)' : 'var(--blue)';
    } else {
        badge.style.display = 'none';
    }
},
actualizarTrabajadorActualUI: function() {
    if (typeof MultiUsuario === 'undefined') return;
    var t = MultiUsuario.getTrabajadorActual();
    var topbarSub = document.getElementById('topbar-sub');
    if (t && topbarSub) {
        topbarSub.textContent = '👷 ' + t.nombre + ' • ' + t.puesto;
        topbarSub.style.color = 'var(--green)';
    }
},

// ─────────────────────────────────────────────────────────────────────
// VOLVER A MODO ADMIN
// ─────────────────────────────────────────────────────────────────────
volverAModoAdmin: function() {
    // Limpiar trabajador actual
    MultiUsuario.clearTrabajadorActual();
    
    // Actualizar UI
    this.actualizarTrabajadorActualUI();
    
    // Actualizar indicador del sidebar
    this.actualizarSidebarModoIndicador();
    
    // Mensaje de confirmación
    alert('✅ Modo Admin activado\n\nLos próximos exámenes se guardarán a nombre del administrador:\n' + this.userData.nombre);
    
    // Cerrar modal si está abierto
    this.cerrarModalSeleccionarTrabajador();
},

// ─────────────────────────────────────────────────────────────────────
// ACTUALIZAR INDICADOR DEL SIDEBAR
// ─────────────────────────────────────────────────────────────────────
actualizarSidebarModoIndicador: function() {
    var indicador = document.getElementById('sidebar-modo-indicador');
    var nombre = document.getElementById('sidebar-modo-nombre');
    var btnVolverAdmin = document.getElementById('btn-volver-admin');
    
    if (!indicador || !nombre) return;
    
    var t = MultiUsuario.getTrabajadorActual();
    
    if (t) {
        // MODO TRABAJADOR ACTIVO
        if (indicador) indicador.style.display = 'block';
        if (nombre) nombre.textContent = '👷 ' + t.nombre;
        if (btnVolverAdmin) btnVolverAdmin.style.display = 'block';
    } else {
        // MODO ADMIN
        if (indicador) indicador.style.display = 'none';
        if (nombre) nombre.textContent = '👤 Admin';
        if (btnVolverAdmin) btnVolverAdmin.style.display = 'none';
    }
},


// ─────────────────────────────────────────────────────────────────────
// ACTUALIZAR TRABAJADOR ACTUAL UI (ACTUALIZADA)
// ─────────────────────────────────────────────────────────────────────
actualizarTrabajadorActualUI: function() {
    var t = MultiUsuario.getTrabajadorActual();
    var topbarSub = document.getElementById('topbar-sub');
    var btnVolverAdmin = document.getElementById('btn-volver-admin');
    
    if (t && topbarSub) {
        topbarSub.textContent = '👷 ' + t.nombre + ' • ' + t.puesto;
        topbarSub.style.color = 'var(--amber)';
        if (btnVolverAdmin) btnVolverAdmin.style.display = 'block';
    } else {
        topbarSub.textContent = 'Plataforma de certificación';
        topbarSub.style.color = 'var(--ink4)';
        if (btnVolverAdmin) btnVolverAdmin.style.display = 'none';
    }
    
    // Actualizar sidebar
    this.actualizarSidebarModoIndicador();
},
cerrarSesionTrabajador: function() {
    if (typeof MultiUsuario === 'undefined') return;
    MultiUsuario.clearTrabajadorActual();
    var topbarSub = document.getElementById('topbar-sub');
    if (topbarSub) {
        topbarSub.textContent = 'Plataforma de certificación';
        topbarSub.style.color = 'var(--ink4)';
    }
    alert('👋 Sesión de trabajador cerrada');
},

toggleTema: function() {
    document.body.classList.toggle('tema-claro');
    var esClaro = document.body.classList.contains('tema-claro');
    localStorage.setItem('rayoshield_tema', esClaro ? 'claro' : 'oscuro');
},
    
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




// ═══════════════════════════════════════════════════════════════
// OBJETO MULTI-USUARIO (FUERA DEL OBJETO APP)
// ═══════════════════════════════════════════════════════════════
const MultiUsuario = {
    init: function() {
        if (!localStorage.getItem('rayoshield_empresa')) {
            localStorage.setItem('rayoshield_empresa', JSON.stringify({
                nombre: '',
                rfc: '',
                email: '',
                telefono: '',
                direccion: '',
                fecha_registro: new Date().toISOString()
            }));
        }
        if (!localStorage.getItem('rayoshield_trabajadores')) {
            localStorage.setItem('rayoshield_trabajadores', JSON.stringify([]));
        }
        if (!localStorage.getItem('rayoshield_resultados')) {
            localStorage.setItem('rayoshield_resultados', JSON.stringify([]));
        }
        if (!localStorage.getItem('rayoshield_trabajador_actual')) {
            localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(null));
        }
        console.log('✅ Sistema Multi-Usuario inicializado');
    },
    
    getEmpresa: function() {
        return JSON.parse(localStorage.getItem('rayoshield_empresa'));
    },
    
    setEmpresa: function(data) {
        localStorage.setItem('rayoshield_empresa', JSON.stringify(data));
    },
    
    getTrabajadores: function() {
        return JSON.parse(localStorage.getItem('rayoshield_trabajadores'));
    },
    
    addTrabajador: function(trabajador) {
        var trabajadores = this.getTrabajadores();
        trabajador.id = 'TRAB-' + Date.now().toString(36).toUpperCase();
        trabajador.fecha_registro = new Date().toISOString();
        trabajador.estado = 'activo';
        trabajadores.push(trabajador);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(trabajadores));
        return trabajador;
    },
    
    updateTrabajador: function(id, data) {
        var trabajadores = this.getTrabajadores();
        var index = trabajadores.findIndex(t => t.id === id);
        if (index !== -1) {
            trabajadores[index] = { ...trabajadores[index], ...data };
            localStorage.setItem('rayoshield_trabajadores', JSON.stringify(trabajadores));
            return true;
        }
        return false;
    },
    
    deleteTrabajador: function(id) {
        var trabajadores = this.getTrabajadores();
        trabajadores = trabajadores.filter(t => t.id !== id);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(trabajadores));
        var resultados = this.getResultados();
        resultados = resultados.filter(r => r.trabajador_id !== id);
        localStorage.setItem('rayoshield_resultados', JSON.stringify(resultados));
        return true;
    },
    
    getTrabajadorById: function(id) {
        var trabajadores = this.getTrabajadores();
        return trabajadores.find(t => t.id === id);
    },
    
    setTrabajadorActual: function(id) {
        localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(id));
    },
    
    getTrabajadorActual: function() {
        var id = JSON.parse(localStorage.getItem('rayoshield_trabajador_actual'));
        if (id) {
            return this.getTrabajadorById(id);
        }
        return null;
    },
    
    clearTrabajadorActual: function() {
        localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(null));
    },
    
    getResultados: function() {
        return JSON.parse(localStorage.getItem('rayoshield_resultados'));
    },
    
    addResultado: function(resultado) {
        var resultados = this.getResultados();
        resultado.id = 'RES-' + Date.now().toString(36).toUpperCase();
        resultado.fecha = new Date().toISOString();
        resultados.push(resultado);
        localStorage.setItem('rayoshield_resultados', JSON.stringify(resultados));
        return resultado;
    },
    
    getResultadosByTrabajador: function(trabajadorId) {
        var resultados = this.getResultados();
        return resultados.filter(r => r.trabajador_id === trabajadorId);
    },
    
    getProgresoByTrabajador: function(trabajadorId) {
        var resultados = this.getResultadosByTrabajador(trabajadorId);
        var examenes = resultados.filter(r => r.tipo === 'examen');
        var casos = resultados.filter(r => r.tipo === 'caso');
        var aprobados = examenes.filter(r => r.aprobado).length;
        var casosCompletados = casos.filter(r => r.aprobado).length;
        return {
            total_examenes: examenes.length,
            examenes_aprobados: aprobados,
            total_casos: casos.length,
            casos_completados: casosCompletados,
            promedio: examenes.length > 0 ? Math.round(examenes.reduce((a, b) => a + b.puntaje, 0) / examenes.length) : 0
        };
    },
    
    getEstadisticas: function() {
        var trabajadores = this.getTrabajadores();
        var resultados = this.getResultados();
        var activos = trabajadores.filter(t => t.estado === 'activo').length;
        var examenesTotales = resultados.filter(r => r.tipo === 'examen').length;
        var casosTotales = resultados.filter(r => r.tipo === 'caso').length;
        var aprobados = resultados.filter(r => r.aprobado).length;
        return {
            trabajadores_totales: trabajadores.length,
            trabajadores_activos: activos,
            examenes_totales: examenesTotales,
            casos_totales: casosTotales,
            tasa_aprobacion: resultados.length > 0 ? Math.round((aprobados / resultados.length) * 100) : 0
        };
    }
};  // ← ✅ CIERRA OBJETO MULTI-USUARIO

// Inicializar MultiUsuario
MultiUsuario.init();

// ═══════════════════════════════════════════════════════════════
// INTEGRAR RESULTADOS CON MULTI-USUARIO (FUERA DE APP)
// ═══════════════════════════════════════════════════════════════

// Sobrescribir mostrarResultado para guardar con trabajador
const originalMostrarResultado = app.mostrarResultado;
app.mostrarResultado = function() {
    originalMostrarResultado.call(this);
    var t = MultiUsuario.getTrabajadorActual();
    if (t && this.resultadoActual) {
        MultiUsuario.addResultado({
            trabajador_id: t.id,
            trabajador_nombre: t.nombre,
            tipo: 'examen',
            actividad: this.examenActual ? this.examenActual.titulo : 'Examen',
            puntaje: this.resultadoActual.score,
            aprobado: this.resultadoActual.estado === 'Aprobado',
            fecha: new Date().toISOString()
        });
        console.log('✅ Resultado guardado para', t.nombre);
    }
};  // ← ✅ PUNTO Y COMA

// Sobrescribir mostrarResultadoCaso para guardar con trabajador
const originalMostrarResultadoCaso = app.mostrarResultadoCaso;
app.mostrarResultadoCaso = function(resultado) {
    originalMostrarResultadoCaso.call(this, resultado);
    var t = MultiUsuario.getTrabajadorActual();
    if (t && resultado) {
        MultiUsuario.addResultado({
            trabajador_id: t.id,
            trabajador_nombre: t.nombre,
            tipo: 'caso',
            actividad: this.casoActual ? this.casoActual.titulo : 'Caso',
            puntaje: resultado.porcentaje,
            aprobado: resultado.aprobado,
            fecha: new Date().toISOString()
        });
        console.log('✅ Resultado de caso guardado para', t.nombre);
    }
};  // ← ✅ PUNTO Y COMA (NO COMA)

// ─────────────────────────────────────────────────────────────────────
// INICIAR CUANDO DOM ESTÉ LISTO
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM listo');
    app.init();
});

window.addEventListener('beforeunload', function() {
    if (app.timerExamen) clearInterval(app.timerExamen);
    if (app.timerCaso) clearInterval(app.timerCaso);
});
