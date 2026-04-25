# ADR 0012: In-Process Mocking Strategy

## Status
Accepted

## Context
Dependency on live services (Firebase, Firestore) during local dev and testing slows down development and increases complexity.

## Decision
Use in-process mocks (e.g., `InProcessTaskRepository`, `window.__E2E_MOCK_USER__`) for local development and E2E testing.

## Rationale
- **Performance**: Tests run significantly faster without network overhead.
- **Determinism**: Mock data is predictable and isolated per test run.
- **Simplicity**: No need to manage external emulator states or credentials for basic UI/Logic testing.
