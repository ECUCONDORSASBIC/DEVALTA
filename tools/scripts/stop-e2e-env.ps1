# tools/scripts/stop-e2e-env.ps1
# Este script detiene los servidores del entorno de pruebas E2E.

Write-Host "🛑 Deteniendo los servidores del entorno E2E..."

# Puertos en los que corren los servicios
$ports = @(3008, 3003, 3006)

foreach ($port in $ports) {
    try {
        $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
        if ($connection) {
            $processId = $connection.OwningProcess
            Write-Host "Deteniendo proceso con ID $processId en el puerto $port..."
            Stop-Process -Id $processId -Force
        }
    } catch {
        Write-Host "No se encontró ningún proceso en el puerto $port."
    }
}

Write-Host "✅ Entorno E2E detenido."
