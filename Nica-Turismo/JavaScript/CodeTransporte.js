// --- Datos simulados por ruta (los tuyos) ---
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
        <div class="transport-card h-100">
          <img src="${t.img || 'https://via.placeholder.com/600x300?text=Transporte'}" alt="Imagen de transporte" class="transport-img">
          <h4>${t.nombre}</h4>
          <p class="mb-1"><span class="badge bg-secondary">${t.tipo}</span></p>
          <p class="mb-1">💵 ${t.precio}</p>
          <p class="mb-0">⏰ ${t.frecuencia}</p>
        </div>
      `;
      const card = col.querySelector(".transport-card");
      card.addEventListener("click", () => seleccionarTransporte(t, card));
      row.appendChild(col);
    });

    section.appendChild(row);
    transportContainer.appendChild(section);
  });
}

// --- selección visual ---
function seleccionarTransporte(transporte, card) {
  if (cardSeleccionada) cardSeleccionada.classList.remove("selected");
  cardSeleccionada = card;
  card.classList.add("selected");
  transporteSeleccionado = transporte;
  if (reservarBtn) reservarBtn.disabled = false;
}

// --- filtro: change del select ---
rutaSelect.addEventListener("change", (e) => {
  const slug = e.target.value;   // "" = todas
  renderTransportes(slug);
});

// --- inicio: todas ---
renderTransportes();
