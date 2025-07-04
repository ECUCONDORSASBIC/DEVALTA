@echo off
echo ==========================================================
echo    SISTEMA MULTI-AGENTE ALTAMEDICA v2.0.0
echo    18 Agentes Especializados Trabajando Para Ti
echo ==========================================================
echo.

echo [*] Verificando requisitos...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado!
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo [+] Node.js detectado
echo.

echo [*] Navegando al directorio...
cd /d "C:\Users\Eduardo\Documents\devaltamedica\mcp-servers"

echo [*] Verificando dependencias...
if not exist "node_modules" (
    echo [!] Instalando dependencias necesarias...
    npm install
    echo.
)

echo ==========================================================
echo    INICIANDO SISTEMA MULTI-AGENTE
echo ==========================================================
echo.
echo AGENTES DISPONIBLES:
echo.
echo GESTION Y COORDINACION:
echo  [1] Project Manager - Gestiona proyectos y crisis
echo  [2] Product Owner - Define vision del producto  
echo  [3] Business Analyst - Analiza requerimientos
echo  [4] Scrum Master - Facilita metodologias agiles
echo.
echo DESARROLLO:
echo  [5] System Architect - Arquitectura general
echo  [6] Backend Developer - APIs y logica de negocio
echo  [7] Frontend Developer - Interfaces de usuario
echo  [8] API Architect - Diseño de APIs medicas
echo.
echo INFRAESTRUCTURA:
echo  [9] DevOps Engineer - CI/CD e infraestructura
echo  [10] Database Specialist - Bases de datos
echo  [11] FinOps Analyst - Optimizacion de costos
echo.
echo CALIDAD Y SEGURIDAD:
echo  [12] QA Specialist - Testing y calidad
echo  [13] Security Officer - Seguridad y compliance
echo.
echo DATOS Y ANALISIS:
echo  [14] Data Engineer - Pipelines de datos medicos
echo.
echo DISEÑO Y EXPERIENCIA:
echo  [15] UX/UI Designer - Interfaces medicas
echo.
echo ESPECIALISTAS MEDICOS:
echo  [16] Medical Lead - Validacion clinica
echo.
echo DOCUMENTACION Y SOPORTE:
echo  [17] Technical Writer - Documentacion
echo  [18] Support Specialist - Soporte a usuarios
echo.
echo ==========================================================
echo.
echo CAPACIDADES DEL SISTEMA:
echo  - Negociacion automatica entre agentes
echo  - Aprendizaje continuo de cada proyecto
echo  - Gestion de crisis autonoma
echo  - Optimizacion inteligente de recursos
echo  - Cumplimiento HIPAA, GDPR, HL7, FHIR
echo  - Analisis predictivo con IA
echo.
echo ==========================================================
echo.
echo INICIANDO SERVIDOR MCP...
echo.
echo Para usar el sistema:
echo 1. Abre PROMPTS_AUTOMATIZADOS_ALTAMEDICA.md
echo 2. Copia cualquier prompt
echo 3. Pegalo y observa como trabajan los 18 agentes
echo.
echo ==========================================================
echo.

node enhanced-multi-agent-mcp.js

if errorlevel 1 (
    echo.
    echo [ERROR] El servidor se detuvo inesperadamente
    echo Revisa los logs para mas informacion
)

echo.
echo ==========================================================
echo Servidor detenido. Presiona cualquier tecla para salir...
echo ==========================================================
pause >nul
