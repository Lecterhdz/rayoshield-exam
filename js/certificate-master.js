// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - CERTIFICADO DE CASOS (MEJORADO)
// Versión: 2.0 - Con sello metálico en relieve
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────
// GENERAR HASH ÚNICO PARA CERTIFICADO
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// GENERA CERTIFICADO DE CASO CON NIVEL Y MARCA DE AGUA
// ─────────────────────────────────────────────────────────────────────
async function generarCertificadoCaso(userData, caso, resultado, nivel, conMarcaDeAgua) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones A4 en alta resolución (300 DPI)
    canvas.width = 2480;
    canvas.height = 1748;
    
    // ───────────────────────────────────────────────────────────────────────
    // FONDO PREMIUM
    // ───────────────────────────────────────────────────────────────────────
    
    // Fondo blanco con textura sutil
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Patrón de fondo sutil (líneas diagonales)
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.03)';
    ctx.lineWidth = 2;
    for (let i = -2000; i < 4000; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 2000, 2000);
        ctx.stroke();
    }
    ctx.restore();
    
    // ───────────────────────────────────────────────────────────────────────
    // BORDES ORNAMENTALES
    // ───────────────────────────────────────────────────────────────────────
    
    // Borde exterior dorado con gradiente metálico
    const gradientGold = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradientGold.addColorStop(0, '#B8860B');
    gradientGold.addColorStop(0.25, '#FFD700');
    gradientGold.addColorStop(0.5, '#FFEC8B');
    gradientGold.addColorStop(0.75, '#FFD700');
    gradientGold.addColorStop(1, '#B8860B');
    
    ctx.strokeStyle = gradientGold;
    ctx.lineWidth = 30;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    // Borde interior azul premium
    ctx.strokeStyle = '#1a237e';
    ctx.lineWidth = 12;
    ctx.strokeRect(95, 95, canvas.width - 190, canvas.height - 190);
    
    // Borde decorativo interior dorado
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(120, 120, canvas.width - 240, canvas.height - 240);
    
    // ───────────────────────────────────────────────────────────────────────
    // ESQUINAS ORNAMENTALES MEJORADAS
    // ───────────────────────────────────────────────────────────────────────
    
    dibujarEsquinaOrnamentalMejorada(ctx, 120, 120, 200, '#D4AF37');
    dibujarEsquinaOrnamentalMejorada(ctx, canvas.width - 320, 120, 200, '#D4AF37', true, false);
    dibujarEsquinaOrnamentalMejorada(ctx, 120, canvas.height - 320, 200, '#D4AF37', false, true);
    dibujarEsquinaOrnamentalMejorada(ctx, canvas.width - 320, canvas.height - 320, 200, '#D4AF37', true, true);
    
    // ───────────────────────────────────────────────────────────────────────
    // SELLO METÁLICO EN RELIEVE (CENTRAL)
    // ───────────────────────────────────────────────────────────────────────
    
    dibujarSelloMetalico(ctx, canvas.width / 2, 280, 120, nivel);
    
    // ───────────────────────────────────────────────────────────────────────
    // ENCABEZADO
    // ───────────────────────────────────────────────────────────────────────
    
    // Título principal
    ctx.font = 'bold 85px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE COMPETENCIA', canvas.width / 2, 480);
    
    // Subtítulo con nivel dinámico
    ctx.font = 'bold 65px "Segoe UI", Arial';
    const gradientNivel = ctx.createLinearGradient(canvas.width/2 - 300, 560, canvas.width/2 + 300, 560);
    gradientNivel.addColorStop(0, '#B8860B');
    gradientNivel.addColorStop(0.5, '#FFD700');
    gradientNivel.addColorStop(1, '#B8860B');
    ctx.fillStyle = gradientNivel;
    ctx.fillText('NIVEL ' + nivel, canvas.width / 2, 560);
    
    // Línea decorativa
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 500, 610);
    ctx.lineTo(canvas.width / 2 + 500, 610);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // ───────────────────────────────────────────────────────────────────────
    // DATOS DEL PROFESIONAL
    // ───────────────────────────────────────────────────────────────────────
    
    ctx.font = '42px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('Este certificado acredita que:', canvas.width / 2, 700);
    
    // Nombre del profesional
    ctx.font = 'bold 75px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.nombre || 'Profesional', canvas.width / 2, 800);
    
    // Línea debajo del nombre
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 400, 835);
    ctx.lineTo(canvas.width / 2 + 400, 835);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Datos adicionales
    ctx.font = '35px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    const startY = 900;
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
    
    ctx.font = '35px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('CURP:', rightX - 200, startY);
    ctx.font = 'bold 35px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.curp || 'N/A', rightX - 50, startY);
    
    // ───────────────────────────────────────────────────────────────────────
    // DETALLES DEL CASO
    // ───────────────────────────────────────────────────────────────────────
    
    // Recuadro del caso con gradiente
    const casoGradient = ctx.createLinearGradient(canvas.width / 2 - 600, 1050, canvas.width / 2 + 600, 1250);
    casoGradient.addColorStop(0, '#f9f9f9');
    casoGradient.addColorStop(1, '#f0f0f0');
    ctx.fillStyle = casoGradient;
    ctx.fillRect(canvas.width / 2 - 600, 1050, 1200, 380);
    
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width / 2 - 600, 1050, 1200, 380);
    
    // Título
    ctx.font = 'bold 45px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('Caso de Investigación Completado', canvas.width / 2, 1120);
    
    // Nombre del caso
    ctx.font = 'bold 50px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(caso.titulo || 'Caso de Investigación', canvas.width / 2, 1210);
    
    // Categoría
    ctx.font = '38px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(caso.categoria || 'Seguridad Industrial', canvas.width / 2, 1290);
    
    // ───────────────────────────────────────────────────────────────────────
    // RESULTADO
    // ───────────────────────────────────────────────────────────────────────
    
    // Círculo de calificación con efecto metálico
    const scoreX = canvas.width / 2;
    const scoreY = 1520;
    const scoreRadius = 160;
    
    // Fondo del círculo con gradiente
    const scoreGradient = ctx.createRadialGradient(scoreX, scoreY, 0, scoreX, scoreY, scoreRadius);
    if (resultado.aprobado) {
        scoreGradient.addColorStop(0, '#E8F5E9');
        scoreGradient.addColorStop(1, '#C8E6C9');
    } else {
        scoreGradient.addColorStop(0, '#FFEBEE');
        scoreGradient.addColorStop(1, '#FFCDD2');
    }
    
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
    ctx.fillStyle = scoreGradient;
    ctx.fill();
    
    // Borde metálico del círculo
    const scoreBorderGradient = ctx.createLinearGradient(scoreX - scoreRadius, scoreY, scoreX + scoreRadius, scoreY);
    scoreBorderGradient.addColorStop(0, '#B8860B');
    scoreBorderGradient.addColorStop(0.5, '#FFD700');
    scoreBorderGradient.addColorStop(1, '#B8860B');
    ctx.strokeStyle = scoreBorderGradient;
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Porcentaje
    ctx.font = 'bold 90px "Segoe UI", Arial';
    ctx.fillStyle = resultado.aprobado ? '#B8860B' : '#f44336';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(resultado.porcentaje + '%', scoreX, scoreY - 20);
    
    ctx.font = '38px "Segoe UI", Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Calificación', scoreX, scoreY + 70);
    
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
    ctx.moveTo(canvas.width / 2 - 500, 1620);
    ctx.lineTo(canvas.width / 2 - 100, 1620);
    ctx.moveTo(canvas.width / 2 + 100, 1620);
    ctx.lineTo(canvas.width / 2 + 500, 1620);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Firma izquierda
    ctx.font = 'italic 38px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('_________________________', canvas.width / 2 - 300, 1600);
    ctx.font = 'bold 32px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Director SHE', canvas.width / 2 - 300, 1650);
    
    // Firma derecha
    ctx.font = 'italic 38px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.fillText('_________________________', canvas.width / 2 + 300, 1600);
    ctx.font = 'bold 32px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Instructor Certificado', canvas.width / 2 + 300, 1650);
    
    // Fecha
    ctx.font = '30px "Segoe UI", Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('Fecha de emisión: ' + fecha, canvas.width / 2, 1700);
    
    // ✅ ID DEL CERTIFICADO
    const hash = await generarHashCertificado(`${userData.nombre}:${userData.curp}:${caso.id}:${resultado.puntajeTotal}:${Date.now()}`);
    ctx.font = '20px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText('ID: ' + hash.toUpperCase().substring(0, 16), canvas.width / 2, 1730);
    
    // ───────────────────────────────────────────────────────────────────────
    // MARCA DE AGUA (SOLO DEMO)
    // ───────────────────────────────────────────────────────────────────────
    
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
    
    // ───────────────────────────────────────────────────────────────────────
    // LOGO RAYOSHIELD
    // ───────────────────────────────────────────────────────────────────────
    
    ctx.font = 'bold 35px "Segoe UI", Arial';
    ctx.fillStyle = '#2196F3';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️ RayoShield PRO', canvas.width / 2, 50);
    
    // ───────────────────────────────────────────────────────────────────────
    // CONVERTIR A IMAGEN
    // ───────────────────────────────────────────────────────────────────────
    
    return canvas.toDataURL('image/png', 1.0);
}

// ─────────────────────────────────────────────────────────────────────
// DIBUJA ESQUINA ORNAMENTAL MEJORADA CON DETALLES
// ─────────────────────────────────────────────────────────────────────
function dibujarEsquinaOrnamentalMejorada(ctx, x, y, size, color, flipX = false, flipY = false) {
    ctx.save();
    ctx.translate(x + (flipX ? size : 0), y + (flipY ? size : 0));
    if (flipX) ctx.scale(-1, 1);
    if (flipY) ctx.scale(1, -1);
    
    // Gradiente metálico para la esquina
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFEC8B');
    gradient.addColorStop(1, '#B8860B');
    ctx.fillStyle = gradient;
    
    // Diseño ornamental con múltiples capas
    // Capa exterior
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.6, 0, size, size * 0.4);
    ctx.quadraticCurveTo(size * 0.6, size, 0, size);
    ctx.quadraticCurveTo(size * 0.4, size * 0.6, 0, 0);
    ctx.fill();
    
    // Capa interior
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.5, 0, size, size * 0.3);
    ctx.quadraticCurveTo(size * 0.5, size, 0, size);
    ctx.quadraticCurveTo(size * 0.3, size * 0.5, 0, 0);
    ctx.fill();
    
    // Detalles decorativos
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(size * 0.3, size * 0.3, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.5, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(size * 0.7, size * 0.7, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────
// DIBUJA SELLO METÁLICO EN RELIEVE (COMO MEDALLA/HOLOGRAMA)
// ─────────────────────────────────────────────────────────────────────
function dibujarSelloMetalico(ctx, x, y, radio, nivel) {
    ctx.save();
    ctx.translate(x, y);
    
    // Sombra exterior (efecto 3D)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    
    // Círculo exterior dorado
    const gradientExterior = ctx.createRadialGradient(0, 0, radio * 0.5, 0, 0, radio);
    gradientExterior.addColorStop(0, '#FFD700');
    gradientExterior.addColorStop(0.5, '#FFEC8B');
    gradientExterior.addColorStop(1, '#B8860B');
    
    ctx.beginPath();
    ctx.arc(0, 0, radio, 0, Math.PI * 2);
    ctx.fillStyle = gradientExterior;
    ctx.fill();
    
    // Reset sombra
    ctx.shadowColor = 'transparent';
    
    // Círculo interior
    ctx.beginPath();
    ctx.arc(0, 0, radio * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = '#1a237e';
    ctx.fill();
    
    // Borde dentado (efecto medalla)
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, radio * 0.85, 0, Math.PI * 2);
    ctx.stroke();
    
    // Texto del nivel
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold ' + (radio * 0.35) + 'px "Segoe UI", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nivel, 0, 0);
    
    // Estrellas decorativas
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 5; i++) {
        const angulo = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const starX = Math.cos(angulo) * radio * 0.6;
        const starY = Math.sin(angulo) * radio * 0.6;
        dibujarEstrellaPequena(ctx, starX, starY, radio * 0.1);
    }
    
    ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────
// DIBUJA ESTRELLA PEQUEÑA PARA EL SELLO
// ─────────────────────────────────────────────────────────────────────
function dibujarEstrellaPequena(ctx, x, y, radio) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angulo = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const px = Math.cos(angulo) * radio;
        const py = Math.sin(angulo) * radio;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────
// GENERA CERTIFICADO MASTER (LEGACY - REDIRIGE A generarCertificadoCaso)
// ─────────────────────────────────────────────────────────────────────
async function generarCertificadoMaster(userData, caso, resultado) {
    return generarCertificadoCaso(userData, caso, resultado, 'MASTER', false);
}

// ─────────────────────────────────────────────────────────────────────
// DESCARGA CERTIFICADO
// ─────────────────────────────────────────────────────────────────────
function descargarCertificadoMaster(imageUrl, filename = 'certificado-master.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    link.click();
}

// ─────────────────────────────────────────────────────────────────────
// EXPORTAR FUNCIONES (UNA SOLA VEZ AL FINAL)
// ─────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
    window.generarHashCertificado = generarHashCertificado;
    window.generarCertificadoCaso = generarCertificadoCaso;
    window.generarCertificadoMaster = generarCertificadoMaster;
    window.descargarCertificadoMaster = descargarCertificadoMaster;
    console.log('✅ certificate-master.js v2.0 cargado - Con sello metálico');
}
