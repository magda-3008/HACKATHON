document.getElementById('logo').addEventListener('click', () => {
    window.location.href = 'home2.html';
});

document.addEventListener("DOMContentLoaded", () => {
    const perfilItem = document.getElementById("perfilItem");

    // Revisar si hay sesión iniciada
    const userId = sessionStorage.getItem("userId");

    if (userId) {
        // Usuario logueado → mostrar perfil
        perfilItem.innerHTML = `<a href="perfilusuario.html">Mi perfil</a>`;
    } else {
        // Usuario NO logueado → mostrar registrarse
        perfilItem.innerHTML = `<a href="signup.html">Regístrate</a>`;
    }
});

// --- refs DOM ---
const transportContainer = document.getElementById("transportContainer");
const rutaSelect = document.getElementById("rutaSelect");
let cardSeleccionada = null;

let TRANSPORTES_DATA = {};
let RUTA_NOMBRES = {};

// ----------------- Cargar transportes -----------------
async function cargarTransportes() {
    try {
        const res = await fetch("/transportes");
        const data = await res.json();
        TRANSPORTES_DATA = data.transportes || {};
        RUTA_NOMBRES = data.rutas || {};
        renderTransportes();
    } catch (error) {
        console.error("Error cargando transportes:", error);
        transportContainer.innerHTML = `<div class="alert alert-danger">Error al cargar transportes</div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarTransportes();
    mostrarCarrito();
});

// ----------------- Render transportes -----------------
function renderTransportes(filtroRuta = "") {
    cardSeleccionada = null;
    transportContainer.innerHTML = "";

    const keys = filtroRuta
        ? (TRANSPORTES_DATA[filtroRuta] ? [filtroRuta] : [])
        : Object.keys(TRANSPORTES_DATA);


    if (!keys.length) {

        transportContainer.innerHTML = `<div class="alert alert-warning">No hay transportes para esta ruta.</div>`;
        return;
    }

    keys.forEach(rutaSlug => {
        const rutaNombre = RUTA_NOMBRES[rutaSlug] || "Ruta desconocida";
        const transportes = TRANSPORTES_DATA[rutaSlug];

        const rutaDiv = document.createElement("div");
        rutaDiv.classList.add("ruta-section", "mb-4");
        rutaDiv.innerHTML = `<h3 class="mb-3">${rutaNombre}</h3>`;

        const cardsContainer = document.createElement("div");
        cardsContainer.classList.add("d-flex", "flex-wrap", "gap-3");

        transportes.forEach(transporte => {
            const card = document.createElement("div");
            card.classList.add("card", "p-2");
            card.style.width = "18rem";

            const imgContent = transporte.img && transporte.img.trim() !== ""
                ? `<img src="${transporte.img}" class="card-img-top" alt="${transporte.nombre}" height="200" style="object-fit:cover;">`
                : `<div class="d-flex align-items-center justify-content-center bg-secondary text-white" style="height:200px;">Imagen no disponible</div>`;

            card.innerHTML = `
                ${imgContent}
                <div class="card-body">
                    <h5 class="card-title">${transporte.nombre}</h5>
                    <p class="card-text"><strong>Tipo:</strong> ${transporte.tipo}</p>
                    <p class="card-text"><strong>Frecuencia:</strong> ${transporte.frecuencia}</p>
                    <p class="card-text"><strong>Precio:</strong> C$ ${transporte.precio}</p>
                    ${transporte.frecuencia.toLowerCase() === "bajo reserva"
                    ? `<button class="btn btn-primary reservar-btn" data-id="${transporte.id}" 
                    data-nombre="${transporte.nombre}"
                    data-precio="${transporte.precio}">Reservar</button>`
                    : `<span class="text-muted"><strong>No disponible para reserva</strong></span>`
                }

                </div>
            `;

            card.addEventListener("click", () => seleccionarTransporte(transporte, card));
            cardsContainer.appendChild(card);
        });

        rutaDiv.appendChild(cardsContainer);
        transportContainer.appendChild(rutaDiv);
    });
}

// ----------------- Selección visual -----------------
function seleccionarTransporte(transporte, card) {
    document.getElementById("transporteSeleccionadoTexto").textContent = transporte.nombre;
    const reservarBtn = document.getElementById("confirmarReserva");
    reservarBtn.dataset.id = transporte.id;

    if (cardSeleccionada) cardSeleccionada.classList.remove("selected");
    cardSeleccionada = card;
    card.classList.add("selected");
}

// ----------------- Delegación: abrir modal -----------------
transportContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("reservar-btn")) {
        const id = e.target.dataset.id;
        const nombre = e.target.dataset.nombre;

        // Buscamos el transporte completo en TRANSPORTES_DATA
        let transporteSeleccionado = null;
        for (let ruta in TRANSPORTES_DATA) {
            transporteSeleccionado = TRANSPORTES_DATA[ruta].find(t => t.id == id);
            if (transporteSeleccionado) break;
        }

        if (!transporteSeleccionado) return alert("No se encontró el transporte seleccionado");

        // Actualizamos el modal
        document.getElementById("transporteSeleccionadoTexto").textContent = transporteSeleccionado.nombre;

        const reservarBtn = document.getElementById("confirmarReserva");
        reservarBtn.dataset.id = transporteSeleccionado.id;
        reservarBtn.dataset.precio = transporteSeleccionado.precio; // 🔥 Aquí asignamos el precio real

        const modal = new bootstrap.Modal(document.getElementById("reservaModal"));
        modal.show();
    }
});

// ----------------- Filtro de rutas -----------------
rutaSelect.addEventListener("change", (e) => {
    const idRuta = e.target.value;
    renderTransportes(idRuta);
});

// ----------------- Carrito en localStorage -----------------
function agregarAlCarrito(reserva) {
    let carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === reserva.id && item.tipo === reserva.tipo);
    if (index !== -1) carrito[index].cantidad += reserva.cantidad;
    else carrito.push(reserva);

    guardarCarrito(carrito);
    mostrarCarrito();
}

// --- Confirmar reserva en el modal ---
document.getElementById("confirmarReserva").addEventListener("click", () => {
    const cant_cupos = parseInt(document.getElementById("cantidadBoletos").value);
    const nombre = document.getElementById("transporteSeleccionadoTexto").textContent;
    const idTransporte = parseInt(document.getElementById("confirmarReserva").dataset.id);
    const fechaReserva = document.getElementById("fechaReserva").value; // YYYY-MM-DD
    const precio = parseFloat(document.getElementById("confirmarReserva").dataset.precio);

    if (!idTransporte) return alert("No se ha seleccionado un transporte");
    if (!fechaReserva) return alert("Debes seleccionar una fecha");

    // Guardamos en el carrito, incluyendo la fecha seleccionada
    agregarAlCarrito({ 
        id: idTransporte, 
        tipo: "transporte", 
        nombre, 
        cantidad: cant_cupos,
        fecha_inicio: fechaReserva, // clave importante
        precio: precio
    });

    const modalEl = document.getElementById('reservaModal');
    bootstrap.Modal.getInstance(modalEl).hide();

    alert("Reserva agregada al carrito");
});