# DASHBOARD TIEMPO REAL - DEVALTAMEDICA MCP MONITOR

function Show-Dashboard {
    while ($true) {
        Clear-Host
        
        Write-Host "DEVALTAMEDICA MCP MONITOR - DASHBOARD TIEMPO REAL" -ForegroundColor Green
        Write-Host "=================================================" -ForegroundColor Green
        Write-Host "Actualizado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
        Write-Host ""
        
        # Estado del proceso
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if ($nodeProcesses) {
            Write-Host "ESTADO: MONITOR ACTIVO" -ForegroundColor Green
            Write-Host "Procesos Node.js: $($nodeProcesses.Count)" -ForegroundColor White
        } else {
            Write-Host "ESTADO: MONITOR INACTIVO" -ForegroundColor Red
        }
        Write-Host ""
        
        # Verificar archivos de log
        $logsDir = ".\logs"
        if (Test-Path $logsDir) {
            Write-Host "ARCHIVOS DE LOG:" -ForegroundColor Cyan
            Write-Host "===============" -ForegroundColor Cyan
            
            $logFiles = Get-ChildItem -Path $logsDir -Filter "*.log" | Sort-Object LastWriteTime -Descending
            
            foreach ($file in $logFiles | Select-Object -First 8) {
                $size = [math]::Round($file.Length / 1KB, 2)
                $lastWrite = $file.LastWriteTime.ToString("HH:mm:ss")
                $color = "White"
                
                # Colorear según la edad del archivo
                $age = (Get-Date) - $file.LastWriteTime
                if ($age.TotalMinutes -lt 2) {
                    $color = "Green"  # Muy reciente
                } elseif ($age.TotalMinutes -lt 10) {
                    $color = "Yellow" # Reciente
                }
                
                Write-Host "  $($file.Name) - ${size}KB - $lastWrite" -ForegroundColor $color
            }
        }
        
        Write-Host ""
        
        # Leer último reporte de inteligencia
        $intelligenceFile = ".\logs\intelligence-reports.log"
        if (Test-Path $intelligenceFile) {
            Write-Host "ULTIMO REPORTE DE INTELIGENCIA:" -ForegroundColor Cyan
            Write-Host "===============================" -ForegroundColor Cyan
            
            $lastReport = Get-Content $intelligenceFile -Tail 10 | Where-Object { $_ -match '"systemHealth"' } | Select-Object -Last 1
            if ($lastReport) {
                try {
                    # Extraer métricas principales
                    $healthMatch = $lastReport | Select-String '"systemHealth":\s*([0-9.]+)'
                    $perfMatch = $lastReport | Select-String '"averagePerformance":\s*([0-9.]+)'
                    $collabMatch = $lastReport | Select-String '"collaborationIndex":\s*([0-9.]+)'
                    
                    if ($healthMatch) {
                        $health = [math]::Round([float]$healthMatch.Matches[0].Groups[1].Value, 1)
                        Write-Host "  Salud del Sistema: $health%" -ForegroundColor $(if($health -gt 90) {"Green"} elseif($health -gt 75) {"Yellow"} else {"Red"})
                    }
                    
                    if ($perfMatch) {
                        $perf = [math]::Round([float]$perfMatch.Matches[0].Groups[1].Value, 1)
                        Write-Host "  Performance Promedio: $perf%" -ForegroundColor $(if($perf -gt 85) {"Green"} elseif($perf -gt 70) {"Yellow"} else {"Red"})
                    }
                    
                    if ($collabMatch) {
                        $collab = [math]::Round([float]$collabMatch.Matches[0].Groups[1].Value, 1)
                        Write-Host "  Indice Colaboracion: $collab%" -ForegroundColor $(if($collab -gt 80) {"Green"} elseif($collab -gt 65) {"Yellow"} else {"Red"})
                    }
                } catch {
                    Write-Host "  Error parseando reporte" -ForegroundColor Red
                }
            } else {
                Write-Host "  No hay reportes disponibles" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        
        # Leer últimas métricas de plataforma
        $platformFile = ".\logs\platform-monitoring.log"
        if (Test-Path $platformFile) {
            Write-Host "METRICAS DE PLATAFORMA:" -ForegroundColor Cyan
            Write-Host "======================" -ForegroundColor Cyan
            
            $lastMetrics = Get-Content $platformFile -Tail 15 | Where-Object { $_ -match '"api_response_time"' } | Select-Object -Last 1
            if ($lastMetrics) {
                try {
                    # Extraer métricas clave
                    $apiMatch = $lastMetrics | Select-String '"api_response_time":\s*([0-9.]+)'
                    $dbMatch = $lastMetrics | Select-String '"database_performance":\s*([0-9.]+)'
                    $errorMatch = $lastMetrics | Select-String '"error_rate":\s*([0-9.]+)'
                    $hipaaMatch = $lastMetrics | Select-String '"hipaa_compliance_score":\s*([0-9.]+)'
                    $usersMatch = $lastMetrics | Select-String '"active_users":\s*([0-9]+)'
                    
                    if ($apiMatch) {
                        $apiTime = [math]::Round([float]$apiMatch.Matches[0].Groups[1].Value, 1)
                        Write-Host "  API Response Time: ${apiTime}ms" -ForegroundColor $(if($apiTime -lt 100) {"Green"} elseif($apiTime -lt 200) {"Yellow"} else {"Red"})
                    }
                    
                    if ($dbMatch) {
                        $dbPerf = [math]::Round([float]$dbMatch.Matches[0].Groups[1].Value, 1)
                        Write-Host "  Database Performance: $dbPerf%" -ForegroundColor $(if($dbPerf -gt 90) {"Green"} elseif($dbPerf -gt 75) {"Yellow"} else {"Red"})
                    }
                    
                    if ($errorMatch) {
                        $errorRate = [math]::Round([float]$errorMatch.Matches[0].Groups[1].Value, 2)
                        Write-Host "  Error Rate: $errorRate%" -ForegroundColor $(if($errorRate -lt 1) {"Green"} elseif($errorRate -lt 3) {"Yellow"} else {"Red"})
                    }
                    
                    if ($hipaaMatch) {
                        $hipaa = [math]::Round([float]$hipaaMatch.Matches[0].Groups[1].Value, 1)
                        Write-Host "  HIPAA Compliance: $hipaa%" -ForegroundColor $(if($hipaa -gt 95) {"Green"} elseif($hipaa -gt 90) {"Yellow"} else {"Red"})
                    }
                    
                    if ($usersMatch) {
                        $users = $usersMatch.Matches[0].Groups[1].Value
                        Write-Host "  Usuarios Activos: $users" -ForegroundColor White
                    }
                } catch {
                    Write-Host "  Error parseando metricas" -ForegroundColor Red
                }
            } else {
                Write-Host "  No hay metricas disponibles" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        
        # Verificar alertas
        $alertsFile = ".\logs\alerts.log"
        if (Test-Path $alertsFile) {
            $alertsContent = Get-Content $alertsFile -ErrorAction SilentlyContinue
            if ($alertsContent) {
                $recentAlerts = $alertsContent | Select-Object -Last 5
                if ($recentAlerts.Count -gt 0) {
                    Write-Host "ALERTAS RECIENTES:" -ForegroundColor Red
                    Write-Host "=================" -ForegroundColor Red
                    foreach ($alert in $recentAlerts) {
                        if ($alert -match '\[(.*?)\].*"type":\s*"([^"]+)"') {
                            $time = ([DateTime]$matches[1]).ToString("HH:mm:ss")
                            $type = $matches[2]
                            Write-Host "  $time - $type" -ForegroundColor Red
                        }
                    }
                    Write-Host ""
                }
            }
        }
        
        Write-Host "CONTROLES:" -ForegroundColor Yellow
        Write-Host "==========" -ForegroundColor Yellow
        Write-Host "  [Ctrl+C] - Salir del dashboard" -ForegroundColor Gray
        Write-Host "  node mcp-monitor-24-7.cjs logs [tipo] - Ver logs especificos" -ForegroundColor Gray
        Write-Host "  Get-Process node | Stop-Process -Force - Detener monitor" -ForegroundColor Gray
        
        Write-Host ""
        Write-Host "Actualizando en 15 segundos..." -ForegroundColor Gray
        
        Start-Sleep -Seconds 15
    }
}

try {
    Show-Dashboard
} catch {
    Write-Host "`nDashboard cerrado." -ForegroundColor Yellow
}
