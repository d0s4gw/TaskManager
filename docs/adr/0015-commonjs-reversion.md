# ADR 0015: CommonJS Reversion

## Status
Accepted

## Context
ES Modules (ESM) caused compatibility issues with key tracing and aliasing libraries.

## Decision
Revert the server from ESM to **CommonJS**.

## Rationale
- **Compatibility**: Better support for OpenTelemetry auto-instrumentation and `module-alias`.
- **Stability**: Avoids the "dual package hazard" and complex loader configurations in a monorepo.
