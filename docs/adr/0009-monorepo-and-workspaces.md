# ADR 0009: Monorepo and Workspaces

## Status
Accepted

## Context
Managing multiple packages (Server, Web, Shared) separately creates overhead.

## Decision
Organize the repository using **npm workspaces**.

## Rationale
- **Unified Deps**: Manage all dependencies from the root .
- **Local Resolution**: Tiers can reference the  package seamlessly.
- **CI/CD**: Simplifies building and testing the entire stack in a single pipeline.
