// ─────────────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - GENERADOR DE CERTIFICADOS PROFESIONAL
// ─────────────────────────────────────────────────────────────────────────────

async function generarCertificado(userData, examen, resultado) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Dimensiones (A4 horizontal en alta resolución)
    canvas.width = 2480;
    canvas.height = 1748;
    
    // ───────────────────────────────────────────────────────────────────────
    // FONDO
    // ───────────────────────────────────────────────────────────────────────
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Borde exterior decorativo
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 20;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 8;
    ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);
    
    // Esquinas decorativas
    const cornerSize = 100;
    ctx.fillStyle = '#2196F3';
    // Esquina superior izquierda
    ctx.beginPath();
    ctx.moveTo(55, 155);
    ctx.lineTo(55, 55);
    ctx.lineTo(155, 55);
    ctx.fill();
    // Esquina superior derecha
    ctx.beginPath();
    ctx.moveTo(canvas.width - 155, 55);
    ctx.lineTo(canvas.width - 55, 55);
    ctx.lineTo(canvas.width - 55, 155);
    ctx.fill();
    // Esquina inferior izquierda
    ctx.beginPath();
    ctx.moveTo(55, canvas.height - 155);
    ctx.lineTo(55, canvas.height - 55);
    ctx.lineTo(155, canvas.height - 55);
    ctx.fill();
    // Esquina inferior derecha
    ctx.beginPath();
    ctx.moveTo(canvas.width - 155, canvas.height - 55);
    ctx.lineTo(canvas.width - 55, canvas.height - 55);
    ctx.lineTo(canvas.width - 55, canvas.height - 155);
    ctx.fill();
    
    // ───────────────────────────────────────────────────────────────────────
    // ENCABEZADO
    // ───────────────────────────────────────────────────────────────────────
    
    // Logo (círculo con iniciales)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 280, 100, 0, Math.PI * 2);
    ctx.fillStyle = '#2196F3';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RS', canvas.width / 2, 280);
    
    // Título principal
    ctx.font = 'bold 90px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICADO DE APROBACIÓN', canvas.width / 2, 450);
    
    // Subtítulo
    ctx.font = 'italic 45px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('RayoShield Exam - Capacitación STPS', canvas.width / 2, 530);
    
    // Línea decorativa
    ctx.beginPath();
    ctx.moveTo(400, 580);
    ctx.lineTo(canvas.width - 400, 580);
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // ───────────────────────────────────────────────────────────────────────
    // DATOS DEL USUARIO
    // ───────────────────────────────────────────────────────────────────────
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    
    // Etiqueta
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#2196F3';
    ctx.fillText('Este certificado se otorga a:', canvas.width / 2 - 600, 680);
    
    // Nombre
    ctx.font = 'bold 70px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.nombre || 'Participante', canvas.width / 2, 780);
    
    // Línea debajo del nombre
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 500, 810);
    ctx.lineTo(canvas.width / 2 + 500, 810);
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Datos adicionales (en dos columnas)
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    
    const startY = 920;
    const lineHeight = 70;
    const leftX = canvas.width / 2 - 500;
    const rightX = canvas.width / 2 + 500;
    
    // Columna izquierda
    ctx.fillText(`CURP:`, leftX, startY);
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.curp || 'N/A', leftX + 150, startY);
    
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Empresa:`, leftX, startY + lineHeight);
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.empresa || 'N/A', leftX + 180, startY + lineHeight);
    
    // Columna derecha
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(`Puesto:`, rightX - 300, startY);
    ctx.font = 'bold 35px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(userData.puesto || 'N/A', rightX - 100, startY);
    
    // ───────────────────────────────────────────────────────────────────────
    // INFORMACIÓN DEL EXAMEN
    // ───────────────────────────────────────────────────────────────────────
    
    // Recuadro del examen
    ctx.fillStyle = '#E3F2FD';
    ctx.fillRect(canvas.width / 2 - 600, 1050, 1200, 250);
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.strokeRect(canvas.width / 2 - 600, 1050, 1200, 250);
    
    // Título del examen
    ctx.font = 'bold 45px Arial';
    ctx.fillStyle = '#1976D2';
    ctx.textAlign = 'center';
    ctx.fillText('Examen:', canvas.width / 2, 1120);
    
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText(examen.titulo, canvas.width / 2, 1200);
    
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(examen.norma, canvas.width / 2, 1260);
    
    // ───────────────────────────────────────────────────────────────────────
    // CALIFICACIÓN
    // ───────────────────────────────────────────────────────────────────────
    
    // Círculo de calificación
    const scoreX = canvas.width / 2;
    const scoreY = 1450;
    const scoreRadius = 150;
    
    // Fondo del círculo
    ctx.beginPath();
    ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
    ctx.fillStyle = resultado.estado === 'Aprobado' ? '#E8F5E9' : '#FFEBEE';
    ctx.fill();
    ctx.strokeStyle = resultado.estado === 'Aprobado' ? '#4CAF50' : '#f44336';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // Porcentaje
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = resultado.estado === 'Aprobado' ? '#4CAF50' : '#f44336';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${resultado.score}%`, scoreX, scoreY - 20);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('Calificación', scoreX, scoreY + 50);
    
    // ───────────────────────────────────────────────────────────────────────
    // FECHA Y FIRMA
    // ───────────────────────────────────────────────────────────────────────
    
    const fecha = new Date(resultado.fecha).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    ctx.font = '35px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText(`Fecha de emisión: ${fecha}`, canvas.width / 2, 1620);
    
    // ID único del certificado
    const hash = await generarHash(`${userData.nombre || 'user'}:${examen.id}:${resultado.score}:${Date.now()}`);
    ctx.font = '25px monospace';
    ctx.fillStyle = '#999';
    ctx.fillText(`ID Certificado: ${hash.substring(0, 24).toUpperCase()}`, canvas.width / 2, 1670);
    
    // Firma
    ctx.font = 'italic 35px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText('RayoShield - Seguridad Industrial', canvas.width / 2, 1720);
    
    // ───────────────────────────────────────────────────────────────────────
    // MARCA DE AGUA DEMO (si aplica)
    // ───────────────────────────────────────────────────────────────────────
    
    try {
        const licenciaData = localStorage.getItem('rayoshield_licencia');
        if (licenciaData) {
            const licencia = JSON.parse(licenciaData);
            if (licencia.tipo === 'DEMO') {
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(-Math.PI / 8);
                ctx.font = 'bold 120px Arial';
                ctx.fillStyle = 'rgba(255, 152, 0, 0.25)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('VERSIÓN DEMO', 0, 0);
                ctx.restore();
            }
        }
    } catch(e) {
        console.log('No se pudo verificar licencia para marca de agua');
    }
    
    // ───────────────────────────────────────────────────────────────────────
    // CONVERTIR A IMAGEN
    // ───────────────────────────────────────────────────────────────────────
    
    return canvas.toDataURL('image/png', 1.0);
}

// Generar hash para ID único
async function generarHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Descargar certificado
function descargarCertificado(imageUrl, filename = 'certificado.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageUrl;
    link.click();
}
