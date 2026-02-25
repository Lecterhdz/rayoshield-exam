// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - LÓGICA DE CALIFICACIÓN
// (Traducido de scoring.py - MISMA LÓGICA)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el resultado del examen
 * @param {number[]} respuestasUsuario - Índices de respuestas seleccionadas
 * @param {Object} examen - Datos del examen con preguntas y min_score
 * @returns {Object} - Resultado con score, aciertos, estado, etc.
 */
function calcularResultado(respuestasUsuario, examen) {
    let aciertos = 0;
    
    // Contar aciertos (MISMA LÓGICA QUE TU PYTHON)
    for (let i = 0; i < respuestasUsuario.length; i++) {
        if (respuestasUsuario[i] === examen.preguntas[i].correcta_idx) {
            aciertos++;
        }
    }
    
    // Calcular porcentaje
    const score = (aciertos / examen.preguntas.length) * 100;
    
    // Determinar estado (MISMA REGLA: >= min_score = Aprobado)
    const estado = score >= examen.min_score ? 'Aprobado' : 'Reprobado';
    
    return {
        score: Math.round(score * 10) / 10,  // Redondear a 1 decimal
        aciertos: aciertos,
        total: examen.preguntas.length,
        estado: estado,
        minScore: examen.min_score,
        fecha: new Date().toISOString()
    };
}

/**
 * Determina si el resultado es aprobatorio
 * @param {number} score - Calificación obtenida
 * @param {number} minScore - Calificación mínima requerida
 * @returns {boolean}
 */
function esAprobatorio(score, minScore) {
    return score >= minScore;
}

/**
 * Obtiene el color del estado
 * @param {string} estado - 'Aprobado' o 'Reprobado'
 * @returns {string} - Clase CSS para el color
 */
function getColorEstado(estado) {
    return estado === 'Aprobado' ? 'score-aprobado' : 'score-reprobado';
}

/**
 * Obtiene el ícono del resultado
 * @param {string} estado - 'Aprobado' o 'Reprobado'
 * @returns {string} - Emoji del resultado
 */
function getIconoResultado(estado) {
    return estado === 'Aprobado' ? '🏆' : '📚';

}

function evaluarCasoInvestigacion(respuestas, caso) {
    var puntajeTotal = 0;
    var puntajeMaximo = 0;
    var feedback = [];
    
    caso.preguntas.forEach(function(pregunta, idx) {
        var puntajePregunta = 0;
        var respuestaUsuario = respuestas[pregunta.id];
        
        // Calcular puntaje por pregunta
        if (pregunta.tipo === 'analisis_multiple') {
            var correctas = pregunta.opciones.filter(function(o) { return o.correcta; }).length;
            var seleccionadas = respuestaUsuario ? respuestaUsuario.length : 0;
            var acertadas = 0;
            
            if (respuestaUsuario) {
                respuestaUsuario.forEach(function(idx) {
                    if (pregunta.opciones[idx] && pregunta.opciones[idx].correcta) acertadas++;
                });
            }
            
            puntajePregunta = correctas > 0 ? (acertadas / correctas) * pregunta.peso : 0;
            
            if (acertadas < correctas) {
                feedback.push('❌ Pregunta ' + (idx + 1) + ': Faltaron opciones correctas');
            }
        }
        else if (pregunta.tipo === 'respuesta_abierta_guiada' || pregunta.tipo === 'redaccion_tecnica') {
            var texto = respuestaUsuario ? respuestaUsuario[0] : '';
            var longitudMinima = pregunta.longitud_minima || 50;
            
            if (texto && texto.length >= longitudMinima) {
                puntajePregunta = pregunta.peso;
            } else if (texto && texto.length > 0) {
                puntajePregunta = pregunta.peso * 0.5;
                feedback.push('⚠️ Pregunta ' + (idx + 1) + ': Respuesta muy corta (mínimo ' + longitudMinima + ' caracteres)');
            } else {
                feedback.push('❌ Pregunta ' + (idx + 1) + ': Sin respuesta');
            }
        }
        else if (pregunta.tipo === 'plan_accion' || pregunta.tipo === 'evaluacion_correctivas') {
            var seleccionadas = respuestaUsuario ? respuestaUsuario.length : 0;
            var correctas = pregunta.opciones.filter(function(o) { 
                return o.correcta || o.jerarquia === 'ingenieria' || o.jerarquia === 'administrativo'; 
            }).length;
            
            puntajePregunta = seleccionadas > 0 ? (Math.min(seleccionadas, correctas) / correctas) * pregunta.peso : 0;
            
            if (seleccionadas < correctas) {
                feedback.push('⚠️ Pregunta ' + (idx + 1) + ': Selecciona más acciones preventivas');
            }
        }
        else {
            // Otros tipos de preguntas
            puntajePregunta = pregunta.peso * 0.8; // Puntaje base
        }
        
        puntajeTotal += puntajePregunta;
        puntajeMaximo += pregunta.peso;
    });
    
    var porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    var aprobado = porcentaje >= 70;
    
    // ✅ MAPEAR CAMPOS DEL CASO AL RESULTADO
    return {
        puntajeTotal: Math.round(puntajeTotal),
        puntajeMaximo: puntajeMaximo,
        porcentaje: porcentaje,
        aprobado: aprobado,
        estado: aprobado ? 'Aprobado' : 'Reprobado',
        fecha: new Date().toISOString(),
        
        // ✅ CAMPOS DE RETROALIMENTACIÓN
        feedback: feedback.length > 0 ? feedback : ['✅ ¡Buen trabajo! No se detectaron errores críticos.'],
        leccion: caso.leccion_aprendida || 'Continúa practicando para mejorar tus competencias en investigación de incidentes.',
        conclusion: caso.conclusion_oficial || 'La investigación fue completada. Revisa la retroalimentación para mejorar.',
        
        // Para compatibilidad con SmartEvaluationV2
        dimensiones: {},
        puntajeCompetencias: porcentaje,
        nivelGeneral: { nivel: porcentaje >= 80 ? 'MASTER' : 'BÁSICO', color: '#2196F3', icono: '🥈', validez: '1 año' }
    };
}
