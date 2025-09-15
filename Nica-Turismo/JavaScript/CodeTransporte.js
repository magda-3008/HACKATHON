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
                    <p class="card-text">Tipo: ${transporte.tipo}</p>
                    <p class="card-text">Frecuencia: ${transporte.frecuencia}</p>
                    <p class="card-text">Precio: C$ ${transporte.precio}</p>
                    <button class="btn btn-primary reservar-btn" data-id="${transporte.id}" data-nombre="${transporte.nombre}">Reservar</button>
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

        document.getElementById("transporteSeleccionadoTexto").textContent = nombre;
        document.getElementById("confirmarReserva").dataset.id = id;

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
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carritoReservas")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carritoReservas", JSON.stringify(carrito));
}

function mostrarCarrito() {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById("carritoItems");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    if (!carrito.length) {
        contenedor.innerHTML = "<p>Tu carrito está vacío</p>";
        return;
    }

    carrito.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("carrito-item");
        div.innerHTML = `
            <span>${item.nombre} x ${item.cantidad} (${item.tipo})</span>
            <button class="btn btn-sm btn-danger" onclick="eliminarReserva('${item.id}', '${item.tipo}')">&times;</button>
        `;
        contenedor.appendChild(div);
    });
}

function agregarAlCarrito(reserva) {
    let carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === reserva.id && item.tipo === reserva.tipo);
    if (index !== -1) carrito[index].cantidad += reserva.cantidad;
    else carrito.push(reserva);
    guardarCarrito(carrito);
    mostrarCarrito();
}

function eliminarReserva(id, tipo) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => !(item.id === id && item.tipo === tipo));
    guardarCarrito(carrito);
    mostrarCarrito();
}

function limpiarCarrito() {
    localStorage.removeItem("carritoReservas");
    mostrarCarrito();
}

// --- Confirmar reserva en el modal ---
document.getElementById("confirmarReserva").addEventListener("click", () => {
    const cant_cupos = parseInt(document.getElementById("cantidadBoletos").value);
    const nombre = document.getElementById("transporteSeleccionadoTexto").textContent;
    const idTransporte = parseInt(document.getElementById("confirmarReserva").dataset.id);
    const fechaReserva = document.getElementById("fechaReserva").value; // YYYY-MM-DD

    if (!idTransporte) return alert("No se ha seleccionado un transporte");
    if (!fechaReserva) return alert("Debes seleccionar una fecha");

    // Guardamos en el carrito, incluyendo la fecha seleccionada
    agregarAlCarrito({ 
        id: idTransporte, 
        tipo: "transporte", 
        nombre, 
        cantidad: cant_cupos,
        fecha_inicio: fechaReserva // clave importante
    });

    const modalEl = document.getElementById('reservaModal');
    bootstrap.Modal.getInstance(modalEl).hide();

    alert("Reserva agregada al carrito");
});

document.getElementById("confirmarPago").addEventListener("click", async () => {
    const carrito = obtenerCarrito();
    const idUsuario = parseInt(sessionStorage.getItem('userId'));

    if (!idUsuario) return alert("Debes iniciar sesión para confirmar el pago");
    if (carrito.length === 0) return alert("El carrito está vacío");

    try {
        const res = await fetch("/confirmar-pago", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idUsuario, reservas: carrito })
        });

        const data = await res.json();
        if (!data.success) return alert(data.mensaje || "Error procesando pago");

        alert("Pago confirmado y reservas guardadas");
        limpiarCarrito(); // vacía carrito local
    } catch (error) {
        console.error(error);
        alert("Error al confirmar pago");
    }
});

// ----------------- Botón limpiar carrito -----------------
document.getElementById("limpiarCarrito")?.addEventListener("click", limpiarCarrito);

// ----------------- Inicializar carrito al cargar página -----------------
document.addEventListener("DOMContentLoaded", mostrarCarrito);

