# Manual Test Checklist

## API
- GET http://localhost:3000/healthz -> `{ "status": "ok" }`
- GET http://localhost:3000/readyz -> `{ "status": "ready" }`
- GET http://localhost:3000/metrics -> Prometheus text format (includes process and default metrics)
- OpenTelemetry traces emitted to collector (check docker logs for `otelcol_exporter_sent_spans` growth)

## Web Apps
- Automart: http://localhost:3001/ (landing) and /api/healthz proxied if implemented
- Autotrader: http://localhost:3002/

## Observability
- Prometheus: http://localhost:9090/graph (query `up`)
- Grafana: http://localhost:3003/ (login admin/admin)
  - Datasource `Prometheus` present
  - Explore Loki logs: query `{job="docker-logs"}`
- Loki API sanity: curl http://localhost:3100/ready -> HTTP 200
- Loki labels: curl http://localhost:3100/loki/api/v1/labels
- Promtail shipping: run a container log line and confirm it appears in Grafana Explore

## OpenTelemetry Collector
- Metrics endpoint: curl http://localhost:8888/metrics -> contains `otelcol_process_cpu_seconds`
- Health: wget -qO- http://localhost:13133/healthz -> `{"status":"Server available"}` (or similar)

## Keycloak
- Console: http://localhost:8081/
- Health live: http://localhost:8081/health/live -> JSON with `status: UP`
- Able to log in with admin/admin

## Redis
- redis-cli -h localhost ping -> `PONG`

## Postgres
- psql postgresql://pkautos:pkautos@localhost:5432/pkautos -c "select 1" -> returns 1

## Meilisearch
- GET http://localhost:7700/health -> `{ "status": "available" }`

## MinIO
- Console: http://localhost:9001/ (login minio / minio12345)
- Health: curl http://localhost:9000/minio/health/live -> 200 OK

## Smoke Script
- Run `bash scripts/smoke.sh` -> All checks pass with exit 0

## Health Retry Script
- Run `bash scripts/health-retry.sh` -> Should retry until Loki ready then exit 0

## Notes
- For production: enable TLS for Keycloak and MinIO, persist Loki with object storage, add OTel metrics/ logs pipelines.
