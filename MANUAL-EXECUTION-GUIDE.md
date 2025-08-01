# 🏥 AltaMedica - Guía de Ejecución Manual de Actualizaciones

## 🚨 IMPORTANTE: Ejecutar como Administrador

**Abre PowerShell como Administrador** y navega al directorio del proyecto:

```powershell
cd C:\Users\Eduardo\Documents\devaltamedica
```

## 📋 Orden de Ejecución (Paso a Paso)

### 🔍 **Paso 1: Verificación Inicial**
```powershell
# Ejecutar verificación inicial
.\verify-environment.ps1

# Si hay errores, continúa con el Paso 2
# Si todo está OK, salta al Paso 3
```

### 🔧 **Paso 2: Configuración del Entorno (Solo si es necesario)**
```powershell
# SOLO ejecutar si verify-environment.ps1 mostró problemas
# Requiere permisos de Administrador
.\setup-windows-environment.ps1

# Después de completar, reinicia PowerShell y vuelve a verificar
.\verify-environment.ps1
```

### 📦 **Paso 3: Actualizar Dependencias Existentes**
```powershell
# Actualizar Next.js, React, TypeScript, etc.
.\update-dependencies.ps1

# Verificar que no hay errores de compilación
npm run type-check
```

### 🏥 **Paso 4: Nuevas Bibliotecas Médicas**
```powershell
# Instalar nuevas bibliotecas para IA médica, WebRTC, etc.
.\medical-libraries-upgrade.ps1

# Verificar instalación
npm list --depth=0
```

### ✅ **Paso 5: Verificación Final**
```powershell
# Verificar que todo funciona correctamente
.\verify-environment.ps1

# Test completo del sistema
npm run lint
npm run type-check
npm run test:all
```

## 🎯 **Ejecución Rápida (Todo en uno)**

Si tienes confianza y el entorno ya está configurado:

```powershell
# Navegar al proyecto
cd C:\Users\Eduardo\Documents\devaltamedica

# Ejecutar todo de una vez
.\verify-environment.ps1
.\update-dependencies.ps1
.\medical-libraries-upgrade.ps1
.\verify-environment.ps1

# Test final
npm run type-check
```

## 🔥 **Alternativa con Node.js**

Si PowerShell tiene problemas, usar Node.js:

```powershell
# Ejecutar el orquestador Node.js
node execute-updates.js
```

## 🚨 **Solución de Problemas**

### Error: "Execution Policy"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### Error: "Module not found"
```powershell
# Limpiar cache e instalar
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: "Port already in use"
```powershell
# Encontrar proceso usando puerto 3001 (ejemplo)
netstat -ano | findstr :3001
# Matar proceso
taskkill /F /PID <PID_NUMBER>
```

### Error: PowerShell muy antiguo
```powershell
# Instalar PowerShell 7+
winget install Microsoft.PowerShell
```

## 📊 **Estado Esperado Después de las Actualizaciones**

**Dependencias Actualizadas:**
- ✅ Next.js 15.3.6+ 
- ✅ React 19.0.0+
- ✅ TypeScript 5.7.3+
- ✅ Firebase Admin 12.8.0+
- ✅ Cypress 13.19.0+

**Nuevas Bibliotecas:**
- ✅ TensorFlow.js medical optimized
- ✅ FHIR R4 compliance tools
- ✅ Advanced WebRTC for telemedicine
- ✅ Medical accessibility tools

**Herramientas Actualizadas:**
- ✅ PowerShell 7+
- ✅ Node.js LTS
- ✅ pnpm latest
- ✅ Docker Desktop
- ✅ Firebase CLI

## 🎉 **Verificación de Éxito**

Después de completar todas las actualizaciones, deberías ver:

```
🎉 ENTORNO LISTO PARA DESARROLLO ALTAMEDICA
🚀 Próximos pasos:
   1. Ejecutar: npm install
   2. Configurar: .env.local files  
   3. Iniciar: npm run dev:all
```

---

## 📞 **¿Necesitas Ayuda?**

Si encuentras problemas durante la instalación:

1. **Copia el error exacto** que aparece
2. **Indica en qué paso ocurrió**
3. **Menciona tu versión de Windows y PowerShell**

Eduardo, ¡tu plataforma médica estará optimizada después de estas actualizaciones! 🏥✨