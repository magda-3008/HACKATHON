const mapUrls = {
  1: "https://www.google.com/maps/d/embed?mid=1JnfLs1tJfR91rqVJDaKP-8B_V2ovRuE&ehbc=2E312F",
  2: "https://www.google.com/maps/d/embed?mid=17kuRhwVMhtbU5Ad4UlnFYF0Itp9VFaE&ehbc=2E312F",
  3: "https://www.google.com/maps/d/embed?mid=1aK9TOIZmfWpXAlZRtKtYbg-mGtuNX2o&ehbc=2E312F",
  4: "https://www.google.com/maps/d/embed?mid=1tg9y4kDYMG2NU1VYm346XLLrbZNi68c&ehbc=2E312F",
  5: "https://www.google.com/maps/d/embed?mid=1SAQlWYTsp7aD2Fn_YMg-Ftazz803mQk&ehbc=2E312F",
  6: "https://www.google.com/maps/d/embed?mid=10KeKZurYus8_vJuZUYpT8xUaCiENpLk&ehbc=2E312F",
  7: "https://www.google.com/maps/d/embed?mid=1husl3ICAlqknFIpg7SlclZRVK092WKM&ehbc=2E312F",
  8: "https://www.google.com/maps/d/embed?mid=1IQb4fNucgOWDe5kHK9IoDtkd7aP1WFE&ehbc=2E312F",
  9: "https://www.google.com/maps/d/embed?mid=1COMSALB8w2ht8hJEQIiFDSrDuoX7psI&ehbc=2E312F",
  10: "https://www.google.com/maps/d/embed?mid=1h22prB8b-wizy0Ap_h4KW5hZnwoBmNE&ehbc=2E312F",
  11: "https://www.google.com/maps/d/embed?mid=1sb7qofxbPTInydMalBgTRFOcb5aJ6Ow&ehbc=2E312F",
  12: "https://www.google.com/maps/d/embed?mid=1fenmT5CsWy6JoUeE4-qn9d-sKqjD-c4&ehbc=2E312F",
};

// Función para cargar las rutas desde el backend
async function cargarRutas() {
  try {
    const response = await fetch("/api/rutas-turisticas");

    if (!response.ok) {
      throw new Error("Error al cargar las rutas");
    }

    const rutas = await response.json();
    mostrarRutas(rutas);
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("rutas-container").innerHTML = `
                    <div class="error">
                        <h4>Error al cargar las rutas</h4>
                        <p>${error.message}</p>
                        <button onclick="cargarRutas()" class="btn btn-primary mt-2">Reintentar</button>
                    </div>
                `;
  }
}

// Función para mostrar las rutas en el HTML
function mostrarRutas(rutas) {
  const container = document.getElementById("rutas-container");

  if (rutas.length === 0) {
    container.innerHTML =
      '<p class="text-center">No hay rutas turísticas disponibles.</p>';
    return;
  }

  // Ordenar rutas por ID
  rutas.sort((a, b) => a.id_ruta - b.id_ruta);

  container.innerHTML = rutas
    .map(
      (ruta) => `
                <article class="ruta" data-ruta-id="${ruta.id_ruta}">
                    <h3>${ruta.nombre}</h3>
                    <p>${ruta.descripcion}</p>
                    <div class="mapa-wrapper">
                        <iframe
                            src="${mapUrls[ruta.id_ruta] || mapUrls[1]}"
                            width="100%" height="400"></iframe>
                    </div>
                    <button type="button" class="btn btn-primary" onclick="verLugares(${ruta.id_ruta})" 
                            style="display: block; margin: 0 auto;">
                        Ver lugares a visitar
                    </button>
                </article>
            `
    )
    .join("");
}

// Función para ver los lugares de una ruta (debes implementar esta funcionalidad)
function verLugares(idRuta) {
  // Aquí puedes redirigir a otra página o mostrar un modal con los lugares
  alert(
    `Mostrando lugares de la ruta ${idRuta}. Esta funcionalidad debe ser implementada.`
  );
  // Ejemplo: window.location.href = `/lugares.html?ruta=${idRuta}`;
}

// Cargar las rutas cuando la página esté lista
document.addEventListener("DOMContentLoaded", cargarRutas);

document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "home2.html";
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