# 🏥 AltaMedica Backup Tasks Installation Script
# Ejecutar como Administrador

Write-Host "🏥 Instalando tareas de backup de AltaMedica..." -ForegroundColor Green

# Instalar tarea diaria
Register-ScheduledTask -TaskName "AltaMedicaBackupDaily" -Xml (Get-Content "daily-backup.xml" | Out-String) -Force
Write-Host "✅ Tarea diaria instalada" -ForegroundColor Green

# Instalar tarea semanal
Register-ScheduledTask -TaskName "AltaMedicaBackupWeekly" -Xml (Get-Content "weekly-backup.xml" | Out-String) -Force
Write-Host "✅ Tarea semanal instalada" -ForegroundColor Green

# Instalar tarea mensual
Register-ScheduledTask -TaskName "AltaMedicaBackupMonthly" -Xml (Get-Content "monthly-backup.xml" | Out-String) -Force
Write-Host "✅ Tarea mensual instalada" -ForegroundColor Green

Write-Host "🎉 Todas las tareas de backup instaladas correctamente" -ForegroundColor Green
Write-Host "📊 Use 'Get-ScheduledTask | Where-Object TaskName -like "*AltaMedica*"' para verificar" -ForegroundColor Yellow