// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - SMART EVALUATION ENGINE 3.1 (CORREGIDO Y MEJORADO)
// 5 Dimensiones de Competencia SHE + Predictivo de Riesgos
// Correcciones: 'this' consistente, lógica de cálculo mejorada, más robusto
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
            keywords: ['riesgo', 'peligro', 'norma', 'NOM', 'STPS', 'seguridad', 'protección', 'aislamiento', 'LOTO', 'energía', 'eléctrico']
        },
        sistemica: { 
            peso: 25, 
            descripcion: 'Análisis organizacional y de causa raíz',
            icono: '🏢',
            color: '#9C27B0',
            tipos_pregunta: ['respuesta_abierta_guiada', 'analisis_responsabilidad', 'deteccion_inconsistencias'],
            keywords: ['causa raíz', 'organizacional', 'sistema', 'procedimiento', 'cultura', 'barrera', 'falla', 'supervisión', 'entrenamiento', 'responsable']
        },
        decisional: { 
            peso: 20, 
            descripcion: 'Juicio bajo presión y priorización',
            icono: '⚡',
            color: '#FF9800',
            tipos_pregunta: ['plan_accion', 'matriz_priorizacion', 'evaluacion_correctivas'],
            keywords: ['prioridad', 'urgente', 'importante', 'acción inmediata', 'jerarquía', 'control', 'mitigación', 'decisión']
        },
        preventiva: { 
            peso: 20, 
            descripcion: 'Diseño de soluciones robustas',
            icono: '🛡️',
            color: '#4CAF50',
            tipos_pregunta: ['plan_accion', 'evaluacion_correctivas', 'deteccion_omisiones'],
            keywords: ['prevención', 'control', 'ingeniería', 'barrera', 'redundancia', 'fail-safe', 'diseño seguro', 'eliminación']
        },
        normativo: { 
            peso: 10, 
            descripcion: 'Conocimiento de NOM-STPS aplicables',
            icono: '📋',
            color: '#00BCD4',
            tipos_pregunta: ['analisis_normativo', 'respuesta_abierta_guiada'],
            keywords: ['NOM', 'STPS', 'artículo', 'numeral', 'obligación', 'responsabilidad', 'cumplimiento', 'norma oficial', 'requisito']
        }
    },
    
    // Niveles de certificación
    nivelesCertificacion: {
        BASICO:    { min: 40, max: 59, nombre: 'BÁSICO',    icono: '📚', validez: '1 año', color: '#FF9800' },
        AVANZADO:  { min: 60, max: 74, nombre: 'AVANZADO',  icono: '🥉', validez: '1 año', color: '#4CAF50' },
        MASTER:    { min: 75, max: 89, nombre: 'MASTER',    icono: '🥈', validez: '2 años', color: '#2196F3' },
        ELITE:     { min: 90, max: 94, nombre: 'ELITE',     icono: '🥇', validez: '2 años', color: '#9C27B0' },
        PERICIAL:  { min: 95, max: 100, nombre: 'PERICIAL', icono: '⚖️', validez: '3 años', color: '#D4AF37' }
    },

    // ─────────────────────────────────────────────────────────────────────
    // MÉTODO PRINCIPAL
    // ─────────────────────────────────────────────────────────────────────
    evaluarConDimensiones: function(respuestas, caso) {
        if (!this.validarCaso(caso)) {
            console.error('❌ Error: Caso inválido');
            return this._crearResultadoError();
        }

        if (!respuestas || typeof respuestas !== 'object') {
            respuestas = {};
        }

        // Compatibilidad con scoring.js anterior
        const resultadoBase = typeof evaluarCasoInvestigacion === 'function' 
            ? evaluarCasoInvestigacion(respuestas, caso) 
            : { puntajeTotal: 0, puntajeMaximo: 100, porcentaje: 0, aprobado: false, feedback: [], estado: 'Pendiente' };

        // Calcular por dimensiones
        const dimensiones = {};
        let totalPonderado = 0;

        Object.keys(this.dimensiones).forEach(dim => {
            const evaluacionDim = this.calcularPuntajeDimensionAvanzado(dim, respuestas, caso);
            
            dimensiones[dim] = {
                puntaje: Math.round(evaluacionDim.puntaje),
                maximo: 100,
                porcentaje: Math.round(evaluacionDim.puntaje),
                nivel: this.obtenerNivelDimension(evaluacionDim.puntaje).nivel,
                icono: this.obtenerNivelDimension(evaluacionDim.puntaje).icono,
                color: this.dimensiones[dim].color,
                descripcion: this.dimensiones[dim].descripcion,
                feedback: evaluacionDim.feedback || [],
                fortalezas: evaluacionDim.fortalezas || [],
                debilidades: evaluacionDim.debilidades || []
            };

            totalPonderado += evaluacionDim.puntaje * (this.dimensiones[dim].peso / 100);
        });

        const puntajeCompetencias = Math.round(totalPonderado);
        const nivelGeneral = this.obtenerNivelGeneral(puntajeCompetencias);

        const recomendaciones = this.generarRecomendacionesAvanzadas(dimensiones, puntajeCompetencias);
        const riesgoPredictivo = this.calcularRiesgoPredictivoAvanzado(dimensiones, recomendaciones);
        const planDesarrollo = this.generarPlanDesarrollo(dimensiones, nivelGeneral);

        return {
            // Datos compatibles con versión anterior
            puntajeTotal: resultadoBase.puntajeTotal,
            puntajeMaximo: resultadoBase.puntajeMaximo,
            porcentaje: resultadoBase.porcentaje,
            aprobado: resultadoBase.aprobado,
            estado: resultadoBase.estado,
            feedback: this._enriquecerFeedback(resultadoBase.feedback || [], dimensiones),
            leccion: resultadoBase.leccion,
            conclusion: this._generarConclusionPersonalizada(resultadoBase, dimensiones, nivelGeneral),
            fecha: resultadoBase.fecha || new Date().toISOString(),

            // Datos mejorados v3.1
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

    // Validación del caso
    validarCaso: function(caso) {
        return !!(caso && Array.isArray(caso.preguntas) && caso.preguntas.length > 0);
    },

    // ─────────────────────────────────────────────────────────────────────
    // EVALUACIÓN POR DIMENSIÓN (CORREGIDA)
    // ─────────────────────────────────────────────────────────────────────
    calcularPuntajeDimensionAvanzado: function(dimension, respuestas, caso) {
        const dimData = this.dimensiones[dimension];
        const tiposClave = dimData.tipos_pregunta;
        
        let puntajeTotal = 0;
        let pesoTotal = 0;
        const fortalezas = [];
        const debilidades = [];
        const feedbackItems = [];

        caso.preguntas.forEach(pregunta => {
            if (tiposClave.includes(pregunta.tipo)) {
                const respuesta = respuestas[pregunta.id];
                const pesoPregunta = pregunta.peso || 10;
                pesoTotal += pesoPregunta;

                const evaluacion = this._evaluarCalidadRespuesta(pregunta, respuesta, dimData.keywords);

                puntajeTotal += evaluacion.puntaje * (pesoPregunta / 100);

                if (evaluacion.fortaleza) fortalezas.push(evaluacion.fortaleza);
                if (evaluacion.debilidad) debilidades.push(evaluacion.debilidad);
                if (evaluacion.feedback) feedbackItems.push(evaluacion.feedback);
            }
        });

        const puntajeFinal = pesoTotal > 0 
            ? Math.min(100, Math.max(0, Math.round(puntajeTotal))) 
            : 0;

        return {
            puntaje: puntajeFinal,
            fortalezas: fortalezas.slice(0, 3),
            debilidades: debilidades.slice(0, 3),
            feedback: feedbackItems.slice(0, 3)
        };
    },

    // ─────────────────────────────────────────────────────────────────────
    // EVALUACIÓN DE RESPUESTA INDIVIDUAL (MEJORADA)
    // ─────────────────────────────────────────────────────────────────────
    _evaluarCalidadRespuesta: function(pregunta, respuesta, keywords) {
        const resultado = { puntaje: 0, fortaleza: null, debilidad: null, feedback: null };

        // Respuesta vacía
        if (!respuesta || 
            (Array.isArray(respuesta) && respuesta.length === 0) || 
            (typeof respuesta === 'string' && respuesta.trim().length === 0)) {
            resultado.puntaje = 0;
            resultado.debilidad = `No respondiste: ${pregunta.pregunta.substring(0, 70)}...`;
            resultado.feedback = 'Completa todas las preguntas para una evaluación precisa.';
            return resultado;
        }

        switch(pregunta.tipo) {
            case 'analisis_multiple':
            case 'analisis_normativo':
            case 'diagnostico_sistema':
                return this._evaluarMultipleChoice(pregunta, respuesta, keywords);

            case 'respuesta_abierta_guiada':
            case 'redaccion_tecnica':
                return this._evaluarRespuestaAbiertaAvanzada(pregunta, respuesta, keywords);

            case 'plan_accion':
            case 'evaluacion_correctivas':
                return this._evaluarPlanAccionAvanzado(pregunta, respuesta, keywords);

            default:
                resultado.puntaje = 50;
                resultado.feedback = 'Respuesta registrada.';
                return resultado;
        }
    },

    _evaluarMultipleChoice: function(pregunta, respuestas, keywords) {
        if (!pregunta.opciones || !Array.isArray(respuestas)) {
            return { puntaje: 0, debilidad: 'Formato de respuesta incorrecto' };
        }

        let correctas = 0;
        pregunta.opciones.forEach((opt, idx) => {
            const seleccionada = respuestas.includes(idx);
            if (seleccionada === !!opt.correcta) correctas++;
        });

        const porcentaje = Math.round((correctas / pregunta.opciones.length) * 100);
        
        const resultado = { puntaje: porcentaje };

        if (porcentaje >= 80) {
            resultado.fortaleza = `Excelente análisis en: ${pregunta.pregunta.substring(0, 60)}`;
        } else if (porcentaje >= 50) {
            resultado.feedback = `Parcialmente correcto: ${pregunta.pregunta.substring(0, 60)}`;
            resultado.debilidad = 'Análisis incompleto';
        } else {
            resultado.feedback = `Requiere mejora: ${pregunta.pregunta.substring(0, 60)}`;
            resultado.debilidad = 'Dificultad para identificar elementos críticos';
        }

        return resultado;
    },

    _evaluarRespuestaAbiertaAvanzada: function(pregunta, respuesta, keywords) {
        let texto = Array.isArray(respuesta) ? (respuesta[0] || '') : (respuesta || '');
        texto = texto.toLowerCase().trim();

        const longitud = texto.length;
        let puntajeLongitud = 0;
        let puntajeKeywords = 0;
        let puntajeCalidad = 0;

        // Longitud
        const min = pregunta.longitud_minima || 80;
        if (longitud >= min * 2) puntajeLongitud = 40;
        else if (longitud >= min * 1.3) puntajeLongitud = 35;
        else if (longitud >= min) puntajeLongitud = 25;
        else if (longitud >= min * 0.6) puntajeLongitud = 15;
        else puntajeLongitud = 5;

        // Keywords
        const encontradas = keywords.filter(k => texto.includes(k.toLowerCase()));
        const porcentajeKeywords = encontradas.length / keywords.length;
        puntajeKeywords = porcentajeKeywords >= 0.6 ? 50 : 
                         porcentajeKeywords >= 0.4 ? 40 : 
                         porcentajeKeywords >= 0.2 ? 25 : 10;

        // Calidad del razonamiento
        if (texto.includes('porque') || texto.includes('debido a') || texto.includes('ya que') || texto.includes('esto implica')) puntajeCalidad += 8;
        if (texto.includes('recomiendo') || texto.includes('propongo') || texto.includes('sugiero')) puntajeCalidad += 7;

        const puntajeTotal = Math.min(100, puntajeLongitud + puntajeKeywords + puntajeCalidad);

        const resultado = { puntaje: puntajeTotal };

        if (puntajeTotal >= 80) {
            resultado.fortaleza = 'Excelente análisis técnico y estructurado';
        } else if (puntajeTotal >= 60) {
            resultado.feedback = 'Buen análisis, pero puede profundizarse más';
            resultado.debilidad = 'Falta mayor profundidad o terminología técnica';
        } else {
            resultado.feedback = 'Respuesta básica o insuficiente';
            resultado.debilidad = 'Desarrolla más tu respuesta con argumentos técnicos';
        }

        if (encontradas.length > 0) {
            resultado.feedback += ` (Incluye: ${encontradas.slice(0, 3).join(', ')})`;
        }

        return resultado;
    },

    _evaluarPlanAccionAvanzado: function(pregunta, respuestas, keywords) {
        if (!pregunta.opciones || !Array.isArray(respuestas)) {
            return { puntaje: 0, debilidad: 'No se seleccionaron acciones' };
        }

        let accionesCorrectas = 0;
        let tieneIngenieria = false;
        let tieneAdministrativo = false;
        let tieneEPP = false;

        respuestas.forEach(idx => {
            const opt = pregunta.opciones[idx];
            if (opt) {
                if (opt.correcta) accionesCorrectas++;
                if (opt.jerarquia === 'ingenieria') tieneIngenieria = true;
                if (opt.jerarquia === 'administrativo') tieneAdministrativo = true;
                if (opt.jerarquia === 'epp') tieneEPP = true;
            }
        });

        let puntaje = 0;
        if (accionesCorrectas >= 3) puntaje += 40;
        else if (accionesCorrectas >= 2) puntaje += 30;
        else if (accionesCorrectas >= 1) puntaje += 15;

        if (tieneIngenieria) puntaje += 35;
        else if (tieneAdministrativo) puntaje += 15;
        else if (tieneEPP) puntaje += 5;

        const resultado = { puntaje: Math.min(100, puntaje) };

        if (!tieneIngenieria && respuestas.length > 0) {
            resultado.debilidad = 'No priorizaste controles de ingeniería';
            resultado.feedback = 'Recuerda la jerarquía: Ingeniería > Administrativo > EPP';
        } else if (tieneIngenieria && accionesCorrectas >= 2) {
            resultado.fortaleza = 'Excelente aplicación de la jerarquía de controles';
        }

        return resultado;
    },

    // ─────────────────────────────────────────────────────────────────────
    // RECOMENDACIONES, PLAN Y RIESGO (mantengo la lógica original pero limpia)
    // ─────────────────────────────────────────────────────────────────────
    generarRecomendacionesAvanzadas: function(dimensiones, puntajeGeneral) {
        const recomendaciones = [];

        Object.keys(dimensiones).forEach(dim => {
            const p = dimensiones[dim].porcentaje;
            const info = this.dimensiones[dim];

            if (p < 50) {
                recomendaciones.push({
                    dimension: dim,
                    nombre: info.descripcion,
                    prioridad: 'CRÍTICA',
                    accion: this._obtenerAccionMejora(dim, 'critica'),
                    plazo: 'Inmediato (7 días)',
                    color: '#f44336',
                    icono: '🔴'
                });
            } else if (p < 70) {
                recomendaciones.push({
                    dimension: dim,
                    nombre: info.descripcion,
                    prioridad: 'ALTA',
                    accion: this._obtenerAccionMejora(dim, 'media'),
                    plazo: '30 días',
                    color: '#FF9800',
                    icono: '🟠'
                });
            }
        });

        // Recomendaciones generales
        if (recomendaciones.length === 0) {
            if (puntajeGeneral >= 85) {
                recomendaciones.push({
                    dimension: 'general',
                    nombre: 'Mantenimiento de excelencia',
                    prioridad: 'BAJA',
                    accion: 'Mantenerse actualizado y resolver casos PERICIAL',
                    plazo: 'Semestral',
                    color: '#4CAF50',
                    icono: '🟢'
                });
            } else if (puntajeGeneral >= 70) {
                recomendaciones.push({
                    dimension: 'general',
                    nombre: 'Afianzamiento',
                    prioridad: 'MEDIA',
                    accion: 'Realizar casos de nivel MASTER y ELITE',
                    plazo: '60 días',
                    color: '#2196F3',
                    icono: '🔵'
                });
            }
        }

        return recomendaciones;
    },

    _obtenerAccionMejora: function(dimension, nivel) {
        const acciones = {
            tecnica: {
                critica: 'Capacitación intensiva en identificación de riesgos y LOTO',
                media: 'Reforzar NOM-004-STPS y NOM-029-STPS'
            },
            sistemica: {
                critica: 'Entrenamiento en análisis de causa raíz (Bowtie, 5 Porqués)',
                media: 'Practicar casos con múltiples causas'
            },
            decisional: {
                critica: 'Simulacros de decisión bajo presión',
                media: 'Estudiar matrices de priorización'
            },
            preventiva: {
                critica: 'Diseño de barreras y controles de ingeniería',
                media: 'Análisis de fallas de barreras'
            },
            normativo: {
                critica: 'Actualización intensiva en NOM-STPS aplicables',
                media: 'Revisión detallada de artículos clave'
            }
        };

        return acciones[dimension] ? acciones[dimension][nivel] || 'Capacitación específica' : 'Capacitación específica';
    },

    generarPlanDesarrollo: function(dimensiones, nivelGeneral) {
        const fases = [];
        let fechaBase = new Date();

        // Fase de nivelación
        const debiles = Object.keys(dimensiones).filter(dim => dimensiones[dim].porcentaje < 60);
        if (debiles.length > 0) {
            fases.push({
                fase: 1,
                nombre: 'Nivelación de Competencias Básicas',
                plazo: '1 mes',
                fechaInicio: this._formatearFecha(fechaBase),
                fechaFin: this._formatearFecha(new Date(fechaBase.getTime() + 30*24*60*60*1000)),
                acciones: debiles.map(d => `Reforzar ${this.dimensiones[d].descripcion}`)
            });
            fechaBase.setMonth(fechaBase.getMonth() + 1);
        }

        // Fase de consolidación
        fases.push({
            fase: debiles.length > 0 ? 2 : 1,
            nombre: 'Consolidación y Práctica Avanzada',
            plazo: '2 meses',
            fechaInicio: this._formatearFecha(fechaBase),
            fechaFin: this._formatearFecha(new Date(fechaBase.getTime() + 60*24*60*60*1000)),
            acciones: ['Resolver casos MASTER semanalmente', 'Simulacros de investigación', 'Revisar incidentes reales']
        });

        return {
            nivelRecomendado: nivelGeneral.nivel === 'BÁSICO' ? 'AVANZADO' : 
                             nivelGeneral.nivel === 'AVANZADO' ? 'MASTER' : 
                             nivelGeneral.nivel === 'MASTER' ? 'ELITE' : 'PERICIAL',
            fases: fases,
            totalDuracion: (debiles.length > 0 ? 3 : 2) + ' meses'
        };
    },

    calcularRiesgoPredictivoAvanzado: function(dimensiones, recomendaciones) {
        let suma = 0;
        Object.keys(dimensiones).forEach(dim => suma += dimensiones[dim].porcentaje);
        const promedio = suma / Object.keys(dimensiones).length;

        let riesgo = {
            nivel: '',
            color: '',
            probabilidadIncidente: 0,
            factoresRiesgo: [],
            recomendacionesPrioritarias: []
        };

        if (promedio < 50) {
            riesgo.nivel = 'CRÍTICO';
            riesgo.color = '#f44336';
            riesgo.probabilidadIncidente = 85;
            riesgo.factoresRiesgo = ['Múltiples brechas graves en competencias', 'Alto riesgo de error crítico'];
        } else if (promedio < 65) {
            riesgo.nivel = 'ALTO';
            riesgo.color = '#FF9800';
            riesgo.probabilidadIncidente = 60;
            riesgo.factoresRiesgo = ['Brechas importantes en competencias clave'];
        } else if (promedio < 75) {
            riesgo.nivel = 'MEDIO';
            riesgo.color = '#FFC107';
            riesgo.probabilidadIncidente = 35;
            riesgo.factoresRiesgo = ['Competencias en desarrollo'];
        } else if (promedio < 85) {
            riesgo.nivel = 'MODERADO';
            riesgo.color = '#8BC34A';
            riesgo.probabilidadIncidente = 20;
        } else {
            riesgo.nivel = 'BAJO';
            riesgo.color = '#4CAF50';
            riesgo.probabilidadIncidente = 8;
        }

        return riesgo;
    },

    generarPerfilCompetencial: function(dimensiones, puntajeGeneral) {
        const fortalezas = [];
        const debilidades = [];

        Object.keys(dimensiones).forEach(dim => {
            if (dimensiones[dim].porcentaje >= 75) fortalezas.push(dim);
            else if (dimensiones[dim].porcentaje < 60) debilidades.push(dim);
        });

        return {
            nivelGeneral: this.obtenerNivelGeneral(puntajeGeneral).nivel,
            puntajeGeneral: puntajeGeneral,
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
    obtenerNivelDimension: function(puntaje) {
        if (puntaje >= 90) return { nivel: 'Experto', icono: '🏆' };
        if (puntaje >= 75) return { nivel: 'Avanzado', icono: '🥈' };
        if (puntaje >= 60) return { nivel: 'Intermedio', icono: '🥉' };
        if (puntaje >= 40) return { nivel: 'Básico', icono: '📚' };
        return { nivel: 'Principiante', icono: '⚠️' };
    },

    obtenerNivelGeneral: function(puntaje) {
        for (let nivel in this.nivelesCertificacion) {
            const config = this.nivelesCertificacion[nivel];
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

    _enriquecerFeedback: function(feedbackBase, dimensiones) {
        let feedback = Array.isArray(feedbackBase) ? [...feedbackBase] : [feedbackBase];
        
        Object.keys(dimensiones).forEach(dim => {
            if (dimensiones[dim].debilidades && dimensiones[dim].debilidades.length > 0) {
                feedback.push(`📌 ${this.dimensiones[dim].icono} ${dimensiones[dim].descripcion}: ${dimensiones[dim].debilidades[0]}`);
            }
        });

        return feedback.slice(0, 8);
    },

    _generarConclusionPersonalizada: function(resultadoBase, dimensiones, nivelGeneral) {
        if (resultadoBase.aprobado) {
            return `✅ ¡Excelente! Has alcanzado nivel ${nivelGeneral.nivel} con ${resultadoBase.porcentaje}%.\n` +
                   `Certificado válido por ${nivelGeneral.validez}.`;
        } else {
            return `📚 Requiere refuerzo. Puntaje: ${resultadoBase.porcentaje}%. Revisa las áreas débiles.`;
        }
    },

    _generarComparativa: function(dimensiones) {
        const valores = Object.keys(dimensiones).map(dim => dimensiones[dim].porcentaje);
        const nombres = Object.keys(dimensiones);
        
        const max = Math.max(...valores);
        const min = Math.min(...valores);
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

        return {
            dimensionMasFuerte: { nombre: nombres[valores.indexOf(max)], puntaje: max },
            dimensionMasDebil: { nombre: nombres[valores.indexOf(min)], puntaje: min },
            brecha: max - min,
            promedio: Math.round(promedio)
        };
    },

    _obtenerSiguienteNivel: function(puntaje) {
        if (puntaje < 60) return { nombre: 'AVANZADO', diferencia: 60 - puntaje };
        if (puntaje < 75) return { nombre: 'MASTER', diferencia: 75 - puntaje };
        if (puntaje < 90) return { nombre: 'ELITE', diferencia: 90 - puntaje };
        if (puntaje < 95) return { nombre: 'PERICIAL', diferencia: 95 - puntaje };
        return { nombre: 'MÁXIMO', diferencia: 0 };
    },

    _formatearFecha: function(fecha) {
        return fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    },

    generarHashPerfil: function(puntaje) {
        let hash = 0;
        const str = puntaje + Date.now().toString();
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    },

    _crearResultadoError: function() {
        return {
            puntajeTotal: 0,
            porcentaje: 0,
            aprobado: false,
            estado: 'Error',
            feedback: ['❌ Error en la evaluación del caso'],
            conclusion: 'No se pudo completar la evaluación',
            dimensiones: {},
            puntajeCompetencias: 0,
            nivelGeneral: { nivel: 'ERROR', color: '#f44336' },
            riesgoPredictivo: { nivel: 'DESCONOCIDO' },
            recomendaciones: [],
            planDesarrollo: { fases: [] }
        };
    }
};

// Inicialización
if (typeof window !== 'undefined') {
    window.SmartEvaluationV2 = SmartEvaluationV2;
    console.log('✅ Smart Evaluation Engine 3.1 cargado correctamente');
    console.log('   • Corrección de referencias "this"');
    console.log('   • Lógica de cálculo más clara y robusta');
    console.log('   • Evaluación de respuestas mejorada');
}

export default SmartEvaluationV2;   // Si usas módulos
