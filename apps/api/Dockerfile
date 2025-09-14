# syntax=docker/dockerfile:1.7
FROM node:20-alpine
WORKDIR /app
# Placeholder dependencies layer
COPY package.json package-lock.json* ./
RUN [ -f package.json ] && npm install || true
COPY . .
CMD ["node","server.js"]
# TODO: Replace with NestJS bootstrap (main.ts) and proper build stage
