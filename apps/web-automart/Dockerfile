# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# 1. Dependencies layer
FROM base AS deps
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

# 2. Builder layer
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pkautos/web-automart build \
	&& cp -R apps/web-automart/.next .next \
	&& cp apps/web-automart/package.json package.json \
	&& mkdir -p public \
	&& if [ -d apps/web-automart/public ]; then cp -R apps/web-automart/public/* public/; fi

# 3. Runtime
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN adduser -D nextjs
USER nextjs
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node","node_modules/next/dist/bin/next","start","-p","3000"]
