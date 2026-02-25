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
    // CASOS BÁSICOS
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
    
    // CASOS MASTER
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
        categoria: 'electricos',
        nivel: 'master',
        icono: '🏗️',
        descripcion: 'Trabajador cae desde andamio mal instalado en trabajo de fachada',
        tiempo_estimado: '30 min',
        requisito: 'Examen NOM-009-STPS aprobado'
    },
    
    // Casos ELITE
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
    
    pregunta.opciones.forEach(function(opt, idx) {
        const seleccionada = respuestasUsuario.includes(idx);
        if (seleccionada === opt.correcta) {
            puntaje += pregunta.peso / pregunta.opciones.length;
        } else {
            feedback.push(opt.feedback_sistemico);
        }
    });
    
    // Feedback experto si falló
    if (puntaje < pregunta.peso * 0.8) {
        feedback.push('💡 ' + pregunta.justificacion_experta);
    }
    
    return { puntaje: Math.round(puntaje), feedback: feedback };
}

// Evaluar pregunta de tipo "respuesta_abierta_guiada" (keyword matching)
function evaluarRespuestaAbierta(respuestaUsuario, pregunta) {
    if (!respuestaUsuario || respuestaUsuario.trim().length < 20) {
        return { 
            puntaje: 0, 
            feedback: ['⚠️ Tu respuesta es muy breve. Explica con más detalle el análisis sistémico.'] 
        };
    }
    
    const respuestaLower = respuestaUsuario.toLowerCase();
    let palabrasEncontradas = 0;
    
    // Contar palabras clave encontradas
    pregunta.palabras_clave_esperadas.forEach(function(palabra) {
        if (respuestaLower.includes(palabra.toLowerCase())) {
            palabrasEncontradas++;
        }
    });
    
    // Calcular puntaje basado en cobertura de keywords
    const cobertura = palabrasEncontradas / pregunta.palabras_clave_esperadas.length;
    let puntaje = Math.round(pregunta.peso * cobertura);
    
    // Bonus por mencionar conceptos sistémicos
    if (respuestaLower.includes('sistema') || respuestaLower.includes('procedimiento')) {
        puntaje = Math.min(puntaje + 5, pregunta.peso);
    }
    
    // Feedback constructivo
    let feedback = [];
    if (cobertura < 0.5) {
        feedback.push('💡 Considera mencionar: ' + pregunta.palabras_clave_esperadas.slice(0, 3).join(', ') + '...');
    }
    if (!respuestaLower.includes('sistema') && pregunta.criterios_evaluacion?.menciona_sistema) {
        feedback.push('💡 Enfócate en QUÉ del sistema falló, no en QUIÉN cometió el error.');
    }
    feedback.push('📝 Respuesta modelo: ' + pregunta.respuesta_modelo);
    
    return { puntaje: puntaje, feedback: feedback };
}

// Evaluar pregunta de tipo "analisis_responsabilidad" (matriz de roles)
function evaluarAnalisisResponsabilidad(respuestasUsuario, pregunta) {
    let puntaje = 0;
    let feedback = [];
    
    pregunta.roles.forEach(function(role, roleIdx) {
        const seleccionNivel = respuestasUsuario[roleIdx];
        if (seleccionNivel !== undefined) {
            const opcion = role.opciones[seleccionNivel];
            if (opcion && opcion.correcta) {
                puntaje += pregunta.peso / pregunta.roles.length;
            } else if (opcion) {
                feedback.push(`👤 ${role.rol}: ${opcion.explicacion}`);
            }
        }
    });
    
    if (feedback.length === 0 && puntaje < pregunta.peso) {
        feedback.push('💡 En un enfoque sistémico, la responsabilidad se distribuye según la capacidad de influir en las barreras de seguridad.');
    }
    
    return { puntaje: Math.round(puntaje), feedback: feedback };
}

// Evaluar pregunta de tipo "plan_accion" (selección con jerarquía)
function evaluarPlanAccion(respuestasUsuario, pregunta) {
    let puntaje = 0;
    let feedback = [];
    let seleccionadas = respuestasUsuario.filter(function(idx) { return idx !== undefined; });
    
    // Verificar respuestas correctas
    seleccionadas.forEach(function(idx) {
        const opt = pregunta.opciones[idx];
        if (opt && opt.correcta) {
            puntaje += pregunta.peso / pregunta.opciones.length * 1.2; // Bonus por priorizar correctas
        } else if (opt) {
            feedback.push(opt.explicacion);
        }
    });
    
    // Verificar criterios de aprobación
    if (pregunta.criterio_aprobacion) {
        const correctasCount = seleccionadas.filter(function(idx) {
            return pregunta.opciones[idx]?.correcta;
        }).length;
        
        if (correctasCount < pregunta.criterio_aprobacion.min_correctas) {
            feedback.push(`⚠️ Se requieren al menos ${pregunta.criterio_aprobacion.min_correctas} acciones efectivas.`);
        }
        
        const incluyeIngenieria = seleccionadas.some(function(idx) {
            return pregunta.opciones[idx]?.jerarquia === 'ingenieria' && pregunta.opciones[idx]?.correcta;
        });
        
        if (pregunta.criterio_aprobacion.debe_incluir_ingenieria && !incluyeIngenieria) {
            feedback.push('💡 Los controles de ingeniería son más efectivos que los administrativos. Priorízalos.');
        }
    }
    
    // Feedback sobre jerarquía de controles
    const jerarquiasSeleccionadas = seleccionadas.map(function(idx) {
        return pregunta.opciones[idx]?.jerarquia;
    }).filter(function(j) { return j; });
    
    if (jerarquiasSeleccionadas.includes('ingenieria')) {
        feedback.push('✅ Excelente: Priorizaste controles de ingeniería (más efectivos).');
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
                resultado = { puntaje: 0, feedback: ['Tipo de pregunta no soportado'] };
        }
        
        puntajeTotal += resultado.puntaje;
        detallesPorPregunta.push({
            preguntaId: pregunta.id,
            puntaje: resultado.puntaje,
            maxPuntaje: pregunta.peso,
            feedback: resultado.feedback
        });
        feedbackGeneral = feedbackGeneral.concat(resultado.feedback);
    });
    
    // Determinar estado final
    const puntajeMaximo = caso.metadatos_evaluacion?.puntaje_maximo || 100;
    const puntajeAprobacion = caso.metadatos_evaluacion?.puntaje_aprobacion_master || 80;
    const porcentaje = Math.round((puntajeTotal / puntajeMaximo) * 100);
    
    return {
        puntajeTotal: puntajeTotal,
        puntajeMaximo: puntajeMaximo,
        porcentaje: porcentaje,
        aprobado: porcentaje >= puntajeAprobacion,
        feedback: feedbackGeneral,
        detalles: detallesPorPregunta,
        leccion: caso.leccion_aprendida_master,
        conclusion: caso.conclusion_oficial
    };
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CATEGORIAS = CATEGORIAS;
    window.CASOS_INVESTIGACION = CASOS_INVESTIGACION;
    window.cargarExamen = cargarExamen;
    window.cargarCasoInvestigacion = cargarCasoInvestigacion;
    window.evaluarCasoInvestigacion = evaluarCasoInvestigacion;
    console.log('✅ exams.js cargado - Casos MASTER habilitados');
}

// ─────────────────────────────────────────────────────────────────────────────
// NUEVOS TIPOS DE PREGUNTAS INTELIGENTES
// ─────────────────────────────────────────────────────────────────────────────

const TIPOS_PREGUNTAS_AVANZADAS = {
    // 1. Matriz de Priorización (Pensamiento crítico)
    matriz_priorizacion: {
        descripcion: 'Ordena acciones por prioridad e impacto',
        evaluacion: 'Critera: Urgencia vs Impacto vs Viabilidad'
    },
    
    // 2. Ordenamiento Dinámico (Secuencia lógica)
    ordenamiento_dinamico: {
        descripcion: 'Arrastra y ordena los pasos en secuencia correcta',
        evaluacion: 'Cada posición correcta suma puntos'
    },
    
    // 3. Detección de Omisiones (Capacidad analítica)
    deteccion_omisiones: {
        descripcion: 'Identifica qué elementos faltan en el procedimiento',
        evaluacion: 'Cada omisión detectada suma puntos'
    },
    
    // 4. Redacción Técnica Guiada (Competencia profesional)
    redaccion_tecnica: {
        descripcion: 'Redacta causa raíz en términos sistémicos',
        evaluacion: 'Keywords: sistema, procedimiento, control, barrera'
    },
    
    // 5. Diagnóstico de Sistema (Pensamiento sistémico)
    diagnostico_sistema: {
        descripcion: 'Analiza múltiples fallas interconectadas',
        evaluacion: 'Identifica relaciones causa-efecto'
    },
    
    // 6. Evaluación de Acciones Correctivas (Madurez preventiva)
    evaluacion_correctivas: {
        descripcion: 'Evalúa efectividad de acciones propuestas',
        evaluacion: 'Jerarquía de controles + ROI + Sostenibilidad'
    },
    
    // 7. Identificación de Sesgos (Nivel cognitivo)
    identificacion_sesgos: {
        descripcion: 'Identifica sesgos cognitivos en el incidente',
        evaluacion: 'Sesgo de confirmación, normalización, etc.'
    },
    
    // 8. Análisis Normativo Aplicado (Capacidad regulatoria)
    analisis_normativo: {
        descripcion: 'Identifica NOMs aplicables y artículos específicos',
        evaluacion: 'NOM correcta + artículo específico'
    },
    
    // 9. Detección de Inconsistencias (Análisis crítico)
    deteccion_inconsistencias: {
        descripcion: 'Encuentra contradicciones en testimonios/evidencia',
        evaluacion: 'Cada inconsistencia detectada suma puntos'
    }
};



