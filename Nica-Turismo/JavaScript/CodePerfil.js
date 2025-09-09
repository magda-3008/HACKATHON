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
    
    const userId = localStorage.getItem('userId');
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
                    // No return aquí, queremos mostrar el mensaje de éxito del perfil
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
    const userId = localStorage.getItem('userId');
    
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
    
    const userId = localStorage.getItem('userId');
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
    // Seleccionar todos los botones de toggle
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        // Asegurarnos de que no hay event listeners duplicados
        button.replaceWith(button.cloneNode(true));
    });
    
    // Volver a seleccionar después del clonado
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            // Encontrar el input asociado (debe ser el elemento hermano anterior)
            const input = this.closest('.input-group').querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            }
            
            // Mantener el foco en el input
            input.focus();
        });
    });
}

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
        // Eliminar datos de sesión del localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('usuario');
        
        // Redirigir al login
        window.location.href = 'login.html';
    }
}

// Configurar el evento para el botón de cerrar sesión
document.addEventListener('DOMContentLoaded', function() {
    // ... otro código que ya tienes ...
    
    // Configurar el botón de cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
});

// Datos de ejemplo para el historial de reservas
const reservasData = [
    { id: 1, nombre: "Lancha San Carlos - El Castillo", tipo: "Fluvial", precio: "$10", fecha: "2023-10-15", categoria: "rio-san-juan" },
    { id: 2, nombre: "Tour en bote Reserva Indio Maíz", tipo: "Fluvial", precio: "$35", fecha: "2023-10-10", categoria: "rio-san-juan" },
    { id: 3, nombre: "Ferry San Jorge - Ometepe", tipo: "Lacustre", precio: "$6", fecha: "2023-10-05", categoria: "gran-lago-cocibolca" },
    { id: 4, nombre: "Lancha Isletas de Granada", tipo: "Lacustre", precio: "$5", fecha: "2023-10-03", categoria: "gran-lago-cocibolca" },
    { id: 5, nombre: "Bus Estelí - Somoto", tipo: "Colectivo", precio: "$4", fecha: "2023-09-28", categoria: "segovianas" },
    { id: 6, nombre: "Taxi Matagalpa - Jinotega", tipo: "Taxi compartido", precio: "$3", fecha: "2023-09-25", categoria: "matagalpinas" },
    { id: 7, nombre: "Bus Jinotega - San Rafael del Norte", tipo: "Colectivo", precio: "$2.5", fecha: "2023-09-20", categoria: "jinoteganos" },
    { id: 8, nombre: "Transporte Masaya - Volcán Masaya", tipo: "Tour", precio: "$12", fecha: "2023-09-15", categoria: "volcanes" },
    { id: 9, nombre: "Bus Granada - León", tipo: "Colectivo", precio: "$6", fecha: "2023-09-10", categoria: "ciudades-patrimoniales" },
    { id: 10, nombre: "Bus Masaya - San Juan de Oriente", tipo: "Colectivo", precio: "$1", fecha: "2023-09-05", categoria: "pueblos-artesanos" },
    { id: 11, nombre: "Shuttle Managua - San Juan del Sur", tipo: "Privado", precio: "$15", fecha: "2023-09-01", categoria: "playeras" },
    { id: 12, nombre: "Vuelo Managua - Bluefields", tipo: "Aéreo", precio: "$80", fecha: "2023-08-28", categoria: "caribenas" },
    { id: 13, nombre: "Tour Gastronómico León", tipo: "Privado", precio: "$25", fecha: "2023-08-25", categoria: "gastronomica" },
    { id: 14, nombre: "Bus Juigalpa - Boaco", tipo: "Colectivo", precio: "$2.5", fecha: "2023-08-20", categoria: "boaquena-chontalenas" }
];

// Variables para paginación y filtros
let paginaActual = 1;
const reservasPorPagina = 5;
let reservasFiltradas = [];

// Función para formatear fechas
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Función para cargar las reservas en la tabla
function cargarReservas() {
    const cuerpoTabla = document.getElementById('cuerpoTablaReservas');
    cuerpoTabla.innerHTML = '';
    
    const inicio = (paginaActual - 1) * reservasPorPagina;
    const fin = inicio + reservasPorPagina;
    const reservasPagina = reservasFiltradas.slice(inicio, fin);
    
    if (reservasPagina.length === 0) {
        document.getElementById('sinResultados').classList.remove('d-none');
        document.getElementById('tablaReservas').classList.add('d-none');
        document.getElementById('paginacion').classList.add('d-none');
        return;
    }
    
    document.getElementById('sinResultados').classList.add('d-none');
    document.getElementById('tablaReservas').classList.remove('d-none');
    document.getElementById('paginacion').classList.remove('d-none');
    
    reservasPagina.forEach(reserva => {
        const fila = document.createElement('tr');
        
        // Formatear la categoría para mostrar
        let categoriaMostrar = reserva.categoria;
        if (reserva.categoria === 'rio-san-juan') categoriaMostrar = 'Río San Juan';
        else if (reserva.categoria === 'gran-lago-cocibolca') categoriaMostrar = 'Gran Lago Cocibolca';
        else if (reserva.categoria === 'ciudades-patrimoniales') categoriaMostrar = 'Ciudades Patrimoniales';
        else if (reserva.categoria === 'pueblos-artesanos') categoriaMostrar = 'Pueblos Artesanos';
        else if (reserva.categoria === 'boaquena-chontalenas') categoriaMostrar = 'Boaqueña-Chontalenas';
        else categoriaMostrar = reserva.categoria.charAt(0).toUpperCase() + reserva.categoria.slice(1);
        
        fila.innerHTML = `
            <td>${reserva.id}</td>
            <td>${reserva.nombre}</td>
            <td><span class="badge bg-secondary">${reserva.tipo}</span></td>
            <td><span class="badge bg-success">${reserva.precio}</span></td>
            <td>${formatearFecha(reserva.fecha)}</td>
            <td><span class="badge bg-info text-dark">${categoriaMostrar}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="verDetallesReserva(${reserva.id})">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="cancelarReserva(${reserva.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    actualizarPaginacion();
}

// Función para actualizar la paginación
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(reservasFiltradas.length / reservasPorPagina);
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';
    
    // Botón anterior
    const liAnterior = document.createElement('li');
    liAnterior.classList.add('page-item', paginaActual === 1 ? 'disabled' : '');
    liAnterior.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${paginaActual - 1})">Anterior</a>`;
    paginacion.appendChild(liAnterior);
    
    // Números de página
    for (let i = 1; i <= totalPaginas; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item', i === paginaActual ? 'active' : '');
        li.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${i})">${i}</a>`;
        paginacion.appendChild(li);
    }
    
    // Botón siguiente
    const liSiguiente = document.createElement('li');
    liSiguiente.classList.add('page-item', paginaActual === totalPaginas ? 'disabled' : '');
    liSiguiente.innerHTML = `<a class="page-link" href="#" onclick="cambiarPagina(${paginaActual + 1})">Siguiente</a>`;
    paginacion.appendChild(liSiguiente);
}

// Función para cambiar de página
function cambiarPagina(pagina) {
    paginaActual = pagina;
    cargarReservas();
    window.scrollTo({ top: document.getElementById('tablaReservas').offsetTop - 100, behavior: 'smooth' });
}

// Funciones para las acciones de reserva (simuladas)
function verDetallesReserva(id) {
    const reserva = reservasData.find(r => r.id === id);
    alert(`Detalles de la reserva:\n\nID: ${reserva.id}\nServicio: ${reserva.nombre}\nTipo: ${reserva.tipo}\nPrecio: ${reserva.precio}\nFecha: ${formatearFecha(reserva.fecha)}`);
}

function cancelarReserva(id) {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        alert(`Reserva #${id} cancelada exitosamente.`);
        // En una implementación real, aquí harías una llamada a tu API
    }
}

// Inicializar la sección de reservas cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar con todas las reservas
    reservasFiltradas = [...reservasData];
    cargarReservas();
    
    // Configurar event listeners para los filtros
    document.getElementById('filtroCategoria').addEventListener('change', filtrarReservas);
    document.getElementById('buscarReserva').addEventListener('input', filtrarReservas);
});