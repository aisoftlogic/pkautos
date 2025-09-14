# Root Makefile

DOCKER_ORG?=example
VERSION?=dev
PLATFORMS=linux/amd64,linux/arm64
APPS=api web-automart web-autotrader
COMPOSE_FILE=docker-compose.yml

.PHONY: help build scan test push compose-up compose-down compose-logs compose-recreate lint fmt openapi smoke

help:
	@echo "Targets: build, scan, test, push, compose-up, compose-down, compose-logs, compose-recreate, lint, fmt, openapi, smoke"

build:
	@echo "[BUILD] building multi-arch images (placeholder)"
scan:
	@echo "[SCAN] (placeholder) trivy image ghcr.io/$(DOCKER_ORG)/api:$(VERSION)"
test:
	@echo "[TEST] (placeholder) run unit/integration tests inside docker"
push:
	@echo "[PUSH] (placeholder) docker push ghcr.io/$(DOCKER_ORG)/api:$(VERSION)"

compose-up:
	docker compose -f $(COMPOSE_FILE) up -d --build
compose-down:
	docker compose -f $(COMPOSE_FILE) down -v
compose-logs:
	docker compose -f $(COMPOSE_FILE) logs -f --tail=100
compose-recreate:
	docker compose -f $(COMPOSE_FILE) up -d --force-recreate --build

lint:
	pnpm eslint . --ext .ts,.tsx || true
fmt:
	pnpm prettier -w .

openapi:
	cd apps/api && pnpm ts-node src/openapi-gen.ts

smoke:
	./scripts/smoke.sh
