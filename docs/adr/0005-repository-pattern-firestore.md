# ADR 0005: Repository Pattern for Firestore

## Status
Accepted

## Context
Direct database calls in route handlers lead to tight coupling and difficult testing.

## Decision
Implement a **BaseRepository** abstraction for all Firestore interactions.

## Rationale
- **Decoupling**: Business logic is independent of the database client.
- **Consistency**: Standardized CRUD operations across all entities.
- **Testability**: Easier to swap for in-memory mocks during development and testing.
