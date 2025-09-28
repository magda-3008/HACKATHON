const express = require("express");
const mysql = require("mysql");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const session = require("express-session");

const app = express();

app.use(express.json({ limit: "10mb" })); // Aumenta el límite a 10MB
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Aumenta el límite a 10MB

app.use(express.json()); // Para manejar datos JSON
app.use(express.urlencoded({ extended: true })); // Para manejar datos codificados en formularios

//Cookies de sesión
app.use(
  session({
    secret: "N1(4TU5",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

// Configuración de la conexión a la base de datos
const conexion = mysql.createConnection({
  host: "sql110.infinityfree.com",           
  user: "if0_40046065",                     
  password: "uEsAOr5gBLM0",          
  database: "if0_40046065_nica_turismo_bdd", 
});

// Configuración de multer para almacenar imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/profile/";
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar un nombre único para el archivo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "user-" +
        req.params.id +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: function (req, file, cb) {
    // Solo permitir imágenes
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes"), false);
    }
  },
});

// Ruta para recibir datos del formulario y guardarlos en la base de datos
app.post("/guardarusuario", upload.single("foto_perfil"), (req, res) => {
  // Extraer los datos del cuerpo de la solicitud (formulario)
  const { nombre_usuario, email, contrasena } = req.body;

  // Manejar la imagen si se proporcionó
  let foto_perfil = null;
  if (req.file) {
    foto_perfil = req.file.path;
  }

  // Query SQL para insertar los datos en la tabla
  const insertQuery = `
        INSERT INTO datos_usuario (
            nombre_usuario,
            email,
            foto_perfil,
            contrasena
        ) VALUES (?, ?, ?, ?)
    `;

  // Array con los valores a insertar
  const values = [nombre_usuario, email, foto_perfil, contrasena];

  // Ejecutar la consulta SQL
  conexion.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("Error al insertar datos:", err);
      // Eliminar la imagen subida si hay error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Error al insertar datos del usuario" });
      return;
    }

    // Obtener el ID del usuario insertado
    const idUsuario = result.insertId;

    console.log("Datos del usuario insertados correctamente");
    res
      .status(200)
      .json({
        message: "Datos del usuario insertados correctamente",
        id: idUsuario,
      });
  });
});

// Función para ejecutar la consulta SQL
function ejecutarConsulta(tabla, callback) {
  conexion.query(`SELECT * FROM ${tabla}`, (err, rows) => {
    if (err) {
      console.error("Error al ejecutar consulta:", err);
      callback(err, null);
      return;
    }
    console.log("Consulta ejecutada correctamente");
    callback(null, rows); // Llama al callback con los resultados de la consulta
  });
}

//Controlador para el login
app.post("/datosusuario", (req, res) => {
  const { usuario, contraseña } = req.body;

  const query =
    "SELECT * FROM datos_usuario WHERE nombre_usuario = ? AND contrasena = ?";
  conexion.query(query, [usuario, contraseña], (err, result) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en servidor" });
    }

    if (result.length > 0) {
      // Usuario válido
      const user = result[0];

      // Guardar el ID del usuario en la sesión
      req.session.userId = user.id;

      res.json({
        success: true,
        message: "Login exitoso",
        nombre: user.nombre_usuario,
      });
    } else {
      // Usuario incorrecto
      res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }
  });
});

// Ruta para obtener datos del usuario por ID
app.get("/obtenerusuario/:id", (req, res) => {
  const userId = req.params.id;

  const query = "SELECT * FROM datos_usuario WHERE id = ?";
  conexion.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en servidor" });
    }

    if (result.length > 0) {
      // Eliminamos la contraseña por seguridad
      const usuario = { ...result[0] };
      delete usuario.contrasena;
      res.json({ success: true, usuario: usuario });
    } else {
      res.json({ success: false, message: "Usuario no encontrado" });
    }
  });
});

// Servir archivos estáticos desde la carpeta uploads
app.use("/uploads", express.static("uploads"));

// Ruta para subir imagen de perfil
app.post("/subir-imagen-perfil/:id", upload.single("imagen"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({
        success: false,
        message: "No se proporcionó ninguna imagen válida",
      });
  }

  const userId = req.params.id;
  const imagePath = req.file.path;

  // Actualizar la base de datos con la ruta de la imagen
  const query = "UPDATE datos_usuario SET foto_perfil = ? WHERE id = ?";
  conexion.query(query, [imagePath, userId], (err, result) => {
    if (err) {
      console.error("Error al actualizar la imagen:", err);
      // Eliminar la imagen subida si hay error en la BD
      fs.unlinkSync(imagePath);
      return res
        .status(500)
        .json({ success: false, message: "Error al actualizar la imagen" });
    }

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Imagen actualizada correctamente",
        imagePath: imagePath,
      });
    } else {
      // Eliminar la imagen si no se actualizó el usuario
      fs.unlinkSync(imagePath);
      res.json({ success: false, message: "No se pudo actualizar la imagen" });
    }
  });
});

// Ruta para obtener imagen de perfil
app.get("/imagen-perfil/:id", (req, res) => {
  const userId = req.params.id;

  const query = "SELECT foto_perfil FROM datos_usuario WHERE id = ?";
  conexion.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error al obtener la imagen:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error al obtener la imagen" });
    }

    if (result.length > 0 && result[0].foto_perfil) {
      // Verificar si el archivo existe
      if (fs.existsSync(result[0].foto_perfil)) {
        res.sendFile(path.resolve(result[0].foto_perfil));
      } else {
        // Si el archivo no existe, enviar imagen por defecto
        res.sendFile(path.resolve("../Resource/user.webp"));
      }
    } else {
      // Si no hay imagen en la BD, enviar imagen por defecto
      res.sendFile(path.resolve("../Resource/user.webp"));
    }
  });
});

// Modifica la ruta de actualización de usuario para que no incluya la imagen
app.put("/actualizarusuario/:id", (req, res) => {
  const userId = req.params.id;
  const { nombre_usuario, email } = req.body;

  const query =
    "UPDATE datos_usuario SET nombre_usuario = ?, email = ? WHERE id = ?";
  conexion.query(query, [nombre_usuario, email, userId], (err, result) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en servidor" });
    }

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Datos actualizados correctamente" });
    } else {
      res.json({ success: false, message: "No se pudo actualizar el usuario" });
    }
  });
});

// Ruta para cambiar contraseña
app.put("/cambiarpassword/:id", (req, res) => {
  const userId = req.params.id;
  const { contrasena_actual, nueva_contrasena } = req.body;

  // Verificar la contraseña actual
  const verifyQuery =
    "SELECT * FROM datos_usuario WHERE id = ? AND contrasena = ?";
  conexion.query(verifyQuery, [userId, contrasena_actual], (err, result) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en servidor" });
    }

    if (result.length > 0) {
      // Si la contraseña actual es correcta, actualizar
      const updateQuery =
        "UPDATE datos_usuario SET contrasena = ? WHERE id = ?";
      conexion.query(
        updateQuery,
        [nueva_contrasena, userId],
        (err, updateResult) => {
          if (err) {
            console.error("Error en la consulta:", err);
            return res
              .status(500)
              .json({ success: false, message: "Error en servidor" });
          }

          if (updateResult.affectedRows > 0) {
            res.json({
              success: true,
              message: "Contraseña actualizada correctamente",
            });
          } else {
            res.json({
              success: false,
              message: "No se pudo actualizar la contraseña",
            });
          }
        }
      );
    } else {
      res.json({ success: false, message: "Contraseña actual incorrecta" });
    }
  });
});

app.get("/obtenerusuariopornombre/:nombre", (req, res) => {
  const nombreUsuario = req.params.nombre;

  const query = "SELECT * FROM datos_usuario WHERE nombre_usuario = ?";
  conexion.query(query, [nombreUsuario], (err, result) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en servidor" });
    }

    if (result.length > 0) {
      res.json({ success: true, usuario: result[0] });
    } else {
      res.json({ success: false, message: "Usuario no encontrado" });
    }
  });
});

// Obtener transportes con su ruta
app.get("/transportes", (req, res) => {
  const query = `
        SELECT t.id, t.nombre, t.tipo, t.precio, t.modalidad AS frecuencia,
               t.imagen_url AS img, t.id_ruta, r.nombre AS ruta_nombre
        FROM transporte t
        INNER JOIN ruta_turistica r ON t.id_ruta = r.id_ruta
    `;

  conexion.query(query, (err, rows) => {
    if (err) {
      console.error("Error al obtener transportes:", err);
      return res.status(500).json({ error: "Error al obtener transportes" });
    }

    const transportesPorRuta = {};
    const rutas = {};

    rows.forEach((row) => {
      const rutaId = row.id_ruta;

      if (!transportesPorRuta[rutaId]) transportesPorRuta[rutaId] = [];
      transportesPorRuta[rutaId].push(row);

      rutas[rutaId] = row.ruta_nombre;
    });

    res.json({ transportes: transportesPorRuta, rutas });
  });
});

// Ruta para obtener reservas de un usuario por ID
app.get("/obtenerreservas/:id", (req, res) => {
  const userId = req.params.id;

  const query = `
        SELECT 
            hr.id,
            h.id_hotel,
            hr.tipo_servicio,
            hr.id_servicio,
            hr.fecha_inicio,
            hr.fecha_fin,
            hr.estado,
            hr.cant_cupos,
            hr.metodo_pago,
            hr.total_pagado,
            -- Traer el nombre dependiendo del tipo de servicio
            CASE 
                WHEN hr.tipo_servicio = 'Transporte' THEN t.nombre
                WHEN hr.tipo_servicio = 'Hotel' THEN h.nombre
                ELSE NULL
            END AS nombre_servicio
        FROM historial_reservas hr
        LEFT JOIN transporte t ON hr.tipo_servicio = 'Transporte' AND hr.id_servicio = t.id
        LEFT JOIN hotel h ON hr.tipo_servicio = 'Hotel' AND hr.id_servicio = h.id_hotel
        WHERE hr.id_usuario = ?
        ORDER BY hr.fecha_reserva DESC
    `;

  conexion.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en servidor" });
    }

    if (result.length > 0) {
      res.json({ success: true, reservas: result });
    } else {
      res.json({ success: false, message: "No se encontraron reservas" });
    }
  });
});

// Función helper para usar query de mysql con promesas
function query(sql, params) {
  return new Promise((resolve, reject) => {
    conexion.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// Obtener hoteles con su ruta
app.get("/hoteles", (req, res) => {
  const query = `
        SELECT h.id_hotel, h.nombre, h.ubicacion, h.precio_por_noche, h.estrellas,
               h.imagen_url AS img, h.descripcion,
               h.id_ruta, r.nombre AS ruta_nombre
        FROM hotel h
        INNER JOIN ruta_turistica r ON h.id_ruta = r.id_ruta
    `;

  conexion.query(query, (err, rows) => {
    if (err) {
      console.error("Error al obtener hoteles:", err);
      return res.status(500).json({ error: "Error al obtener hoteles" });
    }

    const hotelesPorRuta = {};
    const rutas = {};

    rows.forEach((row) => {
      const rutaId = row.id_ruta;

      if (!hotelesPorRuta[rutaId]) hotelesPorRuta[rutaId] = [];
      hotelesPorRuta[rutaId].push({
        id_hotel: row.id_hotel,
        nombre: row.nombre,
        ubicacion: row.ubicacion,
        precio: row.precio_por_noche,
        estrellas: row.estrellas,
        img: row.img,
        descripcion: row.descripcion,
      });

      rutas[rutaId] = row.ruta_nombre;
    });

    res.json({ hoteles: hotelesPorRuta, rutas });
  });
});

function queryAsync(sql, params) {
  return new Promise((resolve, reject) => {
    conexion.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

//Función de validación de fecha en el servidor
function validarFechaReserva(fecha) {
  if (!fecha) return true; // Si no hay fecha, no validamos
  const fechaReserva = new Date(fecha);
  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fecha
  return fechaReserva >= fechaActual;
}

//Función para verificar si el transporte ya está reservado en una fecha
async function verificarTransporteReservado(id_transporte, fecha) {
  // No validar fechas pasadas
  const fechaReserva = new Date(fecha);
  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0);

  if (fechaReserva < fechaActual) {
    return false; // Fechas pasadas no se validan
  }

  // Verificar si YA EXISTE alguna reserva para este transporte y fecha
  const reservasRows = await queryAsync(
    `SELECT COUNT(*) as count 
         FROM historial_reservas 
         WHERE id_servicio = ? AND tipo_servicio = 'Transporte' 
         AND fecha_inicio = ? AND estado IN ('Confirmada', 'Pendiente')`,
    [id_transporte, fecha]
  );

  return reservasRows[0]?.count > 0;
}

//Función para confirmar pago
app.post("/confirmar-pago", async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res
        .status(401)
        .json({
          success: false,
          mensaje: "Debes iniciar sesión antes de realizar una reserva o pago.",
        });
    }

    const { reservas, metodoPago } = req.body;

    if (!reservas || !reservas.length) {
      return res
        .status(400)
        .json({ success: false, mensaje: "No hay reservas para procesar" });
    }

    //Validación de fechas pasadas
    for (const item of reservas) {
      if (item.fecha_inicio && !validarFechaReserva(item.fecha_inicio)) {
        return res.status(400).json({
          success: false,
          mensaje: `No se pueden procesar reservas con fecha pasada: ${item.fecha_inicio}`,
        });
      }
    }

    //Validación para evitar múltiples reservas del mismo transporte+fecha
    for (const item of reservas) {
      if (item.tipo?.toLowerCase() === "transporte" && item.fecha_inicio) {
        const yaReservado = await verificarTransporteReservado(
          item.id,
          item.fecha_inicio
        );

        if (yaReservado) {
          return res.status(400).json({
            success: false,
            mensaje: `El transporte ya está reservado para la fecha ${item.fecha_inicio}`,
          });
        }
      }
    }

    const estado =
      metodoPago && metodoPago.toLowerCase() === "tarjeta"
        ? "Confirmada"
        : "Pendiente";

    // Procesar cada reserva
    for (const item of reservas) {
      let id_servicio;
      let total_pagado = 0;
      let tipo_servicio;
      let cantidad = item.cantidad || 1;
      let fecha_inicio = item.fecha_inicio || null;

      const tipoLower = (item.tipo || "").toLowerCase();

      if (tipoLower === "hotel") {
        const hotelRows = await queryAsync(
          "SELECT id_hotel, precio_por_noche FROM hotel WHERE id_hotel = ?",
          [item.id_hotel]
        );
        if (!hotelRows.length) continue;
        id_servicio = hotelRows[0].id_hotel;
        total_pagado = hotelRows[0].precio_por_noche * cantidad;
        tipo_servicio = "Hotel";
      } else if (tipoLower === "transporte") {
        const transRows = await queryAsync(
          "SELECT id, precio FROM transporte WHERE id = ?",
          [item.id]
        );
        if (!transRows.length) continue;
        id_servicio = transRows[0].id;
        total_pagado = transRows[0].precio * cantidad;
        tipo_servicio = "Transporte";
      } else {
        continue;
      }

      await queryAsync(
        `INSERT INTO historial_reservas
         (id_usuario, tipo_servicio, id_servicio, fecha_reserva, fecha_inicio, estado, cant_cupos, total_pagado, metodo_pago)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          tipo_servicio,
          id_servicio,
          new Date(),
          fecha_inicio,
          estado,
          cantidad,
          total_pagado,
          metodoPago,
        ]
      );
    }

    res.json({
      success: true,
      mensaje: "Pago confirmado y reservas guardadas",
    });
  } catch (err) {
    console.error("Error al guardar reservas:", err);
    res
      .status(500)
      .json({ success: false, mensaje: "Error al guardar reservas" });
  }
});

// Ruta para cancelar una reserva
app.delete("/cancelarreserva/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM historial_reservas WHERE id = ?";

  conexion.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res
        .status(500)
        .json({ success: false, message: "Error en servidor" });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reserva no encontrada" });
    }

    res.json({ success: true, message: "Reserva eliminada correctamente" });
  });
});

// Ruta para obtener todas las rutas turísticas
app.get('/api/rutas-turisticas', (req, res) => {
    const query = 'SELECT * FROM ruta_turistica ORDER BY id_ruta';
    
    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener rutas:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        res.json(results);
    });
});

app.get('/lugares', (req, res) => {
    const query = `
        SELECT lt.id, lt.nombre, lt.tipo, lt.descripcion, lt.ubicacion, 
               lt.imagen_url, lt.id_ruta, rt.nombre AS ruta_nombre
        FROM lugar_turistico lt
        INNER JOIN ruta_turistica rt ON lt.id_ruta = rt.id_ruta
        ORDER BY lt.id_ruta
    `;
    
    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al obtener lugares:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        // Convertir a la estructura que espera el frontend
        const lugares = results.map(row => ({
            id: row.id,
            nombre: row.nombre,
            tipo: row.tipo,
            descripcion: row.descripcion,
            ubicacion: row.ubicacion,
            imagen_url: row.imagen_url,
            ruta_id: row.id_ruta
        }));

        // Obtener rutas únicas
        const rutasUnicas = [...new Set(results.map(row => row.id_ruta))].map(rutaId => {
            const ruta = results.find(row => row.id_ruta === rutaId);
            return {
                id: rutaId,
                nombre: ruta.ruta_nombre
            };
        });

        res.json({ 
            lugares: lugares, // Array plano de lugares
            rutas: rutasUnicas // Array de objetos ruta
        });
    });
});

// Ruta para obtener los lugares de una ruta específica (opcional)
// app.get('/api/rutas/:id/lugares', (req, res) => {
//     const rutaId = req.params.id;
//     const query = 'SELECT * FROM lugares WHERE id_ruta = ?';
    
//     connection.query(query, [rutaId], (error, results) => {
//         if (error) {
//             console.error('Error al obtener lugares:', error);
//             return res.status(500).json({ error: 'Error interno del servidor' });
//         }
        
//         res.json(results);
//     });
// });

app.use(express.static(path.join(__dirname, "Nica-Turismo")));
app.use(express.static(path.join(__dirname, "public"))); // sirve transporte.html

app.use(
  "/uploads/transporte",
  express.static(path.join(__dirname, "/uploads/transporte"))
);

app.use(
  "/uploads/lugares",
  express.static(path.join(__dirname, "/uploads/lug-tur"))
);

// Verificar la conexión a la base de datos
conexion.connect(function (err) {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    process.exit(1); // Salir del proceso si hay un error de conexión
  } else {
    console.log("Conexión exitosa a la base de datos");
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
