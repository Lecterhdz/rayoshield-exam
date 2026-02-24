// RAYOSHIELD EXAM - app.js (VERSIÓN FINAL CORREGIDA)
// Guardar con codificación UTF-8

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
    licencia: { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3 },
    
    // Timer
    timerExamen: null,
    tiempoLimite: 30 * 60 * 1000,
    tiempoInicio: null,
    tiempoRestante: null,
    
    // Progreso
    examenGuardado: null,
    
    // PWA Install
    deferredPrompt: null,

    // ─────────────────────────────────────────────────────────────────────
    // INICIALIZACIÓN
    // ─────────────────────────────────────────────────────────────────────
    init: function() {
        console.log('RayoShield iniciado');
        this.cargarLicencia();
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
    // ACTUALIZAR UI (ÚNICA DEFINICIÓN)
    // ─────────────────────────────────────────────────────────────────────
    actualizarUI: function() {
        // Info de licencia (home)
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
        
        // Info de licencia (pantalla licencia)
        var infoLicDetail = document.getElementById('licencia-info-detail');
        if (infoLicDetail) {
            if (this.licencia.tipo === 'DEMO') {
                infoLicDetail.textContent = '📋 Licencia DEMO - ' + this.licencia.examenesRestantes + ' exámenes hoy';
            } else {
                var exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : 'Sin expiración';
                infoLicDetail.textContent = '✅ ' + this.licencia.tipo + '\nCliente: ' + this.licencia.clienteId + '\nVálido hasta: ' + exp;
            }
        }
        
        // Info de usuario
        var infoUser = document.getElementById('usuario-info');
        if (infoUser && this.userData.nombre) {
            infoUser.innerHTML = '<strong>👤 ' + this.userData.nombre + '</strong><br>' + (this.userData.empresa || '') + ' • ' + (this.userData.puesto || '');
        }
        
        // Habilitar botón de examen
        var btnExamen = document.getElementById('btn-comenzar');
        if (btnExamen) {
            var datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
            btnExamen.disabled = !datosOk;
            btnExamen.style.opacity = datosOk ? '1' : '0.5';
        }
        
        // ✅ Control de visibilidad de botones según plan (DENTRO de actualizarUI)
        var btnCasosMaster = document.getElementById('btn-casos-master');
        if (btnCasosMaster) {
            if (this.licencia.features && this.licencia.features.casosElite) {
                btnCasosMaster.style.display = 'inline-block';
            } else {
                btnCasosMaster.style.display = 'none';
            }
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
    // LICENCIAS CON ID + CLAVE
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
                this.licencia = { tipo: 'DEMO', clave: '', clienteId: '', expiracion: null, examenesRestantes: 3 };
                this.guardarLicencia();
                alert('⚠️ Tu licencia ha expirado.\n\nHas vuelto a la versión DEMO.');
            }
        }
    },

    validarLicencia: function(clienteId, clave) {
        // Validar formato de clave
        if (!/^RS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(clave)) {
            return Promise.resolve({ valido: false, error: 'Formato: RS-XXXX-YYYY-ZZZZ' });
        }
        // Validar formato de ID
        if (!/^[A-Z0-9_-]{5,}$/i.test(clienteId)) {
            return Promise.resolve({ valido: false, error: 'ID: mínimo 5 caracteres' });
        }
        
        // ─────────────────────────────────────────────────────────────────────
        // BASE DE DATOS DE LICENCIAS CON FEATURES POR PLAN
        // ─────────────────────────────────────────────────────────────────────
        var licenciasValidas = {
            // PLAN PRO (Evaluación básica + Casos MASTER)
            'RS-A3F8-C2E9-B1D4': { 
                clienteId: 'CONSTRUCTORA_AZTECA_001', 
                tipo: 'FULL', 
                duracion: 365,
                features: { 
                    whiteLabel: false, 
                    predictivo: false, 
                    auditoria: false,
                    casosElite: true,
                    casosPericial: false
                } 
            },
            // PLAN ENTERPRISE (con White Label + Predictivo)
            'RS-2D5F-8A1C-4E7B': { 
                clienteId: 'SEGURIDAD_INDUSTRIAL_MX', 
                tipo: 'EMPRESARIAL', 
                duracion: 365,
                features: { 
                    whiteLabel: true, 
                    predictivo: true, 
                    auditoria: false,
                    casosElite: true,
                    casosPericial: false
                } 
            },
            // PLAN PRO+
            'RS-9C2E-5B8D-1F4A': { 
                clienteId: 'CAPACITACION_PRO_2026', 
                tipo: 'FULL', 
                duracion: 180,
                features: { 
                    whiteLabel: true, 
                    predictivo: false, 
                    auditoria: false,
                    casosElite: true,
                    casosPericial: false
                } 
            }
        };
        // ─────────────────────────────────────────────────────────────────────
        
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
            features: licenciaData.features  // ✅ IMPORTANTE: Pasamos las capacidades
        });
    },

    activarLicencia: function() {
        var self = this;
        var idEl = document.getElementById('license-id');
        var keyEl = document.getElementById('license-key');
        var clienteId = idEl ? idEl.value.trim().toUpperCase() : '';
        var clave = keyEl ? keyEl.value.trim().toUpperCase() : '';
        
        if (!clienteId || !clave) { 
            alert('⚠️ Ingresa ID y clave'); 
            return; 
        }
        
        // ✅ VERIFICACIÓN DE SEGURIDAD: Si ya hay licencia activa
        if (this.licencia.tipo !== 'DEMO' && this.licencia.expiracion) {
            var hoy = new Date();
            var vence = new Date(this.licencia.expiracion);
            
            if (hoy < vence) {
                if (this.licencia.clave === clave) {
                    alert('✅ Esta licencia ya está activa.\nVence: ' + vence.toLocaleDateString('es-MX'));
                    return;
                } else {
                    var confirmar = confirm('⚠️ Ya tienes una licencia activa hasta ' + vence.toLocaleDateString('es-MX') + '.\n\nActivar esta nueva licencia reemplazará la actual.\n\n¿Continuar?');
                    if (!confirmar) return;
                }
            }
        }
        
        var btn = document.querySelector('#license-screen .btn-primary');
        if (btn) { 
            btn.disabled = true; 
            btn.textContent = '⏳ Validando...'; 
        }
        
        this.validarLicencia(clienteId, clave).then(function(res) {
            if (btn) { 
                btn.disabled = false; 
                btn.textContent = '🔓 Activar Licencia'; 
            }
            
            if (res.valido) {
                // ✅ GUARDAR LICENCIA CON FEATURES
                self.licencia = { 
                    tipo: res.tipo, 
                    clave: clave, 
                    clienteId: res.clienteId, 
                    expiracion: res.expiracion, 
                    examenesRestantes: 9999,
                    features: res.features  // ✅ Guardamos las capacidades del plan
                };
                self.guardarLicencia();
                
                // ✅ Si tiene White Label, aplicar configuración guardada
                if (res.features.whiteLabel) {
                    self.aplicarConfiguracionWhiteLabel();
                }
                
                var fecha = new Date(res.expiracion).toLocaleDateString('es-MX');
                alert('✅ Licencia ' + res.tipo + ' activada\n\nCliente: ' + res.clienteId + '\nVálida hasta: ' + fecha + '\n\nFeatures activas:\n• Casos MASTER: ' + (res.features.casosElite ? '✅' : '❌') + '\n• White Label: ' + (res.features.whiteLabel ? '✅' : '❌') + '\n• Dashboard Predictivo: ' + (res.features.predictivo ? '✅' : '❌'));
                
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
    // NAVEGACIÓN: Categoría → Nivel → Examen
    // ─────────────────────────────────────────────────────────────────────
    irASeleccionarExamen: function() {
        var self = this;
        var datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
        if (!datosOk) { alert('Completa tus datos primero'); this.mostrarDatosUsuario(); return; }
        if (!this.verificarLicenciaExamen()) return;
        
        document.getElementById('categorias-view').style.display = 'block';
        document.getElementById('niveles-view').style.display = 'none';
        
        var list = document.getElementById('categorias-list');
        if (!list) return;
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
        document.getElementById('categorias-view').style.display = 'none';
        document.getElementById('niveles-view').style.display = 'block';
        
        document.getElementById('categoria-titulo').textContent = categoria.icono + ' ' + categoria.nombre;
        document.getElementById('categoria-norma').textContent = categoria.norma;
        
        var list = document.getElementById('niveles-list');
        list.innerHTML = '';
        
        categoria.niveles.forEach(function(nivel) {
            var item = document.createElement('div');
            item.className = 'exam-item';
            item.innerHTML = '<h4>👤 ' + nivel.nombre + '</h4><p>Examen de ' + categoria.nombre.toLowerCase() + '</p>';
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
            self.examenActual = exam; self.respuestasUsuario = []; self.preguntaActual = 0; self.resultadoActual = null; self.respuestaTemporal = null;
            var t = document.getElementById('exam-title'), n = document.getElementById('exam-norma');
            if (t) t.textContent = exam.titulo; if (n) n.textContent = exam.norma;
            self.detenerTimer(); self.iniciarTimerExamen(); self.mostrarPantalla('exam-screen'); self.mostrarPregunta(); self.guardarExamenProgreso();
        }).catch(function() { alert('Error cargando examen'); });
    },

    mostrarPregunta: function() {
        if (!this.examenActual) return;
        var p = this.examenActual.preguntas[this.preguntaActual], total = this.examenActual.preguntas.length;
        var progreso = ((this.preguntaActual + 1) / total) * 100;
        var bar = document.getElementById('progress-bar'), txt = document.getElementById('progress-text'), q = document.getElementById('question-text'), cont = document.getElementById('options-container');
        if (bar) bar.innerHTML = '<div class="progress-bar-fill" style="width:' + progreso + '%"></div>';
        if (txt) txt.textContent = 'Pregunta ' + (this.preguntaActual + 1) + ' de ' + total;
        if (q) q.textContent = p.texto;
        if (!cont) return; cont.innerHTML = '';
        var self = this;
        p.opciones.forEach(function(opt, idx) {
            var btn = document.createElement('button');
            btn.className = 'option-btn' + (self.respuestaTemporal === idx ? ' selected' : '');
            btn.textContent = String.fromCharCode(65 + idx) + ') ' + opt;
            btn.onclick = function() { self.seleccionarRespuesta(idx); };
            cont.appendChild(btn);
        });
        if (this.respuestaTemporal !== null) {
            var btnC = document.createElement('button');
            btnC.className = 'btn btn-primary btn-continuar'; btnC.textContent = 'Continuar';
            btnC.onclick = function() { self.confirmarRespuesta(); };
            cont.appendChild(btnC);
        }
    },

    seleccionarRespuesta: function(idx) { this.respuestaTemporal = idx; this.mostrarPregunta(); },

    confirmarRespuesta: function() {
        if (this.respuestaTemporal === null) return;
        if (this.preguntaActual === this.examenActual.preguntas.length - 1 && !confirm('Finalizar examen?')) return;
        this.respuestasUsuario.push(this.respuestaTemporal); this.respuestaTemporal = null; this.preguntaActual++;
        this.guardarExamenProgreso();
        if (this.preguntaActual < this.examenActual.preguntas.length) { this.mostrarPregunta(); }
        else { this.detenerTimer(); this.mostrarResultado(); this.eliminarExamenGuardado(); }
    },

    // ─────────────────────────────────────────────────────────────────────
    // TIMER
    // ─────────────────────────────────────────────────────────────────────
    iniciarTimerExamen: function() {
        var self = this; this.tiempoInicio = Date.now(); this.tiempoRestante = this.tiempoLimite;
        this.timerExamen = setInterval(function() {
            self.tiempoRestante = self.tiempoLimite - (Date.now() - self.tiempoInicio);
            if (self.tiempoRestante <= 0) { clearInterval(self.timerExamen); self.timerExamen = null; alert('Tiempo agotado'); self.mostrarResultado(); self.eliminarExamenGuardado(); return; }
            self.actualizarTimerUI();
            if (self.tiempoRestante <= 300000 && self.tiempoRestante > 240000) alert('Quedan 5 minutos');
        }, 1000);
    },
    actualizarTimerUI: function() {
        var el = document.getElementById('exam-timer'); if (!el) return;
        var min = Math.floor(this.tiempoRestante / 60000), seg = Math.floor((this.tiempoRestante % 60000) / 1000);
        el.textContent = min + ':' + (seg < 10 ? '0' : '') + seg;
        el.style.color = this.tiempoRestante <= 300000 ? '#f44336' : '#666';
    },
    detenerTimer: function() { if (this.timerExamen) { clearInterval(this.timerExamen); this.timerExamen = null; } },

    // ─────────────────────────────────────────────────────────────────────
    // PROGRESO GUARDADO
    // ─────────────────────────────────────────────────────────────────────
    guardarExamenProgreso: function() {
        if (this.examenActual) {
            this.examenGuardado = { examenId: this.examenActual.id, respuestas: this.respuestasUsuario.slice(), preguntaActual: this.preguntaActual, fecha: new Date().toISOString() };
            localStorage.setItem('rayoshield_progreso', JSON.stringify(this.examenGuardado));
        }
    },
    cargarExamenGuardado: function() { try { var s = localStorage.getItem('rayoshield_progreso'); if (s) this.examenGuardado = JSON.parse(s); } catch(e) {} },
    restaurarExamenGuardado: function() {
        if (!this.examenGuardado) return;
        var self = this;
        cargarExamen(this.examenGuardado.examenId).then(function(exam) {
            self.examenActual = exam; self.respuestasUsuario = self.examenGuardado.respuestas; self.preguntaActual = self.examenGuardado.preguntaActual;
            var t = document.getElementById('exam-title'), n = document.getElementById('exam-norma');
            if (t) t.textContent = exam.titulo; if (n) n.textContent = exam.norma;
            self.detenerTimer(); self.iniciarTimerExamen(); self.mostrarPantalla('exam-screen'); self.mostrarPregunta();
        });
    },
    eliminarExamenGuardado: function() { this.examenGuardado = null; localStorage.removeItem('rayoshield_progreso'); },

    // ─────────────────────────────────────────────────────────────────────
    // RESULTADOS
    // ─────────────────────────────────────────────────────────────────────
    mostrarResultado: function() {
        if (!this.examenActual) return;
        this.detenerTimer();
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        var icon = document.getElementById('result-icon'), title = document.getElementById('result-title'), score = document.getElementById('score-number');
        var ac = document.getElementById('aciertos'), tot = document.getElementById('total'), min = document.getElementById('min-score');
        var st = document.getElementById('result-status'), btn = document.getElementById('btn-certificado');
        if (icon) icon.textContent = getIconoResultado(this.resultadoActual.estado);
        if (title) title.textContent = (this.resultadoActual.estado === 'Aprobado' ? 'APROBADO' : 'REPROBADO') + (this.licencia.tipo === 'DEMO' ? ' (DEMO)' : '');
        if (score) score.textContent = this.resultadoActual.score + '%';
        if (ac) ac.textContent = this.resultadoActual.aciertos; if (tot) tot.textContent = this.resultadoActual.total; if (min) min.textContent = this.resultadoActual.minScore;
        if (st) { st.textContent = this.resultadoActual.estado; st.className = 'score ' + getColorEstado(this.resultadoActual.estado); }
        if (btn) { btn.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none'; btn.textContent = this.licencia.tipo === 'DEMO' ? 'Certificado (DEMO)' : 'Descargar Certificado'; }
        this.mostrarPantalla('result-screen'); this.guardarEnHistorial(); this.consumirExamen();
    },

    descargarCertificado: function() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') { alert('Solo para aprobados'); return; }
        var self = this;
        generarCertificado(this.userData, this.examenActual, this.resultadoActual).then(function(url) {
            var a = document.createElement('a'); a.download = 'certificado_' + Date.now() + '.png'; a.href = url; a.click();
        }).catch(function() { alert('Error generando certificado'); });
    },

    // ─────────────────────────────────────────────────────────────────────
    // NAVEGACIÓN
    // ─────────────────────────────────────────────────────────────────────
    volverHome: function() { this.detenerTimer(); this.examenActual = null; this.respuestasUsuario = []; this.preguntaActual = 0; this.resultadoActual = null; this.respuestaTemporal = null; this.mostrarPantalla('home-screen'); },
    mostrarDatosUsuario: function() {
        var e = document.getElementById('user-empresa'), n = document.getElementById('user-nombre'), c = document.getElementById('user-curp'), p = document.getElementById('user-puesto');
        if (e) e.value = this.userData.empresa || ''; if (n) n.value = this.userData.nombre || ''; if (c) c.value = this.userData.curp || ''; if (p) p.value = this.userData.puesto || '';
        this.mostrarPantalla('user-data-screen');
    },
    mostrarHistorial: function() {
        var list = document.getElementById('history-list'); if (!list) return;
        var hist = this.obtenerHistorial();
        if (hist.length === 0) { list.innerHTML = '<p style="text-align:center;color:#666">Sin exámenes</p>'; }
        else { list.innerHTML = ''; hist.slice(-10).reverse().forEach(function(item) {
            var d = document.createElement('div'); d.className = 'history-item';
            d.innerHTML = '<div><strong>' + item.examen + '</strong><br><small>' + new Date(item.fecha).toLocaleDateString('es-MX') + '</small></div><span class="score ' + getColorEstado(item.estado) + '">' + item.score + '%</span>';
            list.appendChild(d);
        }); }
        this.mostrarPantalla('history-screen');
    },
    mostrarLicencia: function() {
        var el = document.getElementById('licencia-info-detail');
        if (el) {
            if (this.licencia.tipo === 'DEMO') {
                el.textContent = '📋 DEMO: ' + this.licencia.examenesRestantes + '/3 exámenes hoy';
            } else if (this.licencia.tipo === 'FULL') {
                var exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : 'Sin expiración';
                el.textContent = '✅ FULL\nCliente: ' + this.licencia.clienteId + '\nVálido hasta: ' + exp;
            } else if (this.licencia.tipo === 'EMPRESARIAL') {
                var exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : 'Sin expiración';
                el.textContent = '🏢 EMPRESARIAL\nCliente: ' + this.licencia.clienteId + '\nVálido hasta: ' + exp + '\n⚠️ Sin control de dispositivos (honesto)';
            }
        }
        this.mostrarPantalla('license-screen');
    },

    // ─────────────────────────────────────────────────────────────────────
    // CASOS CRÍTICOS - INVESTIGACIÓN MASTER
    // ─────────────────────────────────────────────────────────────────────
    casoActual: null,
    respuestasCaso: {},
    irACasosMaster: function() {
        this.detenerTimerCaso();  // ← AGREGAR ESTO
        document.getElementById('casos-list').style.display = 'block';
        document.getElementById('caso-detalle').style.display = 'none';
        document.getElementById('casos-main-buttons').style.display = 'block';
        var list = document.getElementById('casos-list');
        if (!list) return;
        list.innerHTML = '';
        if (typeof CASOS_INVESTIGACION === 'undefined' || CASOS_INVESTIGACION.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#666">No hay casos de investigación disponibles aún.</p>';
            return;
        }
        var self = this;
        CASOS_INVESTIGACION.forEach(function(caso) {
            var item = document.createElement('div');
            item.className = 'exam-item';
            item.innerHTML = '<h4>' + caso.icono + ' ' + caso.titulo + '</h4><p><span class="badge-nivel ' + caso.nivel + '">' + caso.nivel + '</span> • ' + caso.tiempo_estimado + '</p><p style="color:#666;font-size:14px;margin-top:5px;">' + caso.descripcion + '</p>' + (caso.requisito ? '<p style="color:#FF9800;font-size:12px;margin-top:5px;">📋 Requisito: ' + caso.requisito + '</p>' : '');
            item.onclick = function() { self.cargarCasoMaster(caso.id); };
            list.appendChild(item);
        });
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
        
        var desc = this.casoActual.descripcion_evento;
        document.getElementById('caso-descripcion').innerHTML = '<strong>Actividad:</strong> ' + desc.actividad + '<br><strong>Equipo:</strong> ' + desc.equipo + '<br><strong>Evento:</strong> ' + desc.evento + '<br><strong>Resultado:</strong> ' + desc.resultado + '<br><strong style="color:#f44336;">Clasificación:</strong> ' + desc.clasificacion;
        
        var timelineEl = document.getElementById('caso-timeline');
        timelineEl.innerHTML = '';
        this.casoActual.linea_tiempo.forEach(function(evento) {
            var item = document.createElement('div');
            item.className = 'timeline-item' + (evento.includes('Liberación') ? ' evento-critico' : '');
            item.textContent = evento;
            timelineEl.appendChild(item);
        });
        
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
        
        var preguntasEl = document.getElementById('caso-preguntas');
        preguntasEl.innerHTML = '';
        this.respuestasCaso = {};
        this.casoActual.preguntas.forEach(function(pregunta, idx) {
            var preguntaDiv = document.createElement('div');
            preguntaDiv.className = 'pregunta-master';
            preguntaDiv.innerHTML = '<h4>🔍 Pregunta ' + (idx + 1) + ' (' + pregunta.tipo.replace('_', ' ') + ') - ' + pregunta.peso + ' pts</h4><p>' + pregunta.pregunta + '</p>';
            switch(pregunta.tipo) {
                case 'analisis_multiple': preguntaDiv.appendChild(self.renderAnalisisMultiple(pregunta)); break;
                case 'respuesta_abierta_guiada': preguntaDiv.appendChild(self.renderRespuestaAbierta(pregunta)); break;
                case 'analisis_responsabilidad': preguntaDiv.appendChild(self.renderAnalisisResponsabilidad(pregunta)); break;
                case 'plan_accion': preguntaDiv.appendChild(self.renderPlanAccion(pregunta)); break;
            }
            preguntasEl.appendChild(preguntaDiv);
        });
        
        document.getElementById('btn-enviar-caso').style.display = 'inline-block';
        this.iniciarTimerCaso();  // ← AGREGAR ESTO
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
            textoSpan.textContent = opt.texto;
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
        textarea.placeholder = 'Escribe tu análisis sistémico aquí... (mínimo 20 caracteres)';
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
            item.innerHTML = '<input type="checkbox" name="plan-' + pregunta.id + '" value="' + idx + '" style="margin-top:5px;"><div style="flex:1;"><strong>' + opt.texto + '</strong><div style="margin-top:5px;"><span class="accion-jerarquia ' + opt.jerarquia + '">' + opt.jerarquia + '</span>' + (opt.prioridad ? '<span style="margin-left:10px;font-size:12px;color:#666;">Prioridad: ' + opt.prioridad + '</span>' : '') + '</div></div>';
            item.onclick = function(e) {
                if (e.target.tagName === 'INPUT') {
                    item.classList.toggle('seleccionada');
                }
            };
            container.appendChild(item);
        });
        return container;
    },
    enviarRespuestasCaso: function() {
        if (!this.casoActual) return;
        var respuestasPorPregunta = {};
        this.casoActual.preguntas.forEach(function(pregunta) {
            switch(pregunta.tipo) {
                case 'analisis_multiple':
                    var checks = document.querySelectorAll('input[name="pregunta-' + pregunta.id + '"]:checked');
                    respuestasPorPregunta[pregunta.id] = Array.from(checks).map(function(c) { return parseInt(c.value); });
                    break;
                case 'respuesta_abierta_guiada':
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
                    var checks = document.querySelectorAll('input[name="plan-' + pregunta.id + '"]:checked');
                    respuestasPorPregunta[pregunta.id] = Array.from(checks).map(function(c) { return parseInt(c.value); });
                    break;
            }
        });
        var resultado = SmartEvaluationV2.evaluarConDimensiones(respuestasPorPregunta, this.casoActual);
        this.resultadoCaso = resultado;  // ✅ GUARDAR RESULTADO
        this.mostrarResultadoCaso(resultado);
    },
    mostrarResultadoCaso: function(resultado) {
        var resultadoEl = document.getElementById('caso-resultado');
        resultadoEl.style.display = 'block';
        resultadoEl.scrollIntoView({ behavior: 'smooth' });
    
        // ✅ Si tiene feature predictivo, usar Dashboard Engine
        if (this.licencia.features && this.licencia.features.predictivo && typeof DashboardEngine !== 'undefined') {
            resultadoEl.innerHTML = DashboardEngine.generar(resultado);
        } else {
            // Vista básica para planes sin predictivo
            var claseEstado = resultado.aprobado ? 'aprobado' : 'no-aprobado';
            var icono = resultado.aprobado ? '✅' : '📚';
            var estadoTexto = resultado.aprobado ? '✅ APROBADO - Nivel MASTER' : '📚 Requiere repaso';
        
            // ✅ Determinar insignia según puntaje
            var insignia = this.obtenerInsigniaPorPuntaje(resultado.porcentaje);
        
            // ✅ Botones condicionales
            var botonesHTML = '';
            if (resultado.aprobado) {
                botonesHTML = '<div class="button-group" style="margin-top:20px;">' +
                    '<button class="btn btn-primary" onclick="app.descargarInsignia()" style="background:linear-gradient(135deg,#D4AF37,#FFD700);color:#1a1a1a;font-weight:bold;">🏅 Descargar Insignia</button>' +
                    '<button class="btn btn-secondary" onclick="app.volverAListaCasos()">🔄 Otro caso</button>' +
                    '<button class="btn btn-secondary" onclick="app.volverHome()">🏠 Inicio</button>' +
                    '</div>';
            } else {
                botonesHTML = '<div class="button-group" style="margin-top:20px;">' +
                    '<button class="btn btn-secondary" onclick="app.volverAListaCasos()">🔄 Intentar otro caso</button>' +
                    '<button class="btn btn-secondary" onclick="app.volverHome()">🏠 Inicio</button>' +
                    '</div>';
            }
        
            resultadoEl.innerHTML = `
            <div class="resultado-investigacion ${claseEstado}">
                <h2>${icono} Resultado de la Investigación</h2>
                <div class="puntaje-master">${resultado.porcentaje}%</div>
                <p><strong>Puntaje:</strong> ${resultado.puntajeTotal} / ${resultado.puntajeMaximo}</p>
                <p><strong>Estado:</strong> ${estadoTexto}</p>
                ${resultado.aprobado ? `
                <div style="margin:20px 0;padding:20px;background:linear-gradient(135deg,#D4AF37,#FFD700);border-radius:10px;text-align:center;">
                    <div style="font-size:64px;margin-bottom:10px;">${insignia.icono}</div>
                    <div style="font-size:20px;font-weight:bold;color:#1a1a1a;">Insignia ${insignia.nombre}</div>
                    <div style="font-size:14px;color:#333;margin-top:5px;">${insignia.descripcion}</div>
                </div>
                ` : ''}
            </div>
            ${resultado.feedback.length > 0 ? `
            <div style="margin:20px 0;padding:20px;background:#FFF3E0;border-radius:10px;">
                <strong>💡 Retroalimentación:</strong>
                <ul style="margin-top:10px;">
                    ${resultado.feedback.map(function(f) { return '<li>' + f + '</li>'; }).join('')}
                </ul>
            </div>` : ''}
            <div class="leccion-master">
                <strong>🎓 Lección Aprendida:</strong>
                <p style="margin-top:10px;">${resultado.leccion}</p>
            </div>
            <div style="background:#E8F5E9;padding:20px;border-radius:10px;margin:20px 0;">
                <strong>📋 Conclusión Oficial:</strong>
                <p style="margin-top:10px;line-height:1.6;">${resultado.conclusion}</p>
            </div>
            ${botonesHTML}
            `;
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
        generarCertificadoMaster(this.userData, this.casoActual, this.resultadoCaso).then(function(url) {
            var a = document.createElement('a');
            a.download = 'RayoShield_INSIGNIA_' + self.userData.nombre.replace(/\s/g, '_') + '_' + Date.now() + '.png';
            a.href = url;
            a.click();
        }).catch(function() {
            alert('❌ Error generando insignia');
        });
    },


    // ─────────────────────────────────────────────────────────────────────
    // TIMER PARA CASOS MASTER
    // ─────────────────────────────────────────────────────────────────────
    timerCaso: null,
    tiempoCasoLimite: 40 * 60 * 1000, // 40 minutos por defecto
    tiempoCasoInicio: null,
    tiempoCasoRestante: null,

    iniciarTimerCaso: function() {
        var self = this;
        this.tiempoCasoInicio = Date.now();
        this.tiempoCasoRestante = this.casoActual.metadatos_evaluacion?.tiempo_estimado_minutos * 60 * 1000 || this.tiempoCasoLimite;
    
        var timerEl = document.getElementById('caso-timer');
        if (!timerEl) {
            // Crear elemento timer si no existe
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
        
            // Alerta de 5 minutos
            if (self.tiempoCasoRestante <= 300000 && self.tiempoCasoRestante > 240000) {
                alert('⚠️ Quedan 5 minutos');
            }
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
            var contenidoOriginal = document.body.innerHTML;
            document.body.innerHTML = dashboardEl.outerHTML;
            window.print();
            location.reload(); // Recargar para restaurar la app
        } else {
            window.print();
        }
    },

    
    // ─────────────────────────────────────────────────────────────────────
    // HISTORIAL
    // ─────────────────────────────────────────────────────────────────────
    guardarEnHistorial: function() {
        var hist = this.obtenerHistorial();
        hist.push({ examen: this.examenActual ? this.examenActual.titulo : 'Desconocido', norma: this.examenActual ? this.examenActual.norma : '', score: this.resultadoActual ? this.resultadoActual.score : 0, estado: this.resultadoActual ? this.resultadoActual.estado : '', fecha: this.resultadoActual ? this.resultadoActual.fecha : new Date().toISOString(), usuario: this.userData.nombre });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
    },
    obtenerHistorial: function() { try { var h = localStorage.getItem('rayoshield_historial'); return h ? JSON.parse(h) : []; } catch(e) { return []; } },
    cargarHistorial: function() { console.log('Historial:', this.obtenerHistorial().length, 'exámenes'); },

    // ─────────────────────────────────────────────────────────────────────
    // PWA INSTALL
    // ─────────────────────────────────────────────────────────────────────
    initPWAInstall: function() {
        var self = this;
        window.addEventListener('beforeinstallprompt', function(e) { console.log('PWA instalable'); e.preventDefault(); self.deferredPrompt = e; var c = document.getElementById('pwa-install-container'); if (c) c.style.display = 'block'; });
        window.addEventListener('appinstalled', function() { console.log('PWA instalada'); self.deferredPrompt = null; var c = document.getElementById('pwa-install-container'); if (c) c.style.display = 'none'; });
    },
    instalarPWA: function() {
        var self = this;
        if (!this.deferredPrompt) { alert('Menú navegador → "Agregar a pantalla principal"'); return; }
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(function(r) { console.log('Instalación:', r.outcome); self.deferredPrompt = null; var c = document.getElementById('pwa-install-container'); if (c) c.style.display = 'none'; });
    }
};

// Iniciar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', function() { console.log('DOM listo'); app.init(); });
window.addEventListener('beforeunload', function() { if (app.timerExamen) clearInterval(app.timerExamen); });




