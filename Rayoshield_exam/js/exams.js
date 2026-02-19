// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - CARGA DE EXÁMENES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lista de exámenes disponibles
 * Agrega aquí tus 21 exámenes
 */
const EXAMENES = [
    {
        id: 'loto_operativo',
        titulo: 'LOTO - Bloqueo y Etiquetado',
        norma: 'NOM-004-STPS-2008',
        nivel: 'Operativo',
        icono: '🔒'
    },
    {
        id: 'loto_supervisor_obra',
        titulo: 'LOTO - Supervisor de Obra',
        norma: 'NOM-004-STPS-2008',
        nivel: 'Supervisor Obra',
        icono: '🔒'
    },
    {
        id: 'loto_supervisor_she',
        titulo: 'LOTO - Supervisor SHE',
        norma: 'NOM-004-STPS-2008',
        nivel: 'Supervisor SHE',
        icono: '🔒'
    },
    {
        id: 'seguridad_operativo',
        titulo: 'Seguridad en Edificaciones',
        norma: 'NOM-031-STPS-2011',
        nivel: 'Operativo',
        icono: '⚠️'
    },
    {
        id: 'seguridad_supervisor_obra',
        titulo: 'Seguridad - Supervisor Obra',
        norma: 'NOM-031-STPS-2011',
        nivel: 'Supervisor Obra',
        icono: '⚠️'
    },
    {
        id: 'seguridad_supervisor_she',
        titulo: 'Seguridad - Supervisor SHE',
        norma: 'NOM-031-STPS-2011',
        nivel: 'Supervisor SHE',
        icono: '⚠️'
    },
    {
        id: 'epp_operativo',
        titulo: 'EPP - Operativo',
        norma: 'NOM-017-STPS-2008',
        nivel: 'Operativo',
        icono: '🦺'
    },
    {
        id: 'epp_supervisor_obra',
        titulo: 'EPP - Supervisor Obra',
        norma: 'NOM-017-STPS-2008',
        nivel: 'Supervisor Obra',
        icono: '🦺'
    },
    {
        id: 'epp_supervisor_she',
        titulo: 'EPP - Supervisor SHE',
        norma: 'NOM-017-STPS-2008',
        nivel: 'Supervisor SHE',
        icono: '🦺'
    },
    {
        id: 'electricos_operativo',
        titulo: 'Trabajos Eléctricos - Operativo',
        norma: 'NOM-029-STPS-2011',
        nivel: 'Operativo',
        icono: '⚡'
    },
    {
        id: 'electricos_supervisor_obra',
        titulo: 'Trabajos Eléctricos - Supervisor Obra',
        norma: 'NOM-029-STPS-2011',
        nivel: 'Supervisor Obra',
        icono: '⚡'
    },
    {
        id: 'electricos_supervisor_she',
        titulo: 'Trabajos Eléctricos - Supervisor SHE',
        norma: 'NOM-029-STPS-2011',
        nivel: 'Supervisor SHE',
        icono: '⚡'
    },
    {
        id: 'estatica_operativo',
        titulo: 'Electricidad Estática - Operativo',
        norma: 'NOM-022-STPS-2015',
        nivel: 'Operativo',
        icono: '🔥'
    },
    {
        id: 'estatica_supervisor_obra',
        titulo: 'Electricidad Estática - Supervisor Obra',
        norma: 'NOM-022-STPS-2015',
        nivel: 'Supervisor Obra',
        icono: '🔥'
    },
    {
        id: 'estatica_supervisor_she',
        titulo: 'Electricidad Estática - Supervisor SHE',
        norma: 'NOM-022-STPS-2015',
        nivel: 'Supervisor SHE',
        icono: '🔥'
    },
    {
        id: 'iluminacion_operativo',
        titulo: 'Iluminación - Operativo',
        norma: 'NOM-025-STPS-2008',
        nivel: 'Operativo',
        icono: '💡'
    },
    {
        id: 'iluminacion_supervisor_obra',
        titulo: 'Iluminación - Supervisor Obra',
        norma: 'NOM-025-STPS-2008',
        nivel: 'Supervisor Obra',
        icono: '💡'
    },
    {
        id: 'iluminacion_supervisor_she',
        titulo: 'Iluminación - Supervisor SHE',
        norma: 'NOM-025-STPS-2008',
        nivel: 'Supervisor SHE',
        icono: '💡'
    },
    {
        id: 'modo4_operativo',
        titulo: 'MODO 4 - Operativo',
        norma: 'Procedimiento Interno',
        nivel: 'Operativo',
        icono: '📋'
    },
    {
        id: 'modo4_supervisor_obra',
        titulo: 'MODO 4 - Supervisor Obra',
        norma: 'Procedimiento Interno',
        nivel: 'Supervisor Obra',
        icono: '📋'
    },
    {
        id: 'modo4_supervisor_she',
        titulo: 'MODO 4 - Supervisor SHE',
        norma: 'Procedimiento Interno',
        nivel: 'Supervisor SHE',
        icono: '📋'
    }
];

/**
 * Carga un examen desde archivo JSON
 * @param {string} examId - ID del examen
 * @returns {Promise<Object>} - Datos del examen
 */
async function cargarExamen(examId) {
    try {
        const response = await fetch(`data/exams/${examId}.json`);
        if (!response.ok) {
            throw new Error(`Examen no encontrado: ${examId}`);
        }
        const examen = await response.json();
        return examen;
    } catch (error) {
        console.error('Error cargando examen:', error);
        // Examen de fallback para pruebas
        return obtenerExamenDemo();
    }
}

/**
 * Examen demo para pruebas (si los JSONs no están disponibles)
 */
function obtenerExamenDemo() {
    return {
        id: 'demo',
        titulo: 'Examen de Prueba',
        norma: 'Demo',
        nivel: 'Operativo',
        min_score: 80,
        preguntas: [
            {
                id: 1,
                texto: '¿Qué significa LOTO?',
                opciones: [
                    'Lock Out - Tag Out',
                    'Lock On - Tag On',
                    'Lock Out - Take Out',
                    'Long Out - Tag Out'
                ],
                correcta_idx: 0
            },
            {
                id: 2,
                texto: '¿Cuál es el objetivo de LOTO?',
                opciones: [
                    'Ahorrar energía',
                    'Prevenir liberación de energía peligrosa',
                    'Aumentar producción',
                    'Reducir costos'
                ],
                correcta_idx: 1
            },
            {
                id: 3,
                texto: '¿Quién puede retirar un dispositivo LOTO?',
                opciones: [
                    'Cualquier trabajador',
                    'El supervisor',
                    'Solo quien lo colocó',
                    'El gerente'
                ],
                correcta_idx: 2
            }
        ]
    };
}

/**
 * Obtiene información de un examen por ID
 * @param {string} examId - ID del examen
 * @returns {Object|undefined} - Información del examen
 */
function getInfoExamen(examId) {
    return EXAMENES.find(e => e.id === examId);
}