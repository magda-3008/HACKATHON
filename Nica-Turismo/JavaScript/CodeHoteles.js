document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "index.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const perfilItem = document.getElementById("perfilItem");
  const userId = sessionStorage.getItem("userId");

  if (userId) {
    // Usuario logueado → mostrar perfil
    perfilItem.innerHTML = `<a href="perfilusuario.html">Mi perfil</a>`;
  } else {
    // Usuario NO logueado → mostrar registrarse
    perfilItem.innerHTML = `<a href="signup.html">Regístrate</a>`;
  }

  // Configurar fecha mínima en los inputs
  const fechaInputs = document.querySelectorAll('input[type="date"]');
  fechaInputs.forEach((input) => {
    input.min = new Date().toISOString().split("T")[0];
  });

  cargarHoteles();
  mostrarCarrito();
});

// --- refs DOM ---
const hotelContainer = document.getElementById("HotelContainer");
const rutaSelect = document.getElementById("rutaSelect");
let cardSeleccionada = null;

let HOTELES_DATA = {};
let RUTA_NOMBRES = {};

function validarFechaNoPasada(fecha) {
  const fechaInput = new Date(fecha);
  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0);
  return fechaInput >= fechaActual;
}

async function cargarHoteles() {
  try {
    const res = await fetch("/hoteles");
    const data = await res.json();
    HOTELES_DATA = data.hoteles || {};
    RUTA_NOMBRES = data.rutas || {};
    renderHotelesConFiltros();
  } catch (error) {
    console.error("Error cargando hoteles:", error);
    hotelContainer.innerHTML = `<div class="alert alert-danger">Error al cargar hoteles</div>`;
  }
}

function renderHotelesConFiltros() {
  const filtroRuta = rutaSelect.value;
  const precioMin = parseFloat(document.getElementById("precioMin").value) || 0;
  const precioMax = parseFloat(document.getElementById("precioMax").value) || Infinity;
  const estrellasFiltro = parseInt(document.getElementById("estrellasSelect").value) || 0;

  cardSeleccionada = null;
  hotelContainer.innerHTML = "";

  let keys = filtroRuta ? (HOTELES_DATA[filtroRuta] ? [filtroRuta] : []) : Object.keys(HOTELES_DATA);

  if (!keys.length) {
    hotelContainer.innerHTML = `<div class="alert alert-warning">No hay hoteles disponibles.</div>`;
    return;
  }

  keys.forEach((rutaSlug) => {
    const rutaNombre = RUTA_NOMBRES[rutaSlug] || "Ruta desconocida";
    const hoteles = HOTELES_DATA[rutaSlug];

    // Aplicar filtros de precio y estrellas
    const hotelesFiltrados = hoteles.filter(hotel => {
      const precioValido = hotel.precio >= precioMin && hotel.precio <= precioMax;
      const estrellasValido = estrellasFiltro === 0 || Math.round(hotel.estrellas) === estrellasFiltro;
      return precioValido && estrellasValido;
    });

    if (!hotelesFiltrados.length) return;

    const rutaDiv = document.createElement("div");
    rutaDiv.classList.add("ruta-section", "mb-4");
    rutaDiv.innerHTML = `<h3 class="mb-3">${rutaNombre}</h3>`;

    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("d-flex", "flex-wrap", "gap-3");

    hotelesFiltrados.forEach((hotel) => {
      const card = document.createElement("div");
      card.classList.add("card", "p-2");
      card.style.width = "22rem";

      const imgContent =
        hotel.img && hotel.img.trim() !== ""
          ? `<img src="${hotel.img}" class="card-img-top" alt="${hotel.nombre}" height="200" style="object-fit:cover;">`
          : `<div class="d-flex align-items-center justify-content-center bg-secondary text-white" style="height:200px;">Imagen no disponible</div>`;

      const estrellas = Math.round(hotel.estrellas);
      let estrellasHTML = "";
      for (let i = 0; i < 5; i++) {
        estrellasHTML += i < estrellas ? "★" : "☆";
      }

      card.innerHTML = `
        ${imgContent}
        <div class="card-body">
          <h5 class="card-title">${hotel.nombre}</h5>
          <p class="card-text">${hotel.descripcion}</p>
          <p class="card-text"><strong>Ubicación:</strong> ${hotel.ubicacion}</p>
          <p class="card-text"><strong>Precio por noche:</strong> C$ ${hotel.precio}</p>
          <p class="card-text"><strong>Estrellas: </strong><span style="color: gold; font-size: 1.1em;">${estrellasHTML}</span></p>
          <button class="btn btn-primary reservar-btn" data-id_hotel="${hotel.id_hotel}" data-nombre="${hotel.nombre}" data-precioHotel="${hotel.precio}">Reservar</button>
        </div>
      `;

      card.addEventListener("click", () => seleccionarHotel(hotel, card));
      cardsContainer.appendChild(card);
    });

    if (cardsContainer.childNodes.length) rutaDiv.appendChild(cardsContainer);
    if (cardsContainer.childNodes.length) hotelContainer.appendChild(rutaDiv);
  });

  if (!hotelContainer.hasChildNodes()) {
    hotelContainer.innerHTML = `<div class="alert alert-info">No se encontraron hoteles con los filtros seleccionados.</div>`;
  }
}

function seleccionarHotel(hotel, card) {
  document.getElementById("HotelSeleccionadoTexto").textContent = hotel.nombre;
  const reservarBtn = document.getElementById("confirmarReserva");
  reservarBtn.dataset.id_hotel = hotel.id_hotel;

  if (cardSeleccionada) cardSeleccionada.classList.remove("selected");
  cardSeleccionada = card;
  card.classList.add("selected");
}

hotelContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("reservar-btn")) {
    const id_hotel = e.target.dataset.id_hotel;
    const nombre = e.target.dataset.nombre;

    const todosHoteles = [].concat(...Object.values(HOTELES_DATA));
    const hotelSeleccionado = todosHoteles.find((h) => h.id_hotel == id_hotel);

    if (!hotelSeleccionado)
      return alert("No se encontró el hotel seleccionado");

    document.getElementById("HotelSeleccionadoTexto").textContent = hotelSeleccionado.nombre;

    const reservarBtn = document.getElementById("confirmarReserva");
    reservarBtn.dataset.id_hotel = hotelSeleccionado.id_hotel;
    reservarBtn.dataset.precio = hotelSeleccionado.precio;

    const fechaInput = document.getElementById("fechaReserva");
    if (fechaInput) {
      fechaInput.min = new Date().toISOString().split("T")[0];
      fechaInput.value = "";
    }

    const modal = new bootstrap.Modal(document.getElementById("reservaModal"));
    modal.show();
  }
});

function agregarAlCarrito(reserva) {
  let carrito = obtenerCarrito();
  const index = carrito.findIndex(
    (item) => item.id_hotel === reserva.id_hotel && item.tipo === reserva.tipo
  );
  if (index !== -1) carrito[index].cantidad += reserva.cantidad;
  else carrito.push(reserva);

  guardarCarrito(carrito);
  mostrarCarrito();
}

document.getElementById("confirmarReserva").addEventListener("click", () => {
  const cant_cuartos = parseInt(document.getElementById("cantidadCuartos").value);
  const nombre = document.getElementById("HotelSeleccionadoTexto").textContent;
  const idHotel = parseInt(document.getElementById("confirmarReserva").dataset.id_hotel);
  const fechaReserva = document.getElementById("fechaReserva").value; // YYYY-MM-DD
  const precio = parseFloat(document.getElementById("confirmarReserva").dataset.precio);

  if (!idHotel) return alert("No se ha seleccionado un hotel");
  if (!fechaReserva) return alert("Debes seleccionar una fecha");

  if (!validarFechaNoPasada(fechaReserva)) {
    alert("No puedes seleccionar una fecha pasada");
    return false;
  }

  agregarAlCarrito({
    id_hotel: idHotel,
    tipo: "hotel",
    nombre,
    cantidad: cant_cuartos,
    fecha_inicio: fechaReserva,
    precio: precio,
  });

  const modalEl = document.getElementById("reservaModal");
  bootstrap.Modal.getInstance(modalEl).hide();

  alert("Reserva agregada al carrito");
});

//Listeners para filtros
rutaSelect.addEventListener("change", renderHotelesConFiltros);
document.getElementById("precioMin").addEventListener("input", renderHotelesConFiltros);
document.getElementById("precioMax").addEventListener("input", renderHotelesConFiltros);
document.getElementById("estrellasSelect").addEventListener("change", renderHotelesConFiltros);

const carrito = document.getElementById('carritoContainer');
const modales = document.querySelectorAll('.modal');

modales.forEach(modal => {
    modal.addEventListener('show.bs.modal', () => {
        carrito.style.display = 'none';
    });
    modal.addEventListener('hidden.bs.modal', () => {
        carrito.style.display = '';
    });
});
