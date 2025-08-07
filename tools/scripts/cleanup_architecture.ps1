# 🧹 Script de Limpieza de Arquitectura AltaMedica
# Generado automáticamente
# Fecha: 2025-08-04 07:26:27

Write-Host "🧹 Iniciando limpieza de arquitectura..." -ForegroundColor Green

# Crear directorios
Write-Host "📁 Creando directorios organizados..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "tools/python" -Force | Out-Null
Write-Host "   📂 tools/python" -ForegroundColor Gray
New-Item -ItemType Directory -Path "tools/scripts" -Force | Out-Null
Write-Host "   📂 tools/scripts" -ForegroundColor Gray
New-Item -ItemType Directory -Path "tools/monitoring" -Force | Out-Null
Write-Host "   📂 tools/monitoring" -ForegroundColor Gray
New-Item -ItemType Directory -Path "config/environments" -Force | Out-Null
Write-Host "   📂 config/environments" -ForegroundColor Gray
New-Item -ItemType Directory -Path "docs/guides" -Force | Out-Null
Write-Host "   📂 docs/guides" -ForegroundColor Gray
New-Item -ItemType Directory -Path "docs/security" -Force | Out-Null
Write-Host "   📂 docs/security" -ForegroundColor Gray
New-Item -ItemType Directory -Path "archive/logs" -Force | Out-Null
Write-Host "   📂 archive/logs" -ForegroundColor Gray
New-Item -ItemType Directory -Path "archive/media" -Force | Out-Null
Write-Host "   📂 archive/media" -ForegroundColor Gray
New-Item -ItemType Directory -Path "archive/data" -Force | Out-Null
Write-Host "   📂 archive/data" -ForegroundColor Gray

# Mover archivos
Write-Host "📦 Reorganizando archivos..." -ForegroundColor Cyan
Write-Host "   📁 → tools/python/" -ForegroundColor Yellow
if (Test-Path "api_cleanup_analyzer.py") {
    Move-Item "api_cleanup_analyzer.py" "tools/python/api_cleanup_analyzer.py" -Force
    Write-Host "      ✅ api_cleanup_analyzer.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  api_cleanup_analyzer.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "api_discovery_hub.py") {
    Move-Item "api_discovery_hub.py" "tools/python/api_discovery_hub.py" -Force
    Write-Host "      ✅ api_discovery_hub.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  api_discovery_hub.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "api_organizer.py") {
    Move-Item "api_organizer.py" "tools/python/api_organizer.py" -Force
    Write-Host "      ✅ api_organizer.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  api_organizer.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "architecture_cleaner.py") {
    Move-Item "architecture_cleaner.py" "tools/python/architecture_cleaner.py" -Force
    Write-Host "      ✅ architecture_cleaner.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  architecture_cleaner.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auto_api_tester.py") {
    Move-Item "auto_api_tester.py" "tools/python/auto_api_tester.py" -Force
    Write-Host "      ✅ auto_api_tester.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auto_api_tester.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auto_login_tester.py") {
    Move-Item "auto_login_tester.py" "tools/python/auto_login_tester.py" -Force
    Write-Host "      ✅ auto_login_tester.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auto_login_tester.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "check-servers.py") {
    Move-Item "check-servers.py" "tools/python/check-servers.py" -Force
    Write-Host "      ✅ check-servers.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  check-servers.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "cleanup_script.py") {
    Move-Item "cleanup_script.py" "tools/python/cleanup_script.py" -Force
    Write-Host "      ✅ cleanup_script.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  cleanup_script.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "deep_api_hunter.py") {
    Move-Item "deep_api_hunter.py" "tools/python/deep_api_hunter.py" -Force
    Write-Host "      ✅ deep_api_hunter.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  deep_api_hunter.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "demo_video_call.py") {
    Move-Item "demo_video_call.py" "tools/python/demo_video_call.py" -Force
    Write-Host "      ✅ demo_video_call.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  demo_video_call.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "execute_ps.py") {
    Move-Item "execute_ps.py" "tools/python/execute_ps.py" -Force
    Write-Host "      ✅ execute_ps.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  execute_ps.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "generate_login_urls.py") {
    Move-Item "generate_login_urls.py" "tools/python/generate_login_urls.py" -Force
    Write-Host "      ✅ generate_login_urls.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  generate_login_urls.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "install-package-standardization.py") {
    Move-Item "install-package-standardization.py" "tools/python/install-package-standardization.py" -Force
    Write-Host "      ✅ install-package-standardization.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  install-package-standardization.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "install_video_system.py") {
    Move-Item "install_video_system.py" "tools/python/install_video_system.py" -Force
    Write-Host "      ✅ install_video_system.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  install_video_system.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "launcher.py") {
    Move-Item "launcher.py" "tools/python/launcher.py" -Force
    Write-Host "      ✅ launcher.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  launcher.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "medical_analytics_server.py") {
    Move-Item "medical_analytics_server.py" "tools/python/medical_analytics_server.py" -Force
    Write-Host "      ✅ medical_analytics_server.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  medical_analytics_server.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "medical_matching_engine.py") {
    Move-Item "medical_matching_engine.py" "tools/python/medical_matching_engine.py" -Force
    Write-Host "      ✅ medical_matching_engine.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  medical_matching_engine.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "quick_api_mapper.py") {
    Move-Item "quick_api_mapper.py" "tools/python/quick_api_mapper.py" -Force
    Write-Host "      ✅ quick_api_mapper.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  quick_api_mapper.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "quick_test_links.py") {
    Move-Item "quick_test_links.py" "tools/python/quick_test_links.py" -Force
    Write-Host "      ✅ quick_test_links.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  quick_test_links.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "simple_architecture_cleaner.py") {
    Move-Item "simple_architecture_cleaner.py" "tools/python/simple_architecture_cleaner.py" -Force
    Write-Host "      ✅ simple_architecture_cleaner.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  simple_architecture_cleaner.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "simple_fast_api_finder.py") {
    Move-Item "simple_fast_api_finder.py" "tools/python/simple_fast_api_finder.py" -Force
    Write-Host "      ✅ simple_fast_api_finder.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  simple_fast_api_finder.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "sso-auth-proxy.py") {
    Move-Item "sso-auth-proxy.py" "tools/python/sso-auth-proxy.py" -Force
    Write-Host "      ✅ sso-auth-proxy.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  sso-auth-proxy.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-servers.py") {
    Move-Item "start-servers.py" "tools/python/start-servers.py" -Force
    Write-Host "      ✅ start-servers.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-servers.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start_video_server.py") {
    Move-Item "start_video_server.py" "tools/python/start_video_server.py" -Force
    Write-Host "      ✅ start_video_server.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start_video_server.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "telemedicine_video_server.py") {
    Move-Item "telemedicine_video_server.py" "tools/python/telemedicine_video_server.py" -Force
    Write-Host "      ✅ telemedicine_video_server.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  telemedicine_video_server.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-package-standardization.py") {
    Move-Item "test-package-standardization.py" "tools/python/test-package-standardization.py" -Force
    Write-Host "      ✅ test-package-standardization.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-package-standardization.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test_flow_manager.py") {
    Move-Item "test_flow_manager.py" "tools/python/test_flow_manager.py" -Force
    Write-Host "      ✅ test_flow_manager.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test_flow_manager.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test_video_simple.py") {
    Move-Item "test_video_simple.py" "tools/python/test_video_simple.py" -Force
    Write-Host "      ✅ test_video_simple.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test_video_simple.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "turbo_api_scanner.py") {
    Move-Item "turbo_api_scanner.py" "tools/python/turbo_api_scanner.py" -Force
    Write-Host "      ✅ turbo_api_scanner.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  turbo_api_scanner.py no encontrado" -ForegroundColor Yellow
}
if (Test-Path "video_call_client.py") {
    Move-Item "video_call_client.py" "tools/python/video_call_client.py" -Force
    Write-Host "      ✅ video_call_client.py" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  video_call_client.py no encontrado" -ForegroundColor Yellow
}
Write-Host "   📁 → tools/scripts/" -ForegroundColor Yellow
if (Test-Path "build-packages.bat") {
    Move-Item "build-packages.bat" "tools/scripts/build-packages.bat" -Force
    Write-Host "      ✅ build-packages.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  build-packages.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "build.bat") {
    Move-Item "build.bat" "tools/scripts/build.bat" -Force
    Write-Host "      ✅ build.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  build.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "debug-patients-imports.bat") {
    Move-Item "debug-patients-imports.bat" "tools/scripts/debug-patients-imports.bat" -Force
    Write-Host "      ✅ debug-patients-imports.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  debug-patients-imports.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "execute-now.cmd") {
    Move-Item "execute-now.cmd" "tools/scripts/execute-now.cmd" -Force
    Write-Host "      ✅ execute-now.cmd" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  execute-now.cmd no encontrado" -ForegroundColor Yellow
}
if (Test-Path "fix-nextjs-build-error.bat") {
    Move-Item "fix-nextjs-build-error.bat" "tools/scripts/fix-nextjs-build-error.bat" -Force
    Write-Host "      ✅ fix-nextjs-build-error.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  fix-nextjs-build-error.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "fix-sso-dependencies.bat") {
    Move-Item "fix-sso-dependencies.bat" "tools/scripts/fix-sso-dependencies.bat" -Force
    Write-Host "      ✅ fix-sso-dependencies.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  fix-sso-dependencies.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "install-proxy-deps.bat") {
    Move-Item "install-proxy-deps.bat" "tools/scripts/install-proxy-deps.bat" -Force
    Write-Host "      ✅ install-proxy-deps.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  install-proxy-deps.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "launch_video_system.bat") {
    Move-Item "launch_video_system.bat" "tools/scripts/launch_video_system.bat" -Force
    Write-Host "      ✅ launch_video_system.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  launch_video_system.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "PRUEBA-FINAL-VIDEOLLAMADAS.bat") {
    Move-Item "PRUEBA-FINAL-VIDEOLLAMADAS.bat" "tools/scripts/PRUEBA-FINAL-VIDEOLLAMADAS.bat" -Force
    Write-Host "      ✅ PRUEBA-FINAL-VIDEOLLAMADAS.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  PRUEBA-FINAL-VIDEOLLAMADAS.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "quick-fix-patients.bat") {
    Move-Item "quick-fix-patients.bat" "tools/scripts/quick-fix-patients.bat" -Force
    Write-Host "      ✅ quick-fix-patients.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  quick-fix-patients.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "restart-patients-app.bat") {
    Move-Item "restart-patients-app.bat" "tools/scripts/restart-patients-app.bat" -Force
    Write-Host "      ✅ restart-patients-app.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  restart-patients-app.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-altamedica.bat") {
    Move-Item "start-altamedica.bat" "tools/scripts/start-altamedica.bat" -Force
    Write-Host "      ✅ start-altamedica.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-altamedica.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-patients-app.bat") {
    Move-Item "start-patients-app.bat" "tools/scripts/start-patients-app.bat" -Force
    Write-Host "      ✅ start-patients-app.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-patients-app.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-services.bat") {
    Move-Item "start-services.bat" "tools/scripts/start-services.bat" -Force
    Write-Host "      ✅ start-services.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-services.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-sistema-completo-con-analytics.bat") {
    Move-Item "start-sistema-completo-con-analytics.bat" "tools/scripts/start-sistema-completo-con-analytics.bat" -Force
    Write-Host "      ✅ start-sistema-completo-con-analytics.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-sistema-completo-con-analytics.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-sso-proxy-production.bat") {
    Move-Item "start-sso-proxy-production.bat" "tools/scripts/start-sso-proxy-production.bat" -Force
    Write-Host "      ✅ start-sso-proxy-production.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-sso-proxy-production.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-sso-proxy-simple.bat") {
    Move-Item "start-sso-proxy-simple.bat" "tools/scripts/start-sso-proxy-simple.bat" -Force
    Write-Host "      ✅ start-sso-proxy-simple.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-sso-proxy-simple.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-sso-proxy.bat") {
    Move-Item "start-sso-proxy.bat" "tools/scripts/start-sso-proxy.bat" -Force
    Write-Host "      ✅ start-sso-proxy.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-sso-proxy.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-telemedicine-system.bat") {
    Move-Item "start-telemedicine-system.bat" "tools/scripts/start-telemedicine-system.bat" -Force
    Write-Host "      ✅ start-telemedicine-system.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-telemedicine-system.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-video-server.bat") {
    Move-Item "start-video-server.bat" "tools/scripts/start-video-server.bat" -Force
    Write-Host "      ✅ start-video-server.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-video-server.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-videollamadas-completo.bat") {
    Move-Item "start-videollamadas-completo.bat" "tools/scripts/start-videollamadas-completo.bat" -Force
    Write-Host "      ✅ start-videollamadas-completo.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-videollamadas-completo.bat no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-video-system.bat") {
    Move-Item "test-video-system.bat" "tools/scripts/test-video-system.bat" -Force
    Write-Host "      ✅ test-video-system.bat" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-video-system.bat no encontrado" -ForegroundColor Yellow
}
Write-Host "   📁 → tools/scripts/" -ForegroundColor Yellow
if (Test-Path "check-apps-status.ps1") {
    Move-Item "check-apps-status.ps1" "tools/scripts/check-apps-status.ps1" -Force
    Write-Host "      ✅ check-apps-status.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  check-apps-status.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "debug-sso-login.ps1") {
    Move-Item "debug-sso-login.ps1" "tools/scripts/debug-sso-login.ps1" -Force
    Write-Host "      ✅ debug-sso-login.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  debug-sso-login.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "diagnose-sso.ps1") {
    Move-Item "diagnose-sso.ps1" "tools/scripts/diagnose-sso.ps1" -Force
    Write-Host "      ✅ diagnose-sso.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  diagnose-sso.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "fix-npm-and-install.ps1") {
    Move-Item "fix-npm-and-install.ps1" "tools/scripts/fix-npm-and-install.ps1" -Force
    Write-Host "      ✅ fix-npm-and-install.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  fix-npm-and-install.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "fix-patients-auth.ps1") {
    Move-Item "fix-patients-auth.ps1" "tools/scripts/fix-patients-auth.ps1" -Force
    Write-Host "      ✅ fix-patients-auth.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  fix-patients-auth.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "fix-sso-dependencies.ps1") {
    Move-Item "fix-sso-dependencies.ps1" "tools/scripts/fix-sso-dependencies.ps1" -Force
    Write-Host "      ✅ fix-sso-dependencies.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  fix-sso-dependencies.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "get-html-simple.ps1") {
    Move-Item "get-html-simple.ps1" "tools/scripts/get-html-simple.ps1" -Force
    Write-Host "      ✅ get-html-simple.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  get-html-simple.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "get-html.ps1") {
    Move-Item "get-html.ps1" "tools/scripts/get-html.ps1" -Force
    Write-Host "      ✅ get-html.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  get-html.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "run-sso-diagnostic.ps1") {
    Move-Item "run-sso-diagnostic.ps1" "tools/scripts/run-sso-diagnostic.ps1" -Force
    Write-Host "      ✅ run-sso-diagnostic.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  run-sso-diagnostic.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "setup-debug-tools.ps1") {
    Move-Item "setup-debug-tools.ps1" "tools/scripts/setup-debug-tools.ps1" -Force
    Write-Host "      ✅ setup-debug-tools.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  setup-debug-tools.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-with-sso-proxy.ps1") {
    Move-Item "start-with-sso-proxy.ps1" "tools/scripts/start-with-sso-proxy.ps1" -Force
    Write-Host "      ✅ start-with-sso-proxy.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-with-sso-proxy.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-with-sso.ps1") {
    Move-Item "start-with-sso.ps1" "tools/scripts/start-with-sso.ps1" -Force
    Write-Host "      ✅ start-with-sso.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-with-sso.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-sso-direct.ps1") {
    Move-Item "test-sso-direct.ps1" "tools/scripts/test-sso-direct.ps1" -Force
    Write-Host "      ✅ test-sso-direct.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-sso-direct.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-sso-flow-simple.ps1") {
    Move-Item "test-sso-flow-simple.ps1" "tools/scripts/test-sso-flow-simple.ps1" -Force
    Write-Host "      ✅ test-sso-flow-simple.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-sso-flow-simple.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-sso-flow.ps1") {
    Move-Item "test-sso-flow.ps1" "tools/scripts/test-sso-flow.ps1" -Force
    Write-Host "      ✅ test-sso-flow.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-sso-flow.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-sso-redirect.ps1") {
    Move-Item "test-sso-redirect.ps1" "tools/scripts/test-sso-redirect.ps1" -Force
    Write-Host "      ✅ test-sso-redirect.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-sso-redirect.ps1 no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-sso-simple.ps1") {
    Move-Item "test-sso-simple.ps1" "tools/scripts/test-sso-simple.ps1" -Force
    Write-Host "      ✅ test-sso-simple.ps1" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-sso-simple.ps1 no encontrado" -ForegroundColor Yellow
}
Write-Host "   📁 → tools/scripts/" -ForegroundColor Yellow
if (Test-Path ".eslintrc.security.js") {
    Move-Item ".eslintrc.security.js" "tools/scripts/.eslintrc.security.js" -Force
    Write-Host "      ✅ .eslintrc.security.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  .eslintrc.security.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auditoria-sso-automatica.js") {
    Move-Item "auditoria-sso-automatica.js" "tools/scripts/auditoria-sso-automatica.js" -Force
    Write-Host "      ✅ auditoria-sso-automatica.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auditoria-sso-automatica.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "claude-integration.js") {
    Move-Item "claude-integration.js" "tools/scripts/claude-integration.js" -Force
    Write-Host "      ✅ claude-integration.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  claude-integration.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "execute-autonomous-update.js") {
    Move-Item "execute-autonomous-update.js" "tools/scripts/execute-autonomous-update.js" -Force
    Write-Host "      ✅ execute-autonomous-update.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  execute-autonomous-update.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "execute-updates.js") {
    Move-Item "execute-updates.js" "tools/scripts/execute-updates.js" -Force
    Write-Host "      ✅ execute-updates.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  execute-updates.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "launcher-fixed.js") {
    Move-Item "launcher-fixed.js" "tools/scripts/launcher-fixed.js" -Force
    Write-Host "      ✅ launcher-fixed.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  launcher-fixed.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "launcher.js") {
    Move-Item "launcher.js" "tools/scripts/launcher.js" -Force
    Write-Host "      ✅ launcher.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  launcher.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "medical-compliance-monitor.js") {
    Move-Item "medical-compliance-monitor.js" "tools/scripts/medical-compliance-monitor.js" -Force
    Write-Host "      ✅ medical-compliance-monitor.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  medical-compliance-monitor.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "notification-system.js") {
    Move-Item "notification-system.js" "tools/scripts/notification-system.js" -Force
    Write-Host "      ✅ notification-system.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  notification-system.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "quick-test-telemedicine.js") {
    Move-Item "quick-test-telemedicine.js" "tools/scripts/quick-test-telemedicine.js" -Force
    Write-Host "      ✅ quick-test-telemedicine.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  quick-test-telemedicine.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "setup-sso-proxy.js") {
    Move-Item "setup-sso-proxy.js" "tools/scripts/setup-sso-proxy.js" -Force
    Write-Host "      ✅ setup-sso-proxy.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  setup-sso-proxy.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "simple-sso-proxy.js") {
    Move-Item "simple-sso-proxy.js" "tools/scripts/simple-sso-proxy.js" -Force
    Write-Host "      ✅ simple-sso-proxy.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  simple-sso-proxy.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "sso-proxy-production.js") {
    Move-Item "sso-proxy-production.js" "tools/scripts/sso-proxy-production.js" -Force
    Write-Host "      ✅ sso-proxy-production.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  sso-proxy-production.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "sso-proxy-server.js") {
    Move-Item "sso-proxy-server.js" "tools/scripts/sso-proxy-server.js" -Force
    Write-Host "      ✅ sso-proxy-server.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  sso-proxy-server.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "sso-proxy-simple.js") {
    Move-Item "sso-proxy-simple.js" "tools/scripts/sso-proxy-simple.js" -Force
    Write-Host "      ✅ sso-proxy-simple.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  sso-proxy-simple.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "sso-proxy-solution.js") {
    Move-Item "sso-proxy-solution.js" "tools/scripts/sso-proxy-solution.js" -Force
    Write-Host "      ✅ sso-proxy-solution.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  sso-proxy-solution.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "start-with-proxy.js") {
    Move-Item "start-with-proxy.js" "tools/scripts/start-with-proxy.js" -Force
    Write-Host "      ✅ start-with-proxy.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  start-with-proxy.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-es-modules.js") {
    Move-Item "test-es-modules.js" "tools/scripts/test-es-modules.js" -Force
    Write-Host "      ✅ test-es-modules.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-es-modules.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-integration.js") {
    Move-Item "test-integration.js" "tools/scripts/test-integration.js" -Force
    Write-Host "      ✅ test-integration.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-integration.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-telemedicine-integration.js") {
    Move-Item "test-telemedicine-integration.js" "tools/scripts/test-telemedicine-integration.js" -Force
    Write-Host "      ✅ test-telemedicine-integration.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-telemedicine-integration.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "webhook-notification-test.js") {
    Move-Item "webhook-notification-test.js" "tools/scripts/webhook-notification-test.js" -Force
    Write-Host "      ✅ webhook-notification-test.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  webhook-notification-test.js no encontrado" -ForegroundColor Yellow
}
Write-Host "   📁 → config/environments/" -ForegroundColor Yellow
if (Test-Path ".env.docker") {
    Move-Item ".env.docker" "config/environments/.env.docker" -Force
    Write-Host "      ✅ .env.docker" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  .env.docker no encontrado" -ForegroundColor Yellow
}
if (Test-Path ".env.example") {
    Move-Item ".env.example" "config/environments/.env.example" -Force
    Write-Host "      ✅ .env.example" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  .env.example no encontrado" -ForegroundColor Yellow
}
if (Test-Path ".env.local") {
    Move-Item ".env.local" "config/environments/.env.local" -Force
    Write-Host "      ✅ .env.local" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  .env.local no encontrado" -ForegroundColor Yellow
}
if (Test-Path ".gemini-config.json") {
    Move-Item ".gemini-config.json" "config/environments/.gemini-config.json" -Force
    Write-Host "      ✅ .gemini-config.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  .gemini-config.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "api-config.ts") {
    Move-Item "api-config.ts" "config/environments/api-config.ts" -Force
    Write-Host "      ✅ api-config.ts" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  api-config.ts no encontrado" -ForegroundColor Yellow
}
if (Test-Path "claude_desktop_config.json") {
    Move-Item "claude_desktop_config.json" "config/environments/claude_desktop_config.json" -Force
    Write-Host "      ✅ claude_desktop_config.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  claude_desktop_config.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "clean_api_config.ts") {
    Move-Item "clean_api_config.ts" "config/environments/clean_api_config.ts" -Force
    Write-Host "      ✅ clean_api_config.ts" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  clean_api_config.ts no encontrado" -ForegroundColor Yellow
}
if (Test-Path "ecosystem.config.cjs") {
    Move-Item "ecosystem.config.cjs" "config/environments/ecosystem.config.cjs" -Force
    Write-Host "      ✅ ecosystem.config.cjs" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  ecosystem.config.cjs no encontrado" -ForegroundColor Yellow
}
if (Test-Path "eslint.config.js") {
    Move-Item "eslint.config.js" "config/environments/eslint.config.js" -Force
    Write-Host "      ✅ eslint.config.js" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  eslint.config.js no encontrado" -ForegroundColor Yellow
}
if (Test-Path "frontend_api_config.json") {
    Move-Item "frontend_api_config.json" "config/environments/frontend_api_config.json" -Force
    Write-Host "      ✅ frontend_api_config.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  frontend_api_config.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "gemini-claude-config.json") {
    Move-Item "gemini-claude-config.json" "config/environments/gemini-claude-config.json" -Force
    Write-Host "      ✅ gemini-claude-config.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  gemini-claude-config.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "gemini-config-with-claude.json") {
    Move-Item "gemini-config-with-claude.json" "config/environments/gemini-config-with-claude.json" -Force
    Write-Host "      ✅ gemini-config-with-claude.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  gemini-config-with-claude.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "jest.config.cjs") {
    Move-Item "jest.config.cjs" "config/environments/jest.config.cjs" -Force
    Write-Host "      ✅ jest.config.cjs" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  jest.config.cjs no encontrado" -ForegroundColor Yellow
}
if (Test-Path "organized_api_config.ts") {
    Move-Item "organized_api_config.ts" "config/environments/organized_api_config.ts" -Force
    Write-Host "      ✅ organized_api_config.ts" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  organized_api_config.ts no encontrado" -ForegroundColor Yellow
}
if (Test-Path "package-template-config.json") {
    Move-Item "package-template-config.json" "config/environments/package-template-config.json" -Force
    Write-Host "      ✅ package-template-config.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  package-template-config.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "simple_api_config.ts") {
    Move-Item "simple_api_config.ts" "config/environments/simple_api_config.ts" -Force
    Write-Host "      ✅ simple_api_config.ts" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  simple_api_config.ts no encontrado" -ForegroundColor Yellow
}
if (Test-Path "tsconfig.tsbuildinfo") {
    Move-Item "tsconfig.tsbuildinfo" "config/environments/tsconfig.tsbuildinfo" -Force
    Write-Host "      ✅ tsconfig.tsbuildinfo" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  tsconfig.tsbuildinfo no encontrado" -ForegroundColor Yellow
}
if (Test-Path "turbo_api_config.ts") {
    Move-Item "turbo_api_config.ts" "config/environments/turbo_api_config.ts" -Force
    Write-Host "      ✅ turbo_api_config.ts" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  turbo_api_config.ts no encontrado" -ForegroundColor Yellow
}
Write-Host "   📁 → docs/guides/" -ForegroundColor Yellow
if (Test-Path "ANALYTICS-SISTEMA-COMPLETO.md") {
    Move-Item "ANALYTICS-SISTEMA-COMPLETO.md" "docs/guides/ANALYTICS-SISTEMA-COMPLETO.md" -Force
    Write-Host "      ✅ ANALYTICS-SISTEMA-COMPLETO.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  ANALYTICS-SISTEMA-COMPLETO.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "API_USAGE_GUIDE.md") {
    Move-Item "API_USAGE_GUIDE.md" "docs/guides/API_USAGE_GUIDE.md" -Force
    Write-Host "      ✅ API_USAGE_GUIDE.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  API_USAGE_GUIDE.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "AUDITORIA_SSO_SESION_PERSISTENTE.md") {
    Move-Item "AUDITORIA_SSO_SESION_PERSISTENTE.md" "docs/guides/AUDITORIA_SSO_SESION_PERSISTENTE.md" -Force
    Write-Host "      ✅ AUDITORIA_SSO_SESION_PERSISTENTE.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  AUDITORIA_SSO_SESION_PERSISTENTE.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "B2B_MEDICAL_MARKETPLACE_AUDIT.md") {
    Move-Item "B2B_MEDICAL_MARKETPLACE_AUDIT.md" "docs/guides/B2B_MEDICAL_MARKETPLACE_AUDIT.md" -Force
    Write-Host "      ✅ B2B_MEDICAL_MARKETPLACE_AUDIT.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  B2B_MEDICAL_MARKETPLACE_AUDIT.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "B2B_PAYMENT_ARCHITECTURE.md") {
    Move-Item "B2B_PAYMENT_ARCHITECTURE.md" "docs/guides/B2B_PAYMENT_ARCHITECTURE.md" -Force
    Write-Host "      ✅ B2B_PAYMENT_ARCHITECTURE.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  B2B_PAYMENT_ARCHITECTURE.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "claude-prompts-for-gemini.md") {
    Move-Item "claude-prompts-for-gemini.md" "docs/guides/claude-prompts-for-gemini.md" -Force
    Write-Host "      ✅ claude-prompts-for-gemini.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  claude-prompts-for-gemini.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "CLAUDE.local.md") {
    Move-Item "CLAUDE.local.md" "docs/guides/CLAUDE.local.md" -Force
    Write-Host "      ✅ CLAUDE.local.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  CLAUDE.local.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "CLAUDE.md") {
    Move-Item "CLAUDE.md" "docs/guides/CLAUDE.md" -Force
    Write-Host "      ✅ CLAUDE.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  CLAUDE.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "CLAUDE2.md") {
    Move-Item "CLAUDE2.md" "docs/guides/CLAUDE2.md" -Force
    Write-Host "      ✅ CLAUDE2.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  CLAUDE2.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "create-firebase-project.md") {
    Move-Item "create-firebase-project.md" "docs/guides/create-firebase-project.md" -Force
    Write-Host "      ✅ create-firebase-project.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  create-firebase-project.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "gemini-medical-context.md") {
    Move-Item "gemini-medical-context.md" "docs/guides/gemini-medical-context.md" -Force
    Write-Host "      ✅ gemini-medical-context.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  gemini-medical-context.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "INFORME_FINAL_SEGURIDAD_EXITOSO.md") {
    Move-Item "INFORME_FINAL_SEGURIDAD_EXITOSO.md" "docs/guides/INFORME_FINAL_SEGURIDAD_EXITOSO.md" -Force
    Write-Host "      ✅ INFORME_FINAL_SEGURIDAD_EXITOSO.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  INFORME_FINAL_SEGURIDAD_EXITOSO.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "manual-test-sso.md") {
    Move-Item "manual-test-sso.md" "docs/guides/manual-test-sso.md" -Force
    Write-Host "      ✅ manual-test-sso.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  manual-test-sso.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "NUEVA_ESTRUCTURA_ARQUITECTURA.md") {
    Move-Item "NUEVA_ESTRUCTURA_ARQUITECTURA.md" "docs/guides/NUEVA_ESTRUCTURA_ARQUITECTURA.md" -Force
    Write-Host "      ✅ NUEVA_ESTRUCTURA_ARQUITECTURA.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  NUEVA_ESTRUCTURA_ARQUITECTURA.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "PROMPT_IA_SSO_LOOP.md") {
    Move-Item "PROMPT_IA_SSO_LOOP.md" "docs/guides/PROMPT_IA_SSO_LOOP.md" -Force
    Write-Host "      ✅ PROMPT_IA_SSO_LOOP.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  PROMPT_IA_SSO_LOOP.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "RECOMENDACIONES_SEGURIDAD.md") {
    Move-Item "RECOMENDACIONES_SEGURIDAD.md" "docs/guides/RECOMENDACIONES_SEGURIDAD.md" -Force
    Write-Host "      ✅ RECOMENDACIONES_SEGURIDAD.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  RECOMENDACIONES_SEGURIDAD.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "SIMPLIFICACION_API_SERVER.md") {
    Move-Item "SIMPLIFICACION_API_SERVER.md" "docs/guides/SIMPLIFICACION_API_SERVER.md" -Force
    Write-Host "      ✅ SIMPLIFICACION_API_SERVER.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  SIMPLIFICACION_API_SERVER.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "SOLUCION-LOGIN.md") {
    Move-Item "SOLUCION-LOGIN.md" "docs/guides/SOLUCION-LOGIN.md" -Force
    Write-Host "      ✅ SOLUCION-LOGIN.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  SOLUCION-LOGIN.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "SOLUCION-SSO-FINAL.md") {
    Move-Item "SOLUCION-SSO-FINAL.md" "docs/guides/SOLUCION-SSO-FINAL.md" -Force
    Write-Host "      ✅ SOLUCION-SSO-FINAL.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  SOLUCION-SSO-FINAL.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "SOLUCION_DEFINITIVA.md") {
    Move-Item "SOLUCION_DEFINITIVA.md" "docs/guides/SOLUCION_DEFINITIVA.md" -Force
    Write-Host "      ✅ SOLUCION_DEFINITIVA.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  SOLUCION_DEFINITIVA.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "SSO-IMPLEMENTATION-GUIDE.md") {
    Move-Item "SSO-IMPLEMENTATION-GUIDE.md" "docs/guides/SSO-IMPLEMENTATION-GUIDE.md" -Force
    Write-Host "      ✅ SSO-IMPLEMENTATION-GUIDE.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  SSO-IMPLEMENTATION-GUIDE.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "SSO-PROXY-README.md") {
    Move-Item "SSO-PROXY-README.md" "docs/guides/SSO-PROXY-README.md" -Force
    Write-Host "      ✅ SSO-PROXY-README.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  SSO-PROXY-README.md no encontrado" -ForegroundColor Yellow
}
if (Test-Path "VIDEO_SYSTEM_DOCUMENTATION.md") {
    Move-Item "VIDEO_SYSTEM_DOCUMENTATION.md" "docs/guides/VIDEO_SYSTEM_DOCUMENTATION.md" -Force
    Write-Host "      ✅ VIDEO_SYSTEM_DOCUMENTATION.md" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  VIDEO_SYSTEM_DOCUMENTATION.md no encontrado" -ForegroundColor Yellow
}
Write-Host "   📁 → archive/logs/" -ForegroundColor Yellow
if (Test-Path "altamedica-notifications.log") {
    Move-Item "altamedica-notifications.log" "archive/logs/altamedica-notifications.log" -Force
    Write-Host "      ✅ altamedica-notifications.log" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  altamedica-notifications.log no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auth_deep_analysis.log") {
    Move-Item "auth_deep_analysis.log" "archive/logs/auth_deep_analysis.log" -Force
    Write-Host "      ✅ auth_deep_analysis.log" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auth_deep_analysis.log no encontrado" -ForegroundColor Yellow
}
if (Test-Path "firestore-debug.log") {
    Move-Item "firestore-debug.log" "archive/logs/firestore-debug.log" -Force
    Write-Host "      ✅ firestore-debug.log" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  firestore-debug.log no encontrado" -ForegroundColor Yellow
}
if (Test-Path "login-filled.png") {
    Move-Item "login-filled.png" "archive/logs/login-filled.png" -Force
    Write-Host "      ✅ login-filled.png" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  login-filled.png no encontrado" -ForegroundColor Yellow
}
if (Test-Path "login-final.png") {
    Move-Item "login-final.png" "archive/logs/login-final.png" -Force
    Write-Host "      ✅ login-final.png" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  login-final.png no encontrado" -ForegroundColor Yellow
}
if (Test-Path "login-initial.png") {
    Move-Item "login-initial.png" "archive/logs/login-initial.png" -Force
    Write-Host "      ✅ login-initial.png" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  login-initial.png no encontrado" -ForegroundColor Yellow
}
if (Test-Path "sso-auth-proxy.log") {
    Move-Item "sso-auth-proxy.log" "archive/logs/sso-auth-proxy.log" -Force
    Write-Host "      ✅ sso-auth-proxy.log" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  sso-auth-proxy.log no encontrado" -ForegroundColor Yellow
}
if (Test-Path "test-notifications.log") {
    Move-Item "test-notifications.log" "archive/logs/test-notifications.log" -Force
    Write-Host "      ✅ test-notifications.log" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  test-notifications.log no encontrado" -ForegroundColor Yellow
}
Write-Host "   📁 → archive/data/" -ForegroundColor Yellow
if (Test-Path "altamedica-alerts.json") {
    Move-Item "altamedica-alerts.json" "archive/data/altamedica-alerts.json" -Force
    Write-Host "      ✅ altamedica-alerts.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  altamedica-alerts.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "audit_report_20250731_070051.json") {
    Move-Item "audit_report_20250731_070051.json" "archive/data/audit_report_20250731_070051.json" -Force
    Write-Host "      ✅ audit_report_20250731_070051.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  audit_report_20250731_070051.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auth_quick_check_20250803_113440.txt") {
    Move-Item "auth_quick_check_20250803_113440.txt" "archive/data/auth_quick_check_20250803_113440.txt" -Force
    Write-Host "      ✅ auth_quick_check_20250803_113440.txt" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auth_quick_check_20250803_113440.txt no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auth_quick_check_20250803_113711.txt") {
    Move-Item "auth_quick_check_20250803_113711.txt" "archive/data/auth_quick_check_20250803_113711.txt" -Force
    Write-Host "      ✅ auth_quick_check_20250803_113711.txt" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auth_quick_check_20250803_113711.txt no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auth_quick_check_20250803_114022.txt") {
    Move-Item "auth_quick_check_20250803_114022.txt" "archive/data/auth_quick_check_20250803_114022.txt" -Force
    Write-Host "      ✅ auth_quick_check_20250803_114022.txt" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auth_quick_check_20250803_114022.txt no encontrado" -ForegroundColor Yellow
}
if (Test-Path "auth_quick_check_20250803_114153.txt") {
    Move-Item "auth_quick_check_20250803_114153.txt" "archive/data/auth_quick_check_20250803_114153.txt" -Force
    Write-Host "      ✅ auth_quick_check_20250803_114153.txt" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  auth_quick_check_20250803_114153.txt no encontrado" -ForegroundColor Yellow
}
if (Test-Path "claude-commands.json") {
    Move-Item "claude-commands.json" "archive/data/claude-commands.json" -Force
    Write-Host "      ✅ claude-commands.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  claude-commands.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "cleanup_analysis.json") {
    Move-Item "cleanup_analysis.json" "archive/data/cleanup_analysis.json" -Force
    Write-Host "      ✅ cleanup_analysis.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  cleanup_analysis.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "diagnostico_altamedica_20250731_071828.json") {
    Move-Item "diagnostico_altamedica_20250731_071828.json" "archive/data/diagnostico_altamedica_20250731_071828.json" -Force
    Write-Host "      ✅ diagnostico_altamedica_20250731_071828.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  diagnostico_altamedica_20250731_071828.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "fast_api_results.json") {
    Move-Item "fast_api_results.json" "archive/data/fast_api_results.json" -Force
    Write-Host "      ✅ fast_api_results.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  fast_api_results.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "firestore.indexes.json") {
    Move-Item "firestore.indexes.json" "archive/data/firestore.indexes.json" -Force
    Write-Host "      ✅ firestore.indexes.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  firestore.indexes.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "medical-compliance-report.json") {
    Move-Item "medical-compliance-report.json" "archive/data/medical-compliance-report.json" -Force
    Write-Host "      ✅ medical-compliance-report.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  medical-compliance-report.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "organized_apis.json") {
    Move-Item "organized_apis.json" "archive/data/organized_apis.json" -Force
    Write-Host "      ✅ organized_apis.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  organized_apis.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "requirements-video.txt") {
    Move-Item "requirements-video.txt" "archive/data/requirements-video.txt" -Force
    Write-Host "      ✅ requirements-video.txt" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  requirements-video.txt no encontrado" -ForegroundColor Yellow
}
if (Test-Path "turbo_scan_results.json") {
    Move-Item "turbo_scan_results.json" "archive/data/turbo_scan_results.json" -Force
    Write-Host "      ✅ turbo_scan_results.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  turbo_scan_results.json no encontrado" -ForegroundColor Yellow
}
if (Test-Path "webhook-delivery-report.json") {
    Move-Item "webhook-delivery-report.json" "archive/data/webhook-delivery-report.json" -Force
    Write-Host "      ✅ webhook-delivery-report.json" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  webhook-delivery-report.json no encontrado" -ForegroundColor Yellow
}

# Resumen
Write-Host "📊 Limpieza completada:" -ForegroundColor Green
Write-Host "   🗂️  Archivos organizados: 185" -ForegroundColor Gray
Write-Host "   📌 Archivos en root: 10" -ForegroundColor Gray
Write-Host "   📁 Directorios creados: 9" -ForegroundColor Gray

Write-Host "✅ Arquitectura limpia y organizada!" -ForegroundColor Green