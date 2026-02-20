// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - GENERACIÓN DE CERTIFICADOS
// (Usa Canvas API para generar PNG)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera certificado como imagen PNG
 * @param {Object} userData - Datos del usuario
 * @param {Object} examen - Datos del examen
 * @param {Object} resultado - Resultado del examen
 * @returns {Promise<string>} - URL de la imagen generada
 */
async function generarCertificado(userData, examen, resultado) {
    // Crear canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones del certificado
    canvas.width = 1200;
    canvas.height = 800;
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde decorativo
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 3;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);
    
    // Título
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO ORTOGADO A', canvas.width / 2, 150);
    
    // Subtítulo
    ctx.font = '24px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('RayoShield Exam - Capacitación STPS', canvas.width / 2, 200);
    
    // Línea decorativa
    ctx.beginPath();
    ctx.moveTo(200, 230);
    ctx.lineTo(canvas.width - 200, 230);
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Nombre del usuario
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.nombre || 'Participante', canvas.width / 2, 320);
    
    // Texto descriptivo
    ctx.font = '20px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Ha completado exitosamente el examen de:', canvas.width / 2, 380);
    
    // Nombre del examen
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#2196F3';
    ctx.fillText(examen.titulo, canvas.width / 2, 430);
    
    // Norma
    ctx.font = '20px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(examen.norma, canvas.width / 2, 470);
    
    // Calificación
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = resultado.estado === 'Aprobado' ? '#4CAF50' : '#f44336';
    ctx.fillText(`Calificación: ${resultado.score}%`, canvas.width / 2, 550);
    
    // Fecha
    const fecha = new Date(resultado.fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    ctx.font = '18px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Fecha: ${fecha}`, canvas.width / 2, 600);
    
    // ID único (hash simple)
    const hash = await generarHash(`${userData.nombre || 'user'}:${examen.id}:${resultado.score}:${Date.now()}`);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText(`ID Certificado: ${hash.substring(0, 20)}...`, canvas.width / 2, 700);
    
    // Firma
    ctx.font = 'italic 16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('RayoShield - Seguridad Industrial', canvas.width / 2, 750);
    
    // 🆕 MARCA DE AGUA DEMO (si aplica)
    if (localStorage.getItem('rayoshield_licencia')) {
        const licencia = JSON.parse(localStorage.getItem('rayoshield_licencia'));
        if (licencia.tipo === 'DEMO') {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 6);
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
            ctx.textAlign = 'center';
            ctx.fillText('VERSIÓN DEMO', 0, 0);
            ctx.restore();
        }
    }

    // Convertir a URL de imagen
    return canvas.toDataURL('image/png');
}

/**
 * Genera hash simple para ID único
 * @param {string} text - Texto para hashear
 * @returns {Promise<string>} - Hash en hexadecimal
 */
async function generarHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Descarga el certificado como archivo PNG
 * @param {string} imageUrl - URL de la imagen
 * @param {string} filename - Nombre del archivo
 */
function descargarCertificado(imageUrl, filename = 'certificado.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    link.click();
}
