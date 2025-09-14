# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS build
WORKDIR /app
ENV CI=true
COPY apps/api/package.json package.json
COPY tsconfig.base.json tsconfig.base.json
# Also place base config at filesystem root so extends "../../tsconfig.base.json" resolves (../../ from /app = /)
COPY tsconfig.base.json /tsconfig.base.json
COPY apps/api/tsconfig.json tsconfig.json
COPY apps/api/src src
# Install all dependencies with npm (generates package-lock internally if needed)
RUN npm install
# Build (rimraf is available via devDependencies, typescript installed)
RUN npm run build || npx tsc -p tsconfig.json

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist dist
COPY --from=build /app/package.json package.json
COPY --from=build /app/node_modules node_modules
EXPOSE 3000
CMD ["node","dist/main.js"]
