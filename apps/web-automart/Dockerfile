# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# 1. Dependencies layer
FROM base AS deps
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY package.json package.json
# Copy workspace manifests to allow filtered install to resolve deps
COPY apps/web-automart/package.json apps/web-automart/package.json
# Optionally include shared packages if referenced by the app
COPY packages/*/package.json packages/*/package.json
RUN pnpm install --filter @pkautos/web-automart... --frozen-lockfile

# 2. Builder layer
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pkautos/web-automart build \
	&& mkdir -p apps/web-automart/public

# 3. Runtime
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN adduser -D nextjs
USER nextjs
WORKDIR /app
COPY --from=builder /app/apps/web-automart/.next/standalone ./standalone
COPY --from=builder /app/apps/web-automart/.next/static ./apps/web-automart/.next/static
COPY --from=builder /app/apps/web-automart/public ./apps/web-automart/public
EXPOSE 3000
CMD ["node","standalone/apps/web-automart/server.js"]
