// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - EXECUTIVE DASHBOARD ENGINE v4.0
// Dashboard de Nivel Directivo con Business Intelligence
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
        <div class="dashboard-container" style="font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 0; max-width: 1200px; margin: 0 auto; box-shadow: 0 0 50px rgba(0,0,0,0.1);">
            
            <!-- HEADER EJECUTIVO PREMIUM -->
            <div style="background: ${this.config.colores.fondo}; color: white; padding: 50px 40px; border-radius: 0 0 20px 20px; margin-bottom: 0; box-shadow: 0 10px 40px rgba(26,35,126,0.4);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <img src="${this.config.logo}" alt="Logo" style="height: 70px; width: auto; border-radius: 10px; background: white; padding: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div>
                            <h1 style="margin: 0 0 8px 0; font-size: 34px; font-weight: 300; letter-spacing: 0.5px;">INFORME EJECUTIVO DE COMPETENCIA SHE</h1>
                            <p style="margin: 0; opacity: 0.9; font-size: 15px; font-weight: 300;">Evaluación de Nivel <span style="font-weight: 600; color: #FFD700;">${perfil.nivelGeneral}</span> | ${new Date(perfil.fechaEvaluacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="background: rgba(255,255,255,0.15); padding: 25px 45px; border-radius: 15px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
                            <div style="font-size: 56px; font-weight: 700; line-height: 1; background: linear-gradient(135deg, #FFD700, #FFA726); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${perfil.puntajeGeneral}</div>
                            <div style="font-size: 13px; opacity: 0.85; font-weight: 500; margin-top: 5px;">PUNTAJE GLOBAL / 100</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RESUMEN EJECUTIVO -->
            <div style="background: white; padding: 35px 40px; margin: 30px 40px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.08); border-left: 5px solid ${this.getColorPorNivel(perfil.nivelGeneral)};">
                <h2 style="color: #1a237e; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">📋 RESUMEN EJECUTIVO</h2>
                <p style="color: #555; margin: 0; line-height: 1.8; font-size: 15px;">${resumenEjecutivo}</p>
            </div>

            <!-- GRID PRINCIPAL: RADAR + BENCHMARK -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 0 40px 30px 40px;">
                
                <!-- GRÁFICA RADAR DE COMPETENCIAS -->
                <div style="background: white; padding: 35px 40px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                    <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">🎯 PERFIL COMPETENCIAL</h2>
                    <p style="color: #888; margin: 0 0 25px 0; font-size: 13px;">Evaluación de las 5 dimensiones críticas</p>
                    
                    <div style="position: relative; height: 320px; display: flex; justify-content: center; align-items: center;">
                        ${this.generarGraficaRadarHTML(dimensiones)}
                    </div>
                    
                    <!-- Leyenda -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        ${Object.keys(dimensiones).map(dim => {
                            var data = dimensiones[dim];
                            return `<div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 14px; height: 14px; border-radius: 4px; background: ${data.color}; box-shadow: 0 2px 5px ${data.color}60;"></div>
                                <div style="flex: 1;">
                                    <div style="font-size: 12px; color: #666; font-weight: 500;">${dim.charAt(0).toUpperCase() + dim.slice(1)}</div>
                                    <div style="font-size: 14px; font-weight: 700; color: #333;">${data.porcentaje}%</div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <!-- BENCHMARK VS INDUSTRIA -->
                <div style="background: white; padding: 35px 40px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                    <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">📈 POSICIONAMIENTO VS INDUSTRIA</h2>
                    <p style="color: #888; margin: 0 0 25px 0; font-size: 13px;">Comparativa con base de datos SHE</p>
                    
                    ${this.generarGraficaBarrasHTML(benchmark)}
                    
                    <div style="background: ${this.getColorPorPosicion(benchmark.posicion)}15; border-left: 4px solid ${this.getColorPorPosicion(benchmark.posicion)}; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <div style="font-size: 16px; font-weight: 600; color: ${this.getColorPorPosicion(benchmark.posicion)}; margin-bottom: 8px;">
                            ${this.getMensajePorPosicion(benchmark.posicion)}
                        </div>
                        <div style="font-size: 13px; color: #666; line-height: 1.6;">
                            Percentil <strong style="color: #333;">${benchmark.percentil}º</strong> de profesionales SHE evaluados
                        </div>
                    </div>
                </div>
            </div>

            <!-- INDICADORES EJECUTIVOS -->
            <div style="background: white; padding: 35px 40px; margin: 0 40px 30px 40px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">📊 INDICADORES CLAVE DE DESEMPEÑO</h2>
                <p style="color: #888; margin: 0 0 30px 0; font-size: 13px;">Métricas para la toma de decisiones</p>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px;">
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px 25px; border-radius: 12px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 38px; margin-bottom: 10px;">🔒</div>
                        <div style="font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 500;">MADUREZ LOTO</div>
                        <div style="font-size: 42px; font-weight: 700; color: #2196F3;">${this.calcularIndiceMadurez(dimensiones, ['tecnica', 'preventiva'])}%</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px 25px; border-radius: 12px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 38px; margin-bottom: 10px;">🧠</div>
                        <div style="font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 500;">PENSAMIENTO SISTÉMICO</div>
                        <div style="font-size: 42px; font-weight: 700; color: #9C27B0;">${dimensiones.sistemica?.porcentaje || 0}%</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px 25px; border-radius: 12px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 38px; margin-bottom: 10px;">⚠️</div>
                        <div style="font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 500;">BRECHAS CRÍTICAS</div>
                        <div style="font-size: 42px; font-weight: 700; color: #FF9800;">${this.contarBrechas(dimensiones)}</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px 25px; border-radius: 12px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 38px; margin-bottom: 10px;">📋</div>
                        <div style="font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 500;">CUMPLIMIENTO NORMATIVO</div>
                        <div style="font-size: 42px; font-weight: 700; color: #00BCD4;">${dimensiones.normativo?.porcentaje || 0}%</div>
                    </div>
                </div>
            </div>

            <!-- ANÁLISIS DE RIESGO PREDICTIVO -->
            <div style="background: white; padding: 35px 40px; margin: 0 40px 30px 40px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">⚠️ ANÁLISIS DE RIESGO ORGANIZACIONAL PREDICTIVO</h2>
                <p style="color: #888; margin: 0 0 30px 0; font-size: 13px;">Proyección basada en patrones detectados</p>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, ${riesgo.color} 0%, ${this.ajustarColor(riesgo.color, -20)} 100%); color: white; padding: 35px 30px; border-radius: 12px; text-align: center; box-shadow: 0 5px 20px ${riesgo.color}40;">
                        <div style="font-size: 56px; margin-bottom: 10px;">${this.getIconoRiesgo(riesgo.nivel)}</div>
                        <div style="font-size: 26px; font-weight: 700; margin-bottom: 5px;">NIVEL ${riesgo.nivel}</div>
                        <div style="font-size: 13px; opacity: 0.9; font-weight: 500;">RIESGO OPERACIONAL</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 35px 30px; border-radius: 12px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 56px; font-weight: 700; color: #1a237e; margin-bottom: 10px;">${riesgo.probabilidadIncidente}%</div>
                        <div style="font-size: 15px; color: #666; font-weight: 500; margin-bottom: 5px;">PROBABILIDAD DE INCIDENTE</div>
                        <div style="font-size: 12px; color: #999;">Próximos 6 meses</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 35px 30px; border-radius: 12px; text-align: center; border: 1px solid #e0e0e0;">
                        <div style="font-size: 56px; font-weight: 700; color: #4CAF50; margin-bottom: 10px;">${roi}%</div>
                        <div style="font-size: 15px; color: #666; font-weight: 500; margin-bottom: 5px;">RETORNO DE INVERSIÓN</div>
                        <div style="font-size: 12px; color: #999;">Capacitación preventiva</div>
                    </div>
                </div>
                
                ${riesgo.factoresRiesgo.length > 0 ? `
                <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border: 2px solid #ffb74d; padding: 25px 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">🔍 FACTORES DE RIESGO IDENTIFICADOS</h3>
                    <ul style="margin: 0; padding-left: 25px; color: #555;">
                        ${riesgo.factoresRiesgo.map(function(f) { return '<li style="margin: 8px 0; line-height: 1.6;">' + f + '</li>'; }).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border: 2px solid #4caf50; padding: 25px 30px; border-radius: 12px;">
                    <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">💡 RECOMENDACIONES PRIORITARIAS</h3>
                    <ul style="margin: 0; padding-left: 25px; color: #555;">
                        ${riesgo.recomendaciones.map(function(r) { return '<li style="margin: 8px 0; line-height: 1.6;">' + r + '</li>'; }).join('')}
                    </ul>
                </div>
            </div>

            <!-- PLAN DE DESARROLLO -->
            <div style="background: white; padding: 35px 40px; margin: 0 40px 30px 40px; border-radius: 15px; box-shadow: 0 5px 25px rgba(0,0,0,0.08);">
                <h2 style="color: #1a237e; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">📋 PLAN DE DESARROLLO PROFESIONAL</h2>
                <p style="color: #888; margin: 0 0 30px 0; font-size: 13px;">Ruta de mejora basada en brechas</p>
                
                ${this.generarPlanDesarrolloHTML(dimensiones)}
            </div>

            <!-- BOTONES DE ACCIÓN -->
            <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; margin: 0 40px 40px 40px; padding-top: 30px; border-top: 2px solid #e0e0e0;">
                <button onclick="app.descargarInsignia()" style="background: linear-gradient(135deg, #D4AF37, #FFD700); color: #1a1a1a; padding: 16px 45px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(212,175,55,0.4); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(212,175,55,0.4)'">
                    🏅 DESCARGAR INSIGNIA
                </button>
                <button onclick="window.print()" style="background: linear-gradient(135deg, #4CAF50, #43a047); color: white; padding: 16px 45px; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(76,175,80,0.4); transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76,175,80,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76,175,80,0.4)'">
                    📄 IMPRIMIR REPORTE
                </button>
                <button onclick="app.volverAListaCasos()" style="background: linear-gradient(135deg, #f5f5f5, #e0e0e0); color: #333; padding: 16px 45px; border: 2px solid #ddd; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.3s;" onmouseover="this.style.background='linear-gradient(135deg, #e0e0e0, #d0d0d0)'; this.style.borderColor='#ccc'" onmouseout="this.style.background='linear-gradient(135deg, #f5f5f5, #e0e0e0)'; this.style.borderColor='#ddd'">
                    ↩️ VOLVER
                </button>
            </div>
            
            <!-- FOOTER -->
            <div style="text-align: center; padding: 30px 40px; border-top: 2px solid #e0e0e0; background: white; border-radius: 0 0 15px 15px; margin: 0 40px 40px 40px;">
                <p style="margin: 0 0 10px 0; color: #1a237e; font-size: 14px; font-weight: 600;">${this.config.empresa} INTELLIGENCE ENGINE v4.0</p>
                <p style="margin: 0 0 10px 0; color: #999; font-size: 12px;">
                    📧 ${this.config.contacto.email} &nbsp;|&nbsp; 📞 ${this.config.contacto.telefono} &nbsp;|&nbsp; 🌐 ${this.config.contacto.web}
                </p>
                <p style="margin: 0; color: #bbb; font-size: 11px; font-style: italic;">Documento confidencial - Uso exclusivo para evaluación de competencia SHE</p>
            </div>
        </div>
        `;
    },

    generarResumenEjecutivo: function(perfil, riesgo, dimensiones) {
        var nivel = perfil.nivelGeneral;
        var puntaje = perfil.puntajeGeneral;
        var brechas = this.contarBrechas(dimensiones);
        
        var resumen = `El profesional evaluado demuestra un nivel <strong style="color: ${this.getColorPorNivel(nivel)};">${nivel}</strong> con un puntaje de <strong>${puntaje}/100</strong>. `;
        
        if (puntaje >= 90) {
            resumen += `Se identifica capacidad comprobada para liderar iniciativas estratégicas de seguridad a nivel corporativo. `;
        } else if (puntaje >= 75) {
            resumen += `Cuenta con competencia sólida para implementar programas SHE de manera autónoma con supervisión mínima. `;
        } else {
            resumen += `Se recomienda plan de desarrollo enfocado en ${brechas} competencias críticas identificadas antes de asumir roles de mayor responsabilidad. `;
        }
        
        resumen += `El riesgo operacional proyectado es <strong style="color: ${riesgo.color};">${riesgo.nivel}</strong> con ${riesgo.probabilidadIncidente}% de probabilidad de incidente en los próximos 6 meses. `;
        
        if (brechas > 0) {
            resumen += `Se han identificado ${brechas} brechas críticas que requieren atención prioritaria mediante capacitación específica y seguimiento.`;
        } else {
            resumen += `No se identificaron brechas críticas. Se recomienda mantener programa de educación continua.`;
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
        
        var size = 280;
        var center = size / 2;
        var radius = (size / 2) - 50;
        
        var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
        
        // Fondos de niveles (5 niveles) con gradiente
        for (var i = 1; i <= 5; i++) {
            var r = (radius / 5) * i;
            svg += '<circle cx="' + center + '" cy="' + center + '" r="' + r + '" fill="none" stroke="#e0e0e0" stroke-width="1.5" opacity="0.6"/>';
        }
        
        // Líneas radiales
        var angles = datos.map(function(_, i) { return (i * 2 * Math.PI) / datos.length - Math.PI / 2; });
        angles.forEach(function(angle) {
            var x = center + radius * Math.cos(angle);
            var y = center + radius * Math.sin(angle);
            svg += '<line x1="' + center + '" y1="' + center + '" x2="' + x + '" y2="' + y + '" stroke="#e0e0e0" stroke-width="1.5" opacity="0.6"/>';
        });
        
        // Polígono de datos con gradiente
        var points = datos.map(function(d, i) {
            var angle = angles[i];
            var r = (radius * d.valor) / 100;
            return (center + r * Math.cos(angle)) + ',' + (center + r * Math.sin(angle));
        }).join(' ');
        
        svg += '<polygon points="' + points + '" fill="url(#grad)" stroke="#2196F3" stroke-width="3" opacity="0.9"/>';
        
        // Definir gradiente
        svg += '<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#2196F3;stop-opacity:0.4" /><stop offset="100%" style="stop-color:#1976D2;stop-opacity:0.2" /></linearGradient></defs>';
        
        // Puntos de datos con sombra
        datos.forEach(function(d, i) {
            var angle = angles[i];
            var r = (radius * d.valor) / 100;
            var x = center + r * Math.cos(angle);
            var y = center + r * Math.sin(angle);
            svg += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + d.color + '" stroke="white" stroke-width="3" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>';
            svg += '<text x="' + x + '" y="' + (y - 18) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#333" style="text-shadow: 0 1px 2px white;">' + d.valor + '%</text>';
        });
        
        svg += '</svg>';
        return svg;
    },

    generarGraficaBarrasHTML: function(benchmark) {
        return `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
            <div style="text-align: center; padding: 20px 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border: 1px solid #e0e0e0;">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px; font-weight: 500;">PROMEDIO INDUSTRIA</div>
                <div style="font-size: 32px; font-weight: 700; color: #999;">${benchmark.promedioIndustria}</div>
                <div style="height: 140px; display: flex; align-items: flex-end; justify-content: center; margin-top: 15px;">
                    <div style="width: 50px; height: ${benchmark.promedioIndustria * 1.5}px; background: linear-gradient(135deg, #999, #bbb); border-radius: 6px 6px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"></div>
                </div>
            </div>
            <div style="text-align: center; padding: 20px 15px; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border-radius: 10px; transform: scale(1.08); box-shadow: 0 5px 20px rgba(33,150,243,0.4);">
                <div style="font-size: 12px; opacity: 0.95; margin-bottom: 8px; font-weight: 600;">TU PUNTAJE</div>
                <div style="font-size: 38px; font-weight: 700;">${benchmark.tuPuntaje}</div>
                <div style="height: 140px; display: flex; align-items: flex-end; justify-content: center; margin-top: 15px;">
                    <div style="width: 50px; height: ${benchmark.tuPuntaje * 1.5}px; background: white; border-radius: 6px 6px 0 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></div>
                </div>
            </div>
            <div style="text-align: center; padding: 20px 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; border: 1px solid #e0e0e0;">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px; font-weight: 500;">TOP 10%</div>
                <div style="font-size: 32px; font-weight: 700; color: #4CAF50;">${benchmark.top10porciento}</div>
                <div style="height: 140px; display: flex; align-items: flex-end; justify-content: center; margin-top: 15px;">
                    <div style="width: 50px; height: ${benchmark.top10porciento * 1.5}px; background: linear-gradient(135deg, #4CAF50, #43a047); border-radius: 6px 6px 0 0; box-shadow: 0 2px 8px rgba(76,175,80,0.3);"></div>
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
            return `<div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 35px 40px; border-radius: 12px; text-align: center; border: 2px solid #4caf50;">
                <div style="font-size: 64px; margin-bottom: 15px;">🎉</div>
                <h3 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 22px; font-weight: 600;">¡EXCELENTE DESEMPEÑO!</h3>
                <p style="color: #555; margin: 0; font-size: 15px; line-height: 1.6;">Todas las competencias están por encima del estándar del 75%. Se recomienda mantener el programa de educación continua y considerar roles de mayor responsabilidad.</p>
            </div>`;
        }
        
        var html = '<div style="display: grid; gap: 18px;">';
        debilidades.forEach(function(dim, index) {
            var color = index === 0 ? '#FF9800' : '#FFB74D';
            var bg = index === 0 ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
            var border = index === 0 ? '3px solid #FF9800' : '2px solid #e0e0e0';
            html += `<div style="display: flex; align-items: center; gap: 25px; padding: 25px 30px; background: ${bg}; border-radius: 12px; border-left: ${border}; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <div style="font-size: 28px; font-weight: 700; color: #999; min-width: 40px; text-align: center;">#${index + 1}</div>
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <strong style="color: #333; font-size: 17px; font-weight: 600;">${dim.charAt(0).toUpperCase() + dim.slice(1)}</strong>
                        <span style="background: ${dimensiones[dim].color}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 700; box-shadow: 0 2px 8px ${dimensiones[dim].color}60;">${dimensiones[dim].porcentaje}%</span>
                    </div>
                    <div style="background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 12px;">
                        <div style="background: ${dimensiones[dim].color}; height: 100%; width: ${dimensiones[dim].porcentaje}%; transition: width 1.5s ease; border-radius: 5px;"></div>
                    </div>
                    <div style="font-size: 14px; color: #666; line-height: 1.6;">
                        <strong style="color: #333;">Acción recomendada:</strong> ${DashboardEngine.getRecomendacionPorDimension(dim)}
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
            top10: '🏆 ¡EXCELENTE! TOP 10% DE PROFESIONALES SHE',
            top25: '🥈 MUY BIEN! SUPERAS AL 75% DE PROFESIONALES',
            promedio: '📊 BUEN DESEMPEÑO! EN EL PROMEDIO DE LA INDUSTRIA',
            bajo: '📈 OPORTUNIDAD DE MEJORA! ESPACIO PARA CRECER'
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
            tecnica: 'Curso avanzado de normatividad STPS + Certificación técnica especializada',
            sistemica: 'Diplomado en análisis de causa raíz (ICAM/TapRooT) + Auditoría de sistemas',
            decisional: 'Taller ejecutivo de toma de decisiones bajo presión + Simulacros de crisis',
            preventiva: 'Certificación en jerarquía de controles + Implementación de barreras de ingeniería',
            normativo: 'Actualización en NOM-STPS 2026 + Seminario de cumplimiento legal SHE'
        };
        return recomendaciones[dim] || 'Capacitación específica según brecha identificada';
    }
};

// Inicializar
if (typeof window !== 'undefined') {
    window.DashboardEngine = DashboardEngine;
    DashboardEngine.cargarConfig();
    console.log('✅ Executive Dashboard Engine v4.0 cargado');
}
