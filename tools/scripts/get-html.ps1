# Script para obtener HTML de la aplicación AltaMedica Patients
param(
    [string]$Url = "http://localhost:3003"
)

Write-Host "Obteniendo HTML de: $Url" -ForegroundColor Green

try {
    # Configurar parámetros de la solicitud
    $headers = @{
        'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        'Accept' = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        'Accept-Language' = 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
        'Accept-Encoding' = 'gzip, deflate'
        'Connection' = 'keep-alive'
    }
    
    # Realizar la solicitud
    $response = Invoke-WebRequest -Uri $Url -Headers $headers -UseBasicParsing -TimeoutSec 15
    
    Write-Host "`n=== INFORMACIÓN DE RESPUESTA ===" -ForegroundColor Cyan
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Yellow
    Write-Host "Content Length: $($response.Content.Length) caracteres" -ForegroundColor Yellow
    Write-Host "Content Type: $($response.Headers.'Content-Type')" -ForegroundColor Yellow
    
    Write-Host "`n=== CONTENIDO HTML ===" -ForegroundColor Cyan
    Write-Output $response.Content
    
} catch {
    Write-Host "`n=== ERROR ===" -ForegroundColor Red
    Write-Host "No se pudo obtener el HTML: $($_.Exception.Message)" -ForegroundColor Red
    
    # Verificar si el servidor está ejecutándose
    Write-Host "`nVerificando puerto 3003..." -ForegroundColor Yellow
    $portCheck = netstat -ano | findstr :3003
    if ($portCheck) {
        Write-Host "Puerto 3003 está en uso:" -ForegroundColor Green
        Write-Output $portCheck
    } else {
        Write-Host "Puerto 3003 no está en uso. ¿Está el servidor ejecutándose?" -ForegroundColor Red
    }
}