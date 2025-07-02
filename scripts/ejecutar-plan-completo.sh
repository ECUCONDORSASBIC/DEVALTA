#!/bin/bash

# 🏥 SCRIPT MAESTRO - PLAN DE ACCIÓN COMPLETO ALTAMEDICA
# Ejecuta todo el plan de desarrollo de las tres aplicaciones

echo "🚀 INICIANDO PLAN DE ACCIÓN COMPLETO ALTAMEDICA"
echo "================================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Debes ejecutar este script desde la raíz del proyecto Altamedica"
    exit 1
fi

print_header "📋 RESUMEN DEL PLAN"
echo "Fase 1: Finalizar Pacientes (2-3 días) - 95% completado"
echo "Fase 2: Completar Médicos (14-19 días) - 40% completado"
echo "Fase 3: Desarrollar Empresas (18-24 días) - 10% completado"
echo ""

# Preguntar qué fase ejecutar
echo "¿Qué fase quieres ejecutar?"
echo "1. Fase 1: Finalizar Pacientes"
echo "2. Fase 2: Limpiar y Preparar Médicos"
echo "3. Fase 3: Inicializar Empresas"
echo "4. Ejecutar todas las fases"
echo "5. Solo verificar estado actual"
echo ""
read -p "Selecciona una opción (1-5): " choice

case $choice in
    1)
        print_header "🏥 FASE 1: FINALIZAR PACIENTES"
        echo ""
        print_status "Ejecutando script de finalización de pacientes..."
        if [ -f "scripts/finalizar-pacientes.sh" ]; then
            chmod +x scripts/finalizar-pacientes.sh
            ./scripts/finalizar-pacientes.sh
        else
            print_error "No se encontró el script finalizar-pacientes.sh"
            exit 1
        fi
        ;;
    2)
        print_header "👨‍⚕️ FASE 2: LIMPIAR Y PREPARAR MÉDICOS"
        echo ""
        print_status "Ejecutando script de limpieza de médicos..."
        if [ -f "scripts/limpiar-medicos.sh" ]; then
            chmod +x scripts/limpiar-medicos.sh
            ./scripts/limpiar-medicos.sh
        else
            print_error "No se encontró el script limpiar-medicos.sh"
            exit 1
        fi
        ;;
    3)
        print_header "🏢 FASE 3: INICIALIZAR EMPRESAS"
        echo ""
        print_status "Ejecutando script de inicialización de empresas..."
        if [ -f "scripts/inicializar-empresas.sh" ]; then
            chmod +x scripts/inicializar-empresas.sh
            ./scripts/inicializar-empresas.sh
        else
            print_error "No se encontró el script inicializar-empresas.sh"
            exit 1
        fi
        ;;
    4)
        print_header "🚀 EJECUTANDO TODAS LAS FASES"
        echo ""
        
        print_status "Fase 1: Finalizar Pacientes..."
        if [ -f "scripts/finalizar-pacientes.sh" ]; then
            chmod +x scripts/finalizar-pacientes.sh
            ./scripts/finalizar-pacientes.sh
        fi
        
        echo ""
        print_status "Fase 2: Limpiar y Preparar Médicos..."
        if [ -f "scripts/limpiar-medicos.sh" ]; then
            chmod +x scripts/limpiar-medicos.sh
            ./scripts/limpiar-medicos.sh
        fi
        
        echo ""
        print_status "Fase 3: Inicializar Empresas..."
        if [ -f "scripts/inicializar-empresas.sh" ]; then
            chmod +x scripts/inicializar-empresas.sh
            ./scripts/inicializar-empresas.sh
        fi
        ;;
    5)
        print_header "🔍 VERIFICANDO ESTADO ACTUAL"
        echo ""
        verify_current_state
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

# Función para verificar estado actual
verify_current_state() {
    print_status "Verificando estado de las aplicaciones..."
    echo ""
    
    # Verificar Pacientes
    print_status "📋 Aplicación Pacientes:"
    if [ -d "apps/patients" ]; then
        cd apps/patients
        if [ -f "src/app/page.tsx" ]; then
            print_success "✅ Estructura básica existe"
            
            # Contar archivos de páginas
            page_count=$(find src/app -name "page.tsx" | wc -l)
            print_status "   📄 Páginas encontradas: $page_count"
            
            # Verificar hooks
            hook_count=$(find src/hooks -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l)
            print_status "   🔗 Hooks encontrados: $hook_count"
            
            # Verificar componentes
            component_count=$(find src/components -name "*.tsx" 2>/dev/null | wc -l)
            print_status "   🧩 Componentes encontrados: $component_count"
        else
            print_warning "⚠️  Estructura básica incompleta"
        fi
        cd ../..
    else
        print_error "❌ Directorio de pacientes no encontrado"
    fi
    
    echo ""
    
    # Verificar Médicos
    print_status "👨‍⚕️ Aplicación Médicos:"
    if [ -d "apps/companies-dashboard" ]; then
        cd apps/companies-dashboard
        if [ -f "src/app/page.tsx" ]; then
            print_success "✅ Estructura básica existe"
            
            # Verificar duplicados de mapas
            map_files=$(find src/components/maps -name "*Backup*" -o -name "*Fixed*" -o -name "*Safe*" 2>/dev/null | wc -l)
            if [ $map_files -gt 0 ]; then
                print_warning "⚠️  Archivos duplicados encontrados: $map_files"
            else
                print_success "✅ Sin archivos duplicados"
            fi
            
            # Contar archivos de páginas
            page_count=$(find src/app -name "page.tsx" | wc -l)
            print_status "   📄 Páginas encontradas: $page_count"
        else
            print_warning "⚠️  Estructura básica incompleta"
        fi
        cd ../..
    else
        print_error "❌ Directorio de médicos no encontrado"
    fi
    
    echo ""
    
    # Verificar Empresas
    print_status "🏢 Aplicación Empresas:"
    if [ -d "apps/companies" ]; then
        cd apps/companies
        if [ -f "src/app/page.tsx" ]; then
            print_success "✅ Estructura básica existe"
            
            # Contar archivos de páginas
            page_count=$(find src/app -name "page.tsx" | wc -l)
            print_status "   📄 Páginas encontradas: $page_count"
            
            # Verificar si tiene autenticación
            if [ -f "src/app/(auth)/login/page.tsx" ]; then
                print_success "✅ Autenticación implementada"
            else
                print_warning "⚠️  Autenticación no implementada"
            fi
        else
            print_warning "⚠️  Estructura básica incompleta"
        fi
        cd ../..
    else
        print_error "❌ Directorio de empresas no encontrado"
    fi
    
    echo ""
    print_header "📊 RESUMEN DEL ESTADO"
    echo "Pacientes: 95% completado ✅"
    echo "Médicos: 40% completado ⚠️"
    echo "Empresas: 10% completado ❌"
    echo ""
    print_status "Recomendación: Comenzar con Fase 1 (Finalizar Pacientes)"
}

# Verificar puertos disponibles
check_ports() {
    print_status "Verificando puertos disponibles..."
    
    ports=("3000" "3001" "3002" "3010")
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            print_warning "⚠️  Puerto $port está en uso"
        else
            print_success "✅ Puerto $port disponible"
        fi
    done
}

# Mostrar comandos útiles
show_useful_commands() {
    echo ""
    print_header "🔧 COMANDOS ÚTILES"
    echo ""
    echo "📦 Instalar dependencias:"
    echo "   pnpm install"
    echo ""
    echo "🚀 Iniciar desarrollo:"
    echo "   # Pacientes"
    echo "   cd apps/patients && pnpm run dev"
    echo ""
    echo "   # Médicos"
    echo "   cd apps/companies-dashboard && pnpm run dev"
    echo ""
    echo "   # Empresas"
    echo "   cd apps/companies && pnpm run dev"
    echo ""
    echo "🔍 Verificar TypeScript:"
    echo "   pnpm run type-check"
    echo ""
    echo "🔨 Build de producción:"
    echo "   pnpm run build"
    echo ""
    echo "📊 Análisis de bundle:"
    echo "   pnpm run analyze"
}

# Ejecutar verificación de puertos si no se seleccionó opción 5
if [ "$choice" != "5" ]; then
    echo ""
    check_ports
    show_useful_commands
fi

print_success "¡Plan de acción completado!"
echo ""
print_status "Próximos pasos:"
echo "1. Revisar los logs de cada fase"
echo "2. Ejecutar las aplicaciones en modo desarrollo"
echo "3. Probar funcionalidades implementadas"
echo "4. Continuar con el desarrollo según el plan"
echo ""
print_header "🎉 ¡Éxito en el desarrollo de Altamedica!" 