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
        var resultadoEvaluacion = null;
        
        // ✅ Evaluar según tipo de pregunta
        if (pregunta.tipo === 'analisis_multiple' || 
            pregunta.tipo === 'deteccion_omisiones' || 
            pregunta.tipo === 'identificacion_sesgos' ||
            pregunta.tipo === 'analisis_normativo' ||
            pregunta.tipo === 'deteccion_inconsistencias' ||
            pregunta.tipo === 'diagnostico_sistema') {
            
            resultadoEvaluacion = evaluarAnalisisMultiple(pregunta, respuestaUsuario);
        }
        else if (pregunta.tipo === 'respuesta_abierta_guiada' || 
                 pregunta.tipo === 'redaccion_tecnica') {
            
            resultadoEvaluacion = evaluarRespuestaAbierta(pregunta, respuestaUsuario);
        }
        else if (pregunta.tipo === 'analisis_responsabilidad') {
            resultadoEvaluacion = evaluarAnalisisResponsabilidad(pregunta, respuestaUsuario);
        }
        else if (pregunta.tipo === 'plan_accion' || 
                 pregunta.tipo === 'evaluacion_correctivas') {
            
            resultadoEvaluacion = evaluarPlanAccion(pregunta, respuestaUsuario);
        }
        else if (pregunta.tipo === 'ordenamiento_dinamico' || 
                 pregunta.tipo === 'matriz_priorizacion') {
            
            resultadoEvaluacion = evaluarOrdenamientoDinamico(pregunta, respuestaUsuario);
        }
        else if (pregunta.tipo === 'calculo_tecnico') {
            resultadoEvaluacion = evaluarCalculoTecnico(pregunta, respuestaUsuario);
        }
        
        // ✅ Acumular puntaje y feedback
        if (resultadoEvaluacion) {
            puntajeTotal += resultadoEvaluacion.puntaje;
            puntajeMaximo += pregunta.peso;
            
            if (resultadoEvaluacion.feedback) {
                feedback.push(resultadoEvaluacion.feedback);
            }
        }
    });
    
    var porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    var aprobado = porcentaje >= 70;
    
    // ✅ MAPEAR CORRECTAMENTE LOS CAMPOS DEL CASO
    return {
        puntajeTotal: Math.round(puntajeTotal),
        puntajeMaximo: puntajeMaximo,
        porcentaje: porcentaje,
        aprobado: aprobado,
        estado: aprobado ? 'Aprobado' : 'Reprobado',
        fecha: new Date().toISOString(),
        
        // ✅ RETROALIMENTACIÓN
        feedback: feedback.length > 0 ? feedback : ['✅ ¡Buen trabajo! No se detectaron errores críticos.'],
        
        // ✅ LECCIÓN APRENDIDA (del caso JSON)
        leccion: caso.leccion_aprendida || 'Continúa practicando para mejorar tus competencias en investigación de incidentes.',
        
        // ✅ CONCLUSIÓN OFICIAL (del caso JSON)
        conclusion: caso.conclusion_oficial || 'La investigación fue completada. Revisa la retroalimentación para mejorar.',
        
        // Para compatibilidad con SmartEvaluationV2
        dimensiones: {},
        puntajeCompetencias: porcentaje,
        nivelGeneral: { 
            nivel: porcentaje >= 80 ? 'MASTER' : 'BÁSICO', 
            color: '#2196F3', 
            icono: '🥈', 
            validez: '1 año' 
        }
    };
}

