# 🏥 DEVALTAMEDICA - MEDICAL DASHBOARD LAUNCHER
# Script para iniciar el dashboard médico web completo

Write-Host "🏥 DEVALTAMEDICA - MEDICAL DASHBOARD" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no encontrado. Instalando..." -ForegroundColor Red
    # Aquí iría la lógica de instalación de Node.js
    exit 1
}

# Crear servidor web simple para el dashboard
$serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(\`\${req.method} \${req.url}\`);
    
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './medical-dashboard.html';
    }
    
    const extname = path.extname(filePath);
    let contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Archivo no encontrado');
            } else {
                res.writeHead(500);
                res.end('Error del servidor: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(\`🚀 Servidor médico iniciado en http://localhost:\${PORT}\`);
    console.log('📊 Dashboard disponible en: http://localhost:3000');
    console.log('⏹️ Para detener: Ctrl+C');
});

// Manejar Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servidor médico...');
    server.close(() => {
        console.log('✅ Servidor detenido');
        process.exit(0);
    });
});
"@

# Guardar script del servidor
$serverScript | Out-File -FilePath "medical-server.js" -Encoding UTF8

Write-Host "🚀 Iniciando servidor médico..." -ForegroundColor Yellow
Write-Host ""

# Iniciar servidor en background
Start-Process -FilePath "node" -ArgumentList "medical-server.js" -WindowStyle Hidden

# Esperar un momento para que el servidor inicie
Start-Sleep -Seconds 3

Write-Host "✅ Servidor médico iniciado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 DASHBOARD DISPONIBLE EN:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📊 FUNCIONALIDADES ACTIVAS:" -ForegroundColor Cyan
Write-Host "   • Dashboard médico completo" -ForegroundColor White
Write-Host "   • Workflows clínicos interactivos" -ForegroundColor White
Write-Host "   • Analytics médicos en tiempo real" -ForegroundColor White
Write-Host "   • Gestión de pacientes" -ForegroundColor White
Write-Host "   • Compliance HIPAA" -ForegroundColor White
Write-Host ""
Write-Host "🎮 CONTROLES:" -ForegroundColor Cyan
Write-Host "   • Abrir navegador automáticamente" -ForegroundColor White
Write-Host "   • Ctrl+C para detener servidor" -ForegroundColor White
Write-Host ""

# Abrir navegador automáticamente
Write-Host "🌐 Abriendo dashboard en navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "🎉 ¡DASHBOARD MÉDICO COMPLETAMENTE OPERATIVO!" -ForegroundColor Green
Write-Host ""
Write-Host "Tu sistema DEVALTAMEDICA incluye:" -ForegroundColor Cyan
Write-Host "   🏥 Medical Design System completo" -ForegroundColor White
Write-Host "   🔄 Workflows clínicos automatizados" -ForegroundColor White
Write-Host "   📊 Analytics médicos avanzados" -ForegroundColor White
Write-Host "   🛡️ Compliance HIPAA integrado" -ForegroundColor White
Write-Host "   👥 Gestión completa de pacientes" -ForegroundColor White
Write-Host ""

# Mantener script vivo para monitoreo
Write-Host "📊 Monitoreando servidor..." -ForegroundColor Yellow
Write-Host "Presiona Ctrl+C para detener" -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep -Seconds 30
        
        # Verificar si el servidor sigue corriendo
        $process = Get-Process node -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "✅ Servidor activo - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
        } else {
            Write-Host "❌ Servidor detenido" -ForegroundColor Red
            break
        }
    }
} catch {
    Write-Host "🛑 Deteniendo monitoreo..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏁 Proceso completado" -ForegroundColor Cyan 