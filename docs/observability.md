# Observability Overview

## Components
| Component | Port | Purpose |
|-----------|------|---------|
| API (@pkautos/api) | 3000 | Application HTTP API + /metrics |
| Web Automart | 3001 | Next.js app |
| Web Autotrader | 3002 | Next.js app |
| Grafana | 3003 | Dashboards & Loki Explore |
| Prometheus | 9090 | Metrics scraping/query |
| Loki | 3100 | Log aggregation (HTTP API) |
| OTel Collector | 4318 / 8888 | OTLP ingest / internal metrics |
| Postgres | 5432 | Database |
| Redis | 6379 | Cache |
| Meilisearch | 7700 | Search engine |
| MinIO | 9000 / 9001 | S3-compatible storage / console |
| Keycloak | 8081 | Identity provider |

## Data Flows
- API exports traces (OTLP/HTTP) to Collector -> Collector logs exporter (demo) -> future exporters (Jaeger/Tempo/OTLP).
- API exposes Prometheus metrics directly to Prometheus scrape.
- Promtail tails Docker JSON logs -> pushes to Loki.
- Grafana queries Prometheus & Loki.

## Key Endpoints
- Prometheus up vector: `up`
- API latency example: (add custom histogram later) currently only default metrics.
- Loki log query examples:
  - All logs: `{job="docker-logs"}`
  - Filter API container: `{job="docker-logs", container_name=~".*api.*"}`
  - Search ERROR: `{job="docker-logs"} |= "ERROR"`

## Collector Metrics
Sample internal metrics (scraped at :8888/metrics):
- `otelcol_exporter_sent_spans`
- `otelcol_process_cpu_seconds`
- `otelcol_process_memory_rss`

## Adding Metrics Pipeline (Future)
Add to `otel-collector-config.yaml` if exporting metrics from apps:
```
receivers:
  otlp:
    protocols:
      http:
exporters:
  prometheus:
    endpoint: 0.0.0.0:9464
processors:
  batch: {}
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```
Expose port 9464 and add Prometheus job.

## Loki Retention
Configured in `limits_config.retention_period: 168h` (7 days). For production use object storage and compactor with longer retention.

## Troubleshooting
- Collector metrics missing: ensure :8888 mapped and service.telemetry not disabled.
- Loki empty result: confirm promtail job labels and container producing logs.
- Keycloak HTTPS warning: dev mode flags used; enable TLS in non-dev env.

## CI Smoke
Workflow `.github/workflows/ci-smoke.yml` builds containers, runs health & smoke scripts, and captures key observability artifacts (labels, metrics, logs) before teardown.
