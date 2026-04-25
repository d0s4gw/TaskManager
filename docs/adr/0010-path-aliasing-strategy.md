# ADR 0010: Path Aliasing Strategy

## Status
Accepted

## Context
Deeply nested relative imports () are brittle and hard to maintain.

## Decision
Use the **@shared** alias for all shared package imports.

## Rationale
- **Stability**: Moving files within a tier doesn't break shared imports.
- **Readability**: Clearer intent in source code.
- **Implementation**: Handled via  paths (dev) and  (prod).
