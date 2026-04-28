
CREATE TABLE IF NOT EXISTS solicitudes_empleo (
    id SERIAL PRIMARY KEY,
    -- I. Información Personal y de Contacto
    nombres_completos TEXT NOT NULL,
    apellidos_completos TEXT NOT NULL,
    cedula_identidad TEXT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    nacionalidad TEXT NOT NULL,
    domicilio TEXT NOT NULL,
    telefono_movil TEXT NOT NULL,
    correo_electronico TEXT NOT NULL,
    vehiculo_propio BOOLEAN NOT NULL,
    vehiculo_modelo_year TEXT,
    
    -- II. Perfil Comercial y Experiencia
    experiencia_ferretera TEXT,
    clientes_principales TEXT,
    volumen_facturacion TEXT,
    
    -- III. Referencias Personales
    referencia_1_nombre TEXT,
    referencia_1_telefono TEXT,
    referencia_1_relacion TEXT,
    referencia_2_nombre TEXT,
    referencia_2_telefono TEXT,
    referencia_2_relacion TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
