const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();

app.use(express.json()); // Para manejar datos JSON
app.use(express.urlencoded({ extended: true })); // Para manejar datos codificados en formularios


// Configuración de la conexión a la base de datos
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nica_turismo_bdd'
});

// Ruta para recibir datos del formulario y guardarlos en la base de datos
app.post('/guardarusuario', (req, res) => {
    // Extraer los datos del cuerpo de la solicitud (formulario)
    const {
        nombre_usuario,
        email,
        foto_perfil,
        contrasena
    } = req.body;

    // Query SQL para insertar los datos en la tabla datospersona
    const insertQuery = `
        INSERT INTO datos_usuario (
            nombre_usuario,
            email,
            foto_perfil,
            contrasena
        ) VALUES (?, ?, ?, ?)
    `;

    // Array con los valores a insertar
    const values = [
        nombre_usuario,
        email,
        foto_perfil,
        contrasena
    ];

    // Ejecutar la consulta SQL
    conexion.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error al insertar datos:', err);
            res.status(500).json({ error: 'Error al insertar datos del usuario' });
            return;
        }

        // Obtener el ID del paciente insertado
        const idUsuario = result.insertId;

        console.log('Datos del usuario insertados correctamente');
        res.status(200).json({ message: 'Datos del usuario insertados correctamente', id: idUsuario });
    });
});

// Función para ejecutar la consulta SQL
function ejecutarConsulta(tabla, callback) {
    conexion.query(`SELECT * FROM ${tabla}`, (err, rows) => {
        if (err) {
            console.error('Error al ejecutar consulta:', err);
            callback(err, null);
            return;
        }
        console.log('Consulta ejecutada correctamente');
        callback(null, rows); // Llama al callback con los resultados de la consulta
    });
}

// Ruta para obtener los datos de pacientes y enviarlos como respuesta JSON
app.get('/datos_usuario', (req, res) => {
    ejecutarConsulta('datos_usuario', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener datos de pacientes' });
            return;
        }
        res.json(data); // Enviar los datos recuperados como respuesta JSON
    });
});

app.use(express.static(path.join(__dirname, 'HACKATHON')));

// Verificar la conexión a la base de datos
conexion.connect(function(err) {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        process.exit(1); // Salir del proceso si hay un error de conexión
    } else {
        console.log('Conexión exitosa a la base de datos');
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});