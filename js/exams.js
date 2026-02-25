// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - exams.js
// Versión: 2.0 - Corregido y Mejorado
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE EXÁMENES TRADICIONALES
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// CASOS CRÍTICOS DE OBRA - INVESTIGACIÓN
// ─────────────────────────────────────────────────────────────────────────────
const CASOS_INVESTIGACION = [
    // CASOS BÁSICOS (5)
    {
      id: 'case-loto-basico-001',
      icono: '🔒',
      titulo: 'Mantenimiento de Bomba sin LOTO',
      nivel: 'basico',
      tiempo_estimado: '15 min',
      descripcion: 'Trabajador realiza mantenimiento en bomba sin aplicar procedimiento de bloqueo/etiquetado',
      requisito: 'Examen NOM-004-STPS aprobado'
    },
    {
      id: 'case-epp-basico-001',
      icono: '🦺',
      titulo: 'Trabajo en Altura sin Arnés',
      nivel: 'basico',
      tiempo_estimado: '15 min',
      descripcion: 'Trabajador realiza trabajo en plataforma elevada sin usar arnés de seguridad',
      requisito: 'Examen NOM-009-STPS aprobado'
    },
    {
      id: 'case-espacio-confinado-basico-001',
      icono: '🛢️',
      titulo: 'Entrada a Tanque sin Medición',
      nivel: 'basico',
      tiempo_estimado: '15 min',
      descripcion: 'Trabajador entra a tanque de almacenamiento sin medición previa de atmósfera',
      requisito: 'Examen NOM-033-STPS aprobado'
    },
    {
      id: 'case-electrico-basico-001',
      icono: '⚡',
      titulo: 'Conexión Eléctrica sin Desenergizar',
      nivel: 'basico',
      tiempo_estimado: '15 min',
      descripcion: 'Electricista realiza conexión en tablero energizado sin EPP adecuado',
      requisito: 'Examen NOM-029-STPS aprobado'
    },
    {
      id: 'case-quimico-basico-001',
      icono: '🧪',
      titulo: 'Manejo de Químico sin Hoja de Seguridad',
      nivel: 'basico',
      tiempo_estimado: '15 min',
      descripcion: 'Trabajador maneja producto químico sin conocer sus peligros ni usar EPP adecuado',
      requisito: 'Examen NOM-018-STPS aprobado'
    },
    
    // CASOS MASTER (7)
    {
        id: 'case-loto-energia-residual-001',
        titulo: 'Liberación de Energía Residual - Sistema Hidráulico',
        categoria: 'loto',
        nivel: 'master',
        icono: '⚠️',
        descripcion: 'Investigación de casi accidente por energía hidráulica no identificada',
        tiempo_estimado: '25 min',
        requisito: 'LOTO Supervisor SHE aprobado'
    },
    {
        id: 'case-elec-arco-electrico-001',
        titulo: 'Arco Eléctrico en Tablero de Distribución 480V',
        categoria: 'electricos',
        nivel: 'master',
        icono: '⚡',
        descripcion: 'Investigación de accidente grave por trabajo con equipos energizados sin controles',
        tiempo_estimado: '30 min',
        requisito: 'Eléctricos Supervisor SHE aprobado'
    },
    {
        id: 'case-loto-master-001',
        titulo: 'Mantenimiento de Compresor con LOTO Incompleto',
        categoria: 'Loto',
        nivel: 'master',
        icono: '🔒',
        descripcion: 'Trabajador realiza mantenimiento con procedimiento de bloqueo incompleto',
        tiempo_estimado: '30 min',
        requisito: 'Examen NOM-004-STPS Supervisor aprobado'
    },
    {
        id: 'case-incendio-master-001',
        titulo: 'Incendio en Almacén de Químicos',
        categoria: 'Incendios',
        nivel: 'master',
        icono: '🔥',
        descripcion: 'Incendio se origina en almacén de químicos por incompatibilidad de productos',
        tiempo_estimado: '30 min',
        requisito: 'Examen NOM-002-STPS aprobado'
    },
    {
        id: 'case-quimico-master-001',
        titulo: 'Exposición a Solvente Tóxico sin Protección',
        categoria: 'Quimicos',
        nivel: 'master',
        icono: '🧪',
        descripcion: 'Trabajadores expuestos a solvente tóxico en espacio semi-confinado sin protección adecuada',
        tiempo_estimado: '30 min',
        requisito: 'Examen NOM-010-STPS aprobado'
    },
    {
        id: 'case-maquinaria-master-001',
        titulo: 'Atrapamiento en Prensa Hidráulica',
        categoria: 'Maquinaria',
        nivel: 'master',
        icono: '⚙️',
        descripcion: 'Operador sufre atrapamiento en prensa hidráulica por falla de guardas de seguridad',
        tiempo_estimado: '30 min',
        requisito: 'Examen NOM-004-STPS aprobado'
    },
    {
        id: 'case-alturas-master-001',
        titulo: 'Caída desde Andamio Inestable',
        categoria: 'Alturas',
        nivel: 'master',
        icono: '🏗️',
        descripcion: 'Trabajador cae desde andamio mal instalado en trabajo de fachada',
        tiempo_estimado: '30 min',
        requisito: 'Examen NOM-009-STPS aprobado'
    },
    
    // CASOS ELITE (3)
    {
      id: 'case-loto-elite-001',
      icono: '🔒',
      titulo: 'LOTO con Información Contradictoria',
      nivel: 'elite',
      tiempo_estimado: '40 min',
      descripcion: 'Caso con testimonios contradictorios que requieren juicio profesional',
      requisito: '5 casos MASTER aprobados con 80%+'
    },
    {
      id: 'case-multiple-elite-001',
      icono: '⚠️',
      titulo: 'Incidente Múltiple con Víctimas Secundarias',
      nivel: 'elite',
      tiempo_estimado: '40 min',
      descripcion: 'Rescate fallido que generó víctimas secundarias',
      requisito: '5 casos MASTER aprobados con 80%+'
    },
    {
      id: 'case-cadena-elite-001',
      icono: '⚙️',
      titulo: 'Cadena de Fallos con Análisis de ROI',
      nivel: 'elite',
      tiempo_estimado: '40 min',
      descripcion: 'Análisis de costo-beneficio de controles preventivos',
      requisito: '5 casos MASTER aprobados con 80%+'
    },

    // CASOS PERICIAL (2)
    {
      id: 'case-legal-pericial-001',
      icono: '⚖️',
      titulo: 'Accidente Fatal con Responsabilidad Penal',
      nivel: 'pericial',
      tiempo_estimado: '60 min',
      descripcion: 'Análisis forense con implicaciones legales penales',
      requisito: '10 casos ELITE aprobados con 85%+'
    },
    {
      id: 'case-corte-pericial-001',
      icono: '⚖️',
      titulo: 'Dictamen Pericial para Audiencia Laboral',
      nivel: 'pericial',
      tiempo_estimado: '60 min',
      descripcion: 'Determinación de despido justificado según LFT',
      requisito: '10 casos ELITE aprobados con 85%+'
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES DE CARGA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cargar examen tradicional desde JSON
 */
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

/**
 * Cargar caso de investigación desde JSON
 */
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

/**
 * Examen demo para pruebas
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES DE EVALUACIÓN POR TIPO DE PREGUNTA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evalúa pregunta de tipo análisis múltiple (checkbox)
 */
function evaluarAnalisisMultiple(respuestasUsuario, pregunta) {
    // ✅ VALIDACIONES DE SEGURIDAD
    if (!pregunta) {
        console.error('❌ Error: pregunta es undefined');
        return { puntaje: 0, feedback: ['❌ Error en la pregunta'] };
    }
    
    if (!pregunta.opciones || !Array.isArray(pregunta.opciones)) {
        console.error('❌ Error: pregunta.opciones no es un array', pregunta);
        return { puntaje: 0, feedback: ['❌ Error en las opciones de la pregunta'] };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        respuestasUsuario = [];
    }
    
    let puntaje = 0;
    let feedback = [];
    let pesoPorOpcion = pregunta.peso / pregunta.opciones.length;
    
    // ✅ EVALUAR CADA OPCIÓN
    pregunta.opciones.forEach(function(opt, idx) {
        const seleccionada = respuestasUsuario.includes(idx);
        if (seleccionada === opt.correcta) {
            puntaje += pesoPorOpcion;
        } else {
            if (opt.feedback_sistemico) {
                feedback.push(opt.feedback_sistemico);
            }
        }
    });
    
    // Feedback experto si falló
    if (puntaje < pregunta.peso * 0.8 && pregunta.justificacion_experta) {
        feedback.push('💡 ' + pregunta.justificacion_experta);
    }
    
    return { puntaje: Math.round(puntaje), feedback: feedback };
}

/**
 * Evalúa pregunta de respuesta abierta guiada
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
        feedback = '⚠️ Tu respuesta es muy breve (mínimo ' + longitudMinima + ' caracteres)';
    }
    else if (texto.length >= longitudMinima && texto.length < longitudMinima * 2) {
        puntaje = Math.round(pregunta.peso * 0.7);
        feedback = '✅ Respuesta aceptable, pero podrías profundizar más';
    }
    else {
        puntaje = pregunta.peso;
        feedback = '✅ Excelente: Tu respuesta demuestra análisis sistémico';
    }
    
    return {
        puntaje: puntaje,
        feedback: feedback,
        longitud: texto.length
    };
}

/**
 * Evalúa pregunta de análisis de responsabilidad (matriz de roles)
 */
function evaluarAnalisisResponsabilidad(respuestasUsuario, pregunta) {
    // ✅ VALIDACIONES
    if (!pregunta || !pregunta.roles || !Array.isArray(pregunta.roles)) {
        return { puntaje: 0, feedback: ['❌ Error en la pregunta'] };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        respuestasUsuario = [];
    }
    
    let puntaje = 0;
    let feedback = [];
    let pesoPorRol = pregunta.peso / pregunta.roles.length;
    
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
    
    return { puntaje: Math.round(puntaje), feedback: feedback };
}

/**
 * Evalúa pregunta de plan de acción (selección con jerarquía)
 */
function evaluarPlanAccion(respuestasUsuario, pregunta) {
    // ✅ VALIDACIONES
    if (!pregunta || !pregunta.opciones || !Array.isArray(pregunta.opciones)) {
        return { puntaje: 0, feedback: ['❌ Error en la pregunta'] };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario)) {
        respuestasUsuario = [];
    }
    
    let puntaje = 0;
    let feedback = [];
    let pesoPorOpcion = pregunta.peso / pregunta.opciones.length;
    
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
    
    return { puntaje: Math.round(puntaje), feedback: feedback };
}

/**
 * Evalúa pregunta de ordenamiento dinámico
 */
function evaluarOrdenamientoDinamico(respuestasUsuario, pregunta) {
    // ✅ VALIDACIONES
    if (!pregunta || !pregunta.opciones || !Array.isArray(pregunta.opciones)) {
        return { puntaje: 0, feedback: ['❌ Error en la pregunta'] };
    }
    
    if (!respuestasUsuario || !Array.isArray(respuestasUsuario) || respuestasUsuario.length === 0) {
        return { puntaje: 0, feedback: ['⚠️ No ordenaste los elementos'] };
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
    
    return { puntaje: puntaje, feedback: feedback };
}

/**
 * Evalúa pregunta de cálculo técnico
 */
function evaluarCalculoTecnico(respuestasUsuario, pregunta) {
    // ✅ VALIDACIONES
    if (!pregunta) {
        return { puntaje: 0, feedback: ['❌ Error en la pregunta'] };
    }
    
    var respuestaUsuario = respuestasUsuario && respuestasUsuario[0] ? respuestasUsuario[0] : null;
    
    if (respuestaUsuario === null || respuestaUsuario === undefined || isNaN(respuestaUsuario)) {
        return { puntaje: 0, feedback: ['❌ No ingresaste un valor numérico'] };
    }
    
    // ✅ VERIFICAR SI HAY RESPUESTA CORRECTA DEFINIDA
    if (pregunta.respuesta_correcta !== undefined) {
        var tolerancia = pregunta.tolerancia || 0.05; // 5% de tolerancia por defecto
        var diferencia = Math.abs(respuestaUsuario - pregunta.respuesta_correcta);
        var margen = pregunta.respuesta_correcta * tolerancia;
        
        if (diferencia <= margen) {
            return { puntaje: pregunta.peso, feedback: ['✅ Excelente: Cálculo correcto'] };
        } else {
            return { puntaje: Math.round(pregunta.peso * 0.3), feedback: ['⚠️ El cálculo no es exacto. Revisa la fórmula y las unidades.'] };
        }
    }
    
    // ✅ SI NO HAY RESPUESTA CORRECTA DEFINIDA, DAR PUNTAJE POR INTENTO
    return { puntaje: Math.round(pregunta.peso * 0.5), feedback: ['✅ Cálculo registrado. Revisa la retroalimentación del caso.'] };
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL DE EVALUACIÓN DE CASOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evalúa un caso de investigación completo
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
    
    let puntajeTotal = 0;
    let feedbackGeneral = [];
    let detallesPorPregunta = [];
    
    // ✅ EVALUAR CADA PREGUNTA
    caso.preguntas.forEach(function(pregunta, idx) {
        if (!pregunta || !pregunta.id) {
            console.warn('⚠️ Pregunta ' + idx + ' sin ID válido');
            return;
        }
        
        const respuestas = respuestasPorPregunta[pregunta.id] || [];
        let resultado;
        
        // ✅ EVALUAR SEGÚN TIPO DE PREGUNTA
        switch(pregunta.tipo) {
            case 'analisis_multiple':
            case 'deteccion_omisiones':
            case 'identificacion_sesgos':
            case 'analisis_normativo':
            case 'deteccion_inconsistencias':
            case 'diagnostico_sistema':
                resultado = evaluarAnalisisMultiple(respuestas, pregunta);
                break;
                
            case 'respuesta_abierta_guiada':
            case 'redaccion_tecnica':
                resultado = evaluarRespuestaAbierta(pregunta, respuestas);
                break;
                
            case 'analisis_responsabilidad':
                resultado = evaluarAnalisisResponsabilidad(respuestas, pregunta);
                break;
                
            case 'plan_accion':
            case 'evaluacion_correctivas':
                resultado = evaluarPlanAccion(respuestas, pregunta);
                break;
                
            case 'ordenamiento_dinamico':
            case 'matriz_priorizacion':
                resultado = evaluarOrdenamientoDinamico(respuestas, pregunta);
                break;
                
            case 'calculo_tecnico':
                resultado = evaluarCalculoTecnico(respuestas, pregunta);
                break;
                
            default:
                // Pregunta de tipo desconocido - dar puntaje parcial
                resultado = {
                    puntaje: pregunta.peso ? pregunta.peso * 0.5 : 0,
                    feedback: ['⚠️ Tipo de pregunta no reconocido']
                };
        }
        
        // ✅ ACUMULAR PUNTAJE Y FEEDBACK
        if (resultado) {
            puntajeTotal += resultado.puntaje || 0;
            detallesPorPregunta.push({
                preguntaId: pregunta.id,
                puntaje: resultado.puntaje,
                maxPuntaje: pregunta.peso,
                feedback: resultado.feedback
            });
            
            // ✅ ASEGURAR QUE FEEDBACK SEA ARRAY
            if (resultado.feedback) {
                if (Array.isArray(resultado.feedback)) {
                    feedbackGeneral = feedbackGeneral.concat(resultado.feedback);
                } else if (typeof resultado.feedback === 'string') {
                    feedbackGeneral.push(resultado.feedback);
                }
            }
        }
    });
    
    // ✅ CALCULAR PORCENTAJE
    const puntajeMaximo = caso.metadatos_evaluacion?.puntaje_maximo || 100;
    const puntajeAprobacion = caso.metadatos_evaluacion?.puntaje_aprobacion || 
                              caso.metadatos_evaluacion?.puntaje_aprobacion_master || 70;
    const porcentaje = puntajeMaximo > 0 ? Math.round((puntajeTotal / puntajeMaximo) * 100) : 0;
    const aprobado = porcentaje >= puntajeAprobacion;
    
    // ✅ MAPEAR CORRECTAMENTE LOS CAMPOS DEL CASO JSON
    return {
        puntajeTotal: Math.round(puntajeTotal),
        puntajeMaximo: puntajeMaximo,
        porcentaje: porcentaje,
        aprobado: aprobado,
        estado: aprobado ? 'Aprobado' : 'Reprobado',
        fecha: new Date().toISOString(),
        
        // ✅ RETROALIMENTACIÓN
        feedback: feedbackGeneral.length > 0 ? feedbackGeneral : ['✅ ¡Buen trabajo! No se detectaron errores críticos.'],
        
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
// TIPOS DE PREGUNTAS AVANZADAS (Referencia)
// ─────────────────────────────────────────────────────────────────────────────

const TIPOS_PREGUNTAS_AVANZADAS = {
    matriz_priorizacion: { descripcion: 'Ordena acciones por prioridad e impacto', evaluacion: 'Criterio: Urgencia vs Impacto vs Viabilidad' },
    ordenamiento_dinamico: { descripcion: 'Arrastra y ordena los pasos en secuencia correcta', evaluacion: 'Cada posición correcta suma puntos' },
    deteccion_omisiones: { descripcion: 'Identifica qué elementos faltan en el procedimiento', evaluacion: 'Cada omisión detectada suma puntos' },
    redaccion_tecnica: { descripcion: 'Redacta causa raíz en términos sistémicos', evaluacion: 'Keywords: sistema, procedimiento, control, barrera' },
    diagnostico_sistema: { descripcion: 'Analiza múltiples fallas interconectadas', evaluacion: 'Identifica relaciones causa-efecto' },
    evaluacion_correctivas: { descripcion: 'Evalúa efectividad de acciones propuestas', evaluacion: 'Jerarquía de controles + ROI + Sostenibilidad' },
    identificacion_sesgos: { descripcion: 'Identifica sesgos cognitivos en el incidente', evaluacion: 'Sesgo de confirmación, normalización, etc.' },
    analisis_normativo: { descripcion: 'Identifica NOMs aplicables y artículos específicos', evaluacion: 'NOM correcta + artículo específico' },
    deteccion_inconsistencias: { descripcion: 'Encuentra contradicciones en testimonios/evidencia', evaluacion: 'Cada inconsistencia detectada suma puntos' }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTAR FUNCIONES PARA USO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.CATEGORIAS = CATEGORIAS;
    window.CASOS_INVESTIGACION = CASOS_INVESTIGACION;
    window.cargarExamen = cargarExamen;
    window.cargarCasoInvestigacion = cargarCasoInvestigacion;
    window.evaluarCasoInvestigacion = evaluarCasoInvestigacion;
    window.evaluarAnalisisMultiple = evaluarAnalisisMultiple;
    window.evaluarRespuestaAbierta = evaluarRespuestaAbierta;
    window.evaluarAnalisisResponsabilidad = evaluarAnalisisResponsabilidad;
    window.evaluarPlanAccion = evaluarPlanAccion;
    window.evaluarOrdenamientoDinamico = evaluarOrdenamientoDinamico;
    window.evaluarCalculoTecnico = evaluarCalculoTecnico;
    window.TIPOS_PREGUNTAS_AVANZADAS = TIPOS_PREGUNTAS_AVANZADAS;
    
    console.log('✅ exams.js cargado - ' + CASOS_INVESTIGACION.length + ' casos habilitados');
}
