# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine
FROM node:${NODE_VERSION} AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
RUN pnpm install --frozen-lockfile

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
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node","node_modules/next/dist/bin/next","start","-p","3000"]
