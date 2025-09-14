# Root Makefile (Phase 0 skeleton)

DOCKER_ORG?=example
VERSION?=dev
PLATFORMS=linux/amd64,linux/arm64
APPS=api web-automart web-autotrader

.PHONY: help build scan test push

help:
	@echo "Targets: build, scan, test, push, compose-up (future), compose-down (future)"

build:
	@echo "[BUILD] (placeholder) docker buildx build --platform $(PLATFORMS) -t ghcr.io/$(DOCKER_ORG)/api:$(VERSION) apps/api"

scan:
	@echo "[SCAN] (placeholder) trivy image ghcr.io/$(DOCKER_ORG)/api:$(VERSION)"

test:
	@echo "[TEST] (placeholder) run unit/integration tests inside docker"

push:
	@echo "[PUSH] (placeholder) docker push ghcr.io/$(DOCKER_ORG)/api:$(VERSION)"
