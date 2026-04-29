/**
 * Cloudflare Worker — Formulario Ultra Seco → Neon DB
 * VERSIÓN DEFINITIVA Y VALIDADA
 */
const ALLOWED_ORIGINS = ['https://ultraseco.github.io', 'http://localhost:3000', 'http://127.0.0.1:5500'];

const HOST = "ep-snowy-unit-amlmh4fj.c-5.us-east-1.aws.neon.tech";
const PASS = "npg_G14qwkDRAoQn"; // API Auth de Neon
const CONN_STR = `postgresql://neondb_owner@${HOST}/neondb?sslmode=require`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    
    if (request.method === 'GET') {
      try {
        const sql = `SELECT * FROM solicitudes_empleo ORDER BY created_at DESC;`;
        const res = await fetch(`https://${HOST}/sql`, {
          method: 'POST',
          headers: {
            'Neon-Connection-String': CONN_STR,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: sql, params: [] })
        });
        const result = await res.json();
        if (!res.ok) {
          return new Response(JSON.stringify({ success: false, error: result.message || result.error }), { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ success: true, data: result.rows || [] }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
    }

    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

    try {
      const data = await request.json();
      
      const sql = `
        INSERT INTO solicitudes_empleo (
          nombres_completos, apellidos_completos, cedula_identidad, fecha_nacimiento,
          nacionalidad, domicilio, telefono_movil, correo_electronico,
          vehiculo_propio, vehiculo_modelo_year, experiencia_ferretera,
          clientes_principales, volumen_facturacion,
          referencia_1_nombre, referencia_1_telefono, referencia_1_relacion,
          referencia_2_nombre, referencia_2_telefono, referencia_2_relacion
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) 
        RETURNING id;
      `;

      const values = [
        data.nombres_completos || "",
        data.apellidos_completos || "",
        data.cedula_identidad || "",
        data.fecha_nacimiento || null,
        data.nacionalidad || "",
        data.domicilio || "",
        data.telefono_movil || "",
        data.correo_electronico || "",
        data.vehiculo_propio === true,
        data.vehiculo_modelo_year || "",
        data.experiencia_ferretera || "",
        data.clientes_principales || "",
        data.volumen_facturacion || "",
        data.referencia_1_nombre || "",
        data.referencia_1_telefono || "",
        data.referencia_1_relacion || "",
        data.referencia_2_nombre || "",
        data.referencia_2_telefono || "",
        data.referencia_2_relacion || ""
      ];

      const res = await fetch(`https://${HOST}/sql`, {
        method: 'POST',
        headers: {
          'Neon-Connection-String': CONN_STR,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql, params: values })
      });

      const result = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: result.message || result.error || "Error en la API de Neon",
          detail: result 
        }), {
          status: res.status,
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, id: result.rows?.[0]?.id }), {
        status: 201,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
  },
};
