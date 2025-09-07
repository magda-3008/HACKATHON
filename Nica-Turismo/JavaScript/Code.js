//página de inicio
function acceder() {
    let login = document.getElementById("login");
    let signup = document.getElementById("signup");

}

//Login
function Loguear() {
    let usuario = document.getElementById("usuario").value;
    let contraseña = document.getElementById("clave").value;

    if (usuario == "Vero" && contraseña == "contraseña123") {
        window.location = "home.html";
    }
    else {
        const registroMessageLogin = document.getElementById('registro-messageLogin');
        registroMessageLogin.textContent = 'Datos incorrectos. Verifique su usuario y contraseña.';
        registroMessageLogin.style.color = 'red';
    }
}

//sign up
async function registrar(event) {
    event.preventDefault(); // evita que el formulario se envíe de forma tradicional

    const nombre_usuario = document.getElementById("nuevo-usuario").value;
    const email = document.getElementById("correo").value;
    const contrasena = document.getElementById("nueva-clave").value;

    const registroMessage = document.getElementById("registro-message");

    try {
        const res = await fetch("/guardarusuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_usuario, email, contrasena })
        });

        const data = await res.json();

        if (res.ok) {
            registroMessage.textContent = data.message;
            registroMessage.style.color = "green";
            // Opcional: limpiar formulario
            document.getElementById("signup-form").reset();
        } else {
            registroMessage.textContent = data.error || "Error al registrar usuario";
            registroMessage.style.color = "red";
        }
    } catch (err) {
        registroMessage.textContent = "Error de conexión con el servidor";
        registroMessage.style.color = "red";
        console.error(err);
    }
}


