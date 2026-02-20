// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - app.js (CON VALIDACIONES DE ELEMENTOS)
// ─────────────────────────────────────────────────────────────────────────────

const app = {
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    respuestaTemporal: null,
    userData: { empresa: '', nombre: '', curp: '', puesto: '' },
    licencia: { tipo: 'DEMO', examenesRestantes: 3 },
    examenGuardado: null,

    init() {
        console.log('✅ RayoShield Exam iniciado');
        this.cargarLicencia();
        this.cargarDatosUsuario();
        this.cargarHistorial();
        this.cargarExamenGuardado();
        this.actualizarUI();
        this.mostrarPantalla('home-screen');
    },

    mostrarPantalla(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
    },

    actualizarUI() {
        const infoLic = document.getElementById('licencia-info');
        if (infoLic) {
            infoLic.textContent = this.licencia.tipo === 'DEMO' 
                ? `📋 Licencia DEMO - ${this.licencia.examenesRestantes} exámenes restantes`
                : '✅ Licencia FULL - Exámenes ilimitados';
        }
        
        const infoUser = document.getElementById('usuario-info');
        if (infoUser && this.userData.nombre) {
            infoUser.innerHTML = `<strong>👤 ${this.userData.nombre}</strong><br>${this.userData.empresa || ''} • ${this.userData.puesto || ''}`;
        }
        
        const btnExamen = document.getElementById('btn-comenzar');
        if (btnExamen) {
            const datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
            btnExamen.disabled = !datosOk;
            btnExamen.style.opacity = datosOk ? '1' : '0.5';
        }
    },

    cargarLicencia() {
        try {
            const saved = localStorage.getItem('rayoshield_licencia');
            if (saved) this.licencia = JSON.parse(saved);
        } catch(e) {}
    },

    guardarLicencia() {
        localStorage.setItem('rayoshield_licencia', JSON.stringify(this.licencia));
        this.actualizarUI();
    },

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

    verificarLicencia() {
        if (this.licencia.tipo === 'DEMO' && this.licencia.examenesRestantes <= 0) {
            alert('⚠️ Límite DEMO alcanzado. Contacta: tu@email.com');
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
        if (!this.verificarLicencia()) return;
        
        if (this.examenGuardado) {
            if (!confirm('📋 Tienes un examen guardado. ¿Continuar donde lo dejaste?')) {
                this.examenGuardado = null;
            } else {
                this.restaurarExamenGuardado();
                return;
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
            
            const titleEl = document.getElementById('exam-title');
            const normaEl = document.getElementById('exam-norma');
            if (titleEl) titleEl.textContent = this.examenActual.titulo;
            if (normaEl) normaEl.textContent = this.examenActual.norma;
            
            this.mostrarPantalla('exam-screen');
            this.mostrarPregunta();
            this.guardarExamenProgreso();
        } catch(e) {
            console.error('Error:', e);
            alert('❌ Error cargando examen');
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
            this.mostrarResultado();
            this.eliminarExamenGuardado();
        }
    },

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
            this.mostrarPantalla('exam-screen');
            this.mostrarPregunta();
        });
    },

    eliminarExamenGuardado() {
        this.examenGuardado = null;
        localStorage.removeItem('rayoshield_progreso');
    },

    mostrarResultado() {
        if (!this.examenActual) return;
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
        if (titleEl) titleEl.textContent = (this.resultadoActual.estado === 'Aprobado' ? '✅ APROBADO' : '❌ REPROBADO') + (this.licencia.tipo === 'DEMO' ? ' (DEMO)' : '');
        if (scoreEl) scoreEl.textContent = `${this.resultadoActual.score}%`;
        if (aciertosEl) aciertosEl.textContent = this.resultadoActual.aciertos;
        if (totalEl) totalEl.textContent = this.resultadoActual.total;
        if (minEl) minEl.textContent = this.resultadoActual.minScore;
        if (statusEl) { statusEl.textContent = this.resultadoActual.estado; statusEl.className = 'score ' + getColorEstado(this.resultadoActual.estado); }
        if (btnCert) {
            btnCert.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
            btnCert.textContent = this.licencia.tipo === 'DEMO' ? '📄 Descargar Certificado (DEMO)' : '📄 Descargar Certificado';
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

    volverHome() {
        this.examenActual = null;
        this.respuestasUsuario = [];
        this.preguntaActual = 0;
        this.resultadoActual = null;
        this.respuestaTemporal = null;
        this.mostrarPantalla('home-screen');
    },

    salirExamen() {
        if (this.respuestasUsuario.length > 0) {
            if (confirm('📋 ¿Guardar progreso para continuar después?')) {
                this.guardarExamenProgreso();
                alert('✅ Progreso guardado');
            }
        }
        this.volverHome();
    },

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
            infoEl.textContent = this.licencia.tipo === 'DEMO' 
                ? `📋 Licencia DEMO - ${this.licencia.examenesRestantes} exámenes restantes`
                : '✅ Licencia FULL - Exámenes ilimitados';
        }
        this.mostrarPantalla('license-screen');
    },

    activarLicencia() {
        const codeEl = document.getElementById('license-code');
        const code = codeEl ? codeEl.value.trim() : '';
        if (code === 'FULL2026' || code === 'RAYOSHIELD2026') {
            this.licencia = { tipo: 'FULL', examenesRestantes: 9999 };
            this.guardarLicencia();
            alert('✅ ¡Licencia FULL activada!');
            if (codeEl) codeEl.value = '';
        } else if (code) {
            alert('❌ Código inválido. Contacta: tu@email.com');
        }
    },

    mostrarInfo() {
        this.mostrarPantalla('info-screen');
    },

    guardarEnHistorial() {
        const historial = this.obtenerHistorial();
        historial.push({
            examen: this.examenActual?.titulo || 'Desconocido',
            norma: this.examenActual?.norma || '',
            score: this.resultadoActual?.score || 0,
            estado: this.resultadoActual?.estado || '',
            fecha: this.resultadoActual?.fecha || new Date().toISOString(),
            usuario: this.userData.nombre
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM listo, iniciando app...');
    app.init();
});
