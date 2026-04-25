# ADR 0013: Automated Guardrails (Husky & Lint-Staged)

## Status
Accepted

## Context
Inconsistent code style and linting errors often reach CI, wasting build time and developer focus.

## Decision
Enforce local linting and formatting via **Husky** and **lint-staged**.

## Rationale
- **Developer Flow**: Immediate feedback before code leaves the local environment.
- **Code Quality**: Ensures a consistent standard across all monorepo tiers.
- **CI Efficiency**: Reduces "re-push" cycles caused by simple syntax or style errors.
