document.addEventListener("DOMContentLoaded", () => {
  const perfilItem = document.getElementById("perfilItem");
  const userId = sessionStorage.getItem("userId");

  if (userId) {
    perfilItem.innerHTML = `<a href="perfilusuario.html">Mi perfil</a>`;
  } else {
    perfilItem.innerHTML = `<a href="signup.html">Regístrate</a>`;
  }

  document.getElementById("logo").addEventListener("click", () => {
    window.location.href = "home2.html";
  });

  cargarLugares();
});

const lugaresContainer = document.getElementById("lugaresContainer");
const rutaSelect = document.getElementById("rutaSelect");

let LUGARES_DATA = {};
let RUTAS_DATA = {};

async function cargarLugares() {
  try {
    console.log("Cargando lugares...");
    const res = await fetch("/lugares");

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();
    console.log("Datos recibidos:", data);
    
    // DEBUG: Verificar las URLs de imágenes
    console.log("URLs de imágenes recibidas:");
    Object.keys(data.lugares).forEach(rutaId => {
      data.lugares[rutaId].forEach(lugar => {
        console.log(`Lugar: ${lugar.nombre}, Imagen: ${lugar.imagen_url}`);
      });
    });

    LUGARES_DATA = data.lugares || {};
    RUTAS_DATA = data.rutas || {};

    llenarSelectRutas();
    renderLugares();
  } catch (error) {
    console.error("Error cargando lugares:", error);
    lugaresContainer.innerHTML = `
      <div class="alert alert-danger">
        Error al cargar lugares turísticos: ${error.message}
      </div>
    `;
  }
}

function llenarSelectRutas() {
  rutaSelect.innerHTML = '<option value="">-- Todas las rutas --</option>';

  const rutaIds = Object.keys(RUTAS_DATA);

  if (rutaIds.length > 0) {
    rutaIds.forEach((id) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = RUTAS_DATA[id];
      rutaSelect.appendChild(option);
    });
  } else {
    // Opciones por defecto si no se recibieron rutas
    const rutasPorDefecto = [
      { id: "1", nombre: "Rutas de nuestro Río San Juan" },
      { id: "2", nombre: "Nuestro Gran Lago Cocibolca" },
      { id: "3", nombre: "Rutas Segovianas" },
      { id: "4", nombre: "Rutas Matagalpinas" },
      { id: "5", nombre: "Paisajes Jinoteganos" },
      { id: "6", nombre: "Ruta de los Volcanes" },
      { id: "7", nombre: "Rutas de Ciudades Patrimoniales" },
      { id: "8", nombre: "Ruta de los Pueblos Artesanos" },
      { id: "9", nombre: "Rutas Playeras" },
      { id: "10", nombre: "Rutas Caribeñas" },
      { id: "11", nombre: "Ruta Gastronómica" },
      { id: "12", nombre: "Ruta Boaqueña y Chontaleñas" },
    ];

    rutasPorDefecto.forEach((ruta) => {
      const option = document.createElement("option");
      option.value = ruta.id;
      option.textContent = ruta.nombre;
      rutaSelect.appendChild(option);
    });
  }
}

function renderLugares(filtroRutaId = "") {
  console.log("Renderizando lugares. Filtro:", filtroRutaId);
  lugaresContainer.innerHTML = "";

  const rutaIds = Object.keys(LUGARES_DATA);

  if (rutaIds.length === 0) {
    lugaresContainer.innerHTML = `
      <div class="alert alert-warning">
        No hay lugares turísticos disponibles.
      </div>
    `;
    return;
  }

  // Si hay filtro, solo renderizamos esa ruta
  if (filtroRutaId) {
    const lugares = LUGARES_DATA[filtroRutaId] || [];
    const rutaNombre = obtenerNombreRuta(filtroRutaId);

    if (lugares.length === 0) {
      lugaresContainer.innerHTML = `
        <div class="alert alert-warning">
          No hay lugares para esta ruta.
        </div>
      `;
      return;
    }

    const rutaDiv = crearSeccionRuta(rutaNombre, lugares);
    lugaresContainer.appendChild(rutaDiv);
  } else {
    // Renderizar todas las rutas
    rutaIds.forEach((rutaId) => {
      const rutaNombre = obtenerNombreRuta(rutaId);
      const lugares = LUGARES_DATA[rutaId] || [];

      if (lugares.length > 0) {
        const rutaDiv = crearSeccionRuta(rutaNombre, lugares);
        lugaresContainer.appendChild(rutaDiv);
      }
    });
  }
}

function obtenerNombreRuta(rutaId) {
  return RUTAS_DATA[rutaId] || `Ruta ${rutaId}`;
}

function crearSeccionRuta(rutaNombre, lugares) {
  const rutaDiv = document.createElement("div");
  rutaDiv.classList.add("ruta-section", "mb-4");
  rutaDiv.innerHTML = `<h3 class="mb-3">${rutaNombre}</h3>`;

  const cardsContainer = document.createElement("div");
  cardsContainer.classList.add("row");

  lugares.forEach((lugar) => {
    const card = document.createElement("div");
    card.classList.add("col-md-4", "mb-3");

    // Usamos directamente la URL de la DB, sin concatenar
    const imgUrl = lugar.imagen_url?.trim() || "";

    const imgContent = imgUrl
      ? `<img src="${imgUrl}" class="card-img-top" alt="${lugar.nombre}" 
          style="height:200px;object-fit:cover;"
          onerror="this.onerror=null;this.src='https://via.placeholder.com/200x200?text=Sin+imagen';">`
      : `<div class="d-flex align-items-center justify-content-center bg-secondary text-white" 
          style="height:200px;">Imagen no disponible</div>`;

    card.innerHTML = `
      <div class="card h-100">
        ${imgContent}
        <div class="card-body">
          <h5 class="card-title">${lugar.nombre}</h5>
          <p class="card-text"><strong>Tipo:</strong> ${lugar.tipo}</p>
          <p class="card-text"><strong>Ubicación:</strong> ${lugar.ubicacion}</p>
          <p class="card-text">${lugar.descripcion}</p>
        </div>
      </div>
    `;

    cardsContainer.appendChild(card);
  });

  rutaDiv.appendChild(cardsContainer);
  return rutaDiv;
}

rutaSelect.addEventListener("change", (e) => {
  const idRuta = e.target.value;
  renderLugares(idRuta);
});

document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "home2.html";
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
});