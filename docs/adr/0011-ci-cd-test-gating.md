# ADR 0011: CI/CD Test Gating

## Status
Accepted

## Context
Deploying untested code can lead to regressions and production downtime.

## Decision
Implement a "Hardened Test Gate" in GitHub Actions. Deployments are blocked unless **all** unit, integration, E2E tests, and security audits pass.

## Rationale
- **Quality Assurance**: Ensures only verified code reaches the staging/production environments.
- **Security**: Mandatory `npm audit` prevents shipping known vulnerabilities.
- **Stability**: Terraform validation prevents broken infrastructure changes.
