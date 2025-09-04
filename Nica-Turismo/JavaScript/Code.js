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
        window.location = "paciente.html";
    }
    else {
        const registroMessageLogin = document.getElementById('registro-messageLogin');
        registroMessageLogin.textContent = 'Datos incorrectos. Por favor, verifique su usuario y contraseña.';
        registroMessageLogin.style.color = 'red';
    }
}

//sign up
function registrar() {
    const nuevoUsuario = document.getElementById('nuevo-usuario').value;
    const nuevaClave = document.getElementById('nueva-clave').value;

    const registroMessage = document.getElementById('registro-message');
    registroMessage.textContent = 'Registro exitoso. Ahora puedes iniciar sesión.';
    registroMessage.style.color = 'green';

}