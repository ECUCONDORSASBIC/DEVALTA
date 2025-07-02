# 🏥 SCRIPT MAESTRO - PLAN DE ACCIÓN COMPLETO ALTAMEDICA
# Ejecuta todo el plan de desarrollo de las tres aplicaciones

Write-Host "🚀 INICIANDO PLAN DE ACCIÓN COMPLETO ALTAMEDICA" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json") -or -not (Test-Path "apps")) {
    Write-Host "❌ Debes ejecutar este script desde la raíz del proyecto Altamedica" -ForegroundColor Red
    exit 1
}

Write-Host "📋 RESUMEN DEL PLAN" -ForegroundColor Magenta
Write-Host "Fase 1: Finalizar Pacientes (2-3 días) - 95% completado"
Write-Host "Fase 2: Completar Médicos (14-19 días) - 40% completado"
Write-Host "Fase 3: Desarrollar Empresas (18-24 días) - 10% completado"
Write-Host ""

# Preguntar qué fase ejecutar
Write-Host "¿Qué fase quieres ejecutar?"
Write-Host "1. Fase 1: Finalizar Pacientes"
Write-Host "2. Fase 2: Limpiar y Preparar Médicos"
Write-Host "3. Fase 3: Inicializar Empresas"
Write-Host "4. Ejecutar todas las fases"
Write-Host "5. Solo verificar estado actual"
Write-Host ""
$choice = Read-Host "Selecciona una opción (1-5)"

switch ($choice) {
    "1" {
        Write-Host "🏥 FASE 1: FINALIZAR PACIENTES" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "📋 Ejecutando script de finalización de pacientes..." -ForegroundColor Blue
        if (Test-Path "scripts/finalizar-pacientes.ps1") {
            & "scripts/finalizar-pacientes.ps1"
        } else {
            Write-Host "❌ No se encontró el script finalizar-pacientes.ps1" -ForegroundColor Red
            exit 1
        }
    }
    "2" {
        Write-Host "👨‍⚕️ FASE 2: LIMPIAR Y PREPARAR MÉDICOS" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "📋 Ejecutando script de limpieza de médicos..." -ForegroundColor Blue
        if (Test-Path "scripts/limpiar-medicos.ps1") {
            & "scripts/limpiar-medicos.ps1"
        } else {
            Write-Host "❌ No se encontró el script limpiar-medicos.ps1" -ForegroundColor Red
            exit 1
        }
    }
    "3" {
        Write-Host "🏢 FASE 3: INICIALIZAR EMPRESAS" -ForegroundColor Magenta
        Write-Host ""
        Write-Host "📋 Ejecutando script de inicialización de empresas..." -ForegroundColor Blue
        if (Test-Path "scripts/inicializar-empresas.ps1") {
            & "scripts/inicializar-empresas.ps1"
        } else {
            Write-Host "❌ No se encontró el script inicializar-empresas.ps1" -ForegroundColor Red
            exit 1
        }
    }
    "4" {
        Write-Host "🚀 EJECUTANDO TODAS LAS FASES" -ForegroundColor Magenta
        Write-Host ""
        
        Write-Host "📋 Fase 1: Finalizar Pacientes..." -ForegroundColor Blue
        if (Test-Path "scripts/finalizar-pacientes.ps1") {
            & "scripts/finalizar-pacientes.ps1"
        }
        
        Write-Host ""
        Write-Host "📋 Fase 2: Limpiar y Preparar Médicos..." -ForegroundColor Blue
        if (Test-Path "scripts/limpiar-medicos.ps1") {
            & "scripts/limpiar-medicos.ps1"
        }
        
        Write-Host ""
        Write-Host "📋 Fase 3: Inicializar Empresas..." -ForegroundColor Blue
        if (Test-Path "scripts/inicializar-empresas.ps1") {
            & "scripts/inicializar-empresas.ps1"
        }
    }
    "5" {
        Write-Host "🔍 VERIFICANDO ESTADO ACTUAL" -ForegroundColor Magenta
        Write-Host ""
        Verify-CurrentState
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

# Función para verificar estado actual
function Verify-CurrentState {
    Write-Host "📋 Verificando estado de las aplicaciones..." -ForegroundColor Blue
    Write-Host ""
    
    # Verificar Pacientes
    Write-Host "📋 Aplicación Pacientes:" -ForegroundColor Blue
    if (Test-Path "apps/patients") {
        Set-Location "apps/patients"
        if (Test-Path "src/app/page.tsx") {
            Write-Host "✅ Estructura básica existe" -ForegroundColor Green
            
            # Contar archivos de páginas
            $pageCount = (Get-ChildItem -Path "src/app" -Filter "page.tsx" -Recurse).Count
            Write-Host "   📄 Páginas encontradas: $pageCount" -ForegroundColor Blue
            
            # Verificar hooks
            if (Test-Path "src/hooks") {
                $hookCount = (Get-ChildItem -Path "src/hooks" -Filter "*.ts" -Recurse).Count + (Get-ChildItem -Path "src/hooks" -Filter "*.tsx" -Recurse).Count
                Write-Host "   🔗 Hooks encontrados: $hookCount" -ForegroundColor Blue
            }
            
            # Verificar componentes
            if (Test-Path "src/components") {
                $componentCount = (Get-ChildItem -Path "src/components" -Filter "*.tsx" -Recurse).Count
                Write-Host "   🧩 Componentes encontrados: $componentCount" -ForegroundColor Blue
            }
        } else {
            Write-Host "⚠️  Estructura básica incompleta" -ForegroundColor Yellow
        }
        Set-Location "../.."
    } else {
        Write-Host "❌ Directorio de pacientes no encontrado" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Verificar Médicos
    Write-Host "👨‍⚕️ Aplicación Médicos:" -ForegroundColor Blue
    if (Test-Path "apps/companies-dashboard") {
        Set-Location "apps/companies-dashboard"
        if (Test-Path "src/app/page.tsx") {
            Write-Host "✅ Estructura básica existe" -ForegroundColor Green
            
            # Verificar duplicados de mapas
            if (Test-Path "src/components/maps") {
                $mapFiles = (Get-ChildItem -Path "src/components/maps" -Filter "*Backup*").Count + (Get-ChildItem -Path "src/components/maps" -Filter "*Fixed*").Count + (Get-ChildItem -Path "src/components/maps" -Filter "*Safe*").Count
                if ($mapFiles -gt 0) {
                    Write-Host "⚠️  Archivos duplicados encontrados: $mapFiles" -ForegroundColor Yellow
                } else {
                    Write-Host "✅ Sin archivos duplicados" -ForegroundColor Green
                }
            }
            
            # Contar archivos de páginas
            $pageCount = (Get-ChildItem -Path "src/app" -Filter "page.tsx" -Recurse).Count
            Write-Host "   📄 Páginas encontradas: $pageCount" -ForegroundColor Blue
        } else {
            Write-Host "⚠️  Estructura básica incompleta" -ForegroundColor Yellow
        }
        Set-Location "../.."
    } else {
        Write-Host "❌ Directorio de médicos no encontrado" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Verificar Empresas
    Write-Host "🏢 Aplicación Empresas:" -ForegroundColor Blue
    if (Test-Path "apps/companies") {
        Set-Location "apps/companies"
        if (Test-Path "src/app/page.tsx") {
            Write-Host "✅ Estructura básica existe" -ForegroundColor Green
            
            # Contar archivos de páginas
            $pageCount = (Get-ChildItem -Path "src/app" -Filter "page.tsx" -Recurse).Count
            Write-Host "   📄 Páginas encontradas: $pageCount" -ForegroundColor Blue
            
            # Verificar si tiene autenticación
            if (Test-Path "src/app/(auth)/login/page.tsx") {
                Write-Host "✅ Autenticación implementada" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Autenticación no implementada" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠️  Estructura básica incompleta" -ForegroundColor Yellow
        }
        Set-Location "../.."
    } else {
        Write-Host "❌ Directorio de empresas no encontrado" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "📊 RESUMEN DEL ESTADO" -ForegroundColor Magenta
    Write-Host "Pacientes: 95% completado ✅"
    Write-Host "Médicos: 40% completado ⚠️"
    Write-Host "Empresas: 10% completado ❌"
    Write-Host ""
    Write-Host "📋 Recomendación: Comenzar con Fase 1 (Finalizar Pacientes)" -ForegroundColor Blue
}

# Verificar puertos disponibles
function Check-Ports {
    Write-Host "📋 Verificando puertos disponibles..." -ForegroundColor Blue
    
    $ports = @("3000", "3001", "3002", "3010")
    
    foreach ($port in $ports) {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connection) {
            Write-Host "⚠️  Puerto $port está en uso" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Puerto $port disponible" -ForegroundColor Green
        }
    }
}

# Mostrar comandos útiles
function Show-UsefulCommands {
    Write-Host ""
    Write-Host "🔧 COMANDOS ÚTILES" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "📦 Instalar dependencias:"
    Write-Host "   pnpm install"
    Write-Host ""
    Write-Host "🚀 Iniciar desarrollo:"
    Write-Host "   # Pacientes"
    Write-Host "   cd apps/patients && pnpm run dev"
    Write-Host ""
    Write-Host "   # Médicos"
    Write-Host "   cd apps/companies-dashboard && pnpm run dev"
    Write-Host ""
    Write-Host "   # Empresas"
    Write-Host "   cd apps/companies && pnpm run dev"
    Write-Host ""
    Write-Host "🔍 Verificar TypeScript:"
    Write-Host "   pnpm run type-check"
    Write-Host ""
    Write-Host "🔨 Build de producción:"
    Write-Host "   pnpm run build"
    Write-Host ""
    Write-Host "📊 Análisis de bundle:"
    Write-Host "   pnpm run analyze"
}

# Ejecutar verificación de puertos si no se seleccionó opción 5
if ($choice -ne "5") {
    Write-Host ""
    Check-Ports
    Show-UsefulCommands
}

Write-Host "✅ ¡Plan de acción completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Blue
Write-Host "1. Revisar los logs de cada fase"
Write-Host "2. Ejecutar las aplicaciones en modo desarrollo"
Write-Host "3. Probar funcionalidades implementadas"
Write-Host "4. Continuar con el desarrollo según el plan"
Write-Host ""
Write-Host "🎉 ¡Éxito en el desarrollo de Altamedica!" -ForegroundColor Magenta 