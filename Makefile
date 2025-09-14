# Root Makefile

DOCKER_ORG?=example
VERSION?=dev
PLATFORMS=linux/amd64,linux/arm64
APPS=api web-automart web-autotrader
COMPOSE_FILE=docker-compose.yml

.PHONY: help build scan test push compose-up compose-down compose-logs compose-recreate lint fmt openapi smoke health ps restart-api restart-loki rebuild-api up down health-retry

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

up: compose-up
down: compose-down

# --- Added convenience targets ---
ps:
	docker compose -f $(COMPOSE_FILE) ps

restart-api:
	docker compose -f $(COMPOSE_FILE) up -d --force-recreate --no-deps api

restart-loki:
	docker compose -f $(COMPOSE_FILE) up -d --force-recreate --no-deps loki

rebuild-api:
	docker compose -f $(COMPOSE_FILE) build api && docker compose -f $(COMPOSE_FILE) up -d api

health:
	@fails=0; \
	printf 'API:        '; curl -sf localhost:3000/healthz   >/dev/null || { echo FAIL; fails=$$((fails+1)); }; [ $$fails -eq 0 ] && echo OK || true; \
	printf 'Automart:   '; curl -sf localhost:3001/api/healthz >/dev/null || { echo FAIL; fails=$$((fails+1)); }; [ $$fails -eq 0 ] && echo OK || true; \
	printf 'Autotrader: '; curl -sf localhost:3002/api/healthz >/dev/null || { echo FAIL; fails=$$((fails+1)); }; [ $$fails -eq 0 ] && echo OK || true; \
	printf 'Grafana:    '; curl -sf localhost:3003/api/health  >/dev/null || { echo FAIL; fails=$$((fails+1)); }; [ $$fails -eq 0 ] && echo OK || true; \
	printf 'Prometheus: '; curl -sf localhost:9090/-/healthy    >/dev/null || { echo FAIL; fails=$$((fails+1)); }; [ $$fails -eq 0 ] && echo OK || true; \
	printf 'Loki:       '; curl -sf localhost:3100/ready       >/dev/null || { echo FAIL; fails=$$((fails+1)); }; [ $$fails -eq 0 ] && echo OK || true; \
	if [ $$fails -gt 0 ]; then echo "Health summary: $$fails failure(s)"; exit 1; else echo 'Health summary: all services OK'; fi

health-retry:
	./scripts/health-retry.sh
