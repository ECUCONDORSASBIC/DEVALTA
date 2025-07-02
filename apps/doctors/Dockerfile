# 👩‍⚕️ ALTAMEDICA Doctors App - Production Dockerfile
FROM node:20-alpine AS base

RUN npm install -g pnpm@8

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/doctors/package.json ./apps/doctors/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@altamedica/*" build

FROM node:20-alpine AS production

RUN npm install -g pnpm@8

WORKDIR /app

COPY --from=base /app/packages/ ./packages/
COPY --from=base /app/node_modules/ ./node_modules/
COPY --from=base /app/apps/doctors/ ./apps/doctors/

COPY apps/doctors/src/ ./apps/doctors/src/
COPY apps/doctors/public/ ./apps/doctors/public/
COPY apps/doctors/next.config.ts ./apps/doctors/
COPY apps/doctors/tailwind.config.ts ./apps/doctors/
COPY apps/doctors/tsconfig.json ./apps/doctors/

WORKDIR /app/apps/doctors
RUN pnpm build

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3003/api/health || exit 1

CMD ["pnpm", "start"]
