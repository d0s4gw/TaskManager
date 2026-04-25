# ADR 0007: Observability Standards

## Status
Accepted

## Context
Requires high visibility into system health, performance, and errors in production.

## Decision
1. Standardize on **OpenTelemetry (OTel)** for tracing.
2. Use **Winston** for structured JSON logging (GCP parity).
3. Propagate a unique **Request-ID** across all service boundaries.

## Rationale
- **Cloud Native**: Native integration with Google Cloud Trace and Logging.
- **High Fidelity**: JSON logs enable advanced filtering and alerting.
