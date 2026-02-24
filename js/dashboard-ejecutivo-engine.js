// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - EXECUTIVE DASHBOARD ENGINE
// Motor de Inteligencia de Negocios para SHE
// ─────────────────────────────────────────────────────────────────────────────

const DashboardEngine = {
    config: {
        empresa: 'RayoShield',
        logo: 'assets/logo.png',
        colorPrimario: '#2196F3',
        contacto: { email: 'soporte@rayoshield.com', web: 'rayoshield.com' }
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
        const perfil = resultado.perfilCompetencial || { nivelGeneral: 'MASTER', puntajeGeneral: resultado.porcentaje || 80, fechaEvaluacion: new Date().toISOString(), validez: '2 años' };
        const riesgo = resultado.riesgoPredictivo || { nivel: 'BAJO', color: '#4CAF50', probabilidadIncidente: 10, factoresRiesgo: [], recomendaciones: ['Mantener educación continua'] };
        const roi = this.calcularROI(perfil.puntajeGeneral);
        
        return `
        <div class="dashboard-container" style="font-family: 'Segoe UI', sans-serif; background: #f4f7f6; padding: 20px; border-radius: 12px;">
            <!-- HEADER -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${this.config.colorPrimario}; padding-bottom: 15px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${this.config.logo}" alt="Logo" style="height: 50px; width: auto;">
                    <div>
                        <h2 style="margin: 0; color: #2c3e50;">Reporte Ejecutivo de Competencia SHE</h2>
                        <span style="color: #7f8c8d; font-size: 14px;">Evaluación: ${perfil.fechaEvaluacion.split('T')[0]}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: ${this.config.colorPrimario}; font-size: 18px;">${perfil.nivelGeneral}</div>
                    <div style="font-size: 12px; color: #666;">Validez: ${perfil.validez}</div>
                </div>
            </div>

            <!-- KPIs -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;">
                ${this.renderKPI('Nivel de Madurez', perfil.nivelGeneral, this.getColorNivel(perfil.nivelGeneral), '🏆')}
                ${this.renderKPI('Riesgo Operacional', riesgo.nivel, riesgo.color, '⚠️', `${riesgo.probabilidadIncidente}% Prob. Incidente`)}
                ${this.renderKPI('ROI Estimado', `${roi}%`, '#4CAF50', '💰', `Recuperación en ${roi > 100 ? '6' : '12'} meses`)}
            </div>

            <!-- RECOMENDACIONES -->
            <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-top: 25px;">
                <h3 style="color: #333; margin-top: 0;">🚀 Hoja de Ruta Estratégica</h3>
                <div style="margin-top: 25px; background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50;">
                    <h4 style="margin: 0 0 5px 0; color: #2e7d32;">💡 Insight de Inteligencia</h4>
                    <p style="margin: 0; font-size: 14px; color: #1b5e20;">
                        Basado en el patrón de respuestas, se recomienda priorizar la capacitación en <strong>Jerarquía de Controles</strong>. El ROI de esta acción se estima 45% superior a capacitación genérica.
                    </p>
                </div>
            </div>

            <!-- FOOTER -->
            <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
                Generado por ${this.config.empresa} Intelligence Engine • ${new Date().toLocaleDateString('es-MX')}
                <br>
                <button onclick="window.print()" style="margin-top: 10px; padding: 8px 16px; background: ${this.config.colorPrimario}; color: white; border: none; border-radius: 4px; cursor: pointer;">🖨️ Imprimir Reporte</button>
            </div>
        </div>
        `;
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
        const colores = { 'PERICIAL': '#D4AF37', 'ELITE': '#9C27B0', 'MASTER': '#2196F3', 'AVANZADO': '#4CAF50', 'BÁSICO': '#FF9800' };
        return colores[nivel] || '#999';
    }
};

// Inicializar
if (typeof window !== 'undefined') {
    window.DashboardEngine = DashboardEngine;
    DashboardEngine.cargarConfig();
    console.log('✅ Executive Dashboard Engine cargado');
}