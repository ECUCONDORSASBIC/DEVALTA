#!/bin/bash
# 🎭 PLAYWRIGHT POST-TEST AUTOMATION
# Auto-procesamiento después de ejecutar tests

echo "🎭 Post-procesamiento de tests Playwright..."

# Detectar si se ejecutaron tests
if [[ "$TOOL_NAME" =~ (test|playwright) ]] || [[ -f "test-results" ]] || [[ -f "playwright-report" ]]; then
    
    # Auto-screenshots en fallos
    if [[ -d "test-results" ]]; then
        failed_tests=$(find test-results -name "*.png" | wc -l)
        if [[ $failed_tests -gt 0 ]]; then
            echo "📸 $failed_tests screenshots de fallos capturadas"
            echo "🔍 Screenshots disponibles en test-results/"
        fi
    fi
    
    # Auto-generación de reporte HTML
    if [[ -d "playwright-report" ]]; then
        echo "📊 Reporte HTML generado: playwright-report/index.html"
        
        # Auto-open del reporte si hay fallos
        if grep -q "failed" playwright-report/index.html 2>/dev/null; then
            echo "⚠️ Tests fallidos detectados - Reporte disponible para revisión"
        fi
    fi
    
    # Auto-cleanup de archivos temporales de testing
    find . -name "*.tmp" -path "*/test-results/*" -delete 2>/dev/null
    
    # Auto-commit de nuevos tests si se crearon
    new_tests=$(git status --porcelain | grep -E "\\.test\\.|tests/" | grep "^A" | wc -l)
    if [[ $new_tests -gt 0 ]]; then
        echo "✨ $new_tests nuevos tests detectados"
        git add tests/ *.test.* *.spec.* 2>/dev/null
    fi
    
    # Reporte de cobertura si existe
    if [[ -f "coverage/lcov-report/index.html" ]]; then
        echo "📈 Reporte de cobertura disponible: coverage/lcov-report/index.html"
    fi
    
    echo "✅ Post-procesamiento de tests completado"
fi
