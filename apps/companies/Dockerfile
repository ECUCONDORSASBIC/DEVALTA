# 🏢 ALTAMEDICA Companies App - Production Dockerfile  
FROM node:20-alpine AS base

RUN npm install -g pnpm@8

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/companies/package.json ./apps/companies/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@altamedica/*" build

FROM node:20-alpine AS production

RUN npm install -g pnpm@8

WORKDIR /app

COPY --from=base /app/packages/ ./packages/
COPY --from=base /app/node_modules/ ./node_modules/
COPY --from=base /app/apps/companies/ ./apps/companies/

COPY apps/companies/src/ ./apps/companies/src/
COPY apps/companies/public/ ./apps/companies/public/
COPY apps/companies/next.config.js ./apps/companies/
COPY apps/companies/tailwind.config.js ./apps/companies/
COPY apps/companies/tsconfig.json ./apps/companies/

WORKDIR /app/apps/companies
RUN pnpm build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["pnpm", "start"]
