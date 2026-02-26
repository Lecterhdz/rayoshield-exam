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
    ctx.moveTo(canvas.width / 2 - 500, 1320);
    ctx.lineTo(canvas.width / 2 - 100, 1320);
    ctx.moveTo(canvas.width / 2 + 100, 1320);
    ctx.lineTo(canvas.width / 2 + 500, 1320);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Firma izquierda
    ctx.font = 'italic 38px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.textAlign = 'center';
    ctx.fillText('_________________________', canvas.width / 2 - 300, 1350);
    ctx.font = 'bold 32px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Director SHE', canvas.width / 2 - 300, 1400);
    
    // Firma derecha
    ctx.font = 'italic 38px "Segoe UI", Arial';
    ctx.fillStyle = '#1a237e';
    ctx.fillText('_________________________', canvas.width / 2 + 300, 1350);
    ctx.font = 'bold 32px "Segoe UI", Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('Instructor Certificado', canvas.width / 2 + 300, 1400);
    
    // Fecha
    ctx.font = '30px "Segoe UI", Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('Fecha de emisión: ' + fecha, canvas.width / 2, 1600);
    
    // ✅ ID DEL CERTIFICADO
    const hash = await generarHashCertificado(`${userData.nombre}:${userData.curp}:${caso.id}:${resultado.puntajeTotal}:${Date.now()}`);
    ctx.font = '20px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText('ID: ' + hash.toUpperCase().substring(0, 16), canvas.width / 2, 1640);
    
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
// GENERAR INSIGNIA PNG (800x800 - METÁLICA PREMIUM)
// ─────────────────────────────────────────────────────────────────────
async function generarInsigniaPNG(userData, caso, resultado) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    const centerX = 400;
    const centerY = 400;
    const radioPrincipal = 350;

    // ✅ DETERMINAR NIVEL Y COLORES SEGÚN PUNTAJE
    var nivel = 'MASTER';
    var tipo = 'plata';
    var emoji = '🥈';
    var colorPrincipal = '#C0C0C0';
    var colorSecundario = '#E8E8E8';
    var colorTerciario = '#999999';
    var fondo = '#F5F5F5';

    if (resultado.porcentaje >= 95) {
        nivel = 'PERICIAL'; tipo = 'platino'; emoji = '⚖️';
        colorPrincipal = '#E5E4E2'; colorSecundario = '#F0F0F0'; colorTerciario = '#CCCCCC'; fondo = '#FAFAFA';
    } else if (resultado.porcentaje >= 90) {
        nivel = 'ELITE'; tipo = 'oro'; emoji = '🥇';
        colorPrincipal = '#FFD700'; colorSecundario = '#FFA500'; colorTerciario = '#DAA520'; fondo = '#FFFDE7';
    } else if (resultado.porcentaje >= 80) {
        nivel = 'MASTER'; tipo = 'plata'; emoji = '🥈';
        colorPrincipal = '#C0C0C0'; colorSecundario = '#E8E8E8'; colorTerciario = '#999999'; fondo = '#F5F5F5';
    } else if (resultado.porcentaje >= 75) {
        nivel = 'AVANZADO'; tipo = 'bronce'; emoji = '🥉';
        colorPrincipal = '#CD7F32'; colorSecundario = '#B87333'; colorTerciario = '#A0522D'; fondo = '#FFF8E1';
    } else {
        nivel = 'PARTICIPACIÓN'; tipo = 'bronce'; emoji = '📚';
        colorPrincipal = '#CD7F32'; colorSecundario = '#B87333'; colorTerciario = '#A0522D'; fondo = '#FFF3E0';
    }

    // ✅ FUNCIÓN GRADIENTE METÁLICO
    function crearGradienteMetalico(ctx, x1, y1, x2, y2, tipo) {
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        if (tipo === 'bronce') {
            grad.addColorStop(0, '#CD7F32'); grad.addColorStop(0.3, '#B87333'); grad.addColorStop(0.5, '#A0522D'); grad.addColorStop(0.7, '#B87333'); grad.addColorStop(1, '#CD7F32');
        } else if (tipo === 'plata') {
            grad.addColorStop(0, '#E8E8E8'); grad.addColorStop(0.3, '#C0C0C0'); grad.addColorStop(0.5, '#999999'); grad.addColorStop(0.7, '#C0C0C0'); grad.addColorStop(1, '#E8E8E8');
        } else if (tipo === 'oro') {
            grad.addColorStop(0, '#FFD700'); grad.addColorStop(0.3, '#FFA500'); grad.addColorStop(0.5, '#DAA520'); grad.addColorStop(0.7, '#FFA500'); grad.addColorStop(1, '#FFD700');
        } else if (tipo === 'platino') {
            grad.addColorStop(0, '#F0F0F0'); grad.addColorStop(0.3, '#E5E4E2'); grad.addColorStop(0.5, '#CCCCCC'); grad.addColorStop(0.7, '#E5E4E2'); grad.addColorStop(1, '#F0F0F0');
        }
        return grad;
    }

    // ✅ FUNCIÓN DIBUJAR ESTRELLA
    function dibujarEstrella(ctx, x, y, radioExterno, radioInterno, puntas, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        for (let i = 0; i < puntas * 2; i++) {
            const radio = i % 2 === 0 ? radioExterno : radioInterno;
            const angulo = (Math.PI / puntas) * i - Math.PI / 2;
            const px = x + Math.cos(angulo) * radio;
            const py = y + Math.sin(angulo) * radio;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    // 1. FONDO CON GRADIENTE RADIAL SUAVE
    const gradienteFondo = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 500);
    gradienteFondo.addColorStop(0, fondo);
    gradienteFondo.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradienteFondo;
    ctx.fillRect(0, 0, 800, 800);

    // 2. RAYS DECORATIVOS (EFECTO DE BRILLO)
    for (let i = 0; i < 16; i++) {
        const angulo = (Math.PI * 2 / 16) * i;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angulo);
        const gradRay = ctx.createLinearGradient(0, 0, 380, 0);
        gradRay.addColorStop(0, 'rgba(255,255,255,0)');
        gradRay.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        gradRay.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradRay;
        ctx.beginPath();
        ctx.moveTo(280, -15);
        ctx.lineTo(380, 0);
        ctx.lineTo(280, 15);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // 3. SOMBRA EXTERIOR (EFECTO 3D)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;

    // 4. CÍRCULO PRINCIPAL BLANCO
    ctx.beginPath();
    ctx.arc(centerX, centerY, radioPrincipal, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // RESET SOMBRA
    ctx.shadowColor = 'transparent';

    // 5. BORDE METÁLICO CON GRADIENTE (EFECTO RELIEVE)
    const gradienteBorde = crearGradienteMetalico(ctx, 0, 0, 800, 800, tipo);
    ctx.strokeStyle = gradienteBorde;
    ctx.lineWidth = 20;
    ctx.stroke();

    // 6. BORDE DECORATIVO INTERIOR (MÚLTIPLES CAPAS PARA EFECTO 3D)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 335, 0, Math.PI * 2);
    ctx.strokeStyle = colorSecundario;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 330, 0, Math.PI * 2);
    ctx.strokeStyle = colorTerciario;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 7. CÍRCULO INTERIOR CON GRADIENTE RADIAL (EFECTO CÚPULA)
    const gradienteInterior = ctx.createRadialGradient(centerX - 50, centerY - 50, 0, centerX, centerY, 280);
    gradienteInterior.addColorStop(0, '#ffffff');
    gradienteInterior.addColorStop(0.5, fondo);
    gradienteInterior.addColorStop(1, '#f0f0f0');
    ctx.beginPath();
    ctx.arc(centerX, centerY, 280, 0, Math.PI * 2);
    ctx.fillStyle = gradienteInterior;
    ctx.fill();

    // 8. ESTRELLAS DECORATIVAS (5 ESTRELLAS)
    const posicionesEstrellas = [
        { x: centerX, y: 140, radio: 38 },
        { x: centerX - 280, y: 280, radio: 28 },
        { x: centerX + 280, y: 280, radio: 28 },
        { x: centerX - 200, y: 580, radio: 28 },
        { x: centerX + 200, y: 580, radio: 28 }
    ];
    
    posicionesEstrellas.forEach(pos => {
        dibujarEstrella(ctx, pos.x, pos.y, pos.radio, pos.radio * 0.4, 5, colorSecundario);
    });

    // 9. EMOJI/ICONO PRINCIPAL CON EFECTO 3D
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 15;
    ctx.font = '180px "Segoe UI Emoji", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, centerX, 360);

    // RESET SOMBRA
    ctx.shadowColor = 'transparent';

    // 10. NOMBRE DEL NIVEL CON GRADIENTE METÁLICO
    ctx.font = 'bold 60px "Segoe UI", Arial';
    const gradienteTexto = crearGradienteMetalico(ctx, centerX - 200, 0, centerX + 200, 0, tipo);
    ctx.fillStyle = gradienteTexto;
    ctx.fillText(nivel, centerX, 500);

    // 11. LÍNEA DECORATIVA METÁLICA
    ctx.beginPath();
    ctx.moveTo(centerX - 150, 530);
    ctx.lineTo(centerX + 150, 530);
    ctx.strokeStyle = colorSecundario;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 12. NOMBRE DEL USUARIO (DOS PALABRAS - NOMBRE Y APELLIDO)
    ctx.font = 'bold 32px "Segoe UI", Arial';
    ctx.fillStyle = '#333333';
    var nombreCompleto = userData.nombre || 'Usuario';
    var partesNombre = nombreCompleto.trim().split(/\s+/);
    var nombreMostrar = partesNombre.length >= 2 ? partesNombre[0] + ' ' + partesNombre[1] : nombreCompleto;
    ctx.fillText(nombreMostrar, centerX, 590);

    // 13. FECHA DE EMISIÓN (MM/YYYY)
    var fecha = new Date();
    var mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    var anio = fecha.getFullYear().toString();
    var fechaFormato = mes + '/' + anio;
    
    ctx.font = '28px "Segoe UI", Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Emisión: ' + fechaFormato, centerX, 640);

    // 14. RAYOSHIELD PRO
    ctx.font = 'bold 24px "Segoe UI", Arial';
    ctx.fillStyle = '#999999';
    ctx.fillText('🛡️ RayoShield PRO', centerX, 690);

    // 15. BORDE FINAL EXTERIOR
    ctx.beginPath();
    ctx.arc(centerX, centerY, 345, 0, Math.PI * 2);
    ctx.strokeStyle = colorPrincipal;
    ctx.lineWidth = 2;
    ctx.stroke();

    return canvas.toDataURL('image/png', 1.0);
}

// ─────────────────────────────────────────────────────────────────────
// EXPORTAR FUNCIONES (UNA SOLA VEZ AL FINAL)
// ─────────────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
    window.generarHashCertificado = generarHashCertificado;
    window.generarCertificadoCaso = generarCertificadoCaso;
    window.generarCertificadoMaster = generarCertificadoMaster;
    window.descargarCertificadoMaster = descargarCertificadoMaster;
    window.generarInsigniaPNG = generarInsigniaPNG;
    console.log('✅ certificate-master.js v2.0 cargado - Con sello metálico');
}

