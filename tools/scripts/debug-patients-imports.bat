@echo off
echo.
echo ========================================
echo   Debug Patients App - Import Issues
echo ========================================
echo.

cd /d "C:\Users\Eduardo\Documents\devaltamedica\apps\patients"

echo 📍 Directorio: %CD%
echo.

echo 🔍 1. Verificando estructura de archivos críticos...
echo.

echo    📁 src/app/layout.tsx:
if exist "src\app\layout.tsx" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE
)

echo    📁 src/app/page.tsx:
if exist "src\app\page.tsx" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE
)

echo    📁 src/middleware.ts:
if exist "src\middleware.ts" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE
)

echo.
echo 🔍 2. Verificando componentes UI críticos...
echo.

echo    📁 src/components/ui/CardCorporate.tsx:
if exist "src\components\ui\CardCorporate.tsx" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE - PROBLEMA CRÍTICO
)

echo    📁 src/components/ui/ButtonCorporate.tsx:
if exist "src\components\ui\ButtonCorporate.tsx" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE - PROBLEMA CRÍTICO
)

echo    📁 src/components/ui/LoadingSpinner.tsx:
if exist "src\components\ui\LoadingSpinner.tsx" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE - PROBLEMA CRÍTICO
)

echo.
echo 🔍 3. Verificando providers (desactivados)...
echo.

echo    📁 src/providers/AuthProviderSimple.tsx:
if exist "src\providers\AuthProviderSimple.tsx" (
    echo       ✅ Existe (pero desactivado)
) else (
    echo       ❌ NO EXISTE - Puede ser problema
)

echo    📁 src/providers/QueryProvider.tsx:
if exist "src\providers\QueryProvider.tsx" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE - PROBLEMA CRÍTICO
)

echo.
echo 🔍 4. Verificando package.json y dependencias...
echo.

if exist "package.json" (
    echo    ✅ package.json existe
    echo.
    echo    📋 Dependencias críticas:
    findstr /i "next" package.json
    findstr /i "react" package.json
    findstr /i "typescript" package.json
) else (
    echo    ❌ package.json NO EXISTE - PROBLEMA CRÍTICO
)

echo.
echo 🔍 5. Verificando archivos de configuración...
echo.

echo    📁 next.config.js:
if exist "next.config.js" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE
)

echo    📁 tsconfig.json:
if exist "tsconfig.json" (
    echo       ✅ Existe  
) else (
    echo       ❌ NO EXISTE
)

echo    📁 tailwind.config.js:
if exist "tailwind.config.js" (
    echo       ✅ Existe
) else (
    echo       ❌ NO EXISTE
)

echo.
echo 🔍 6. Verificando .next build cache...
echo.

if exist ".next" (
    echo    ⚠️  .next cache existe - será eliminado
    echo    📁 Archivos en .next:
    dir ".next" /b 2>nul | findstr /v "^$"
) else (
    echo    ✅ No hay cache .next (bueno para fresh build)
)

echo.
echo 🔍 7. Verificando node_modules...
echo.

if exist "node_modules" (
    echo    ✅ node_modules existe
    if exist "node_modules\next" (
        echo       ✅ Next.js instalado
    ) else (
        echo       ❌ Next.js NO instalado
    )
    if exist "node_modules\react" (
        echo       ✅ React instalado
    ) else (
        echo       ❌ React NO instalado
    )
) else (
    echo    ❌ node_modules NO EXISTE - INSTALAR DEPENDENCIAS
)

echo.
echo 💡 RECOMENDACIONES:
echo.
echo    Si hay componentes UI faltantes:
echo    - Ejecuta: quick-fix-patients.bat
echo.
echo    Si faltan dependencias:
echo    - Ejecuta: npm install --legacy-peer-deps
echo.
echo    Si el error persiste:
echo    - Ejecuta: fix-nextjs-build-error.bat (limpieza completa)
echo.

pause