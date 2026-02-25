// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD - DASHBOARD BÁSICO ENGINE
// Para plan CONSULTOR (sin predictivo)
// ─────────────────────────────────────────────────────────────────────────────

const DashboardBasico = {
    generar: function(resultado) {
        var perfil = resultado.perfilCompetencial || { nivelGeneral: 'MASTER', puntajeGeneral: resultado.porcentaje || 80 };
        var dimensiones = resultado.dimensiones || {};
        
        return `
        <div class="dashboard-container" style="font-family: 'Segoe UI', sans-serif; background: #f5f7fa; padding: 30px; max-width: 900px; margin: 0 auto;">
            
            <!-- HEADER -->
            <div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; border-radius: 10px; margin-bottom: 25px;">
                <h1 style="margin: 0 0 10px 0; font-size: 24px;">📊 Reporte de Competencia SHE</h1>
                <p style="margin: 0; opacity: 0.9;">Nivel ${perfil.nivelGeneral} | ${new Date().toLocaleDateString('es-MX')}</p>
            </div>

            <!-- PUNTAJE PRINCIPAL -->
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 25px; text-align: center;">
                <div style="font-size: 64px; font-weight: bold; color: #2196F3;">${perfil.puntajeGeneral}%</div>
                <div style="font-size: 16px; color: #666; margin-top: 10px;">PUNTAJE GLOBAL</div>
            </div>

            <!-- DIMENSIONES -->
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 25px;">
                <h2 style="color: #1a237e; margin: 0 0 20px 0; font-size: 18px;">📈 Dimensiones Evaluadas</h2>
                <div style="display: grid; gap: 15px;">
                    ${Object.keys(dimensiones).map(dim => {
                        var data = dimensiones[dim];
                        return `<div style="display: flex; align-items: center; gap: 15px;">
                            <div style="width: 120px; font-weight: 600; color: #333;">${dim.charAt(0).toUpperCase() + dim.slice(1)}</div>
                            <div style="flex: 1; background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
                                <div style="background: ${data.color}; height: 100%; width: ${data.porcentaje}%; transition: width 1s;"></div>
                            </div>
                            <div style="width: 50px; text-align: right; font-weight: bold; color: ${data.color};">${data.porcentaje}%</div>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <!-- RECOMENDACIONES -->
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #1a237e; margin: 0 0 20px 0; font-size: 18px;">💡 Recomendaciones</h2>
                <ul style="margin: 0; padding-left: 20px; color: #555; line-height: 1.8;">
                    ${this.generarRecomendaciones(dimensiones).map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>

            <!-- BOTONES -->
            <div style="display: flex; gap: 15px; margin-top: 25px; justify-content: center;">
                <button onclick="app.descargarInsignia()" style="background: linear-gradient(135deg, #D4AF37, #FFD700); color: #1a1a1a; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">🏅 Descargar Insignia</button>
                <button onclick="window.print()" style="background: #4CAF50; color: white; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">📄 Imprimir</button>
                <button onclick="app.volverAListaCasos()" style="background: #f5f5f5; color: #333; padding: 12px 30px; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; font-weight: 600;">↩️ Volver</button>
            </div>
        </div>
        `;
    },
    
    generarRecomendaciones: function(dimensiones) {
        var recomendaciones = [];
        for (var dim in dimensiones) {
            if (dimensiones[dim].porcentaje < 75) {
                recomendaciones.push(`Fortalecer ${dim} (actual: ${dimensiones[dim].porcentaje}%)`);
            }
        }
        if (recomendaciones.length === 0) {
            recomendaciones.push('¡Excelente desempeño! Mantener educación continua.');
        }
        return recomendaciones;
    }
};

if (typeof window !== 'undefined') {
    window.DashboardBasico = DashboardBasico;
    console.log('✅ Dashboard Básico Engine cargado');
}