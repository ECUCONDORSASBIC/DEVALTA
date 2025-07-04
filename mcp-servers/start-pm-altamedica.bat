@echo off
echo ========================================
echo   ALTAMEDICA PROJECT MANAGER CON MCP
echo   Sistema Multi-Agente Inteligente
echo ========================================
echo.

echo [1] Iniciando servidor MCP...
cd /d "C:\Users\Eduardo\Documents\devaltamedica\mcp-servers"

echo [2] Verificando Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado!
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo [3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo [4] Iniciando Enhanced Multi-Agent Composer...
echo.
echo ============ SERVIDOR MCP ACTIVO ============
echo.
echo Herramientas disponibles:
echo - compose_application: Crear aplicaciones medicas
echo - analyze_cognitive_performance: Analizar agentes
echo - get_intelligence_report: Reportes de IA
echo - list_agents: Ver agentes disponibles
echo - start_negotiation: Iniciar colaboracion
echo.
echo Agentes especializados:
echo - React Specialist (Frontend)
echo - API Architect (Backend)
echo - System Architect (Coordinacion)
echo - Database Specialist (Datos)
echo - Testing Specialist (QA)
echo - FinOps Analyst (Costos)
echo - Security Threat Hunter (Seguridad)
echo.
echo =============================================
echo.

node enhanced-multi-agent-mcp.js

pause
