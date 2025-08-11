# Política de Imports en AltaMedica

Objetivo: garantizar imports consistentes y seguros entre apps y packages del monorepo, evitando imports profundos (internal modules) que rompen el runtime, requieren hacks de d.ts, o fuerzan duplicaciones.

Esta guía aplica a todas las apps en `apps/*` y packages en `packages/*`.

## Principios

- Solo importa APIs públicas de cada package (entrypoint). Nada de rutas internas como `@altamedica/auth/constants/*`.
- Expón lo necesario desde el `index.ts` del package y usa su nombre de paquete: `import { X } from '@altamedica/auth'`.
- Prohibido crear declaraciones ambient (`.d.ts`) para “simular” módulos internos. Si falta un export, se corrige en el package.
- Cuando un contrato cambie, actualiza los exports públicos y la documentación del package.

## Patrones correctos vs incorrectos

- Correcto
  - `import { createAuthMiddleware, AUTH_COOKIES } from '@altamedica/auth'`
  - `import { createNextConfig } from '@altamedica/config-next'`
- Incorrecto (profundos/internos)
  - `import { AUTH_COOKIES } from '@altamedica/auth/constants/cookies` (prohibido)
  - `import something from '../../../../../internal'`

## Cómo evitamos imports incorrectos

1. Exports explícitos en cada package

- Usa el campo `exports` en `package.json` del package para exponer solo entrypoints permitidos.
- Si no está en `exports`, no se puede importar (bloquea imports profundos por diseño).

2. Reglas de ESLint para el monorepo

- Restringe imports con `no-restricted-imports` y/o `import/no-internal-modules`.
- Opción avanzada: `eslint-plugin-boundaries` para capas (packages vs apps).

3. “Barrels” consistentes

- Asegura que cada package tenga `src/index.ts` que reexporte todo lo público.
- Evita que las apps “adivinen” rutas internas.

4. Build/link estable en dev

- Construye los packages con `pnpm -w -r build` para que `dist/` esté disponible y no “falte” nada.
- Evita hacks como crear `.d.ts` sueltos para engañar al resolver.

5. CI + pre-commit checks

- Falla la pipeline si se detecta un import prohibido.
- Pre-commit con Husky/lint-staged para evitar que lleguen a git.

## Snippets listos (recomendados)

1. package.json (packages) — exports estrictos

```jsonc
{
  "name": "@altamedica/auth",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts",
    },
    // Si necesitas subpaths públicos, decláralos explícitamente
    // "./server": { "require": "./dist/server.js", "types": "./dist/server.d.ts" }
  },
}
```

Con `exports` definido, Node/TS no resolverán rutas internas no declaradas.

2. ESLint (raíz del repo) — prohibir internos comunes

```jsonc
{
  "overrides": [
    {
      "files": ["**/*.{ts,tsx,js,jsx}"],
      "plugins": ["import"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              "@altamedica/*/*", // bloquea un nivel interno
              "@altamedica/*/**", // bloquea >1 nivel interno
              "**/src/**", // evita importar desde src de otros packages
              "**/dist/**", // evita importar desde dist directo
            ],
          },
        ],
        "import/no-internal-modules": [
          "error",
          {
            "allow": [
              // Lista blanca opcional de subpaths públicos si existieran
              // "@altamedica/config-next/*"
            ],
          },
        ],
      },
    },
  ],
}
```

3. Pre-commit (Husky) — bloque rápido de patrones comunes

```sh
# .husky/pre-commit
pnpm lint
# bloqueo simple adicional (opcional)
if git diff --cached --name-only | findstr /r
"@altamedica/.\+/.\+\|/src/\|/dist/" > nul; then
  echo "❌ Import interno detectado. Usa exports públicos del package." && exit 1
fi
```

4. TSConfig — rutas predecibles (opcional)

- Mantén `paths` apuntando sólo a entries públicos si usas path aliases.
- Evita definir aliases que expongan carpetas internas.

## Flujo de corrección cuando aparece un import profundo

1. No crees `.d.ts` de compatibilidad. Identifica qué símbolo falta en el package.
2. Agrega export en `src/index.ts` del package correspondiente.
3. Asegura que `package.json#exports` lo exponga (si usas subpaths públicos).
4. Compila el package (`pnpm -w -r build`).
5. Reemplaza el import profundo por el import público indicado.

## Preguntas frecuentes

- “La IA sugirió `@altamedica/auth/constants/cookies` y falla, ¿qué hago?”
  - Cambia a `import { AUTH_COOKIES } from '@altamedica/auth'`.
  - Si no existe, exporta `AUTH_COOKIES` en `packages/auth/src/index.ts` y reconstruye el package.

- “En dev el API no resuelve el package y caigo en hacks”
  - Usa un fallback local temporal solo en el servidor (como se hizo con `apps/api-server/src/constants/auth-cookies.ts`) y abre un issue para arreglar la exportación/bundle del package.

## Checklist rápida para PRs

- [ ] No hay imports a rutas internas de packages.
- [ ] Cualquier símbolo nuevo requerido fue agregado al export público del package.
- [ ] No se añadieron `.d.ts` para “simular” módulos.
- [ ] Lint/typecheck/build pasan sin warnings de resolución.

---

Si quieres, puedo:

- Aplicar el `exports` estricto en los packages principales.
- Añadir la configuración ESLint a nivel raíz.
- Crear un pre-commit Husky y gate en CI para bloquear imports internos.
