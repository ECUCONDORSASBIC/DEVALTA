Write-Host "🔌 TEST DE CONECTIVIDAD ALTAMEDICADEV"

$ports = @(3001, 3002, 3003)
foreach ($port in $ports) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -TimeoutSec 3
    Write-Host "✅ Puerto $port: $($response.StatusCode)"
  } catch {
    Write-Host "❌ Puerto $port: DOWN"
  }
}
