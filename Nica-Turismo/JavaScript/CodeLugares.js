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

    // Ajustamos según la estructura real de tu API
    LUGARES_DATA = data.lugares || data || [];
    RUTAS_DATA = data.rutas || [];

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

  if (RUTAS_DATA.length > 0) {
    RUTAS_DATA.forEach((ruta) => {
      const option = document.createElement("option");
      option.value = ruta.id || ruta.ruta_id;
      option.textContent = ruta.nombre || ruta.ruta_nombre;
      rutaSelect.appendChild(option);
    });
  } else {
    // Si no hay rutas específicas, usar las opciones por defecto
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
  console.log("Datos disponibles:", LUGARES_DATA);

  lugaresContainer.innerHTML = "";

  let lugaresFiltrados = LUGARES_DATA;

  if (filtroRutaId) {
    lugaresFiltrados = LUGARES_DATA.filter(
      (lugar) => lugar.ruta_id == filtroRutaId || lugar.id_ruta == filtroRutaId
    );
  }

  console.log("Lugares filtrados:", lugaresFiltrados);

  if (!lugaresFiltrados.length) {
    lugaresContainer.innerHTML = `
            <div class="alert alert-warning">
              No hay lugares para ${filtroRutaId ? "esta ruta" : "mostrar"}.
            </div>
          `;
    return;
  }

  // Agrupar por ruta si no hay filtro
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

  // Nombres por defecto si no hay datos de rutas
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

rutaSelect.addEventListener("change", (e) => {
  const idRuta = e.target.value;
  renderLugares(idRuta);
});
