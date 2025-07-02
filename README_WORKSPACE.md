# 🚀 AltaMédica Platform - Workspace Organizado

## 📋 Descripción

Este workspace está organizado en **5 categorías principales** para facilitar el desarrollo, mantenimiento y escalabilidad de la plataforma AltaMédica.

## 🏗️ Estructura del Workspace

### 🏥 **DOCTORES** - Aplicaciones y Servicios para Médicos
```
apps/
├── doctors/           # Aplicación principal para médicos
├── admin/            # Panel de administración médica
├── companies/        # Gestión de empresas médicas
└── medical/          # Servicios médicos especializados
```

### 👥 **PACIENTES** - Aplicaciones y Servicios para Pacientes
```
apps/
├── patients/         # Aplicación principal para pacientes
└── web-app/          # Aplicación web general
```

### 🏢 **ROOT** - Servicios Centrales y Administración
```
apps/
├── api-server/       # API central del sistema
├── development/      # Herramientas de desarrollo
└── anthropic-simulator/ # Simulador de IA
```

### 📦 **PACKAGES** - Bibliotecas Compartidas
```
packages/
├── core/             # Funcionalidades core del sistema
├── ui/               # Componentes de interfaz compartidos
├── auth/             # Autenticación y autorización
├── firebase/         # Configuración de Firebase
├── types/            # Tipos TypeScript compartidos
├── shared/           # Utilidades compartidas
├── medical/          # Funcionalidades médicas específicas
├── eslint-config/    # Configuración de ESLint
├── tailwind-config/  # Configuración de Tailwind
├── typescript-config/ # Configuración de TypeScript
└── claude-config-manager/ # Gestor de configuración de Claude
```

### 🔧 **ETC** - Configuraciones, Documentación y Herramientas
```
configs/              # Configuraciones del sistema
docs/                 # Documentación
scripts/              # Scripts de automatización
tools/                # Herramientas de desarrollo
infrastructure/       # Configuración de infraestructura
platform/             # Configuración de plataforma
mcp-protected/        # Servidores MCP protegidos
```

## 🚀 Comandos de Desarrollo

### Inicio Rápido
```bash
# Instalar dependencias
pnpm install

# Desarrollar todas las aplicaciones
pnpm dev:all

# Desarrollar por categoría
pnpm dev:doctors      # Solo aplicaciones de doctores
pnpm dev:patients     # Solo aplicaciones de pacientes
pnpm dev:root         # Solo servicios centrales
pnpm dev:packages     # Solo packages
```

### Construcción
```bash
# Construir todo
pnpm build:all

# Construir por categoría
pnpm build:doctors    # Construir aplicaciones de doctores
pnpm build:patients   # Construir aplicaciones de pacientes
pnpm build:root       # Construir servicios centrales
pnpm build:packages   # Construir packages
```

### Testing y Linting
```bash
# Ejecutar todos los tests
pnpm test:all

# Linting en todo el workspace
pnpm lint:all

# Limpiar workspace
pnpm clean:all
```

## 🔧 Scripts de Gestión

### Workspace Manager
```bash
# Usar el script de gestión del workspace
node scripts/workspace-manager.mjs

# Ver ayuda
node scripts/workspace-manager.mjs --help

# Ejecutar comandos específicos
node scripts/workspace-manager.mjs dev:doctors
node scripts/workspace-manager.mjs build:patients
```

## 📊 Dependencias entre Categorías

```
DOCTORES ← PACKAGES (core, ui, auth, medical)
PACIENTES ← PACKAGES (core, ui, auth, medical)
ROOT ← PACKAGES (core, auth, firebase)
PACKAGES ← PACKAGES (dependencias internas)
ETC ← PACKAGES (herramientas de desarrollo)
```

## 🎯 Workflow de Desarrollo

### 1. **Desarrollo Local**
- Cada categoría puede desarrollarse independientemente
- Usar filtros de Turbo para optimizar el desarrollo
- Hot reload configurado por categoría

### 2. **Testing**
- Tests específicos por categoría
- Cobertura de código por aplicación
- Tests E2E configurados

### 3. **Build**
- Construcción optimizada por categoría
- Caché de Turbo configurado
- Outputs específicos por tipo de aplicación

### 4. **Deployment**
- Despliegue independiente por categoría
- Configuración de PM2 por aplicación
- Monitoreo centralizado

## 🛠️ Configuración

### Turbo
- Pipeline optimizado por categorías
- Filtros específicos para cada tipo de aplicación
- Caché configurado para máxima eficiencia

### ESLint
- Configuración base compartida
- Reglas específicas por tipo de aplicación
- Integración con Prettier

### TypeScript
- Configuración base en packages
- Configuraciones específicas por aplicación
- Compilación incremental

## 📈 Beneficios de esta Organización

✅ **Separación Clara**: Cada categoría tiene responsabilidades específicas
✅ **Desarrollo Independiente**: Los equipos pueden trabajar en paralelo
✅ **Escalabilidad**: Fácil agregar nuevas aplicaciones por categoría
✅ **Mantenimiento**: Configuraciones centralizadas y compartidas
✅ **Testing**: Tests específicos por categoría
✅ **Deployment**: Despliegue granular y controlado
✅ **Performance**: Caché optimizado por categoría

## 🔍 Monitoreo y Debugging

### PM2 Process Manager
```bash
# Verificar estado de todas las aplicaciones
pnpm pm2:status

# Ver logs en tiempo real
pnpm pm2:logs

# Monitoreo interactivo
pnpm pm2:monit
```

### Firebase
```bash
# Iniciar emuladores
pnpm firebase:emulators

# Desplegar a Firebase
pnpm firebase:deploy
```

## 📚 Documentación Adicional

- [Arquitectura del Sistema](./docs/architecture/)
- [Guías de Desarrollo](./docs/development/)
- [Configuración de Infraestructura](./infrastructure/)
- [Scripts de Automatización](./scripts/)

## 🤝 Contribución

1. **Seleccionar categoría**: Identificar en qué categoría trabajar
2. **Desarrollo**: Usar comandos específicos de la categoría
3. **Testing**: Ejecutar tests de la categoría
4. **Build**: Construir la categoría específica
5. **Deploy**: Desplegar según la categoría

## 📞 Soporte

Para dudas sobre la organización del workspace:
- Revisar `WORKSPACE_ORGANIZATION.md`
- Consultar `scripts/workspace-manager.mjs --help`
- Verificar configuración en `turbo.json` y `pnpm-workspace.yaml` 