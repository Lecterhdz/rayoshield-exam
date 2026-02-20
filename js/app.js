// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - LÓGICA PRINCIPAL DE LA APP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplicación principal RayoShield Exam
 */
const app = {
    // Estado de la app
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    respuestaTemporal: null,  // ← Agregar esta línea
    userData: {
        nombre: '',
        email: ''
    },
    
    /**
     * Inicializa la aplicación
     */
    init() {
        console.log('RayoShield Exam iniciado');
        this.cargarHistorial();
        this.mostrarPantalla('home-screen');
    },
    
    /**
     * Muestra una pantalla específica
     * @param {string} screenId - ID de la pantalla
     */
    mostrarPantalla(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar la pantalla seleccionada
        document.getElementById(screenId).classList.add('active');
    },
    
    /**
     * Navega a la pantalla de selección de examen
     */
    async irASeleccionarExamen() {
        const examList = document.getElementById('exam-list');
        examList.innerHTML = '';
        
        // Generar lista de exámenes
        EXAMENES.forEach(exam => {
            const item = document.createElement('div');
            item.className = 'exam-item';
            item.innerHTML = `
                <h4>${exam.icono} ${exam.titulo}</h4>
                <p>${exam.norma} • ${exam.nivel}</p>
            `;
            item.onclick = () => this.iniciarExamen(exam.id);
            examList.appendChild(item);
        });
        
        this.mostrarPantalla('select-exam-screen');
    },
    
    /**
     * Inicia un examen específico
     * @param {string} examId - ID del examen
     */
    async iniciarExamen(examId) {
        try {
            // Cargar examen desde JSON
            this.examenActual = await cargarExamen(examId);
            
            // Resetear estado
            this.respuestasUsuario = [];
            this.preguntaActual = 0;
            this.resultadoActual = null;
            
            // Actualizar UI del examen
            document.getElementById('exam-title').textContent = this.examenActual.titulo;
            document.getElementById('exam-norma').textContent = this.examenActual.norma;
            
            // Mostrar pantalla de examen
            this.mostrarPantalla('exam-screen');
            
            // Mostrar primera pregunta
            this.mostrarPregunta();
            
        } catch (error) {
            console.error('Error iniciando examen:', error);
            alert('Error cargando el examen. Intente de nuevo.');
        }
    },
    
    /**
     * Muestra la pregunta actual
     */
    mostrarPregunta() {
        const pregunta = this.examenActual.preguntas[this.preguntaActual];
        
        // Actualizar progreso
        const progreso = ((this.preguntaActual + 1) / this.examenActual.preguntas.length) * 100;
        document.getElementById('progress-bar').innerHTML = 
            `<div class="progress-bar-fill" style="width: ${progreso}%"></div>`;
        document.getElementById('progress-text').textContent = 
            `Pregunta ${this.preguntaActual + 1} de ${this.examenActual.preguntas.length}`;
        
        // Actualizar texto de la pregunta
        document.getElementById('question-text').textContent = pregunta.texto;
        
        // Generar opciones
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
    
    /**
     * Maneja la selección de una respuesta
     * @param {number} indice - Índice de la opción seleccionada
     */
        seleccionarRespuesta(indice) {
            // Guardar respuesta temporalmente
            this.respuestaTemporal = indice;
            
            // Mostrar botón de confirmar
            const optionsContainer = document.getElementById('options-container');
            
            // Remover botones de opciones existentes
            optionsContainer.innerHTML = '';
            
            // Mostrar confirmación
            const confirmDiv = document.createElement('div');
            confirmDiv.className = 'confirm-container';
            confirmDiv.style.cssText = 'text-align: center; padding: 20px;';
            confirmDiv.innerHTML = `
                <p style="font-size: 18px; margin-bottom: 20px;">
                    ¿Confirmar esta respuesta?
                </p>
                <button class="btn btn-primary" onclick="app.confirmarRespuesta()" style="margin: 5px;">
                    ✅ Confirmar
                </button>
                <button class="btn btn-secondary" onclick="app.cancelarRespuesta()" style="margin: 5px;">
                    ↩️ Cambiar
                </button>
            `;
            optionsContainer.appendChild(confirmDiv);
        }
        
        confirmarRespuesta() {
            this.respuestasUsuario.push(this.respuestaTemporal);
            this.respuestaTemporal = null;
            this.preguntaActual++;
            
            if (this.preguntaActual < this.examenActual.preguntas.length) {
                this.mostrarPregunta();
            } else {
                this.mostrarResultado();
            }
        }
        
        cancelarRespuesta() {
            this.respuestaTemporal = null;
            this.mostrarPregunta();
        } else {
            this.mostrarResultado();
        }
    },
    
    /**
     * Muestra el resultado del examen
     */
    mostrarResultado() {
        // Calcular resultado usando TU LÓGICA (scoring.js)
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        
        // Actualizar UI
        const icono = getIconoResultado(this.resultadoActual.estado);
        const colorClase = getColorEstado(this.resultadoActual.estado);
        
        document.getElementById('result-icon').textContent = icono;
        document.getElementById('result-title').textContent = 
            this.resultadoActual.estado === 'Aprobado' ? '✅ APROBADO' : '❌ REPROBADO';
        document.getElementById('score-number').textContent = `${this.resultadoActual.score}%`;
        document.getElementById('aciertos').textContent = this.resultadoActual.aciertos;
        document.getElementById('total').textContent = this.resultadoActual.total;
        document.getElementById('min-score').textContent = this.resultadoActual.minScore;
        
        const statusEl = document.getElementById('result-status');
        statusEl.textContent = this.resultadoActual.estado;
        statusEl.className = colorClase;
        
        // Mostrar/ocultar botón de certificado
        const btnCertificado = document.getElementById('btn-certificado');
        if (this.resultadoActual.estado === 'Aprobado') {
            btnCertificado.style.display = 'inline-block';
        } else {
            btnCertificado.style.display = 'none';
        }
        
        // Mostrar pantalla de resultado
        this.mostrarPantalla('result-screen');
        
        // Guardar en historial
        this.guardarEnHistorial();
    },
    
    /**
     * Descarga el certificado
     */
    async descargarCertificado() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') {
            alert('Solo se puede descargar certificado si aprobó el examen');
            return;
        }
        
        // Generar certificado
        const imageUrl = await generarCertificado(
            this.userData,
            this.examenActual,
            this.resultadoActual
        );
        
        // Descargar
        const filename = `certificado_${this.examenActual.id}_${Date.now()}.png`;
        descargarCertificado(imageUrl, filename);
    },
    
    /**
     * Vuelve a la pantalla de inicio
     */
    volverHome() {
        this.examenActual = null;
        this.respuestasUsuario = [];
        this.preguntaActual = 0;
        this.resultadoActual = null;
        this.mostrarPantalla('home-screen');
    },
    
    /**
     * Muestra el historial de exámenes
     */
    mostrarHistorial() {
        const historyList = document.getElementById('history-list');
        const historial = this.obtenerHistorial();
        
        if (historial.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666;">No hay exámenes registrados aún.</p>';
        } else {
            historyList.innerHTML = '';
            // Mostrar últimos 10 exámenes
            historial.slice(-10).reverse().forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <div class="info">
                        <strong>${item.examen}</strong><br>
                        <small>${new Date(item.fecha).toLocaleDateString('es-MX')}</small>
                    </div>
                    <span class="score ${getColorEstado(item.estado)}">${item.score}%</span>
                `;
                historyList.appendChild(div);
            });
        }
        
        this.mostrarPantalla('history-screen');
    },
    
    /**
     * Muestra información de la app
     */
    mostrarInfo() {
        this.mostrarPantalla('info-screen');
    },
    
    /**
     * Guarda resultado en historial (localStorage)
     */
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
    
    /**
     * Obtiene historial desde localStorage
     * @returns {Array}
     */
    obtenerHistorial() {
        const historial = localStorage.getItem('rayoshield_historial');
        return historial ? JSON.parse(historial) : [];
    },
    
    /**
     * Carga historial al iniciar
     */
    cargarHistorial() {
        console.log('Historial cargado:', this.obtenerHistorial().length, 'exámenes');
    }
};

// Iniciar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registrado', reg))
        .catch(err => console.log('Error registrando Service Worker', err));

}
