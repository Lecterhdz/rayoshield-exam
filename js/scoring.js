// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - LÓGICA DE CALIFICACIÓN (scoring.js)
// Versión: 2.0 - Corregido y Mejorado
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el resultado del examen tradicional
 * @param {number[]} respuestasUsuario - Índices de respuestas seleccionadas
 * @param {Object} examen - Datos del examen con preguntas y min_score
 * @returns {Object} - Resultado con score, aciertos, estado, etc.
 */
function calcularResultado(respuestasUsuario, examen) {
    // ✅ VALIDACIONES DE SEGURIDAD
    if (!examen || !examen.preguntas || !Array.isArray(examen.preguntas)) {
        console.error('❌ Error: Examen o preguntas no válidos');
        return {
            score: 0,
            aciertos: 0,
            total: 0,
            estado: 'Error',
            minScore: 80,
            fecha: new Date().toISOString()
        };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        console.error('❌ Error: Respuestas no válidas');
        return {
            score: 0,
            aciertos: 0,
            total: examen.preguntas.length,
            estado: 'Error',
            minScore: examen.min_score || 80,
            fecha: new Date().toISOString()
        };
    }
    
    let aciertos = 0;
    
    // Contar aciertos
    for (let i = 0; i < respuestasUsuario.length; i++) {
        if (examen.preguntas[i] && respuestasUsuario[i] === examen.preguntas[i].correcta_idx) {
            aciertos++;
        }
    }
    
    // Calcular porcentaje
    const score = (aciertos / examen.preguntas.length) * 100;
    
    // Determinar estado
    const minScore = examen.min_score || 80;
    const estado = score >= minScore ? 'Aprobado' : 'Reprobado';
    
    return {
        score: Math.round(score * 10) / 10,  // Redondear a 1 decimal
        aciertos: aciertos,
        total: examen.preguntas.length,
        estado: estado,
        minScore: minScore,
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
    return typeof score === 'number' && typeof minScore === 'number' && score >= minScore;
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

// ─────────────────────────────────────────────────────────────────────────────
// EVALUACIÓN DE CASOS DE INVESTIGACIÓN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evalúa un caso de investigación completo
 * @param {Object} respuestasPorPregunta - Respuestas organizadas por ID de pregunta
 * @param {Object} caso - Datos del caso con preguntas y metadatos
 * @returns {Object} - Resultado con puntaje, feedback, lección, etc.
 */
function evaluarCasoInvestigacion(respuestasPorPregunta, caso) {
    // ✅ VALIDACIONES DE SEGURIDAD
    if (!caso || !caso.preguntas || !Array.isArray(caso.preguntas)) {
        console.error('❌ Error: Caso o preguntas no válidos');
        return {
            puntajeTotal: 0,
            puntajeMaximo: 0,
            porcentaje: 0,
            aprobado: false,
            estado: 'Error',
            feedback: ['❌ Error en la evaluación del caso'],
            leccion: 'Error en la carga del caso. Recarga la página e intenta nuevamente.',
            conclusion: 'No se pudo completar la evaluación.',
            fecha: new Date().toISOString()
        };
    }
    
    if (!respuestasPorPregunta || typeof respuestasPorPregunta !== 'object') {
        console.error('❌ Error: Respuestas no válidas');
        return {
            puntajeTotal: 0,
            puntajeMaximo: 0,
            porcentaje: 0,
            aprobado: false,
            estado: 'Error',
            feedback: ['❌ Error en las respuestas'],
            leccion: 'Error en el envío de respuestas. Intenta nuevamente.',
            conclusion: 'No se pudo completar la evaluación.',
            fecha: new Date().toISOString()
        };
    }
    
    var puntajeTotal = 0;
    var puntajeMaximo = 0;
    var feedback = [];
    
    // ✅ EVALUAR CADA PREGUNTA
    caso.preguntas.forEach(function(pregunta, idx) {
        if (!pregunta || !pregunta.id) {
            console.warn('⚠️ Pregunta ' + idx + ' sin ID válido');
            return;
        }
        
        var respuestaUsuario = respuestasPorPregunta[pregunta.id] || [];
        var resultadoEvaluacion = null;
        
        // ✅ EVALUAR SEGÚN TIPO DE PREGUNTA
        switch(pregunta.tipo) {
            case 'analisis_multiple':
            case 'deteccion_omisiones':
            case 'identificacion_sesgos':
            case 'analisis_normativo':
            case 'deteccion_inconsistencias':
            case 'diagnostico_sistema':
                resultadoEvaluacion = evaluarAnalisisMultiple(pregunta, respuestaUsuario);
                break;
                
            case 'respuesta_abierta_guiada':
            case 'redaccion_tecnica':
                resultadoEvaluacion = evaluarRespuestaAbierta(pregunta, respuestaUsuario);
                break;
                
            case 'analisis_responsabilidad':
                resultadoEvaluacion = evaluarAnalisisResponsabilidad(pregunta, respuestaUsuario);
                break;
                
            case 'plan_accion':
            case 'evaluacion_correctivas':
                resultadoEvaluacion = evaluarPlanAccion(pregunta, respuestaUsuario);
                break;
                
            case 'ordenamiento_dinamico':
            case 'matriz_priorizacion':
                resultadoEvaluacion = evaluarOrdenamientoDinamico(pregunta, respuestaUsuario);
                break;
                
            case 'calculo_tecnico':
                resultadoEvaluacion = evaluarCalculoTecnico(pregunta, respuestaUsuario);
                break;
                
            default:
                // Pregunta de tipo desconocido - dar puntaje parcial
                resultadoEvaluacion = {
                    puntaje: pregunta.peso ? pregunta.peso * 0.5 : 0,
                    feedback: '⚠️ Tipo de pregunta no reconocido'
                };
        }
        
        // ✅ ACUMULAR PUNTAJE Y FEEDBACK
        if (resultadoEvaluacion) {
            puntajeTotal += resultadoEvaluacion.puntaje || 0;
            puntajeMaximo += pregunta.peso || 0;
            
            if (resultadoEvaluacion.feedback) {
                // ✅ ASEGURAR QUE FEEDBACK SEA ARRAY
                if (Array.isArray(resultadoEvaluacion.feedback)) {
                    feedback = feedback.concat(resultadoEvaluacion.feedback);
                } else if (typeof resultadoEvaluacion.feedback === 'string') {
                    feedback.push(resultadoEvaluacion.feedback);
                }
            }
        }
    });
    
    // ✅ CALCULAR PORCENTAJE
    var porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    
    // ✅ OBTENER PUNTAJE DE APROBACIÓN DEL CASO
    var puntajeAprobacion = 70; // Default
    if (caso.metadatos_evaluacion) {
        puntajeAprobacion = caso.metadatos_evaluacion.puntaje_aprobacion || 
                           caso.metadatos_evaluacion.puntaje_aprobacion_master || 70;
    }
    
    var aprobado = porcentaje >= puntajeAprobacion;
    
    // ✅ MAPEAR CORRECTAMENTE LOS CAMPOS DEL CASO JSON
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
        
        // ✅ PARA COMPATIBILIDAD CON SmartEvaluationV2
        dimensiones: {},
        puntajeCompetencias: porcentaje,
        nivelGeneral: { 
            nivel: porcentaje >= 80 ? 'MASTER' : 'BÁSICO', 
            color: porcentaje >= 80 ? '#2196F3' : '#FF9800', 
            icono: porcentaje >= 80 ? '🥈' : '📚', 
            validez: '1 año' 
        }
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES DE EVALUACIÓN POR TIPO DE PREGUNTA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evalúa pregunta de tipo análisis múltiple (checkbox)
 * @param {Object} pregunta - Datos de la pregunta con opciones
 * @param {number[]} respuestasUsuario - Índices seleccionados
 * @returns {Object} - Puntaje y feedback
 */
function evaluarAnalisisMultiple(pregunta, respuestasUsuario) {
    // ✅ VALIDACIONES
    if (!pregunta || !pregunta.opciones || !Array.isArray(pregunta.opciones)) {
        return { puntaje: 0, feedback: '❌ Error en la pregunta' };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        respuestasUsuario = [];
    }
    
    var puntaje = 0;
    var feedback = [];
    var pesoPorOpcion = pregunta.peso / pregunta.opciones.length;
    
    // ✅ EVALUAR CADA OPCIÓN
    pregunta.opciones.forEach(function(opt, idx) {
        var seleccionada = respuestasUsuario.includes(idx);
        
        if (seleccionada === opt.correcta) {
            // ✅ Respuesta correcta (seleccionó correcta o no seleccionó incorrecta)
            puntaje += pesoPorOpcion;
        } else {
            // ✅ Respuesta incorrecta
            if (opt.feedback_sistemico) {
                feedback.push(opt.feedback_sistemico);
            }
        }
    });
    
    // ✅ FEEDBACK EXPERTO SI FALLÓ
    if (puntaje < pregunta.peso * 0.8 && pregunta.justificacion_experta) {
        feedback.push('💡 ' + pregunta.justificacion_experta);
    }
    
    return { 
        puntaje: Math.round(puntaje), 
        feedback: feedback 
    };
}

/**
 * Evalúa pregunta de respuesta abierta guiada
 * @param {Object} pregunta - Datos de la pregunta
 * @param {string[]} respuestasUsuario - Array con el texto de respuesta
 * @returns {Object} - Puntaje y feedback
 */
function evaluarRespuestaAbierta(pregunta, respuestasUsuario) {
    // ✅ VALIDACIONES
    if (!pregunta) {
        return { puntaje: 0, feedback: '❌ Error en la pregunta' };
    }
    
    // ✅ OBTENER TEXTO DE RESPUESTA
    var texto = '';
    if (respuestasUsuario && Array.isArray(respuestasUsuario) && respuestasUsuario[0]) {
        texto = respuestasUsuario[0];
    }
    
    var longitudMinima = pregunta.longitud_minima || 50;
    var puntaje = 0;
    var feedback = '';
    
    // ✅ EVALUAR LONGITUD
    if (!texto || texto.trim().length === 0) {
        puntaje = 0;
        feedback = '❌ No proporcionaste respuesta';
    }
    else if (texto.length < longitudMinima) {
        puntaje = Math.round(pregunta.peso * 0.3);
        feedback = '⚠️ Tu respuesta es muy breve. Explica con más detalle (mínimo ' + longitudMinima + ' caracteres)';
    }
    else if (texto.length >= longitudMinima && texto.length < longitudMinima * 2) {
        puntaje = Math.round(pregunta.peso * 0.7);
        feedback = '✅ Respuesta aceptable, pero podrías profundizar más en el análisis';
    }
    else {
        puntaje = pregunta.peso;
        feedback = '✅ Excelente: Tu respuesta demuestra análisis sistémico profundo';
    }
    
    return {
        puntaje: puntaje,
        feedback: feedback,
        longitud: texto.length
    };
}

/**
 * Evalúa pregunta de análisis de responsabilidad (matriz de roles)
 * @param {Object} pregunta - Datos de la pregunta con roles
 * @param {number[]} respuestasUsuario - Índices seleccionados por rol
 * @returns {Object} - Puntaje y feedback
 */
function evaluarAnalisisResponsabilidad(pregunta, respuestasUsuario) {
    // ✅ VALIDACIONES
    if (!pregunta || !pregunta.roles || !Array.isArray(pregunta.roles)) {
        return { puntaje: 0, feedback: '❌ Error en la pregunta' };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        respuestasUsuario = [];
    }
    
    var puntaje = 0;
    var feedback = [];
    var pesoPorRol = pregunta.peso / pregunta.roles.length;
    
    // ✅ EVALUAR CADA ROL
    pregunta.roles.forEach(function(role, roleIdx) {
        var seleccionNivel = respuestasUsuario[roleIdx];
        
        if (seleccionNivel !== undefined && role.opciones && role.opciones[seleccionNivel]) {
            var opcion = role.opciones[seleccionNivel];
            
            if (opcion.correcta) {
                puntaje += pesoPorRol;
            } else if (opcion.explicacion) {
                feedback.push('👤 ' + role.rol + ': ' + opcion.explicacion);
            }
        }
    });
    
    // ✅ FEEDBACK SISTÉMICO
    if (feedback.length === 0 && puntaje < pregunta.peso) {
        feedback.push('💡 En un enfoque sistémico, la responsabilidad se distribuye según la capacidad de influir en las barreras de seguridad.');
    }
    
    return { 
        puntaje: Math.round(puntaje), 
        feedback: feedback 
    };
}

/**
 * Evalúa pregunta de plan de acción (selección con jerarquía)
 * @param {Object} pregunta - Datos de la pregunta con opciones
 * @param {number[]} respuestasUsuario - Índices seleccionados
 * @returns {Object} - Puntaje y feedback
 */
function evaluarPlanAccion(pregunta, respuestasUsuario) {
    // ✅ VALIDACIONES
    if (!pregunta || !pregunta.opciones || !Array.isArray(pregunta.opciones)) {
        return { puntaje: 0, feedback: '❌ Error en la pregunta' };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        respuestasUsuario = [];
    }
    
    var puntaje = 0;
    var feedback = [];
    var pesoPorOpcion = pregunta.peso / pregunta.opciones.length;
    
    // ✅ EVALUAR RESPUESTAS SELECCIONADAS
    respuestasUsuario.forEach(function(idx) {
        var opt = pregunta.opciones[idx];
        
        if (opt) {
            if (opt.correcta) {
                // ✅ Bonus por priorizar controles de ingeniería
                if (opt.jerarquia === 'ingenieria') {
                    puntaje += pesoPorOpcion * 1.2;
                    feedback.push('✅ Excelente: Priorizaste controles de ingeniería (más efectivos).');
                } else {
                    puntaje += pesoPorOpcion;
                }
            } else if (opt.explicacion) {
                feedback.push(opt.explicacion);
            }
        }
    });
    
    // ✅ VERIFICAR CRITERIOS DE APROBACIÓN
    if (pregunta.criterio_aprobacion) {
        var correctasCount = respuestasUsuario.filter(function(idx) {
            return pregunta.opciones[idx] && pregunta.opciones[idx].correcta;
        }).length;
        
        if (correctasCount < pregunta.criterio_aprobacion.min_correctas) {
            feedback.push('⚠️ Se requieren al menos ' + pregunta.criterio_aprobacion.min_correctas + ' acciones efectivas.');
        }
    }
    
    // ✅ LIMITAR PUNTAJE AL MÁXIMO
    puntaje = Math.min(puntaje, pregunta.peso);
    
    return { 
        puntaje: Math.round(puntaje), 
        feedback: feedback 
    };
}

/**
 * Evalúa pregunta de ordenamiento dinámico
 * @param {Object} pregunta - Datos de la pregunta con opciones
 * @param {number[]} respuestasUsuario - Orden seleccionado
 * @returns {Object} - Puntaje y feedback
 */
function evaluarOrdenamientoDinamico(pregunta, respuestasUsuario) {
    // ✅ VALIDACIONES
    if (!pregunta || !pregunta.opciones || !Array.isArray(pregunta.opciones)) {
        return { puntaje: 0, feedback: '❌ Error en la pregunta' };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario) || respuestasUsuario.length === 0) {
        return { puntaje: 0, feedback: '⚠️ No ordenaste los elementos' };
    }
    
    // ✅ ORDEN CORRECTO (0, 1, 2, 3...)
    var ordenCorrecto = pregunta.opciones.map(function(_, idx) { return idx; });
    
    // ✅ CONTAR POSICIONES CORRECTAS
    var posicionesCorrectas = 0;
    respuestasUsuario.forEach(function(posicion, idx) {
        if (posicion === ordenCorrecto[idx]) {
            posicionesCorrectas++;
        }
    });
    
    // ✅ CALCULAR PUNTAJE PROPORCIONAL
    var porcentajeCorrecto = posicionesCorrectas / pregunta.opciones.length;
    var puntaje = Math.round(pregunta.peso * porcentajeCorrecto);
    
    var feedback = [];
    if (porcentajeCorrecto === 1) {
        feedback.push('✅ Excelente: Secuencia lógica correcta');
    } else if (porcentajeCorrecto >= 0.5) {
        feedback.push('⚠️ Algunas posiciones son correctas, revisa la secuencia lógica');
    } else {
        feedback.push('❌ La secuencia no es la óptima. Revisa el procedimiento estándar.');
    }
    
    return { 
        puntaje: puntaje, 
        feedback: feedback 
    };
}

/**
 * Evalúa pregunta de cálculo técnico
 * @param {Object} pregunta - Datos de la pregunta con respuesta correcta
 * @param {number[]} respuestasUsuario - Array con el número ingresado
 * @returns {Object} - Puntaje y feedback
 */
function evaluarCalculoTecnico(pregunta, respuestasUsuario) {
    // ✅ VALIDACIONES
    if (!pregunta) {
        return { puntaje: 0, feedback: '❌ Error en la pregunta' };
    }
    
    var respuestaUsuario = respuestasUsuario && respuestasUsuario[0] ? respuestasUsuario[0] : null;
    
    if (respuestaUsuario === null || respuestaUsuario === undefined || isNaN(respuestaUsuario)) {
        return { puntaje: 0, feedback: '❌ No ingresaste un valor numérico' };
    }
    
    // ✅ VERIFICAR SI HAY RESPUESTA CORRECTA DEFINIDA
    if (pregunta.respuesta_correcta !== undefined) {
        var tolerancia = pregunta.tolerancia || 0.05; // 5% de tolerancia por defecto
        var diferencia = Math.abs(respuestaUsuario - pregunta.respuesta_correcta);
        var margen = pregunta.respuesta_correcta * tolerancia;
        
        if (diferencia <= margen) {
            return { 
                puntaje: pregunta.peso, 
                feedback: '✅ Excelente: Cálculo correcto' 
            };
        } else {
            return { 
                puntaje: Math.round(pregunta.peso * 0.3), 
                feedback: '⚠️ El cálculo no es exacto. Revisa la fórmula y las unidades.' 
            };
        }
    }
    
    // ✅ SI NO HAY RESPUESTA CORRECTA DEFINIDA, DAR PUNTAJE POR INTENTO
    return { 
        puntaje: Math.round(pregunta.peso * 0.5), 
        feedback: '✅ Cálculo registrado. Revisa la retroalimentación del caso.' 
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.calcularResultado = calcularResultado;
    window.esAprobatorio = esAprobatorio;
    window.getColorEstado = getColorEstado;
    window.getIconoResultado = getIconoResultado;
    window.evaluarCasoInvestigacion = evaluarCasoInvestigacion;
    window.evaluarAnalisisMultiple = evaluarAnalisisMultiple;
    window.evaluarRespuestaAbierta = evaluarRespuestaAbierta;
    window.evaluarAnalisisResponsabilidad = evaluarAnalisisResponsabilidad;
    window.evaluarPlanAccion = evaluarPlanAccion;
    window.evaluarOrdenamientoDinamico = evaluarOrdenamientoDinamico;
    window.evaluarCalculoTecnico = evaluarCalculoTecnico;
    
    console.log('✅ scoring.js cargado - Funciones de calificación habilitadas');
}
