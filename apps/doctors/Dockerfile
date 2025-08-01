# 👨‍⚕️ ALTAMEDICA Doctors App - Production Dockerfile
FROM node:20-alpine AS base

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY configs/ ./configs/
COPY apps/doctors/package.json ./apps/doctors/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter "@altamedica/*" build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/packages/ ./packages/

COPY --from=base /app/apps/doctors/ ./apps/doctors/

COPY apps/doctors/src/ ./apps/doctors/src/
COPY apps/doctors/public/ ./apps/doctors/public/
COPY apps/doctors/next.config.js ./apps/doctors/
COPY apps/doctors/tailwind.config.js ./apps/doctors/
COPY apps/doctors/tsconfig.json ./apps/doctors/

WORKDIR /app/apps/doctors
RUN pnpm build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["pnpm", "start"]