#!/bin/bash
# 🏥 HOOK SEGURO: SessionStart para desarrollo médico
# Este hook inicializa el entorno de desarrollo de telemedicina

echo "🏥 ========================================="
echo "   ALTAMEDICA - Desarrollo Médico Seguro"
echo "========================================="
echo ""
echo "✅ Verificando entorno de desarrollo..."

# Verificar variables de entorno críticas
if [ -z "$NODE_ENV" ]; then
    echo "⚠️  NODE_ENV no configurado - Configurando como development"
    export NODE_ENV=development
fi

# Verificar que estamos en modo desarrollo
if [ "$NODE_ENV" = "production" ]; then
    echo "🚨 ADVERTENCIA: Estás en modo PRODUCTION"
    echo "🔒 Datos médicos reales pueden estar presentes"
fi

# Mostrar información del proyecto
echo "📁 Proyecto: DEVALTA - Sistema de Telemedicina"
echo "🌿 Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || 'Sin Git')"
echo "📅 Fecha: $(date)"
echo ""

# Verificar dependencias críticas
echo "🔍 Verificando dependencias críticas..."
if command -v pnpm &> /dev/null; then
    echo "✅ PNPM instalado: $(pnpm --version)"
else
    echo "❌ PNPM no encontrado - Instalar con: npm install -g pnpm"
fi

if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js no encontrado"
fi

echo ""
echo "🛡️  RECORDATORIO DE SEGURIDAD:"
echo "   • Solo usar datos de prueba en desarrollo"
echo "   • Nunca exponer información médica real"
echo "   • Seguir compliance HIPAA en todo momento"
echo ""
echo "🚀 Entorno listo para desarrollo seguro"
echo "========================================="
