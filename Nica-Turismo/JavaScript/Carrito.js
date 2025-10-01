function obtenerCarrito() {
  return JSON.parse(sessionStorage.getItem("carritoReservas")) || [];
}

function guardarCarrito(carrito) {
  sessionStorage.setItem("carritoReservas", JSON.stringify(carrito));
}

function mostrarCarrito() {
  const carrito = obtenerCarrito();
  const contenedor = document.getElementById("carritoItems");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!carrito.length) {
    contenedor.innerHTML = "<p>Tu carrito está vacío</p>";
    return;
  }

  carrito.forEach((item) => {
    const subtotal = (item.precio || 0) * item.cantidad;
    const div = document.createElement("div");
    div.classList.add("carrito-item");

    const idParam = item.tipo === "hotel" ? item.id_hotel : item.id;

    div.innerHTML = `
            <span>${item.nombre} x ${item.cantidad} (${
      item.tipo
    }) - $${subtotal.toFixed(2)}</span>
            <button class="btn btn-sm btn-danger" onclick="eliminarReserva('${
              item.id
            }', '${item.tipo}', '${item.id_hotel || ""}')">&times;</button>
        `;
    contenedor.appendChild(div);
  });
}

function agregarAlCarrito(reserva) {
  let carrito = obtenerCarrito();
  const index = carrito.findIndex(
    (item) => item.id === reserva.id && item.tipo === reserva.tipo
  );

  if (index !== -1) {
    carrito[index].cantidad += reserva.cantidad;
    carrito[index].precio = reserva.precio; // actualizar precio
  } else {
    carrito.push(reserva);
  }

  guardarCarrito(carrito);
  mostrarCarrito();
}

function eliminarReserva(id, tipo, id_hotel = null) {
  let carrito = obtenerCarrito();

  // Buscar por el campo correcto según el tipo
  if (tipo === "hotel" && id_hotel !== null) {
    carrito = carrito.filter(
      (item) => !(item.id_hotel === id_hotel && item.tipo === tipo)
    );
  } else {
    carrito = carrito.filter((item) => !(item.id === id && item.tipo === tipo));
  }

  guardarCarrito(carrito);
  mostrarCarrito();
}

function limpiarCarrito() {
  sessionStorage.removeItem("carritoReservas");
  mostrarCarrito();
}

document.getElementById("limpiarCarrito").addEventListener("click", () => {
  limpiarCarrito();
});

document.addEventListener("DOMContentLoaded", mostrarCarrito);

document
  .getElementById("confirmarReservaHotel")
  ?.addEventListener("click", () => {
    const cant_cuartos = parseInt(
      document.getElementById("cantidadCuartos").value
    );
    const nombre = document.getElementById(
      "HotelSeleccionadoTexto"
    ).textContent;
    const idHotel = parseInt(
      document.getElementById("confirmarReservaHotel").dataset.id
    );
    const fechaReserva = document.getElementById("fechaReservaHotel").value;
    const precio = parseFloat(
      document.getElementById("confirmarReservaHotel").dataset.precio
    );

    if (!idHotel) return alert("No se ha seleccionado un hotel");
    if (!fechaReserva) return alert("Debes seleccionar una fecha");

    agregarAlCarrito({
      id: idHotel,
      tipo: "hotel",
      nombre,
      cantidad: cant_cuartos,
      fecha_inicio: fechaReserva,
      precio: precio,
    });

    const modalEl = document.getElementById("reservaModalHotel");
    bootstrap.Modal.getInstance(modalEl).hide();

    alert("Reserva agregada al carrito");
  });

document
  .getElementById("confirmarReservaTransporte")
  ?.addEventListener("click", () => {
    const cant_cupos = parseInt(
      document.getElementById("cantidadBoletos").value
    );
    const nombre = document.getElementById(
      "transporteSeleccionadoTexto"
    ).textContent;
    const idTransporte = parseInt(
      document.getElementById("confirmarReservaTransporte").dataset.id
    );
    const fechaReserva = document.getElementById(
      "fechaReservaTransporte"
    ).value;
    const precio = parseFloat(
      document.getElementById("confirmarReservaTransporte").dataset.precio
    );

    if (!idTransporte) return alert("No se ha seleccionado un transporte");
    if (!fechaReserva) return alert("Debes seleccionar una fecha");

    agregarAlCarrito({
      id: idTransporte,
      tipo: "transporte",
      nombre,
      cantidad: cant_cupos,
      fecha_inicio: fechaReserva,
      precio: precio,
    });

    const modalEl = document.getElementById("reservaModalTransporte");
    bootstrap.Modal.getInstance(modalEl).hide();

    alert("Reserva agregada al carrito");
  });

document.getElementById("confirmarPago")?.addEventListener("click", () => {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return alert("El carrito está vacío");

  let total = 0;
  let resumenHTML = "";

  carrito.forEach((item) => {
    const precioUnitario = parseFloat(item.precio) || 0;
    const subtotal = precioUnitario * item.cantidad;
    total += subtotal;

    resumenHTML += `
            <li>
                <b>${item.tipo.toUpperCase()}</b>: ${item.nombre} <br>
                Cantidad de cupos/habitaciones: ${item.cantidad} <br>
                Precio unitario: $${precioUnitario.toFixed(2)} <br>
                Subtotal: $${subtotal.toFixed(2)}
            </li>
            <hr>
        `;
  });

  document.getElementById("resumenReservas").innerHTML = resumenHTML;
  document.getElementById("totalPagar").textContent = "$" + total.toFixed(2);
  document.getElementById("confirmarPagoFinal").dataset.total = total;

  const modal = new bootstrap.Modal(
    document.getElementById("resumenPagoModal")
  );
  modal.show();
});

document
  .getElementById("confirmarPagoFinal")
  ?.addEventListener("click", async () => {
    const carrito = obtenerCarrito();
    const total = parseFloat(
      document.getElementById("confirmarPagoFinal").dataset.total
    );
    const userId = sessionStorage.getItem("userId");
    const metodoPago = document.getElementById("metodoPago").value; 

    if (!userId)
      return alert(
        "Debes iniciar sesión antes de realizar una reserva o pago."
      );
    if (!metodoPago) return alert("Debes seleccionar un método de pago.");

    const estado = metodoPago === "Tarjeta" ? "Confirmada" : "Pendiente";

    try {
      const res = await fetch("/confirmar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservas: carrito,
          total,
          metodoPago, 
          estado,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success) return alert(data.mensaje || "Error procesando pago");

      alert(data.mensaje);
      limpiarCarrito();
      bootstrap.Modal.getInstance(
        document.getElementById("resumenPagoModal")
      ).hide();
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
