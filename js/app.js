// ─────────────────────────────────────────────────────────────────────
// RAYOSHIELD EXAM - app.js (v5.0 COMPLETA Y FUNCIONAL)
// Guardar con codificación UTF-8
// ─────────────────────────────────────────────────────────────────────

const app = {
    // =================================================================
    // ESTADO GENERAL
    // =================================================================
    examenActual: null,
    respuestasUsuario: [],
    preguntaActual: 0,
    resultadoActual: null,
    respuestaTemporal: null,
    modoActual: 'admin',
    trabajadorActual: null,
    userData: { empresa: '', nombre: '', curp: '', puesto: '' },
    licencia: { 
        tipo: 'DEMO', 
        clave: '', 
        clienteId: 'DEMO_USER', 
        expiracion: null, 
        examenesRestantes: 3, 
        features: {
            casosBasicos: true,
            casosMaster: false,
            casosElite: false,
            casosPericial: false,
            whiteLabel: false,
            predictivo: false,
            insignias: false,
            dashboard: false,
            multiUsuario: 0
        } 
    },

    // Firebase
    db: null,
    auth: null,
    currentUser: null,
    isAdmin: false,
    firebaseListo: false,
    empresaActual: null,
    colaSincronizacion: [],

    // Timers
    timerExamen: null,
    tiempoLimite: 30 * 60 * 1000,
    tiempoInicio: null,
    timerCaso: null,
    tiempoCasoLimite: 40 * 60 * 1000,
    examenGuardado: null,
    casoActual: null,
    respuestasCaso: {},
    resultadoCaso: null,
    deferredPrompt: null,

    // =================================================================
    // INICIALIZACIÓN
    // =================================================================
    init: function() {
        console.log('🚀 RayoShield v5.0 iniciado');
        
        // Inicializar contraseña admin local
        if (!localStorage.getItem('rayoshield_admin_password')) {
            localStorage.setItem('rayoshield_admin_password', 'admin123');
        }
        
        this.modoActual = 'admin';
        
        // CARGAR LICENCIA PRIMERO
        this.cargarLicencia();
        console.log('📋 Licencia cargada:', this.licencia.tipo, 'Expira:', this.licencia.expiracion);
        
        // Cargar demás datos
        this.cargarDatosUsuario();
        this.cargarHistorial();
        this.cargarExamenGuardado();
        
        // Inicializar MultiUsuario
        if (typeof MultiUsuario !== 'undefined') {
            MultiUsuario.init();
        }
        
        // Inicializar Firebase si está disponible
        if (typeof firebase !== 'undefined' && typeof db !== 'undefined') {
            this.db = db;
            this.auth = auth;
            this.firebaseListo = true;
            console.log('✅ Firebase conectado');
            
            if (!this._authListenerSet) {
                this._authListenerSet = true;
                this.auth.onAuthStateChanged(async (user) => {
                    this.currentUser = user;
                    if (user) {
                        try {
                            const adminDoc = await this.db.collection('admins').doc(user.uid).get();
                            this.isAdmin = adminDoc.exists;
                            if (this.isAdmin) {
                                await this.cargarEmpresaFirebase();
                            }
                        } catch(e) { 
                            console.warn('Error verificando admin:', e);
                            this.isAdmin = false;
                        }
                        this.verificarEnlaceAcceso();
                    } else {
                        this.isAdmin = false;
                    }
                    this.actualizarUI();
                    this.actualizarUIMenuPorRol();
                });
            }
        }
        
        // Verificar enlace en URL
        this.verificarEnlaceAcceso();
        
        // Inicializar PWA
        this.initPWAInstall();
        
        // Actualizar UI y mostrar pantalla
        this.actualizarUI();
        this.mostrarPantalla('home-screen');
        this.verificarExpiracionLicencia();
        this.actualizarBadgeTrabajadores();
        this.actualizarUIMenuPorRol();
        
        console.log('✅ Inicialización completa');
    },
    // =================================================================
    // NUEVA FUNCIONALIDAD: IMPORTAR EXCEL + GENERAR ZIP DE LICENCIAS
    // =================================================================
    importarExcelYGenerarLicencias: async function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.style.display = 'none';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!confirm(`¿Procesar "${file.name}" y generar licencias para todos los trabajadores?`)) return;

            try {
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    const data = new Uint8Array(ev.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet);

                    if (rows.length === 0) {
                        alert('❌ El Excel está vacío.');
                        return;
                    }

                    const zip = new JSZip();
                    let generados = 0;
                    const errores = [];

                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];

                        const nombre = String(row['Nombre Completo'] || row['Nombre'] || '').trim();
                        const curp = String(row['CURP'] || '').trim().toUpperCase();
                        const puesto = String(row['Puesto'] || row['Cargo'] || '').trim();
                        let numEmpleado = String(row['Número de Empleado'] || row['NumEmpleado'] || `EMP-${1000+i}`).trim();
                        const email = String(row['Email'] || '').trim();
                        const departamento = String(row['Departamento'] || '').trim();

                        if (!nombre || !curp || !puesto) {
                            errores.push(`Fila ${i+2}: Falta Nombre, CURP o Puesto`);
                            continue;
                        }

                        const trabajador = {
                            id: 'TRAB-' + Date.now().toString(36).toUpperCase() + i,
                            nombre: nombre,
                            curp: curp,
                            puesto: puesto,
                            numeroEmpleado: numEmpleado,
                            email: email,
                            departamento: departamento,
                            fecha_registro: new Date().toISOString(),
                            estado: 'activo'
                        };

                        // Guardar en MultiUsuario
                        if (typeof MultiUsuario !== 'undefined') {
                            MultiUsuario.addTrabajador(trabajador);
                        }

                        // Crear archivo .rshield
                        const licenciaData = {
                            tipo: "LICENCIA_TRABAJADOR",
                            version: "3.1",
                            licenciaId: `RSH-${Date.now().toString(36).toUpperCase()}`,
                            empresa: this.empresaActual?.nombre || "Mi Empresa",
                            trabajador: {
                                id: trabajador.id,
                                nombre: trabajador.nombre,
                                curp: trabajador.curp,
                                puesto: trabajador.puesto,
                                numeroEmpleado: trabajador.numeroEmpleado
                            },
                            plan: this.licencia.tipo || "PROFESIONAL",
                            fechaCreacion: new Date().toISOString(),
                            validezHasta: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
                            claveActivacion: Math.random().toString(36).substring(2, 15).toUpperCase()
                        };

                        const jsonStr = JSON.stringify(licenciaData, null, 2);
                        const filename = `${trabajador.nombre.replace(/[^a-zA-Z0-9áéíóúñ]/gi, '_')}_licencia.rshield`;

                        zip.file(filename, jsonStr);
                        generados++;
                    }

                    if (generados > 0) {
                        const zipBlob = await zip.generateAsync({ type: "blob" });
                        const url = URL.createObjectURL(zipBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Licencias_RayoShield_${new Date().toISOString().slice(0,10)}.zip`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        alert(`✅ ¡Éxito!\n${generados} archivos de licencia generados.\nDescargando ZIP...`);
                        this.renderTrabajadores();
                    }

                    if (errores.length > 0) {
                        console.warn('Errores:', errores);
                        alert(`⚠️ Se generaron ${generados} licencias.\n${errores.length} filas con errores.`);
                    }
                };

                reader.readAsArrayBuffer(file);
            } catch (err) {
                console.error(err);
                alert('❌ Error al procesar el Excel: ' + err.message);
            }
        };

        input.click();
    },
    // =================================================================
    // IMPORTAR LICENCIA DESDE ARCHIVO .rshield (LADO TRABAJADOR)
    // Versión corregida - Sin optional chaining
    // =================================================================
    importarLicenciaTrabajador = async function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.rshield,.json';
        input.style.display = 'none';
    
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
    
            try {
                const text = await file.text();
                const licencia = JSON.parse(text);
    
                // Validación básica
                if (!licencia || licencia.tipo !== "LICENCIA_TRABAJADOR" || !licencia.trabajador) {
                    alert('❌ Archivo de licencia inválido o corrupto.');
                    return;
                }
    
                if (!licencia.trabajador.nombre || !licencia.trabajador.curp) {
                    alert('❌ El archivo no contiene los datos completos del trabajador.');
                    return;
                }
    
                // Activar el plan de la licencia
                const planActivado = licencia.plan || 'PROFESIONAL';
    
                this.licencia = {
                    tipo: planActivado,
                    clave: licencia.licenciaId || '',
                    clienteId: licencia.empresa || 'EMPRESA',
                    expiracion: licencia.validezHasta || null,
                    examenesRestantes: 9999,
                    features: this.obtenerFeaturesPorTipo(planActivado)
                };
    
                // Guardar datos del trabajador
                this.userData = {
                    empresa: licencia.empresa || '',
                    nombre: licencia.trabajador.nombre,
                    curp: licencia.trabajador.curp,
                    puesto: licencia.trabajador.puesto || ''
                };
    
                // Guardar como trabajador actual
                localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify({
                    id: licencia.trabajador.id || 'TRAB-' + Date.now(),
                    nombre: licencia.trabajador.nombre,
                    curp: licencia.trabajador.curp,
                    puesto: licencia.trabajador.puesto || ''
                }));
    
                this.guardarLicencia();
                this.guardarDatosUsuario();
    
                alert(`✅ ¡Licencia importada correctamente!\n\n` +
                      `Nombre: ${licencia.trabajador.nombre}\n` +
                      `Plan activado: ${planActivado}\n\n` +
                      `Ya puedes realizar los exámenes según el plan de tu empresa.`);
    
                // Actualizar interfaz
                this.actualizarUI();
                this.actualizarUIMenuPorRol();
                this.mostrarPantalla('home-screen');
    
            } catch (err) {
                console.error('Error al importar licencia:', err);
                alert('❌ Error al leer el archivo.\n\nAsegúrate de que sea un archivo .rshield válido.');
            }
        };
    
        input.click();
    };
    // =================================================================
    // LICENCIA - FUNCIONES COMPLETAS
    // =================================================================
    cargarLicencia: function() {
        try {
            const s = localStorage.getItem('rayoshield_licencia');
            if (s) {
                const parsed = JSON.parse(s);
                if (parsed.tipo) {
                    this.licencia = parsed;
                    // Asegurar que features exista
                    if (!this.licencia.features) {
                        this.licencia.features = this.obtenerFeaturesPorTipo(this.licencia.tipo);
                    }
                    console.log('📋 Licencia cargada desde localStorage:', this.licencia.tipo);
                }
            }
        } catch(e) { 
            console.warn('Error cargando licencia:', e);
        }
        
        // Si no hay licencia o es DEMO, asegurar features correctos
        if (!this.licencia.features || Object.keys(this.licencia.features).length === 0) {
            this.licencia.features = this.obtenerFeaturesPorTipo(this.licencia.tipo);
        }
    },
    
    obtenerFeaturesPorTipo: function(tipo) {
        const featuresMap = {
            'DEMO': {
                casosBasicos: true,
                casosMaster: false,
                casosElite: false,
                casosPericial: false,
                whiteLabel: false,
                predictivo: false,
                insignias: false,
                dashboard: false,
                multiUsuario: 0
            },
            'PROFESIONAL': {
                casosBasicos: true,
                casosMaster: true,
                casosElite: false,
                casosPericial: false,
                whiteLabel: false,
                predictivo: false,
                insignias: false,
                dashboard: false,
                multiUsuario: 0
            },
            'CONSULTOR': {
                casosBasicos: true,
                casosMaster: true,
                casosElite: true,
                casosPericial: false,
                whiteLabel: false,
                predictivo: false,
                insignias: true,
                dashboard: 'basico',
                multiUsuario: 0
            },
            'EMPRESARIAL': {
                casosBasicos: true,
                casosMaster: true,
                casosElite: true,
                casosPericial: true,
                whiteLabel: true,
                predictivo: true,
                insignias: true,
                dashboard: 'predictivo',
                multiUsuario: 50
            }
        };
        return featuresMap[tipo] || featuresMap['DEMO'];
    },
    
    guardarLicencia: function() {
        localStorage.setItem('rayoshield_licencia', JSON.stringify(this.licencia));
        this.actualizarUI();
        console.log('💾 Licencia guardada:', this.licencia.tipo);
    },
    
    verificarExpiracionLicencia: function() {
        if (this.licencia.expiracion && this.licencia.tipo !== 'DEMO') {
            const ahora = new Date();
            const expiracion = new Date(this.licencia.expiracion);
            if (ahora > expiracion) {
                console.log('⚠️ Licencia expirada, cambiando a DEMO');
                this.licencia = {
                    tipo: 'DEMO',
                    clave: '',
                    clienteId: 'DEMO_USER',
                    expiracion: null,
                    examenesRestantes: 3,
                    features: this.obtenerFeaturesPorTipo('DEMO')
                };
                this.guardarLicencia();
                alert('⚠️ Tu licencia ha expirado. Has vuelto a la versión DEMO.');
            } else {
                const diasRestantes = Math.ceil((expiracion - ahora) / (1000 * 60 * 60 * 24));
                if (diasRestantes <= 7) {
                    console.log(`⚠️ Licencia expira en ${diasRestantes} días`);
                }
            }
        }
    },
    
    validarLicencia: function(clienteId, clave) {
        return new Promise((resolve) => {
            // Validar formato
            if (!/^RS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(clave)) {
                resolve({ valido: false, error: 'Formato: RS-XXXX-YYYY-ZZZZ' });
                return;
            }
            if (!/^[A-Z0-9_-]{5,}$/i.test(clienteId)) {
                resolve({ valido: false, error: 'ID: mínimo 5 caracteres' });
                return;
            }
            
            const licenciasValidas = {
                'RS-DEMO-2026-DEMO': {
                    clienteId: 'DEMO_USER',
                    tipo: 'DEMO',
                    duracion: 1,
                    features: this.obtenerFeaturesPorTipo('DEMO')
                },
                'RS-PKDF-9826-A1B2': {
                    clienteId: 'PROFESIONAL_001',
                    tipo: 'PROFESIONAL',
                    duracion: 365,
                    features: this.obtenerFeaturesPorTipo('PROFESIONAL')
                },
                'RS-COZS-2XT6-C3D4': {
                    clienteId: 'CONSULTOR_001',
                    tipo: 'CONSULTOR',
                    duracion: 365,
                    features: this.obtenerFeaturesPorTipo('CONSULTOR')
                },
                'RS-EVP4-Y02I-E5F6': {
                    clienteId: 'EMPRESARIAL_001',
                    tipo: 'EMPRESARIAL',
                    duracion: 365,
                    features: this.obtenerFeaturesPorTipo('EMPRESARIAL')
                }
            };
            
            const licenciaData = licenciasValidas[clave.toUpperCase()];
            if (!licenciaData) {
                resolve({ valido: false, error: 'Clave inválida' });
                return;
            }
            if (licenciaData.clienteId.toUpperCase() !== clienteId.toUpperCase()) {
                resolve({ valido: false, error: 'ID no coincide con esta clave' });
                return;
            }
            
            const expiracion = new Date();
            expiracion.setDate(expiracion.getDate() + licenciaData.duracion);
            
            resolve({
                valido: true,
                tipo: licenciaData.tipo,
                clienteId: licenciaData.clienteId,
                expiracion: expiracion.toISOString(),
                features: licenciaData.features
            });
        });
    },
    
    activarLicencia: function() {
        const idEl = document.getElementById('license-id');
        const keyEl = document.getElementById('license-key');
        const clienteId = idEl ? idEl.value.trim().toUpperCase() : '';
        const clave = keyEl ? keyEl.value.trim().toUpperCase() : '';
        
        if (!clienteId || !clave) {
            alert('⚠️ Ingresa ID y clave');
            return;
        }
        
        // Verificar si ya tiene licencia activa
        if (this.licencia.tipo !== 'DEMO' && this.licencia.expiracion) {
            const hoy = new Date();
            const vence = new Date(this.licencia.expiracion);
            if (hoy < vence) {
                if (this.licencia.clave === clave) {
                    alert(`✅ Esta licencia ya está activa.\nVence: ${vence.toLocaleDateString('es-MX')}`);
                    return;
                } else {
                    if (!confirm(`⚠️ Ya tienes una licencia activa hasta ${vence.toLocaleDateString('es-MX')}.\n¿Deseas reemplazarla?`)) {
                        return;
                    }
                }
            }
        }
        
        const btn = event ? event.target : null;
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Validando...';
        }
        
        this.validarLicencia(clienteId, clave).then((res) => {
            if (btn) {
                btn.disabled = false;
                btn.textContent = '🔓 Activar Licencia';
            }
            
            if (res.valido) {
                this.licencia = {
                    tipo: res.tipo,
                    clave: clave,
                    clienteId: res.clienteId,
                    expiracion: res.expiracion,
                    examenesRestantes: 9999,
                    features: res.features
                };
                this.guardarLicencia();
                
                const fecha = new Date(res.expiracion).toLocaleDateString('es-MX');
                alert(`✅ Licencia ${res.tipo} activada\nCliente: ${res.clienteId}\nVálida hasta: ${fecha}`);
                
                if (idEl) idEl.value = '';
                if (keyEl) keyEl.value = '';
                this.actualizarUI();
                location.reload();
            } else {
                alert('❌ ' + res.error);
            }
        });
    },
    
    activarLicenciaConPlan: function(plan) {
        const datos = {
            'PROFESIONAL': { id: 'PROFESIONAL_001', clave: 'RS-PKDF-9826-A1B2' },
            'CONSULTOR': { id: 'CONSULTOR_001', clave: 'RS-COZS-2XT6-C3D4' },
            'EMPRESARIAL': { id: 'EMPRESARIAL_001', clave: 'RS-EVP4-Y02I-E5F6' }
        };
        
        if (!datos[plan]) {
            alert('❌ Plan no válido');
            return;
        }
        
        const idEl = document.getElementById('license-id');
        const keyEl = document.getElementById('license-key');
        if (idEl) idEl.value = datos[plan].id;
        if (keyEl) keyEl.value = datos[plan].clave;
        
        // Resaltar campos
        if (idEl) idEl.style.borderColor = 'var(--blue)';
        if (keyEl) keyEl.style.borderColor = 'var(--blue)';
        setTimeout(() => {
            if (idEl) idEl.style.borderColor = 'var(--border)';
            if (keyEl) keyEl.style.borderColor = 'var(--border)';
        }, 2000);
        
        document.getElementById('activar-licencia-section')?.scrollIntoView({ behavior: 'smooth' });
    },
    
    actualizarLicenciaUI: function() {
        // Pantalla de licencia
        const planEl = document.getElementById('licencia-screen-plan');
        if (planEl) planEl.textContent = this.licencia.tipo;
        
        const clienteEl = document.getElementById('licencia-screen-cliente');
        if (clienteEl) clienteEl.textContent = this.licencia.clienteId || 'N/A';
        
        const expiryEl = document.getElementById('licencia-screen-expiry');
        const daysEl = document.getElementById('licencia-screen-days');
        
        if (expiryEl) {
            if (this.licencia.expiracion) {
                const exp = new Date(this.licencia.expiracion);
                expiryEl.textContent = exp.toLocaleDateString('es-MX');
                
                const ahora = new Date();
                const dias = Math.ceil((exp - ahora) / (1000 * 60 * 60 * 24));
                if (daysEl) {
                    if (dias > 0) {
                        daysEl.textContent = `${dias} días restantes`;
                        daysEl.style.color = dias > 7 ? 'var(--green)' : 'var(--amber)';
                    } else {
                        daysEl.textContent = 'Expirada';
                        daysEl.style.color = 'var(--rose)';
                    }
                }
            } else {
                expiryEl.textContent = 'Sin expiración';
                if (daysEl) {
                    daysEl.textContent = 'Licencia permanente';
                    daysEl.style.color = 'var(--green)';
                }
            }
        }
        
        // Características
        const featuresEl = document.getElementById('licencia-features');
        if (featuresEl) {
            const features = this.licencia.features || {};
            let html = '';
            if (features.casosBasicos) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos BÁSICOS</div>';
            if (features.casosMaster) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos MASTER</div>';
            if (features.casosElite) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos ELITE</div>';
            if (features.casosPericial) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Casos PERICIAL</div>';
            if (features.insignias) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Insignias PNG</div>';
            if (features.dashboard) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Dashboard ' + features.dashboard + '</div>';
            if (features.predictivo) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> Riesgo Predictivo</div>';
            if (features.whiteLabel) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> White Label</div>';
            if (features.multiUsuario) html += '<div style="font-size:12px;color:var(--green);display:flex;gap:6px;align-items:center;"><span>✓</span> ' + features.multiUsuario + ' Trabajadores</div>';
            if (html === '') html = '<div style="font-size:12px;color:var(--ink4);">Plan DEMO - Características básicas</div>';
            featuresEl.innerHTML = html;
        }
    },

    // =================================================================
    // 🔥 FIREBASE
    // =================================================================
    cargarEmpresaFirebase: async function() {
        if (!this.firebaseListo || !this.currentUser) return;
        try {
            const querySnapshot = await this.db.collection('empresas')
                .where('adminId', '==', this.currentUser.uid)
                .limit(1)
                .get();
            if (!querySnapshot.empty) {
                this.empresaActual = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                console.log('✅ Empresa cargada:', this.empresaActual.nombre);
            }
        } catch(e) { console.error('Error cargando empresa:', e); }
    },

    // =================================================================
    // 🔗 GENERAR ENLACE PARA TRABAJADOR
    // =================================================================
    generarEnlaceTrabajador: async function(nombre, curp, puesto, email = '') {
        if (!this.firebaseListo) {
            alert('❌ Firebase no disponible');
            return null;
        }
        if (!this.isAdmin && !this.verificarPasswordAdmin()) {
            alert('❌ Solo administradores');
            return null;
        }
        
        try {
            const codigoAcceso = Math.random().toString(36).substring(2, 10).toUpperCase();
            const fechaExpiracion = new Date();
            fechaExpiracion.setDate(fechaExpiracion.getDate() + 7);
            
            const trabajadorData = {
                nombre: nombre.trim(),
                curp: curp.trim().toUpperCase(),
                puesto: puesto.trim(),
                email: email.trim(),
                empresaId: this.empresaActual?.id || null,
                codigoAcceso: codigoAcceso,
                fechaExpiracionCodigo: firebase.firestore.Timestamp.fromDate(fechaExpiracion),
                estado: 'activo',
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await this.db.collection('trabajadores').add(trabajadorData);
            const trabajadorId = docRef.id;
            
            const baseUrl = window.location.origin + window.location.pathname;
            const enlace = `${baseUrl}?access=${trabajadorId}&code=${codigoAcceso}`;
            
            // Backup local
            const trabajadores = MultiUsuario.getTrabajadores();
            trabajadores.push({
                id: trabajadorId,
                nombre: nombre.trim(),
                curp: curp.trim().toUpperCase(),
                puesto: puesto.trim(),
                email: email.trim(),
                fecha_registro: new Date().toISOString(),
                estado: 'activo'
            });
            localStorage.setItem('rayoshield_trabajadores', JSON.stringify(trabajadores));
            
            console.log('✅ Enlace generado:', enlace);
            return {
                success: true,
                enlace: enlace,
                codigo: codigoAcceso,
                trabajadorId: trabajadorId,
                expira: fechaExpiracion.toLocaleDateString('es-MX')
            };
        } catch(error) {
            console.error('❌ Error:', error);
            alert('Error: ' + error.message);
            return null;
        }
    },

    mostrarPanelGenerarEnlace: function() {
        if (!this.isAdmin && !this.verificarPasswordAdmin()) {
            alert('⚠️ Solo administradores');
            return;
        }
        
        const modalHtml = `
            <div id="modal-generar-enlace" class="modal active" style="display:flex;">
                <div class="modal-content" style="max-width:500px;">
                    <div class="modal-header">
                        <div class="modal-title">🔗 Generar Enlace para Trabajador</div>
                        <button class="modal-close" onclick="document.getElementById('modal-generar-enlace').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>👤 Nombre Completo *</label>
                            <input type="text" id="invite-nombre" class="df-input" placeholder="Ej: Juan Pérez García">
                        </div>
                        <div class="form-group">
                            <label>🆔 CURP *</label>
                            <input type="text" id="invite-curp" class="df-input" placeholder="PEPJ850101HDFRRR09" style="text-transform:uppercase">
                        </div>
                        <div class="form-group">
                            <label>💼 Puesto *</label>
                            <input type="text" id="invite-puesto" class="df-input" placeholder="Ej: Técnico Eléctrico">
                        </div>
                        <div class="form-group">
                            <label>📧 Email (opcional)</label>
                            <input type="email" id="invite-email" class="df-input" placeholder="juan@empresa.com">
                        </div>
                        <div id="enlace-generado" style="display:none; margin-top:15px; padding:12px; background:var(--green-l); border-radius:8px;">
                            <strong>✅ Enlace generado (válido por 7 días):</strong><br>
                            <code id="link-code" style="word-break:break-all; font-size:12px;"></code>
                            <div style="display:flex; gap:10px; margin-top:10px;">
                                <button onclick="app.copiarEnlace()" class="btn btn-secondary" style="flex:1;">📋 Copiar</button>
                                <button onclick="app.enviarPorWhatsApp()" class="btn btn-primary" style="flex:1;">📱 Enviar WhatsApp</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button onclick="document.getElementById('modal-generar-enlace').remove()" class="topbar-btn ghost">Cancelar</button>
                        <button onclick="app.ejecutarGenerarEnlace()" class="topbar-btn primary">🔗 Generar Enlace</button>
                    </div>
                </div>
            </div>
        `;
        
        const existing = document.getElementById('modal-generar-enlace');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },
    
    ejecutarGenerarEnlace: async function() {
        const nombre = document.getElementById('invite-nombre')?.value.trim();
        const curp = document.getElementById('invite-curp')?.value.trim();
        const puesto = document.getElementById('invite-puesto')?.value.trim();
        const email = document.getElementById('invite-email')?.value.trim();
        
        if (!nombre || !curp || !puesto) {
            alert('⚠️ Completa todos los campos obligatorios');
            return;
        }
        
        const btn = event.target;
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Generando...';
        
        const resultado = await this.generarEnlaceTrabajador(nombre, curp, puesto, email);
        
        btn.disabled = false;
        btn.textContent = originalText;
        
        if (resultado && resultado.success) {
            document.getElementById('enlace-generado').style.display = 'block';
            document.getElementById('link-code').textContent = resultado.enlace;
            this._ultimoEnlace = resultado.enlace;
        }
    },
    
    copiarEnlace: function() {
        if (this._ultimoEnlace) {
            navigator.clipboard.writeText(this._ultimoEnlace);
            alert('✅ Enlace copiado al portapapeles');
        }
    },
    
    enviarPorWhatsApp: function() {
        if (this._ultimoEnlace) {
            const texto = `📋 *RayoShield Exam* - Acceso a plataforma\n\nHaz clic en el siguiente enlace para realizar tus exámenes:\n\n${this._ultimoEnlace}\n\nEste enlace es personal e intransferible. Válido por 7 días.`;
            window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
        }
    },

    verificarEnlaceAcceso: async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const trabajadorId = urlParams.get('access');
        const codigo = urlParams.get('code');
        
        if (!trabajadorId || !codigo) return false;
        
        console.log('🔍 Verificando enlace de acceso...');
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (!this.firebaseListo) {
            alert('❌ Firebase no disponible');
            return false;
        }
        
        try {
            const doc = await this.db.collection('trabajadores').doc(trabajadorId).get();
            if (!doc.exists) {
                alert('❌ Enlace inválido: Trabajador no encontrado.');
                return false;
            }
            
            const data = doc.data();
            if (data.codigoAcceso !== codigo) {
                alert('❌ Enlace inválido: Código de acceso incorrecto.');
                return false;
            }
            if (data.fechaExpiracionCodigo?.toDate() < new Date()) {
                alert('❌ Enlace expirado. Solicita uno nuevo al administrador.');
                return false;
            }
            if (data.estado !== 'activo') {
                alert('❌ Cuenta inactiva. Contacta al administrador.');
                return false;
            }
            
            if (!this.currentUser) {
                await this.auth.signInAnonymously();
                console.log('✅ Autenticación anónima exitosa');
            }
            
            localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify({
                id: trabajadorId,
                uid: this.currentUser?.uid,
                nombre: data.nombre,
                curp: data.curp,
                puesto: data.puesto,
                empresaId: data.empresaId
            }));
            
            this.modoActual = 'trabajador';
            this.userData = {
                empresa: data.empresaId || '',
                nombre: data.nombre,
                curp: data.curp,
                puesto: data.puesto
            };
            this.guardarDatosUsuario();
            
            alert(`✅ Bienvenido ${data.nombre}\n\nHas accedido correctamente a la plataforma.`);
            this.actualizarUI();
            this.actualizarUIMenuPorRol();
            this.mostrarPantalla('home-screen');
            return true;
        } catch(error) {
            console.error('❌ Error:', error);
            alert('Error al validar el acceso');
            return false;
        }
    },

    // =================================================================
    // DATOS DE USUARIO
    // =================================================================
    cargarDatosUsuario: function() {
        try {
            const s = localStorage.getItem('rayoshield_usuario');
            if (s) this.userData = JSON.parse(s);
        } catch(e) {}
    },
    
    guardarDatosUsuario: function() {
        localStorage.setItem('rayoshield_usuario', JSON.stringify(this.userData));
        this.actualizarUI();
    },
    
    guardarDatosUsuarioForm: function() {
        const empresa = document.getElementById('user-empresa')?.value.trim();
        const nombre = document.getElementById('user-nombre')?.value.trim();
        const curp = document.getElementById('user-curp')?.value.trim().toUpperCase();
        const puesto = document.getElementById('user-puesto')?.value.trim();
        if (!empresa || !nombre || !curp || !puesto) {
            alert('Completa todos los campos');
            return;
        }
        this.userData = { empresa, nombre, curp, puesto };
        this.guardarDatosUsuario();
        alert('Datos guardados');
        this.volverHome();
    },
    
    cargarHistorial: function() {
        console.log('Historial:', this.obtenerHistorial().length, 'registros');
    },
    
    cargarExamenGuardado: function() {
        try {
            const s = localStorage.getItem('rayoshield_progreso');
            if (s) this.examenGuardado = JSON.parse(s);
        } catch(e) {}
    },
    
    obtenerHistorial: function() {
        try {
            const h = localStorage.getItem('rayoshield_historial');
            return h ? JSON.parse(h) : [];
        } catch(e) { return []; }
    },
    
    guardarEnHistorial: function() {
        const hist = this.obtenerHistorial();
        const t = this.obtenerTrabajadorActual();
        hist.push({
            examen: this.examenActual?.titulo || 'Desconocido',
            norma: this.examenActual?.norma || '',
            score: this.resultadoActual?.score || 0,
            estado: this.resultadoActual?.estado || '',
            fecha: new Date().toISOString(),
            usuario: t ? t.nombre : this.userData.nombre,
            tipoUsuario: t ? 'trabajador' : 'admin',
            trabajadorId: t?.id || null
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
        
        // Guardar en Firebase si es posible
        if (this.resultadoActual) {
            this.guardarResultadoFirebase({
                tipo: 'examen',
                actividad: this.examenActual?.titulo,
                puntaje: this.resultadoActual.score,
                aprobado: this.resultadoActual.estado === 'Aprobado'
            });
        }
    },
    
    guardarResultadoFirebase: async function(resultado) {
        if (!this.firebaseListo) return;
        const t = this.obtenerTrabajadorActual();
        if (!t) return;
        
        try {
            await this.db.collection('resultados').add({
                trabajadorId: t.id,
                trabajadorNombre: t.nombre,
                trabajadorCurp: t.curp,
                tipo: resultado.tipo || 'examen',
                actividad: resultado.actividad || 'Examen',
                puntaje: resultado.puntaje || 0,
                aprobado: resultado.aprobado || false,
                fecha: new Date().toISOString(),
                fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Resultado sincronizado con Firebase');
        } catch(e) {
            console.warn('⚠️ Offline, guardando en cola');
            this.colaSincronizacion.push(resultado);
            localStorage.setItem('rayoshield_cola_sync', JSON.stringify(this.colaSincronizacion));
        }
    },
    
    obtenerTrabajadorActual: function() {
        return JSON.parse(localStorage.getItem('rayoshield_trabajador_actual') || 'null');
    },

    // =================================================================
    // NAVEGACIÓN
    // =================================================================
    mostrarPantalla: function(id) {
        const restringidas = ['license-screen', 'trabajadores-screen', 'info-screen'];
        if (this.esTrabajador() && restringidas.includes(id)) {
            alert('Acceso denegado');
            return;
        }
        if (this.timerExamen && id !== 'exam-screen') {
            clearInterval(this.timerExamen);
            this.timerExamen = null;
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('active');
    },
    
    volverHome: function() {
        if (this.timerExamen) clearInterval(this.timerExamen);
        if (this.timerCaso) clearInterval(this.timerCaso);
        this.examenActual = null;
        this.mostrarPantalla('home-screen');
    },
    
    mostrarLicencia: function() {
        if (!this.verificarAccesoAdmin('mostrarLicencia')) return;
        this.actualizarLicenciaUI();
        this.mostrarPantalla('license-screen');
    },
    
    mostrarInfo: function() {
        if (!this.verificarAccesoAdmin('mostrarInfo')) return;
        this.mostrarPantalla('info-screen');
    },
    
    mostrarTrabajadores: function() {
        if (!this.verificarAccesoAdmin('mostrarTrabajadores')) return;
        this.renderTrabajadores();
        this.mostrarPantalla('trabajadores-screen');
    },
    
    mostrarPerfil: function() {
        if (this.esTrabajador()) {
            alert('Solo administradores');
            return;
        }
        this.actualizarPerfil();
        this.mostrarPantalla('perfil-screen');
    },
    
    mostrarHistorial: function() {
        this.renderHistorial();
        this.llenarFiltroTrabajadoresHistorial();
        this.mostrarPantalla('history-screen');
    },
    
    mostrarDatosUsuario: function() {
        const e = document.getElementById('user-empresa');
        const n = document.getElementById('user-nombre');
        const c = document.getElementById('user-curp');
        const p = document.getElementById('user-puesto');
        if (e) e.value = this.userData.empresa || '';
        if (n) n.value = this.userData.nombre || '';
        if (c) c.value = this.userData.curp || '';
        if (p) p.value = this.userData.puesto || '';
        this.mostrarPantalla('user-data-screen');
    },
    
    editarPerfil: function() {
        this.mostrarDatosUsuario();
    },

    // =================================================================
    // EXÁMENES
    // =================================================================
    irASeleccionarExamen: function() {
        if (!this.userData.empresa || !this.userData.nombre) {
            alert('Completa tus datos primero');
            this.mostrarDatosUsuario();
            return;
        }
        if (this.licencia.tipo === 'DEMO' && this.licencia.examenesRestantes <= 0) {
            alert('Límite DEMO alcanzado');
            return;
        }
        
        const container = document.getElementById('categorias-list');
        if (!container) return;
        container.innerHTML = '';
        
        if (typeof CATEGORIAS !== 'undefined') {
            CATEGORIAS.forEach(cat => {
                const div = document.createElement('div');
                div.className = 'exam-item';
                div.innerHTML = `<h4>${cat.icono} ${cat.nombre}</h4><p>${cat.norma}</p><small>${cat.descripcion}</small>`;
                div.onclick = () => this.mostrarNiveles(cat);
                container.appendChild(div);
            });
        }
        
        document.getElementById('categorias-view').style.display = 'block';
        document.getElementById('niveles-view').style.display = 'none';
        this.mostrarPantalla('select-exam-screen');
    },
    
    mostrarNiveles: function(categoria) {
        document.getElementById('categorias-view').style.display = 'none';
        document.getElementById('niveles-view').style.display = 'block';
        document.getElementById('categoria-titulo').textContent = `${categoria.icono} ${categoria.nombre}`;
        document.getElementById('categoria-norma').textContent = categoria.norma;
        
        const container = document.getElementById('niveles-list');
        container.innerHTML = '';
        categoria.niveles.forEach(nivel => {
            const div = document.createElement('div');
            div.className = 'nivel-item';
            div.innerHTML = `<div><h4>👤 ${nivel.nombre}</h4><p>${nivel.preguntas} preguntas</p></div>`;
            div.onclick = () => this.iniciarExamen(nivel.examId);
            container.appendChild(div);
        });
    },
    
    volverACategorias: function() {
        document.getElementById('categorias-view').style.display = 'block';
        document.getElementById('niveles-view').style.display = 'none';
    },
    
    iniciarExamen: function(examId) {
        if (typeof cargarExamen !== 'function') {
            alert('Error: Función cargarExamen no definida');
            return;
        }
        cargarExamen(examId).then(exam => {
            this.examenActual = exam;
            this.respuestasUsuario = [];
            this.preguntaActual = 0;
            this.resultadoActual = null;
            this.respuestaTemporal = null;
            const titleEl = document.getElementById('exam-title');
            const normaEl = document.getElementById('exam-norma');
            if (titleEl) titleEl.textContent = exam.titulo;
            if (normaEl) normaEl.textContent = exam.norma;
            this.detenerTimer();
            this.iniciarTimerExamen();
            this.mostrarPantalla('exam-screen');
            this.mostrarPregunta();
            this.guardarExamenProgreso();
        }).catch(() => alert('Error cargando examen'));
    },
    
    mostrarPregunta: function() {
        if (!this.examenActual) return;
        const p = this.examenActual.preguntas[this.preguntaActual];
        const total = this.examenActual.preguntas.length;
        const progreso = ((this.preguntaActual + 1) / total) * 100;
        
        const bar = document.getElementById('progress-bar');
        if (bar) bar.innerHTML = `<div class="progress-bar-fill" style="width:${progreso}%"></div>`;
        const progressText = document.getElementById('progress-text');
        if (progressText) progressText.textContent = `Pregunta ${this.preguntaActual + 1} de ${total}`;
        const questionText = document.getElementById('question-text');
        if (questionText) questionText.textContent = p.texto;
        
        const container = document.getElementById('options-container');
        if (!container) return;
        container.innerHTML = '';
        
        p.opciones.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = `option-btn${this.respuestaTemporal === idx ? ' selected' : ''}`;
            btn.innerHTML = `<strong style="margin-right:10px;">${String.fromCharCode(65 + idx)})</strong> ${opt}`;
            btn.onclick = () => this.seleccionarRespuesta(idx);
            container.appendChild(btn);
        });
        
        if (this.respuestaTemporal !== null) {
            const btnC = document.createElement('button');
            btnC.className = 'btn-continuar';
            btnC.textContent = '➜ Continuar';
            btnC.onclick = () => this.confirmarRespuesta();
            container.appendChild(btnC);
        }
    },
    
    seleccionarRespuesta: function(idx) {
        this.respuestaTemporal = idx;
        this.mostrarPregunta();
    },
    
    confirmarRespuesta: function() {
        if (this.respuestaTemporal === null) return;
        if (this.preguntaActual === this.examenActual.preguntas.length - 1 && !confirm('¿Finalizar examen?')) return;
        
        this.respuestasUsuario.push(this.respuestaTemporal);
        this.respuestaTemporal = null;
        this.preguntaActual++;
        this.guardarExamenProgreso();
        
        if (this.preguntaActual < this.examenActual.preguntas.length) {
            this.mostrarPregunta();
        } else {
            this.detenerTimer();
            this.mostrarResultado();
            this.eliminarExamenGuardado();
        }
    },
  iniciarTimerCaso: function() {
        // Crear elemento del timer si no existe
        this.crearTimerCaso();
        
        // Si ya hay un timer activo, detenerlo primero
        if (this.timerCaso) {
            clearInterval(this.timerCaso);
            this.timerCaso = null;
        }
        
        // Duración del caso en milisegundos (40 minutos por defecto)
        let duracionMinutos = 40;
        if (this.casoActual && this.casoActual.tiempo_estimado) {
            const match = this.casoActual.tiempo_estimado.match(/(\d+)/);
            if (match) duracionMinutos = parseInt(match[1]);
        }
        
        const duracionMs = duracionMinutos * 60 * 1000;
        this.tiempoCasoInicio = Date.now();
        this.tiempoCasoRestante = duracionMs;
        
        const timerEl = document.getElementById('caso-timer');
        const self = this;
        
        this.timerCaso = setInterval(function() {
            self.tiempoCasoRestante = duracionMs - (Date.now() - self.tiempoCasoInicio);
            
            if (self.tiempoCasoRestante <= 0) {
                clearInterval(self.timerCaso);
                self.timerCaso = null;
                alert('⏰ Tiempo agotado. Tus respuestas se enviarán automáticamente.');
                self.enviarRespuestasCaso();
                return;
            }
            
            if (timerEl) {
                const minutos = Math.floor(self.tiempoCasoRestante / 60000);
                const segundos = Math.floor((self.tiempoCasoRestante % 60000) / 1000);
                timerEl.textContent = `⏱️ ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
                
                if (self.tiempoCasoRestante <= 300000) {
                    timerEl.style.color = '#f44336';
                } else {
                    timerEl.style.color = 'var(--ink3)';
                }
            }
        }, 1000);
        
        console.log('⏱️ Timer de caso iniciado -', duracionMinutos, 'minutos');
    },
    // ─────────────────────────────────────────────────────────────────────
    // DETENER TIMER DE CASO
    // ─────────────────────────────────────────────────────────────────────
    detenerTimerCaso: function() {
        if (this.timerCaso) {
            clearInterval(this.timerCaso);
            this.timerCaso = null;
            console.log('⏹️ Timer de caso detenido');
        }
    },
    iniciarTimerExamen: function() {
        this.tiempoInicio = Date.now();
        this.tiempoRestante = this.tiempoLimite;
        const self = this;
        this.timerExamen = setInterval(function() {
            self.tiempoRestante = self.tiempoLimite - (Date.now() - self.tiempoInicio);
            if (self.tiempoRestante <= 0) {
                clearInterval(self.timerExamen);
                self.timerExamen = null;
                alert('Tiempo agotado');
                self.mostrarResultado();
                self.eliminarExamenGuardado();
                return;
            }
            const min = Math.floor(self.tiempoRestante / 60000);
            const seg = Math.floor((self.tiempoRestante % 60000) / 1000);
            const el = document.getElementById('exam-timer');
            if (el) el.textContent = `${min}:${seg < 10 ? '0' : ''}${seg}`;
        }, 1000);
    },
    
    detenerTimer: function() {
        if (this.timerExamen) {
            clearInterval(this.timerExamen);
            this.timerExamen = null;
        }
    },
    enviarRespuestasCaso: function() {
        if (!this.casoActual) {
            console.error('❌ No hay caso actual');
            return;
        }
        
        console.log('📤 Enviando respuestas del caso...');
        
        // Recopilar respuestas
        const respuestasPorPregunta = {};
        
        for (let i = 0; i < this.casoActual.preguntas.length; i++) {
            const pregunta = this.casoActual.preguntas[i];
            const preguntaId = pregunta.id || i;
            
            // Determinar tipo de pregunta y recopilar respuesta
            if (pregunta.tipo === 'analisis_multiple' || pregunta.tipo === 'analisis_normativo') {
                const checks = document.querySelectorAll(`input[name="pregunta-${preguntaId}"]:checked`);
                respuestasPorPregunta[preguntaId] = Array.from(checks).map(c => parseInt(c.value));
            } 
            else if (pregunta.tipo === 'respuesta_abierta_guiada') {
                const textarea = document.getElementById(`respuesta-${preguntaId}`);
                respuestasPorPregunta[preguntaId] = [textarea ? textarea.value : ''];
            }
            else if (pregunta.tipo === 'plan_accion') {
                const checks = document.querySelectorAll(`input[name="plan-${preguntaId}"]:checked`);
                respuestasPorPregunta[preguntaId] = Array.from(checks).map(c => parseInt(c.value));
            }
        }
        
        // Evaluar usando la función existente
        const resultado = evaluarCasoInvestigacion(respuestasPorPregunta, this.casoActual);
        this.resultadoCaso = resultado;
        this.mostrarResultadoCaso(resultado);
        
        console.log('✅ Respuestas enviadas, resultado:', resultado.porcentaje + '%');
    },    
    guardarExamenProgreso: function() {
        if (this.examenActual) {
            this.examenGuardado = {
                examenId: this.examenActual.id,
                respuestas: this.respuestasUsuario.slice(),
                preguntaActual: this.preguntaActual,
                fecha: new Date().toISOString()
            };
            localStorage.setItem('rayoshield_progreso', JSON.stringify(this.examenGuardado));
        }
    },
    mostrarResultadoCaso: function(resultado) {
        console.log('📊 Mostrando resultado del caso');
        
        const resultadoEl = document.getElementById('caso-resultado');
        if (!resultadoEl) {
            console.error('❌ Elemento caso-resultado no encontrado');
            return;
        }
        
        this.detenerTimerCaso();
        
        resultadoEl.style.display = 'block';
        resultadoEl.scrollIntoView({ behavior: 'smooth' });
        
        const btnEnviar = document.getElementById('btn-enviar-caso');
        if (btnEnviar) btnEnviar.style.display = 'none';
        
        const nivel = this.casoActual?.nivel || 'basico';
        const nivelUpper = nivel.toUpperCase();
        
        const estadoTexto = resultado.aprobado ? 
            `✅ APROBADO - Nivel ${nivelUpper}` : 
            '📚 REQUIERE REPASO';
        
        const botonesHTML = resultado.aprobado ? `
            <div class="button-group" style="margin-top:20px;">
                <button class="btn btn-primary" onclick="app.descargarCertificadoCaso()">📄 Descargar Certificado</button>
                <button class="btn btn-secondary" onclick="app.volverAListaCasos()">🔄 Otro caso</button>
                <button class="btn btn-secondary" onclick="app.volverHome()">🏠 Inicio</button>
            </div>
        ` : `
            <div class="button-group" style="margin-top:20px;">
                <button class="btn btn-secondary" onclick="app.volverAListaCasos()">🔄 Intentar otro caso</button>
                <button class="btn btn-secondary" onclick="app.volverHome()">🏠 Inicio</button>
            </div>
        `;
        
        resultadoEl.innerHTML = `
            <div style="background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:24px;text-align:center;margin:20px 0;">
                <h2>${resultado.aprobado ? '✅ APROBADO' : '📚 REQUIERE REPASO'}</h2>
                <div style="font-size:56px;font-weight:800;font-family:var(--mono);color:var(--ink);margin:20px 0;letter-spacing:-2px;">
                    ${resultado.porcentaje || 0}%
                </div>
                <p><strong>Puntaje:</strong> ${Math.round(resultado.puntajeTotal || 0)} / ${resultado.puntajeMaximo || 0}</p>
                <p><strong>Estado:</strong> ${estadoTexto}</p>
                <p><strong>Nivel del Caso:</strong> ${nivelUpper}</p>
            </div>
            ${resultado.feedback && resultado.feedback.length ? `
                <div style="margin:20px 0;padding:20px;background:#FFF3E0;border-radius:10px;border-left:4px solid #FF9800;">
                    <strong style="color:#E65100;">💡 Retroalimentación:</strong>
                    <ul style="margin-top:10px;color:#5D4037;">
                        ${resultado.feedback.map(f => `<li style="padding:5px 0;">${f}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            <div class="leccion-master" style="background:var(--bg);padding:20px;border-radius:10px;margin:20px 0;text-align:left;">
                <strong style="color:var(--ink);font-size:13px;">🎓 Lección Aprendida:</strong>
                <p style="margin-top:10px;color:var(--ink2);font-size:14px;line-height:1.6;">${resultado.leccion || 'Continúa practicando para mejorar.'}</p>
            </div>
            ${botonesHTML}
        `;
        
        // Guardar en historial si aprobó
        if (resultado.aprobado) {
            this.guardarResultadoCasoHistorial();
        }
    },
    
    guardarResultadoCasoHistorial: function() {
        const t = typeof MultiUsuario !== 'undefined' ? MultiUsuario.getTrabajadorActual() : null;
        const hist = this.obtenerHistorial();
        hist.push({
            examen: this.casoActual?.titulo || 'Caso',
            score: this.resultadoCaso?.porcentaje || 0,
            estado: 'Aprobado',
            fecha: new Date().toISOString(),
            usuario: t ? t.nombre : this.userData.nombre,
            tipoUsuario: t ? 'trabajador' : 'admin',
            trabajadorId: t?.id || null
        });
        localStorage.setItem('rayoshield_historial', JSON.stringify(hist));
        console.log('✅ Caso guardado en historial');
    },    
    eliminarExamenGuardado: function() {
        this.examenGuardado = null;
        localStorage.removeItem('rayoshield_progreso');
    },
    
    mostrarResultado: function() {
        if (!this.examenActual) return;
        this.detenerTimer();
        if (typeof calcularResultado !== 'function') {
            alert('Error: calcularResultado no definida');
            return;
        }
        this.resultadoActual = calcularResultado(this.respuestasUsuario, this.examenActual);
        
        const scoreEl = document.getElementById('score-number');
        const aciertosEl = document.getElementById('aciertos');
        const totalEl = document.getElementById('total');
        const minEl = document.getElementById('min-score');
        const statusEl = document.getElementById('result-status');
        const btnCert = document.getElementById('btn-certificado');
        
        if (scoreEl) scoreEl.textContent = this.resultadoActual.score + '%';
        if (aciertosEl) aciertosEl.textContent = this.resultadoActual.aciertos;
        if (totalEl) totalEl.textContent = this.resultadoActual.total;
        if (minEl) minEl.textContent = this.resultadoActual.minScore;
        if (statusEl) statusEl.textContent = this.resultadoActual.estado;
        if (btnCert) btnCert.style.display = this.resultadoActual.estado === 'Aprobado' ? 'inline-block' : 'none';
        
        this.mostrarPantalla('result-screen');
        this.guardarEnHistorial();
        if (this.licencia.tipo === 'DEMO') {
            this.licencia.examenesRestantes = Math.max(0, this.licencia.examenesRestantes - 1);
            this.guardarLicencia();
        }
    },
    
    descargarCertificado: function() {
        if (!this.resultadoActual || this.resultadoActual.estado !== 'Aprobado') {
            alert('Solo para aprobados');
            return;
        }
        const t = this.obtenerTrabajadorActual();
        const usuario = t || this.userData;
        if (typeof generarCertificado !== 'function') {
            alert('Error: Función de certificado no cargada');
            return;
        }
        generarCertificado(usuario, this.examenActual, this.resultadoActual).then(url => {
            const a = document.createElement('a');
            a.download = `RayoShield_${usuario.nombre.replace(/\s/g, '_')}_${Date.now()}.png`;
            a.href = url;
            a.click();
        }).catch(err => alert('Error generando certificado'));
    },

    // =================================================================
    // CASOS MASTER
    // =================================================================
    irACasosMaster: function() {
        console.log('📋 Mostrando lista de casos');
        
        this.detenerTimerCaso();
        
        // Limpiar estado actual
        this.casoActual = null;
        this.respuestasCaso = {};
        this.resultadoCaso = null;
        
        // Ocultar detalle y resultado, mostrar lista
        const casosList = document.getElementById('casos-list');
        const casoDetalle = document.getElementById('caso-detalle');
        const casosMainButtons = document.getElementById('casos-main-buttons');
        const casoResultado = document.getElementById('caso-resultado');
        
        if (casoDetalle) casoDetalle.style.display = 'none';
        if (casoResultado) casoResultado.style.display = 'none';
        if (casosMainButtons) casosMainButtons.style.display = 'block';
        
        if (!casosList) {
            console.error('❌ Elemento casos-list no encontrado');
            return;
        }
        
        // Limpiar y regenerar la lista de casos
        casosList.style.display = 'block';
        casosList.innerHTML = '';
        
        // Verificar que existan los casos
        if (typeof CASOS_INVESTIGACION === 'undefined' || !CASOS_INVESTIGACION.length) {
            casosList.innerHTML = '<p style="text-align:center;color:var(--ink4);padding:40px 20px;">No hay casos de investigación disponibles aún.</p>';
            this.mostrarPantalla('casos-master-screen');
            return;
        }
        
        const self = this;
        let casosMostrados = 0;
        const maxCasosDemo = 1;
        
        CASOS_INVESTIGACION.forEach(function(caso) {
            // Verificar acceso según licencia
            let tieneAcceso = false;
            const features = self.licencia.features || {};
            
            if (caso.nivel === 'basico' && features.casosBasicos) tieneAcceso = true;
            else if (caso.nivel === 'master' && features.casosMaster) tieneAcceso = true;
            else if (caso.nivel === 'elite' && features.casosElite) tieneAcceso = true;
            else if (caso.nivel === 'pericial' && features.casosPericial) tieneAcceso = true;
            
            // En DEMO solo mostrar 1 caso
            if (self.licencia.tipo === 'DEMO' && casosMostrados >= maxCasosDemo) return;
            
            if (tieneAcceso || self.licencia.tipo === 'DEMO') {
                const item = document.createElement('div');
                item.className = 'caso-item';
                item.style.cssText = 'background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:18px 20px;margin-bottom:12px;cursor:pointer;transition:all 0.2s;border-left:4px solid var(--border);';
                item.innerHTML = `
                    <h4 style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:8px;">${caso.icono || '📋'} ${caso.titulo}</h4>
                    <p><span class="badge-nivel ${caso.nivel}" style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${caso.nivel === 'basico' ? 'var(--green-l)' : caso.nivel === 'master' ? 'var(--blue-l)' : caso.nivel === 'elite' ? 'var(--indigo)' : 'var(--amber-l)'};color:${caso.nivel === 'basico' ? 'var(--green)' : caso.nivel === 'master' ? 'var(--blue)' : caso.nivel === 'elite' ? 'white' : 'var(--amber)'};">${caso.nivel.toUpperCase()}</span> • ${caso.tiempo_estimado}</p>
                    <p style="font-size:12px;color:var(--ink3);margin-bottom:4px;">${caso.descripcion}</p>
                    ${caso.requisito ? `<p style="font-size:11px;color:var(--amber);margin-top:8px;">📋 Requisito: ${caso.requisito}</p>` : ''}
                `;
                item.onclick = function() { self.cargarCasoMaster(caso.id); };
                casosList.appendChild(item);
                casosMostrados++;
            }
        });
        
        if (casosList.children.length === 0) {
            casosList.innerHTML = '<p style="text-align:center;color:var(--ink4);padding:40px 20px;">No hay casos disponibles para tu plan actual.<br><strong>Actualiza tu plan para acceder a más casos.</strong></p>';
        }
        
        this.mostrarPantalla('casos-master-screen');
        console.log('✅ Lista de casos mostrada, total:', casosList.children.length);
    },
    // ─────────────────────────────────────────────────────────────────────
    // VOLVER A LISTA DE CASOS
    // ─────────────────────────────────────────────────────────────────────
    volverAListaCasos: function() {
        console.log('🔙 Volviendo a lista de casos');
        
        // Detener timer
        if (this.timerCaso) {
            clearInterval(this.timerCaso);
            this.timerCaso = null;
        }
        
        // Limpiar estado actual
        this.casoActual = null;
        this.respuestasCaso = {};
        this.resultadoCaso = null;
        
        // Ocultar detalle y resultado
        const casoDetalle = document.getElementById('caso-detalle');
        const casoResultado = document.getElementById('caso-resultado');
        const btnEnviar = document.getElementById('btn-enviar-caso');
        const casosMainButtons = document.getElementById('casos-main-buttons');
        
        if (casoDetalle) casoDetalle.style.display = 'none';
        if (casoResultado) casoResultado.style.display = 'none';
        if (btnEnviar) btnEnviar.style.display = 'none';
        if (casosMainButtons) casosMainButtons.style.display = 'block';
        
        // Regenerar la lista de casos
        this.irACasosMaster();
    },
    
    // ─────────────────────────────────────────────────────────────────────
    // CREAR ELEMENTO DEL TIMER (si no existe)
    // ─────────────────────────────────────────────────────────────────────
    crearTimerCaso: function() {
        let timerEl = document.getElementById('caso-timer');
        if (!timerEl) {
            timerEl = document.createElement('div');
            timerEl.id = 'caso-timer';
            timerEl.style.cssText = 'text-align:center;font-size:24px;font-weight:bold;margin:15px 0;padding:10px;background:var(--bg);border-radius:10px;color:var(--ink3);';
            timerEl.textContent = '⏱️ 40:00';
            
            const casoDetalle = document.getElementById('caso-detalle');
            if (casoDetalle && casoDetalle.firstChild) {
                casoDetalle.insertBefore(timerEl, casoDetalle.firstChild);
            } else if (casoDetalle) {
                casoDetalle.appendChild(timerEl);
            }
            console.log('✅ Timer creado');
        }
        return timerEl;
    },    
    // ─────────────────────────────────────────────────────────────────────
    // CARGAR CASO MASTER - VERSIÓN CORREGIDA
    // ─────────────────────────────────────────────────────────────────────
cargarCasoMaster: async function(casoId) {
    console.log('📋 Cargando caso:', casoId);
    
    try {
        // Ocultar lista y mostrar detalle
        const casosList = document.getElementById('casos-list');
        const casoDetalle = document.getElementById('caso-detalle');
        const casosMainButtons = document.getElementById('casos-main-buttons');
        
        if (casosList) casosList.style.display = 'none';
        if (casoDetalle) casoDetalle.style.display = 'block';
        if (casosMainButtons) casosMainButtons.style.display = 'none'; // Ocultar botones principales
        
        // Cargar el caso
        const caso = await cargarCasoInvestigacion(casoId);
        
        if (!caso) {
            console.error('❌ Caso no encontrado:', casoId);
            alert('Error: No se pudo cargar el caso. Intenta de nuevo.');
            this.volverAListaCasos();
            return;
        }
        
        console.log('✅ Caso cargado:', caso.titulo);
        console.log('📝 Preguntas:', caso.preguntas?.length || 0);
        
        // Guardar caso actual
        this.casoActual = caso;
        this.respuestasCaso = {};
        
        // Limpiar resultado anterior
        const casoResultado = document.getElementById('caso-resultado');
        if (casoResultado) {
            casoResultado.style.display = 'none';
            casoResultado.innerHTML = '';
        }
        
        // Llenar datos básicos del caso
        const elId = document.getElementById('caso-id');
        const elFecha = document.getElementById('caso-fecha');
        const elIndustria = document.getElementById('caso-industria');
        const elTiempo = document.getElementById('caso-tiempo');
        
        if (elId) elId.textContent = caso.id || 'N/A';
        if (elFecha) elFecha.textContent = caso.fecha_evento || 'No especificada';
        if (elIndustria) elIndustria.textContent = caso.industria || 'No especificada';
        if (elTiempo) elTiempo.textContent = caso.tiempo_estimado || '15 min';
        
        // Renderizar descripción del evento
        const descripcionEl = document.getElementById('caso-descripcion');
        if (descripcionEl) {
            if (caso.descripcion_evento) {
                descripcionEl.innerHTML = `
                    <div style="background:var(--bg);padding:15px;border-radius:10px;margin:15px 0;">
                        <strong>📋 Descripción del Evento:</strong>
                        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:10px;">
                            <div><strong>Actividad:</strong> ${caso.descripcion_evento.actividad || 'N/A'}</div>
                            <div><strong>Equipo:</strong> ${caso.descripcion_evento.equipo || 'N/A'}</div>
                            <div><strong>Evento:</strong> ${caso.descripcion_evento.evento || 'N/A'}</div>
                            <div><strong>Resultado:</strong> ${caso.descripcion_evento.resultado || 'N/A'}</div>
                            <div><strong>Clasificación:</strong> <span style="color:var(--rose);">${caso.descripcion_evento.clasificacion || 'N/A'}</span></div>
                        </div>
                    </div>
                `;
            } else {
                descripcionEl.innerHTML = `<div style="background:var(--bg);padding:15px;border-radius:10px;margin:15px 0;">${caso.descripcion || 'Sin descripción detallada'}</div>`;
            }
        }
        
        // Renderizar línea de tiempo
        const timelineEl = document.getElementById('caso-timeline');
        if (timelineEl) {
            if (caso.linea_tiempo && Array.isArray(caso.linea_tiempo) && caso.linea_tiempo.length) {
                timelineEl.innerHTML = `
                    <div class="timeline">
                        <strong>📅 Línea de Tiempo:</strong>
                        ${caso.linea_tiempo.map(evento => `
                            <div class="timeline-item ${evento.toLowerCase().includes('accidente') || evento.toLowerCase().includes('incidente') ? 'evento-critico' : ''}">
                                ${evento}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                timelineEl.innerHTML = '<div class="timeline"><strong>📅 Línea de Tiempo:</strong><div class="timeline-item">No disponible</div></div>';
            }
        }
        
        // Renderizar energías identificadas
        const energiasEl = document.getElementById('caso-energias');
        if (energiasEl) {
            if (caso.energias_identificadas && Object.keys(caso.energias_identificadas).length) {
                energiasEl.innerHTML = `
                    <div class="energia-grid">
                        <strong style="grid-column:1/-1;">⚡ Energías Identificadas:</strong>
                        ${Object.keys(caso.energias_identificadas).map(tipo => {
                            const estado = caso.energias_identificadas[tipo];
                            const esPeligro = estado.includes('ENERGIZADO') || estado.includes('LIBERADA');
                            return `
                                <div class="energia-item ${esPeligro ? 'no-aislada' : 'aislada'}">
                                    <strong>${tipo}</strong><br>
                                    <small>${estado}</small>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                energiasEl.innerHTML = '<div class="energia-grid"><strong>⚡ Energías:</strong><div>No disponible</div></div>';
            }
        }
        
        // RENDERIZAR PREGUNTAS
        const preguntasEl = document.getElementById('caso-preguntas');
        if (!preguntasEl) {
            console.error('❌ Elemento caso-preguntas no encontrado');
            return;
        }
        
        if (!caso.preguntas || caso.preguntas.length === 0) {
            preguntasEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--rose);">❌ Este caso no tiene preguntas definidas</div>';
        } else {
            preguntasEl.innerHTML = '';
            console.log('📝 Renderizando', caso.preguntas.length, 'preguntas');
            
            for (let idx = 0; idx < caso.preguntas.length; idx++) {
                const pregunta = caso.preguntas[idx];
                const preguntaDiv = document.createElement('div');
                preguntaDiv.className = 'pregunta-master';
                preguntaDiv.style.cssText = 'background:var(--white);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px;';
                
                const pesoTexto = pregunta.peso ? ` - ${pregunta.peso} pts` : '';
                preguntaDiv.innerHTML = `
                    <h4 style="font-size:13px;font-weight:700;color:var(--ink);margin-bottom:12px;">
                        🔍 Pregunta ${idx + 1}${pesoTexto}
                    </h4>
                    <p style="font-size:14px;color:var(--ink2);line-height:1.6;margin-bottom:15px;">
                        ${pregunta.pregunta}
                    </p>
                `;
                
                // Renderizar según tipo de pregunta
                if (pregunta.tipo === 'analisis_multiple' || pregunta.tipo === 'analisis_normativo') {
                    const opcionesContainer = document.createElement('div');
                    opcionesContainer.className = 'opciones-container';
                    
                    pregunta.opciones.forEach((opt, optIdx) => {
                        const textoOpt = typeof opt === 'string' ? opt : (opt.texto || opt);
                        const label = document.createElement('label');
                        label.className = 'opcion-sistemica';
                        label.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--bg);border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;cursor:pointer;transition:all 0.15s;';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = `pregunta-${pregunta.id || idx}`;
                        checkbox.value = optIdx;
                        checkbox.style.marginTop = '4px';
                        checkbox.style.width = '18px';
                        checkbox.style.height = '18px';
                        checkbox.style.cursor = 'pointer';
                        
                        const textoSpan = document.createElement('span');
                        textoSpan.className = 'texto-opcion';
                        textoSpan.style.cssText = 'font-size:13px;line-height:1.5;color:var(--ink2);flex:1;';
                        textoSpan.textContent = textoOpt;
                        
                        label.appendChild(checkbox);
                        label.appendChild(textoSpan);
                        
                        label.onclick = function(e) {
                            if (e.target !== checkbox) {
                                checkbox.checked = !checkbox.checked;
                            }
                            if (checkbox.checked) {
                                label.style.borderColor = 'var(--blue)';
                                label.style.background = 'var(--blue-l)';
                            } else {
                                label.style.borderColor = 'var(--border)';
                                label.style.background = 'var(--bg)';
                            }
                        };
                        
                        opcionesContainer.appendChild(label);
                    });
                    preguntaDiv.appendChild(opcionesContainer);
                    
                } else if (pregunta.tipo === 'respuesta_abierta_guiada') {
                    const textarea = document.createElement('textarea');
                    textarea.className = 'respuesta-abierta';
                    textarea.id = `respuesta-${pregunta.id || idx}`;
                    textarea.placeholder = pregunta.placeholder || 'Escribe tu análisis aquí... (mínimo 80 caracteres)';
                    textarea.style.cssText = 'width:100%;min-height:120px;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--ink);font-family:var(--font);font-size:14px;resize:vertical;margin-bottom:10px;';
                    preguntaDiv.appendChild(textarea);
                    
                    if (pregunta.feedback_guiado) {
                        const pista = document.createElement('div');
                        pista.className = 'pista-experto';
                        pista.style.cssText = 'background:var(--blue-l);padding:12px 14px;border-radius:var(--radius-sm);font-size:12px;color:var(--blue);border-left:3px solid var(--blue);';
                        pista.innerHTML = `💡 ${pregunta.feedback_guiado}`;
                        preguntaDiv.appendChild(pista);
                    }
                    
                } else if (pregunta.tipo === 'plan_accion') {
                    const opcionesContainer = document.createElement('div');
                    opcionesContainer.className = 'opciones-container';
                    
                    pregunta.opciones.forEach((opt, optIdx) => {
                        const textoOpt = typeof opt === 'string' ? opt : (opt.texto || opt.accion || opt);
                        const jerarquia = opt.jerarquia || opt.clasificacion || 'administrativo';
                        
                        const label = document.createElement('label');
                        label.className = 'accion-item';
                        label.style.cssText = 'display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--bg);border:2px solid var(--border);border-radius:var(--radius-sm);margin-bottom:10px;cursor:pointer;';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = `plan-${pregunta.id || idx}`;
                        checkbox.value = optIdx;
                        checkbox.style.marginTop = '4px';
                        checkbox.style.width = '18px';
                        checkbox.style.height = '18px';
                        checkbox.style.cursor = 'pointer';
                        
                        const textoDiv = document.createElement('div');
                        textoDiv.style.cssText = 'flex:1;';
                        textoDiv.innerHTML = `
                            <strong style="font-size:13px;color:var(--ink);">${textoOpt}</strong>
                            <div style="margin-top:5px;">
                                <span class="accion-jerarquia ${jerarquia}" style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;font-weight:700;text-transform:uppercase;">${jerarquia}</span>
                            </div>
                        `;
                        
                        label.appendChild(checkbox);
                        label.appendChild(textoDiv);
                        
                        label.onclick = function(e) {
                            if (e.target !== checkbox) {
                                checkbox.checked = !checkbox.checked;
                            }
                            if (checkbox.checked) {
                                label.style.borderColor = 'var(--blue)';
                                label.style.background = 'var(--blue-l)';
                            } else {
                                label.style.borderColor = 'var(--border)';
                                label.style.background = 'var(--bg)';
                            }
                        };
                        
                        opcionesContainer.appendChild(label);
                    });
                    preguntaDiv.appendChild(opcionesContainer);
                }
                
                preguntasEl.appendChild(preguntaDiv);
            }
        }
        
        // Mostrar botón de enviar
        const btnEnviar = document.getElementById('btn-enviar-caso');
        if (btnEnviar) btnEnviar.style.display = 'inline-block';
        
        // Iniciar timer
        this.iniciarTimerCaso();
        
        console.log('✅ Caso renderizado correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando caso:', error);
        alert('Error al cargar el caso: ' + error.message);
        this.volverAListaCasos();
    }
},
    // =================================================================
    // UI Y RENDERIZADO
    // =================================================================
    actualizarUI: function() {
        // Info de licencia en home
        const infoLic = document.getElementById('licencia-info');
        if (infoLic) {
            if (this.licencia.tipo === 'DEMO') {
                infoLic.textContent = `📋 DEMO: ${this.licencia.examenesRestantes}/3 hoy`;
                infoLic.className = 'licencia-info-card demo';
            } else {
                let texto = `✅ ${this.licencia.tipo}: ${this.licencia.clienteId}`;
                if (this.licencia.expiracion) {
                    const exp = new Date(this.licencia.expiracion);
                    texto += ` (exp: ${exp.toLocaleDateString('es-MX')})`;
                }
                infoLic.textContent = texto;
                infoLic.className = 'licencia-info-card activo';
            }
        }
        
        // Info de usuario
        const userInfo = document.getElementById('usuario-info');
        if (userInfo && this.userData.nombre) {
            userInfo.innerHTML = `<strong>👤 ${this.userData.nombre}</strong><br>${this.userData.empresa || ''} • ${this.userData.puesto || ''}`;
        }
        
        // Sidebar
        const sidebarPlan = document.getElementById('sidebar-license-plan');
        if (sidebarPlan) sidebarPlan.textContent = this.licencia.tipo;
        
        const sidebarExpiry = document.getElementById('sidebar-license-expiry');
        if (sidebarExpiry) {
            if (this.licencia.expiracion && this.licencia.tipo !== 'DEMO') {
                const exp = new Date(this.licencia.expiracion);
                const ahora = new Date();
                const dias = Math.ceil((exp - ahora) / (1000 * 60 * 60 * 24));
                sidebarExpiry.textContent = `${dias} días restantes`;
                sidebarExpiry.style.color = dias <= 7 ? 'var(--rose)' : 'var(--ink4)';
            } else {
                sidebarExpiry.textContent = 'DEMO - 3/día';
                sidebarExpiry.style.color = 'var(--ink4)';
            }
        }
        
        // Botón de examen
        const btnExamen = document.getElementById('btn-comenzar');
        if (btnExamen) {
            const datosOk = this.userData.empresa && this.userData.nombre && this.userData.curp && this.userData.puesto;
            btnExamen.disabled = !datosOk;
        }
        
        this.actualizarLicenciaUI();
        this.actualizarBadgeTrabajadores();
        this.actualizarSidebarModoIndicador();
        this.actualizarUIMenuPorRol();
    },
    // =================================================================
    // FUNCIONES FALTANTES PARA CASOS MASTER
    // =================================================================
    
    descargarCertificadoCaso: function() {
        if (!this.resultadoCaso || !this.resultadoCaso.aprobado) {
            alert('Solo para casos aprobados');
            return;
        }
        
        const t = this.obtenerTrabajadorActual();
        const usuario = t || this.userData;
        
        // Crear certificado simple
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        
        // Fondo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Borde decorativo
        ctx.strokeStyle = '#1a56db';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        
        // Título
        ctx.fillStyle = '#1a56db';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ RAYOSHIELD', canvas.width/2, 100);
        
        ctx.fillStyle = '#333';
        ctx.font = '20px Arial';
        ctx.fillText('CERTIFICADO DE APROBACIÓN', canvas.width/2, 160);
        
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText('Caso de Investigación', canvas.width/2, 210);
        
        // Línea decorativa
        ctx.beginPath();
        ctx.moveTo(150, 240);
        ctx.lineTo(canvas.width - 150, 240);
        ctx.stroke();
        
        // Contenido
        ctx.fillStyle = '#333';
        ctx.font = '18px Arial';
        ctx.fillText(`Otorgado a: ${usuario.nombre}`, canvas.width/2, 300);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(`Caso: ${this.casoActual?.titulo || 'Caso Master'}`, canvas.width/2, 360);
        ctx.fillText(`Puntaje: ${this.resultadoCaso?.porcentaje || 0}%`, canvas.width/2, 400);
        ctx.fillText(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, canvas.width/2, 440);
        
        // Sello
        ctx.beginPath();
        ctx.arc(canvas.width - 100, canvas.height - 80, 40, 0, 2 * Math.PI);
        ctx.strokeStyle = '#1a56db';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = '#1a56db';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('VALIDEZ', canvas.width - 100, canvas.height - 85);
        ctx.font = '10px Arial';
        ctx.fillText('OFICIAL', canvas.width - 100, canvas.height - 65);
        
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = `RayoShield_Caso_${usuario.nombre.replace(/\s/g, '_')}_${Date.now()}.png`;
        a.href = url;
        a.click();
    },  
    actualizarPerfil: function() {
        const nombreEl = document.getElementById('perfil-nombre');
        if (nombreEl) nombreEl.textContent = this.userData.nombre || 'Usuario';
        const nombreInput = document.getElementById('perfil-nombre-input');
        if (nombreInput) nombreInput.value = this.userData.nombre || '';
        const empresaInput = document.getElementById('perfil-empresa-input');
        if (empresaInput) empresaInput.value = this.userData.empresa || '';
        const puestoInput = document.getElementById('perfil-puesto-input');
        if (puestoInput) puestoInput.value = this.userData.puesto || '';
        const curpInput = document.getElementById('perfil-curp-input');
        if (curpInput) curpInput.value = this.userData.curp || '';
        
        const perfilPlan = document.getElementById('perfil-plan');
        if (perfilPlan) perfilPlan.textContent = this.licencia.tipo;
        
        const hist = this.obtenerHistorial();
        const aprobados = hist.filter(h => h.estado === 'Aprobado').length;
        const promedio = hist.length > 0 ? Math.round(hist.reduce((a,b) => a + b.score, 0) / hist.length) : 0;
        
        const perfPromedio = document.getElementById('perf-promedio');
        if (perfPromedio) perfPromedio.textContent = promedio + '%';
        const perfExamenes = document.getElementById('perf-examenes');
        if (perfExamenes) perfExamenes.textContent = hist.length;
        const perfAprobados = document.getElementById('perf-aprobados');
        if (perfAprobados) perfAprobados.textContent = aprobados;
        const perfilExamenes = document.getElementById('perfil-examenes');
        if (perfilExamenes) perfilExamenes.textContent = hist.length + ' Exámenes';
        
        const logroExamen = document.getElementById('logro-examen');
        if (logroExamen && hist.length >= 1) logroExamen.textContent = '✅';
    },
    
    actualizarUIMenuPorRol: function() {
        const esTrabajador = this.esTrabajador();
        const adminElements = ['.nav-item[onclick*="mostrarTrabajadores"]', '.nav-item[onclick*="mostrarLicencia"]', '.nav-item[onclick*="mostrarInfo"]'];
        adminElements.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.display = esTrabajador ? 'none' : '';
        });
        
        const btnVolver = document.getElementById('btn-volver-admin');
        if (btnVolver) btnVolver.style.display = esTrabajador ? 'block' : 'none';
        
        const topbarSub = document.getElementById('topbar-sub');
        const t = this.obtenerTrabajadorActual();
        if (topbarSub) {
            if (t) topbarSub.textContent = `👷 ${t.nombre} • ${t.puesto}`;
            else topbarSub.textContent = 'Plataforma de certificación';
        }
    },
    
    actualizarSidebarModoIndicador: function() {
        const btnVolver = document.getElementById('btn-volver-admin');
        const t = this.obtenerTrabajadorActual();
        if (btnVolver) btnVolver.style.display = t ? 'block' : 'none';
    },
    
    actualizarBadgeTrabajadores: function() {
        const badge = document.getElementById('nav-badge-trabajadores');
        if (badge && typeof MultiUsuario !== 'undefined') {
            const count = MultiUsuario.getTrabajadores().length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    },
    
    renderTrabajadores: function() {
        if (typeof MultiUsuario === 'undefined') return;
        const tbody = document.getElementById('trabajadores-tabla');
        if (!tbody) return;
        
        const filtro = document.getElementById('filtro-estado')?.value || 'todos';
        const busqueda = document.getElementById('buscar-trabajador')?.value.toLowerCase() || '';
        let trabajadores = MultiUsuario.getTrabajadores();
        
        if (filtro !== 'todos') trabajadores = trabajadores.filter(t => t.estado === filtro);
        if (busqueda) {
            trabajadores = trabajadores.filter(t => 
                t.nombre.toLowerCase().includes(busqueda) || 
                t.curp.toLowerCase().includes(busqueda) ||
                (t.puesto && t.puesto.toLowerCase().includes(busqueda))
            );
        }
        
        const vacio = document.getElementById('trabajadores-vacio');
        if (trabajadores.length === 0) {
            tbody.innerHTML = '';
            if (vacio) vacio.style.display = 'block';
            return;
        }
        if (vacio) vacio.style.display = 'none';
        
        tbody.innerHTML = trabajadores.map(t => {
            const prog = MultiUsuario.getProgresoByTrabajador(t.id);
            return `<tr style="border-bottom:1px solid var(--border);">
                <td style="padding:12px;"><strong>${t.nombre}</strong><br><small>${t.curp}</small></td>
                <td style="padding:12px;">${t.puesto || '-'}<br><small>${t.area || ''}</small></td>
                <td style="padding:12px;">${prog.total_examenes} exámenes<br><small>${prog.total_casos} casos</small></td>
                <td style="padding:12px;font-weight:700;color:${prog.promedio >= 80 ? 'var(--green)' : 'var(--amber)'};">${prog.promedio}%</span></td>
                <td style="padding:12px;"><span class="${t.estado === 'activo' ? 'status-ok' : 'status-pend'}">${t.estado === 'activo' ? '✅ Activo' : '⏸️ Inactivo'}</span></td>
                <td style="padding:12px;text-align:center;">
                    <button class="tbl-btn view" onclick="app.verProgresoTrabajador('${t.id}')">📊</button>
                    <button class="tbl-btn" onclick="app.editarTrabajador('${t.id}')">✏️</button>
                    <button class="tbl-btn" style="background:var(--rose-l);color:var(--rose);" onclick="app.eliminarTrabajador('${t.id}')">🗑️</button>
                </td>
            </tr>`;
        }).join('');
        this.actualizarEstadisticasTrabajadores();
        this.actualizarBadgeTrabajadores();
    },
    
    actualizarEstadisticasTrabajadores: function() {
        if (typeof MultiUsuario === 'undefined') return;
        const stats = MultiUsuario.getEstadisticas();
        const el1 = document.getElementById('stat-trabajadores-total');
        const el2 = document.getElementById('stat-trabajadores-activos');
        const el3 = document.getElementById('stat-examenes-total');
        const el4 = document.getElementById('stat-tasa-aprobacion');
        if (el1) el1.textContent = stats.trabajadores_totales;
        if (el2) el2.textContent = stats.trabajadores_activos;
        if (el3) el3.textContent = stats.examenes_totales + stats.casos_totales;
        if (el4) el4.textContent = stats.tasa_aprobacion + '%';
    },
    
    mostrarModalTrabajador: function() {
        document.getElementById('modal-trabajador-titulo').textContent = '👤 Nuevo Trabajador';
        ['id', 'nombre', 'curp', 'puesto', 'area', 'email', 'telefono', 'notas'].forEach(id => {
            const el = document.getElementById(`trabajador-${id}`);
            if (el) el.value = '';
        });
        document.getElementById('modal-trabajador').classList.add('active');
    },
    
    cerrarModalTrabajador: function() {
        document.getElementById('modal-trabajador').classList.remove('active');
    },
    
    guardarTrabajador: function() {
        if (typeof MultiUsuario === 'undefined') { alert('Error'); return; }
        const nombre = document.getElementById('trabajador-nombre')?.value.trim();
        const curp = document.getElementById('trabajador-curp')?.value.trim().toUpperCase();
        const puesto = document.getElementById('trabajador-puesto')?.value.trim();
        if (!nombre || !curp || !puesto) {
            alert('⚠️ Nombre, CURP y Puesto son obligatorios');
            return;
        }
        
        const data = {
            nombre, curp, puesto,
            area: document.getElementById('trabajador-area')?.value || '',
            email: document.getElementById('trabajador-email')?.value || '',
            telefono: document.getElementById('trabajador-telefono')?.value || '',
            notas: document.getElementById('trabajador-notas')?.value || ''
        };
        
        const id = document.getElementById('trabajador-id')?.value;
        if (id) {
            MultiUsuario.updateTrabajador(id, data);
            alert('✅ Trabajador actualizado');
        } else {
            MultiUsuario.addTrabajador(data);
            alert('✅ Trabajador registrado');
        }
        this.cerrarModalTrabajador();
        this.renderTrabajadores();
        this.actualizarBadgeTrabajadores();
    },
    
    editarTrabajador: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        if (!t) return;
        document.getElementById('modal-trabajador-titulo').textContent = '✏️ Editar Trabajador';
        document.getElementById('trabajador-id').value = t.id;
        document.getElementById('trabajador-nombre').value = t.nombre;
        document.getElementById('trabajador-curp').value = t.curp;
        document.getElementById('trabajador-puesto').value = t.puesto || '';
        document.getElementById('trabajador-area').value = t.area || '';
        document.getElementById('trabajador-email').value = t.email || '';
        document.getElementById('trabajador-telefono').value = t.telefono || '';
        document.getElementById('trabajador-notas').value = t.notas || '';
        document.getElementById('modal-trabajador').classList.add('active');
    },
    
    eliminarTrabajador: function(id) {
        if (confirm('⚠️ ¿Eliminar este trabajador?')) {
            MultiUsuario.deleteTrabajador(id);
            this.renderTrabajadores();
            this.actualizarBadgeTrabajadores();
        }
    },
    
    verProgresoTrabajador: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        const prog = MultiUsuario.getProgresoByTrabajador(id);
        alert(`📊 ${t.nombre}\nExámenes: ${prog.total_examenes}\nPromedio: ${prog.promedio}%\nCasos: ${prog.total_casos}`);
    },
    
    mostrarSeleccionarTrabajador: function() {
        const lista = document.getElementById('kiosco-lista');
        if (!lista) return;
        const trabajadores = MultiUsuario.getTrabajadores().filter(t => t.estado === 'activo');
        if (trabajadores.length === 0) {
            lista.innerHTML = '<div style="padding:20px;text-align:center;">No hay trabajadores activos</div>';
        } else {
            lista.innerHTML = trabajadores.map(t => `
                <div onclick="app.seleccionarTrabajadorKiosco('${t.id}')" style="padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:8px;cursor:pointer;">
                    <div style="font-weight:600;">${t.nombre}</div>
                    <div style="font-size:11px;color:var(--ink4);">${t.curp} • ${t.puesto || 'N/A'}</div>
                </div>
            `).join('');
        }
        document.getElementById('modal-seleccionar-trabajador').classList.add('active');
    },
    
    cerrarModalSeleccionarTrabajador: function() {
        document.getElementById('modal-seleccionar-trabajador').classList.remove('active');
    },
    
    filtrarKioscoTrabajadores: function() {
        const busqueda = document.getElementById('kiosco-buscar')?.value.toLowerCase() || '';
        const items = document.querySelectorAll('#kiosco-lista > div');
        items.forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(busqueda) ? 'block' : 'none';
        });
    },
    
    seleccionarTrabajadorKiosco: function(id) {
        const t = MultiUsuario.getTrabajadorById(id);
        if (!t) return;
        if (confirm(`👷 Cambiar a modo trabajador\n\nTrabajador: ${t.nombre}\nPuesto: ${t.puesto || 'N/A'}\n\n¿Continuar?`)) {
            this.modoActual = 'trabajador';
            MultiUsuario.setTrabajadorActual(id);
            this.cerrarModalSeleccionarTrabajador();
            this.actualizarUI();
            this.actualizarUIMenuPorRol();
            alert(`✅ Modo trabajador: ${t.nombre}`);
        }
    },
    
    volverAModoAdmin: function() {
        if (this.verificarPasswordAdmin()) {
            localStorage.removeItem('rayoshield_trabajador_actual');
            this.modoActual = 'admin';
            this.userData = { empresa: '', nombre: '', curp: '', puesto: '' };
            this.actualizarUI();
            this.actualizarUIMenuPorRol();
            alert('✅ Modo administrador');
            location.reload();
        }
    },
    
    renderHistorial: function() {
        const container = document.getElementById('history-list');
        if (!container) return;
        const hist = this.obtenerHistorial();
        if (hist.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;">📭 Sin exámenes registrados</p>';
            return;
        }
        container.innerHTML = `<table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:var(--bg);">
                <th style="padding:12px;text-align:left;">Fecha</th>
                <th style="padding:12px;text-align:left;">Usuario</th>
                <th style="padding:12px;text-align:left;">Examen</th>
                <th style="padding:12px;text-align:right;">Puntaje</th>
                <th style="padding:12px;text-align:center;">Estado</th>
            </table></thead>
            <tbody>
            ${hist.slice(-20).reverse().map(item => `
                <tr style="border-bottom:1px solid var(--border);">
                    <td style="padding:12px;">${new Date(item.fecha).toLocaleDateString('es-MX')}</td>
                    <td style="padding:12px;font-weight:600;">${item.usuario || 'N/A'}</td>
                    <td style="padding:12px;">${item.examen}</td>
                    <td style="padding:12px;text-align:right;font-weight:700;">${item.score}%</td>
                    <td style="padding:12px;text-align:center;"><span class="${item.estado === 'Aprobado' ? 'status-ok' : 'status-pend'}">${item.estado === 'Aprobado' ? '✅ Aprobado' : '❌ Reprobado'}</span></td>
                </tr>
            `).join('')}
            </tbody>
        </table>`;
    },
    
    llenarFiltroTrabajadoresHistorial: function() {
        const select = document.getElementById('historial-filtro-trabajador');
        if (!select) return;
        select.innerHTML = '<option value="todos">Todos</option><option value="admin">Admin</option>';
        if (typeof MultiUsuario !== 'undefined') {
            MultiUsuario.getTrabajadores().forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = t.nombre;
                select.appendChild(opt);
            });
        }
    },
    
    exportarHistorialPDF: function() {
        const hist = this.obtenerHistorial();
        if (hist.length === 0) { alert('No hay datos'); return; }
        let html = `<html><head><title>Historial RayoShield</title><style>body{font-family:Arial;} table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px}</style></head><body><h1>Historial de Exámenes</h1><table border="1"><tr><th>Fecha</th><th>Usuario</th><th>Examen</th><th>Puntaje</th><th>Estado</th></tr>`;
        hist.forEach(h => { html += `<tr><td>${new Date(h.fecha).toLocaleDateString()}</td><td>${h.usuario}</td><td>${h.examen}</td><td>${h.score}%</td><td>${h.estado}</td></tr>`; });
        html += `</table><p>Generado: ${new Date().toLocaleString()}</p></body></html>`;
        const win = window.open();
        win.document.write(html);
        win.print();
    },
    
    verificarPasswordAdmin: function() {
        const pwd = prompt('🔐 Contraseña de administrador:');
        if (!pwd) return false;
        const guardada = localStorage.getItem('rayoshield_admin_password') || 'admin123';
        if (pwd !== guardada) {
            alert('Contraseña incorrecta');
            return false;
        }
        return true;
    },
    
    cambiarPasswordAdmin: function() {
        const current = document.getElementById('admin-password-current')?.value;
        const nueva = document.getElementById('admin-password-new')?.value;
        if (!nueva || nueva.length < 6) { alert('Mínimo 6 caracteres'); return; }
        const guardada = localStorage.getItem('rayoshield_admin_password') || 'admin123';
        if (current && current !== guardada) { alert('Contraseña actual incorrecta'); return; }
        localStorage.setItem('rayoshield_admin_password', nueva);
        alert('✅ Contraseña actualizada');
        if (document.getElementById('admin-password-current')) document.getElementById('admin-password-current').value = '';
        if (document.getElementById('admin-password-new')) document.getElementById('admin-password-new').value = '';
    },
    
    verificarAccesoAdmin: function(funcionNombre, mostrarAlerta = true) {
        if (this.esTrabajador()) {
            if (mostrarAlerta) alert('⚠️ Solo administradores');
            return false;
        }
        return true;
    },
    
    esAdmin: function() {
        return this.isAdmin || this.modoActual === 'admin';
    },
    
    esTrabajador: function() {
        return this.modoActual === 'trabajador' && this.obtenerTrabajadorActual() !== null;
    },
    
    puedeVer: function(seccion) {
        const esAdmin = this.esAdmin();
        const permisos = {
            'home': true, 'examenes': true, 'casos': true,
            'perfil': true, 'historial': true,
            'licencia': esAdmin, 'trabajadores': esAdmin, 'info': true
        };
        return permisos[seccion] || false;
    },
    
    toggleTema: function() {
        document.body.classList.toggle('tema-claro');
        localStorage.setItem('rayoshield_tema', document.body.classList.contains('tema-claro') ? 'claro' : 'oscuro');
    },
    
    initPWAInstall: function() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            const btn = document.getElementById('btn-instalar-pwa');
            if (btn) btn.style.display = 'flex';
        });
    },
    
    instalarPWA: function() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
        } else {
            alert('Usa el menú del navegador → "Agregar a pantalla principal"');
        }
    },
    
    cerrarSesion: function() {
        if (confirm('¿Cerrar sesión? Se borrarán los datos locales.')) {
            if (this.firebaseListo && this.auth) this.auth.signOut();
            localStorage.clear();
            location.reload();
        }
    },
    
    exportarDatos: function() { alert('Disponible en planes PROFESIONAL+'); },
    importarDatos: function() { alert('Disponible en planes PROFESIONAL+'); },
    limpiarDatosConfirmar: function() {
        if (confirm('⚠️ ¿Borrar todos los datos?') && prompt('Escribe "BORRAR"') === 'BORRAR') {
            localStorage.clear();
            location.reload();
        }
    },
    exportarTodoAFirebase: function() { alert('Función en desarrollo'); },
    importarTodoDeFirebase: function() { alert('Función en desarrollo'); },
    guardarTrabajadorFirebase: function() {},
    eliminarTrabajadorFirebase: function() {},
    escucharCambiosTrabajadores: function() {},
    cargarTrabajadoresFirebase: function() { return Promise.resolve([]); },
    cargarResultadosFirebase: function() { return Promise.resolve([]); }
};

// =================================================================
// MULTIUSUARIO (Backup Local)
// =================================================================
const MultiUsuario = {
    init: function() {
        if (!localStorage.getItem('rayoshield_trabajadores')) localStorage.setItem('rayoshield_trabajadores', JSON.stringify([]));
        if (!localStorage.getItem('rayoshield_resultados')) localStorage.setItem('rayoshield_resultados', JSON.stringify([]));
        if (!localStorage.getItem('rayoshield_trabajador_actual')) localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(null));
        console.log('✅ MultiUsuario inicializado');
    },
    
    getTrabajadores: function() { 
        return JSON.parse(localStorage.getItem('rayoshield_trabajadores') || '[]'); 
    },
    
    addTrabajador: function(t) {
        const arr = this.getTrabajadores();
        t.id = 'TRAB-' + Date.now().toString(36).toUpperCase();
        t.fecha_registro = new Date().toISOString();
        t.estado = 'activo';
        arr.push(t);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr));
        return t;
    },
    
    updateTrabajador: function(id, data) {
        let arr = this.getTrabajadores();
        arr = arr.map(t => t.id === id ? { ...t, ...data } : t);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr));
    },
    
    deleteTrabajador: function(id) {
        let arr = this.getTrabajadores();
        arr = arr.filter(t => t.id !== id);
        localStorage.setItem('rayoshield_trabajadores', JSON.stringify(arr));
        let resultados = this.getResultados();
        resultados = resultados.filter(r => r.trabajador_id !== id);
        localStorage.setItem('rayoshield_resultados', JSON.stringify(resultados));
    },
    
    getTrabajadorById: function(id) { 
        return this.getTrabajadores().find(t => t.id === id); 
    },
    
    setTrabajadorActual: function(id) { 
        localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(id)); 
    },
    
    getTrabajadorActual: function() { 
        const id = JSON.parse(localStorage.getItem('rayoshield_trabajador_actual')); 
        return id ? this.getTrabajadorById(id) : null; 
    },
    
    clearTrabajadorActual: function() { 
        localStorage.setItem('rayoshield_trabajador_actual', JSON.stringify(null)); 
    },
    
    getResultados: function() { 
        return JSON.parse(localStorage.getItem('rayoshield_resultados') || '[]'); 
    },
    
    addResultado: function(r) {
        const arr = this.getResultados();
        r.id = 'RES-' + Date.now().toString(36).toUpperCase();
        r.fecha = new Date().toISOString();
        arr.push(r);
        localStorage.setItem('rayoshield_resultados', JSON.stringify(arr));
    },
    
    getResultadosByTrabajador: function(id) { 
        return this.getResultados().filter(r => r.trabajador_id === id); 
    },
    
    getProgresoByTrabajador: function(id) {
        const resultados = this.getResultadosByTrabajador(id);
        const examenes = resultados.filter(r => r.tipo === 'examen');
        const casos = resultados.filter(r => r.tipo === 'caso');
        return {
            total_examenes: examenes.length,
            examenes_aprobados: examenes.filter(r => r.aprobado).length,
            total_casos: casos.length,
            casos_completados: casos.filter(r => r.aprobado).length,
            promedio: examenes.length ? Math.round(examenes.reduce((a, b) => a + b.puntaje, 0) / examenes.length) : 0
        };
    },
    
    getEstadisticas: function() {
        const trabajadores = this.getTrabajadores();
        const resultados = this.getResultados();
        const activos = trabajadores.filter(t => t.estado === 'activo').length;
        const examenesTotales = resultados.filter(r => r.tipo === 'examen').length;
        const casosTotales = resultados.filter(r => r.tipo === 'caso').length;
        const aprobados = resultados.filter(r => r.aprobado).length;
        return {
            trabajadores_totales: trabajadores.length,
            trabajadores_activos: activos,
            examenes_totales: examenesTotales,
            casos_totales: casosTotales,
            tasa_aprobacion: resultados.length ? Math.round((aprobados / resultados.length) * 100) : 0
        };
    }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM listo');
    app.init();
});

window.addEventListener('beforeunload', function() {
    if (app.timerExamen) clearInterval(app.timerExamen);
    if (app.timerCaso) clearInterval(app.timerCaso);
});
