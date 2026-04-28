/**
 * Cloudflare Worker — Formulario Ultra Seco → Neon DB
 * Recibe POST con datos de postulantes y los inserta en solicitudes_empleo
 *
 * Variable de entorno requerida (en Cloudflare Dashboard → Worker → Settings → Variables):
 *   DATABASE_URL = postgresql://neondb_owner:...@...neon.tech/neondb?sslmode=require
 */

const ALLOWED_ORIGINS = [
  'https://ultraseco.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método no permitido' }), {
        status: 405,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Cuerpo inválido' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Insertar en Neon via HTTP API (neon serverless driver compatible)
    const sql = `
      INSERT INTO solicitudes_empleo (
        nombres_completos, apellidos_completos, cedula_identidad, fecha_nacimiento,
        nacionalidad, domicilio, telefono_movil, correo_electronico,
        vehiculo_propio, vehiculo_modelo_year, experiencia_ferretera,
        clientes_principales, volumen_facturacion,
        referencia_1_nombre, referencia_1_telefono, referencia_1_relacion,
        referencia_2_nombre, referencia_2_telefono, referencia_2_relacion
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      ) RETURNING id;
    `;

    const values = [
      data.nombres_completos || null,
      data.apellidos_completos || null,
      data.cedula_identidad || null,
      data.fecha_nacimiento || null,
      data.nacionalidad || null,
      data.domicilio || null,
      data.telefono_movil || null,
      data.correo_electronico || null,
      data.vehiculo_propio === true || data.vehiculo_propio === 'true' || data.vehiculo_propio === 'Sí',
      data.vehiculo_modelo_year || null,
      data.experiencia_ferretera || null,
      data.clientes_principales || null,
      data.volumen_facturacion || null,
      data.referencia_1_nombre || null,
      data.referencia_1_telefono || null,
      data.referencia_1_relacion || null,
      data.referencia_2_nombre || null,
      data.referencia_2_telefono || null,
      data.referencia_2_relacion || null,
    ];

    try {
      // Neon HTTP API
      const dbUrl = new URL(env.DATABASE_URL);
      const neonHttpUrl = `https://${dbUrl.hostname}/sql`;

      const dbRes = await fetch(neonHttpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${dbUrl.password}`,
          'Neon-Connection-String': env.DATABASE_URL,
        },
        body: JSON.stringify({ query: sql, params: values }),
      });

      if (!dbRes.ok) {
        const errText = await dbRes.text();
        console.error('Neon error:', errText);
        return new Response(JSON.stringify({ success: false, error: 'Error en base de datos' }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const dbData = await dbRes.json();
      const newId = dbData?.rows?.[0]?.id;

      return new Response(JSON.stringify({ success: true, id: newId }), {
        status: 201,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Error worker:', err);
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },
};
