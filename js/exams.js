// RAYOSHIELD EXAM - exams.js (CON SOPORTE PARA CASOS MASTER)

// ─────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE EXÁMENES TRADICIONALES
// ─────────────────────────────────────────────────────────────────────────
const CATEGORIAS = [
    { id: 'loto', nombre: '🔒 LOTO', norma: 'NOM-004-STPS-2008', descripcion: 'Sistemas de protección', icono: '🔒', niveles: [
        { id: 'operativo', nombre: 'Operativo', examId: 'loto_operativo' },
        { id: 'supervisor_obra', nombre: 'Supervisor de Obra', examId: 'loto_supervisor_obra' },
        { id: 'supervisor_she', nombre: 'Supervisor SHE', examId: 'loto_supervisor_she' }
    ]},
    { id: 'seguridad', nombre: '⚠️ Seguridad', norma: 'NOM-031-STPS-2011', descripcion: 'Seguridad en edificaciones', icono: '⚠️', niveles: [
        { id: 'operativo', nombre: 'Operativo', examId: 'seguridad_operativo' },
        { id: 'supervisor_obra', nombre: 'Supervisor de Obra', examId: 'seguridad_supervisor_obra' },
        { id: 'supervisor_she', nombre: 'Supervisor SHE', examId: 'seguridad_supervisor_she' }
    ]},
    { id: 'epp', nombre: '🦺 EPP', norma: 'NOM-017-STPS-2008', descripcion: 'Equipo de protección personal', icono: '🦺', niveles: [
        { id: 'operativo', nombre: 'Operativo', examId: 'epp_operativo' },
        { id: 'supervisor_obra', nombre: 'Supervisor de Obra', examId: 'epp_supervisor_obra' },
        { id: 'supervisor_she', nombre: 'Supervisor SHE', examId: 'epp_supervisor_she' }
    ]},
    { id: 'electricos', nombre: '⚡ Eléctricos', norma: 'NOM-029-STPS-2011', descripcion: 'Trabajos eléctricos', icono: '⚡', niveles: [
        { id: 'operativo', nombre: 'Operativo', examId: 'electricos_operativo' },
        { id: 'supervisor_obra', nombre: 'Supervisor de Obra', examId: 'electricos_supervisor_obra' },
        { id: 'supervisor_she', nombre: 'Supervisor SHE', examId: 'electricos_supervisor_she' }
    ]},
    { id: 'estatica', nombre: '🔥 Estática', norma: 'NOM-022-STPS-2015', descripcion: 'Electricidad estática', icono: '🔥', niveles: [
        { id: 'operativo', nombre: 'Operativo', examId: 'estatica_operativo' },
        { id: 'supervisor_obra', nombre: 'Supervisor de Obra', examId: 'estatica_supervisor_obra' },
        { id: 'supervisor_she', nombre: 'Supervisor SHE', examId: 'estatica_supervisor_she' }
    ]},
    { id: 'iluminacion', nombre: '💡 Iluminación', norma: 'NOM-025-STPS-2008', descripcion: 'Iluminación en trabajo', icono: '💡', niveles: [
        { id: 'operativo', nombre: 'Operativo', examId: 'iluminacion_operativo' },
        { id: 'supervisor_obra', nombre: 'Supervisor de Obra', examId: 'iluminacion_supervisor_obra' },
        { id: 'supervisor_she', nombre: 'Supervisor SHE', examId: 'iluminacion_supervisor_she' }
    ]},
    { id: 'modo4', nombre: '📋 MODO 4', norma: 'Procedimiento Interno', descripcion: 'Procedimiento interno', icono: '📋', niveles: [
        { id: 'operativo', nombre: 'Operativo', examId: 'modo4_operativo' },
        { id: 'supervisor_obra', nombre: 'Supervisor de Obra', examId: 'modo4_supervisor_obra' },
        { id: 'supervisor_she', nombre: 'Supervisor SHE', examId: 'modo4_supervisor_she' }
    ]}
];

// ─────────────────────────────────────────────────────────────────────────
// CASOS CRÍTICOS DE OBRA - INVESTIGACIÓN (NIVEL MASTER)
// ─────────────────────────────────────────────────────────────────────────
const CASOS_INVESTIGACION = [
    {
        id: 'ia-loto-energia-residual-hidraulica',
        titulo: 'Liberación de Energía Residual - Sistema Hidráulico',
        categoria: 'loto',
        nivel: 'master',
        icono: '⚠️',
        descripcion: 'Investigación de casi accidente por energía hidráulica no identificada',
        tiempo_estimado: '25 min',
        requisito: 'LOTO Supervisor SHE aprobado'
    }
    // Agrega más casos aquí conforme los crees
];

// ─────────────────────────────────────────────────────────────────────────
// FUNCIONES DE CARGA
// ─────────────────────────────────────────────────────────────────────────

// Cargar examen tradicional
async function cargarExamen(examId) {
    try {
        const response = await fetch('data/exams/' + examId + '.json');
        if (!response.ok) throw new Error('Examen no encontrado: ' + examId);
        return await response.json();
    } catch (error) {
        console.error('Error cargando examen:', error);
        return obtenerExamenDemo(examId);
    }
}

// Cargar caso de investigación MASTER
async function cargarCasoInvestigacion(casoId) {
    try {
        const response = await fetch('data/casos-criticos/' + casoId + '.json');
        if (!response.ok) throw new Error('Caso no encontrado: ' + casoId);
        return await response.json();
    } catch (error) {
        console.error('Error cargando caso:', error);
        return null;
    }
}

// Examen demo para pruebas
function obtenerExamenDemo(examId) {
    return {
        id: examId || 'demo',
        titulo: 'Examen de Prueba',
        norma: 'Demo',
        nivel: 'Operativo',
        min_score: 80,
        preguntas: [
            { id: 1, texto: '¿Qué significa LOTO?', opciones: ['Lock Out - Tag Out', 'Lock On - Tag On', 'Lock Out - Take Out', 'Long Out - Tag Out'], correcta_idx: 0 },
            { id: 2, texto: '¿Cuál es el objetivo de LOTO?', opciones: ['Ahorrar energía', 'Prevenir liberación de energía peligrosa', 'Aumentar producción', 'Reducir costos'], correcta_idx: 1 },
            { id: 3, texto: '¿Quién puede retirar un dispositivo LOTO?', opciones: ['Cualquier trabajador', 'El supervisor', 'Solo quien lo colocó', 'El gerente'], correcta_idx: 2 }
        ]
    };
}

// ─────────────────────────────────────────────────────────────────────────
// EVALUACIÓN INTELIGENTE PARA CASOS MASTER
// ─────────────────────────────────────────────────────────────────────────

// Evaluar pregunta de tipo "analisis_multiple" (múltiple selección)
function evaluarAnalisisMultiple(respuestasUsuario, pregunta) {
    let puntaje = 0;
    let feedback = [];
    
    // Verificar cada opción
    pregunta.opciones.forEach(function(opt, idx) {
        const seleccionada = respuestasUsuario.includes(idx);
        if (seleccionada === opt.correcta) {
            // Respuesta correcta (seleccionó correcta o no seleccionó incorrecta)
            puntaje += pregunta.peso / pregunta.opciones.length;
        } else {
            // Error: seleccionó incorrecta o no seleccionó correcta
            if (opt.feedback_sistemico) {
                feedback.push(opt.feedback_sistemico);
            }
        }
    });
    
    // Feedback experto si falló significativamente
    if (puntaje < pregunta.peso * 0.7 && pregunta.justificacion_experta) {
        feedback.push('💡 ' + pregunta.justificacion_experta);
    }
    
    return { puntaje: Math.round(puntaje), feedback: feedback };
}

// Evaluar pregunta de tipo "respuesta_abierta_guiada" (keyword matching)
function evaluarRespuestaAbierta(respuestaUsuario, pregunta) {
    if (!respuestaUsuario || respuestaUsuario.trim().length < 20) {
        return { 
            puntaje: 0, 
            feedback: ['⚠️ Tu respuesta es muy breve. Explica con más detalle el análisis sistémico (mínimo 20 caracteres).'] 
        };
    }
    
    const respuestaLower = respuestaUsuario.toLowerCase();
    let palabrasEncontradas = 0;
    
    // Contar palabras clave encontradas
    if (pregunta.palabras_clave_esperadas) {
        pregunta.palabras_clave_esperadas.forEach(function(palabra) {
            if (respuestaLower.includes(palabra.toLowerCase())) {
                palabrasEncontradas++;
            }
        });
    }
    
    // Calcular puntaje basado en cobertura de keywords
    const totalKeywords = pregunta.palabras_clave_esperadas ? pregunta.palabras_clave_esperadas.length : 1;
    const cobertura = palabrasEncontradas / totalKeywords;
    let puntaje = Math.round(pregunta.peso * cobertura);
    
    // Bonus por mencionar conceptos sistémicos
    if (respuestaLower.includes('sistema') || respuestaLower.includes('procedimiento') || respuestaLower.includes('gestión')) {
        puntaje = Math.min(puntaje + 5, pregunta.peso);
    }
    
    // Feedback constructivo
    let feedback = [];
    if (cobertura < 0.5 && pregunta.palabras_clave_esperadas) {
        feedback.push('💡 Considera mencionar: ' + pregunta.palabras_clave_esperadas.slice(0, 3).join(', ') + '...');
    }
    if (pregunta.criterios_evaluacion) {
        if (pregunta.criterios_evaluacion.menciona_sistema && !respuestaLower.includes('sistema')) {
            feedback.push('💡 Enfócate en QUÉ del sistema falló, no en QUIÉN cometió el error.');
        }
        if (pregunta.criterios_evaluacion.no_culpa_individuo && respuestaLower.match(/(culpa|error|falló)\s+(el\s+trabajador|técnico|operador)/i)) {
            feedback.push('💡 En investigación sistémica, evitamos culpar al individuo. Analiza las barreras fallidas.');
        }
    }
    if (pregunta.respuesta_modelo) {
        feedback.push('📝 Referencia: ' + pregunta.respuesta_modelo);
    }
    
    return { puntaje: puntaje, feedback: feedback };
}

// Evaluar pregunta de tipo "analisis_responsabilidad" (matriz de roles)
function evaluarAnalisisResponsabilidad(respuestasUsuario, pregunta) {
    let puntaje = 0;
    let feedback = [];
    
    pregunta.roles.forEach(function(role, roleIdx) {
        const seleccionNivel = respuestasUsuario[roleIdx];
        if (seleccionNivel !== undefined && seleccionNivel !== null) {
            const opcion = role.opciones[seleccionNivel];
            if (opcion && opcion.correcta) {
                puntaje += pregunta.peso / pregunta.roles.length;
            } else if (opcion && opcion.explicacion) {
                feedback.push(`👤 ${role.rol}: ${opcion.explicacion}`);
            }
        }
    });
    
    // Feedback general si hay errores
    if (feedback.length === 0 && puntaje < pregunta.peso * 0.8) {
        feedback.push('💡 En un enfoque sistémico, la responsabilidad se distribuye según la capacidad de influir en las barreras de seguridad. La organización tiene mayor responsabilidad que el individuo.');
    }
    
    return { puntaje: Math.round(puntaje), feedback: feedback };
}

// Evaluar pregunta de tipo "plan_accion" (selección con jerarquía)
function evaluarPlanAccion(respuestasUsuario, pregunta) {
    let puntaje = 0;
    let feedback = [];
    let seleccionadas = respuestasUsuario.filter(function(idx) { return idx !== undefined && idx !== null; });
    
    // Verificar respuestas correctas
    seleccionadas.forEach(function(idx) {
        const opt = pregunta.opciones[idx];
        if (opt && opt.correcta) {
            // Bonus por priorizar correctas
            puntaje += pregunta.peso / pregunta.opciones.length * 1.2;
        } else if (opt && opt.explicacion) {
            feedback.push(opt.explicacion);
        }
    });
    
    // Verificar criterios de aprobación
    if (pregunta.criterio_aprobacion) {
        const correctasCount = seleccionadas.filter(function(idx) {
            return pregunta.opciones[idx]?.correcta;
        }).length;
        
        if (correctasCount < pregunta.criterio_aprobacion.min_correctas) {
            feedback.push(`⚠️ Se requieren al menos ${pregunta.criterio_aprobacion.min_correctas} acciones efectivas para prevenir recurrencia.`);
        }
        
        if (pregunta.criterio_aprobacion.debe_incluir_ingenieria) {
            const incluyeIngenieria = seleccionadas.some(function(idx) {
                return pregunta.opciones[idx]?.jerarquia === 'ingenieria' && pregunta.opciones[idx]?.correcta;
            });
            if (!incluyeIngenieria) {
                feedback.push('💡 Los controles de ingeniería (diseño, hardware) son más efectivos que los administrativos. Priorízalos cuando sea posible.');
            }
        }
        
        if (pregunta.criterio_aprobacion.no_debe_incluir_solo_capacitacion) {
            const soloCapacitacion = seleccionadas.every(function(idx) {
                return pregunta.opciones[idx]?.texto?.toLowerCase().includes('capacitar');
            });
            if (soloCapacitacion && seleccionadas.length > 0) {
                feedback.push('💡 Capacitar es importante, pero no previene errores por sí solo. Combínalo con controles de ingeniería y procedimientos.');
            }
        }
    }
    
    // Feedback sobre jerarquía de controles
    const jerarquiasSeleccionadas = seleccionadas.map(function(idx) {
        return pregunta.opciones[idx]?.jerarquia;
    }).filter(function(j) { return j; });
    
    if (jerarquiasSeleccionadas.includes('ingenieria')) {
        feedback.push('✅ Excelente: Priorizaste controles de ingeniería (más efectivos y confiables).');
    }
    
    return { puntaje: Math.min(Math.round(puntaje), pregunta.peso), feedback: feedback };
}

// Función principal de evaluación para casos MASTER
function evaluarCasoInvestigacion(respuestasPorPregunta, caso) {
    let puntajeTotal = 0;
    let feedbackGeneral = [];
    let detallesPorPregunta = [];
    
    caso.preguntas.forEach(function(pregunta) {
        const respuestas = respuestasPorPregunta[pregunta.id] || [];
        let resultado;
        
        switch(pregunta.tipo) {
            case 'analisis_multiple':
                resultado = evaluarAnalisisMultiple(respuestas, pregunta);
                break;
            case 'respuesta_abierta_guiada':
                resultado = evaluarRespuestaAbierta(respuestas[0], pregunta);
                break;
            case 'analisis_responsabilidad':
                resultado = evaluarAnalisisResponsabilidad(respuestas, pregunta);
                break;
            case 'plan_accion':
                resultado = evaluarPlanAccion(respuestas, pregunta);
                break;
            default:
                resultado = { puntaje: 0, feedback: ['⚠️ Tipo de pregunta no soportado: ' + pregunta.tipo] };
        }
        
        puntajeTotal += resultado.puntaje;
        detallesPorPregunta.push({
            preguntaId: pregunta.id,
            tipo: pregunta.tipo,
            puntaje: resultado.puntaje,
            maxPuntaje: pregunta.peso,
            feedback: resultado.feedback
        });
        feedbackGeneral = feedbackGeneral.concat(resultado.feedback);
    });
    
    // Determinar estado final
    const puntajeMaximo = caso.metadatos_evaluacion?.puntaje_maximo || 100;
    const puntajeAprobacion = caso.metadatos_evaluacion?.puntaje_aprobacion_master || 80;
    const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    
    return {
        puntajeTotal: puntajeTotal,
        puntajeMaximo: puntajeMaximo,
        porcentaje: porcentaje,
        aprobado: porcentaje >= puntajeAprobacion,
        feedback: feedbackGeneral,
        detalles: detallesPorPregunta,
        leccion: caso.leccion_aprendida_master || caso.leccion_aprendida,
        conclusion: caso.conclusion_oficial || caso.conclusion
    };
}

// Exportar funciones para uso global (navegador)
if (typeof window !== 'undefined') {
    window.evaluarCasoInvestigacion = evaluarCasoInvestigacion;
    window.evaluarAnalisisMultiple = evaluarAnalisisMultiple;
    window.evaluarRespuestaAbierta = evaluarRespuestaAbierta;
    window.evaluarAnalisisResponsabilidad = evaluarAnalisisResponsabilidad;
    window.evaluarPlanAccion = evaluarPlanAccion;
    console.log('✅ Funciones de evaluación MASTER cargadas');
}
