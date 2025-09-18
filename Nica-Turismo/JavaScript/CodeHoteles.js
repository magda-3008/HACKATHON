document.getElementById('logo').addEventListener('click', () => {
    window.location.href = 'home2.html';
});

document.addEventListener("DOMContentLoaded", () => {
    // --- PERFIL ---
    const perfilItem = document.getElementById("perfilItem");
    const userId = sessionStorage.getItem("userId");

    if (userId) {
        // Usuario logueado → mostrar perfil
        perfilItem.innerHTML = `<a href="perfilusuario.html">Mi perfil</a>`;
    } else {
        // Usuario NO logueado → mostrar registrarse
        perfilItem.innerHTML = `<a href="signup.html">Regístrate</a>`;
    }

    // --- Cargar hoteles y carrito al inicio ---
    cargarHoteles();
    mostrarCarrito();
});

// --- refs DOM ---
const hotelContainer = document.getElementById("HotelContainer");
const rutaSelect = document.getElementById("rutaSelect");
let cardSeleccionada = null;

let HOTELES_DATA = {};
let RUTA_NOMBRES = {};

// ----------------- Cargar hoteles -----------------
async function cargarHoteles() {
    try {
        const res = await fetch("/hoteles");
        const data = await res.json();
        HOTELES_DATA = data.hoteles || {};
        RUTA_NOMBRES = data.rutas || {};
        renderHoteles();
    } catch (error) {
        console.error("Error cargando hoteles:", error);
        hotelContainer.innerHTML = `<div class="alert alert-danger">Error al cargar hoteles</div>`;
    }
}

// ----------------- Render hoteles -----------------
function renderHoteles(filtroRuta = "") {
    cardSeleccionada = null;
    hotelContainer.innerHTML = "";

    const keys = filtroRuta
        ? (HOTELES_DATA[filtroRuta] ? [filtroRuta] : [])
        : Object.keys(HOTELES_DATA);

    if (!keys.length) {
        hotelContainer.innerHTML = `<div class="alert alert-warning">No hay hoteles para esta ruta.</div>`;
        return;
    }

    keys.forEach(rutaSlug => {
        const rutaNombre = RUTA_NOMBRES[rutaSlug] || "Ruta desconocida";
        const hoteles = HOTELES_DATA[rutaSlug];

        const rutaDiv = document.createElement("div");
        rutaDiv.classList.add("ruta-section", "mb-4");
        rutaDiv.innerHTML = `<h3 class="mb-3">${rutaNombre}</h3>`;

        const cardsContainer = document.createElement("div");
        cardsContainer.classList.add("d-flex", "flex-wrap", "gap-3");

        hoteles.forEach(hotel => {
            const card = document.createElement("div");
            card.classList.add("card", "p-2");
            card.style.width = "22rem"; // Aumentamos el tamaño del card

            const imgContent = hotel.img && hotel.img.trim() !== ""
                ? `<img src="${hotel.img}" class="card-img-top" alt="${hotel.nombre}" height="200" style="object-fit:cover;">`
                : `<div class="d-flex align-items-center justify-content-center bg-secondary text-white" style="height:200px;">Imagen no disponible</div>`;

            // Convertir número de estrellas en íconos
            const estrellas = Math.round(hotel.estrellas); // Redondear si es decimal
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
                    <button class="btn btn-primary reservar-btn" data-id_hotel="${hotel.id_hotel}" data-nombre="${hotel.nombre}"
                        data-precioHotel="${hotel.precio}">Reservar</button>
                </div>
            `;

            card.addEventListener("click", () => seleccionarHotel(hotel, card));
            cardsContainer.appendChild(card);
        });

        rutaDiv.appendChild(cardsContainer);
        hotelContainer.appendChild(rutaDiv);
    });
}

// ----------------- Selección visual -----------------
function seleccionarHotel(hotel, card) {
    document.getElementById("HotelSeleccionadoTexto").textContent = hotel.nombre;
    const reservarBtn = document.getElementById("confirmarReserva");
    reservarBtn.dataset.id_hotel = hotel.id_hotel;

    if (cardSeleccionada) cardSeleccionada.classList.remove("selected");
    cardSeleccionada = card;
    card.classList.add("selected");
}

// ----------------- Delegación: abrir modal de reserva de hotel -----------------
hotelContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("reservar-btn")) {
        const id_hotel = e.target.dataset.id_hotel;
        const nombre = e.target.dataset.nombre;

        // Recorremos todas las rutas y concatenamos todos los hoteles
        const todosHoteles = [].concat(...Object.values(HOTELES_DATA));
        const hotelSeleccionado = todosHoteles.find(h => h.id_hotel == id_hotel);

        if (!hotelSeleccionado) return alert("No se encontró el hotel seleccionado");

        // Actualizamos el modal
        document.getElementById("HotelSeleccionadoTexto").textContent = hotelSeleccionado.nombre;

        const reservarBtn = document.getElementById("confirmarReserva");
        reservarBtn.dataset.id_hotel = hotelSeleccionado.id_hotel;
        reservarBtn.dataset.precio = hotelSeleccionado.precio;

        const modal = new bootstrap.Modal(document.getElementById("reservaModal"));
        modal.show();
    }
});

// ----------------- Filtro de rutas -----------------
rutaSelect.addEventListener("change", (e) => {
    const idRuta = e.target.value;
    renderHoteles(idRuta);
});

// ----------------- Carrito en localStorage -----------------
function agregarAlCarrito(reserva) {
    let carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id_hotel === reserva.id_hotel && item.tipo === reserva.tipo);
    if (index !== -1) carrito[index].cantidad += reserva.cantidad;
    else carrito.push(reserva);

    guardarCarrito(carrito);
    mostrarCarrito();
}

// --- Confirmar reserva en el modal ---
document.getElementById("confirmarReserva").addEventListener("click", () => {
    const cant_cuartos = parseInt(document.getElementById("cantidadCuartos").value);
    const nombre = document.getElementById("HotelSeleccionadoTexto").textContent;
    const idHotel = parseInt(document.getElementById("confirmarReserva").dataset.id_hotel);
    const fechaReserva = document.getElementById("fechaReserva").value; // YYYY-MM-DD
    const precio = parseFloat(document.getElementById("confirmarReserva").dataset.precio);

    if (!idHotel) return alert("No se ha seleccionado un hotel");
    if (!fechaReserva) return alert("Debes seleccionar una fecha");

    // Guardamos en el carrito, incluyendo la fecha seleccionada
    agregarAlCarrito({ 
        id_hotel: idHotel, 
        tipo: "hotel", 
        nombre, 
        cantidad: cant_cuartos,
        fecha_inicio: fechaReserva,
        precio: precio
    });

    const modalEl = document.getElementById('reservaModal');
    bootstrap.Modal.getInstance(modalEl).hide();

    alert("Reserva agregada al carrito");
});
