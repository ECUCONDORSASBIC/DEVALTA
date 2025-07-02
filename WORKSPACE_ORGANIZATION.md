# Organización del Workspace - AltaMédica Platform

## Estructura Organizada por Categorías

### 🏥 **DOCTORES** (Aplicaciones y Servicios para Médicos)
```
apps/
├── doctors/           # Aplicación principal para médicos
├── admin/            # Panel de administración médica
├── companies/        # Gestión de empresas médicas
└── medical/          # Servicios médicos especializados
```

### 👥 **PACIENTES** (Aplicaciones y Servicios para Pacientes)
```
apps/
├── patients/         # Aplicación principal para pacientes
├── web-app/          # Aplicación web general
└── telemedicine/     # Servicios de telemedicina
```

### 🏢 **ROOT** (Servicios Centrales y Administración)
```
apps/
├── api-server/       # API central del sistema
├── development/      # Herramientas de desarrollo
└── anthropic-simulator/ # Simulador de IA
```

### 📦 **PACKAGES** (Bibliotecas Compartidas)
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

### 🔧 **ETC** (Configuraciones, Documentación y Herramientas)
```
configs/              # Configuraciones del sistema
docs/                 # Documentación
scripts/              # Scripts de automatización
tools/                # Herramientas de desarrollo
infrastructure/       # Configuración de infraestructura
platform/             # Configuración de plataforma
mcp-protected/        # Servidores MCP protegidos
```

## Comandos de Desarrollo por Categoría

### Para DOCTORES:
```bash
# Desarrollar aplicación de doctores
pnpm --filter doctors dev

# Desarrollar panel de administración
pnpm --filter admin dev

# Desarrollar gestión de empresas
pnpm --filter companies dev
```

### Para PACIENTES:
```bash
# Desarrollar aplicación de pacientes
pnpm --filter patients dev

# Desarrollar aplicación web
pnpm --filter web-app dev
```

### Para ROOT:
```bash
# Desarrollar API server
pnpm --filter api-server dev

# Ejecutar herramientas de desarrollo
pnpm --filter development dev
```

### Para PACKAGES:
```bash
# Construir todos los packages
pnpm --filter "./packages/*" build

# Desarrollar UI components
pnpm --filter ui dev
```

### Para ETC:
```bash
# Ejecutar scripts de mantenimiento
pnpm run maintenance

# Ejecutar scripts de deployment
pnpm run deploy
```

## Estructura de Dependencias

### Dependencias entre Categorías:
- **DOCTORES** ← **PACKAGES** (core, ui, auth, medical)
- **PACIENTES** ← **PACKAGES** (core, ui, auth, medical)
- **ROOT** ← **PACKAGES** (core, auth, firebase)
- **PACKAGES** ← **PACKAGES** (dependencias internas)
- **ETC** ← **PACKAGES** (herramientas de desarrollo)

## Workflow de Desarrollo

1. **Desarrollo Local**: Cada categoría puede desarrollarse independientemente
2. **Testing**: Tests específicos por categoría
3. **Build**: Construcción optimizada por categoría
4. **Deployment**: Despliegue independiente por categoría
5. **Monitoreo**: Monitoreo centralizado desde ROOT

## Beneficios de esta Organización

✅ **Separación Clara**: Cada categoría tiene responsabilidades específicas
✅ **Desarrollo Independiente**: Los equipos pueden trabajar en paralelo
✅ **Escalabilidad**: Fácil agregar nuevas aplicaciones por categoría
✅ **Mantenimiento**: Configuraciones centralizadas y compartidas
✅ **Testing**: Tests específicos por categoría
✅ **Deployment**: Despliegue granular y controlado 