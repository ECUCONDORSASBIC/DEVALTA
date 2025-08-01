// Base de datos en memoria para testing - ALTAMEDICA
// Este módulo mantiene el estado compartido entre todos los endpoints

interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'patient' | 'doctor' | 'company';
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  medical_license?: string;
  specialty?: string;
  years_experience?: number;
  company_name?: string;
  company_type?: string;
  tax_id?: string;
  status: string;
  created_at: string;
  last_login?: string;
}

// Array global de usuarios en memoria
const users: User[] = [];

// Funciones para manejar la base de datos en memoria
export const MemoryDB = {
  // Obtener todos los usuarios
  getAllUsers: (): User[] => {
    return users;
  },

  // Buscar usuario por email
  findUserByEmail: (email: string): User | undefined => {
    return users.find(u => u.email === email);
  },

  // Buscar usuario por ID
  findUserById: (id: number): User | undefined => {
    return users.find(u => u.id === id);
  },

  // Crear nuevo usuario
  createUser: (userData: Omit<User, 'id' | 'created_at' | 'status'>): User => {
    const newUser: User = {
      id: users.length + 1,
      ...userData,
      status: 'active',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    console.log('👤 Usuario creado en MemoryDB:', { 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role 
    });
    console.log('📊 Total usuarios en MemoryDB:', users.length);
    
    return newUser;
  },

  // Actualizar último login
  updateLastLogin: (userId: number): void => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.last_login = new Date().toISOString();
      console.log('🔄 Último login actualizado para usuario:', userId);
    }
  },

  // Obtener estadísticas
  getStats: () => {
    const stats = {
      total: users.length,
      by_role: {
        patient: users.filter(u => u.role === 'patient').length,
        doctor: users.filter(u => u.role === 'doctor').length,
        company: users.filter(u => u.role === 'company').length
      },
      active: users.filter(u => u.status === 'active').length
    };
    
    console.log('📈 Estadísticas MemoryDB:', stats);
    return stats;
  },

  // Limpiar base de datos (para testing)
  clear: (): void => {
    users.length = 0;
    console.log('🧹 MemoryDB limpiada');
  },

  // Simular query SQL (para compatibilidad)
  query: async (sql: string, params: any[] = []): Promise<{ rows: any[] }> => {
    console.log('🔍 MemoryDB Query:', sql);
    console.log('📝 MemoryDB Params:', params);
    
    try {
      // SELECT para verificar si usuario existe o para login
      if (sql.includes('SELECT') && sql.includes('WHERE email')) {
        const email = params[0];
        const user = MemoryDB.findUserByEmail(email);
        
        if (!user) {
          return { rows: [] };
        }
        
        // Para login, devolver todos los campos necesarios
        if (sql.includes('password_hash')) {
          return { 
            rows: [{
              id: user.id,
              email: user.email,
              password_hash: user.password_hash,
              role: user.role,
              first_name: user.first_name,
              last_name: user.last_name,
              status: user.status,
              phone: user.phone,
              date_of_birth: user.date_of_birth,
              gender: user.gender,
              medical_license: user.medical_license,
              specialty: user.specialty,
              years_experience: user.years_experience,
              company_name: user.company_name,
              company_type: user.company_type,
              tax_id: user.tax_id,
              created_at: user.created_at,
              last_login: user.last_login
            }]
          };
        }
        
        // Para verificaciones simples
        return { rows: [{ id: user.id }] };
      }
      
      // INSERT para crear usuario
      if (sql.includes('INSERT INTO users')) {
        const [email, password_hash, role, first_name, last_name, phone, date_of_birth, gender, medical_license, specialty, years_experience, company_name, company_type, tax_id] = params;
        
        const newUser = MemoryDB.createUser({
          email,
          password_hash,
          role,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          medical_license,
          specialty,
          years_experience,
          company_name,
          company_type,
          tax_id
        });
        
        return { rows: [newUser] };
      }
      
      // UPDATE para último login
      if (sql.includes('UPDATE users') && sql.includes('last_login')) {
        const userId = params[0];
        MemoryDB.updateLastLogin(userId);
        return { rows: [] };
      }
      
      // INSERT para logs de auditoría (ignorar para simplicidad)
      if (sql.includes('INSERT INTO audit_logs')) {
        console.log('📝 Audit log simulado:', params[0]);
        return { rows: [] };
      }
      
      // INSERT para perfil médico
      if (sql.includes('INSERT INTO medical_profiles')) {
        console.log('🏥 Perfil médico creado para paciente:', params[0]);
        return { rows: [] };
      }
      
      return { rows: [] };
    } catch (error) {
      console.error('❌ Error en MemoryDB query:', error);
      throw error;
    }
  },

  // Simular transacción
  transaction: async (callback: (client: any) => Promise<any>): Promise<any> => {
    console.log('🔄 Iniciando transacción MemoryDB');
    try {
      const mockClient = {
        query: MemoryDB.query
      };
      const result = await callback(mockClient);
      console.log('✅ Transacción MemoryDB completada exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error en transacción MemoryDB:', error);
      throw error;
    }
  }
};

export default MemoryDB;