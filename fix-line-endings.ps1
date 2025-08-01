# AltaMedica - Fix Line Endings (Solución CRLF vs LF)
# Convierte todos los scripts a line endings Unix (LF) para evitar problemas bash

Write-Host "🔧 AltaMedica - Corrigiendo Line Endings (CRLF → LF)" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Función para convertir line endings
function Convert-LineEndings {
    param(
        [string]$FilePath,
        [string]$OutputPath = $null
    )
    
    if (!$OutputPath) {
        $OutputPath = $FilePath
    }
    
    try {
        # Leer contenido preservando encoding
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        
        if ($content) {
            # Convertir CRLF a LF
            $unixContent = $content -replace "`r`n", "`n"
            
            # Escribir con encoding UTF8 sin BOM
            [System.IO.File]::WriteAllText($OutputPath, $unixContent, [System.Text.UTF8Encoding]::new($false))
            
            Write-Host "✅ Convertido: $FilePath" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ Archivo vacío: $FilePath" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ Error procesando $FilePath`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Lista de archivos a convertir
$scriptsToFix = @(
    "autonomous-update-monitor.ps1",
    "automated-update.ps1", 
    "verify-environment.ps1",
    "update-dependencies.ps1",
    "medical-libraries-upgrade.ps1",
    "setup-windows-environment.ps1",
    "monitor-terminal.ps1",
    "quick-monitor.ps1",
    "launcher.js",
    "launcher.py",
    "execute-autonomous-update.js",
    "CLAUDE.md",
    "README.md"
)

Write-Host "`n📋 Archivos a procesar:" -ForegroundColor Yellow
$scriptsToFix | ForEach-Object { Write-Host "  📄 $_" -ForegroundColor White }

Write-Host "`n🔄 Procesando archivos..." -ForegroundColor Cyan
$processed = 0
$errors = 0

foreach ($script in $scriptsToFix) {
    if (Test-Path $script) {
        Write-Host "`n📄 Procesando: $script" -ForegroundColor Cyan
        
        # Crear backup
        $backupName = "$script.backup-lineendings"
        Copy-Item $script $backupName -Force
        Write-Host "  💾 Backup creado: $backupName" -ForegroundColor Gray
        
        # Convertir line endings
        if (Convert-LineEndings -FilePath $script) {
            $processed++
            
            # Verificar resultado
            $newContent = Get-Content -Path $script -Raw
            $crlfCount = ($newContent | Select-String "`r`n" -AllMatches).Matches.Count
            $lfCount = ($newContent | Select-String "(?<!`r)`n" -AllMatches).Matches.Count
            
            Write-Host "  📊 CRLF restantes: $crlfCount | LF: $lfCount" -ForegroundColor Gray
            
        } else {
            $errors++
        }
    } else {
        Write-Host "⚠️ Archivo no encontrado: $script" -ForegroundColor Yellow
    }
}

# Procesar archivos en subdirectorios
Write-Host "`n📁 Procesando subdirectorios..." -ForegroundColor Cyan

$subDirs = @("apps", "packages")
foreach ($subDir in $subDirs) {
    if (Test-Path $subDir) {
        Write-Host "`n📂 Directorio: $subDir" -ForegroundColor Yellow
        
        # Buscar archivos .ps1, .js, .ts, .md en subdirectorios
        Get-ChildItem -Path $subDir -Recurse -Include "*.ps1", "*.js", "*.ts", "*.md", "*.json" | 
        ForEach-Object {
            Write-Host "  🔄 $($_.FullName)" -ForegroundColor Gray
            
            $backup = "$($_.FullName).backup-lineendings"
            Copy-Item $_.FullName $backup -Force
            
            if (Convert-LineEndings -FilePath $_.FullName) {
                $processed++
            } else {
                $errors++
            }
        }
    }
}

# Crear script de verificación
Write-Host "`n📝 Creando script de verificación..." -ForegroundColor Yellow

$verificationScript = @"
# Verificar Line Endings - AltaMedica
Get-ChildItem -Recurse -Include "*.ps1", "*.js", "*.ts", "*.md" | ForEach-Object {
    `$content = Get-Content -Path `$_.FullName -Raw -ErrorAction SilentlyContinue
    if (`$content) {
        `$crlfCount = (`$content | Select-String "``r``n" -AllMatches).Matches.Count
        `$lfCount = (`$content | Select-String "(?<!``r)``n" -AllMatches).Matches.Count
        
        if (`$crlfCount -gt 0) {
            Write-Host "⚠️ `$(`$_.FullName) - CRLF: `$crlfCount" -ForegroundColor Yellow
        } else {
            Write-Host "✅ `$(`$_.FullName) - Solo LF" -ForegroundColor Green
        }
    }
}
"@

$verificationScript | Set-Content -Path "verify-line-endings.ps1" -Encoding UTF8

# Configurar Git para manejar line endings correctamente
Write-Host "`n🔧 Configurando Git para line endings..." -ForegroundColor Cyan

try {
    # Configurar Git para el proyecto
    git config core.autocrlf false
    git config core.eol lf
    Write-Host "✅ Git configurado: autocrlf=false, eol=lf" -ForegroundColor Green
    
    # Crear .gitattributes si no existe
    if (!(Test-Path ".gitattributes")) {
        $gitAttributes = @"
# AltaMedica - Git Line Endings Configuration
* text=auto eol=lf
*.ps1 text eol=lf
*.js text eol=lf
*.ts text eol=lf
*.md text eol=lf
*.json text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
"@
        $gitAttributes | Set-Content -Path ".gitattributes" -Encoding UTF8
        Write-Host "✅ .gitattributes creado" -ForegroundColor Green
    }
    
} catch {
    Write-Host "⚠️ Error configurando Git: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Resumen final
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "📊 RESUMEN DE CORRECCIÓN DE LINE ENDINGS" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "✅ Archivos procesados exitosamente: $processed" -ForegroundColor Green
Write-Host "❌ Errores encontrados: $errors" -ForegroundColor $(if($errors -gt 0){"Red"}else{"Green"})
Write-Host "💾 Backups creados con extensión: .backup-lineendings" -ForegroundColor Cyan
Write-Host "🔧 Git configurado para LF endings" -ForegroundColor Cyan
Write-Host "📝 Script de verificación: verify-line-endings.ps1" -ForegroundColor Cyan

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Ejecutar verify-line-endings.ps1 para confirmar" -ForegroundColor White
Write-Host "2. Probar bash commands con los archivos corregidos" -ForegroundColor White
Write-Host "3. Si funciona, borrar archivos .backup-lineendings" -ForegroundColor White

if ($errors -eq 0) {
    Write-Host "`n🎉 ¡Todos los line endings corregidos exitosamente!" -ForegroundColor Green
    Write-Host "💡 Ahora bash debería funcionar correctamente" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Algunos archivos tuvieron errores. Revisar manualmente." -ForegroundColor Yellow
}

Write-Host "=" * 60 -ForegroundColor Gray