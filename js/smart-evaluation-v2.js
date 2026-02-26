// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - SMART EVALUATION ENGINE 2.0 (v3.0 - CORREGIDO)
// 5 Dimensiones de Competencia SHE + Predictivo de Riesgos
// Usa scoring.js como BASE (mismo score) + AGREGA dimensiones
// ─────────────────────────────────────────────────────────────────────

const SmartEvaluationV2 = {
    // 5 Dimensiones de Competencia SHE
    dimensiones: {
        tecnica: { 
            peso: 25, 
            descripcion: 'Conocimiento del riesgo y normas',
            icono: '⚙️',
            color: '#2196F3',
            tipos_pregunta: ['analisis_multiple', 'analisis_normativo', 'diagnostico_sistema']
        },
        sistemica: { 
            peso: 25, 
            descripcion: 'Análisis organizacional y de causa raíz',
            icono: '🏢',
            color: '#9C27B0',
            tipos_pregunta: ['respuesta_abierta_guiada', 'analisis_responsabilidad', 'deteccion_inconsistencias']
        },
        decisional: { 
            peso: 20, 
            descripcion: 'Juicio bajo presión y priorización',
            icono: '⚡',
            color: '#FF9800',
            tipos_pregunta: ['plan_accion', 'matriz_priorizacion', 'evaluacion_correctivas']
        },
        preventiva: { 
            peso: 20, 
            descripcion: 'Diseño de soluciones robustas',
            icono: '🛡️',
            color: '#4CAF50',
            tipos_pregunta: ['plan_accion', 'evaluacion_correctivas', 'deteccion_omisiones']
        },
        normativo: { 
            peso: 10, 
            descripcion: 'Conocimiento de NOM-STPS aplicables',
            icono: '📋',
            color: '#00BCD4',
            tipos_pregunta: ['analisis_normativo', 'respuesta_abierta_guiada']
        }
    },
    
    // Niveles de certificación
    nivelesCertificacion: {
        BASICO: { min: 40, max: 59, nombre: 'BÁSICO', icono: '📚', validez: '1 año' },
        AVANZADO: { min: 60, max: 74, nombre: 'AVANZADO', icono: '🥉', validez: '1 año' },
        MASTER: { min: 75, max: 89, nombre: 'MASTER', icono: '🥈', validez: '2 años' },
        ELITE: { min: 90, max: 94, nombre: 'ELITE', icono: '🥇', validez: '2 años' },
        PERICIAL: { min: 95, max: 100, nombre: 'PERICIAL', icono: '⚖️', validez: '3 años' }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // EVALUAR CASO CON 5 DIMENSIONES (USA SCORING.JS COMO BASE)
    // ─────────────────────────────────────────────────────────────────────
    evaluarConDimensiones: function(respuestas, caso) {
        // ✅ PASO 1: Obtener score BASE de scoring.js (MISMO para todos)
        var resultadoBase = evaluarCasoInvestigacion(respuestas, caso);
        
        // ✅ PASO 2: Calificar por dimensión (AGREGAR, no reemplazar)
        var dimensiones = {};
        var totalPonderado = 0;
        
        for (var dim in this.dimensiones) {
            var puntaje = this.calcularPuntajeDimensionPorTipo(dim, respuestas, caso);
            var nivel = this.obtenerNivelDimension(puntaje);
            
            dimensiones[dim] = {
                puntaje: Math.round(puntaje),
                maximo: 100,
                porcentaje: Math.round(puntaje),
                nivel: nivel.nivel,
                icono: nivel.icono,
                color: this.dimensiones[dim].color,
                descripcion: this.dimensiones[dim].descripcion
            };
            
            totalPonderado += puntaje * this.dimensiones[dim].peso;
        }
        
        // ✅ PASO 3: Combinar resultados (BASE + Dimensiones)
        return {
            // ✅ MISMOS DATOS QUE scoring.js (score base idéntico)
            puntajeTotal: resultadoBase.puntajeTotal,
            puntajeMaximo: resultadoBase.puntajeMaximo,
            porcentaje: resultadoBase.porcentaje,
            aprobado: resultadoBase.aprobado,
            estado: resultadoBase.estado,
            feedback: resultadoBase.feedback,
            leccion: resultadoBase.leccion,
            conclusion: resultadoBase.conclusion,
            fecha: resultadoBase.fecha,
            
            // ✅ DATOS ADICIONALES DE SmartEvaluationV2
            dimensiones: dimensiones,
            puntajeCompetencias: Math.round(totalPonderado / 100),
            nivelGeneral: this.obtenerNivelGeneral(Math.round(totalPonderado / 100)),
            riesgoPredictivo: this.calcularRiesgoPredictivo(dimensiones),
            perfilCompetencial: this.generarPerfilCompetencial(dimensiones, Math.round(totalPonderado / 100))
        };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // CALCULAR PUNTAJE POR DIMENSIÓN (POR TIPO DE PREGUNTA, NO POR ID)
    // ─────────────────────────────────────────────────────────────────────
    calcularPuntajeDimensionPorTipo: function(dimension, respuestas, caso) {
        var dimData = this.dimensiones[dimension];
        var tiposClave = dimData.tipos_pregunta;
        var totalPuntaje = 0;
        var totalPeso = 0;
        
        // ✅ Recorrer TODAS las preguntas del caso
        caso.preguntas.forEach(function(pregunta) {
            // ✅ Verificar si el tipo de pregunta corresponde a esta dimensión
            if (tiposClave.includes(pregunta.tipo)) {
                var respuesta = respuestas[pregunta.id];
                
                // ✅ Evaluar si hay respuesta
                if (respuesta && 
                    ((Array.isArray(respuesta) && respuesta.length > 0) || 
                     (typeof respuesta === 'string' && respuesta.trim().length > 0) ||
                     (typeof respuesta === 'number'))) {
                    
                    // ✅ Usar el peso de la pregunta para esta dimensión
                    var pesoDimension = pregunta.peso * (dimData.peso / 100);
                    totalPuntaje += pesoDimension;
                    totalPeso += pesoDimension;
                }
            }
        });
        
        // ✅ Calcular porcentaje (0-100)
        var puntaje = totalPeso > 0 ? (totalPuntaje / totalPeso) * 100 : 0;
        return Math.min(100, Math.max(0, puntaje));
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // OBTENER NIVEL DE DIMENSIÓN
    // ─────────────────────────────────────────────────────────────────────
    obtenerNivelDimension: function(puntaje) {
        if (puntaje >= 90) return { nivel: 'Experto', icono: '🏆' };
        if (puntaje >= 75) return { nivel: 'Avanzado', icono: '🥈' };
        if (puntaje >= 60) return { nivel: 'Intermedio', icono: '🥉' };
        if (puntaje >= 40) return { nivel: 'Básico', icono: '📚' };
        return { nivel: 'Principiante', icono: '⚠️' };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // OBTENER NIVEL GENERAL DE CERTIFICACIÓN
    // ─────────────────────────────────────────────────────────────────────
    obtenerNivelGeneral: function(puntaje) {
        for (var nivel in this.nivelesCertificacion) {
            var config = this.nivelesCertificacion[nivel];
            if (puntaje >= config.min && puntaje <= config.max) {
                return { 
                    nivel: config.nombre, 
                    color: this.getColorPorNivel(config.nombre),
                    icono: config.icono,
                    validez: config.validez
                };
            }
        }
        return { nivel: 'BÁSICO', color: '#FF9800', icono: '📚', validez: '1 año' };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // OBTENER COLOR POR NIVEL
    // ─────────────────────────────────────────────────────────────────────
    getColorPorNivel: function(nivel) {
        var colores = { 
            'BÁSICO': '#FF9800', 
            'AVANZADO': '#4CAF50', 
            'MASTER': '#2196F3', 
            'ELITE': '#9C27B0', 
            'PERICIAL': '#D4AF37' 
        };
        return colores[nivel] || '#FF9800';
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // GENERAR PERFIL COMPETENCIAL
    // ─────────────────────────────────────────────────────────────────────
    generarPerfilCompetencial: function(dimensiones, puntajeGeneral) {
        return {
            nivelGeneral: this.obtenerNivelGeneral(puntajeGeneral).nivel,
            puntajeGeneral: puntajeGeneral,
            dimensiones: dimensiones,
            fechaEvaluacion: new Date().toISOString(),
            validez: this.obtenerNivelGeneral(puntajeGeneral).validez,
            hash: this.generarHashPerfil(puntajeGeneral)
        };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // GENERAR HASH DE PERFIL (ÚNICO POR EVALUACIÓN)
    // ─────────────────────────────────────────────────────────────────────
    generarHashPerfil: function(puntaje) {
        var hash = 0;
        var str = puntaje + new Date().toISOString();
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // CALCULAR RIESGO PREDICTIVO ORGANIZACIONAL
    // ─────────────────────────────────────────────────────────────────────
    calcularRiesgoPredictivo: function(dimensiones) {
        var riesgo = {
            nivel: 'BAJO',
            color: '#4CAF50',
            probabilidadIncidente: 0,
            factoresRiesgo: [],
            recomendaciones: []
        };
        
        // ✅ Contar dimensiones débiles (< 60%)
        var dimensionesDebiles = 0;
        for (var dim in dimensiones) {
            if (dimensiones[dim].porcentaje < 60) {
                dimensionesDebiles++;
                riesgo.factoresRiesgo.push('Competencia ' + dim + ' por debajo del estándar (' + dimensiones[dim].porcentaje + '%)');
            }
        }
        
        // ✅ Determinar nivel de riesgo
        if (dimensionesDebiles >= 3) {
            riesgo.nivel = 'CRÍTICO';
            riesgo.color = '#f44336';
            riesgo.probabilidadIncidente = 75;
            riesgo.recomendaciones.push('🔴 Capacitación inmediata requerida');
            riesgo.recomendaciones.push('🔴 Suspender actividades de alto riesgo');
            riesgo.recomendaciones.push('🔴 Revisión de competencias del personal');
        } else if (dimensionesDebiles >= 2) {
            riesgo.nivel = 'ALTO';
            riesgo.color = '#FF9800';
            riesgo.probabilidadIncidente = 50;
            riesgo.recomendaciones.push('🟠 Plan de mejora en 30 días');
            riesgo.recomendaciones.push('🟠 Supervisión reforzada');
            riesgo.recomendaciones.push('🟠 Capacitación específica en áreas débiles');
        } else if (dimensionesDebiles >= 1) {
            riesgo.nivel = 'MEDIO';
            riesgo.color = '#FFC107';
            riesgo.probabilidadIncidente = 25;
            riesgo.recomendaciones.push('🟡 Capacitación específica en áreas débiles');
            riesgo.recomendaciones.push('🟡 Monitoreo de competencias');
        } else {
            riesgo.nivel = 'BAJO';
            riesgo.color = '#4CAF50';
            riesgo.probabilidadIncidente = 10;
            riesgo.recomendaciones.push('🟢 Mantener programa de educación continua');
            riesgo.recomendaciones.push('🟢 Evaluar nuevamente en 6 meses');
        }
        
        return riesgo;
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // GENERAR RECOMENDACIONES PERSONALIZADAS
    // ─────────────────────────────────────────────────────────────────────
    generarRecomendaciones: function(dimensiones) {
        var recomendaciones = [];
        
        for (var dim in dimensiones) {
            var puntaje = dimensiones[dim].porcentaje;
            
            if (puntaje < 50) {
                recomendaciones.push({
                    dimension: dim,
                    prioridad: 'ALTA',
                    accion: 'Capacitación urgente en ' + this.dimensiones[dim].descripcion.toLowerCase(),
                    color: '#f44336'
                });
            } else if (puntaje < 70) {
                recomendaciones.push({
                    dimension: dim,
                    prioridad: 'MEDIA',
                    accion: 'Reforzar conocimientos en ' + this.dimensiones[dim].descripcion.toLowerCase(),
                    color: '#FF9800'
                });
            } else if (puntaje >= 85) {
                recomendaciones.push({
                    dimension: dim,
                    prioridad: 'BAJA',
                    accion: 'Mantener competencia en ' + this.dimensiones[dim].descripcion.toLowerCase(),
                    color: '#4CAF50'
                });
            }
        }
        
        // Ordenar por prioridad
        recomendaciones.sort(function(a, b) {
            var prioridad = { 'ALTA': 1, 'MEDIA': 2, 'BAJA': 3 };
            return prioridad[a.prioridad] - prioridad[b.prioridad];
        });
        
        return recomendaciones;
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // EXPORTAR RESULTADO PARA DASHBOARD
    // ─────────────────────────────────────────────────────────────────────
    exportarParaDashboard: function(resultado) {
        return {
            usuario: resultado.usuario || 'N/A',
            caso: resultado.caso || 'N/A',
            fecha: resultado.fecha || new Date().toISOString(),
            puntajeGlobal: resultado.porcentaje,
            aprobado: resultado.aprobado,
            dimensiones: resultado.dimensiones,
            nivelCertificacion: resultado.nivelGeneral,
            riesgoPredictivo: resultado.riesgoPredictivo,
            recomendaciones: this.generarRecomendaciones(resultado.dimensiones),
            hash: resultado.perfilCompetencial.hash
        };
    }
};

// ─────────────────────────────────────────────────────────────────────
// EXPORTAR PARA NAVEGADOR
// ─────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.SmartEvaluationV2 = SmartEvaluationV2;
    console.log('✅ Smart Evaluation Engine 2.0 v3.0 cargado');
    console.log('   - 5 Dimensiones de Competencia');
    console.log('   - Predictivo de Riesgos');
    console.log('   - Usa scoring.js como BASE (mismo score)');
}
