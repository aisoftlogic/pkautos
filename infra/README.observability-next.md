# Phase 0 Remaining (Helm & K8s Scaffold Outline)

## 1. Helm Charts Structure
```
infra/helm/
  api/
  web-automart/
  web-autotrader/
infra/k8s/overlays/
  dev/
  stage/
  prod/
```
Each chart values.yaml:
- image.repository, image.tag
- replicaCount
- resources (requests/limits)
- env (config map & secret separation later)
- service (port, type ClusterIP)
- ingress (host placeholders)
- liveness & readiness probes (/healthz, /readyz)
- podAnnotations (otel, prometheus scrape)
- optional: HPA template values

## 2. Kustomize Overlays (Optionally)
If combining charts via a base manifest bundle, create base kustomization listing Helm outputs or use helmfile.

## 3. CI Additions
- helm lint (all charts)
- helm template + kubeval or kubectl --dry-run=client (needs fake cluster schema) per PR
- Package charts on release (tgz) and upload as artifact
- (Optional) push to OCI helm registry (ghcr.io/<org>/charts)

## 4. OpenAPI Artifact
- Add script `pnpm --filter @pkautos/api build && pnpm --filter @pkautos/api openapi` producing openapi.json uploaded by CI

## 5. Prometheus/Grafana in K8s
- Use kube-prometheus-stack (Helm) later; for now just app charts prepared with prometheus scrape annotations:
  - `prometheus.io/scrape: "true"`
  - `prometheus.io/port: "3000"`
  - `prometheus.io/path: "/metrics"`

## 6. Traces on K8s
- Deploy otel-collector via helm/opentelemetry-collector chart; set OTLP endpoint env in deployments

## 7. Secrets & Config
- Introduce SOPS or External Secrets for Keycloak, DB creds after initial baseline

## 8. Makefile Targets
```
make helm-lint
make helm-template
make push-images TAG=dev
make deploy-dev
```

## 9. Next Immediate Tasks (Recommended Order)
1. Scaffold api chart (values, deployment, service, ingress stub, probes).
2. Replicate for web-automart & web-autotrader.
3. Add CI helm lint + template step.
4. Add openapi generation/upload.
5. Makefile with basic helm commands.

---
This outline completes the remaining Phase 0 deliverables foundation.
