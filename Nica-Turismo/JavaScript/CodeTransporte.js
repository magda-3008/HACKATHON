const TRANSPORTES_DATA = {
  "rio-san-juan": [
    { id: 1, nombre: "Lancha San Carlos - El Castillo", tipo: "Fluvial", precio: "$10", frecuencia: "Diaria" },
    { id: 2, nombre: "Tour en bote Reserva Indio Maíz", tipo: "Fluvial", precio: "$35", frecuencia: "Bajo reserva" }
  ],
  "gran-lago-cocibolca": [
    { id: 3, nombre: "Ferry San Jorge - Ometepe", tipo: "Lacustre", precio: "$6", frecuencia: "Varios horarios" },
    { id: 4, nombre: "Lancha Isletas de Granada", tipo: "Lacustre", precio: "$5", frecuencia: "Cada hora" }
  ],
  "segovianas": [
    { id: 5, nombre: "Bus Estelí - Somoto", tipo: "Colectivo", precio: "$4", frecuencia: "Cada 30 min" }
  ],
  "matagalpinas": [
    { id: 6, nombre: "Taxi Matagalpa - Jinotega", tipo: "Taxi compartido", precio: "$3", frecuencia: "Cada 20 min" }
  ],
  "jinoteganos": [
    { id: 7, nombre: "Bus Jinotega - San Rafael del Norte", tipo: "Colectivo", precio: "$2.5", frecuencia: "Cada 40 min" }
  ],
  "volcanes": [
    { id: 8, nombre: "Transporte Masaya - Volcán Masaya", tipo: "Tour", precio: "$12", frecuencia: "2 veces al día" }
  ],
  "ciudades-patrimoniales": [
    { id: 9, nombre: "Bus Granada - León", tipo: "Colectivo", precio: "$6", frecuencia: "Cada hora" }
  ],
  "pueblos-artesanos": [
    { id: 10, nombre: "Bus Masaya - San Juan de Oriente", tipo: "Colectivo", precio: "$1", frecuencia: "Cada 15 min" }
  ],
  "playeras": [
    { id: 11, nombre: "Shuttle Managua - San Juan del Sur", tipo: "Privado", precio: "$15", frecuencia: "2 veces al día" }
  ],
  "caribenas": [
    { id: 12, nombre: "Vuelo Managua - Bluefields", tipo: "Aéreo", precio: "$80", frecuencia: "Diario" }
  ],
  "gastronomica": [
    { id: 13, nombre: "Tour Gastronómico León", tipo: "Privado", precio: "$25", frecuencia: "Fines de semana" }
  ],
  "boaquena-chontalenas": [
    { id: 14, nombre: "Bus Juigalpa - Boaco", tipo: "Colectivo", precio: "$2.5", frecuencia: "Cada 30 min" }
  ]
};

const RUTA_NOMBRES = {
  "rio-san-juan": "Rutas de nuestro Río San Juan",
  "gran-lago-cocibolca": "Nuestro Gran Lago Cocibolca",
  "segovianas": "Rutas Segovianas",
  "matagalpinas": "Rutas Matagalpinas",
  "jinoteganos": "Paisajes Jinoteganos",
  "volcanes": "Ruta de los Volcanes",
  "ciudades-patrimoniales": "Rutas de Ciudades Patrimoniales",
  "pueblos-artesanos": "Ruta de los Pueblos Artesanos",
  "playeras": "Rutas Playeras",
  "caribenas": "Rutas Caribeñas",
  "gastronomica": "Ruta Gastronómica",
  "boaquena-chontalenas": "Ruta Boaqueña y Chontaleñas"
};

// --- refs DOM ---
const transportContainer = document.getElementById("transportContainer");
const rutaSelect = document.getElementById("rutaSelect");
const reservarBtn = document.getElementById("reservarBtn"); // si no existe, quita estas 3 líneas
let transporteSeleccionado = null;
let cardSeleccionada = null;

// --- render principal (con filtro) ---
function renderTransportes(filtroRuta = "") {
  // reset selección al cambiar filtro
  transporteSeleccionado = null;
  if (cardSeleccionada) cardSeleccionada.classList.remove("selected");
  cardSeleccionada = null;
  if (reservarBtn) reservarBtn.disabled = true;

  transportContainer.innerHTML = "";

  // determinar qué rutas pintar
  const keys = filtroRuta
    ? (TRANSPORTES_DATA[filtroRuta] ? [filtroRuta] : [])   // si el slug no existe, no rompe
    : Object.keys(TRANSPORTES_DATA);

  // si no hay coincidencias, mostrar vacío amigable
  if (keys.length === 0) {
    transportContainer.innerHTML = `<div class="alert alert-warning">No hay transportes para esta ruta.</div>`;
    return;
  }

  // pintar secciones por ruta
  keys.forEach(key => {
    const lista = TRANSPORTES_DATA[key] || [];
    if (!lista.length) return;

    const section = document.createElement("section");
    section.className = "mb-4";

    const h3 = document.createElement("h3");
    h3.className = "text-primary mb-3";
    h3.textContent = RUTA_NOMBRES[key] || key;
    section.appendChild(h3);

    const row = document.createElement("div");
    row.className = "row g-3";

    lista.forEach(t => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      col.innerHTML = `
        <div class="transport-card h-100 p-3 border rounded shadow-sm">
          <img src="${t.img || 'https://via.placeholder.com/600x300?text=Transporte'}" 
              alt="Imagen de transporte" class="transport-img mb-2">
          <h4 class="h6">${t.nombre}</h4>
          <p class="mb-1"><span class="badge bg-secondary">${t.tipo}</span></p>
          <p class="mb-1">💵 ${t.precio}</p>
          <p class="mb-2">⏰ ${t.frecuencia}</p>
          <button class="btn btn-success btn-sm reservar-btn" 
                  data-id="${t.id}" 
                  data-nombre="${t.nombre}">
            Reservar
          </button>
        </div>
      `;
      row.appendChild(col);
    });

    section.appendChild(row);
    transportContainer.appendChild(section);
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

}

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
  const slug = e.target.value;   // "" = todas
  renderTransportes(slug);
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
