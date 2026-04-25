# ADR 0008: Containerization and Deployment

## Status
Accepted

## Context
Need a reproducible and scalable deployment unit.

## Decision
Use **Multi-stage Docker builds** (node:24-slim) deployed to **Google Cloud Run**.

## Rationale
- **Efficiency**: Small image size reduces cold starts.
- **Reproducibility**: 
> task-manager-root@1.0.0 prepare
> command -v husky >/dev/null && husky || true


added 1253 packages, and audited 1257 packages in 20s

253 packages are looking for funding
  run `npm fund` for details

12 vulnerabilities (2 low, 10 moderate)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details. ensures lockfile-exact dependency resolution.
- **Serverless Scale**: Cloud Run provides automatic scaling and zero-downtime rollouts.
