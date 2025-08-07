#!/bin/bash
# 🔧 SMART PROJECT DETECTOR
# Detecta tipo de proyecto y optimiza automáticamente

echo "🔧 Detectando tipo de proyecto y optimizando..."

# Detección inteligente del tipo de proyecto
project_type=""

if [[ -f "package.json" ]]; then
    if grep -q "next" package.json; then
        project_type="nextjs"
    elif grep -q "react" package.json; then
        project_type="react"
    elif grep -q "playwright" package.json; then
        project_type="testing"
    fi
fi

if [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
    project_type="python"
fi

if [[ -f "Dockerfile" ]]; then
    project_type="$project_type docker"
fi

echo "🎯 Proyecto detectado: $project_type"

# Optimizaciones específicas por tipo
case "$project_type" in
    *"nextjs"*)
        echo "⚡ Optimizando proyecto Next.js..."
        # Auto-install de dependencias comunes de Next.js
        if ! grep -q "@types/node" package.json; then
            echo "📦 Instalando TypeScript types..."
            pnpm add -D @types/node @types/react @types/react-dom
        fi
        
        # Auto-crear estructura de carpetas típica
        mkdir -p {components,utils,hooks,types,styles} 2>/dev/null
        ;;
        
    *"python"*)
        echo "🐍 Optimizando proyecto Python..."
        # Auto-install de herramientas esenciales
        pip install --quiet black flake8 pytest 2>/dev/null || echo "Python tools ya instalados"
        ;;
        
    *"testing"*)
        echo "🎭 Optimizando entorno de testing..."
        # Auto-install browsers para Playwright
        npx playwright install --quiet 2>/dev/null || echo "Browsers ya instalados"
        ;;
        
    *"docker"*)
        echo "🐳 Optimizando entorno Docker..."
        # Auto-verificar Docker daemon
        if ! docker info >/dev/null 2>&1; then
            echo "⚠️ Docker daemon no está corriendo"
        fi
        ;;
esac

# Optimizaciones generales
echo "🎨 Aplicando optimizaciones generales..."

# Auto-crear .gitignore si no existe
if [[ ! -f ".gitignore" ]]; then
    cat > .gitignore << 'EOF'
node_modules/
.next/
.env.local
*.log
dist/
build/
coverage/
.DS_Store
__pycache__/
*.pyc
.pytest_cache/
test-results/
playwright-report/
EOF
    echo "✅ .gitignore creado con configuración estándar"
fi

echo "🚀 Proyecto optimizado para máxima productividad"
