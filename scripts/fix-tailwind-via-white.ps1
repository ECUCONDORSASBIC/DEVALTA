# Script para corregir todas las instancias de via-white en el proyecto
Write-Host "Corrigiendo clases via-white en archivos CSS y JSX/TSX..." -ForegroundColor Cyan

$rootPath = Split-Path -Parent $PSScriptRoot

# Archivos a corregir
$filesToFix = @(
    # CSS files
    "apps\doctors\src\app\globals.css",
    
    # TSX/JSX files en companies
    "apps\companies\src\components\maps\AltamedicaInteractiveMapSafe.tsx",
    
    # TSX files en web-app
    "apps\web-app\src\components\common\RedirectingLoader.tsx",
    "apps\web-app\src\components\auth\SimpleAuthSystem.tsx",
    "apps\web-app\src\components\auth\RouteGuard.tsx",
    "apps\web-app\src\components\auth\RegisterForm.tsx",
    "apps\web-app\src\components\auth\ForgotPasswordForm.tsx",
    "apps\web-app\src\components\auth\AuthSystem.tsx",
    "apps\web-app\src\components\auth\AuthSystem-firebase.tsx",
    "apps\web-app\src\components\auth\AuthLoading.tsx",
    "apps\web-app\src\app\unauthorized\page.tsx",
    "apps\web-app\src\app\status\page.tsx",
    "apps\web-app\src\app\page.tsx",
    "apps\web-app\src\app\help\page.tsx",
    "apps\web-app\src\app\calculadora-precios\page.tsx",
    "apps\web-app\src\app\anamnesis-juego\page.tsx",
    "apps\web-app\src\app\(auth)\verify-email\page.tsx",
    
    # Files en patients
    "apps\patients\src\config\altamedica-colors.ts",
    "apps\patients\src\app\page-original-backup.tsx",
    "apps\patients\src\app\ai-diagnosis\loading.tsx"
)

$fixedCount = 0

foreach ($file in $filesToFix) {
    $filePath = Join-Path $rootPath $file
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Reemplazar via-white con via-neutral-50
        $newContent = $content -replace 'via-white', 'via-neutral-50'
        
        if ($content -ne $newContent) {
            Set-Content -Path $filePath -Value $newContent -NoNewline
            Write-Host "Corregido: $file" -ForegroundColor Green
            $fixedCount++
        }
    } else {
        Write-Host "No encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Correccion completada" -ForegroundColor Green
Write-Host "Archivos corregidos: $fixedCount" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Green

Write-Host ""
Write-Host "Nota: 'via-white' ha sido reemplazado por 'via-neutral-50'" -ForegroundColor Cyan
Write-Host "Esto mantiene el efecto visual similar con una clase valida de Tailwind" -ForegroundColor Cyan