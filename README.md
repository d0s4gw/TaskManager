# TaskManager

3-tier task management application built for scale and security.

## 📁 Repository Structure
- **/server**: Logic Tier (Node.js, Express, TypeScript, Cloud Run).
- **/web**: Web Tier (Next.js, Tailwind, Firebase Hosting).
- **/mobile**: Mobile Tier (Flutter).
- **/shared**: Shared TypeScript interfaces and models.
- **/terraform**: Infrastructure-as-Code (GCP).
- **/docs**: [System Architecture and Infrastructure Specifications](./docs/architecture.md).

## 🏗️ Architecture Highlights
- **Build Resilience**: "Build-aware" Firebase initialization ensures static site generation survives missing secrets.
- **Observability**: Structured JSON logging across all tiers for native Google Cloud Logging integration. Request-ID correlation enables cross-service debugging.
- **Type Safety**: Unified domain models shared between frontend and backend.
- **Stateless Logic**: Scalable, containerized backend optimized for cold-start performance.

## 🚀 Deployment (GitOps)
The project uses a fully automated CI/CD pipeline in GitHub Actions.

### Staging Environment
Push to the `main` branch to trigger:
1. **Test Gate**: Server (Jest), Web (Vitest), and Terraform (validate + fmt) must all pass.
2. **Infra Sync**: Terraform updates roles, APIs, and scaling.
3. **Build**: Cloud Build compiles the Logic Tier with shared dependencies.
4. **Deploy**: Automatic rollout to Cloud Run and Firebase Hosting.

## 🛠️ Local Development

### 1. Configure Environment
Create `.env` files in `/server` and `/web` based on the provided `.env.example` templates.

### 2. Run Locally
- **Server**: `cd server && npm run dev`
- **Web**: `cd web && npm run dev`

### 3. Run Tests
- **Server**: `cd server && npm test` (includes coverage report)
- **Web**: `cd web && npm test` (runs Vitest suite)

## 🔐 Security Standards
- **Workload Identity Federation**: Zero static keys for deployment.
- **Least Privilege**: Service-specific IAM identities.
- **Firebase App Check**: Enforced for Web and Mobile surfaces.
- **Secret Manager**: Secure handling of API keys and database credentials.
