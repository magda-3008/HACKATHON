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
