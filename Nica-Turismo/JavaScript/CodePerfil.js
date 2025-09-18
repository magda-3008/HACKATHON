document.getElementById('logo').addEventListener('click', () => {
    window.location.href = 'home2.html';
});

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del usuario al abrir la página
    cargarDatosUsuario();
    
    // Configurar evento para el formulario de edición
    document.getElementById('formEditarPerfil').addEventListener('submit', editarPerfil);
    
    // Preview de imagen al seleccionar un archivo
    document.getElementById('editarImagen').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido');
                this.value = ''; // Limpiar el input
                return;
            }
            
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es demasiado grande. El tamaño máximo permitido es 5MB.');
                this.value = ''; // Limpiar el input
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('previewImagen').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Función para editar perfil
async function editarPerfil(e) {
    e.preventDefault();
    
    const userId = sessionStorage.getItem('userId');
    const nombre = document.getElementById('editarNombre').value;
    const email = document.getElementById('editarCorreo').value;
    const imagenInput = document.getElementById('editarImagen');
    
    // Obtener valores de contraseña si se están cambiando
    const contrasenaActual = document.getElementById('contrasenaActual').value;
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;
    
    // Validar contraseñas si se están cambiando
    let cambiarPassword = false;
    if (contrasenaActual || nuevaContrasena || confirmarContrasena) {
        cambiarPassword = true;
        
        // Verificar que todos los campos de contraseña estén completos
        if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
            alert('Por favor, complete todos los campos de contraseña');
            return;
        }
        
        // Verificar que las nuevas contraseñas coincidan
        if (nuevaContrasena !== confirmarContrasena) {
            alert('Las nuevas contraseñas no coinciden');
            return;
        }
    }
    
    // Si hay una nueva imagen, subirla
    if (imagenInput.files.length > 0) {
        await subirImagenPerfil(userId, imagenInput.files[0]);
    }
    
    try {
        // Actualizar datos básicos del perfil
        const response = await fetch(`/actualizarusuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre_usuario: nombre,
                email: email
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            alert('Error al actualizar perfil: ' + data.message);
            return;
        }
        
        // Si se está cambiando la contraseña, hacerlo por separado
        if (cambiarPassword) {
            try {
                const passwordResponse = await fetch(`/cambiarpassword/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contrasena_actual: contrasenaActual,
                        nueva_contrasena: nuevaContrasena
                    })
                });
                
                const passwordData = await passwordResponse.json();
                
                if (!passwordData.success) {
                    alert('Perfil actualizado pero error al cambiar contraseña: ' + passwordData.message);
                }
            } catch (error) {
                console.error('Error al cambiar contraseña:', error);
                alert('Perfil actualizado pero error al cambiar contraseña');
            }
        }
        
        alert('Perfil actualizado correctamente' + (cambiarPassword ? ' y contraseña cambiada' : ''));
        // Recargar datos
        cargarDatosUsuario();
        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('editarPerfilModal')).hide();
        // Limpiar campos de contraseña
        document.getElementById('contrasenaActual').value = '';
        document.getElementById('nuevaContrasena').value = '';
        document.getElementById('confirmarContrasena').value = '';
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
  // Cargar datos del usuario al abrir la página
    cargarDatosUsuario();
    
    // Configurar eventos para los modales
    document.getElementById('formEditarPerfil').addEventListener('submit', editarPerfil);
    document.getElementById('formCambiarContrasena').addEventListener('submit', cambiarContrasena);
    
    // Preview de imagen al seleccionar un archivo
    document.getElementById('editarImagen').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea una imagen
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen válido');
                this.value = ''; // Limpiar el input
                return;
            }
            
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('La imagen es demasiado grande. El tamaño máximo permitido es 5MB.');
                this.value = ''; // Limpiar el input
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('previewImagen').src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Función para cargar los datos del usuario
async function cargarDatosUsuario() {
    const userId = sessionStorage.getItem('userId');
    
    if (!userId) {
        alert('Usuario no identificado. Por favor, inicie sesión nuevamente.');
        window.location = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`/obtenerusuario/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const usuario = data.usuario;
            
            // Mostrar datos en la interfaz
            document.getElementById('nombreUsuario').textContent = usuario.nombre_usuario;
            document.getElementById('correoUsuario').textContent = usuario.email;
            
            // Cargar imagen de perfil
            cargarImagenPerfil(userId);
            
            // Llenar formulario de edición
            document.getElementById('editarNombre').value = usuario.nombre_usuario;
            document.getElementById('editarCorreo').value = usuario.email;
            
        } else {
            alert('Error al cargar los datos del usuario: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

// Función para cargar la imagen de perfil
function cargarImagenPerfil(userId) {
    // Usar un timestamp para evitar caché
    const timestamp = new Date().getTime();
    document.getElementById('perfilImagen').src = `/imagen-perfil/${userId}?t=${timestamp}`;
    document.getElementById('previewImagen').src = `/imagen-perfil/${userId}?t=${timestamp}`;
}

// Función para subir imagen de perfil
async function subirImagenPerfil(userId, file) {
    const formData = new FormData();
    formData.append('imagen', file);
    
    try {
        const response = await fetch(`/subir-imagen-perfil/${userId}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            alert('Error al subir la imagen: ' + data.message);
            throw new Error(data.message);
        }
        
        return data;
    } catch (error) {
        console.error('Error al subir imagen:', error);
        alert('Error al subir la imagen');
        throw error;
    }
}

// Función para cambiar contraseña (se mantiene igual)
async function cambiarContrasena(e) {
    e.preventDefault();
    
    const userId = sessionStorage.getItem('userId');
    const contrasenaActual = document.getElementById('contrasenaActual').value;
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;
    
    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
        alert('Las contraseñas nuevas no coinciden');
        return;
    }
    
    try {
        const response = await fetch(`/cambiarpassword/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contrasena_actual: contrasenaActual,
                nueva_contrasena: nuevaContrasena
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Contraseña actualizada correctamente');
            // Limpiar formulario
            document.getElementById('formCambiarContrasena').reset();
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('cambiarContrasenaModal')).hide();
        } else {
            alert('Error al cambiar contraseña: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

// Función para toggle de visibilidad de contraseña
function setupPasswordToggles() {
  // Evitar listeners duplicados (clonando)
  document.querySelectorAll('.toggle-password').forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
  });

  // Añadir listeners
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      // Primero, intentar localizar input vía data-target
      const target = btn.dataset.target;
      let input = target ? document.querySelector(target) : null;

      // Si no encontró, intentar buscar en input-group o elemento anterior
      if (!input) {
        input = btn.closest('.input-group')?.querySelector('input[type="password"], input[type="text"]') || 
                (btn.previousElementSibling && btn.previousElementSibling.tagName === 'INPUT' ? btn.previousElementSibling : null);
      }

      if (!input) {
        console.warn('toggle-password: no se encontró input asociado para', btn);
        return;
      }

      const icon = btn.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
          icon.classList.remove('bi-eye-slash');
          icon.classList.add('bi-eye');
        }
      } else {
        input.type = 'password';
        if (icon) {
          icon.classList.remove('bi-eye');
          icon.classList.add('bi-eye-slash');
        }
      }

      // Mantener el foco sin hacer scroll brusco
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    });
  });
}

// Asegúrate de ejecutar la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', setupPasswordToggles);

// Configurar los toggles cuando el modal se abra
document.addEventListener('DOMContentLoaded', function() {
    // Configurar inicialmente
    setupPasswordToggles();
    
    // También configurar cuando el modal se muestre (por si se carga dinámicamente)
    const editModal = document.getElementById('editarPerfilModal');
    if (editModal) {
        editModal.addEventListener('shown.bs.modal', function() {
            // Pequeño retraso para asegurar que los elementos estén renderizados
            setTimeout(setupPasswordToggles, 50);
        });
    }
});

// Función para cerrar sesión
function cerrarSesion() {
    // Mostrar confirmación
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Eliminar datos de sesión del sessionStorage
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('usuario');
        
        // Redirigir al login
        window.location.href = 'home2.html';
    }
}

// Configurar el evento para el botón de cerrar sesión
document.addEventListener('DOMContentLoaded', function() {
    
    // Configurar el botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// Historial de reservas
let reservasData = [];
let reservasFiltradas = [];
let paginaActual = 1;
const reservasPorPagina = 5;

// 🔹 Función para formatear fechas
function formatearFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}

// 🔹 Obtener tipos de servicio únicos
function obtenerTiposServicio() {
    const tipos = [...new Set(reservasData.map(reserva => reserva.tipo_servicio))];
    return tipos;
}

// 🔹 Cargar opciones de filtro de servicio
function cargarFiltroServicios() {
    const filtroSelect = document.getElementById('filtroServicio');
    const tiposServicio = obtenerTiposServicio();
    
    // Limpiar opciones existentes (excepto la primera)
    while (filtroSelect.options.length > 1) {
        filtroSelect.remove(1);
    }
    
    // Añadir opciones para cada tipo de servicio
    tiposServicio.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        filtroSelect.appendChild(option);
    });
}

// 🔹 Aplicar filtros
function aplicarFiltros() {
    const tipoServicio = document.getElementById('filtroServicio').value;
    //const ordenFecha = document.getElementById('ordenFecha').value;
    
    // Filtrar por tipo de servicio
    if (tipoServicio === 'todos') {
        reservasFiltradas = [...reservasData];
    } else {
        reservasFiltradas = reservasData.filter(reserva => 
            reserva.tipo_servicio === tipoServicio
        );
    }
    
    // Reiniciar a la primera página después de filtrar
    paginaActual = 1;
    
    // Volver a renderizar
    cargarReservas();
    actualizarPaginacion();
}

// 🔹 Renderizar tabla de reservas
function cargarReservas() {
    const tbody = document.getElementById("historialBody");
    tbody.innerHTML = "";

    const inicio = (paginaActual - 1) * reservasPorPagina;
    const fin = inicio + reservasPorPagina;
    const reservasPagina = reservasFiltradas.slice(inicio, fin);

    if (reservasPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No hay reservas disponibles</td></tr>`;
        return;
    }

    reservasPagina.forEach(reserva => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${reserva.tipo_servicio}</td>
        <td>${formatearFecha(reserva.fecha_inicio)}</td>
        <td>${reserva.cant_cupos}</td> <!-- Nueva columna -->
        <td>
            <span class="badge ${reserva.estado === "Confirmada" ? "bg-success" : "bg-danger"}">
                ${reserva.estado}
            </span>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-danger cancelar-btn" data-id="${reserva.id}" title="Cancelar reserva">
                <i class="fas fa-times"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);
    });

    // 🔹 Agregar eventos a los botones "Cancelar"
    document.querySelectorAll(".cancelar-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const idReserva = e.currentTarget.getAttribute("data-id");
            if (confirm("¿Seguro que quieres cancelar esta reserva?")) {
                await cancelarReserva(idReserva);
            }
        });
    });
}

// 🔹 Actualizar controles de paginación
function actualizarPaginacion() {
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';

    const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);

    if (totalPaginas <= 1) return; // No mostrar paginación si hay 1 o 0 páginas

    // Botón Anterior
    const liAnterior = document.createElement('li');
    liAnterior.classList.add('page-item');
    if (paginaActual === 1) liAnterior.classList.add('disabled');
    liAnterior.innerHTML = `
        <a class="page-link" href="#" aria-label="Anterior">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    liAnterior.addEventListener('click', (e) => {
        e.preventDefault();
        if (paginaActual > 1) {
            paginaActual--;
            cargarReservas();
            actualizarPaginacion();
        }
    });
    paginacion.appendChild(liAnterior);

    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (i === paginaActual) li.classList.add('active');

        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            paginaActual = i;
            cargarReservas();
            actualizarPaginacion();
        });

        paginacion.appendChild(li);
    }

    // Botón Siguiente
    const liSiguiente = document.createElement('li');
    liSiguiente.classList.add('page-item');
    if (paginaActual === totalPaginas) liSiguiente.classList.add('disabled');

    liSiguiente.innerHTML = `
        <a class="page-link" href="#" aria-label="Siguiente">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    liSiguiente.addEventListener('click', (e) => {
        e.preventDefault();
        if (paginaActual < totalPaginas) {
            paginaActual++;
            cargarReservas();
            actualizarPaginacion();
        }
    });
    paginacion.appendChild(liSiguiente);
}


// 🔹 Función para obtener reservas del backend
async function cargarReservasBD(idUsuario) {
    try {
        const response = await fetch(`/obtenerreservas/${idUsuario}`);
        const data = await response.json();

        if (!data.success) {
            alert("No se pudieron cargar las reservas");
            return;
        }

        reservasData = data.reservas;
        reservasFiltradas = [...reservasData];
        
        // Cargar filtros y renderizar
        cargarFiltroServicios();
        cargarReservas();
        actualizarPaginacion();
    } catch (error) {
        console.error("Error al cargar reservas:", error);
    }
}

// 🔹 Función para cancelar reserva (llama al backend)
async function cancelarReserva(idReserva) {
    try {
        const response = await fetch(`/cancelarreserva/${idReserva}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "Cancelada" })
        });

        const data = await response.json();
        if (data.success) {
            alert("Reserva cancelada con éxito");
            // Recargar reservas
            const idUsuario = 1; // aquí deberías usar el usuario en sesión
            await cargarReservasBD(idUsuario);
        } else {
            alert("No se pudo cancelar la reserva");
        }
    } catch (error) {
        console.error("Error al cancelar reserva:", error);
    }
}

// 🔹 Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Obtener el ID del usuario desde sessionStorage y convertirlo a número
    const idUsuario = parseInt(sessionStorage.getItem('userId'));
    
    if (!idUsuario) {
        console.error('No hay usuario en sesión');
        return;
    }

    // Configurar eventos para los filtros
    document.getElementById('filtroServicio').addEventListener('change', aplicarFiltros);
    //document.getElementById('ordenFecha').addEventListener('change', aplicarFiltros);
    
    // Cargar datos
    cargarReservasBD(idUsuario);
});
