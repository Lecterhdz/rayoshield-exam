// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - LÓGICA PRINCIPAL DE LA APP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplicación principal RayoShield Exam
 */
const app = {
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    userData: { nombre: '', email: '' },
    licencia: { tipo: 'DEMO', examenesRestantes: 3 },
    
    init() {
        console.log('RayoShield Exam iniciado');
        this.cargarLicencia();
        this.cargarHistorial();
        this.mostrarPantalla('home-screen');
        this.actualizarInfoLicencia();
    },
    
    mostrarPantalla(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },
    
    cargarLicencia() {
        const licenciaGuardada = localStorage.getItem('rayoshield_licencia');
        if (licenciaGuardada) {
            this.licencia = JSON.parse(licenciaGuardada);
        }
    },
    
    guardarLicencia() {
        localStorage.setItem('rayoshield_licencia', JSON.stringify(this.licencia));
        this.actualizarInfoLicencia();
    },
    
    actualizarInfoLicencia() {
        const infoEl = document.getElementById('licencia-info');
        if (infoEl) {
            if (this.licencia.tipo === 'DEMO') {
                infoEl.textContent = `📋 Licencia DEMO - ${this.licencia.examenesRestantes} exámenes restantes`;
                infoEl.style.color = '#FF9800';
            } else {
                infoEl.textContent = '✅ Licencia FULL - Exámenes ilimitados';
                infoEl.style.color = '#4CAF50';
            }
        }
    },
    
    verificarLicencia() {
        if (this.licencia.tipo === 'DEMO' && this.licencia.examenesRestantes <= 0) {
            alert('⚠️ Has alcanzado el límite de exámenes DEMO.\n\nPara continuar, adquiere una licencia FULL.\n\nContacto: tu@email.com');
            return false;
        }
        return true;
    },
    
    consumirExamen() {
        if (this.licencia.tipo === 'DEMO') {
            this.licencia.examenesRestantes--;
            this.guardarLicencia();
        }
    },
    
    async irASeleccionarExamen() {
        if (!this.verificarLicencia()) return;
        
        const examList = document.getElementById('exam-list');
        examList.innerHTML = '';
        
        EXAMENES.forEach(exam => {
            const item = document.createElement('div');
            item.className = 'exam-item';
            item.innerHTML = `<h4>${exam.icono} ${exam.titulo}</h4><p>${exam.norma} • ${exam.nivel}</p>`;
            item.onclick = () => this.iniciarExamen(exam.id);
            examList.appendChild(item);
        });
        
        this.mostrarPantalla('select-exam-screen');
    },
    
    async iniciarExamen(examId) {
        try {
            this.examenActual = await cargarExamen(examId);
            this.respuestasUsuario = [];
            this.preguntaActual = 0;
            this.resultadoActual = null;
            
            document.getElementById('exam-title').textContent = this.examenActual.titulo;
            document.getElementById('exam-norma').textContent = this.examenActual.norma;
            
            this.mostrarPantalla('exam-screen');
            this.mostrarPregunta();
        } catch (error) {
            console.error('Error iniciando examen:', error);
            alert('Error cargando el examen. Intente de nuevo.');
        }
    },
    
    mostrarPregunta() {
        const pregunta = this.examenActual.preguntas[this.preguntaActual];
        const progreso = ((this.preguntaActual + 1) / this.examenActual.preguntas.length) * 100;
        
        document.getElementById('progress-bar').innerHTML = `<div class="progress-bar-fill" style="width: ${progreso}%"></div>`;
        document.getElementById('progress-text').textContent = `Pregunta ${this.preguntaActual + 1} de ${this.examenActual.preguntas.length}`;
        document.getElementById('question-text').textContent = pregunta.texto;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        pregunta.opciones.forEach((opcion, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = `${String.fromCharCode(65 + index)}) ${opcion}`;
            btn.onclick = () => this.seleccionarRespuesta(index);
            optionsContainer.appendChild(btn);
        });
    },
    
    seleccionarRespuesta(indice) {
        this.respuestasUsuario.push(indice);
        this.preguntaActual++;
        
        if (this.preguntaActual < this.examenActual.preguntas.length) {
            this.mostrarPregunta();
        } else {
            this.mostrarResultado();
        }
    },
    
    mostrarResultado() {
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        
        const icono = getIconoResultado(this.resultadoActual.estado);
        const colorClase = getColorEstado(this.resultadoActual.estado);
        
        document.getElementById('result-icon').textContent = icono;
        document.getElementById('result-title').textContent = this.resultadoActual.estado === 'Aprobado' ? '✅ APROBADO' : '❌ REPROBADO';
        document.getElementById('score-number').textContent = `${this.resultadoActual.score}%`;
        document.getElementById('aciertos').textContent = this.resultadoActual.aciertos;
        document.getElementById('total').textContent = this.resultadoActual.total;
        document.getElementById('min-score').textContent = this.resultadoActual.minScore;
        
        const statusEl = document.getElementById('result-status');
        statusEl.textContent = this.resultadoActual.estado;
        statusEl.className = `score ${colorClase}`;
        
        const btnCertificado = document.getElementById('btn-certificado');
        btnCertificado.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
        
        this.mostrarPantalla('result-screen');
        this.guardarEnHistorial();
        this.consumirExamen();
    },
    
    async descargarCertificado() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') {
            alert('Solo se puede descargar certificado si aprobó el examen');
            return;
        }
        
        const imageUrl = await generarCertificado(this.userData, this.examenActual, this.resultadoActual);
        const filename = `certificado_${this.examenActual.id}_${Date.now()}.png`;
        descargarCertificado(imageUrl, filename);
    },
    
    volverHome() {
        this.examenActual = null;
        this.respuestasUsuario = [];
        this.preguntaActual = 0;
        this.resultadoActual = null;
        this.mostrarPantalla('home-screen');
    },
    
    mostrarHistorial() {
        const historyList = document.getElementById('history-list');
        const historial = this.obtenerHistorial();
        
        if (historial.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">No hay exámenes registrados aún.</p>';
        } else {
            historyList.innerHTML = '';
            historial.slice(-10).reverse().forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `<div class="info"><strong>${item.examen}</strong><br><small>${new Date(item.fecha).toLocaleDateString('es-MX')}</small></div><span class="score ${getColorEstado(item.estado)}">${item.score}%</span>`;
                historyList.appendChild(div);
            });
        }
        
        this.mostrarPantalla('history-screen');
    },
    
    mostrarInfo() {
        this.mostrarPantalla('info-screen');
    },
    
    mostrarLicencia() {
        this.mostrarPantalla('license-screen');
    },
    
    activarLicencia() {
        const codigo = document.getElementById('license-code').value.trim();
        
        if (codigo === 'FULL2026' || codigo === 'RAYOSHIELD2026') {
            this.licencia = { tipo: 'FULL', examenesRestantes: 9999 };
            this.guardarLicencia();
            alert('✅ ¡Licencia FULL activada exitosamente!\n\nAhora tienes acceso ilimitado a todos los exámenes.');
            document.getElementById('license-code').value = '';
        } else if (codigo) {
            alert('❌ Código inválido.\n\nVerifica el código e intenta de nuevo.\n\nPara adquirir una licencia, contacta: tu@email.com');
        }
    },
    
    guardarEnHistorial() {
        const historial = this.obtenerHistorial();
        historial.push({
            examen: this.examenActual.titulo,
            norma: this.examenActual.norma,
            score: this.resultadoActual.score,
            estado: this.resultadoActual.estado,
            fecha: this.resultadoActual.fecha
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(historial));
    },
    
    obtenerHistorial() {
        const h = localStorage.getItem('rayoshield_historial');
        return h ? JSON.parse(h) : [];
    },
    
    cargarHistorial() {
        console.log('Historial cargado:', this.obtenerHistorial().length, 'exámenes');
    }
};

document.addEventListener('DOMContentLoaded', () => { app.init(); });
