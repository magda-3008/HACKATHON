//página de inicio
function acceder() {
  let login = document.getElementById("login");
  let signup = document.getElementById("signup");
}

// Login
async function Loguear() {
  let usuario = document.getElementById("usuario").value;
  let contraseña = document.getElementById("clave").value;

  try {
    const response = await fetch("/datosusuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contraseña }),
    });

    const data = await response.json();

    if (data.success) {
      // Guardar información del usuario en sessionStorage
      sessionStorage.setItem("usuario", usuario);

      // Obtener el ID del usuario para usarlo después
      const userResponse = await fetch(`/obtenerusuariopornombre/${usuario}`);
      const userData = await userResponse.json();

      if (userData.success) {
        sessionStorage.setItem("userId", userData.usuario.id);
      }

      window.location = "index.html"; // redirige si está correcto
    } else {
      const registroMessageLogin = document.getElementById(
        "registro-messageLogin"
      );
      registroMessageLogin.textContent = data.message;
      registroMessageLogin.style.color = "red";
    }
  } catch (error) {
    console.error("Error en login:", error);
  }
}

//sign up
async function registrar(event) {
  event.preventDefault();

  const nombre_usuario = document.getElementById("nuevo-usuario").value;
  const email = document.getElementById("correo").value;
  const contrasena = document.getElementById("clave").value;

  const registroMessage = document.getElementById("registro-message");

  try {
    const res = await fetch("/guardarusuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_usuario, email, contrasena }),
    });

    const data = await res.json();

    if (res.ok) {
      registroMessage.textContent = data.message;
      registroMessage.style.color = "green";
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

//mostrar u ocultar contraseña
const togglePassword = document.getElementById("togglePassword");
const inputClave = document.getElementById("clave");

togglePassword.addEventListener("click", () => {
  if (inputClave.type === "password") {
    inputClave.type = "text";
    togglePassword.classList.remove("bi-eye");
    togglePassword.classList.add("bi-eye-slash");
  } else {
    inputClave.type = "password";
    togglePassword.classList.remove("bi-eye-slash");
    togglePassword.classList.add("bi-eye");
  }
});
