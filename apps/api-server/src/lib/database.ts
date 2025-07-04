import { Pool, PoolClient } from 'pg';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'altamedica_db',
  user: process.env.DB_USER || 'altamedica_app',
  password: process.env.DB_PASSWORD || 'altamedica_secure_password_2024',
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Eventos del pool para debugging
pool.on('connect', (client) => {
  console.log('🟢 Nueva conexión a PostgreSQL establecida');
});

pool.on('error', (err, client) => {
  console.error('🔴 Error inesperado en el pool de PostgreSQL:', err);
});

pool.on('remove', (client) => {
  console.log('🟡 Cliente removido del pool de PostgreSQL');
});

// Función para obtener una conexión del pool
export async function getClient(): Promise<PoolClient> {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error obteniendo cliente de la base de datos:', error);
    throw new Error('No se pudo conectar a la base de datos');
  }
}

// Función para ejecutar queries simples
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Función para ejecutar transacciones
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    return false;
  }
}

// Función para cerrar el pool (útil para testing)
export async function closePool(): Promise<void> {
  await pool.end();
}

// Exportar el pool para uso directo si es necesario
export { pool };

// Tipos de datos para TypeScript
export interface DatabaseUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'company';
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: Date;
  duration_minutes: number;
  reason?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DatabaseTelemedicineSession {
  id: string;
  appointment_id: string;
  session_type: 'video' | 'audio' | 'chat';
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  room_id: string;
  scheduled_start: Date;
  actual_start?: Date;
  actual_end?: Date;
  created_at: Date;
  updated_at: Date;
} 