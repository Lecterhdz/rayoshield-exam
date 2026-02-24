// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - EXECUTIVE DASHBOARD ENGINE v3.0
// Dashboard de Nivel Ejecutivo con Gráficas Profesionales
// ─────────────────────────────────────────────────────────────────────────────

const DashboardEngine = {
    config: {
        empresa: 'RayoShield',
        logo: 'assets/logo.png',
        colores: { primario: '#2196F3', secundario: '#1976D2', fondo: 'linear-gradient(135deg, #1a237e, #3949ab)' },
        contacto: { email: 'soporte@rayoshield.com', web: 'rayoshield.com', telefono: '55-XXXX-XXXX' }
    },

    cargarConfig: function() {
        var self = this;
        fetch('config/white-label-config.json')
            .then(function(r) { return r.json(); })
            .then(function(data) { 
                if(data && data.enabled) self.config = data; 
            })
            .catch(function() { console.log('Usando config default'); });
    },

    generar: function(resultado) {
        var perfil = resultado.perfilCompetencial || { nivelGeneral: 'MASTER', puntajeGeneral: resultado.porcentaje || 80, fechaEvaluacion: new Date().toISOString(), validez: '2 años' };
        var riesgo = resultado.riesgoPredictivo || { nivel: 'BAJO', color: '#4CAF50', probabilidadIncidente: 10, factoresRiesgo: [], recomendaciones: ['Mantener educación continua'] };
        var dimensiones = resultado.dimensiones || {};
        var roi = this.calcularROI(perfil.puntajeGeneral);
        var benchmark = this.generarBenchmarkData(perfil.puntajeGeneral);
        
        return `
        <div class="dashboard-container" style="font-family: 'Segoe UI', 'Roboto', sans-serif; background: #f8f9fa; padding: 40px; border-radius: 0; max-width: 1200px; margin: 0 auto;">
            
            <!-- HEADER EJECUTIVO -->
            <div style="background: ${this.config.colores.fondo}; color: white; padding: 40px; border-radius: 15px; margin-bottom: 30px; box-shadow: 0 10px 40px rgba(26,35,126,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${this.config.logo}" alt="Logo" style="height: 60px; width: auto; border-radius: 8px; background: white; padding: 5px;">
                        <div>
                            <h1 style="margin: 0 0 10px 0; font-size: 32px; font-weight: 300;">📊 Informe Ejecutivo de Competencia SHE</h1>
                            <p style="margin: 0; opacity: 0.9; font-size: 16px;">Evaluación de Nivel ${perfil.nivelGeneral} | ${new Date(perfil.fechaEvaluacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: rgba(255,255,255,0.2); padding: 20px 40px; border-radius: 10px; backdrop-filter: blur(10px);">
                            <div style="font-size: 48px; font-weight: bold; line-height: 1;">${perfil.puntajeGeneral}</div>
                            <div style="font-size: 14px; opacity: 0.8;">PUNTAJE GLOBAL / 100</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- GRÁFICA RADAR DE COMPETENCIAS -->
            <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 30px;">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">🎯 Perfil Competencial por Dimensión</h2>
                <p style="color: #666; margin: 0 0 30px 0; font-size: 14px;">Evaluación de las 5 dimensiones críticas.</p>
                
                <div style="position: relative; height: 400px; display: flex; justify-content: center; align-items: center;">
                    ${this.generarGraficaRadarHTML(dimensiones)}
                </div>
                
                <!-- Leyenda -->
                <div style="display: flex; justify-content: center; gap: 30px; margin-top: 30px; flex-wrap: wrap;">
                    ${Object.keys(dimensiones).map(dim => {
                        var data = dimensiones[dim];
                        return `<div style="display: flex; align-items: center; gap: 8px;">
                            <div style="width: 16px; height: 16px; border-radius: 4px; background: ${data.color};"></div>
                            <span style="font-size: 13px; color: #333;">${dim.charAt(0).toUpperCase() + dim.slice(1)}: <strong>${data.porcentaje}%</strong></span>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <!-- BENCHMARK VS INDUSTRIA -->
            <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 30px;">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">📈 Posicionamiento vs Industria</h2>
                <p style="color: #666; margin: 0 0 30px 0; font-size: 14px;">Comparativa con base de datos de profesionales SHE</p>
                
                ${this.generarGraficaBarrasHTML(benchmark)}
                
                <div style="background: ${this.getColorPorPosicion(benchmark.posicion)}20; border-left: 4px solid ${this.getColorPorPosicion(benchmark.posicion)}; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <div style="font-size: 18px; font-weight: 600; color: ${this.getColorPorPosicion(benchmark.posicion)}; margin-bottom: 10px;">
                        ${this.getMensajePorPosicion(benchmark.posicion)}
                    </div>
                    <div style="font-size: 14px; color: #666;">
                        Tu puntaje (${perfil.puntajeGeneral}) te coloca en el percentil <strong>${benchmark.percentil}º</strong> de profesionales SHE evaluados.
                    </div>
                </div>
            </div>

            <!-- INDICADORES EJECUTIVOS -->
            <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 30px;">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">📊 Indicadores Ejecutivos</h2>
                <p style="color: #666; margin: 0 0 30px 0; font-size: 14px;">Métricas clave para la toma de decisiones</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Índice de Madurez LOTO</div>
                        <div style="font-size: 36px; font-weight: bold; color: #2196F3;">${this.calcularIndiceMadurez(dimensiones, ['tecnica', 'preventiva'])}%</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Pensamiento Sistémico</div>
                        <div style="font-size: 36px; font-weight: bold; color: #9C27B0;">${dimensiones.sistemica?.porcentaje || 0}%</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Brechas Críticas</div>
                        <div style="font-size: 36px; font-weight: bold; color: #FF9800;">${this.contarBrechas(dimensiones)}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Cumplimiento Normativo</div>
                        <div style="font-size: 36px; font-weight: bold; color: #00BCD4;">${dimensiones.normativo?.porcentaje || 0}%</div>
                    </div>
                </div>
            </div>

            <!-- ANÁLISIS DE RIESGO PREDICTIVO -->
            <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 30px;">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">⚠️ Análisis de Riesgo Organizacional Predictivo</h2>
                <p style="color: #666; margin: 0 0 30px 0; font-size: 14px;">Proyección basada en patrones de competencia detectados</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, ${riesgo.color} 0%, ${this.ajustarColor(riesgo.color, 30)} 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">${this.getIconoRiesgo(riesgo.nivel)}</div>
                        <div style="font-size: 24px; font-weight: bold;">Nivel ${riesgo.nivel}</div>
                        <div style="font-size: 14px; opacity: 0.9; margin-top: 5px;">Riesgo Operacional</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 48px; font-weight: bold; color: #1a237e; margin-bottom: 10px;">${riesgo.probabilidadIncidente}%</div>
                        <div style="font-size: 16px; color: #666;">Probabilidad de Incidente</div>
                        <div style="font-size: 13px; color: #999; margin-top: 5px;">Próximos 6 meses</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 48px; font-weight: bold; color: #4CAF50; margin-bottom: 10px;">${roi}%</div>
                        <div style="font-size: 16px; color: #666;">ROI Estimado</div>
                        <div style="font-size: 13px; color: #999; margin-top: 5px;">Inversión en capacitación</div>
                    </div>
                </div>
                
                ${riesgo.factoresRiesgo.length > 0 ? `
                <div style="background: #fff3e0; border: 1px solid #ffb74d; padding: 25px; border-radius: 12px;">
                    <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🔍 Factores de Riesgo Identificados</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #555;">
                        ${riesgo.factoresRiesgo.map(function(f) { return '<li style="margin: 8px 0;">' + f + '</li>'; }).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div style="background: #e8f5e9; border: 1px solid #4caf50; padding: 25px; border-radius: 12px; margin-top: 20px;">
                    <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💡 Recomendaciones Prioritarias</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #555;">
                        ${riesgo.recomendaciones.map(function(r) { return '<li style="margin: 8px 0;">' + r + '</li>'; }).join('')}
                    </ul>
                </div>
            </div>

            <!-- PLAN DE DESARROLLO -->
            <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 30px;">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">📋 Plan de Desarrollo Profesional</h2>
                <p style="color: #666; margin: 0 0 30px 0; font-size: 14px;">Ruta de mejora basada en brechas detectadas</p>
                
                ${this.generarPlanDesarrolloHTML(dimensiones)}
            </div>

            <!-- BOTONES DE ACCIÓN -->
            <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e0e0e0;">
                <button onclick="app.descargarInsignia()" style="background: linear-gradient(135deg, #D4AF37, #FFD700); color: #1a1a1a; padding: 15px 40px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(212,175,55,0.3); transition: transform 0.2s;">
                    🏅 Descargar Insignia
                </button>
                <button onclick="window.print()" style="background: linear-gradient(135deg, #4CAF50, #43a047); color: white; padding: 15px 40px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(76,175,80,0.3); transition: transform 0.2s;">
                    📄 Imprimir Reporte
                </button>
                <button onclick="app.volverAListaCasos()" style="background: #f5f5f5; color: #333; padding: 15px 40px; border: 2px solid #ddd; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; transition: transform 0.2s;">
                    ↩️ Volver
                </button>
            </div>
            
            <!-- FOOTER -->
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
                <p>Generado por ${this.config.empresa} Intelligence Engine v3.0</p>
                <p>📧 ${this.config.contacto.email} | 📞 ${this.config.contacto.telefono} | 🌐 ${this.config.contacto.web}</p>
                <p>Documento confidencial - Uso exclusivo para evaluación de competencia SHE</p>
            </div>
        </div>
        `;
    },

    generarGraficaRadarHTML: function(dimensiones) {
        var datos = Object.keys(dimensiones).map(function(key) {
            return {
                nombre: key.charAt(0).toUpperCase() + key.slice(1),
                valor: dimensiones[key].porcentaje,
                color: dimensiones[key].color
            };
        });
        
        var size = 300;
        var center = size / 2;
        var radius = (size / 2) - 40;
        
        var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
        
        // Fondos de niveles (5 niveles)
        for (var i = 1; i <= 5; i++) {
            var r = (radius / 5) * i;
            svg += '<circle cx="' + center + '" cy="' + center + '" r="' + r + '" fill="none" stroke="#e0e0e0" stroke-width="1"/>';
        }
        
        // Líneas radiales
        var angles = datos.map(function(_, i) { return (i * 2 * Math.PI) / datos.length - Math.PI / 2; });
        angles.forEach(function(angle) {
            var x = center + radius * Math.cos(angle);
            var y = center + radius * Math.sin(angle);
            svg += '<line x1="' + center + '" y1="' + center + '" x2="' + x + '" y2="' + y + '" stroke="#e0e0e0" stroke-width="1"/>';
        });
        
        // Polígono de datos
        var points = datos.map(function(d, i) {
            var angle = angles[i];
            var r = (radius * d.valor) / 100;
            return (center + r * Math.cos(angle)) + ',' + (center + r * Math.sin(angle));
        }).join(' ');
        
        svg += '<polygon points="' + points + '" fill="rgba(33,150,243,0.3)" stroke="#2196F3" stroke-width="2"/>';
        
        // Puntos de datos
        datos.forEach(function(d, i) {
            var angle = angles[i];
            var r = (radius * d.valor) / 100;
            var x = center + r * Math.cos(angle);
            var y = center + r * Math.sin(angle);
            svg += '<circle cx="' + x + '" cy="' + y + '" r="6" fill="' + d.color + '" stroke="white" stroke-width="2"/>';
            svg += '<text x="' + x + '" y="' + (y - 15) + '" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">' + d.valor + '%</text>';
        });
        
        svg += '</svg>';
        return svg;
    },

    generarGraficaBarrasHTML: function(benchmark) {
        return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Promedio Industria</div>
                <div style="font-size: 36px; font-weight: bold; color: #999;">${benchmark.promedioIndustria}</div>
                <div style="height: 200px; display: flex; align-items: flex-end; justify-content: center; margin-top: 20px;">
                    <div style="width: 60px; height: ${benchmark.promedioIndustria * 2}px; background: #999; border-radius: 8px 8px 0 0;"></div>
                </div>
            </div>
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border-radius: 10px; transform: scale(1.05);">
                <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">TU PUNTAJE</div>
                <div style="font-size: 36px; font-weight: bold;">${benchmark.tuPuntaje}</div>
                <div style="height: 200px; display: flex; align-items: flex-end; justify-content: center; margin-top: 20px;">
                    <div style="width: 60px; height: ${benchmark.tuPuntaje * 2}px; background: white; border-radius: 8px 8px 0 0;"></div>
                </div>
            </div>
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Top 10%</div>
                <div style="font-size: 36px; font-weight: bold; color: #4CAF50;">${benchmark.top10porciento}</div>
                <div style="height: 200px; display: flex; align-items: flex-end; justify-content: center; margin-top: 20px;">
                    <div style="width: 60px; height: ${benchmark.top10porciento * 2}px; background: #4CAF50; border-radius: 8px 8px 0 0;"></div>
                </div>
            </div>
        </div>
        `;
    },

    generarPlanDesarrolloHTML: function(dimensiones) {
        var debilidades = Object.keys(dimensiones)
            .filter(function(key) { return dimensiones[key].porcentaje < 75; })
            .sort(function(a, b) { return dimensiones[a].porcentaje - dimensiones[b].porcentaje; });
        
        if (debilidades.length === 0) {
            return `<div style="background: #e8f5e9; padding: 25px; border-radius: 12px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
                <h3 style="color: #2e7d32; margin: 0 0 10px 0;">¡Excelente Desempeño!</h3>
                <p style="color: #555; margin: 0;">Todas tus competencias están por encima del estándar. Enfócate en mantenimiento y educación continua.</p>
            </div>`;
        }
        
        var html = '<div style="display: grid; gap: 15px;">';
        debilidades.forEach(function(dim, index) {
            var color = index === 0 ? '#FF9800' : '#ddd';
            var bg = index === 0 ? '#fff3e0' : '#f8f9fa';
            html += `<div style="display: flex; align-items: center; gap: 20px; padding: 20px; background: ${bg}; border-radius: 12px; border-left: 4px solid ${color};">
                <div style="font-size: 24px; font-weight: bold; color: #999; min-width: 30px;">#${index + 1}</div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="color: #333; font-size: 16px;">${dim.charAt(0).toUpperCase() + dim.slice(1)}</strong>
                        <span style="background: ${dimensiones[dim].color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">${dimensiones[dim].porcentaje}%</span>
                    </div>
                    <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: ${dimensiones[dim].color}; height: 100%; width: ${dimensiones[dim].porcentaje}%; transition: width 1s ease;"></div>
                    </div>
                    <div style="margin-top: 10px; font-size: 13px; color: #666;">
                        <strong>Acción:</strong> ${DashboardEngine.getRecomendacionPorDimension(dim)}
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';
        return html;
    },

    generarBenchmarkData: function(puntaje) {
        return {
            promedioIndustria: 68,
            top10porciento: 92,
            top25porciento: 85,
            tuPuntaje: puntaje,
            posicion: puntaje >= 92 ? 'top10' : puntaje >= 85 ? 'top25' : puntaje >= 68 ? 'promedio' : 'bajo',
            percentil: puntaje >= 92 ? 90 : puntaje >= 85 ? 75 : puntaje >= 68 ? 50 : 25
        };
    },

    renderKPI: function(titulo, valor, color, icono, subtexto) {
        return `
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-left: 5px solid ${color};">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; font-weight: bold;">${titulo}</div>
                        <div style="font-size: 28px; font-weight: bold; color: #2c3e50; margin: 5px 0;">${valor}</div>
                    </div>
                    <div style="font-size: 24px; background: ${color}20; padding: 10px; border-radius: 50%;">${icono}</div>
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: ${color}; font-weight: 600;">${subtexto}</div>
            </div>
        `;
    },

    calcularROI: function(puntaje) {
        if (puntaje >= 90) return 350;
        if (puntaje >= 75) return 220;
        if (puntaje >= 60) return 140;
        return 80;
    },

    getColorNivel: function(nivel) {
        var colores = { 'PERICIAL': '#D4AF37', 'ELITE': '#9C27B0', 'MASTER': '#2196F3', 'AVANZADO': '#4CAF50', 'BÁSICO': '#FF9800' };
        return colores[nivel] || '#999';
    },

    getColorPorPosicion: function(posicion) {
        var colores = { top10: '#4CAF50', top25: '#8BC34A', promedio: '#FFC107', bajo: '#FF9800' };
        return colores[posicion] || '#999';
    },

    getMensajePorPosicion: function(posicion) {
        var mensajes = {
            top10: '🏆 ¡Excelente! Estás en el Top 10% de profesionales SHE',
            top25: '🥈 Muy bien! Superas al 75% de profesionales SHE',
            promedio: '📊 Buen desempeño! Estás en el promedio de la industria',
            bajo: '📈 Oportunidad de mejora! Hay espacio para crecer'
        };
        return mensajes[posicion] || 'Evaluación completada';
    },

    getIconoRiesgo: function(nivel) {
        var iconos = { CRÍTICO: '🚨', ALTO: '⚠️', MEDIO: '⚡', BAJO: '✅' };
        return iconos[nivel] || '⚠️';
    },

    calcularIndiceMadurez: function(dimensiones, dims) {
        var total = 0;
        var count = 0;
        dims.forEach(function(dim) {
            if (dimensiones[dim]) {
                total += dimensiones[dim].porcentaje;
                count++;
            }
        });
        return count > 0 ? Math.round(total / count) : 0;
    },

    contarBrechas: function(dimensiones) {
        var brechas = 0;
        for (var dim in dimensiones) {
            if (dimensiones[dim].porcentaje < 75) brechas++;
        }
        return brechas;
    },

    ajustarColor: function(color, porcentaje) {
        return color;
    },

    getRecomendacionPorDimension: function(dim) {
        var recomendaciones = {
            tecnica: 'Curso avanzado de normatividad STPS + Certificación técnica',
            sistemica: 'Diplomado en análisis de causa raíz (ICAM/TapRooT)',
            decisional: 'Taller de toma de decisiones bajo presión + Simulacros',
            preventiva: 'Certificación en jerarquía de controles + Auditoría práctica',
            normativo: 'Actualización en NOM-STPS 2026 + Seminario legal SHE'
        };
        return recomendaciones[dim] || 'Capacitación específica';
    }
};

// Inicializar
if (typeof window !== 'undefined') {
    window.DashboardEngine = DashboardEngine;
    DashboardEngine.cargarConfig();
    console.log('✅ Executive Dashboard Engine v3.0 cargado');
}

