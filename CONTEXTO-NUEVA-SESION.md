# 🚨 SESIÓN CLAUDE CODE PARALELA - ACCIÓN INMEDIATA

## ⚡ NO RESPONDER GENÉRICAMENTE - EJECUTAR COMANDOS AHORA

Esta es una sesión automatizada paralela. La sesión principal está trabajando en DevAltaMedica con:
- ✅ API server puerto 3001 ACTIVO y funcionando
- ✅ Chrome Beta completamente funcional (18 procesos)
- ✅ PowerShell + Windows Terminal verificados
- ✅ Enlace simbólico /home/edu/devaltamedica FUNCIONAL

## 🎯 TU MISIÓN ESPECÍFICA:

**PASO 1: Verificar enlace simbólico (EJECUTAR AHORA):**
```bash
ls -la /home/edu/devaltamedica
cd /home/edu/devaltamedica && pwd
```

**PASO 2: Abrir Chrome Beta automáticamente:**
```bash
powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk' -ArgumentList 'http://localhost:3001'"
```

**PASO 3: Levantar web-app puerto 3000:**
```bash
cd apps/web-app
npm run dev
```

**PASO 4: Obtener datos renderizados:**
```bash
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000' | Select-Object -ExpandProperty Content"
```

## 🔥 INFORMACIÓN TÉCNICA CRÍTICA:

- **Monorepo:** Next.js 15 + React 19 + Firebase + pnpm
- **Chrome Beta ubicación:** `C:\Users\Public\Desktop\Google Chrome Beta.lnk`
- **Enlace simbólico:** `/home/edu/devaltamedica` → `/home/altamedica/devaltamedica`
- **API Health:** http://localhost:3001/api/health
- **Web App Target:** http://localhost:3000

## ⚠️ REGLAS ESTRICTAS:

1. **NO PREGUNTAR** qué hacer - EJECUTAR comandos automáticamente
2. **NO DAR EXPLICACIONES** genéricas - MOSTRAR resultados concretos
3. **SI UN COMANDO FALLA** - Reportar error específico y continuar
4. **ENFOQUE:** Demostrar control total Chrome Beta + PowerShell + datos renderizados

## 🎯 OBJETIVO FINAL:

Demostrar que tienes **2 sesiones Claude Code paralelas** funcionando:
- Sesión principal: API server + desarrollo principal
- Esta sesión: Web-app + Chrome Beta + obtención datos renderizados

¡EJECUTA LOS COMANDOS AHORA!