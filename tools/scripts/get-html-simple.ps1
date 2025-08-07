# Script simple para obtener HTML
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003" -UseBasicParsing -TimeoutSec 10
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Content Length: $($response.Content.Length)"
    Write-Host "=== HTML CONTENT ==="
    Write-Output $response.Content
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    netstat -ano | findstr :3003
}