-- Inicialización de TimescaleDB para KPIs de AltaMedica
-- Este script configura las tablas y hypertables necesarias para el sistema de métricas

-- 1. Habilitar la extensión TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 2. Crear la tabla para los KPIs
CREATE TABLE IF NOT EXISTS kpis (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    tags JSONB DEFAULT '{}',
    source TEXT DEFAULT 'unknown',
    environment TEXT DEFAULT 'production'
);

-- 3. Convertir la tabla en una Hypertable de TimescaleDB
-- Esto particiona los datos por la columna 'time' para un rendimiento óptimo
SELECT create_hypertable('kpis', 'time', if_not_exists => TRUE);

-- 4. Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_kpis_name_time ON kpis (name, time DESC);
CREATE INDEX IF NOT EXISTS idx_kpis_source_time ON kpis (source, time DESC);
CREATE INDEX IF NOT EXISTS idx_kpis_environment_time ON kpis (environment, time DESC);
CREATE INDEX IF NOT EXISTS idx_kpis_tags ON kpis USING GIN (tags);

-- 5. Configurar políticas de retención (mantener datos por 1 año)
SELECT add_retention_policy('kpis', INTERVAL '1 year', if_not_exists => TRUE);

-- 6. Crear función helper para insertar métricas
CREATE OR REPLACE FUNCTION insert_kpi(
    metric_name TEXT,
    metric_value DOUBLE PRECISION,
    metric_tags JSONB DEFAULT '{}',
    metric_source TEXT DEFAULT 'api',
    metric_environment TEXT DEFAULT 'production'
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO kpis (time, name, value, tags, source, environment)
    VALUES (NOW(), metric_name, metric_value, metric_tags, metric_source, metric_environment);
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear vistas útiles para consultas comunes
CREATE OR REPLACE VIEW latest_kpis AS
SELECT DISTINCT ON (name) 
    name,
    value,
    time,
    tags,
    source,
    environment
FROM kpis
ORDER BY name, time DESC;

-- Vista para métricas de las últimas 24 horas
CREATE OR REPLACE VIEW kpis_24h AS
SELECT *
FROM kpis
WHERE time >= NOW() - INTERVAL '24 hours'
ORDER BY time DESC;

-- 8. Insertar algunos KPIs de ejemplo para validar la configuración
INSERT INTO kpis (name, value, tags, source, environment) VALUES
    ('build_time_seconds', 120.5, '{"branch": "main", "job": "ci"}', 'github_actions', 'production'),
    ('test_pass_percentage', 95.5, '{"test_suite": "unit", "branch": "main"}', 'jest', 'production'),
    ('security_findings_count', 2, '{"severity": "medium", "tool": "snyk"}', 'security_scanner', 'production'),
    ('api_response_time_ms', 245.8, '{"endpoint": "/api/v1/patients", "method": "GET"}', 'monitoring', 'production'),
    ('database_connection_count', 12, '{"pool": "main"}', 'postgres', 'production'),
    ('memory_usage_mb', 512.3, '{"service": "api-server"}', 'system', 'production'),
    ('active_users_count', 25, '{"timeframe": "1h"}', 'analytics', 'production'),
    ('error_rate_percentage', 0.1, '{"service": "api", "timeframe": "1h"}', 'logging', 'production');

-- 9. Crear tabla para metadatos de métricas
CREATE TABLE IF NOT EXISTS metric_metadata (
    name TEXT PRIMARY KEY,
    description TEXT,
    unit TEXT,
    type TEXT CHECK (type IN ('counter', 'gauge', 'histogram')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar metadatos para los KPIs principales
INSERT INTO metric_metadata (name, description, unit, type) VALUES
    ('build_time_seconds', 'Tiempo total de construcción del proyecto', 'seconds', 'gauge'),
    ('test_pass_percentage', 'Porcentaje de pruebas que pasaron exitosamente', 'percentage', 'gauge'),
    ('security_findings_count', 'Número de hallazgos de seguridad encontrados', 'count', 'counter'),
    ('api_response_time_ms', 'Tiempo de respuesta promedio de la API', 'milliseconds', 'gauge'),
    ('database_connection_count', 'Número de conexiones activas a la base de datos', 'count', 'gauge'),
    ('memory_usage_mb', 'Uso de memoria en megabytes', 'megabytes', 'gauge'),
    ('active_users_count', 'Número de usuarios activos', 'count', 'gauge'),
    ('error_rate_percentage', 'Porcentaje de errores en las solicitudes', 'percentage', 'gauge'),
    ('deployment_frequency', 'Frecuencia de despliegues por día', 'per_day', 'counter'),
    ('mean_time_to_recovery_minutes', 'Tiempo promedio de recuperación ante fallos', 'minutes', 'gauge')
ON CONFLICT (name) DO NOTHING;

-- 10. Función para obtener métricas agregadas
CREATE OR REPLACE FUNCTION get_metric_summary(
    metric_name TEXT,
    time_range INTERVAL DEFAULT '24 hours'
) RETURNS TABLE (
    avg_value DOUBLE PRECISION,
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    count_values BIGINT,
    latest_value DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(k.value) as avg_value,
        MIN(k.value) as min_value,
        MAX(k.value) as max_value,
        COUNT(k.value) as count_values,
        (SELECT value FROM kpis WHERE name = metric_name ORDER BY time DESC LIMIT 1) as latest_value
    FROM kpis k
    WHERE k.name = metric_name 
      AND k.time >= NOW() - time_range;
END;
$$ LANGUAGE plpgsql;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'TimescaleDB inicializado correctamente para AltaMedica KPIs';
    RAISE NOTICE 'Tabla kpis creada como hypertable';
    RAISE NOTICE 'Índices y políticas de retención configuradas';
    RAISE NOTICE 'Funciones helper y vistas creadas';
    RAISE NOTICE 'Datos de ejemplo insertados';
END $$;
