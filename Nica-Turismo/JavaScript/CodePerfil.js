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
