# TaskManager Protocol (Shared Types)

This directory contains the 'source of truth' for TypeScript interfaces and schemas used across the TaskManager ecosystem (Logic Tier and Client Tier).

## Structure

- `user.ts`: User profile and identity schemas.
- `task.ts`: Task data models and DTOs (inferred from validation schemas).
- `validation.ts`: Shared Zod validation schemas for all CRUD operations.
- `api.ts`: Standardized API request/response envelopes.

## Usage

These types are designed to be imported directly into other TypeScript projects within the monorepo.

### Server-side (Logic Tier)
In `server/tsconfig.json`, the shared directory is mapped to the `@shared` alias:
```typescript
import { User } from '../../shared/user';
```

### Client-side (Frontend)
Future frontend implementations should reference these types to ensure API compatibility and strict typing of state management.
