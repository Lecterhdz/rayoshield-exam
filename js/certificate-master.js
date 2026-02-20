// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - CERTIFICADO MASTER (Nivel Experto)
// ─────────────────────────────────────────────────────────────────────────────

async function generarCertificadoMaster(userData, caso, resultado) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones A4 en alta resolución (300 DPI)
    canvas.width = 2480;
    canvas.height = 1748;
    
    // ───────────────────────────────────────────────────────────────────────
    // FONDO PREMIUM
    // ───────────────────────────────────────────────────────────────────────
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde exterior dorado
    const gradientGold = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradientGold.addColorStop(0, '#D4AF37');
    gradientGold.addColorStop(0.5, '#FFD700');
    gradientGold.addColorStop(1, '#D4AF37');
    
    ctx.strokeStyle = gradientGold;
    ctx.lineWidth = 25;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Borde interior azul premium
    ctx.strokeStyle = '#1a237e';
    ctx.lineWidth = 10;
    ctx.strokeRect(75, 75, canvas.width - 150, canvas.height - 150);
    
    // Esquinas ornamentales
    dibujarEsquinaOrnamental(ctx, 75, 75, 150, '#D4AF37');
    dibujarEsquinaOrnamental(ctx, canvas.width - 225, 75, 150, '#D4AF37', true, false);
    dibujarEsquinaOrnamental(ctx, 75, canvas.height - 225, 150, '#D4AF37', false, true);
    dibujarEsquinaOrnamental(ctx, canvas.width - 225, canvas.height - 225, 150, '#D4AF37', true, true);
    
    // ───────────────────────────────────────────────────────────────────────
    // ENCABEZADO
    // ───────────────────────────────────────────────────────────────────────
    
    // Título principal
    ctx.font = 'bold 90px Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE COMPETENCIA', canvas.width / 2, 280);
    
    // Subtítulo MASTER
    ctx.font = 'bold 70px Arial';
    const gradientMaster = ctx.createLinearGradient(canvas.width/2 - 200, 350, canvas.width/2 + 200, 350);
    gradientMaster.addColorStop(0, '#D4AF37');
    gradientMaster.addColorStop(0.5, '#FFD700');
    gradientMaster.addColorStop(1, '#D4AF37');
    ctx.fillStyle = gradientMaster;
    ctx.fillText('NIVEL MASTER', canvas.width / 2, 380);
    
    // Línea decorativa
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 500, 430);
    ctx.lineTo(canvas.width / 2 + 500, 430);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // ───────────────────────────────────────────────────────────────────────
    // DATOS DEL PROFESIONAL
    // ───────────────────────────────────────────────────────────────────────
    
    ctx.font = '40px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'left';
    ctx.fillText('Este certificado acredita que:', canvas.width / 2 - 600, 520);
    
    // Nombre del profesional
    ctx.font = 'bold 75px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.nombre || 'Profesional', canvas.width / 2, 620);
    
    // Línea debajo del nombre
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 400, 650);
    ctx.lineTo(canvas.width / 2 + 400, 650);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Datos adicionales
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    const startY = 720;
    const lineHeight = 65;
    const leftX = canvas.width / 2 - 500;
    const rightX = canvas.width / 2 + 500;
    
    ctx.fillText(`CURP:`, leftX, startY);
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.curp || 'N/A', leftX + 120, startY);
    
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Empresa:`, leftX, startY + lineHeight);
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.empresa || 'N/A', leftX + 150, startY + lineHeight);
    
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Puesto:`, rightX - 250, startY);
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.puesto || 'N/A', rightX - 50, startY);
    
    // ───────────────────────────────────────────────────────────────────────
    // DETALLES DEL CASO
    // ───────────────────────────────────────────────────────────────────────
    
    // Recuadro del caso
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(canvas.width / 2 - 600, 870, 1200, 350);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width / 2 - 600, 870, 1200, 350);
    
    // Título
    ctx.font = 'bold 45px Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('Caso de Investigación Completado', canvas.width / 2, 940);
    
    // Nombre del caso
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(caso.titulo || 'Caso MASTER', canvas.width / 2, 1030);
    
    // Categoría y norma
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(caso.categoria || 'Seguridad Industrial', canvas.width / 2, 1100);
    
    // ───────────────────────────────────────────────────────────────────────
    // RESULTADO
    // ───────────────────────────────────────────────────────────────────────
    
    // Círculo de calificación
    const scoreX = canvas.width / 2;
    const scoreY = 1380;
    const scoreRadius = 180;
    
    // Fondo del círculo
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
    ctx.fillStyle = resultado.aprobado ? '#E8F5E9' : '#FFEBEE';
    ctx.fill();
    ctx.strokeStyle = resultado.aprobado ? '#D4AF37' : '#f44336';
    ctx.lineWidth = 10;
    ctx.stroke();
    
    // Porcentaje
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = resultado.aprobado ? '#D4AF37' : '#f44336';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${resultado.porcentaje}%`, scoreX, scoreY - 30);
    
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Calificación', scoreX, scoreY + 60);
    
    // ───────────────────────────────────────────────────────────────────────
    // FIRMAS Y FECHA
    // ───────────────────────────────────────────────────────────────────────
    
    const fecha = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Línea de firmas
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 500, 1580);
    ctx.lineTo(canvas.width / 2 - 100, 1580);
    ctx.moveTo(canvas.width / 2 + 100, 1580);
    ctx.lineTo(canvas.width / 2 + 500, 1580);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Firma izquierda (Director SHE)
    ctx.font = 'italic 35px Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('_________________________', canvas.width / 2 - 300, 1560);
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Director SHE', canvas.width / 2 - 300, 1620);
    
    // Firma derecha (Instructor Master)
    ctx.font = 'italic 35px Arial';
    ctx.fillStyle = '#1a237e';
    ctx.fillText('_________________________', canvas.width / 2 + 300, 1560);
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Instructor Master', canvas.width / 2 + 300, 1620);
    
    // Fecha y ID
    ctx.font = '28px Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText(`Fecha de emisión: ${fecha}`, canvas.width / 2, 1680);
    
    // ID único del certificado
    const hash = await generarHashMaster(`${userData.nombre}:${userData.curp}:${caso.id}:${resultado.puntajeTotal}:${Date.now()}`);
    ctx.font = '22px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText(`ID Certificado: ${hash.toUpperCase()}`, canvas.width / 2, 1720);
    
    // ───────────────────────────────────────────────────────────────────────
    // MARCA DE AGUA MASTER (sutil)
    // ───────────────────────────────────────────────────────────────────────
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 8);
    ctx.font = 'bold 150px Arial';
    ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NIVEL MASTER', 0, 0);
    ctx.restore();
    
    // ───────────────────────────────────────────────────────────────────────
    // CONVERTIR A IMAGEN
    // ───────────────────────────────────────────────────────────────────────
    
    return canvas.toDataURL('image/png', 1.0);
}

// Función auxiliar para dibujar esquinas ornamentales
function dibujarEsquinaOrnamental(ctx, x, y, size, color, flipX = false, flipY = false) {
    ctx.save();
    ctx.translate(x + (flipX ? size : 0), y + (flipY ? size : 0));
    if (flipX) ctx.scale(-1, 1);
    if (flipY) ctx.scale(1, -1);
    
    ctx.fillStyle = color;
    
    // Diseño ornamental simple
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size / 2, 0, size, size / 2);
    ctx.quadraticCurveTo(size / 2, size, 0, size);
    ctx.quadraticCurveTo(size / 2, size / 2, 0, 0);
    ctx.fill();
    
    ctx.restore();
}

// Generar hash único para certificado
async function generarHashMaster(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// Descargar certificado
function descargarCertificadoMaster(imageUrl, filename = 'certificado-master.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    link.click();
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.generarCertificadoMaster = generarCertificadoMaster;
    window.descargarCertificadoMaster = descargarCertificadoMaster;
    console.log('✅ certificate-master.js cargado');
}