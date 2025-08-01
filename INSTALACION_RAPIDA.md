# 🚀 Instalación Rápida - Sistema de Estandarización AltaMedica

## 📋 Opción 1: Instalación Automática (Recomendada)

### Windows PowerShell:
```powershell
cd C:\Users\Eduardo\Documents\devaltamedica
.\quick-install.ps1
```

### Windows CMD:
```cmd
cd C:\Users\Eduardo\Documents\devaltamedica
quick-install.bat
```

---

## 📋 Opción 2: Instalación Manual (Paso a Paso)

Si prefieres ver cada paso individualmente:

```bash
# 1. Ir al directorio del proyecto
cd C:\Users\Eduardo\Documents\devaltamedica

# 2. Validar configuración
python standardize-packages.py --validate

# 3. Ejecutar tests (opcional)
python test-package-standardization.py

# 4. Instalar automatización (hooks, scripts, etc.)
python setup-package-automation.py --install-all

# 5. Ver preview de cambios (sin modificar archivos)
python standardize-packages.py --dry-run

# 6. OPCIONAL: Aplicar estandarización
python standardize-packages.py
```

---

## 🔍 Verificación Post-Instalación

Después de instalar, verifica que todo funciona:

```bash
# Verificar que los scripts NPM están disponibles
npm run standardize:validate

# Verificar estado del workspace
npm run workspace:check

# Ver documentación generada
type PACKAGE_AUTOMATION_README.md
```

---

## ✅ Lo Que Obtienes

### 🔧 **Automatización Instalada:**
- ✅ Git hooks (pre-commit, post-merge)
- ✅ Scripts NPM integrados
- ✅ Tareas de VS Code
- ✅ File watcher automático

### 🎯 **Comandos Disponibles:**
- `npm run standardize` - Estandarizar todo
- `npm run standardize:dry` - Vista previa sin cambios
- `npm run standardize:validate` - Solo validar
- `npm run workspace:check` - Verificar estado

### 🔒 **Configuraciones Preservadas:**
- ✅ `"type": "module"` en todas las apps
- ✅ Scripts custom (server-fixed.js, signaling, etc.)
- ✅ Dependencias existentes y versiones
- ✅ Configuraciones específicas por app

### 🔄 **Solo Se Estandariza (Opcional):**
- Versiones de apps (web-app: "0.1.0", otros: "1.0.0")
- Formato workspace dependencies (workspace:*)
- Metadatos (author, license, keywords)
- Scripts estándar faltantes

---

## 🚨 Si Algo Sale Mal

### Problema: "Python no encontrado"
```bash
# Verificar instalación de Python
python --version

# O intentar con:
python3 --version
py --version
```

### Problema: "Archivo no encontrado"
```bash
# Verificar que estás en el directorio correcto
pwd
ls *.py
```

### Problema: "Errores de permisos"
```powershell
# Ejecutar PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs**: `package-standardization.log`
2. **Ejecuta en modo verbose**: `python standardize-packages.py --dry-run`
3. **Verifica archivos**: Todos los archivos .py deben estar presentes
4. **Restaura desde backup**: Los backups están en `backups/packages_*/`

---

**¡Listo para mantener tu monorepo AltaMedica siempre estandarizado! 🎉**