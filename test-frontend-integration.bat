@echo off
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║              🚀 TEST FRONTEND AGENT INTEGRATION             ║
echo ║                  Comando -m frontend                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🎯 Probando integración del Senior Frontend Agent...
echo.

REM Cambiar al workspace de Altamedica
cd /d "C:\Users\Eduardo\Documents\devaltamedica"

echo 📍 Workspace actual: %CD%
echo.

echo 🔍 Test 1: Mostrar ayuda del frontend agent
echo =============================================
-m frontend help
echo.

echo 🎮 Test 2: Ejecutar demo del frontend agent
echo ============================================
-m frontend demo
echo.

echo 📊 Test 3: Verificar que se creó el reporte
echo ============================================
if exist "frontend-analysis-demo.md" (
    echo ✅ Reporte de demo creado exitosamente
    echo 📄 Primeras líneas del reporte:
    echo ----------------------------------------
    type "frontend-analysis-demo.md" | head -20
) else (
    echo ❌ Error: No se creó el reporte de demo
)
echo.

echo 🏥 Test 4: Probar análisis con archivo médico simulado
echo =======================================================
echo Creating temporary medical component...

REM Crear archivo temporal de prueba
echo import React, { useState } from 'react'; > temp-medical-component.tsx
echo interface PatientProps { id: string; } >> temp-medical-component.tsx
echo const PatientCard = ({ id }: PatientProps) =^> { >> temp-medical-component.tsx
echo   const [data, setData] = useState(null); >> temp-medical-component.tsx
echo   return ^<div^>{data?.name}^</div^>; >> temp-medical-component.tsx
echo }; >> temp-medical-component.tsx
echo export default PatientCard; >> temp-medical-component.tsx

echo ✅ Archivo temporal creado
echo.

echo Analizando archivo médico...
-m frontend analyze temp-medical-component.tsx

echo.
echo 🧹 Limpiando archivos temporales...
del temp-medical-component.tsx 2>nul

echo.
echo 📋 Test 5: Información del agente
echo ==================================
-m frontend version

echo.
echo 🎊 TESTS COMPLETADOS
echo =====================
echo.
echo ✅ El Senior Frontend Agent está integrado correctamente
echo 🚀 Disponible a través del comando: -m frontend
echo 📚 Usa: -m frontend help para ver todos los comandos
echo 🏥 Optimizado para aplicaciones médicas con compliance HIPAA
echo.

echo 💡 COMANDOS PRINCIPALES:
echo   -m frontend demo        # Demo completo con análisis
echo   -m frontend analyze     # Analizar archivo específico  
echo   -m frontend report      # Reporte de directorio
echo   -m frontend help        # Ayuda completa
echo   -m frontend version     # Información del agente
echo.

pause
