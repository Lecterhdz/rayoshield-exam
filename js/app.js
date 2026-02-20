// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - app.js (LICENCIAS + TIMER)
// ─────────────────────────────────────────────────────────────────────────────

const app = {
    // Estado general
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    respuestaTemporal: null,
    
    // Datos de usuario
    userData: { empresa: '', nombre: '', curp: '', puesto: '' },
    
    // Sistema de licencias
    licencia: {
        tipo: 'DEMO',           // DEMO | FULL | EMPRESARIAL
        clave: '',              // Clave de licencia (hash)
        expiracion: null,       // Fecha de expiración (ISO string)
        examenesRestantes: 3    // Solo para DEMO
    },
    
    // Timer de examen
    timerExamen: null,
    tiempoLimite: 30 * 60 * 1000,  // 30 minutos en milisegundos
    tiempoInicio: null,
    tiempoRestante: null,
    
    // Progreso guardado
    examenGuardado: null,

    // ───────────────────────────────────────────────────────────────────────
    // INICIALIZACIÓN
    // ───────────────────────────────────────────────────────────────────────
    init() {
        console.log('✅ RayoShield Exam iniciado');
        this.cargarLicencia();
        this.cargarDatosUsuario();
        this.cargarHistorial();
        this.cargarExamenGuardado();
        this.initPWAInstall();  // ← Agregar esta línea
        this.actualizarUI();
        this.mostrarPantalla('home-screen');
        this.verificarExpiracionLicencia();
    },

    mostrarPantalla(id) {
        // Detener timer si cambiamos de pantalla de examen
        if (id !== 'exam-screen' && this.timerExamen) {
            clearInterval(this.timerExamen);
            this.timerExamen = null;
        }
        
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
    },

    actualizarUI() {
        // Info de licencia
        const infoLic = document.getElementById('licencia-info');
        if (infoLic) {
            if (this.licencia.tipo === 'DEMO') {
                infoLic.textContent = `📋 DEMO - ${this.licencia.examenesRestantes} exámenes`;
                infoLic.style.color = '#FF9800';
            } else if (this.licencia.tipo === 'FULL') {
                infoLic.textContent = '✅ FULL - Ilimitado';
                infoLic.style.color = '#4CAF50';
            } else if (this.licencia.tipo === 'EMPRESARIAL') {
                infoLic.textContent = '🏢 EMPRESARIAL - Equipo';
                infoLic.style.color = '#2196F3';
            }
        }
        
        // Info de usuario
        const infoUser = document.getElementById('usuario-info');
        if (infoUser && this.userData.nombre) {
            infoUser.innerHTML = `<strong>👤 ${this.userData.nombre}</strong><br>${this.userData.empresa || ''} • ${this.userData.puesto || ''}`;
        }
        
        // Habilitar botón de examen
        const btnExamen = document.getElementById('btn-comenzar');
        if (btnExamen) {
            const datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
            btnExamen.disabled = !datosOk;
            btnExamen.style.opacity = datosOk ? '1' : '0.5';
        }
    },

    // ───────────────────────────────────────────────────────────────────────
    // SISTEMA DE LICENCIAS PROFESIONAL
    // ───────────────────────────────────────────────────────────────────────
    
    cargarLicencia() {
        try {
            const saved = localStorage.getItem('rayoshield_licencia');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validar que tenga la estructura correcta
                if (parsed.tipo && parsed.clave !== undefined) {
                    this.licencia = parsed;
                }
            }
        } catch(e) { console.log('Licencia por defecto: DEMO'); }
    },

    guardarLicencia() {
        localStorage.setItem('rayoshield_licencia', JSON.stringify(this.licencia));
        this.actualizarUI();
    },

    verificarExpiracionLicencia() {
        if (this.licencia.expiracion) {
            const ahora = new Date();
            const expiracion = new Date(this.licencia.expiracion);
            
            if (ahora > expiracion && this.licencia.tipo !== 'DEMO') {
                // Licencia expirada → volver a DEMO
                console.log('⚠️ Licencia expirada');
                this.licencia = { tipo: 'DEMO', clave: '', expiracion: null, examenesRestantes: 3 };
                this.guardarLicencia();
                alert('⚠️ Tu licencia ha expirado.\n\nHas vuelto a la versión DEMO.\n\nPara renovar, contacta: tu@email.com');
            }
        }
    },

    // Validar licencia por clave (hash seguro)
    async validarLicencia(clave) {
        // En producción, esto debería validar contra un servidor
        // Por ahora, usamos validación local con hash
        
        try {
            // Generar hash de la clave ingresada
            const encoder = new TextEncoder();
            const data = encoder.encode(`rayoshield_secret_2026_${clave}`);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Claves válidas (en producción, esto vendría de un servidor)
            const licenciasValidas = {
                // Formato: hash → { tipo, duracion_dias }
                'a1b2c3d4e5f6...': { tipo: 'FULL', duracion: 365 },      // Ejemplo
                // Agrega aquí las claves que generes para tus clientes
            };
            
            if (licenciasValidas[hashHex]) {
                const config = licenciasValidas[hashHex];
                const expiracion = new Date();
                expiracion.setDate(expiracion.getDate() + config.duracion);
                
                return {
                    valido: true,
                    tipo: config.tipo,
                    expiracion: expiracion.toISOString()
                };
            }
            
            return { valido: false, error: 'Clave inválida' };
            
        } catch(e) {
            console.error('Error validando licencia:', e);
            return { valido: false, error: 'Error de validación' };
        }
    },

    activarLicencia() {
        const codeEl = document.getElementById('license-code');
        const clave = codeEl ? codeEl.value.trim() : '';
        
        if (!clave) {
            alert('⚠️ Ingresa una clave de licencia');
            return;
        }
        
        // Mostrar loading
        const btnActivar = document.querySelector('#license-screen .btn-primary');
        if (btnActivar) {
            btnActivar.disabled = true;
            btnActivar.textContent = '⏳ Validando...';
        }
        
        // Validar licencia
        this.validarLicencia(clave).then(resultado => {
            if (btnActivar) {
                btnActivar.disabled = false;
                btnActivar.textContent = '🔓 Activar Licencia';
            }
            
            if (resultado.valido) {
                this.licencia = {
                    tipo: resultado.tipo,
                    clave: clave,
                    expiracion: resultado.expiracion,
                    examenesRestantes: 9999
                };
                this.guardarLicencia();
                
                const fechaExp = new Date(resultado.expiracion).toLocaleDateString('es-MX');
                alert(`✅ ¡Licencia ${resultado.tipo} activada!\n\nVálida hasta: ${fechaExp}\n\nGracias por tu compra.`);
                
                if (codeEl) codeEl.value = '';
                this.actualizarUI();
            } else {
                alert(`❌ ${resultado.error}\n\nVerifica tu clave o contacta a soporte:\ntu@email.com`);
            }
        });
    },

    // Para generar claves (solo para ti, el administrador)
    // Ejecuta esto en la consola del navegador para generar una clave:
    /*
    async function generarClaveLicencia(clienteId, tipo, dias) {
        const encoder = new TextEncoder();
        const data = encoder.encode(`rayoshield_secret_2026_${clienteId}_${tipo}_${dias}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Uso: generarClaveLicencia('cliente123', 'FULL', 365).then(console.log);
    */

    // ───────────────────────────────────────────────────────────────────────
    // TIMER DE EXAMEN
    // ───────────────────────────────────────────────────────────────────────
    
    iniciarTimerExamen() {
        this.tiempoInicio = Date.now();
        this.tiempoRestante = this.tiempoLimite;
        
        // Actualizar UI cada segundo
        this.timerExamen = setInterval(() => {
            this.tiempoRestante = this.tiempoLimite - (Date.now() - this.tiempoInicio);
            
            if (this.tiempoRestante <= 0) {
                // Tiempo agotado → finalizar examen automáticamente
                clearInterval(this.timerExamen);
                this.timerExamen = null;
                alert('⏰ Tiempo agotado\n\nEl examen se enviará automáticamente.');
                this.mostrarResultado();
                this.eliminarExamenGuardado();
                return;
            }
            
            // Actualizar display del timer
            this.actualizarTimerUI();
            
            // Advertencia cuando quedan 5 minutos
            if (this.tiempoRestante <= 5 * 60 * 1000 && this.tiempoRestante > 4 * 60 * 1000) {
                alert('⚠️ Quedan 5 minutos para finalizar el examen');
            }
            
        }, 1000);
    },
    
    actualizarTimerUI() {
        const timerEl = document.getElementById('exam-timer');
        if (!timerEl) return;
        
        const minutos = Math.floor(this.tiempoRestante / 60000);
        const segundos = Math.floor((this.tiempoRestante % 60000) / 1000);
        
        timerEl.textContent = `⏱️ ${minutos}:${segundos.toString().padStart(2, '0')}`;
        
        // Cambiar color cuando queda poco tiempo
        if (this.tiempoRestante <= 5 * 60 * 1000) {
            timerEl.style.color = '#f44336';
            timerEl.style.fontWeight = 'bold';
        } else if (this.tiempoRestante <= 10 * 60 * 1000) {
            timerEl.style.color = '#FF9800';
        } else {
            timerEl.style.color = '#666';
            timerEl.style.fontWeight = 'normal';
        }
    },
    
    detenerTimer() {
        if (this.timerExamen) {
            clearInterval(this.timerExamen);
            this.timerExamen = null;
        }
    },

    // ───────────────────────────────────────────────────────────────────────
    // GESTIÓN DE DATOS DE USUARIO
    // ───────────────────────────────────────────────────────────────────────
    
    cargarDatosUsuario() {
        try {
            const saved = localStorage.getItem('rayoshield_usuario');
            if (saved) this.userData = JSON.parse(saved);
        } catch(e) {}
    },

    guardarDatosUsuario() {
        localStorage.setItem('rayoshield_usuario', JSON.stringify(this.userData));
        this.actualizarUI();
    },

    guardarDatosUsuarioForm() {
        const empresaEl = document.getElementById('user-empresa');
        const nombreEl = document.getElementById('user-nombre');
        const curpEl = document.getElementById('user-curp');
        const puestoEl = document.getElementById('user-puesto');
        
        if (!empresaEl || !nombreEl || !curpEl || !puestoEl) {
            alert('⚠️ Error: formulario no encontrado');
            return;
        }
        
        const empresa = empresaEl.value.trim();
        const nombre = nombreEl.value.trim();
        const curp = curpEl.value.trim().toUpperCase();
        const puesto = puestoEl.value.trim();
        
        if (!empresa || !nombre || !curp || !puesto) {
            alert('⚠️ Completa todos los campos');
            return;
        }
        
        this.userData = { empresa, nombre, curp, puesto };
        this.guardarDatosUsuario();
        alert('✅ Datos guardados');
        this.volverHome();
    },

    // ───────────────────────────────────────────────────────────────────────
    // GESTIÓN DE EXÁMENES
    // ───────────────────────────────────────────────────────────────────────
    
    verificarLicenciaExamen() {
        // Verificar expiración primero
        this.verificarExpiracionLicencia();
        
        if (this.licencia.tipo === 'DEMO' && this.licencia.examenesRestantes <= 0) {
            alert('⚠️ Has alcanzado el límite de exámenes DEMO.\n\nPara continuar, adquiere una licencia.\n\nContacto: tu@email.com');
            return false;
        }
        return true;
    },

    consumirExamen() {
        if (this.licencia.tipo === 'DEMO') {
            this.licencia.examenesRestantes = Math.max(0, this.licencia.examenesRestantes - 1);
            this.guardarLicencia();
        }
    },

    irASeleccionarExamen() {
        const datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
        if (!datosOk) {
            alert('⚠️ Completa tus datos primero\n\nClick en "📋 Mis Datos" para ingresar tu información.');
            this.mostrarDatosUsuario();
            return;
        }
        if (!this.verificarLicenciaExamen()) return;
        
        // Si hay examen guardado, preguntar si continuar (solo si no ha expirado)
        if (this.examenGuardado) {
            const guardadoHace = Date.now() - new Date(this.examenGuardado.fecha).getTime();
            const maxTiempoGuardado = 24 * 60 * 60 * 1000; // 24 horas
            
            if (guardadoHace < maxTiempoGuardado) {
                if (!confirm('📋 Tienes un examen guardado. ¿Continuar donde lo dejaste?')) {
                    this.examenGuardado = null;
                    localStorage.removeItem('rayoshield_progreso');
                } else {
                    this.restaurarExamenGuardado();
                    return;
                }
            } else {
                // Examen guardado muy antiguo, descartar
                this.examenGuardado = null;
                localStorage.removeItem('rayoshield_progreso');
            }
        }
        
        const list = document.getElementById('exam-list');
        if (!list) return;
        list.innerHTML = '';
        
        EXAMENES.forEach(exam => {
            const item = document.createElement('div');
            item.className = 'exam-item';
            item.innerHTML = `<h4>${exam.icono} ${exam.titulo}</h4><p>${exam.norma} • ${exam.nivel}</p>`;
            item.onclick = () => this.iniciarExamen(exam.id);
            list.appendChild(item);
        });
        
        this.mostrarPantalla('select-exam-screen');
    },

    async iniciarExamen(examId) {
        try {
            this.examenActual = await cargarExamen(examId);
            this.respuestasUsuario = [];
            this.preguntaActual = 0;
            this.resultadoActual = null;
            this.respuestaTemporal = null;
            
            // Actualizar UI del examen
            const titleEl = document.getElementById('exam-title');
            const normaEl = document.getElementById('exam-norma');
            if (titleEl) titleEl.textContent = this.examenActual.titulo;
            if (normaEl) normaEl.textContent = this.examenActual.norma;
            
            // Resetear y iniciar timer
            this.detenerTimer();
            this.iniciarTimerExamen();
            
            this.mostrarPantalla('exam-screen');
            this.mostrarPregunta();
            this.guardarExamenProgreso();
            
        } catch(e) {
            console.error('Error:', e);
            alert('❌ Error cargando examen');
            this.detenerTimer();
        }
    },

    mostrarPregunta() {
        if (!this.examenActual) return;
        const p = this.examenActual.preguntas[this.preguntaActual];
        const total = this.examenActual.preguntas.length;
        const progreso = ((this.preguntaActual + 1) / total) * 100;
        
        const barEl = document.getElementById('progress-bar');
        const textEl = document.getElementById('progress-text');
        const questionEl = document.getElementById('question-text');
        const container = document.getElementById('options-container');
        
        if (barEl) barEl.innerHTML = `<div class="progress-bar-fill" style="width:${progreso}%"></div>`;
        if (textEl) textEl.textContent = `Pregunta ${this.preguntaActual + 1} de ${total}`;
        if (questionEl) questionEl.textContent = p.texto;
        if (!container) return;
        
        container.innerHTML = '';
        p.opciones.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn' + (this.respuestaTemporal === idx ? ' selected' : '');
            btn.textContent = `${String.fromCharCode(65+idx)}) ${opt}`;
            btn.onclick = () => this.seleccionarRespuesta(idx);
            container.appendChild(btn);
        });
        
        if (this.respuestaTemporal !== null) {
            const btnCont = document.createElement('button');
            btnCont.className = 'btn btn-primary btn-continuar';
            btnCont.textContent = '➡️ Continuar';
            btnCont.onclick = () => this.confirmarRespuesta();
            container.appendChild(btnCont);
        }
    },

    seleccionarRespuesta(idx) {
        this.respuestaTemporal = idx;
        this.mostrarPregunta();
    },

    confirmarRespuesta() {
        if (this.respuestaTemporal === null) return;
        
        // Confirmar si es la última pregunta
        if (this.preguntaActual === this.examenActual.preguntas.length - 1) {
            if (!confirm('📋 ¿Finalizar examen?')) return;
        }
        
        this.respuestasUsuario.push(this.respuestaTemporal);
        this.respuestaTemporal = null;
        this.preguntaActual++;
        this.guardarExamenProgreso();
        
        if (this.preguntaActual < this.examenActual.preguntas.length) {
            this.mostrarPregunta();
        } else {
            // Examen completado → mostrar resultado
            this.detenerTimer();
            this.mostrarResultado();
            this.eliminarExamenGuardado();
        }
    },

    // ───────────────────────────────────────────────────────────────────────
    // PROGRESO GUARDADO
    // ───────────────────────────────────────────────────────────────────────
    
    guardarExamenProgreso() {
        if (this.examenActual) {
            this.examenGuardado = {
                examenId: this.examenActual.id,
                respuestas: [...this.respuestasUsuario],
                preguntaActual: this.preguntaActual,
                fecha: new Date().toISOString()
            };
            localStorage.setItem('rayoshield_progreso', JSON.stringify(this.examenGuardado));
        }
    },

    cargarExamenGuardado() {
        try {
            const saved = localStorage.getItem('rayoshield_progreso');
            if (saved) this.examenGuardado = JSON.parse(saved);
        } catch(e) {}
    },

    restaurarExamenGuardado() {
        if (!this.examenGuardado) return;
        
        cargarExamen(this.examenGuardado.examenId).then(exam => {
            this.examenActual = exam;
            this.respuestasUsuario = this.examenGuardado.respuestas;
            this.preguntaActual = this.examenGuardado.preguntaActual;
            
            const titleEl = document.getElementById('exam-title');
            const normaEl = document.getElementById('exam-norma');
            if (titleEl) titleEl.textContent = exam.titulo;
            if (normaEl) normaEl.textContent = exam.norma;
            
            // Reiniciar timer para el tiempo restante original (no el que llevaba)
            this.detenerTimer();
            this.iniciarTimerExamen();
            
            this.mostrarPantalla('exam-screen');
            this.mostrarPregunta();
        });
    },

    eliminarExamenGuardado() {
        this.examenGuardado = null;
        localStorage.removeItem('rayoshield_progreso');
    },

    // ───────────────────────────────────────────────────────────────────────
    // RESULTADOS Y CERTIFICADOS
    // ───────────────────────────────────────────────────────────────────────
    
    mostrarResultado() {
        if (!this.examenActual) return;
        
        this.detenerTimer();
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        
        const iconEl = document.getElementById('result-icon');
        const titleEl = document.getElementById('result-title');
        const scoreEl = document.getElementById('score-number');
        const aciertosEl = document.getElementById('aciertos');
        const totalEl = document.getElementById('total');
        const minEl = document.getElementById('min-score');
        const statusEl = document.getElementById('result-status');
        const btnCert = document.getElementById('btn-certificado');
        
        if (iconEl) iconEl.textContent = getIconoResultado(this.resultadoActual.estado);
        if (titleEl) {
            let titulo = this.resultadoActual.estado === 'Aprobado' ? '✅ APROBADO' : '❌ REPROBADO';
            if (this.licencia.tipo === 'DEMO') titulo += ' (DEMO)';
            titleEl.textContent = titulo;
        }
        if (scoreEl) scoreEl.textContent = `${this.resultadoActual.score}%`;
        if (aciertosEl) aciertosEl.textContent = this.resultadoActual.aciertos;
        if (totalEl) totalEl.textContent = this.resultadoActual.total;
        if (minEl) minEl.textContent = this.resultadoActual.minScore;
        if (statusEl) {
            statusEl.textContent = this.resultadoActual.estado;
            statusEl.className = 'score ' + getColorEstado(this.resultadoActual.estado);
        }
        if (btnCert) {
            btnCert.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
            btnCert.textContent = this.licencia.tipo === 'DEMO' ? '📄 Descargar (DEMO)' : '📄 Descargar Certificado';
        }
        
        this.mostrarPantalla('result-screen');
        this.guardarEnHistorial();
        this.consumirExamen();
    },

    async descargarCertificado() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') {
            alert('Solo certificados para aprobados');
            return;
        }
        try {
            const url = await generarCertificado(this.userData, this.examenActual, this.resultadoActual);
            const link = document.createElement('a');
            link.download = `certificado_${Date.now()}.png`;
            link.href = url;
            link.click();
        } catch(e) { alert('❌ Error generando certificado'); }
    },

    // ───────────────────────────────────────────────────────────────────────
    // NAVEGACIÓN
    // ───────────────────────────────────────────────────────────────────────
    
    volverHome() {
        this.detenerTimer();
        this.examenActual = null;
        this.respuestasUsuario = [];
        this.preguntaActual = 0;
        this.resultadoActual = null;
        this.respuestaTemporal = null;
        this.mostrarPantalla('home-screen');
    },

    // NOTA: Eliminamos salirExamen() porque el examen tiene timer y no se puede guardar/salir

    mostrarDatosUsuario() {
        const empresaEl = document.getElementById('user-empresa');
        const nombreEl = document.getElementById('user-nombre');
        const curpEl = document.getElementById('user-curp');
        const puestoEl = document.getElementById('user-puesto');
        
        if (empresaEl) empresaEl.value = this.userData.empresa || '';
        if (nombreEl) nombreEl.value = this.userData.nombre || '';
        if (curpEl) curpEl.value = this.userData.curp || '';
        if (puestoEl) puestoEl.value = this.userData.puesto || '';
        
        this.mostrarPantalla('user-data-screen');
    },

    mostrarHistorial() {
        const list = document.getElementById('history-list');
        if (!list) return;
        const historial = this.obtenerHistorial();
        
        if (historial.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#666">Sin exámenes aún</p>';
        } else {
            list.innerHTML = '';
            historial.slice(-10).reverse().forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `<div class="info"><strong>${item.examen}</strong><br><small>${new Date(item.fecha).toLocaleDateString('es-MX')}</small></div><span class="score ${getColorEstado(item.estado)}">${item.score}%</span>`;
                list.appendChild(div);
            });
        }
        this.mostrarPantalla('history-screen');
    },

    mostrarLicencia() {
        const infoEl = document.getElementById('licencia-info-detail');
        if (infoEl) {
            let texto = '';
            if (this.licencia.tipo === 'DEMO') {
                texto = `📋 DEMO - ${this.licencia.examenesRestantes} exámenes`;
            } else if (this.licencia.tipo === 'FULL') {
                const exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : 'Sin expiración';
                texto = `✅ FULL - Válido hasta: ${exp}`;
            } else if (this.licencia.tipo === 'EMPRESARIAL') {
                const exp = this.licencia.expiracion ? new Date(this.licencia.expiracion).toLocaleDateString('es-MX') : 'Sin expiración';
                texto = `🏢 EMPRESARIAL - Válido hasta: ${exp}`;
            }
            infoEl.textContent = texto;
        }
        this.mostrarPantalla('license-screen');
    },

    mostrarInfo() {
        this.mostrarPantalla('info-screen');
    },

    // ───────────────────────────────────────────────────────────────────────
    // HISTORIAL
    // ───────────────────────────────────────────────────────────────────────
    
    guardarEnHistorial() {
        const historial = this.obtenerHistorial();
        historial.push({
            examen: this.examenActual?.titulo || 'Desconocido',
            norma: this.examenActual?.norma || '',
            score: this.resultadoActual?.score || 0,
            estado: this.resultadoActual?.estado || '',
            fecha: this.resultadoActual?.fecha || new Date().toISOString(),
            usuario: this.userData.nombre,
            tiempoEmpleado: this.tiempoLimite - this.tiempoRestante
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(historial));
    },

    obtenerHistorial() {
        try {
            const h = localStorage.getItem('rayoshield_historial');
            return h ? JSON.parse(h) : [];
        } catch(e) { return []; }
    },

    cargarHistorial() {
        console.log('📋 Historial:', this.obtenerHistorial().length, 'exámenes');
    }
};

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM listo, iniciando app...');
    app.init();
});

// Limpiar timer si el usuario cierra la pestaña
window.addEventListener('beforeunload', () => {
    if (app.timerExamen) {
        clearInterval(app.timerExamen);
    }
});
// ───────────────────────────────────────────────────────────────────────
// PWA INSTALL
// ───────────────────────────────────────────────────────────────────────

deferredPrompt: null,

initPWAInstall() {
    // Escuchar evento de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('✅ PWA instalable detectada');
        e.preventDefault();
        this.deferredPrompt = e;
        
        // Mostrar botón de instalar
        const container = document.getElementById('pwa-install-container');
        if (container) {
            container.style.display = 'block';
        }
    });
    
    // Verificar si ya está instalada
    window.addEventListener('appinstalled', () => {
        console.log('✅ PWA instalada');
        this.deferredPrompt = null;
        const container = document.getElementById('pwa-install-container');
        if (container) {
            container.style.display = 'none';
        }
    });
},

async instalarPWA() {
    if (!this.deferredPrompt) {
        // Si no hay prompt, mostrar instrucciones manuales
        alert('📲 Para instalar manualmente:\n\n1. Abre el menú de tu navegador (⋮)\n2. Toca "Agregar a pantalla principal"\n3. Confirma el nombre\n4. ¡Listo! La app aparecerá en tu inicio');
        return;
    }
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`Instalación: ${outcome}`);
    this.deferredPrompt = null;
    
    const container = document.getElementById('pwa-install-container');
    if (container) {
        container.style.display = 'none';
    }
}

