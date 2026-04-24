# TaskManager "BULLETPROOF SYSTEM BLUEPRINT" (v5.0)

This document is the definitive source of truth for replicating the TaskManager architecture. It contains the **full source code** for every structural and infrastructure component of the system. 

Use this prompt to build a production-grade 3-tier application on GCP with zero drift and absolute architectural fidelity.

---

## I. PHASE 0: THE HUMAN FOUNDATION (DAY 0)
*You must perform these steps manually before initiating the build.*

1.  **GCP Setup**: Create `${app}-staging` and `${app}-prod` projects.
2.  **State Management**: Create a GCS bucket `${app}-tfstate` in the staging project (Uniform access).
3.  **Auth Bootstrap**: Create a `github-deployer` Service Account in both projects. Grant `roles/owner` temporarily. Download JSON key for staging and save as GitHub Secret `GOOGLE_CREDENTIALS`.
4.  **Firebase initialization**: Link Firebase to both projects. Enable Auth (Google), Firestore (Native), and generate App Check (ReCaptcha v3) site keys.

---

## II. THE HARDWARE MANIFESTS (STRUCTURAL CONFIGS)

### 1. Server: `package.json`
```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "rimraf dist && tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "jest"
  },
  "dependencies": {
    "@opentelemetry/api": "^1.9.1",
    "@opentelemetry/auto-instrumentations-node": "^0.57.0",
    "@opentelemetry/exporter-trace-otlp-grpc": "^0.57.0",
    "@opentelemetry/resources": "^1.30.0",
    "@opentelemetry/sdk-node": "^0.57.0",
    "@opentelemetry/semantic-conventions": "^1.30.0",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "express-winston": "^4.2.0",
    "firebase-admin": "^13.8.0",
    "winston": "^3.19.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.6.0",
    "typescript": "^6.0.3",
    "rimraf": "^6.1.3",
    "ts-node": "^10.9.2"
  }
}
```

### 2. Server: `Dockerfile` (Multi-Stage)
```dockerfile
FROM node:24-slim AS builder
WORKDIR /app
COPY shared ./shared
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

FROM node:24-slim
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/shared /app/shared
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/server/src/index.js"]
```

### 3. Root: `cloudbuild.yaml`
```yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/server', '-f', 'server/Dockerfile', '.']
images:
- 'gcr.io/$PROJECT_ID/server'
```

---

## III. THE NERVOUS SYSTEM (SHARED & LOGIC)

### 1. Shared Types (`shared/api.ts`)
```typescript
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: { code?: string; message: string; };
  metadata?: { timestamp: string; requestId?: string; };
}
```

### 2. Server: Tracing (`server/src/tracing.ts`)
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

### 3. Server: Request ID (`server/src/middleware/request-id.ts`)
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

### 4. Server: Auth Middleware (`server/src/middleware/auth.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

export interface AuthRequest extends Request { user?: admin.auth.DecodedIdToken; }

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { message: 'Token verification failed' } });
  }
};
```

### 5. Server: Base Repository (`server/src/repositories/base.repository.ts`)
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
}
```

### 6. Server: Entry Point (`server/src/index.ts`)
```typescript
import { startTracing } from './tracing';
startTracing();

import express from 'express';
import * as admin from 'firebase-admin';
import expressWinston from 'express-winston';
import logger from './logger';
import { requestId } from './middleware/request-id';

if (!admin.apps.length) { admin.initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT }); }

const app = express();
app.use(express.json());
app.use(requestId);
app.use(expressWinston.logger({
  winstonInstance: logger,
  dynamicMeta: (req) => ({ requestId: req.requestId }),
}));

app.get('/health', (req, res) => res.json({ success: true, data: { status: 'healthy' } }));

const port = process.env.PORT || 8080;
app.listen(port, () => logger.info(`Server listening on port ${port}`));
```

---

## IV. THE FACE (WEB TIER)

### 1. Web: Firebase Guard (`web/src/lib/firebase.ts`)
```typescript
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
try { app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig); }
catch (e) { app = { name: "[DEFAULT]" } as any; }

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {}
}

export const auth = typeof window !== "undefined" ? getAuth(app) : ({} as any);
export default app;
```

### 2. Web: Auth Context (`web/src/context/AuthContext.tsx`)
```typescript
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType { user: User | null; loading: boolean; }
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext)!;
```

---

## V. THE SKELETAL SYSTEM (INFRASTRUCTURE)

### 1. Terraform: `providers.tf`
```hcl
terraform {
  required_version = ">= 1.0.0"
  required_providers { google = { source = "hashicorp/google"; version = "~> 6.0" } }
}
provider "google" { project = var.project_id; region = var.region }
```

### 2. Terraform: `main.tf` (WIF + SAs)
```hcl
resource "google_iam_workload_identity_pool" "github_pool" {
  project = var.project_id
  workload_identity_pool_id = "github-pool"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  project = var.project_id
  workload_identity_pool_id = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-deploy-provider"
  attribute_mapping = { "google.subject" = "assertion.sub", "attribute.repository" = "assertion.repository" }
  oidc { issuer_uri = "https://token.actions.githubusercontent.com" }
}

resource "google_service_account" "runtime_sa" {
  project = var.project_id
  account_id = "api-runtime-sa"
}

resource "google_project_iam_member" "runtime_roles" {
  for_each = toset(["roles/datastore.user", "roles/cloudtrace.agent", "roles/secretmanager.secretAccessor"])
  project = var.project_id
  role = each.key
  member = "serviceAccount:${google_service_account.runtime_sa.email}"
}

moved { from = google_iam_workload_identity_pool.github_pool[0]; to = google_iam_workload_identity_pool.github_pool }
```

---

## VI. THE PULSE (CI/CD)

### 1. `.github/workflows/deploy.yml`
```yaml
name: Deploy
on: { push: { branches: [ main ] } }
permissions: { contents: read, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
      - name: Terraform
        run: |
          cd terraform
          terraform init
          terraform workspace select staging || terraform workspace new staging
          terraform apply -var-file=environments/staging.tfvars -auto-approve
      - name: Deploy
        run: |
          gcloud builds submit . --config cloudbuild.yaml
          gcloud run deploy api --image gcr.io/${{ env.PROJECT_ID }}/server --service-account api-runtime-sa@${{ env.PROJECT_ID }}.iam.gserviceaccount.com
```

---

## VII. EXECUTION STRATEGY
1.  **Clone structures exactly**.
2.  **Ensure OTel is Line 1** of server `index.ts`.
3.  **Ensure Proxying** is via `firebase.json` rewrites.
4.  **Verify WIF** project numbers in member bindings.
5.  **Audit** OTel init, JSON logging, and RequestID propagation.
