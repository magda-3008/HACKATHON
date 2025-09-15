// --- refs DOM ---
const transportContainer = document.getElementById("transportContainer");
const rutaSelect = document.getElementById("rutaSelect");
let transporteSeleccionado = null;
let cardSeleccionada = null;

let TRANSPORTES_DATA = {};
let RUTA_NOMBRES = {};

async function cargarTransportes() {
  try {
    const res = await fetch("/transportes");
    const data = await res.json();

    TRANSPORTES_DATA = data.transportes || {};
    RUTA_NOMBRES = data.rutas || {};

    renderTransportes(); // dibujar
  } catch (error) {
    console.error("Error cargando transportes:", error);
    document.getElementById("transportContainer").innerHTML = `
      <div class="alert alert-danger">Error al cargar transportes</div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarTransportes();
  mostrarCarrito();
});

// --- render principal (con filtro) ---
function renderTransportes(filtroRuta = "") {
    transporteSeleccionado = null;
    if (cardSeleccionada) cardSeleccionada.classList.remove("selected");
    cardSeleccionada = null;

    transportContainer.innerHTML = "";

    // determinar qué rutas pintar
    const keys = filtroRuta
        ? (TRANSPORTES_DATA[filtroRuta] ? [filtroRuta] : [])
        : Object.keys(TRANSPORTES_DATA);

    if (keys.length === 0) {
        transportContainer.innerHTML = `<div class="alert alert-warning">No hay transportes para esta ruta.</div>`;
        return;
    }

    // Recorrer cada ruta
    keys.forEach(rutaSlug => {
        const rutaNombre = RUTA_NOMBRES[rutaSlug] || "Ruta desconocida";
        const transportes = TRANSPORTES_DATA[rutaSlug];

        // Crear título de la ruta
        const rutaDiv = document.createElement("div");
        rutaDiv.classList.add("ruta-section", "mb-4");
        rutaDiv.innerHTML = `<h3 class="mb-3">${rutaNombre}</h3>`;

        // Contenedor de tarjetas de transporte para esta ruta
        const cardsContainer = document.createElement("div");
        cardsContainer.classList.add("d-flex", "flex-wrap", "gap-3");

        // Pintar cada transporte
       // Pintar cada transporte
transportes.forEach(transporte => {
    const card = document.createElement("div");
    card.classList.add("card", "p-2");
    card.style.width = "18rem";

    // Contenido de la imagen o mensaje
    let imgContent;
    if (transporte.img && transporte.img.trim() !== "") {
        imgContent = `<img src="${transporte.img}" class="card-img-top" alt="${transporte.nombre}" height="200" width="100%" style="object-fit:cover;">`;
    } else {
        imgContent = `<div class="d-flex align-items-center justify-content-center bg-secondary text-white" style="height:200px;">
                          Imagen no disponible
                      </div>`;
    }

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

    // Click para selección visual
    card.addEventListener("click", () => seleccionarTransporte(transporte, card));

    cardsContainer.appendChild(card);
});

        // Agregar contenedor de tarjetas a la sección de la ruta
        rutaDiv.appendChild(cardsContainer);
        transportContainer.appendChild(rutaDiv);
    });
}

// Llamar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarTransportes();
  mostrarCarrito();
}); 

// Delegación: escuchar clic en botones "Reservar"
transportContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("reservar-btn")) {
    const id = e.target.dataset.id;
    const nombre = e.target.dataset.nombre;

    // Guardar transporte seleccionado en el modal
    document.getElementById("transporteSeleccionadoTexto").textContent = nombre;

    // ⚠️ Ya no usamos reservarBtn global, lo guardamos en el modal directamente
    document.getElementById("confirmarReserva").dataset.id = id;

    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById("reservaModal"));
    modal.show();
  }
});

// --- selección visual ---
//function seleccionarTransporte(transporte, card) {
  //if (cardSeleccionada) cardSeleccionada.classList.remove("selected");
  //cardSeleccionada = card;
  //card.classList.add("selected");
  //transporteSeleccionado = transporte;
  //if (reservarBtn) reservarBtn.disabled = false;
//}

// --- filtro: change del select ---
rutaSelect.addEventListener("change", (e) => {
  const idRuta = e.target.value; // "" = todas
  renderTransportes(idRuta);
});

// --- inicio: todas ---
renderTransportes();

// ----------------- Carrito en localStorage -----------------
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carritoReservas")) || [];
}

function guardarCarrito(carrito) {
    localStorage.setItem("carritoReservas", JSON.stringify(carrito));
}

// Mostrar carrito en la UI
function mostrarCarrito() {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById("carritoItems");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
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

// Agregar reserva al carrito
function agregarAlCarrito(reserva) {
    let carrito = obtenerCarrito();

    const index = carrito.findIndex(item => item.id === reserva.id && item.tipo === reserva.tipo);
    if (index !== -1) {
        carrito[index].cantidad += reserva.cantidad;
    } else {
        carrito.push(reserva);
    }

    guardarCarrito(carrito);
    mostrarCarrito();
}

// Eliminar reserva
function eliminarReserva(id, tipo) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => !(item.id === id && item.tipo === tipo));
    guardarCarrito(carrito);
    mostrarCarrito();
}

// Limpiar carrito
function limpiarCarrito() {
    localStorage.removeItem("carritoReservas");
    mostrarCarrito();
}

//let cardSeleccionada = null; // variable global para la tarjeta seleccionada

function seleccionarTransporte(transporte, card) {
    // 1️⃣ Actualizar modal
    document.getElementById("transporteSeleccionadoTexto").textContent = transporte.nombre;

    // 2️⃣ Habilitar botón y guardar id
    const reservarBtn = document.getElementById("reservarBtn");
    reservarBtn.disabled = false;
    reservarBtn.dataset.id = transporte.id;

    // 3️⃣ Manejar selección visual (resaltar tarjeta en verde)
    if (cardSeleccionada) {
        cardSeleccionada.classList.remove("selected"); // quitar estilo de la tarjeta anterior
    }
    cardSeleccionada = card;
    card.classList.add("selected"); // agregar estilo a la tarjeta actual
}


// Confirmar reserva desde modal
document.getElementById("confirmarReserva").addEventListener("click", () => {
  const cantidad = parseInt(document.getElementById("cantidadBoletos").value);
  const nombre = document.getElementById("transporteSeleccionadoTexto").textContent;
  const id = document.getElementById("confirmarReserva").dataset.id;

  if (!id) return alert("No se ha seleccionado un transporte");

  const reserva = {
    id,
    tipo: "transporte",
    nombre,
    cantidad
  };

  agregarAlCarrito(reserva);

  // Cerrar modal automáticamente
  const modalEl = document.getElementById('reservaModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();
});

// ----------------- Botón limpiar carrito -----------------
document.getElementById("limpiarCarrito")?.addEventListener("click", limpiarCarrito);

// ----------------- Inicializar carrito al cargar página -----------------
document.addEventListener("DOMContentLoaded", mostrarCarrito);
