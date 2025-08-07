#!/bin/bash
# 🐍 PYTHON AUTO-DEVELOPMENT
# Setup automático y optimización de entorno Python

echo "🐍 Optimizando entorno de desarrollo Python..."

# Detectar si estamos trabajando con Python
if [[ "$TOOL_NAME" =~ python ]] || [[ "$ARGS" =~ \.py$ ]] || [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
    echo "🔍 Contexto Python detectado - Optimizando entorno..."
    
    # Auto-setup de virtual environment
    if [[ ! -d "venv" ]] && [[ ! -d ".venv" ]] && [[ ! -f "poetry.lock" ]]; then
        echo "📦 Creando virtual environment..."
        python -m venv venv
        echo "✅ Virtual environment creado: venv/"
    fi
    
    # Auto-activation del venv
    if [[ -d "venv" ]] && [[ -z "$VIRTUAL_ENV" ]]; then
        echo "⚡ Activando virtual environment..."
        source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
    fi
    
    # Auto-install de dependencias
    if [[ -f "requirements.txt" ]]; then
        echo "📋 Instalando dependencias de requirements.txt..."
        pip install -r requirements.txt --quiet
    fi
    
    if [[ -f "pyproject.toml" ]]; then
        echo "📋 Detectado pyproject.toml - Usando Poetry..."
        if ! command -v poetry &> /dev/null; then
            pip install poetry
        fi
        poetry install
    fi
    
    # Auto-install de herramientas de desarrollo
    dev_tools="black flake8 mypy pytest pytest-cov"
    echo "🛠️ Instalando herramientas de desarrollo..."
    pip install $dev_tools --quiet
    
    # Auto-configuración de pre-commit hooks si no existen
    if [[ ! -f ".pre-commit-config.yaml" ]]; then
        cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
EOF
        echo "✅ Pre-commit hooks configurados"
    fi
    
    echo "🚀 Entorno Python optimizado y listo"
fi
