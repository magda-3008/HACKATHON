// ----------------- Carrito en sessionStorage -----------------
function obtenerCarrito() {
    return JSON.parse(sessionStorage.getItem("carritoReservas")) || [];
}

function guardarCarrito(carrito) {
    sessionStorage.setItem("carritoReservas", JSON.stringify(carrito));
}

// ----------------- Mostrar carrito -----------------
function mostrarCarrito() {
    const carrito = obtenerCarrito();
    const contenedor = document.getElementById("carritoItems");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!carrito.length) {
        contenedor.innerHTML = "<p>Tu carrito está vacío</p>";
        return;
    }

    carrito.forEach(item => {
        const subtotal = (item.precio || 0) * item.cantidad;
        const div = document.createElement("div");
        div.classList.add("carrito-item");
        div.innerHTML = `
            <span>${item.nombre} x ${item.cantidad} (${item.tipo}) - $${subtotal.toFixed(2)}</span>
            <button class="btn btn-sm btn-danger" onclick="eliminarReserva('${item.id}', '${item.tipo}')">&times;</button>
        `;
        contenedor.appendChild(div);
    });
}

// ----------------- Agregar al carrito -----------------
function agregarAlCarrito(reserva) {
    let carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === reserva.id && item.tipo === reserva.tipo);

    if (index !== -1) {
        carrito[index].cantidad += reserva.cantidad;
        carrito[index].precio = reserva.precio; // actualizar precio
    } else {
        carrito.push(reserva);
    }

    guardarCarrito(carrito);
    mostrarCarrito();
}

// ----------------- Eliminar reserva -----------------
function eliminarReserva(id, tipo) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => !(item.id === id && item.tipo === tipo));
    guardarCarrito(carrito);
    mostrarCarrito();
}

// ----------------- Limpiar carrito -----------------
function limpiarCarrito() {
    sessionStorage.removeItem("carritoReservas");
    mostrarCarrito();
}

document.getElementById("limpiarCarrito").addEventListener("click", () => {
    limpiarCarrito();
});

// ----------------- Inicializar carrito al cargar la página -----------------
document.addEventListener("DOMContentLoaded", mostrarCarrito);

// ----------------- Confirmar reserva hoteles -----------------
document.getElementById("confirmarReservaHotel")?.addEventListener("click", () => {
    const cant_cuartos = parseInt(document.getElementById("cantidadCuartos").value);
    const nombre = document.getElementById("HotelSeleccionadoTexto").textContent;
    const idHotel = parseInt(document.getElementById("confirmarReservaHotel").dataset.id);
    const fechaReserva = document.getElementById("fechaReservaHotel").value;
    const precio = parseFloat(document.getElementById("confirmarReservaHotel").dataset.precio);

    if (!idHotel) return alert("No se ha seleccionado un hotel");
    if (!fechaReserva) return alert("Debes seleccionar una fecha");

    agregarAlCarrito({
        id: idHotel,
        tipo: "hotel",
        nombre,
        cantidad: cant_cuartos,
        fecha_inicio: fechaReserva,
        precio: precio
    });

    const modalEl = document.getElementById('reservaModalHotel');
    bootstrap.Modal.getInstance(modalEl).hide();

    alert("Reserva agregada al carrito");
});

// ----------------- Confirmar reserva transporte -----------------
document.getElementById("confirmarReservaTransporte")?.addEventListener("click", () => {
    const cant_cupos = parseInt(document.getElementById("cantidadBoletos").value);
    const nombre = document.getElementById("transporteSeleccionadoTexto").textContent;
    const idTransporte = parseInt(document.getElementById("confirmarReservaTransporte").dataset.id);
    const fechaReserva = document.getElementById("fechaReservaTransporte").value;
    const precio = parseFloat(document.getElementById("confirmarReservaTransporte").dataset.precio);

    if (!idTransporte) return alert("No se ha seleccionado un transporte");
    if (!fechaReserva) return alert("Debes seleccionar una fecha");

    agregarAlCarrito({
        id: idTransporte,
        tipo: "transporte",
        nombre,
        cantidad: cant_cupos,
        fecha_inicio: fechaReserva,
        precio: precio
    });

    const modalEl = document.getElementById('reservaModalTransporte');
    bootstrap.Modal.getInstance(modalEl).hide();

    alert("Reserva agregada al carrito");
});

// ----------------- Confirmar pago y mostrar modal -----------------
document.getElementById("confirmarPago")?.addEventListener("click", () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) return alert("El carrito está vacío");

    let total = 0;
    let resumenHTML = "";

    carrito.forEach(item => {
        const precioUnitario = parseFloat(item.precio) || 0;
        const subtotal = precioUnitario * item.cantidad;
        total += subtotal;

        resumenHTML += `
            <li>
                <b>${item.tipo.toUpperCase()}</b>: ${item.nombre} <br>
                Cantidad: ${item.cantidad} <br>
                Precio unitario: $${precioUnitario.toFixed(2)} <br>
                Subtotal: $${subtotal.toFixed(2)}
            </li>
            <hr>
        `;
    });

    document.getElementById("resumenReservas").innerHTML = resumenHTML;
    document.getElementById("totalPagar").textContent = "$" + total.toFixed(2);
    document.getElementById("confirmarPagoFinal").dataset.total = total;

    const modal = new bootstrap.Modal(document.getElementById("resumenPagoModal"));
    modal.show();
});

// ----------------- Confirmar pago final -----------------
document.getElementById("confirmarPagoFinal")?.addEventListener("click", async () => {
    const carrito = obtenerCarrito();
    const idUsuario = parseInt(sessionStorage.getItem('userId'));
    const total = parseFloat(document.getElementById("confirmarPagoFinal").dataset.total);
    const userId = sessionStorage.getItem("userId");

    // 🚨 Validar sesión
    if (!userId) return alert("Debes iniciar sesión antes de realizar una reserva o pago.");

    try {
        const res = await fetch("/confirmar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservas: carrito, total }),
        credentials: "include" 
        });

        const data = await res.json();
        if (!data.success) return alert(data.mensaje || "Error procesando pago");

        alert(data.mensaje);
        limpiarCarrito();
        bootstrap.Modal.getInstance(document.getElementById("resumenPagoModal")).hide();

    } catch (error) {
        console.error(error);
        alert("Error al confirmar pago");
    }
});

// ----------------- Exponer funciones globalmente -----------------
window.obtenerCarrito = obtenerCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarReserva = eliminarReserva;
window.limpiarCarrito = limpiarCarrito;
