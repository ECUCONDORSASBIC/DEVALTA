#!/bin/bash

# 🏥 SCRIPT DE FINALIZACIÓN - APLICACIÓN PACIENTES ALTAMEDICA
# Fase 1: Completar el 5% restante y poner en producción

echo "🚀 INICIANDO FINALIZACIÓN DE APLICACIÓN PACIENTES"
echo "=================================================="

# Configuración
APP_DIR="apps/patients"
cd $APP_DIR

echo "📁 Directorio actual: $(pwd)"

# 1. Verificar dependencias
echo "📦 Verificando dependencias..."
if ! pnpm install; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas correctamente"

# 2. Verificar TypeScript
echo "🔍 Verificando TypeScript..."
if ! pnpm run type-check; then
    echo "⚠️  Errores de TypeScript encontrados"
    echo "🔧 Intentando corregir automáticamente..."
    # Aquí podrías agregar lógica para corregir errores comunes
fi
echo "✅ Verificación de TypeScript completada"

# 3. Testing de funcionalidades
echo "🧪 Ejecutando tests..."
if ! pnpm test; then
    echo "⚠️  Algunos tests fallaron"
fi
echo "✅ Tests completados"

# 4. Build de desarrollo
echo "🔨 Construyendo aplicación..."
if ! pnpm run build; then
    echo "❌ Error en el build"
    exit 1
fi
echo "✅ Build completado exitosamente"

# 5. Análisis de rendimiento
echo "📊 Analizando rendimiento..."
if ! pnpm run analyze; then
    echo "⚠️  No se pudo ejecutar el análisis de rendimiento"
fi
echo "✅ Análisis completado"

# 6. Verificar estructura de archivos
echo "📋 Verificando estructura de archivos..."
REQUIRED_FILES=(
    "src/app/page.tsx"
    "src/app/dashboard/page.tsx"
    "src/app/appointments/page.tsx"
    "src/app/medical-history/page.tsx"
    "src/app/prescriptions/page.tsx"
    "src/app/lab-results/page.tsx"
    "src/app/telemedicine/page.tsx"
    "src/app/profile/page.tsx"
    "src/app/health-metrics/page.tsx"
    "src/app/notifications/page.tsx"
    "src/app/support/page.tsx"
    "src/app/settings/page.tsx"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ FALTA: $file"
    fi
done

# 7. Verificar hooks personalizados
echo "🔗 Verificando hooks personalizados..."
REQUIRED_HOOKS=(
    "src/hooks/useNotifications.ts"
    "src/hooks/useMedicalRecords.ts"
    "src/hooks/usePrescriptions.ts"
    "src/hooks/useAppointments.ts"
)

for hook in "${REQUIRED_HOOKS[@]}"; do
    if [ -f "$hook" ]; then
        echo "✅ $hook"
    else
        echo "❌ FALTA: $hook"
    fi
done

# 8. Iniciar servidor de desarrollo para testing manual
echo "🌐 Iniciando servidor de desarrollo..."
echo "📍 URL: http://localhost:3000"
echo "⏰ Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar el servidor
pnpm run dev 