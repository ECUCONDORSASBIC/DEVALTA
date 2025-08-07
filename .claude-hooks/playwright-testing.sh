#!/bin/bash
# 🎭 PLAYWRIGHT AUTO-TESTING
# Auto-setup y ejecución inteligente de tests Playwright

echo "🎭 Iniciando testing automático con Playwright..."

# Detectar si estamos en contexto de testing
if [[ "$TOOL_NAME" =~ (test|playwright|browser|e2e) ]] || [[ "$ARGS" =~ (test|spec|\.test\.|\.spec\.) ]]; then
    echo "🔍 Contexto de testing detectado - Activando Playwright..."
    
    # Auto-install Playwright si no está instalado
    if ! command -v playwright &> /dev/null; then
        echo "📦 Instalando Playwright..."
        pnpm add -D @playwright/test playwright
        npx playwright install
    fi
    
    # Auto-start de browsers si no están corriendo
    if ! pgrep -f "chrome\|chromium\|firefox" > /dev/null; then
        echo "🌐 Iniciando browsers para testing..."
        npx playwright install chromium firefox webkit
    fi
    
    # Auto-setup de configuración de testing
    if [[ ! -f "playwright.config.ts" ]] && [[ ! -f "playwright.config.js" ]]; then
        echo "⚙️ Configurando Playwright..."
        cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
    fi
    
    # Auto-crear directorio de tests si no existe
    if [[ ! -d "tests" ]]; then
        mkdir -p tests
        echo "📁 Directorio de tests creado"
    fi
    
    echo "✅ Playwright configurado y listo para testing"
fi
