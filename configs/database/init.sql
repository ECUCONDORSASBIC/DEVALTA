-- =====================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- Sistema Altamedica - PostgreSQL
-- =====================================================

-- Crear base de datos si no existe
SELECT 'CREATE DATABASE altamedica_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'altamedica_db')\gexec

-- Conectar a la base de datos
\c altamedica_db;

-- Ejecutar el esquema principal
\i configs/database/schema.sql;

-- Crear usuario de aplicación
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'altamedica_app') THEN
        CREATE USER altamedica_app WITH PASSWORD 'altamedica_secure_password_2024';
    END IF;
END
$$;

-- Otorgar permisos
GRANT CONNECT ON DATABASE altamedica_db TO altamedica_app;
GRANT USAGE ON SCHEMA public TO altamedica_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO altamedica_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO altamedica_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO altamedica_app;

-- Configurar permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO altamedica_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO altamedica_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO altamedica_app;

-- Verificar la instalación
SELECT 'Base de datos Altamedica inicializada correctamente' as status; 