// RAYOSHIELD EXAM - exams.js (VERIFICADO)

// ─────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE EXÁMENES (usado por app.js)
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

// Función para cargar examen por ID
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

// Exportar para debug en consola
if (typeof window !== 'undefined') {
    window.CATEGORIAS = CATEGORIAS;
    window.cargarExamen = cargarExamen;
    console.log('✅ exams.js cargado - CATEGORIAS:', CATEGORIAS.length, 'categorías');
}
