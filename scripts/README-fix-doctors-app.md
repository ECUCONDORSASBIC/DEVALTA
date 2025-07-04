# 🏥 Script de Reparación de Doctors App - AltaMedica

## 📋 Descripción

Este script PowerShell proporciona una solución integral para reparar problemas comunes en la aplicación de doctores de AltaMedica. Está diseñado para manejar tres niveles de problemas, desde correcciones menores hasta reinstalaciones completas.

## 🚀 Uso Rápido

```powershell
# Opción 1: Solución estándar (recomendada)
.\fix-doctors-app.ps1

# Opción 2: Si persiste el error - Downgrade a versiones estables
.\fix-doctors-app.ps1 -Downgrade

# Opción 3: Limpieza total si hay corrupción severa
.\fix-doctors-app.ps1 -Force
```

## 🔧 Niveles de Reparación

### 1. 🟢 Solución Estándar (Recomendada)
**Comando:** `.\fix-doctors-app.ps1`

**Qué hace:**
- ✅ Verifica dependencias del sistema
- 💾 Crea backup automático del proyecto
- 🧹 Limpia cachés (.next, .turbo, node_modules/.cache)
- 🎨 Corrige configuración de Tailwind CSS
- ⚙️ Actualiza scripts de desarrollo con Turbopack
- 🧪 Verifica compilación y linting

**Cuándo usar:** Problemas menores, errores de configuración, cachés corruptos

### 2. 🟡 Downgrade a Versiones Estables
**Comando:** `.\fix-doctors-app.ps1 -Downgrade`

**Qué hace:**
- Todo lo de la solución estándar +
- ⬇️ Downgrade de dependencias a versiones estables:
  - Next.js: 14.2.0
  - React: 18.3.1
  - React-DOM: 18.3.1
  - TypeScript: 5.3.3
  - Tailwind CSS: 3.3.6
  - Autoprefixer: 10.4.16
  - PostCSS: 8.4.32
- 📦 Reinstalación completa de dependencias

**Cuándo usar:** Errores persistentes, incompatibilidades de versiones

### 3. 🔴 Limpieza Total (Force)
**Comando:** `.\fix-doctors-app.ps1 -Force`

**Qué hace:**
- Todo lo anterior +
- 💥 Eliminación completa de archivos generados
- 🗑️ Limpieza de directorios adicionales (out, coverage, .nyc_output)
- 🔄 Reinstalación completa desde cero
- ⚠️ Solicita confirmación antes de ejecutar

**Cuándo usar:** Corrupción severa del proyecto, problemas irresolubles

## 📁 Estructura del Script

```
fix-doctors-app.ps1
├── 🔍 Verificación del entorno
│   ├── Test-WorkspaceRoot()
│   └── Test-SystemDependencies()
├── 💾 Backup automático
│   └── Backup-Project()
├── 🧹 Limpieza de cachés
│   └── Clear-Caches()
├── 🎨 Corrección de configuración
│   ├── Fix-TailwindConfig()
│   └── Fix-DevScripts()
├── 📦 Gestión de dependencias
│   ├── Reinstall-Dependencies()
│   └── Downgrade-ToStableVersions()
└── 🧪 Verificación final
    └── Test-Application()
```

## 🔍 Verificaciones Automáticas

### Dependencias del Sistema
- ✅ Node.js
- ✅ npm
- ✅ pnpm
- ✅ Git

### Archivos Críticos
- ✅ package.json (workspace root)
- ✅ turbo.json
- ✅ pnpm-workspace.yaml

### Configuraciones
- ✅ postcss.config.js (Tailwind v3)
- ✅ package.json scripts (Turbopack)
- ✅ TypeScript compilation
- ✅ ESLint validation

## 💾 Sistema de Backup

El script crea automáticamente un backup antes de cualquier operación:

```
backup-doctors-app-YYYYMMDD-HHMMSS/
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── .eslintrc.json
```

## 🎨 Correcciones de Tailwind CSS

### Problema Detectado
- Configuración incorrecta en `postcss.config.js`
- Uso de sintaxis v4 con Tailwind v3

### Solución Aplicada
```javascript
// postcss.config.js corregido
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## ⚙️ Optimización de Scripts

### Antes
```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

### Después
```json
{
  "scripts": {
    "dev": "next dev --turbopack --port 3003"
  }
}
```

## 🚨 Manejo de Errores

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `No se detectó el workspace root` | Script ejecutado desde directorio incorrecto | Ejecutar desde la raíz del proyecto |
| `Dependencias faltantes` | Node.js, pnpm no instalados | Instalar dependencias del sistema |
| `Errores de compilación` | Problemas de TypeScript | Usar `-Downgrade` |
| `Problemas persistentes` | Corrupción severa | Usar `-Force` |

### Logs de Colores
- 🟢 **Verde**: Operaciones exitosas
- 🟡 **Amarillo**: Advertencias
- 🔴 **Rojo**: Errores críticos
- 🔵 **Cian**: Información de progreso
- 🟣 **Magenta**: Headers y separadores

## 📊 Métricas de Rendimiento

### Tiempos Estimados
- **Solución Estándar**: 2-5 minutos
- **Downgrade**: 5-10 minutos
- **Limpieza Total**: 10-15 minutos

### Mejoras Esperadas
- ⚡ **Cold Start**: 10x más rápido con Turbopack
- 🔄 **Rebuilds**: Incrementales y casi instantáneos
- 🎯 **Configuración**: 100% consistente

## 🔧 Configuración Avanzada

### Variables de Entorno
```powershell
# Personalizar puerto de desarrollo
$env:DOCTORS_PORT = "3003"

# Habilitar logs detallados
$env:DEBUG = "true"
```

### Personalización de Versiones Estables
Editar la función `Downgrade-ToStableVersions()` en el script:

```powershell
$stableVersions = @{
    "next" = "14.2.0"
    "react" = "18.3.1"
    # Agregar más versiones según necesidad
}
```

## 🧪 Testing

### Verificación Automática
El script ejecuta automáticamente:
```bash
pnpm run type-check  # Verificación TypeScript
pnpm run lint        # Verificación ESLint
```

### Verificación Manual
Después de la reparación:
```bash
cd apps/doctors
pnpm dev             # Iniciar servidor de desarrollo
```

## 📚 Documentación Relacionada

- [CORRECCIONES_APLICADAS.md](../apps/doctors/CORRECCIONES_APLICADAS.md)
- [TURBOPACK_ANALYSIS.md](../apps/doctors/TURBOPACK_ANALYSIS.md)
- [ANALISIS_USER_RULES_ALTAMEDICA.md](../apps/doctors/ANALISIS_USER_RULES_ALTAMEDICA.md)

## 🤝 Contribución

### Reportar Problemas
1. Ejecutar el script con logs detallados
2. Capturar el output completo
3. Incluir información del sistema
4. Describir el problema específico

### Mejoras Sugeridas
- Agregar más versiones estables
- Incluir correcciones para otros frameworks
- Mejorar el sistema de backup
- Agregar más verificaciones automáticas

## 📄 Licencia

Este script es parte del proyecto AltaMedica y está sujeto a la licencia del proyecto.

---

**Desarrollado por:** Equipo de Desarrollo AltaMedica  
**Última actualización:** Julio 2025  
**Versión:** 1.0.0