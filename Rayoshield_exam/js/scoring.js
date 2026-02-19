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