# ADR 0001: Shared Types Protocol

## Status
Accepted

## Context
The project requires a single 'source of truth' for data structures and API response formats used across the Logic Tier (Server) and Client Tiers (Web, Mobile).

## Decision
Implement a `/shared` directory at the project root containing TypeScript interfaces and Zod schemas. This package is integrated into each tier via **npm workspaces**.

## Rationale
- **Consistency**: Prevents drift between frontend and backend models.
- **Efficiency**: Reduces duplicate code across the monorepo.
- **Type Safety**: Enables end-to-end type safety from the database layer to the UI.

## Consequences
- Tiers must include the shared directory in their build context.
- Mobile (Flutter) must manually track these interfaces or use a generator (planned).
