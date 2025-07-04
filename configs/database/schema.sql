-- =====================================================
-- ESQUEMA DE BASE DE DATOS MÉDICA - ALTAMEDICA
-- PostgreSQL con compliance HIPAA
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA DE USUARIOS (PACIENTES, MÉDICOS, EMPRESAS)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'company')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'inactive')),
    
    -- Información personal
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Información médica (para pacientes)
    blood_type VARCHAR(5),
    allergies TEXT[],
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    
    -- Información profesional (para médicos)
    medical_license VARCHAR(100),
    specialty VARCHAR(100),
    years_experience INTEGER,
    education TEXT[],
    certifications TEXT[],
    
    -- Información empresarial (para empresas)
    company_name VARCHAR(200),
    company_type VARCHAR(100),
    tax_id VARCHAR(50),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- Auditoría HIPAA
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- TABLA DE PERFILES MÉDICOS (HISTORIAS CLÍNICAS)
-- =====================================================
CREATE TABLE medical_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Información médica básica
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    blood_pressure VARCHAR(20),
    heart_rate INTEGER,
    
    -- Historial médico
    medical_history TEXT,
    family_history TEXT,
    current_medications TEXT[],
    allergies TEXT[],
    
    -- Información de contacto de emergencia
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Auditoría
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- TABLA DE CITAS MÉDICAS
-- =====================================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información de la cita
    patient_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    appointment_type VARCHAR(50) NOT NULL CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'telemedicine')),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    
    -- Fechas y horarios
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Información de la consulta
    reason TEXT,
    symptoms TEXT,
    notes TEXT,
    
    -- Información de telemedicina
    telemedicine_session_id UUID,
    meeting_url VARCHAR(500),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Auditoría
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- TABLA DE SESIONES DE TELEMEDICINA
-- =====================================================
CREATE TABLE telemedicine_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    
    -- Información de la sesión
    session_type VARCHAR(50) NOT NULL DEFAULT 'video' CHECK (session_type IN ('video', 'audio', 'chat')),
    status VARCHAR(50) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
    
    -- URLs y tokens
    room_id VARCHAR(100) UNIQUE NOT NULL,
    patient_token VARCHAR(500),
    doctor_token VARCHAR(500),
    
    -- Fechas
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    
    -- Configuración
    recording_enabled BOOLEAN DEFAULT false,
    chat_enabled BOOLEAN DEFAULT true,
    screen_sharing_enabled BOOLEAN DEFAULT true,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE NOTAS MÉDICAS
-- =====================================================
CREATE TABLE medical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID NOT NULL REFERENCES users(id),
    
    -- Contenido de la nota
    subjective TEXT, -- Lo que dice el paciente
    objective TEXT,  -- Lo que observa el médico
    assessment TEXT, -- Diagnóstico
    plan TEXT,      -- Plan de tratamiento
    
    -- Información adicional
    vital_signs JSONB,
    physical_examination TEXT,
    diagnosis_codes TEXT[],
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Auditoría
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- TABLA DE PRESCRIPCIONES
-- =====================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID NOT NULL REFERENCES users(id),
    
    -- Información de la prescripción
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100),
    instructions TEXT,
    
    -- Estado de la prescripción
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    prescribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Auditoría
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Información de la notificación
    type VARCHAR(50) NOT NULL CHECK (type IN ('appointment_reminder', 'appointment_confirmation', 'telemedicine_ready', 'medical_alert', 'system_message')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Estado de la notificación
    status VARCHAR(50) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Datos adicionales
    data JSONB,
    action_url VARCHAR(500),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLA DE LOGS DE AUDITORÍA (COMPLIANCE HIPAA)
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información del evento
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    
    -- Usuario que realizó la acción
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(255),
    
    -- Detalles del cambio
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    -- Información de la sesión
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE DISPONIBILIDAD MÉDICA
-- =====================================================
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id),
    
    -- Horario de trabajo
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Domingo, 6 = Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Configuración
    appointment_duration INTEGER DEFAULT 30, -- minutos
    break_duration INTEGER DEFAULT 15, -- minutos entre citas
    
    -- Estado
    is_active BOOLEAN DEFAULT true,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE ARCHIVOS MÉDICOS
-- =====================================================
CREATE TABLE medical_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información del archivo
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Asociación
    patient_id UUID NOT NULL REFERENCES users(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id),
    
    -- Tipo de archivo
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('medical_record', 'prescription', 'lab_result', 'imaging', 'consent_form', 'other')),
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Índices para citas
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Índices para telemedicina
CREATE INDEX idx_telemedicine_appointment_id ON telemedicine_sessions(appointment_id);
CREATE INDEX idx_telemedicine_room_id ON telemedicine_sessions(room_id);
CREATE INDEX idx_telemedicine_status ON telemedicine_sessions(status);

-- Índices para notificaciones
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Índices para auditoría
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_notes_updated_at BEFORE UPDATE ON medical_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear log de auditoría automáticamente
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, table_name, record_id, user_id, new_values)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id, NEW.created_by, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, user_id, old_values, new_values, changes)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, NEW.updated_by, to_jsonb(OLD), to_jsonb(NEW), to_jsonb(NEW) - to_jsonb(OLD));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, table_name, record_id, user_id, old_values)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id, OLD.updated_by, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers de auditoría para tablas críticas
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_appointments_trigger AFTER INSERT OR UPDATE OR DELETE ON appointments FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_medical_notes_trigger AFTER INSERT OR UPDATE OR DELETE ON medical_notes FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_prescriptions_trigger AFTER INSERT OR UPDATE OR DELETE ON prescriptions FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de citas con información completa
CREATE VIEW appointments_view AS
SELECT 
    a.id,
    a.scheduled_at,
    a.status,
    a.appointment_type,
    a.duration_minutes,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    p.email as patient_email,
    d.first_name as doctor_first_name,
    d.last_name as doctor_last_name,
    d.specialty,
    ts.room_id,
    ts.status as telemedicine_status
FROM appointments a
JOIN users p ON a.patient_id = p.id
JOIN users d ON a.doctor_id = d.id
LEFT JOIN telemedicine_sessions ts ON a.id = ts.appointment_id;

-- Vista de estadísticas médicas
CREATE VIEW medical_stats_view AS
SELECT 
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
    COUNT(CASE WHEN appointment_type = 'telemedicine' THEN 1 END) as telemedicine_appointments,
    AVG(EXTRACT(EPOCH FROM (actual_end_time - actual_start_time))/60) as avg_appointment_duration
FROM appointments
WHERE actual_start_time IS NOT NULL AND actual_end_time IS NOT NULL;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar usuario administrador por defecto
INSERT INTO users (
    email, 
    password_hash, 
    role, 
    first_name, 
    last_name,
    status
) VALUES (
    'admin@altamedica.com',
    crypt('admin123', gen_salt('bf')),
    'admin',
    'Administrador',
    'Sistema',
    'active'
);

-- Insertar especialidades médicas comunes
CREATE TABLE medical_specialties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

INSERT INTO medical_specialties (name, description) VALUES
('Medicina General', 'Atención primaria y medicina familiar'),
('Cardiología', 'Especialidad del corazón y sistema cardiovascular'),
('Dermatología', 'Especialidad de la piel y enfermedades cutáneas'),
('Ginecología', 'Salud reproductiva femenina'),
('Pediatría', 'Medicina infantil y del desarrollo'),
('Psicología', 'Salud mental y comportamiento'),
('Ortopedia', 'Sistema musculoesquelético'),
('Oftalmología', 'Salud visual y oftalmológica'),
('Neurología', 'Sistema nervioso y cerebro'),
('Endocrinología', 'Hormonas y metabolismo');

-- =====================================================
-- PERMISOS Y ROLES
-- =====================================================

-- Crear roles de base de datos para diferentes tipos de usuarios
-- (Esto se implementará en el sistema de autenticación)

COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema médico Altamedica';
COMMENT ON TABLE appointments IS 'Citas médicas programadas y realizadas';
COMMENT ON TABLE telemedicine_sessions IS 'Sesiones de telemedicina con WebRTC';
COMMENT ON TABLE medical_notes IS 'Notas médicas y documentación clínica';
COMMENT ON TABLE audit_logs IS 'Logs de auditoría para compliance HIPAA'; 