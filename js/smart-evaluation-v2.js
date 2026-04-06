// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - SMART EVALUATION ENGINE 3.0 (OPTIMIZADO)
// 5 Dimensiones de Competencia SHE + Predictivo de Riesgos
// + Recomendaciones personalizadas + Análisis de tendencias
// ─────────────────────────────────────────────────────────────────────

const SmartEvaluationV2 = {
    // 5 Dimensiones de Competencia SHE
    dimensiones: {
        tecnica: { 
            peso: 25, 
            descripcion: 'Conocimiento del riesgo y normas',
            icono: '⚙️',
            color: '#2196F3',
            tipos_pregunta: ['analisis_multiple', 'analisis_normativo', 'diagnostico_sistema'],
            // Palabras clave para evaluar respuestas abiertas
            keywords: ['riesgo', 'peligro', 'norma', 'NOM', 'STPS', 'seguridad', 'protección', 'aislamiento', 'LOTO', 'energía']
        },
        sistemica: { 
            peso: 25, 
            descripcion: 'Análisis organizacional y de causa raíz',
            icono: '🏢',
            color: '#9C27B0',
            tipos_pregunta: ['respuesta_abierta_guiada', 'analisis_responsabilidad', 'deteccion_inconsistencias'],
            keywords: ['causa raíz', 'organizacional', 'sistema', 'procedimiento', 'cultura', 'barrera', 'falla', 'supervisión', 'entrenamiento']
        },
        decisional: { 
            peso: 20, 
            descripcion: 'Juicio bajo presión y priorización',
            icono: '⚡',
            color: '#FF9800',
            tipos_pregunta: ['plan_accion', 'matriz_priorizacion', 'evaluacion_correctivas'],
            keywords: ['prioridad', 'urgente', 'importante', 'acción inmediata', 'jerarquía', 'control', 'mitigación']
        },
        preventiva: { 
            peso: 20, 
            descripcion: 'Diseño de soluciones robustas',
            icono: '🛡️',
            color: '#4CAF50',
            tipos_pregunta: ['plan_accion', 'evaluacion_correctivas', 'deteccion_omisiones'],
            keywords: ['prevención', 'control', 'ingeniería', 'barrera', 'redundancia', 'fail-safe', 'diseño seguro']
        },
        normativo: { 
            peso: 10, 
            descripcion: 'Conocimiento de NOM-STPS aplicables',
            icono: '📋',
            color: '#00BCD4',
            tipos_pregunta: ['analisis_normativo', 'respuesta_abierta_guiada'],
            keywords: ['NOM', 'STPS', 'artículo', 'numeral', 'obligación', 'responsabilidad', 'cumplimiento', 'norma oficial']
        }
    },
    
    // Niveles de certificación
    nivelesCertificacion: {
        BASICO: { min: 40, max: 59, nombre: 'BÁSICO', icono: '📚', validez: '1 año', color: '#FF9800' },
        AVANZADO: { min: 60, max: 74, nombre: 'AVANZADO', icono: '🥉', validez: '1 año', color: '#4CAF50' },
        MASTER: { min: 75, max: 89, nombre: 'MASTER', icono: '🥈', validez: '2 años', color: '#2196F3' },
        ELITE: { min: 90, max: 94, nombre: 'ELITE', icono: '🥇', validez: '2 años', color: '#9C27B0' },
        PERICIAL: { min: 95, max: 100, nombre: 'PERICIAL', icono: '⚖️', validez: '3 años', color: '#D4AF37' }
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // EVALUAR CASO CON 5 DIMENSIONES (USA SCORING.JS COMO BASE)
    // ─────────────────────────────────────────────────────────────────────
    evaluarConDimensiones: function(respuestas, caso) {
        // Validaciones
        if (!caso || !caso.preguntas) {
            console.error('❌ Error: Caso inválido');
            return this._crearResultadoError();
        }
        
        if (!respuestas || typeof respuestas !== 'object') {
            respuestas = {};
        }
        
        // ✅ PASO 1: Obtener score BASE de scoring.js
        var resultadoBase = evaluarCasoInvestigacion(respuestas, caso);
        
        // ✅ PASO 2: Calificar por dimensión (EVALUACIÓN REAL)
        var dimensiones = {};
        var totalPonderado = 0;
        
        for (var dim in this.dimensiones) {
            var evaluacionDim = this.calcularPuntajeDimensionAvanzado(dim, respuestas, caso);
            var puntaje = evaluacionDim.puntaje;
            var feedbackDim = evaluacionDim.feedback;
            
            dimensiones[dim] = {
                puntaje: Math.round(puntaje),
                maximo: 100,
                porcentaje: Math.round(puntaje),
                nivel: this.obtenerNivelDimension(puntaje).nivel,
                icono: this.obtenerNivelDimension(puntaje).icono,
                color: this.dimensiones[dim].color,
                descripcion: this.dimensiones[dim].descripcion,
                feedback: feedbackDim,
                fortalezas: evaluacionDim.fortalezas,
                debilidades: evaluacionDim.debilidades
            };
            
            totalPonderado += puntaje * (this.dimensiones[dim].peso / 100);
        }
        
        var puntajeCompetencias = Math.round(totalPonderado);
        var nivelGeneral = this.obtenerNivelGeneral(puntajeCompetencias);
        
        // ✅ PASO 3: Generar recomendaciones personalizadas
        var recomendaciones = this.generarRecomendacionesAvanzadas(dimensiones, puntajeCompetencias);
        
        // ✅ PASO 4: Calcular riesgo predictivo
        var riesgoPredictivo = this.calcularRiesgoPredictivoAvanzado(dimensiones, recomendaciones);
        
        // ✅ PASO 5: Generar plan de desarrollo
        var planDesarrollo = this.generarPlanDesarrollo(dimensiones, nivelGeneral);
        
        return {
            // ✅ MISMOS DATOS QUE scoring.js (compatibilidad)
            puntajeTotal: resultadoBase.puntajeTotal,
            puntajeMaximo: resultadoBase.puntajeMaximo,
            porcentaje: resultadoBase.porcentaje,
            aprobado: resultadoBase.aprobado,
            estado: resultadoBase.estado,
            feedback: this._enriquecerFeedback(resultadoBase.feedback, dimensiones),
            leccion: resultadoBase.leccion,
            conclusion: this._generarConclusionPersonalizada(resultadoBase, dimensiones, nivelGeneral),
            fecha: resultadoBase.fecha,
            
            // ✅ DATOS ADICIONALES MEJORADOS
            dimensiones: dimensiones,
            puntajeCompetencias: puntajeCompetencias,
            nivelGeneral: nivelGeneral,
            riesgoPredictivo: riesgoPredictivo,
            perfilCompetencial: this.generarPerfilCompetencial(dimensiones, puntajeCompetencias),
            recomendaciones: recomendaciones,
            planDesarrollo: planDesarrollo,
            comparativa: this._generarComparativa(dimensiones),
            hash: this.generarHashPerfil(puntajeCompetencias)
        };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // EVALUACIÓN AVANZADA POR DIMENSIÓN (CON ANÁLISIS DE CONTENIDO)
    // ─────────────────────────────────────────────────────────────────────
    calcularPuntajeDimensionAvanzado: function(dimension, respuestas, caso) {
        var dimData = this.dimensiones[dimension];
        var tiposClave = dimData.tipos_pregunta;
        var puntajeTotal = 0;
        var pesoTotal = 0;
        var fortalezas = [];
        var debilidades = [];
        var feedbackItems = [];
        
        caso.preguntas.forEach(function(pregunta) {
            if (tiposClave.includes(pregunta.tipo)) {
                var respuesta = respuestas[pregunta.id];
                var pesoPregunta = pregunta.peso || 10;
                pesoTotal += pesoPregunta;
                
                // Evaluar calidad de respuesta según tipo
                var evaluacionRespuesta = self._evaluarCalidadRespuesta(pregunta, respuesta, dimData.keywords);
                puntajeTotal += evaluacionRespuesta.puntaje * (pesoPregunta / 100);
                
                if (evaluacionRespuesta.fortaleza) fortalezas.push(evaluacionRespuesta.fortaleza);
                if (evaluacionRespuesta.debilidad) debilidades.push(evaluacionRespuesta.debilidad);
                if (evaluacionRespuesta.feedback) feedbackItems.push(evaluacionRespuesta.feedback);
            }
        }.bind(this));
        
        var puntajeFinal = pesoTotal > 0 ? (puntajeTotal / pesoTotal) * 100 : 0;
        puntajeFinal = Math.min(100, Math.max(0, puntajeFinal));
        
        return {
            puntaje: puntajeFinal,
            fortalezas: fortalezas.slice(0, 3),
            debilidades: debilidades.slice(0, 3),
            feedback: feedbackItems.slice(0, 3)
        };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // EVALUAR CALIDAD DE RESPUESTA INDIVIDUAL
    // ─────────────────────────────────────────────────────────────────────
    _evaluarCalidadRespuesta: function(pregunta, respuesta, keywords) {
        var resultado = { puntaje: 0, fortaleza: null, debilidad: null, feedback: null };
        
        // Respuesta vacía
        if (!respuesta || (Array.isArray(respuesta) && respuesta.length === 0) || 
            (typeof respuesta === 'string' && respuesta.trim().length === 0)) {
            resultado.puntaje = 0;
            resultado.debilidad = `❌ No respondiste: ${pregunta.pregunta.substring(0, 80)}...`;
            resultado.feedback = 'Es importante completar todas las preguntas para una evaluación precisa.';
            return resultado;
        }
        
        // Evaluar según tipo de pregunta
        switch(pregunta.tipo) {
            case 'analisis_multiple':
            case 'analisis_normativo':
            case 'diagnostico_sistema':
                resultado = this._evaluarMultipleChoice(pregunta, respuesta, keywords);
                break;
                
            case 'respuesta_abierta_guiada':
            case 'redaccion_tecnica':
                resultado = this._evaluarRespuestaAbiertaAvanzada(pregunta, respuesta, keywords);
                break;
                
            case 'plan_accion':
            case 'evaluacion_correctivas':
                resultado = this._evaluarPlanAccionAvanzado(pregunta, respuesta, keywords);
                break;
                
            default:
                resultado.puntaje = 50; // Puntaje neutral
                resultado.feedback = 'Respuesta registrada para evaluación.';
        }
        
        return resultado;
    },
    
    // Evaluación avanzada para múltiple choice
    _evaluarMultipleChoice: function(pregunta, respuestas, keywords) {
        if (!pregunta.opciones || !Array.isArray(respuestas)) {
            return { puntaje: 0, debilidad: 'Formato de respuesta incorrecto' };
        }
        
        var correctas = 0;
        var totalOpciones = pregunta.opciones.length;
        
        pregunta.opciones.forEach(function(opt, idx) {
            var seleccionada = respuestas.includes(idx);
            if (seleccionada === opt.correcta) {
                correctas++;
            }
        });
        
        var porcentaje = (correctas / totalOpciones) * 100;
        var puntaje = porcentaje;
        
        var resultado = { puntaje: puntaje };
        
        if (porcentaje >= 80) {
            resultado.fortaleza = '✅ Excelente análisis en: ' + pregunta.pregunta.substring(0, 60);
        } else if (porcentaje >= 50) {
            resultado.feedback = '⚠️ Parcialmente correcto. Revisa: ' + pregunta.pregunta.substring(0, 60);
            resultado.debilidad = 'Análisis incompleto en identificación de riesgos';
        } else {
            resultado.feedback = '❌ Requiere revisión: ' + pregunta.pregunta.substring(0, 60);
            resultado.debilidad = 'Dificultad para identificar elementos críticos';
        }
        
        return resultado;
    },
    
    // Evaluación avanzada para respuestas abiertas
    _evaluarRespuestaAbiertaAvanzada: function(pregunta, respuesta, keywords) {
        var texto = Array.isArray(respuesta) ? respuesta[0] || '' : respuesta || '';
        texto = texto.toLowerCase();
        
        var longitud = texto.length;
        var palabrasClaveEncontradas = [];
        var puntajeLongitud = 0;
        var puntajeKeywords = 0;
        
        // Evaluar longitud
        var longitudMinima = pregunta.longitud_minima || 80;
        if (longitud >= longitudMinima * 1.5) {
            puntajeLongitud = 40;
        } else if (longitud >= longitudMinima) {
            puntajeLongitud = 30;
        } else if (longitud >= longitudMinima * 0.5) {
            puntajeLongitud = 15;
        } else if (longitud > 0) {
            puntajeLongitud = 5;
        } else {
            puntajeLongitud = 0;
        }
        
        // Evaluar palabras clave
        keywords.forEach(function(keyword) {
            if (texto.includes(keyword.toLowerCase())) {
                palabrasClaveEncontradas.push(keyword);
            }
        });
        
        var porcentajeKeywords = palabrasClaveEncontradas.length / keywords.length;
        if (porcentajeKeywords >= 0.5) {
            puntajeKeywords = 50;
        } else if (porcentajeKeywords >= 0.3) {
            puntajeKeywords = 35;
        } else if (porcentajeKeywords >= 0.1) {
            puntajeKeywords = 20;
        } else {
            puntajeKeywords = 5;
        }
        
        // Bonus por calidad
        var puntajeCalidad = 0;
        if (texto.includes('porque') || texto.includes('debido a') || texto.includes('ya que')) {
            puntajeCalidad += 5;
        }
        if (texto.includes('recomiendo') || texto.includes('sugiero') || texto.includes('propongo')) {
            puntajeCalidad += 5;
        }
        
        var puntajeTotal = puntajeLongitud + puntajeKeywords + puntajeCalidad;
        puntajeTotal = Math.min(100, puntajeTotal);
        
        var resultado = { puntaje: puntajeTotal };
        
        if (puntajeTotal >= 80) {
            resultado.fortaleza = '📝 Excelente análisis con terminología técnica precisa';
        } else if (puntajeTotal >= 60) {
            resultado.feedback = '📝 Buen análisis, pero puedes profundizar más';
            resultado.debilidad = 'Falta incluir más terminología técnica específica';
        } else if (puntajeTotal >= 40) {
            resultado.feedback = '📝 Análisis básico. Te sugerimos usar vocabulario técnico';
            resultado.debilidad = 'Análisis superficial sin sustento técnico';
        } else {
            resultado.feedback = '📝 Tu respuesta es muy breve. Desarrolla más el análisis';
            resultado.debilidad = 'Respuesta insuficiente para evaluar competencia';
        }
        
        if (palabrasClaveEncontradas.length > 0) {
            resultado.feedback += ` (✓ Incluye: ${palabrasClaveEncontradas.slice(0, 3).join(', ')})`;
        }
        
        return resultado;
    },
    
    // Evaluación avanzada para planes de acción
    _evaluarPlanAccionAvanzado: function(pregunta, respuestas, keywords) {
        if (!pregunta.opciones || !Array.isArray(respuestas)) {
            return { puntaje: 0, debilidad: 'No se seleccionaron acciones' };
        }
        
        var tieneIngenieria = false;
        var tieneAdministrativo = false;
        var tieneEPP = false;
        var accionesCorrectas = 0;
        
        respuestas.forEach(function(idx) {
            var opt = pregunta.opciones[idx];
            if (opt) {
                if (opt.correcta) accionesCorrectas++;
                if (opt.jerarquia === 'ingenieria') tieneIngenieria = true;
                if (opt.jerarquia === 'administrativo') tieneAdministrativo = true;
                if (opt.jerarquia === 'epp') tieneEPP = true;
            }
        });
        
        var puntaje = 0;
        if (accionesCorrectas >= 3) puntaje += 40;
        else if (accionesCorrectas >= 2) puntaje += 30;
        else if (accionesCorrectas >= 1) puntaje += 15;
        
        if (tieneIngenieria) puntaje += 30;
        if (tieneAdministrativo) puntaje += 15;
        if (tieneEPP) puntaje += 5;
        
        var resultado = { puntaje: Math.min(100, puntaje) };
        
        if (!tieneIngenieria && respuestas.length > 0) {
            resultado.debilidad = 'Priorizaste controles administrativos/EPP sobre ingeniería';
            resultado.feedback = '⚠️ La jerarquía de controles prioriza ingeniería > administrativo > EPP';
        } else if (tieneIngenieria && accionesCorrectas >= 2) {
            resultado.fortaleza = '🎯 Excelente priorización: aplicaste correctamente la jerarquía de controles';
        } else if (accionesCorrectas === 0) {
            resultado.debilidad = 'Las acciones seleccionadas no son las más efectivas';
            resultado.feedback = 'Revisa la jerarquía de controles de seguridad';
        } else {
            resultado.feedback = '✅ Plan de acción aceptable, considera controles de ingeniería';
        }
        
        return resultado;
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // GENERAR RECOMENDACIONES AVANZADAS
    // ─────────────────────────────────────────────────────────────────────
    generarRecomendacionesAvanzadas: function(dimensiones, puntajeGeneral) {
        var recomendaciones = [];
        
        // Identificar dimensiones críticas
        var dimensionesCriticas = [];
        var dimensionesDebiles = [];
        
        for (var dim in dimensiones) {
            var puntaje = dimensiones[dim].porcentaje;
            var dimInfo = this.dimensiones[dim];
            
            if (puntaje < 50) {
                dimensionesCriticas.push({ nombre: dim, info: dimInfo, puntaje: puntaje });
            } else if (puntaje < 70) {
                dimensionesDebiles.push({ nombre: dim, info: dimInfo, puntaje: puntaje });
            }
        }
        
        // Recomendaciones críticas
        dimensionesCriticas.forEach(function(d) {
            recomendaciones.push({
                dimension: d.nombre,
                nombre: d.info.descripcion,
                prioridad: 'CRÍTICA',
                accion: this._obtenerAccionMejora(d.nombre, 'critica'),
                plazo: 'Inmediato (7 días)',
                color: '#f44336',
                icono: '🔴'
            });
        }.bind(this));
        
        // Recomendaciones de mejora
        dimensionesDebiles.forEach(function(d) {
            recomendaciones.push({
                dimension: d.nombre,
                nombre: d.info.descripcion,
                prioridad: 'ALTA',
                accion: this._obtenerAccionMejora(d.nombre, 'media'),
                plazo: 'Corto plazo (30 días)',
                color: '#FF9800',
                icono: '🟠'
            });
        }.bind(this));
        
        // Recomendaciones de mantenimiento
        if (recomendaciones.length === 0 && puntajeGeneral >= 80) {
            recomendaciones.push({
                dimension: 'general',
                nombre: 'Mantenimiento de competencias',
                prioridad: 'BAJA',
                accion: 'Participar en casos avanzados y mantenerse actualizado con nuevas normas',
                plazo: 'Semestral',
                color: '#4CAF50',
                icono: '🟢'
            });
        }
        
        // Recomendación general si todo está bien pero no excelente
        if (puntajeGeneral >= 70 && puntajeGeneral < 85 && recomendaciones.length === 0) {
            recomendaciones.push({
                dimension: 'general',
                nombre: 'Afianzamiento de conocimientos',
                prioridad: 'MEDIA',
                accion: 'Realizar casos de nivel ELITE y PERICIAL para consolidar competencias',
                plazo: '60 días',
                color: '#2196F3',
                icono: '🔵'
            });
        }
        
        return recomendaciones;
    },
    
    // Obtener acción de mejora específica por dimensión
    _obtenerAccionMejora: function(dimension, nivel) {
        var acciones = {
            tecnica: {
                critica: 'Capacitación intensiva en identificación de riesgos eléctricos y LOTO',
                media: 'Reforzar conocimiento de NOM-004-STPS-2008 y NOM-029-STPS-2011'
            },
            sistemica: {
                critica: 'Entrenamiento en metodologías de análisis de causa raíz (Árbol de fallas, Bowtie)',
                media: 'Practicar casos de investigación con múltiples causas'
            },
            decisional: {
                critica: 'Simulacros de toma de decisiones bajo presión',
                media: 'Estudiar matrices de priorización de riesgos'
            },
            preventiva: {
                critica: 'Diseño de barreras de seguridad y controles de ingeniería',
                media: 'Análisis de casos de falla de barreras'
            },
            normativo: {
                critica: 'Curso de actualización en NOM-STPS aplicables a riesgos eléctricos',
                media: 'Revisión de artículos clave de las normas aplicadas'
            }
        };
        
        return acciones[dimension] ? acciones[dimension][nivel] : 'Capacitación específica en el área';
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // GENERAR PLAN DE DESARROLLO
    // ─────────────────────────────────────────────────────────────────────
    generarPlanDesarrollo: function(dimensiones, nivelGeneral) {
        var fases = [];
        var fechaBase = new Date();
        
        // Fase 1: Inmediata (débiles)
        var debiles = [];
        for (var dim in dimensiones) {
            if (dimensiones[dim].porcentaje < 60) {
                debiles.push({ dim: dim, info: this.dimensiones[dim] });
            }
        }
        
        if (debiles.length > 0) {
            fases.push({
                fase: 1,
                nombre: '📚 Nivelación de Competencias Básicas',
                plazo: '1 mes',
                fechaInicio: this._formatearFecha(fechaBase),
                fechaFin: this._formatearFecha(new Date(fechaBase.getTime() + 30 * 24 * 60 * 60 * 1000)),
                acciones: debiles.map(d => `Reforzar: ${d.info.descripcion}`)
            });
            fechaBase.setMonth(fechaBase.getMonth() + 1);
        }
        
        // Fase 2: Consolidación
        fases.push({
            fase: debiles.length > 0 ? 2 : 1,
            nombre: '🎯 Consolidación y Práctica Avanzada',
            plazo: '2 meses',
            fechaInicio: this._formatearFecha(fechaBase),
            fechaFin: this._formatearFecha(new Date(fechaBase.getTime() + 60 * 24 * 60 * 60 * 1000)),
            acciones: [
                'Resolver casos MASTER semanalmente',
                'Participar en simulacros de investigación',
                'Revisar incidentes reales de la industria'
            ]
        });
        fechaBase.setMonth(fechaBase.getMonth() + 2);
        
        // Fase 3: Especialización
        if (nivelGeneral.nivel === 'MASTER' || nivelGeneral.nivel === 'ELITE' || nivelGeneral.nivel === 'PERICIAL') {
            fases.push({
                fase: debiles.length > 0 ? 3 : 2,
                nombre: '🏆 Especialización y Certificación',
                plazo: '3 meses',
                fechaInicio: this._formatearFecha(fechaBase),
                fechaFin: this._formatearFecha(new Date(fechaBase.getTime() + 90 * 24 * 60 * 60 * 1000)),
                acciones: [
                    'Preparación para certificación en seguridad eléctrica',
                    'Participar en casos PERICIAL',
                    'Desarrollar criterios de investigación avanzada'
                ]
            });
        }
        
        return {
            nivelRecomendado: nivelGeneral.nivel === 'BÁSICO' ? 'AVANZADO' : 
                             nivelGeneral.nivel === 'AVANZADO' ? 'MASTER' :
                             nivelGeneral.nivel === 'MASTER' ? 'ELITE' : 'PERICIAL',
            fases: fases,
            totalDuracion: fases.reduce(function(total, f) { 
                return total + (parseInt(f.plazo) || 0); 
            }, 0) + ' meses'
        };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // CALCULAR RIESGO PREDICTIVO AVANZADO
    // ─────────────────────────────────────────────────────────────────────
    calcularRiesgoPredictivoAvanzado: function(dimensiones, recomendaciones) {
        var puntajeTotal = 0;
        for (var dim in dimensiones) {
            puntajeTotal += dimensiones[dim].porcentaje;
        }
        var promedio = puntajeTotal / Object.keys(dimensiones).length;
        
        var riesgo = {
            nivel: '',
            color: '',
            probabilidadIncidente: 0,
            factoresRiesgo: [],
            recomendacionesPrioritarias: []
        };
        
        // Calcular probabilidad
        if (promedio < 50) {
            riesgo.nivel = 'CRÍTICO';
            riesgo.color = '#f44336';
            riesgo.probabilidadIncidente = 85;
            riesgo.factoresRiesgo.push('Múltiples competencias por debajo del estándar mínimo');
            riesgo.factoresRiesgo.push('Alta probabilidad de error en identificación de riesgos críticos');
        } else if (promedio < 65) {
            riesgo.nivel = 'ALTO';
            riesgo.color = '#FF9800';
            riesgo.probabilidadIncidente = 60;
            riesgo.factoresRiesgo.push('Brechas significativas en competencias clave');
        } else if (promedio < 75) {
            riesgo.nivel = 'MEDIO';
            riesgo.color = '#FFC107';
            riesgo.probabilidadIncidente = 35;
            riesgo.factoresRiesgo.push('Competencias en desarrollo, requiere supervisión');
        } else if (promedio < 85) {
            riesgo.nivel = 'MODERADO';
            riesgo.color = '#8BC34A';
            riesgo.probabilidadIncidente = 20;
            riesgo.factoresRiesgo.push('Buen nivel general, mantener actualización');
        } else {
            riesgo.nivel = 'BAJO';
            riesgo.color = '#4CAF50';
            riesgo.probabilidadIncidente = 8;
            riesgo.factoresRiesgo.push('Competencias sólidas, bajo riesgo operacional');
        }
        
        // Recomendaciones prioritarias del riesgo
        recomendaciones.slice(0, 2).forEach(function(rec) {
            if (rec.prioridad === 'CRÍTICA' || rec.prioridad === 'ALTA') {
                riesgo.recomendacionesPrioritarias.push(rec.accion);
            }
        });
        
        if (riesgo.recomendacionesPrioritarias.length === 0) {
            riesgo.recomendacionesPrioritarias.push('Mantener programa de capacitación continua');
            riesgo.recomendacionesPrioritarias.push('Evaluación periódica cada 6 meses');
        }
        
        return riesgo;
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // GENERAR PERFIL COMPETENCIAL
    // ─────────────────────────────────────────────────────────────────────
    generarPerfilCompetencial: function(dimensiones, puntajeGeneral) {
        var fortalezas = [];
        var debilidades = [];
        
        for (var dim in dimensiones) {
            if (dimensiones[dim].porcentaje >= 75) {
                fortalezas.push(dim);
            } else if (dimensiones[dim].porcentaje < 60) {
                debilidades.push(dim);
            }
        }
        
        return {
            nivelGeneral: this.obtenerNivelGeneral(puntajeGeneral).nivel,
            puntajeGeneral: puntajeGeneral,
            dimensiones: dimensiones,
            fortalezasPrincipales: fortalezas,
            areasMejora: debilidades,
            fechaEvaluacion: new Date().toISOString(),
            validez: this.obtenerNivelGeneral(puntajeGeneral).validez,
            siguienteNivel: this._obtenerSiguienteNivel(puntajeGeneral)
        };
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // MÉTODOS AUXILIARES
    // ─────────────────────────────────────────────────────────────────────
    _crearResultadoError: function() {
        return {
            puntajeTotal: 0,
            puntajeMaximo: 0,
            porcentaje: 0,
            aprobado: false,
            estado: 'Error',
            feedback: ['❌ Error en la evaluación'],
            leccion: 'Error en la carga del caso',
            conclusion: 'No se pudo completar la evaluación',
            dimensiones: {},
            puntajeCompetencias: 0,
            nivelGeneral: { nivel: 'ERROR', color: '#f44336', icono: '❌', validez: 'N/A' },
            riesgoPredictivo: { nivel: 'DESCONOCIDO', color: '#f44336' },
            recomendaciones: [],
            planDesarrollo: { fases: [] },
            fecha: new Date().toISOString()
        };
    },
    
    _enriquecerFeedback: function(feedbackBase, dimensiones) {
        var feedbackEnriquecido = Array.isArray(feedbackBase) ? [...feedbackBase] : [feedbackBase];
        
        // Agregar feedback por dimensión
        for (var dim in dimensiones) {
            if (dimensiones[dim].debilidades && dimensiones[dim].debilidades.length > 0) {
                feedbackEnriquecido.push(`📌 ${this.dimensiones[dim].icono} ${dimensiones[dim].descripcion}: ${dimensiones[dim].debilidades[0]}`);
            }
        }
        
        return feedbackEnriquecido.slice(0, 8);
    },
    
    _generarConclusionPersonalizada: function(resultadoBase, dimensiones, nivelGeneral) {
        if (resultadoBase.aprobado) {
            var nivel = nivelGeneral.nivel;
            return `✅ ¡FELICIDADES! Has alcanzado el nivel ${nivel} en competencias SHE. ` +
                   `Tu puntaje global es ${resultadoBase.porcentaje}%. ` +
                   `Este certificado tiene validez de ${nivelGeneral.validez}. ` +
                   `Continúa desarrollando tus competencias para alcanzar el siguiente nivel.`;
        } else {
            var areasMejora = [];
            for (var dim in dimensiones) {
                if (dimensiones[dim].porcentaje < 60) {
                    areasMejora.push(this.dimensiones[dim].descripcion.toLowerCase());
                }
            }
            
            var textoAreas = areasMejora.length > 0 ? ` Las áreas prioritarias de mejora son: ${areasMejora.slice(0, 3).join(', ')}.` : '';
            
            return `📚 REQUIERE REPASO. Tu puntaje global es ${resultadoBase.porcentaje}%. ` +
                   `El mínimo requerido es ${resultadoBase.puntajeMaximo * 0.7} puntos.` + textoAreas +
                   ` Te recomendamos revisar la retroalimentación y volver a intentarlo.`;
        }
    },
    
    _generarComparativa: function(dimensiones) {
        var valores = [];
        var nombres = [];
        
        for (var dim in dimensiones) {
            valores.push(dimensiones[dim].porcentaje);
            nombres.push(dim);
        }
        
        var max = Math.max(...valores);
        var min = Math.min(...valores);
        var promedio = valores.reduce(function(a, b) { return a + b; }, 0) / valores.length;
        
        var dimensionMax = nombres[valores.indexOf(max)];
        var dimensionMin = nombres[valores.indexOf(min)];
        
        return {
            dimensionMasFuerte: { nombre: dimensionMax, puntaje: max, descripcion: this.dimensiones[dimensionMax]?.descripcion },
            dimensionMasDebil: { nombre: dimensionMin, puntaje: min, descripcion: this.dimensiones[dimensionMin]?.descripcion },
            brecha: max - min,
            promedio: Math.round(promedio),
            balance: promedio > 75 ? 'Excelente balance de competencias' : 
                    promedio > 60 ? 'Balance aceptable, hay áreas de mejora' : 
                    'Desequilibrio significativo, priorizar desarrollo integral'
        };
    },
    
    _obtenerSiguienteNivel: function(puntaje) {
        if (puntaje < 60) return { nombre: 'AVANZADO', puntajeMinimo: 60, diferencia: 60 - puntaje };
        if (puntaje < 75) return { nombre: 'MASTER', puntajeMinimo: 75, diferencia: 75 - puntaje };
        if (puntaje < 90) return { nombre: 'ELITE', puntajeMinimo: 90, diferencia: 90 - puntaje };
        if (puntaje < 95) return { nombre: 'PERICIAL', puntajeMinimo: 95, diferencia: 95 - puntaje };
        return { nombre: 'MÁXIMO', puntajeMinimo: 100, diferencia: 0 };
    },
    
    _formatearFecha: function(fecha) {
        return fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // MÉTODOS ORIGINALES (MANTENIDOS PARA COMPATIBILIDAD)
    // ─────────────────────────────────────────────────────────────────────
    obtenerNivelDimension: function(puntaje) {
        if (puntaje >= 90) return { nivel: 'Experto', icono: '🏆' };
        if (puntaje >= 75) return { nivel: 'Avanzado', icono: '🥈' };
        if (puntaje >= 60) return { nivel: 'Intermedio', icono: '🥉' };
        if (puntaje >= 40) return { nivel: 'Básico', icono: '📚' };
        return { nivel: 'Principiante', icono: '⚠️' };
    },
    
    obtenerNivelGeneral: function(puntaje) {
        for (var nivel in this.nivelesCertificacion) {
            var config = this.nivelesCertificacion[nivel];
            if (puntaje >= config.min && puntaje <= config.max) {
                return { 
                    nivel: config.nombre, 
                    color: config.color,
                    icono: config.icono,
                    validez: config.validez
                };
            }
        }
        return { nivel: 'BÁSICO', color: '#FF9800', icono: '📚', validez: '1 año' };
    },
    
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
    
    generarHashPerfil: function(puntaje) {
        var hash = 0;
        var str = puntaje + new Date().toISOString();
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    },
    
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
            recomendaciones: resultado.recomendaciones || this.generarRecomendacionesAvanzadas(resultado.dimensiones, resultado.puntajeCompetencias),
            hash: resultado.perfilCompetencial?.hash || this.generarHashPerfil(resultado.puntajeCompetencias)
        };
    }
};

// Self-reference para usar dentro del objeto
var self = SmartEvaluationV2;

// Exportar para navegador
if (typeof window !== 'undefined') {
    window.SmartEvaluationV2 = SmartEvaluationV2;
    console.log('✅ Smart Evaluation Engine 3.0 OPTIMIZADO cargado');
    console.log('   - 5 Dimensiones de Competencia con evaluación real');
    console.log('   - Predictivo de Riesgos avanzado');
    console.log('   - Recomendaciones personalizadas por competencia');
    console.log('   - Plan de desarrollo profesional');
}
