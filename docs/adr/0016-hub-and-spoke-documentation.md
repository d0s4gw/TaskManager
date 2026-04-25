# ADR 0016: Hub & Spoke Documentation Model

## Status
Accepted

## Context
Distributed architectural logs (`decisions.log`) were leading to fragmentation and info drift.

## Decision
Adopt a **Hub & Spoke** documentation model:
1. **Hub**: Centralized ADRs in `docs/adr/` and a root `ROADMAP.md`.
2. **Spoke**: Tactical `TODO.md` files within each tier.

## Rationale
- **Clarity**: Single source of truth for architectural history.
- **Maintainability**: Reduces duplication and stale information.
- **Discoverability**: Centralized docs are easier for both humans and AI agents to navigate.
