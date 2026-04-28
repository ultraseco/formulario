require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base de datos Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta para guardar la solicitud
app.post('/api/solicitud', async (req, res) => {
  const data = req.body;
  
  const query = `
    INSERT INTO solicitudes_empleo (
      nombres_completos, apellidos_completos, cedula_identidad, fecha_nacimiento, 
      nacionalidad, domicilio, telefono_movil, correo_electronico, 
      vehiculo_propio, vehiculo_modelo_year, experiencia_ferretera, 
      clientes_principales, volumen_facturacion, 
      referencia_1_nombre, referencia_1_telefono, referencia_1_relacion,
      referencia_2_nombre, referencia_2_telefono, referencia_2_relacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING id;
  `;

  const values = [
    data.nombres_completos,
    data.apellidos_completos,
    data.cedula_identidad,
    data.fecha_nacimiento,
    data.nacionalidad,
    data.domicilio,
    data.telefono_movil,
    data.correo_electronico,
    data.vehiculo_propio === 'on' || data.vehiculo_propio === true,
    data.vehiculo_modelo_year,
    data.experiencia_ferretera,
    data.clientes_principales,
    data.volumen_facturacion,
    data.referencia_1_nombre,
    data.referencia_1_telefono,
    data.referencia_1_relacion,
    data.referencia_2_nombre,
    data.referencia_2_telefono,
    data.referencia_2_relacion
  ];

  try {
    const result = await pool.query(query, values);
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    console.error('Error al insertar datos:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
