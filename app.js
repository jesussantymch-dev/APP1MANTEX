// URL de la API en Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbzl-FWY-i0gq7dCB2mPY3-q3YtOuBnWkJOvyYX8UulTBzQdgorbFTgBBSJLuV-sPzQ_/exec";
// Variables globales
let maquinaActualCodigo = "";
let html5QrcodeScanner = null;

// --- ELEMENTOS DEL DOM ---
const pantalla1 = document.getElementById("pantalla-1");
const pantalla2 = document.getElementById("pantalla-2");
const pantallaNuevaMaq = document.getElementById("pantalla-nueva-maquina");

const btnEscanearQR = document.getElementById("btn-escanear-qr");
const btnIngresarCodigo = document.getElementById("btn-ingresar-codigo");
const btnAtras = document.getElementById("btn-atras");

// Botones y formulario de máquina nueva
const btnAbrirFormMaq = document.getElementById("btn-abrir-form-maquina");
const btnAtrasFormMaq = document.getElementById("btn-atras-form-maquina");
const formNuevaMaq = document.getElementById("form-nueva-maquina");

const btnPestanaCorrectivo = document.getElementById("btn-pestana-correctivo");
const btnPestanaPreventivo = document.getElementById("btn-pestana-preventivo");
const vistaCorrectivo = document.getElementById("vista-correctivo");
const vistaPreventivo = document.getElementById("vista-preventivo");

// --- INICIALIZACIÓN Y OCULTAMIENTO INICIAL ---
document.addEventListener("DOMContentLoaded", () => {
    const qrContainer = document.getElementById("lector-qr-container");
    if (qrContainer) {
        qrContainer.style.display = "none";
    }
});

// --- NAVEGACIÓN ENTRE PANTALLAS ---
function mostrarPantalla(pantallaMostrar) {
    pantalla1.classList.remove("activa");
    pantalla2.classList.remove("activa");
    if (pantallaNuevaMaq) pantallaNuevaMaq.classList.remove("activa");

    pantalla1.classList.add("oculto");
    pantalla2.classList.add("oculto");
    if (pantallaNuevaMaq) pantallaNuevaMaq.classList.add("oculto");

    pantallaMostrar.classList.remove("oculto");
    pantallaMostrar.classList.add("activa");
}

btnAtras.addEventListener("click", () => {
    mostrarPantalla(pantalla1);
    
    const imgElemento = document.getElementById("img-maquina-detalle");
    if (imgElemento) imgElemento.src = ""; 
    
    const contenedorDatos = document.getElementById("datos-maquina-contenido");
    if (contenedorDatos) contenedorDatos.innerHTML = "";
});

if (btnAbrirFormMaq) {
    btnAbrirFormMaq.addEventListener("click", () => {
        mostrarPantalla(pantallaNuevaMaq);
        cargarEncabezadosNuevaMaquina();
    });
}

if (btnAtrasFormMaq) {
    btnAtrasFormMaq.addEventListener("click", () => {
        mostrarPantalla(pantalla1);
        if (formNuevaMaq) formNuevaMaq.reset();
    });
}

// --- PESTAÑAS (CORRECTIVO / PREVENTIVO) ---
btnPestanaCorrectivo.addEventListener("click", () => {
    btnPestanaCorrectivo.classList.add("activa");
    btnPestanaPreventivo.classList.remove("activa");
    vistaCorrectivo.classList.remove("oculto");
    vistaPreventivo.classList.add("oculto");
});

btnPestanaPreventivo.addEventListener("click", () => {
    btnPestanaPreventivo.classList.add("activa");
    btnPestanaCorrectivo.classList.remove("activa");
    vistaPreventivo.classList.remove("oculto");
    vistaCorrectivo.classList.add("oculto");
});

// --- INGRESO DE CÓDIGO Y LECTOR QR ---
btnIngresarCodigo.addEventListener("click", () => {
    abrirModalBusquedaPrincipal();
});

btnEscanearQR.addEventListener("click", () => {
    const qrContainer = document.getElementById("lector-qr-container");
    if (qrContainer) {
        qrContainer.style.display = "block";
    }

    // Configurado con facingMode: "environment" para forzar la cámara posterior
    html5QrcodeScanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: 250,
        aspectRatio: 1.0,
        facingMode: "environment" 
    });

    html5QrcodeScanner.render((decodedText) => {
        html5QrcodeScanner.clear();
        if (qrContainer) qrContainer.style.display = "none";
        cargarMaquinaYPantalla2(decodedText.trim());
    }, (error) => {
        // Silenciar errores de escaneo
    });
});

const btnCerrarQr = document.getElementById("btn-cerrar-qr");
if (btnCerrarQr) {
    btnCerrarQr.addEventListener("click", () => {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
        }
        const qrContainer = document.getElementById("lector-qr-container");
        if (qrContainer) qrContainer.style.display = "none";
    });
}

// --- FUNCIÓN PARA SELECCIONAR LA IMAGEN LOCAL EXACTA ---
function obtenerRutaImagen(tipoMaquina) {
    if (!tipoMaquina) return "Recta mecánica.jpg";
    
    const tipo = tipoMaquina.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    if (tipo.includes("recta mecanica")) {
        return "Recta mecánica.jpg";
    } else if (tipo.includes("cerradora perimetral")) {
        return "Cerradora perimetral.JPG";
    } else if (tipo.includes("remalladora mecanica")) {
        return "remalladora mecanica.JPG";
    } else if (tipo.includes("remalladora automatica/neumatica")) {
        return "Remalladora neumatica.jpg"; 
    } else if (tipo.includes("cerradora estatica") || tipo.includes("encintadora")) {
        return "Cerradora estatica.JFIF";
    } else if (tipo.includes("pilera automatica")) {
        return "Pilera.png";
    } else if (tipo.includes("corregidora")) {
        return "corregidora.jpg";
    } else if (tipo.includes("cerradora automatica")) {
        return "cerradora automática.jpg";
    } else if (tipo.includes("plana")) {
        return "Plana.jpg";
    } else if (tipo.includes("recta triple arrastre")) {
        return "Recta triple arrastre.jpg";
    }

    return "Recta mecánica.jpg"; 
}

// --- CARGAR DATOS CON SOPORTE OFFLINE ---
function cargarMaquinaYPantalla2(codigo) {
    maquinaActualCodigo = codigo;
    mostrarPantalla(pantalla2);

    const contenedorDatos = document.getElementById("datos-maquina-contenido");
    const imgElemento = document.getElementById("img-maquina-detalle");
    
    if (imgElemento) {
        imgElemento.src = ""; 
        imgElemento.alt = "Cargando...";
    }
    
    contenedorDatos.innerHTML = "<p style='color: var(--primary); font-weight: 600;'>⏳ Cargando...</p>";

    const buscarLocalmenteYMostrar = () => {
        const localCache = localStorage.getItem("cache_base_datos_maquinas");
        if (localCache) {
            try {
                const maquinas = JSON.parse(localCache);
                const codigoLim = codigo.toString().toLowerCase().trim();
                const encontrada = maquinas.find(m => {
                    for (const val of Object.values(m)) {
                        if (val && val.toString().toLowerCase().trim() === codigoLim) return true;
                    }
                    return false;
                });

                if (encontrada) {
                    procesarDatosMaquina(encontrada, contenedorDatos, imgElemento);
                    return true;
                }
            } catch (e) {
                console.error("Error leyendo caché local:", e);
            }
        }
        return false;
    };

    fetch(`${API_URL}?action=getMaquina&codigo=${encodeURIComponent(codigo)}`)
        .then(response => response.json())
        .then(result => {
            if (result.status === "success") {
                procesarDatosMaquina(result.data, contenedorDatos, imgElemento);
            } else {
                if (!buscarLocalmenteYMostrar()) {
                    contenedorDatos.innerHTML = `<p style="color: var(--danger); font-weight: 600;">⚠️ ${result.message}</p>`;
                }
            }
        })
        .catch(error => {
            console.warn("Fallo de red detectado, usando copia local...", error);
            if (!buscarLocalmenteYMostrar()) {
                contenedorDatos.innerHTML = "<p style='color: var(--danger);'>Error de conexión y sin datos locales disponibles.</p>";
            }
        });

    cargarHistorial("Correctivo", "historial-correctivo");
    cargarHistorial("Preventivo", "historial-preventivo");
}

function procesarDatosMaquina(data, contenedorDatos, imgElemento) {
    let htmlPrincipales = "";
    let htmlAdicionales = "";
    let tipoMaquina = "";
    let codigoMaquina = "";
    let imagenPersonalizada = "";
    let contadorCampos = 0;

    for (const [key, value] of Object.entries(data)) {
        const claveLower = key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (claveLower === "codigo" || claveLower === "nrocodigo" || claveLower === "codigomaquina") {
            codigoMaquina = value;
        }

        if (claveLower === "qr" || claveLower === "codigo qr") continue;

        if (claveLower === "maquina" || claveLower.includes("tipo de maquina")) {
            tipoMaquina = value;
        }

        if (claveLower === "imagen" || claveLower === "imagen_url" || claveLower === "foto") {
            imagenPersonalizada = value;
        }

        const valorTexto = value !== undefined && value !== null && value !== "" ? value : "-";
        const itemHtml = `<p><strong>${key}:</strong> ${valorTexto}</p>`;

        contadorCampos++;
        if (contadorCampos <= 5) {
            htmlPrincipales += itemHtml;
        } else {
            htmlAdicionales += itemHtml;
        }
    }

    let htmlFinal = htmlPrincipales;

    if (htmlAdicionales !== "") {
        htmlFinal += `
            <div id="datos-adicionales" class="oculto" style="margin-top: 6px;">
                ${htmlAdicionales}
            </div>
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
                <button type="button" id="btn-toggle-detalles" class="btn-mas-datos" onclick="toggleDetallesMaquina()" style="margin-top: 0;">Mas....</button>
                <button type="button" id="btn-mostrar-qr-modal" class="btn-mas-datos" onclick="toggleModalQr()" style="background-color: #2563eb; margin-top: 0;">Qr</button>
            </div>
        `;
    } else {
        htmlFinal += `
            <div style="margin-top: 8px;">
                <button type="button" id="btn-mostrar-qr-modal" class="btn-mas-datos" onclick="toggleModalQr()" style="background-color: #2563eb; margin-top: 0;">Qr</button>
            </div>
        `;
    }

    if (imgElemento) {
        if (imagenPersonalizada && imagenPersonalizada.startsWith("http")) {
            imgElemento.src = imagenPersonalizada;
        } else {
            imgElemento.src = obtenerRutaImagen(tipoMaquina);
        }
        imgElemento.alt = tipoMaquina || "Máquina de confección";
        imgElemento.style.display = "block";
        
        imgElemento.onerror = function() {
            this.src = obtenerRutaImagen(tipoMaquina); 
        };
    }

    contenedorDatos.innerHTML = htmlFinal;

    const modalQrCanvas = document.getElementById("modal-qr-code-canvas");
    const modalTextoQr = document.getElementById("modal-texto-codigo-qr");
    const modalBtnImprimir = document.getElementById("modal-btn-imprimir-etiqueta");

    if (modalQrCanvas && codigoMaquina) {
        modalQrCanvas.innerHTML = ""; 
        
        new QRCode(modalQrCanvas, {
            text: codigoMaquina.toString(),
            width: 130,
            height: 130,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        modalTextoQr.innerText = codigoMaquina;

        if (modalBtnImprimir) {
            modalBtnImprimir.onclick = function() {
                const ventanaImpresion = window.open('', '', 'width=450,height=550');
                ventanaImpresion.document.write(`
                    <html>
                        <head>
                            <title>Etiqueta QR - ${codigoMaquina}</title>
                            <style>
                                @page { size: auto; margin: 0; }
                                body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 10px; display: flex; justify-content: center; align-items: center; height: 98vh; box-sizing: border-box; }
                                .etiqueta-box { border: 2px dashed #333; padding: 20px; border-radius: 8px; display: inline-block; background: #fff; text-align: center; max-width: 100%; }
                                h2 { margin: 0 0 15px 0; color: #111; font-size: 18px; text-align: center; }
                                .qr-container { display: flex; justify-content: center; margin: 0 auto; }
                                .qr-container img, .qr-container canvas { max-width: 130px; height: auto; }
                                p { font-size: 16px; font-weight: bold; margin: 15px 0 0 0; color: #222; text-align: center; }
                            </style>
                        </head>
                        <body>
                            <div class="etiqueta-box">
                                <h2>${tipoMaquina || 'Máquina Textil'}</h2>
                                <div class="qr-container">${modalQrCanvas.innerHTML}</div>
                                <p>${codigoMaquina}</p>
                            </div>
                            <script>
                                window.onload = function() {
                                    window.print();
                                    window.close();
                                }
                            <\/script>
                        </body>
                    </html>
                `);
                ventanaImpresion.document.close();
            };
        }
    }
}

function toggleDetallesMaquina() {
    const divAdicionales = document.getElementById("datos-adicionales");
    const botonDetalles = document.getElementById("btn-toggle-detalles");

    if (divAdicionales.classList.contains("oculto")) {
        divAdicionales.classList.remove("oculto");
        botonDetalles.innerText = "Menos....";
    } else {
        divAdicionales.classList.add("oculto");
        botonDetalles.innerText = "Mas....";
    }
}

function toggleModalQr() {
    const modal = document.getElementById("modal-qr-container");
    if (modal) {
        modal.style.display = modal.style.display === "flex" ? "none" : "flex";
    }
}

function cargarHistorial(tipo, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;
    contenedor.innerHTML = "<p style='color: var(--text-muted);'>Cargando historial...</p>";

    fetch(`${API_URL}?action=getHistorial&codigo=${encodeURIComponent(maquinaActualCodigo)}&tipo=${tipo}`)
        .then(res => res.json())
        .then(result => {
            if (result.status === "success" && result.data.length > 0) {
                let html = "";
                result.data.slice().reverse().forEach(item => {
                    html += `<div class="tarjeta-historial" style="border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 8px; border-radius: 6px;">`;
                    for (const [key, val] of Object.entries(item)) {
                        if (val) html += `<p><strong>${key}:</strong> ${val}</p>`;
                    }
                    html += `</div>`;
                });
                contenedor.innerHTML = html;
            } else {
                contenedor.innerHTML = "<p style='color: var(--text-muted); font-size: 0.85rem;'>No hay registros guardados.</p>";
            }
        })
        .catch(err => {
            contenedor.innerHTML = "<p style='color: var(--text-muted); font-size: 0.85rem;'>Historial no disponible sin conexión.</p>";
        });
}

function cargarEncabezadosNuevaMaquina() {
    const contenedor = document.getElementById("contenedor-inputs-dinamicos");
    if (!contenedor) return;
    
    contenedor.innerHTML = "<p style='color: var(--primary); font-weight: 600;'>⏳ Cargando campos...</p>";

    fetch(`${API_URL}?action=getEncabezados`)
        .then(res => res.json())
        .then(result => {
            if (result.status === "success") {
                renderizarFormularioNuevaMaquina(result.data);
            } else {
                usarEncabezadosLocalesFallback(contenedor);
            }
        })
        .catch(err => {
            usarEncabezadosLocalesFallback(contenedor);
        });
}

function usarEncabezadosLocalesFallback(contenedor) {
    const localCache = localStorage.getItem("cache_base_datos_maquinas");
    if (localCache) {
        try {
            const maquinas = JSON.parse(localCache);
            if (maquinas.length > 0) {
                const headers = Object.keys(maquinas[0]);
                renderizarFormularioNuevaMaquina(headers);
                return;
            }
        } catch (e) {}
    }
    contenedor.innerHTML = "<p style='color: var(--danger); font-size: 0.85rem;'>No se pudieron cargar los campos (Sin conexión).</p>";
}

function renderizarFormularioNuevaMaquina(headersData) {
    const contenedor = document.getElementById("contenedor-inputs-dinamicos");
    if (!contenedor) return;

    let html = "";
    const tiposMaquinasUnicos = [
        "Recta mecánica", "Cerradora perimetral", "Remalladora mecánica",
        "Remalladora automática/neumática", "Cerradora estática", "Pilera automática",
        "Corregidora", "Cerradora automática", "Plana", "Recta triple arrastre"
    ];

    const ejemplosPremaa03 = {
        "marca": "PEGASUS",
        "modelo": "EX3216H - A05",
        "n° de serie": "7152369",
        "motor m/s": "HO HSING (S)",
        "modelo motor": "M7-55-D",
        "n°serie de motor": "H20S00019",
        "servo controlador": "HO HSING",
        "modelo servo control": "i90M-4-LT-220",
        "n° serie servocontrolador": "H20S00019",
        "area": "Colchones de resorte"
    };

    headersData.forEach((header, index) => {
        const headerLower = header.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (headerLower === "qr" || headerLower === "codigo qr" || headerLower === "codigo") return; 

       if (headerLower === "maquina" || headerLower.includes("tipo de maquina")) {
            let opcionesHtml = `<option value="" disabled selected style="color: #94a3b8;">Opciones</option>`;
            tiposMaquinasUnicos.forEach(tipo => { opcionesHtml += `<option value="${tipo}">${tipo}</option>`; });
            opcionesHtml += `<option value="AGREGAR_ NUEVO">➕ Agregar nuevo...</option>`;

            html += `
                <div class="grupo-input" style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1e293b;">${header}:</label>
                    <select id="input-dinamico-${index}" name="${header}" onchange="manejarCambioSelectMaquina(this)" style="width: 100%; padding: 12px 14px; border: 1.5px solid #cbd5e1; border-radius: 8px; background-color: #ffffff; color: #0f172a; font-size: 0.95rem; font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.05); cursor: pointer; appearance: none; background-image: url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%2364748b\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;">
                        ${opcionesHtml}
                    </select>
                    <input type="text" id="input-nuevo-${index}" name="${header}_nuevo" placeholder="Escriba el nuevo tipo de máquina" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 8px; display: none;" />
                </div>
            `;
        } else {
            let ejemploTexto = "Ingrese " + header;
            for (const [key, val] of Object.entries(ejemplosPremaa03)) {
                if (headerLower.includes(key) || key.includes(headerLower)) {
                    ejemploTexto = `Ej: ${val}`;
                    break;
                }
            }

            html += `
                <div class="grupo-input" style="margin-bottom: 15px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 5px;">${header}:</label>
                    <input type="text" id="input-dinamico-${index}" name="${header}" placeholder="${ejemploTexto}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;">
                </div>
            `;
        }
    });

    html += `
        <div class="grupo-input" style="margin-bottom: 15px; background: #f8fafc; padding: 12px; border: 1px dashed #cbd5e1; border-radius: 8px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #1e293b;">Fotografía de la Máquina (Opcional):</label>
            <p style="font-size: 0.8rem; color: #64748b; margin-top: 0; margin-bottom: 8px;">Toma una foto directa o selecciona un archivo existente.</p>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <label style="flex: 1; min-width: 130px; background: #2563eb; color: white; padding: 8px 12px; border-radius: 6px; text-align: center; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                    📸 Tomar Foto
                    <input type="file" accept="image/*" capture="environment" style="display: none;" onchange="previsualizarImagenNueva(this)">
                </label>
                
                <label style="flex: 1; min-width: 130px; background: #64748b; color: white; padding: 8px 12px; border-radius: 6px; text-align: center; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                    📂 Galería / Archivo
                    <input type="file" accept="image/*" style="display: none;" onchange="previsualizarImagenNueva(this)">
                </label>
            </div>

            <input type="file" id="input-imagen-maquina" accept="image/*" style="display: none;">

            <div id="preview-contenedor-imagen" style="margin-top: 10px; text-align: center; display: none;">
                <img id="img-preview-maquina" src="" alt="Vista previa" style="max-height: 120px; border-radius: 6px; border: 1px solid #cbd5e1;">
            </div>
        </div>
    `;

    contenedor.innerHTML = html;
}

function previsualizarImagenNueva(input) {
    const previewContenedor = document.getElementById("preview-contenedor-imagen");
    const imgPreview = document.getElementById("img-preview-maquina");
    const inputOcultoReal = document.getElementById("input-imagen-maquina");

    if (input.files && input.files[0]) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(input.files[0]);
        inputOcultoReal.files = dataTransfer.files;

        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            previewContenedor.style.display = "block";
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        imgPreview.src = "";
        previewContenedor.style.display = "none";
    }
}

function manejarCambioSelectMaquina(selectElement) {
    const idInputNuevo = selectElement.id.replace("input-dinamico-", "input-nuevo-");
    const inputNuevo = document.getElementById(idInputNuevo);
    if (inputNuevo) {
        if (selectElement.value === "AGREGAR_ NUEVO") {
            inputNuevo.style.display = "block";
            inputNuevo.required = true;
            inputNuevo.focus();
        } else {
            inputNuevo.style.display = "none";
            inputNuevo.required = false;
            inputNuevo.value = "";
        }
    }
}

if (formNuevaMaq) {
    formNuevaMaq.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputs = formNuevaMaq.querySelectorAll("#contenedor-inputs-dinamicos input, #contenedor-inputs-dinamicos select");
        const nuevaMaquina = { action: "saveNuevaMaquina" };
        let descripcionMaquina = "";

        inputs.forEach((input) => {
            let nombreColumna = input.name;
            let valorInput = input.value.trim();

            if (input.tagName === "SELECT" && valorInput === "AGREGAR_ NUEVO") {
                const inputNuevoAsociado = input.parentElement.querySelector("input[type='text']");
                if (inputNuevoAsociado && inputNuevoAsociado.value.trim() !== "") {
                    valorInput = inputNuevoAsociado.value.trim();
                }
            }
            if (!nombreColumna.endsWith("_nuevo") && nombreColumna) {
                nuevaMaquina[nombreColumna] = valorInput;
            }
            const colLower = nombreColumna.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if ((colLower === "maquina" || colLower.includes("tipo de maquina")) && valorInput) {
                descripcionMaquina = valorInput;
            }
        });

        if (!descripcionMaquina) {
            alert("Por favor, seleccione o ingrese el tipo de máquina.");
            return;
        }

        const inputArchivo = document.getElementById("input-imagen-maquina");
        const boton = e.submitter;
        const textoOriginal = boton.innerText;
        boton.innerText = "⏳ Guardando...";
        boton.disabled = true;

        const enviarPeticionFinal = (imagenBase64 = "") => {
            if (imagenBase64) {
                nuevaMaquina["imagen_url"] = imagenBase64;
            }

            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(nuevaMaquina)
            })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    alert(`¡Máquina guardada con éxito! Código asignado: ${res.codigo}`);
                    formNuevaMaq.reset();
                    document.getElementById("preview-contenedor-imagen").style.display = "none";
                    localStorage.removeItem("cache_base_datos_maquinas"); 
                    mostrarPantalla(pantalla1);
                } else {
                    alert("Error: " + res.message);
                }
            })
            .catch(error => {
                alert("Ocurrió un error de red al intentar guardar la máquina.");
            })
            .finally(() => {
                boton.innerText = textoOriginal;
                boton.disabled = false;
            });
        };

        if (inputArchivo && inputArchivo.files && inputArchivo.files[0]) {
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                enviarPeticionFinal(uploadEvent.target.result);
            };
            reader.onerror = function() {
                enviarPeticionFinal("");
            };
            reader.readAsDataURL(inputArchivo.files[0]);
        } else {
            enviarPeticionFinal("");
        }
    });
}

const formCorrectivo = document.getElementById("form-correctivo");
if (formCorrectivo) {
    formCorrectivo.addEventListener("submit", (e) => {
        e.preventDefault();
        const tecnico = document.getElementById("corr-tecnico").value.trim();
        const horaInicio = document.getElementById("corr-hora-inicio").value;
        const horaFin = document.getElementById("corr-hora-fin").value;
        const fallas = Array.from(document.querySelectorAll('input[name="fallas"]:checked')).map(cb => cb.value).join(", ");
        const otrosProblemas = document.getElementById("corr-otros-problemas").value.trim();
        const hallazgos = Array.from(document.querySelectorAll('input[name="hallazgos"]:checked')).map(cb => cb.value).join(", ");
        const otrosHallazgos = document.getElementById("corr-otros-hallazgos").value.trim();

        if (!tecnico) { alert("Por favor, ingrese el nombre del técnico."); return; }
        if (!fallas && !otrosProblemas) { alert("Seleccione al menos una falla o describa un problema."); return; }

        const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        const datos = {
            action: "saveCorrectivo", codigo: maquinaActualCodigo, fecha_hora: fechaActual,
            tecnico, hora_inicio: horaInicio, hora_fin: horaFin,
            fallas_checklist: fallas, otros_problemas: otrosProblemas,
            hallazgos_checklist: hallazgos, otros_hallazgos: otrosHallazgos
        };
        enviarDatos(datos, formCorrectivo, "historial-correctivo", "Correctivo", e.submitter);
    });
}

const formPreventivo = document.getElementById("form-preventivo");
if (formPreventivo) {
    formPreventivo.addEventListener("submit", (e) => {
        e.preventDefault();
        const tecnico = document.getElementById("prev-tecnico").value.trim();
        const horaInicio = document.getElementById("prev-hora-inicio").value;
        const horaFin = document.getElementById("prev-hora-fin").value;
        const actividades = Array.from(document.querySelectorAll('input[name="actividades"]:checked')).map(cb => cb.value).join(", ");
        const observaciones = document.getElementById("prev-observaciones").value.trim();

        if (!tecnico) { alert("Por favor, ingrese el nombre del técnico."); return; }
        if (!actividades && !observaciones) { alert("Seleccione al menos una actividad o agregue una observación."); return; }

        const fechaActual = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        const datos = {
            action: "savePreventivo", codigo: maquinaActualCodigo, fecha_hora: fechaActual,
            tecnico, hora_inicio: horaInicio, hora_fin: horaFin,
            actividades_checklist: actividades, observaciones
        };
        enviarDatos(datos, formPreventivo, "historial-preventivo", "Preventivo", e.submitter);
    });
}

function enviarDatos(datos, formulario, idHistorial, tipo, boton) {
    const textoOriginal = boton.innerText;
    boton.innerText = "⏳ Guardando...";
    boton.disabled = true;

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(datos)
    })
    .then(res => res.json())
    .then(res => {
        alert("¡Registro de Mantenimiento Guardado Exitosamente!");
        formulario.reset();
        cargarHistorial(tipo, idHistorial);
    })
    .catch(error => {
        alert("Error de red al intentar guardar el mantenimiento.");
    })
    .finally(() => {
        boton.innerText = textoOriginal;
        boton.disabled = false;
    });
}

// --- BÚSQUEDA AVANZADA CON PERSISTENCIA EN LOCALSTORAGE ---

let cacheBaseDatos = null; 

function cerrarModalBusqueda() {
    const modal = document.getElementById("modal-busqueda-avanzada");
    if (modal) modal.style.display = "none";
}

function abrirModalBusquedaPrincipal() {
    const modal = document.getElementById("modal-busqueda-avanzada");
    const titulo = document.getElementById("titulo-modal-busqueda");
    const contenido = document.getElementById("contenido-modal-busqueda");
    
    titulo.innerText = "🔍 Buscar máquina por:";
    contenido.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn" onclick="seleccionarCriterioBusqueda('codigo')" style="background: #1d4ed8; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Código</button>
            <button class="btn" onclick="seleccionarCriterioBusqueda('maquina')" style="background: #2563eb; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Máquina</button>
            <button class="btn" onclick="seleccionarCriterioBusqueda('marca')" style="background: #2563eb; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Marca</button>
            <button class="btn" onclick="seleccionarCriterioBusqueda('modelo')" style="background: #2563eb; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Modelo</button>
            <button class="btn" onclick="seleccionarCriterioBusqueda('serie')" style="background: #059669; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Número de Serie</button>
        </div>
    `;
    modal.style.display = "flex";
}

function obtenerDatosParaBusqueda(callback) {
    if (cacheBaseDatos) {
        callback(cacheBaseDatos);
        return;
    }

    const localCache = localStorage.getItem("cache_base_datos_maquinas");
    if (localCache) {
        try {
            cacheBaseDatos = JSON.parse(localCache);
            callback(cacheBaseDatos);
            actualizarCacheSilenciosa();
            return;
        } catch (e) {
            console.error("Error al parsear localStorage:", e);
        }
    }

    const contenido = document.getElementById("contenido-modal-busqueda");
    contenido.innerHTML = "<p style='text-align: center; color: var(--primary);'>⏳ Sincronizando datos desde la nube...</p>";

    fetch(`${API_URL}?action=getTodoCompleto`)
        .then(res => res.json())
        .then(res => {
            let listaMaquinas = procesarRespuestaMaquinas(res);
            if (listaMaquinas && listaMaquinas.length > 0) {
                cacheBaseDatos = listaMaquinas;
                localStorage.setItem("cache_base_datos_maquinas", JSON.stringify(listaMaquinas));
                callback(cacheBaseDatos);
            } else {
                contenido.innerHTML = `<p style='text-align: center; color: var(--danger);'>Error: No se encontraron máquinas en la respuesta.</p>`;
            }
        })
        .catch(err => {
            contenido.innerHTML = `<p style='text-align: center; color: var(--danger);'>⚠️ Sin conexión a internet y sin copia local previa.</p>`;
        });
}

function actualizarCacheSilenciosa() {
    fetch(`${API_URL}?action=getTodoCompleto`)
        .then(res => res.json())
        .then(res => {
            let listaMaquinas = procesarRespuestaMaquinas(res);
            if (listaMaquinas && listaMaquinas.length > 0) {
                cacheBaseDatos = listaMaquinas;
                localStorage.setItem("cache_base_datos_maquinas", JSON.stringify(listaMaquinas));
            }
        })
        .catch(() => {});
}

function procesarRespuestaMaquinas(res) {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
        const claveArray = Object.keys(res).find(key => Array.isArray(res[key]));
        if (claveArray) return res[claveArray];
        const valores = Object.values(res);
        if (valores.length > 0 && typeof valores[0] === 'object') return valores;
    }
    return null;
}

function seleccionarCriterioBusqueda(criterio) {
    const titulo = document.getElementById("titulo-modal-busqueda");
    const contenido = document.getElementById("contenido-modal-busqueda");

    if (criterio === "serie") {
        titulo.innerText = "🔢 Digitar Nro. de Serie";
        contenido.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <input type="text" id="input-buscar-serie" placeholder="Ej. SERIE-12345" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box;">
                <button class="btn" onclick="ejecutarBusquedaPorSerie()" style="background: #059669; color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Buscar Serie</button>
                <button class="btn" onclick="abrirModalBusquedaPrincipal()" style="background: #64748b; color: white; padding: 8px; border: none; border-radius: 6px; cursor: pointer;">⬅️ Volver</button>
            </div>
        `;
        document.getElementById("input-buscar-serie").focus();
        return;
    }

    titulo.innerText = `Seleccione ${criterio.toUpperCase()}`;
    
    obtenerDatosParaBusqueda((maquinas) => {
        let claveReal = "";
        if (maquinas.length > 0) {
            const keys = Object.keys(maquinas[0]);
            claveReal = keys.find(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(criterio)) || criterio;
        }

        let valoresUnicos = [...new Set(maquinas.map(m => m[claveReal]).filter(val => val !== undefined && val !== null && val.toString().trim() !== ""))];

        valoresUnicos.sort((a, b) => {
            return a.toString().localeCompare(b.toString(), 'es', { numeric: true, sensitivity: 'base' });
        });

        if (valoresUnicos.length === 0) {
            contenido.innerHTML = `<p style='text-align: center; color: var(--text-muted);'>No se encontraron registros para ${criterio}.</p><br><button class="btn" onclick="abrirModalBusquedaPrincipal()" style="width: 100%; background: #64748b; color: white; padding: 8px; border: none; border-radius: 6px; cursor: pointer;">Volver</button>`;
            return;
        }

        let html = `<div style="display: flex; flex-direction: column; gap: 6px; max-height: 220px; overflow-y: auto;">`;
        valoresUnicos.forEach(val => {
            html += `<button class="btn" onclick="filtrarMaquinasPorValor('${claveReal}', '${encodeURIComponent(val)}')" style="background: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 8px 12px; border-radius: 6px; text-align: left; cursor: pointer; font-size: 0.9rem;">${val}</button>`;
        });
        html += `</div><button class="btn" onclick="abrirModalBusquedaPrincipal()" style="width: 100%; background: #64748b; color: white; padding: 8px; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px;">⬅️ Volver</button>`;
        
        contenido.innerHTML = html;
    });
}

function filtrarMaquinasPorValor(clave, valorCodificado) {
    const valorSeleccionado = decodeURIComponent(valorCodificado).trim().toLowerCase();
    const titulo = document.getElementById("titulo-modal-busqueda");
    const contenido = document.getElementById("contenido-modal-busqueda");

    titulo.innerText = `Coincidencias: ${decodeURIComponent(valorCodificado)}`;
    
    const filtradas = cacheBaseDatos.filter(m => {
        const val = m[clave];
        if (!val) return false;
        return val.toString().trim().toLowerCase() === valorSeleccionado;
    });

    let html = `<div style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">`;
    
    if (filtradas.length === 0) {
        html += `<p style='text-align: center; color: #64748b;'>No se encontraron máquinas para esta selección.</p>`;
    } else {
        filtradas.forEach(maq => {
            const keys = Object.keys(maq);
            const kCodigo = keys.find(k => k.toLowerCase().includes("codigo")) || keys[0];
            const kTipo = keys.find(k => k.toLowerCase().includes("maquina") || k.toLowerCase().includes("modelo") || k.toLowerCase().includes("marca")) || keys[1];
            
            const codigoVal = maq[kCodigo] || "Sin código";
            const descVal = maq[kTipo] || "";

            html += `
                <div onclick="seleccionarMaquinaYCerrar('${codigoVal}')" style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f8fafc'">
                    <p style="margin: 0; font-weight: bold; color: #2563eb;">${codigoVal}</p>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #475569;">${descVal}</p>
                </div>
            `;
        });
    }
    
    html += `</div><button class="btn" onclick="abrirModalBusquedaPrincipal()" style="width: 100%; background: #64748b; color: white; padding: 8px; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px;">⬅️ Volver</button>`;
    contenido.innerHTML = html;
}

function ejecutarBusquedaPorSerie() {
    const inputSerie = document.getElementById("input-buscar-serie");
    const serieBuscada = inputSerie.value.trim().toLowerCase();

    if (!serieBuscada) {
        alert("Por favor, ingrese un número de serie.");
        return;
    }

    obtenerDatosParaBusqueda((maquinas) => {
        const encontrada = maquinas.find(maq => {
            for (const [key, val] of Object.entries(maq)) {
                if (key.toLowerCase().includes("serie") && val && val.toString().trim().toLowerCase().includes(serieBuscada)) {
                    return true;
                }
            }
            return false;
        });

        if (encontrada) {
            const keys = Object.keys(encontrada);
            const kCodigo = keys.find(k => k.toLowerCase().includes("codigo")) || keys[0];
            const codigoVal = encontrada[kCodigo];
            
            cerrarModalBusqueda();
            cargarMaquinaYPantalla2(codigoVal);
        } else {
            alert("No se encontró ninguna máquina con ese número de serie.");
        }
    });
}

function seleccionarMaquinaYCerrar(codigo) {
    cerrarModalBusqueda();
    cargarMaquinaYPantalla2(codigo);
}