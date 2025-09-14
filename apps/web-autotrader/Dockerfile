# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY package.json package.json
COPY apps/web-autotrader/package.json apps/web-autotrader/package.json
COPY packages/*/package.json packages/*/package.json
RUN pnpm install --filter @pkautos/web-autotrader... --no-frozen-lockfile

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @pkautos/web-autotrader build \
	&& cp -R apps/web-autotrader/.next .next \
	&& cp apps/web-autotrader/package.json package.json \
	&& mkdir -p public \
	&& if [ -d apps/web-autotrader/public ]; then cp -R apps/web-autotrader/public/* public/; fi

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN adduser -D nextjs
USER nextjs
WORKDIR /app
COPY --from=builder /app/apps/web-autotrader/.next/standalone ./standalone
COPY --from=builder /app/apps/web-autotrader/.next/static ./apps/web-autotrader/.next/static
COPY --from=builder /app/apps/web-autotrader/public ./apps/web-autotrader/public
EXPOSE 3000
CMD ["node","standalone/apps/web-autotrader/server.js"]
