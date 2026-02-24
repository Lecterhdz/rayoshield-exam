// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - EXECUTIVE DASHBOARD ENGINE v4.1
// Dashboard de Nivel Directivo con Business Intelligence - CORREGIDO
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
        var resumenEjecutivo = this.generarResumenEjecutivo(perfil, riesgo, dimensiones);
        
        return `
        <style>
            @media print {
                body * {
                    visibility: hidden;
                }
                .dashboard-container, .dashboard-container * {
                    visibility: visible;
                }
                .dashboard-container {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    margin: 0;
                    padding: 20px !important;
                    background: white !important;
                    box-shadow: none !important;
                }
                .section-no-break {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .radar-chart-container, .benchmark-container, .kpi-grid, .risk-section {
                    page-break-inside: avoid !important;
                }
                h1, h2, h3 {
                    page-break-after: avoid !important;
                }
                .header-premium {
                    background: #1a237e !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                button {
                    display: none !important;
                }
            }
            .section-no-break {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)) !important;
                gap: 20px;
            }
            @media (max-width: 768px) {
                .kpi-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
                .main-grid {
                    grid-template-columns: 1fr !important;
                }
            }
        </style>
        
        <div class="dashboard-container" style="font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 30px; max-width: 1200px; margin: 0 auto; box-shadow: 0 0 50px rgba(0,0,0,0.1);">
            
            <!-- HEADER EJECUTIVO PREMIUM -->
            <div class="header-premium section-no-break" style="background: ${this.config.colores.fondo}; color: white; padding: 40px 30px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 10px 40px rgba(26,35,126,0.4);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <img src="${this.config.logo}" alt="Logo" style="height: 60px; width: auto; border-radius: 10px; background: white; padding: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div>
                            <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 300; letter-spacing: 0.5px;">INFORME EJECUTIVO DE COMPETENCIA SHE</h1>
                            <p style="margin: 0; opacity: 0.9; font-size: 14px; font-weight: 300;">Evaluación de Nivel <span style="font-weight: 600; color: #FFD700;">${perfil.nivelGeneral}</span> | ${new Date(perfil.fechaEvaluacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: rgba(255,255,255,0.15); padding: 20px 35px; border-radius: 10px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                            <div style="font-size: 48px; font-weight: 700; line-height: 1; background: linear-gradient(135deg, #FFD700, #FFA726); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${perfil.puntajeGeneral}</div>
                            <div style="font-size: 12px; opacity: 0.85; font-weight: 500; margin-top: 5px;">PUNTAJE GLOBAL / 100</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RESUMEN EJECUTIVO -->
            <div class="section-no-break" style="background: white; padding: 30px; margin: 25px 0; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.08); border-left: 5px solid ${this.getColorPorNivel(perfil.nivelGeneral)};">
                <h2 style="color: #1a237e; margin: 0 0 12px 0; font-size: 20px; font-weight: 600;">📋 RESUMEN EJECUTIVO</h2>
                <p style="color: #555; margin: 0; line-height: 1.8; font-size: 14px;">${resumenEjecutivo}</p>
            </div>

            <!-- GRID PRINCIPAL: RADAR + BENCHMARK -->
            <div class="main-grid section-no-break" style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin: 25px 0;">
                
                <!-- GRÁFICA RADAR DE COMPETENCIAS -->
                <div class="radar-chart-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                    <h2 style="color: #1a237e; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">🎯 PERFIL COMPETENCIAL</h2>
                    <p style="color: #888; margin: 0 0 20px 0; font-size: 12px;">5 dimensiones críticas</p>
                    
                    <div style="position: relative; height: 280px; display: flex; justify-content: center; align-items: center;">
                        ${this.generarGraficaRadarHTML(dimensiones)}
                    </div>
                    
                    <!-- Leyenda compacta -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                        ${Object.keys(dimensiones).map(dim => {
                            var data = dimensiones[dim];
                            return '<div style="display: flex; align-items: center; gap: 8px;">' +
                                '<div style="width: 12px; height: 12px; border-radius: 3px; background: ' + data.color + '; box-shadow: 0 2px 5px ' + data.color + '60;"></div>' +
                                '<div style="flex: 1;">' +
                                '<div style="font-size: 11px; color: #666; font-weight: 500;">' + dim.charAt(0).toUpperCase() + dim.slice(1) + '</div>' +
                                '<div style="font-size: 13px; font-weight: 700; color: #333;">' + data.porcentaje + '%</div>' +
                                '</div>' +
                                '</div>';
                        }).join('')}
                    </div>
                </div>

                <!-- BENCHMARK VS INDUSTRIA -->
                <div class="benchmark-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                    <h2 style="color: #1a237e; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">📈 POSICIONAMIENTO VS INDUSTRIA</h2>
                    <p style="color: #888; margin: 0 0 20px 0; font-size: 12px;">Comparativa SHE</p>
                    
                    ${this.generarGraficaBarrasHTML(benchmark)}
                    
                    <div style="background: ${this.getColorPorPosicion(benchmark.posicion)}15; border-left: 4px solid ${this.getColorPorPosicion(benchmark.posicion)}; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <div style="font-size: 14px; font-weight: 600; color: ${this.getColorPorPosicion(benchmark.posicion)}; margin-bottom: 6px;">
                            ${this.getMensajePorPosicion(benchmark.posicion)}
                        </div>
                        <div style="font-size: 12px; color: #666; line-height: 1.5;">
                            Percentil <strong style="color: #333;">${benchmark.percentil}º</strong> de profesionales SHE
                        </div>
                    </div>
                </div>
            </div>

            <!-- INDICADORES EJECUTIVOS -->
            <div class="section-no-break" style="background: white; padding: 30px; margin: 25px 0; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                <h2 style="color: #1a237e; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">📊 INDICADORES CLAVE DE DESEMPEÑO</h2>
                <p style="color: #888; margin: 0 0 25px 0; font-size: 12px;">Métricas para toma de decisiones</p>
                
                <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px;">
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px 20px; border-radius: 10px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🔒</div>
                        <div style="font-size: 11px; color: #666; margin-bottom: 6px; font-weight: 500;">MADUREZ LOTO</div>
                        <div style="font-size: 36px; font-weight: 700; color: #2196F3;">${this.calcularIndiceMadurez(dimensiones, ['tecnica', 'preventiva'])}%</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px 20px; border-radius: 10px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🧠</div>
                        <div style="font-size: 11px; color: #666; margin-bottom: 6px; font-weight: 500;">PENSAMIENTO SISTÉMICO</div>
                        <div style="font-size: 36px; font-weight: 700; color: #9C27B0;">${dimensiones.sistemica?.porcentaje || 0}%</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px 20px; border-radius: 10px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 32px; margin-bottom: 8px;">⚠️</div>
                        <div style="font-size: 11px; color: #666; margin-bottom: 6px; font-weight: 500;">BRECHAS CRÍTICAS</div>
                        <div style="font-size: 36px; font-weight: 700; color: #FF9800;">${this.contarBrechas(dimensiones)}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px 20px; border-radius: 10px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📋</div>
                        <div style="font-size: 11px; color: #666; margin-bottom: 6px; font-weight: 500;">CUMPLIMIENTO NORMATIVO</div>
                        <div style="font-size: 36px; font-weight: 700; color: #00BCD4;">${dimensiones.normativo?.porcentaje || 0}%</div>
                    </div>
                </div>
            </div>

            <!-- ANÁLISIS DE RIESGO PREDICTIVO -->
            <div class="risk-section section-no-break" style="background: white; padding: 30px; margin: 25px 0; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                <h2 style="color: #1a237e; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">⚠️ ANÁLISIS DE RIESGO PREDICTIVO</h2>
                <p style="color: #888; margin: 0 0 25px 0; font-size: 12px;">Proyección basada en patrones</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    <div style="background: linear-gradient(135deg, ${riesgo.color} 0%, ${this.ajustarColor(riesgo.color, -20)} 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 5px 20px ${riesgo.color}40;">
                        <div style="font-size: 48px; margin-bottom: 8px;">${this.getIconoRiesgo(riesgo.nivel)}</div>
                        <div style="font-size: 22px; font-weight: 700; margin-bottom: 4px;">NIVEL ${riesgo.nivel}</div>
                        <div style="font-size: 12px; opacity: 0.9; font-weight: 500;">RIESGO OPERACIONAL</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; border-radius: 10px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 48px; font-weight: 700; color: #1a237e; margin-bottom: 8px;">${riesgo.probabilidadIncidente}%</div>
                        <div style="font-size: 13px; color: #666; font-weight: 500; margin-bottom: 4px;">PROBABILIDAD DE INCIDENTE</div>
                        <div style="font-size: 11px; color: #999;">Próximos 6 meses</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px; border-radius: 10px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 48px; font-weight: 700; color: #4CAF50; margin-bottom: 8px;">${roi}%</div>
                        <div style="font-size: 13px; color: #666; font-weight: 500; margin-bottom: 4px;">RETORNO DE INVERSIÓN</div>
                        <div style="font-size: 11px; color: #999;">Capacitación preventiva</div>
                    </div>
                </div>
                
                ${riesgo.factoresRiesgo.length > 0 ? `
                <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 2px solid #ffb74d; padding: 20px; border-radius: 10px; margin-bottom: 15px;">
                    <h3 style="color: #e65100; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">🔍 FACTORES DE RIESGO</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #555;">
                        ${riesgo.factoresRiesgo.map(function(f) { return '<li style="margin: 6px 0; line-height: 1.5;">' + f + '</li>'; }).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; padding: 20px; border-radius: 10px;">
                    <h3 style="color: #2e7d32; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">💡 RECOMENDACIONES</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #555;">
                        ${riesgo.recomendaciones.map(function(r) { return '<li style="margin: 6px 0; line-height: 1.5;">' + r + '</li>'; }).join('')}
                    </ul>
                </div>
            </div>

            <!-- BOTONES -->
            <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin: 30px 0; padding-top: 25px; border-top: 2px solid #e0e0e0;">
                <button onclick="app.descargarInsignia()" style="background: linear-gradient(135deg, #D4AF37, #FFD700); color: #1a1a1a; padding: 14px 35px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(212,175,55,0.4);">
                    🏅 DESCARGAR INSIGNIA
                </button>
                <button onclick="window.print()" style="background: linear-gradient(135deg, #4CAF50, #43a047); color: white; padding: 14px 35px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(76,175,80,0.4);">
                    📄 IMPRIMIR REPORTE
                </button>
                <button onclick="app.volverAListaCasos()" style="background: linear-gradient(135deg, #f5f5f5, #e0e0e0); color: #333; padding: 14px 35px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">
                    ↩️ VOLVER
                </button>
            </div>
            
            <!-- FOOTER -->
            <div style="text-align: center; padding: 25px; border-top: 2px solid #e0e0e0; background: white; border-radius: 0 0 12px 12px; margin: 0 0 30px 0;">
                <p style="margin: 0 0 8px 0; color: #1a237e; font-size: 12px; font-weight: 600;">${this.config.empresa} INTELLIGENCE ENGINE v4.1</p>
                <p style="margin: 0 0 8px 0; color: #999; font-size: 11px;">
                    📧 ${this.config.contacto.email} &nbsp;|&nbsp; 📞 ${this.config.contacto.telefono} &nbsp;|&nbsp; 🌐 ${this.config.contacto.web}
                </p>
                <p style="margin: 0; color: #bbb; font-size: 10px; font-style: italic;">Documento confidencial - Uso exclusivo para evaluación SHE</p>
            </div>
        </div>
        `;
    },

    generarResumenEjecutivo: function(perfil, riesgo, dimensiones) {
        var nivel = perfil.nivelGeneral;
        var puntaje = perfil.puntajeGeneral;
        var brechas = this.contarBrechas(dimensiones);
        
        var resumen = 'El profesional evaluado demuestra un nivel <strong style="color: ' + this.getColorPorNivel(nivel) + ';">' + nivel + '</strong> con un puntaje de <strong>' + puntaje + '/100</strong>. ';
        
        if (puntaje >= 90) {
            resumen += 'Se identifica capacidad comprobada para liderar iniciativas estratégicas de seguridad a nivel corporativo. ';
        } else if (puntaje >= 75) {
            resumen += 'Cuenta con competencia sólida para implementar programas SHE de manera autónoma con supervisión mínima. ';
        } else {
            resumen += 'Se recomienda plan de desarrollo enfocado en ' + brechas + ' competencias críticas identificadas antes de asumir roles de mayor responsabilidad. ';
        }
        
        resumen += 'El riesgo operacional proyectado es <strong style="color: ' + riesgo.color + ';">' + riesgo.nivel + '</strong> con ' + riesgo.probabilidadIncidente + '% de probabilidad de incidente en los próximos 6 meses. ';
        
        if (brechas > 0) {
            resumen += 'Se han identificado ' + brechas + ' brechas críticas que requieren atención prioritaria mediante capacitación específica y seguimiento.';
        } else {
            resumen += 'No se identificaron brechas críticas. Se recomienda mantener programa de educación continua.';
        }
        
        return resumen;
    },

    generarGraficaRadarHTML: function(dimensiones) {
        var datos = Object.keys(dimensiones).map(function(key) {
            return {
                nombre: key.charAt(0).toUpperCase() + key.slice(1),
                valor: dimensiones[key].porcentaje,
                color: dimensiones[key].color
            };
        });
        
        var size = 260;
        var center = size / 2;
        var radius = (size / 2) - 45;
        
        var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
        
        for (var i = 1; i <= 5; i++) {
            var r = (radius / 5) * i;
            svg += '<circle cx="' + center + '" cy="' + center + '" r="' + r + '" fill="none" stroke="#e0e0e0" stroke-width="1.5" opacity="0.6"/>';
        }
        
        var angles = datos.map(function(_, i) { return (i * 2 * Math.PI) / datos.length - Math.PI / 2; });
        angles.forEach(function(angle) {
            var x = center + radius * Math.cos(angle);
            var y = center + radius * Math.sin(angle);
            svg += '<line x1="' + center + '" y1="' + center + '" x2="' + x + '" y2="' + y + '" stroke="#e0e0e0" stroke-width="1.5" opacity="0.6"/>';
        });
        
        var points = datos.map(function(d, i) {
            var angle = angles[i];
            var r = (radius * d.valor) / 100;
            return (center + r * Math.cos(angle)) + ',' + (center + r * Math.sin(angle));
        }).join(' ');
        
        svg += '<polygon points="' + points + '" fill="url(#grad)" stroke="#2196F3" stroke-width="3" opacity="0.9"/>';
        svg += '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2196F3;stop-opacity:0.4" /><stop offset="100%" style="stop-color:#1976D2;stop-opacity:0.2" /></linearGradient></defs>';
        
        datos.forEach(function(d, i) {
            var angle = angles[i];
            var r = (radius * d.valor) / 100;
            var x = center + r * Math.cos(angle);
            var y = center + r * Math.sin(angle);
            svg += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="' + d.color + '" stroke="white" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>';
            svg += '<text x="' + x + '" y="' + (y - 16) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#333" style="text-shadow: 0 1px 2px white;">' + d.valor + '%</text>';
        });
        
        svg += '</svg>';
        return svg;
    },

    generarGraficaBarrasHTML: function(benchmark) {
        return '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 15px;">' +
            '<div style="text-align: center; padding: 15px 10px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; border: 1px solid #e0e0e0;">' +
            '<div style="font-size: 10px; color: #666; margin-bottom: 6px; font-weight: 500;">PROMEDIO INDUSTRIA</div>' +
            '<div style="font-size: 28px; font-weight: 700; color: #999;">' + benchmark.promedioIndustria + '</div>' +
            '<div style="height: 120px; display: flex; align-items: flex-end; justify-content: center; margin-top: 10px;">' +
            '<div style="width: 40px; height: ' + (benchmark.promedioIndustria * 1.3) + 'px; background: linear-gradient(135deg, #999, #bbb); border-radius: 5px 5px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"></div>' +
            '</div></div>' +
            '<div style="text-align: center; padding: 15px 10px; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border-radius: 8px; transform: scale(1.05); box-shadow: 0 5px 20px rgba(33,150,243,0.4);">' +
            '<div style="font-size: 10px; opacity: 0.95; margin-bottom: 6px; font-weight: 600;">TU PUNTAJE</div>' +
            '<div style="font-size: 32px; font-weight: 700;">' + benchmark.tuPuntaje + '</div>' +
            '<div style="height: 120px; display: flex; align-items: flex-end; justify-content: center; margin-top: 10px;">' +
            '<div style="width: 40px; height: ' + (benchmark.tuPuntaje * 1.3) + 'px; background: white; border-radius: 5px 5px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></div>' +
            '</div></div>' +
            '<div style="text-align: center; padding: 15px 10px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 8px; border: 1px solid #e0e0e0;">' +
            '<div style="font-size: 10px; color: #666; margin-bottom: 6px; font-weight: 500;">TOP 10%</div>' +
            '<div style="font-size: 28px; font-weight: 700; color: #4CAF50;">' + benchmark.top10porciento + '</div>' +
            '<div style="height: 120px; display: flex; align-items: flex-end; justify-content: center; margin-top: 10px;">' +
            '<div style="width: 40px; height: ' + (benchmark.top10porciento * 1.3) + 'px; background: linear-gradient(135deg, #4CAF50, #43a047); border-radius: 5px 5px 0 0; box-shadow: 0 2px 8px rgba(76,175,80,0.3);"></div>' +
            '</div></div></div>';
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

    calcularROI: function(puntaje) {
        if (puntaje >= 90) return 350;
        if (puntaje >= 75) return 220;
        if (puntaje >= 60) return 140;
        return 80;
    },

    getColorPorNivel: function(nivel) {
        var colores = { 'PERICIAL': '#D4AF37', 'ELITE': '#9C27B0', 'MASTER': '#2196F3', 'AVANZADO': '#4CAF50', 'BÁSICO': '#FF9800' };
        return colores[nivel] || '#999';
    },

    getColorPorPosicion: function(posicion) {
        var colores = { top10: '#4CAF50', top25: '#8BC34A', promedio: '#FFC107', bajo: '#FF9800' };
        return colores[posicion] || '#999';
    },

    getMensajePorPosicion: function(posicion) {
        var mensajes = {
            top10: '🏆 ¡EXCELENTE! TOP 10%',
            top25: '🥈 MUY BIEN! SUPERAS 75%',
            promedio: '📊 BUEN DESEMPEÑO',
            bajo: '📈 OPORTUNIDAD DE MEJORA'
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
    console.log('✅ Executive Dashboard Engine v4.1 cargado');
}
