# TypeScript Project References Setup

This project has been refactored to use TypeScript Project References to prevent duplication and improve development workflow.

## What Changed

### Before
- Each package had its own `tsc --watch` script
- Multiple TypeScript compilers running simultaneously
- Potential duplication and resource waste

### After
- Single root watcher using TypeScript Project References: `tsc -b packages/* -w --preserveWatchOutput`
- Coordinated compilation with dependency awareness
- Better performance and resource utilization

## Available Scripts

### Development
```bash
# Start all Next.js dev servers
pnpm dev

# Watch TypeScript compilation for all packages
pnpm dev:watch-typescript

# Start both dev servers and TypeScript watcher
pnpm dev:watch-all
```

### Build
```bash
# Build all packages using TypeScript Project References
pnpm build:typescript

# Build all apps and packages using Turbo
pnpm build:all
```

## Package Configuration

The following packages are configured with TypeScript Project References:

- `@altamedica/types` - Base types (no dependencies)
- `@altamedica/shared` - Shared utilities (depends on types)
- `@altamedica/core` - Core functionality (depends on types)
- `@altamedica/ui` - UI components (composite build)
- `@altamedica/firebase` - Firebase utilities (depends on types)
- `@altamedica/claude-config-manager` - Claude configuration manager

## Key Features

1. **Dependency-aware building**: TypeScript automatically builds dependencies in the correct order
2. **Incremental compilation**: Only rebuilds what's changed
3. **Single watcher**: One TypeScript process watches all packages
4. **Preserve watch output**: Clear, readable compilation messages
5. **npm-run-all integration**: Parallel execution of dev servers and TypeScript watcher

## Technical Details

Each package's `tsconfig.json` includes:
- `"composite": true` - Enables project references
- `"declarationMap": true` - Generates source maps for declarations
- `"references": [...]` - Specifies dependencies on other packages

The root `tsconfig.json` lists all packages in the `references` array, enabling the single build command to work across the entire monorepo.

## Benefits

- **Performance**: Single TypeScript process instead of multiple
- **Consistency**: All packages use the same compilation settings
- **Maintainability**: No duplicate `tsc --watch` scripts to maintain
- **Developer Experience**: Clear, consolidated output
- **Resource Efficiency**: Reduced CPU and memory usage
