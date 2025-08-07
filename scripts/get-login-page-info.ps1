# Script para obtener información de la página de login usando Selenium WebDriver

# Verificar si Selenium está instalado
try {
    Import-Module Selenium -ErrorAction Stop
    Write-Host "✅ Módulo Selenium encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Selenium no está instalado. Instalando..." -ForegroundColor Yellow
    Install-Module -Name Selenium -Force -AllowClobber
    Import-Module Selenium
}

# Función para capturar información de la página
function Get-LoginPageInfo {
    param(
        [string]$Url = "http://localhost:3000/login"
    )
    
    Write-Host "`n🔍 Analizando página de login en: $Url" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    try {
        # Iniciar Chrome
        $Driver = Start-SeChrome -Headless:$false
        
        # Navegar a la página
        Write-Host "`n📱 Navegando a la página..." -ForegroundColor Yellow
        Enter-SeUrl -Driver $Driver -Url $Url
        
        # Esperar a que la página cargue
        Start-Sleep -Seconds 3
        
        # Capturar título
        $title = Get-SeTitle -Driver $Driver
        Write-Host "`n📄 Título de la página: $title" -ForegroundColor Green
        
        # Capturar URL actual
        $currentUrl = $Driver.Url
        Write-Host "🔗 URL actual: $currentUrl" -ForegroundColor Green
        
        # Buscar elementos del formulario
        Write-Host "`n📋 Elementos del formulario encontrados:" -ForegroundColor Yellow
        
        # Email input
        try {
            $emailInput = Find-SeElement -Driver $Driver -ClassName "email-input" -ErrorAction SilentlyContinue
            if (-not $emailInput) {
                $emailInput = Find-SeElement -Driver $Driver -Id "email" -ErrorAction SilentlyContinue
            }
            if (-not $emailInput) {
                $emailInput = Find-SeElement -Driver $Driver -Name "email" -ErrorAction SilentlyContinue
            }
            if ($emailInput) {
                Write-Host "✅ Campo de email encontrado" -ForegroundColor Green
                $emailValue = Get-SeElementAttribute -Element $emailInput -Attribute "value"
                if ($emailValue) {
                    Write-Host "   Valor actual: $emailValue" -ForegroundColor Gray
                }
            } else {
                Write-Host "❌ Campo de email NO encontrado" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error buscando campo de email" -ForegroundColor Red
        }
        
        # Password input
        try {
            $passwordInput = Find-SeElement -Driver $Driver -ClassName "password-input" -ErrorAction SilentlyContinue
            if (-not $passwordInput) {
                $passwordInput = Find-SeElement -Driver $Driver -Id "password" -ErrorAction SilentlyContinue
            }
            if (-not $passwordInput) {
                $passwordInput = Find-SeElement -Driver $Driver -Name "password" -ErrorAction SilentlyContinue
            }
            if ($passwordInput) {
                Write-Host "✅ Campo de contraseña encontrado" -ForegroundColor Green
            } else {
                Write-Host "❌ Campo de contraseña NO encontrado" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error buscando campo de contraseña" -ForegroundColor Red
        }
        
        # Botón de submit
        try {
            $submitButton = Find-SeElement -Driver $Driver -ClassName "submit-button" -ErrorAction SilentlyContinue
            if (-not $submitButton) {
                $submitButton = Find-SeElement -Driver $Driver -TagName "button" | Where-Object { 
                    $_.Text -match "Iniciar|Login|Entrar|Acceder" 
                } | Select-Object -First 1
            }
            if ($submitButton) {
                Write-Host "✅ Botón de envío encontrado: '$($submitButton.Text)'" -ForegroundColor Green
                $isDisabled = Get-SeElementAttribute -Element $submitButton -Attribute "disabled"
                if ($isDisabled) {
                    Write-Host "   ⚠️ El botón está deshabilitado" -ForegroundColor Yellow
                }
            } else {
                Write-Host "❌ Botón de envío NO encontrado" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ Error buscando botón de envío" -ForegroundColor Red
        }
        
        # Capturar mensajes de error
        Write-Host "`n🚨 Buscando mensajes de error..." -ForegroundColor Yellow
        try {
            $errorElements = Find-SeElement -Driver $Driver -ClassName "error" -ErrorAction SilentlyContinue
            if (-not $errorElements) {
                $errorElements = Find-SeElement -Driver $Driver -ClassName "alert" -ErrorAction SilentlyContinue
            }
            if ($errorElements) {
                foreach ($error in $errorElements) {
                    Write-Host "❌ Error encontrado: $($error.Text)" -ForegroundColor Red
                }
            } else {
                Write-Host "✅ No se encontraron mensajes de error visibles" -ForegroundColor Green
            }
        } catch {
            Write-Host "✅ No se encontraron mensajes de error" -ForegroundColor Green
        }
        
        # Capturar logs de consola
        Write-Host "`n📊 Logs de consola del navegador:" -ForegroundColor Yellow
        $logs = $Driver.Manage().Logs.GetLog("browser")
        if ($logs.Count -gt 0) {
            foreach ($log in $logs | Select-Object -Last 10) {
                $color = switch ($log.Level.ToString()) {
                    "Severe" { "Red" }
                    "Warning" { "Yellow" }
                    default { "Gray" }
                }
                Write-Host "$($log.Timestamp): [$($log.Level)] $($log.Message)" -ForegroundColor $color
            }
        } else {
            Write-Host "No hay logs de consola disponibles" -ForegroundColor Gray
        }
        
        # Capturar screenshot
        $screenshotPath = "$PSScriptRoot\..\login-screenshot-$(Get-Date -Format 'yyyyMMdd-HHmmss').png"
        $Driver.GetScreenshot().SaveAsFile($screenshotPath)
        Write-Host "`n📸 Screenshot guardado en: $screenshotPath" -ForegroundColor Green
        
        # Verificar conectividad con el backend
        Write-Host "`n🔌 Verificando conectividad con el backend..." -ForegroundColor Yellow
        try {
            $apiResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
            if ($apiResponse.StatusCode -eq 200) {
                Write-Host "✅ API Server respondiendo correctamente" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ API Server no responde en http://localhost:3001" -ForegroundColor Red
        }
        
        # Ejecutar JavaScript para obtener más información
        Write-Host "`n🔧 Información adicional del DOM:" -ForegroundColor Yellow
        $jsInfo = $Driver.ExecuteScript(@"
            return {
                readyState: document.readyState,
                forms: document.forms.length,
                inputs: document.querySelectorAll('input').length,
                buttons: document.querySelectorAll('button').length,
                title: document.title,
                hasEmailInput: document.querySelector('input[type="email"]') !== null,
                hasPasswordInput: document.querySelector('input[type="password"]') !== null,
                bodyText: document.body.innerText.substring(0, 200)
            };
"@)
        
        Write-Host "- Estado del documento: $($jsInfo.readyState)" -ForegroundColor White
        Write-Host "- Formularios encontrados: $($jsInfo.forms)" -ForegroundColor White
        Write-Host "- Campos input encontrados: $($jsInfo.inputs)" -ForegroundColor White
        Write-Host "- Botones encontrados: $($jsInfo.buttons)" -ForegroundColor White
        Write-Host "- Tiene campo email: $($jsInfo.hasEmailInput)" -ForegroundColor White
        Write-Host "- Tiene campo password: $($jsInfo.hasPasswordInput)" -ForegroundColor White
        
        Write-Host "`n📝 Primeros 200 caracteres del contenido:" -ForegroundColor Yellow
        Write-Host $jsInfo.bodyText -ForegroundColor Gray
        
    } catch {
        Write-Host "`n❌ Error: $_" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    } finally {
        # Cerrar el navegador
        if ($Driver) {
            Stop-SeDriver -Driver $Driver
            Write-Host "`n✅ Navegador cerrado" -ForegroundColor Green
        }
    }
}

# Método alternativo usando Invoke-WebRequest (sin Selenium)
function Get-LoginPageInfo-Simple {
    param(
        [string]$Url = "http://localhost:3000/login"
    )
    
    Write-Host "`n🔍 Método alternativo: Obteniendo HTML con Invoke-WebRequest" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        
        Write-Host "✅ Respuesta recibida" -ForegroundColor Green
        Write-Host "- Código de estado: $($response.StatusCode)" -ForegroundColor White
        Write-Host "- Tamaño del contenido: $($response.Content.Length) bytes" -ForegroundColor White
        
        # Guardar HTML
        $htmlPath = "$PSScriptRoot\..\login-page-$(Get-Date -Format 'yyyyMMdd-HHmmss').html"
        $response.Content | Out-File -FilePath $htmlPath -Encoding UTF8
        Write-Host "- HTML guardado en: $htmlPath" -ForegroundColor Green
        
        # Buscar patrones en el HTML
        Write-Host "`n📋 Analizando contenido HTML:" -ForegroundColor Yellow
        
        if ($response.Content -match 'email') {
            Write-Host "✅ Palabra 'email' encontrada en el HTML" -ForegroundColor Green
        }
        
        if ($response.Content -match 'password') {
            Write-Host "✅ Palabra 'password' encontrada en el HTML" -ForegroundColor Green
        }
        
        if ($response.Content -match 'Procesando') {
            Write-Host "⚠️ Texto 'Procesando' encontrado - posible estado de carga" -ForegroundColor Yellow
        }
        
        # Extraer título si existe
        if ($response.Content -match '<title>(.*?)</title>') {
            Write-Host "📄 Título: $($Matches[1])" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "❌ Error al obtener la página: $_" -ForegroundColor Red
    }
}

# Ejecutar ambos métodos
Write-Host "🚀 Iniciando análisis de la página de login..." -ForegroundColor Cyan
Write-Host "`nNOTA: Este script intentará usar Selenium primero, luego un método alternativo" -ForegroundColor Gray

# Método 1: Selenium (más completo)
try {
    Get-LoginPageInfo
} catch {
    Write-Host "`n⚠️ Selenium no disponible o error al ejecutar" -ForegroundColor Yellow
}

# Método 2: Simple HTTP Request
Get-LoginPageInfo-Simple

Write-Host "`n✅ Análisis completado" -ForegroundColor Green
Write-Host "`nSi el login sigue sin funcionar, verifica:" -ForegroundColor Yellow
Write-Host "1. Que la app de patients esté ejecutándose en http://localhost:3003" -ForegroundColor White
Write-Host "2. Los logs de la consola del navegador (F12)" -ForegroundColor White
Write-Host "3. Que no haya errores de CORS o red" -ForegroundColor White