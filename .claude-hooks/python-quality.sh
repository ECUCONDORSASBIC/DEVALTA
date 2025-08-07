#!/bin/bash
# 🐍 PYTHON CODE QUALITY AUTOMATION
# Auto-formateo y validación de código Python

echo "🐍 Ejecutando validación automática de código Python..."

# Detectar archivos Python modificados
python_files=$(find . -name "*.py" -newer .git/COMMIT_EDITMSG 2>/dev/null | head -10)

if [[ -n "$python_files" ]] || [[ "$TOOL_NAME" =~ python ]] || [[ "$ARGS" =~ \.py$ ]]; then
    echo "🔍 Código Python detectado - Aplicando calidad automática..."
    
    # Auto-formateo con Black
    if command -v black &> /dev/null; then
        echo "🎨 Auto-formateando con Black..."
        black . --quiet 2>/dev/null || echo "⚠️ Black completado con warnings"
    fi
    
    # Auto-linting con flake8
    if command -v flake8 &> /dev/null; then
        echo "🔍 Ejecutando linting con flake8..."
        flake8_output=$(flake8 . 2>/dev/null | head -5)
        if [[ -n "$flake8_output" ]]; then
            echo "⚠️ Issues de linting encontrados:"
            echo "$flake8_output"
        else
            echo "✅ Linting passed"
        fi
    fi
    
    # Auto-type checking con mypy
    if command -v mypy &> /dev/null && [[ -n "$python_files" ]]; then
        echo "🔍 Verificando tipos con mypy..."
        mypy_output=$(echo "$python_files" | xargs mypy 2>/dev/null | head -3)
        if [[ -n "$mypy_output" ]]; then
            echo "ℹ️ Type hints sugeridos:"
            echo "$mypy_output"
        else
            echo "✅ Type checking passed"
        fi
    fi
    
    # Auto-testing con pytest si hay tests
    if [[ -d "tests" ]] || [[ -f "test_*.py" ]] || find . -name "*_test.py" | grep -q .; then
        echo "🧪 Ejecutando tests automáticos..."
        pytest_output=$(pytest --tb=short -q 2>/dev/null)
        if [[ $? -eq 0 ]]; then
            echo "✅ Tests passed"
        else
            echo "⚠️ Algunos tests fallaron - Revisar resultados"
        fi
    fi
    
    # Auto-security check con bandit si está disponible
    if command -v bandit &> /dev/null; then
        echo "🔒 Verificación de seguridad rápida..."
        bandit_issues=$(bandit -r . -f txt 2>/dev/null | grep -c "Issue" || echo "0")
        if [[ $bandit_issues -gt 0 ]]; then
            echo "⚠️ $bandit_issues issues de seguridad potenciales detectados"
        else
            echo "✅ Security check passed"
        fi
    fi
    
    echo "🚀 Validación de código Python completada"
fi
