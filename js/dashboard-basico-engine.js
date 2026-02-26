// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD PRO - DASHBOARD BÁSICO ENGINE (v2.0)
// Muestra Score Base + Competencias por separado
// ─────────────────────────────────────────────────────────────────────

const DashboardBasico = {
    generar: function(resultado) {
        // ✅ SCORE BASE (de scoring.js - respuestas correctas)
        var scoreBase = resultado.porcentaje || 0;
        
        // ✅ SCORE COMPETENCIAS (de SmartEvaluationV2 - 5 dimensiones)
        var scoreCompetencias = resultado.puntajeCompetencias || scoreBase;
        
        // ✅ NIVEL DE CERTIFICACIÓN
        var nivel = resultado.nivelGeneral ? resultado.nivelGeneral.nivel : 'N/A';
        var iconoNivel = resultado.nivelGeneral ? resultado.nivelGeneral.icono : '📚';
        var validez = resultado.nivelGeneral ? resultado.nivelGeneral.validez : '1 año';
        
        // ✅ FECHA
        var fecha = new Date().toLocaleDateString('es-MX');
        
        // ✅ DIMENSIONES
        var dimensionesHTML = '';
        if (resultado.dimensiones) {
            for (var dim in resultado.dimensiones) {
                var d = resultado.dimensiones[dim];
                var colorBarra = d.porcentaje >= 80 ? '#4CAF50' : (d.porcentaje >= 60 ? '#FF9800' : '#f44336');
                dimensionesHTML += '<div class="dimension-item" style="margin:15px 0;">' +
                    '<div style="display:flex;justify-content:space-between;margin-bottom:5px;">' +
                    '<span style="font-weight:500;">' + d.icono + ' ' + d.descripcion + '</span>' +
                    '<span style="font-weight:bold;color:' + colorBarra + ';">' + d.porcentaje + '%</span>' +
                    '</div>' +
                    '<div style="background:#e0e0e0;border-radius:10px;height:12px;overflow:hidden;">' +
                    '<div style="background:' + colorBarra + ';height:100%;width:' + d.porcentaje + '%;transition:width 0.3s;"></div>' +
                    '</div>' +
                    '</div>';
            }
        }
        
        // ✅ RECOMENDACIONES
        var recomendacionesHTML = '';
        if (scoreBase >= 90) {
            recomendacionesHTML = '<div style="background:#E8F5E9;padding:15px;border-radius:10px;border-left:4px solid #4CAF50;">' +
                '<strong style="color:#2E7D32;">✅ ¡Excelente desempeño!</strong>' +
                '<p style="margin:10px 0 0 0;color:#1B5E20;">Mantener educación continua y actualizar conocimientos.</p>' +
                '</div>';
        } else if (scoreBase >= 70) {
            recomendacionesHTML = '<div style="background:#FFF3E0;padding:15px;border-radius:10px;border-left:4px solid #FF9800;">' +
                '<strong style="color:#E65100;">✅ Buen desempeño</strong>' +
                '<p style="margin:10px 0 0 0;color:#BF360C;">Reforzar áreas con menos del 80% en dimensiones.</p>' +
                '</div>';
        } else {
            recomendacionesHTML = '<div style="background:#FFEBEE;padding:15px;border-radius:10px;border-left:4px solid #f44336;">' +
                '<strong style="color:#C62828;">⚠️ Se requiere capacitación</strong>' +
                '<p style="margin:10px 0 0 0;color:#B71C1C;">Revisar preguntas incorrectas y reforzar competencias débiles.</p>' +
                '</div>';
        }
        
        // ✅ NOTA ACLARATORIA (IMPORTANTE)
        var notaHTML = '<div style="margin-top:20px;padding:15px;background:#E3F2FD;border-radius:10px;font-size:13px;border-left:4px solid #2196F3;">' +
            '<strong style="color:#1565C0;">📝 Nota sobre la evaluación:</strong>' +
            '<p style="margin:10px 0 0 0;color:#0D47A1;line-height:1.6;">' +
            'El <strong>Score Base (' + scoreBase + '%)</strong> refleja las respuestas correctas/incorrectas. ' +
            'El <strong>Score Competencias (' + scoreCompetencias + '%)</strong> evalúa las 5 dimensiones de competencia SHE. ' +
            (scoreCompetencias > scoreBase ? 
                '<br><br><strong>💡 Tu análisis fue excelente:</strong> Las dimensiones evaluadas muestran un desempeño superior al score base.' : 
                '<br><br><strong>💡 Recomendación:</strong> Revisar las dimensiones con menos del 70%.') +
            '</p>' +
            '</div>';
        
        // ✅ HTML COMPLETO
        return '<div class="dashboard-container" style="max-width:800px;margin:0 auto;padding:20px;font-family:\'Segoe UI\',Arial,sans-serif;">' +
            
            // ENCABEZADO
            '<div style="text-align:center;margin-bottom:30px;">' +
            '<h2 style="color:#1a237e;margin:0 0 10px 0;">📊 Reporte de Competencia SHE</h2>' +
            '<p style="color:#666;margin:0;">Nivel ' + iconoNivel + ' ' + nivel + ' | ' + fecha + '</p>' +
            '<p style="color:#999;font-size:14px;margin:5px 0 0 0;">Validez: ' + validez + '</p>' +
            '</div>' +
            
            // SCORES SEPARADOS (2 COLUMNAS)
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px;">' +
            
            // SCORE BASE
            '<div style="background:linear-gradient(135deg,#2196F3,#1976D2);padding:25px;border-radius:15px;text-align:center;color:white;box-shadow:0 4px 15px rgba(33,150,243,0.3);">' +
            '<div style="font-size:14px;opacity:0.9;margin-bottom:10px;">SCORE BASE</div>' +
            '<div style="font-size:56px;font-weight:bold;margin:10px 0;">' + scoreBase + '%</div>' +
            '<div style="font-size:12px;opacity:0.8;">Respuestas Correctas</div>' +
            '</div>' +
            
            // SCORE COMPETENCIAS
            '<div style="background:linear-gradient(135deg,#9C27B0,#7B1FA2);padding:25px;border-radius:15px;text-align:center;color:white;box-shadow:0 4px 15px rgba(156,39,176,0.3);">' +
            '<div style="font-size:14px;opacity:0.9;margin-bottom:10px;">SCORE COMPETENCIAS</div>' +
            '<div style="font-size:56px;font-weight:bold;margin:10px 0;">' + scoreCompetencias + '%</div>' +
            '<div style="font-size:12px;opacity:0.8;">5 Dimensiones SHE</div>' +
            '</div>' +
            
            '</div>' +
            
            // DIMENSIONES
            '<div style="background:white;padding:25px;border-radius:15px;box-shadow:0 2px 10px rgba(0,0,0,0.1);margin-bottom:20px;">' +
            '<h3 style="color:#1a237e;margin:0 0 20px 0;border-bottom:2px solid #2196F3;padding-bottom:10px;">📈 Dimensiones Evaluadas</h3>' +
            dimensionesHTML +
            '</div>' +
            
            // RECOMENDACIONES
            '<div style="margin-bottom:20px;">' +
            '<h3 style="color:#1a237e;margin:0 0 15px 0;">💡 Recomendaciones</h3>' +
            recomendacionesHTML +
            '</div>' +
            
            // NOTA ACLARATORIA
            notaHTML +
            
            // BOTONES
            '<div style="margin-top:30px;display:flex;gap:15px;flex-wrap:wrap;justify-content:center;">' +
            '<button onclick="app.imprimirDashboard()" style="background:linear-gradient(135deg,#607D8B,#546E7A);color:white;border:none;padding:14px 28px;border-radius:10px;font-weight:bold;cursor:pointer;">🖨️ Imprimir</button>' +
            '<button onclick="app.volverAListaCasos()" style="background:linear-gradient(135deg,#9E9E9E,#757575);color:white;border:none;padding:14px 28px;border-radius:10px;font-weight:bold;cursor:pointer;">🔄 Otro caso</button>' +
            '</div>' +
            
            '</div>';
    }
};

// Exportar
if (typeof window !== 'undefined') {
    window.DashboardBasico = DashboardBasico;
    console.log('✅ Dashboard Básico Engine v2.0 cargado - Score Base + Competencias');
}
