# Blueprint: Server Tier

This module contains the server's structural configuration, entry point, and core middleware.

### 1. Server: `package.json`
```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "rimraf dist && tsc",
    "start": "node dist/server/src/index.js",
    "dev": "NODE_ENV=development ts-node -r tsconfig-paths/register src/index.ts",
    "test": "jest",
    "lint": "eslint . --ext .ts",
    "health": "curl http://localhost:8080/health"
  },
  "dependencies": {
    "@opentelemetry/api": "^1.9.1",
    "@opentelemetry/auto-instrumentations-node": "^0.57.0",
    "@opentelemetry/exporter-trace-otlp-grpc": "^0.57.0",
    "@opentelemetry/resources": "^1.30.0",
    "@opentelemetry/sdk-node": "^0.57.0",
    "@opentelemetry/semantic-conventions": "^1.30.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-rate-limit": "^8.4.1",
    "express-winston": "^4.2.0",
    "firebase-admin": "^13.8.0",
    "module-alias": "^2.2.3",
    "winston": "^3.19.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jest": "^30.0.0",
    "@types/node": "^25.6.0",
    "@types/supertest": "^7.2.0",
    "eslint": "^9.39.4",
    "globals": "^17.5.0",
    "jest": "^30.3.0",
    "rimraf": "^6.1.3",
    "supertest": "^7.2.2",
    "ts-jest": "^29.4.9",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^6.0.3",
    "typescript-eslint": "^8.59.0"
  }
}
```

### 2. Server: `Dockerfile` (Multi-Stage, Workspace-Aware)
```dockerfile
# Stage 1: Build
FROM node:24-slim AS builder
WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY server/package*.json ./server/

# Install dependencies for server and shared workspaces
RUN npm ci --include=dev

# Copy source code
COPY shared ./shared
COPY server ./server

# Build the server
WORKDIR /app/server
RUN npm run build

# Stage 2: Production
FROM node:24-slim
WORKDIR /app/server

# Copy package files for production install
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/shared/package*.json /app/shared/
COPY --from=builder /app/server/package*.json /app/server/

# Install production dependencies
WORKDIR /app
RUN npm ci --omit=dev --workspace server --workspace shared

# Copy built assets from builder
COPY --from=builder /app/server/dist /app/server/dist

ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app/server
EXPOSE 8080
CMD ["npm", "start"]
```

### 3. Server: `eslint.config.js` (Flat Config)
```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-require-imports": "warn",
    }
  }
);
```

### 4. Server: Tracing (`server/src/tracing.ts`)
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const sdk = new NodeSDK({
  resource: new Resource({ [ATTR_SERVICE_NAME]: 'api-service' }),
  traceExporter: new OTLPTraceExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

export const startTracing = () => {
  sdk.start();
  console.log('Tracing initialized');
};

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
```

### 5. Server: Logger (`server/src/logger.ts`)
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: '${app}-api' },
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
```

### 6. Server: Request ID (`server/src/middleware/request-id.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global { namespace Express { interface Request { requestId?: string; } } }

export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};
```

### 7. Server: Auth Middleware (`server/src/middleware/auth.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export interface AuthRequest extends Request { user?: admin.auth.DecodedIdToken; }

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Missing or invalid token' } });
  const token = authHeader.split(' ')[1];

  // E2E Test / Local Dev Bypass
  if (process.env.NODE_ENV === 'development' && token === 'e2e-mock-firebase-id-token') {
    req.user = {
      uid: 'e2e-user-123', email: 'agent@test.com', name: 'Agent',
      auth_time: Math.floor(Date.now() / 1000), iss: 'mock', aud: 'mock',
      sub: 'e2e-user-123', iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      firebase: { identities: {}, sign_in_provider: 'google.com' }
    } as admin.auth.DecodedIdToken;
    return next();
  }

  // App Check Verification (Production)
  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    const appCheckToken = req.headers['x-firebase-appcheck'] as string;
    if (!appCheckToken) return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Missing App Check token' } });
    try { await admin.appCheck().verifyToken(appCheckToken); }
    catch (e) { return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Invalid App Check token' } }); }
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'unauthorized', message: 'Token verification failed' } });
  }
};
```

### 8. Server: Base Repository (`server/src/repositories/base.repository.ts`)
```typescript
import * as admin from 'firebase-admin';

export abstract class BaseRepository<T extends { id: string }> {
  protected collection: admin.firestore.CollectionReference<T>;
  constructor(collectionName: string) {
    this.collection = admin.firestore().collection(collectionName) as admin.firestore.CollectionReference<T>;
  }
  async getById(id: string): Promise<T | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? (doc.data() as T) : null;
  }
  async create(data: T): Promise<void> { await this.collection.doc(data.id).set(data); }
  async update(id: string, data: Partial<T>): Promise<void> {
    await this.collection.doc(id).update(data as admin.firestore.UpdateData<T>);
  }
  async delete(id: string): Promise<void> { await this.collection.doc(id).delete(); }
  async list(): Promise<T[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => doc.data() as T);
  }
}
```

### 9. Server: Entry Point (`server/src/index.ts`)
```typescript
import { startTracing } from './tracing';
startTracing();

import express from 'express';
import * as admin from 'firebase-admin';
import expressWinston from 'express-winston';
import { rateLimit } from 'express-rate-limit';
import logger from './logger';
import { requestId } from './middleware/request-id';

if (!admin.apps.length) { admin.initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT }); }

import taskRoutes from './routes/tasks';
import workspaceRoutes from './routes/workspaces';
import statsRoutes from './routes/stats';

const app = express();
app.use(require('cors')({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000 }));
app.use(requestId);
app.use(expressWinston.logger({
  winstonInstance: logger,
  dynamicMeta: (req) => ({ requestId: req.requestId }),
}));

app.use('/api/tasks', taskRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/stats', statsRoutes);

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'healthy' } }));

const port = process.env.PORT || 8080;
app.listen(port, () => logger.info(`Server listening on port ${port}`));
```
