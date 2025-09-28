document.addEventListener("DOMContentLoaded", () => {
  const perfilItem = document.getElementById("perfilItem");
  const userId = sessionStorage.getItem("userId");

  if (userId) {
    perfilItem.innerHTML = `<a href="perfilusuario.html">Mi perfil</a>`;
  } else {
    perfilItem.innerHTML = `<a href="signup.html">Regístrate</a>`;
  }

  document.getElementById("logo").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  cargarLugares();
});

const lugaresContainer = document.getElementById("lugaresContainer");
const rutaSelect = document.getElementById("rutaSelect");
const tipoSelect = document.getElementById("tipoSelect"); // Nuevo select

let LUGARES_DATA = [];
let RUTAS_DATA = [];

async function cargarLugares() {
  try {
    console.log("Cargando lugares...");
    const res = await fetch("/lugares");

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }

    const data = await res.json();
    console.log("Datos recibidos:", data);

    LUGARES_DATA = data.lugares || data || [];
    RUTAS_DATA = data.rutas || [];

    llenarSelectRutas();
    llenarSelectTipos(); // <-- llenar tipos
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

  if (RUTAS_DATA.length > 0) {
    RUTAS_DATA.forEach((ruta) => {
      const option = document.createElement("option");
      option.value = ruta.id || ruta.ruta_id;
      option.textContent = ruta.nombre || ruta.ruta_nombre;
      rutaSelect.appendChild(option);
    });
  } else {
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

// 🆕 Llenar select con tipos de turismo
function llenarSelectTipos() {
  const tipos = [
    "Religioso",
    "Histórico",
    "Museo",
    "Parque",
    "Cultural",
    "Artesanal",
    "Natural",
    "Playa",
    "Gastronómico",
    "Mirador",
    "Arqueológico",
  ];

  tipoSelect.innerHTML = '<option value="">-- Todos los tipos --</option>';

  tipos.forEach((tipo) => {
    const option = document.createElement("option");
    option.value = tipo;
    option.textContent = tipo;
    tipoSelect.appendChild(option);
  });
}

function renderLugares(filtroRutaId = "", filtroTipo = "") {
  console.log("Renderizando lugares. Filtro ruta:", filtroRutaId, "tipo:", filtroTipo);
  lugaresContainer.innerHTML = "";

  let lugaresFiltrados = LUGARES_DATA;

  // Filtrar por ruta si se selecciona
  if (filtroRutaId) {
    lugaresFiltrados = lugaresFiltrados.filter(
      (lugar) => lugar.ruta_id == filtroRutaId || lugar.id_ruta == filtroRutaId
    );
  }

  // 🆕 Filtrar por tipo si se selecciona
  if (filtroTipo) {
    lugaresFiltrados = lugaresFiltrados.filter(
      (lugar) => lugar.tipo && lugar.tipo.trim().toLowerCase() === filtroTipo.trim().toLowerCase()
    );
  }

  if (!lugaresFiltrados.length) {
    lugaresContainer.innerHTML = `
      <div class="alert alert-warning">
        No hay lugares que coincidan con los filtros seleccionados.
      </div>
    `;
    return;
  }

  // Agrupar por ruta si no hay filtro de ruta
  if (!filtroRutaId) {
    const lugaresPorRuta = {};

    lugaresFiltrados.forEach((lugar) => {
      const rutaId = lugar.ruta_id || lugar.id_ruta || "sin-ruta";
      if (!lugaresPorRuta[rutaId]) {
        lugaresPorRuta[rutaId] = [];
      }
      lugaresPorRuta[rutaId].push(lugar);
    });

    Object.keys(lugaresPorRuta).forEach((rutaId) => {
      const rutaNombre = obtenerNombreRuta(rutaId);
      const lugaresRuta = lugaresPorRuta[rutaId];
      const rutaDiv = crearSeccionRuta(rutaNombre, lugaresRuta);
      lugaresContainer.appendChild(rutaDiv);
    });
  } else {
    const rutaNombre = obtenerNombreRuta(filtroRutaId);
    const rutaDiv = crearSeccionRuta(rutaNombre, lugaresFiltrados);
    lugaresContainer.appendChild(rutaDiv);
  }
}

function obtenerNombreRuta(rutaId) {
  if (RUTAS_DATA.length > 0) {
    const ruta = RUTAS_DATA.find((r) => r.id == rutaId || r.ruta_id == rutaId);
    return ruta ? ruta.nombre || ruta.ruta_nombre : `Ruta ${rutaId}`;
  }

  const nombresPorDefecto = {
    1: "Rutas de nuestro Río San Juan",
    2: "Nuestro Gran Lago Cocibolca",
    3: "Rutas Segovianas",
    4: "Rutas Matagalpinas",
    5: "Paisajes Jinoteganos",
    6: "Ruta de los Volcanes",
    7: "Rutas de Ciudades Patrimoniales",
    8: "Ruta de los Pueblos Artesanos",
    9: "Rutas Playeras",
    10: "Rutas Caribeñas",
    11: "Ruta Gastronómica",
    12: "Ruta Boaqueña y Chontaleñas",
  };

  return nombresPorDefecto[rutaId] || `Ruta ${rutaId}`;
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

    const imgContent =
      lugar.imagen_url && lugar.imagen_url.trim() !== ""
        ? `<img src="${lugar.imagen_url}" class="card-img-top" alt="${lugar.nombre}" style="height:200px;object-fit:cover;">`
        : `<div class="d-flex align-items-center justify-content-center bg-secondary text-white" style="height:200px;">Imagen no disponible</div>`;

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

// Detectar cambios en los selects
rutaSelect.addEventListener("change", () => {
  renderLugares(rutaSelect.value, tipoSelect.value);
});

tipoSelect.addEventListener("change", () => {
  renderLugares(rutaSelect.value, tipoSelect.value);
});
