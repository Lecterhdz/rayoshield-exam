// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - CERTIFICADO DE CASOS (v3.0 - CORREGIDO)
// ─────────────────────────────────────────────────────────────────────

/**
 * Genera hash único para certificado (DEBE IR PRIMERO)
 */
async function generarHashCertificado(texto) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(texto);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
    } catch (error) {
        console.error('Error generando hash:', error);
        return 'RS-' + Date.now().toString(36).toUpperCase();
    }
}

/**
 * Genera certificado de caso con nivel y marca de agua
 */
async function generarCertificadoCaso(userData, caso, resultado, nivel, conMarcaDeAgua) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 2480;
    canvas.height = 1748;
    
    // FONDO
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // BORDES
    const gradientGold = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradientGold.addColorStop(0, '#B8860B');
    gradientGold.addColorStop(0.5, '#FFD700');
    gradientGold.addColorStop(1, '#B8860B');
    
    ctx.strokeStyle = gradientGold;
    ctx.lineWidth = 30;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    ctx.strokeStyle = '#1a237e';
    ctx.lineWidth = 12;
    ctx.strokeRect(95, 95, canvas.width - 190, canvas.height - 190);
    
    // TÍTULO
    ctx.font = 'bold 85px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE COMPETENCIA', canvas.width / 2, 280);
    
    // NIVEL
    ctx.font = 'bold 65px "Segoe UI", Arial';
    const gradientNivel = ctx.createLinearGradient(canvas.width/2 - 300, 360, canvas.width/2 + 300, 360);
    gradientNivel.addColorStop(0, '#B8860B');
    gradientNivel.addColorStop(0.5, '#FFD700');
    gradientNivel.addColorStop(1, '#B8860B');
    ctx.fillStyle = gradientNivel;
    ctx.fillText('NIVEL ' + nivel, canvas.width / 2, 360);
    
    // LÍNEA
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 500, 410);
    ctx.lineTo(canvas.width / 2 + 500, 410);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // DATOS DEL PROFESIONAL
    ctx.font = '42px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('Este certificado acredita que:', canvas.width / 2, 500);
    
    ctx.font = 'bold 75px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.nombre || 'Profesional', canvas.width / 2, 600);
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 400, 635);
    ctx.lineTo(canvas.width / 2 + 400, 635);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.font = '35px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    const startY = 700;
    const lineHeight = 70;
    const leftX = canvas.width / 2 - 500;
    const rightX = canvas.width / 2 + 500;
    
    ctx.textAlign = 'left';
    ctx.fillText('Empresa:', leftX, startY);
    ctx.font = 'bold 35px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.empresa || 'N/A', leftX + 180, startY);
    
    ctx.font = '35px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Puesto:', leftX, startY + lineHeight);
    ctx.font = 'bold 35px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.puesto || 'N/A', leftX + 150, startY + lineHeight);
    
    // CASO
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(canvas.width / 2 - 600, 850, 1200, 380);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width / 2 - 600, 850, 1200, 380);
    
    ctx.font = 'bold 45px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('Caso de Investigación Completado', canvas.width / 2, 920);
    
    ctx.font = 'bold 50px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(caso.titulo || 'Caso de Investigación', canvas.width / 2, 1010);
    
    // RESULTADO
    const scoreX = canvas.width / 2;
    const scoreY = 1400;
    const scoreRadius = 160;
    
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
    ctx.fillStyle = resultado.aprobado ? '#E8F5E9' : '#FFEBEE';
    ctx.fill();
    ctx.strokeStyle = resultado.aprobado ? '#D4AF37' : '#f44336';
    ctx.lineWidth = 12;
    ctx.stroke();
    
    ctx.font = 'bold 90px "Segoe UI", Arial';
    ctx.fillStyle = resultado.aprobado ? '#B8860B' : '#f44336';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(resultado.porcentaje + '%', scoreX, scoreY - 20);
    
    ctx.font = '38px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Calificación', scoreX, scoreY + 70);
    
    // FIRMAS
    const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 500, 1620);
    ctx.lineTo(canvas.width / 2 - 100, 1620);
    ctx.moveTo(canvas.width / 2 + 100, 1620);
    ctx.lineTo(canvas.width / 2 + 500, 1620);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = 'italic 35px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('_________________________', canvas.width / 2 - 300, 1600);
    ctx.font = 'bold 30px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Director SHE', canvas.width / 2 - 300, 1650);
    
    ctx.font = 'italic 35px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.fillText('_________________________', canvas.width / 2 + 300, 1600);
    ctx.font = 'bold 30px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Instructor Certificado', canvas.width / 2 + 300, 1650);
    
    ctx.font = '28px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('Fecha: ' + fecha, canvas.width / 2, 1700);
    
    // ID DEL CERTIFICADO (USA generarHashCertificado)
    const hash = await generarHashCertificado(
        (userData.nombre || '') + ':' + 
        (userData.curp || '') + ':' + 
        (caso.id || '') + ':' + 
        (resultado.puntajeTotal || 0) + ':' + 
        Date.now()
    );
    ctx.font = '20px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText('ID: ' + hash.toUpperCase().substring(0, 16), canvas.width / 2, 1730);
    
    // MARCA DE AGUA (SOLO DEMO)
    if (conMarcaDeAgua) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 8);
        ctx.font = 'bold 140px "Segoe UI", Arial';
        ctx.fillStyle = 'rgba(244, 67, 54, 0.12)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DEMO - SIN VALIDEZ OFICIAL', 0, 0);
        ctx.restore();
    }
    
    // LOGO
    ctx.font = 'bold 35px "Segoe UI", Arial';
    ctx.fillStyle = '#2196F3';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️ RayoShield PRO', canvas.width / 2, 50);
    
    return canvas.toDataURL('image/png', 1.0);
}

/**
 * Certificado MASTER (legacy)
 */
async function generarCertificadoMaster(userData, caso, resultado) {
    return generarCertificadoCaso(userData, caso, resultado, 'MASTER', false);
}

/**
 * Descarga certificado
 */
function descargarCertificadoMaster(imageUrl, filename = 'certificado-master.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    link.click();
}

// ─────────────────────────────────────────────────────────────────────
// EXPORTAR FUNCIONES (AL FINAL - IMPORTANTE)
// ─────────────────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
    window.generarHashCertificado = generarHashCertificado;
    window.generarCertificadoCaso = generarCertificadoCaso;
    window.generarCertificadoMaster = generarCertificadoMaster;
    window.descargarCertificadoMaster = descargarCertificadoMaster;
    console.log('✅ certificate-master.js v3.0 cargado - Funciones exportadas');
}
