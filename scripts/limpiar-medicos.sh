#!/bin/bash

# 👨‍⚕️ SCRIPT DE LIMPIEZA - APLICACIÓN MÉDICOS ALTAMEDICA
# Fase 2: Limpiar código duplicado y preparar para desarrollo

echo "🧹 INICIANDO LIMPIEZA DE APLICACIÓN MÉDICOS"
echo "==========================================="

# Configuración
APP_DIR="apps/companies-dashboard"
cd $APP_DIR

echo "📁 Directorio actual: $(pwd)"

# 1. Backup de archivos importantes
echo "💾 Creando backup de archivos importantes..."
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup de archivos principales
cp -r src/app $BACKUP_DIR/
cp -r src/components $BACKUP_DIR/
cp -r src/hooks $BACKUP_DIR/
cp package.json $BACKUP_DIR/
cp tsconfig.json $BACKUP_DIR/

echo "✅ Backup creado en: $BACKUP_DIR"

# 2. Identificar archivos duplicados
echo "🔍 Identificando archivos duplicados..."
echo "📋 Archivos en src/components/maps/:"
ls -la src/components/maps/

# 3. Limpiar duplicados de mapas
echo "🗑️  Eliminando archivos duplicados..."
DUPLICATE_FILES=(
    "src/components/maps/DoctorsInteractiveMapBackup.tsx"
    "src/components/maps/DoctorsInteractiveMapFixed.tsx"
    "src/components/maps/DoctorsInteractiveMapSafe.tsx"
    "src/components/maps/DoctorsInteractiveMapSafeFixed.tsx"
)

for file in "${DUPLICATE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "🗑️  Eliminando: $file"
        rm "$file"
    else
        echo "ℹ️  No encontrado: $file"
    fi
done

# 4. Verificar archivos restantes
echo "📋 Archivos restantes en src/components/maps/:"
ls -la src/components/maps/

# 5. Instalar dependencias de autenticación
echo "📦 Instalando dependencias de autenticación..."
if ! pnpm add @altamedica/firebase firebase; then
    echo "❌ Error al instalar dependencias de Firebase"
    exit 1
fi
echo "✅ Dependencias de Firebase instaladas"

# 6. Crear estructura de carpetas
echo "📁 Creando estructura de carpetas..."
mkdir -p src/hooks
mkdir -p src/contexts
mkdir -p src/components/auth
mkdir -p src/app/(auth)
mkdir -p src/app/calendar
mkdir -p src/app/patients
mkdir -p src/app/prescriptions
mkdir -p src/app/telemedicine
mkdir -p src/components/calendar
mkdir -p src/components/medical
mkdir -p src/components/prescriptions
mkdir -p src/components/telemedicine
mkdir -p src/types

echo "✅ Estructura de carpetas creada"

# 7. Crear archivos base
echo "📝 Creando archivos base..."

# Hook de autenticación
cat > src/hooks/useDoctorAuth.tsx << 'EOF'
import { useState, useEffect, useCallback } from 'react';

export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  specialties: string[];
  hospitals: string[];
  rating: number;
  consultationFee: number;
}

export function useDoctorAuth() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implementar autenticación Firebase
      console.log('Login:', email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // TODO: Implementar logout Firebase
      setDoctor(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }, []);

  useEffect(() => {
    // TODO: Verificar sesión existente
    setLoading(false);
  }, []);

  return {
    doctor,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!doctor
  };
}
EOF

# Tipos base
cat > src/types/doctor.types.ts << 'EOF'
export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  specialties: Specialty[];
  hospitals: string[];
  schedule: DoctorSchedule;
  patients: string[];
  rating: number;
  consultationFee: number;
}

export interface Specialty {
  id: string;
  name: string;
  code: string;
}

export interface DoctorSchedule {
  workingDays: string[];
  startTime: string;
  endTime: string;
  breakTime: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: Date;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medications: Medication[];
  instructions: string;
  date: Date;
  expiryDate: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}
EOF

echo "✅ Archivos base creados"

# 8. Verificar TypeScript
echo "🔍 Verificando TypeScript..."
if ! pnpm run type-check; then
    echo "⚠️  Errores de TypeScript encontrados"
else
    echo "✅ TypeScript verificado correctamente"
fi

# 9. Instalar dependencias
echo "📦 Instalando dependencias..."
if ! pnpm install; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"

# 10. Build de prueba
echo "🔨 Probando build..."
if ! pnpm run build; then
    echo "❌ Error en el build"
    exit 1
fi
echo "✅ Build exitoso"

# 11. Resumen final
echo ""
echo "🎉 LIMPIEZA COMPLETADA"
echo "======================"
echo "✅ Backup creado en: $BACKUP_DIR"
echo "✅ Archivos duplicados eliminados"
echo "✅ Dependencias instaladas"
echo "✅ Estructura de carpetas creada"
echo "✅ Archivos base creados"
echo "✅ Build verificado"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Implementar autenticación Firebase"
echo "2. Crear dashboard mejorado"
echo "3. Implementar sistema de agenda"
echo "4. Desarrollar funcionalidades médicas"
echo ""
echo "📍 Para iniciar desarrollo:"
echo "cd $APP_DIR && pnpm run dev" 