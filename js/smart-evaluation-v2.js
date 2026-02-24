// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - SMART EVALUATION ENGINE 2.0
// 5 Dimensiones de Competencia SHE + Predictivo de Riesgos
// ─────────────────────────────────────────────────────────────────────────────

const SmartEvaluationV2 = {
    // 5 Dimensiones de Competencia SHE
    dimensiones: {
        tecnica: { 
            peso: 25, 
            descripcion: 'Conocimiento del riesgo y normas',
            icono: '⚙️',
            color: '#2196F3',
            preguntas_clave: ['Q1', 'Q4']
        },
        sistemica: { 
            peso: 25, 
            descripcion: 'Análisis organizacional',
            icono: '🏢',
            color: '#9C27B0',
            preguntas_clave: ['Q2', 'Q3']
        },
        decisional: { 
            peso: 20, 
            descripcion: 'Juicio bajo presión',
            icono: '⚡',
            color: '#FF9800',
            preguntas_clave: ['Q1', 'Q3', 'Q4']
        },
        preventiva: { 
            peso: 20, 
            descripcion: 'Diseño de soluciones robustas',
            icono: '🛡️',
            color: '#4CAF50',
            preguntas_clave: ['Q4']
        },
        normativo: { 
            peso: 10, 
            descripcion: 'Conocimiento de NOM-STPS aplicables',
            icono: '📋',
            color: '#00BCD4',
            preguntas_clave: ['Q1', 'Q2']
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
    
    // Evaluar caso con 5 dimensiones + predictivo
    evaluarConDimensiones: function(respuestas, caso) {
        // Evaluación base existente
        var resultado = evaluarCasoInvestigacion(respuestas, caso);
        
        // Calificar por dimensión
        resultado.dimensiones = {};
        var totalPonderado = 0;
        
        for (var dim in this.dimensiones) {
            var puntaje = this.calcularPuntajeDimension(dim, respuestas, caso);
            var nivel = this.obtenerNivelDimension(puntaje);
            
            resultado.dimensiones[dim] = {
                puntaje: puntaje,
                maximo: 100,
                porcentaje: Math.round(puntaje),
                nivel: nivel.nivel,
                icono: nivel.icono,
                color: this.dimensiones[dim].color,
                descripcion: this.dimensiones[dim].descripcion
            };
            
            totalPonderado += puntaje * this.dimensiones[dim].peso;
        }
        
        resultado.puntajeCompetencias = Math.round(totalPonderado / 100);
        resultado.nivelGeneral = this.obtenerNivelGeneral(resultado.puntajeCompetencias);
        
        // Predictivo de Riesgos Organizacional
        resultado.riesgoPredictivo = this.calcularRiesgoPredictivo(resultado);
        
        // Perfil competencial completo
        resultado.perfilCompetencial = this.generarPerfilCompetencial(resultado);
        
        return resultado;
    },
    
    calcularPuntajeDimension: function(dimension, respuestas, caso) {
        var dimData = this.dimensiones[dimension];
        var preguntasClave = dimData.preguntas_clave;
        var totalPuntaje = 0;
        var totalPeso = 0;
        
        for (var i = 0; i < preguntasClave.length; i++) {
            var preguntaId = preguntasClave[i];
            var respuesta = respuestas[preguntaId];
            
            if (respuesta) {
                var puntajePregunta = this.evaluarPreguntaParaDimension(preguntaId, respuesta, dimension, caso);
                totalPuntaje += puntajePregunta;
                totalPeso += 100;
            }
        }
        
        var puntaje = totalPeso > 0 ? (totalPuntaje / totalPeso) * 100 : 0;
        return Math.min(100, Math.max(0, puntaje));
    },
    
    evaluarPreguntaParaDimension: function(preguntaId, respuesta, dimension, caso) {
        var puntaje = 0;
        
        if (dimension === 'tecnica') {
            if (preguntaId === 'Q1') puntaje = respuesta.length * 20;
            else if (preguntaId === 'Q4') puntaje = this.evaluarJerarquiaControles(respuesta, caso);
        }
        
        if (dimension === 'sistemica') {
            if (preguntaId === 'Q2') puntaje = this.analizarProfundidadSistemica(respuesta[0] || '');
            else if (preguntaId === 'Q3') puntaje = this.evaluarPensamientoSistemico(respuesta, caso);
        }
        
        if (dimension === 'decisional') puntaje = respuesta.length * 25;
        
        if (dimension === 'preventiva') puntaje = this.evaluarCapacidadPreventiva(respuesta, caso);
        
        if (dimension === 'normativo') {
            // Evaluar menciones a NOM en respuestas
            puntaje = this.evaluarMencionesNormativas(respuesta);
        }
        
        return Math.min(100, puntaje);
    },
    
    analizarProfundidadSistemica: function(texto) {
        if (!texto || texto.length < 20) return 0;
        
        var textoLower = texto.toLowerCase();
        var puntaje = 0;
        
        var palabrasSistemicas = ['sistema', 'procedimiento', 'proceso', 'organización', 'gestión', 'cultura', 'control', 'barrera', 'jerarquía', 'prevención'];
        var palabrasIndividuales = ['error humano', 'descuido', 'negligencia', 'culpa', 'trabajador'];
        
        palabrasSistemicas.forEach(function(palabra) { if (textoLower.includes(palabra)) puntaje += 10; });
        palabrasIndividuales.forEach(function(palabra) { if (textoLower.includes(palabra)) puntaje -= 15; });
        
        if (texto.length > 100) puntaje += 10;
        if (texto.length > 200) puntaje += 10;
        
        return Math.min(100, Math.max(0, puntaje));
    },
    
    evaluarJerarquiaControles: function(respuestas, caso) {
        var puntaje = 0;
        var ingenieriaSeleccionada = false;
        var soloAdministrativos = true;
        
        respuestas.forEach(function(idx) {
            if (caso.preguntas[3]) {
                var opt = caso.preguntas[3].opciones[idx];
                if (opt && opt.jerarquia === 'ingenieria') {
                    ingenieriaSeleccionada = true;
                    soloAdministrativos = false;
                    puntaje += 25;
                } else if (opt && opt.jerarquia === 'administrativo') {
                    puntaje += 15;
                }
            }
        });
        
        if (ingenieriaSeleccionada) puntaje += 20;
        if (soloAdministrativos) puntaje -= 20;
        
        return Math.min(100, Math.max(0, puntaje));
    },
    
    evaluarPensamientoSistemico: function(respuestas, caso) {
        var puntaje = 0;
        respuestas.forEach(function(nivel) { if (nivel === 0) puntaje += 25; else if (nivel === 1) puntaje += 15; });
        return Math.min(100, puntaje);
    },
    
    evaluarCapacidadPreventiva: function(respuestas, caso) {
        var puntaje = 0;
        var accionesPreventivas = 0;
        respuestas.forEach(function(idx) {
            if (caso.preguntas[3] && caso.preguntas[3].opciones[idx] && caso.preguntas[3].opciones[idx].correcta) {
                accionesPreventivas++;
                puntaje += 20;
            }
        });
        if (accionesPreventivas >= 4) puntaje += 20;
        return Math.min(100, puntaje);
    },
    
    evaluarMencionesNormativas: function(respuestas) {
        var puntaje = 0;
        var normas = ['NOM-004', 'NOM-017', 'NOM-029', 'NOM-031', 'NOM-022', 'NOM-025', 'STPS'];
        
        Object.values(respuestas).forEach(function(resp) {
            if (Array.isArray(resp)) {
                resp.forEach(function(r) {
                    if (typeof r === 'string') {
                        normas.forEach(function(nom) {
                            if (r.toLowerCase().includes(nom.toLowerCase())) puntaje += 15;
                        });
                    }
                });
            }
        });
        
        return Math.min(100, puntaje);
    },
    
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
                    color: this.getColorPorNivel(config.nombre),
                    icono: config.icono,
                    validez: config.validez
                };
            }
        }
        return { nivel: 'BÁSICO', color: '#FF9800', icono: '📚', validez: '1 año' };
    },
    
    getColorPorNivel: function(nivel) {
        var colores = { 'BÁSICO': '#FF9800', 'AVANZADO': '#4CAF50', 'MASTER': '#2196F3', 'ELITE': '#9C27B0', 'PERICIAL': '#D4AF37' };
        return colores[nivel] || '#FF9800';
    },
    
    generarPerfilCompetencial: function(resultado) {
        return {
            nivelGeneral: resultado.nivelGeneral.nivel,
            puntajeGeneral: resultado.puntajeCompetencias,
            dimensiones: resultado.dimensiones,
            fechaEvaluacion: new Date().toISOString(),
            validez: resultado.nivelGeneral.validez,
            hash: this.generarHashPerfil(resultado)
        };
    },
    
    generarHashPerfil: function(resultado) {
        var hash = 0;
        var str = resultado.puntajeCompetencias + new Date().toISOString();
        for (var i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    },
    
    // ───────────────────────────────────────────────────────────────────────
    // PREDICTIVO DE RIESGOS ORGANIZACIONAL
    // ───────────────────────────────────────────────────────────────────────
    calcularRiesgoPredictivo: function(resultado) {
        var riesgo = {
            nivel: 'BAJO',
            color: '#4CAF50',
            probabilidadIncidente: 0,
            factoresRiesgo: [],
            recomendaciones: []
        };
        
        var dimensionesDebiles = 0;
        for (var dim in resultado.dimensiones) {
            if (resultado.dimensiones[dim].porcentaje < 60) {
                dimensionesDebiles++;
                riesgo.factoresRiesgo.push('Competencia ' + dim + ' por debajo del estándar');
            }
        }
        
        if (dimensionesDebiles >= 3) {
            riesgo.nivel = 'CRÍTICO';
            riesgo.color = '#f44336';
            riesgo.probabilidadIncidente = 75;
            riesgo.recomendaciones.push('Capacitación inmediata requerida');
            riesgo.recomendaciones.push('Suspender actividades de alto riesgo');
        } else if (dimensionesDebiles >= 2) {
            riesgo.nivel = 'ALTO';
            riesgo.color = '#FF9800';
            riesgo.probabilidadIncidente = 50;
            riesgo.recomendaciones.push('Plan de mejora en 30 días');
            riesgo.recomendaciones.push('Supervisión reforzada');
        } else if (dimensionesDebiles >= 1) {
            riesgo.nivel = 'MEDIO';
            riesgo.color = '#FFC107';
            riesgo.probabilidadIncidente = 25;
            riesgo.recomendaciones.push('Capacitación específica en áreas débiles');
        } else {
            riesgo.nivel = 'BAJO';
            riesgo.color = '#4CAF50';
            riesgo.probabilidadIncidente = 10;
            riesgo.recomendaciones.push('Mantener programa de educación continua');
        }
        
        return riesgo;
    }
};

// Exportar para navegador
if (typeof window !== 'undefined') {
    window.SmartEvaluationV2 = SmartEvaluationV2;
    console.log('✅ Smart Evaluation Engine 2.0 (5 Dimensiones) + Predictivo cargado');

}
// En smart-evaluation-v2.js, agrega esta función:
evaluarCorrectivas: function(respuestas, pregunta) {
    var puntaje = 0;
    var seleccionoIngenieria = false;
    var soloSeleccionoEPP = true;
    
    respuestas.forEach(function(idx) {
        var opt = pregunta.opciones[idx];
        if (opt.jerarquia === 'ingenieria') {
            seleccionoIngenieria = true;
            soloSeleccionoEPP = false;
            puntaje += 10;
        } else if (opt.jerarquia === 'administrativo') {
            soloSeleccionoEPP = false;
            puntaje += 5;
        } else if (opt.jerarquia === 'epp') {
            puntaje += 2;
        }
    });
    
    // Bonus si incluyó ingeniería
    if (seleccionoIngenieria) {
        puntaje += 5;
    }
    
    // Penalización si solo seleccionó EPP
    if (soloSeleccionoEPP) {
        puntaje -= 10;
    }
    
    return Math.min(pregunta.peso, Math.max(0, puntaje));
}
