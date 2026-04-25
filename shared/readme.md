# TaskManager Protocol (Shared Types)

This directory contains the 'source of truth' for TypeScript interfaces and schemas used across the TaskManager ecosystem (Logic Tier and Client Tier).

## Structure

- `user.ts`: User profile and identity schemas.
- `task.ts`: Task data models and DTOs (inferred from validation schemas).
- `validation.ts`: Shared Zod validation schemas for all CRUD operations.
- `api.ts`: Standardized API request/response envelopes.

## Usage

These types are designed to be imported directly into other TypeScript projects within the monorepo using **npm workspaces**.

### Logic Tier (Server)
The server uses the `@shared` alias (configured in `tsconfig.json` and resolved via `module-alias` in production):
```typescript
import { User } from '@shared/user';
import { APIResponse } from '@shared/api';
```

### Web Tier (Frontend)
The Next.js frontend also uses the `@shared` alias:
```typescript
import { Task } from '@shared/task';
import { taskSchema } from '@shared/validation';
```
