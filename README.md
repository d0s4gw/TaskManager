# TaskManager

3-tier task management application built for scale and security.

## 📁 Repository Structure
- **/server**: Logic Tier (Node.js, Express, TypeScript, Cloud Run).
- **/web**: Web Tier (Next.js, Tailwind, Firebase Hosting).
- **/mobile**: Mobile Tier (Flutter).
- **/shared**: Shared TypeScript interfaces and models.
- **/terraform**: Infrastructure-as-Code (GCP).
- **/docs/adr**: [Architecture Decision Records](./docs/adr/): Why we built it this way.
- **/ROADMAP.md**: [Project Roadmap](./ROADMAP.md): Where we are going.

> [!TIP]
> For tactical, tier-specific tasks, see the `TODO.md` files in each tier (server, web, terraform).

## 🏗️ Architecture Highlights
- **Type Safety & Validation**: Unified domain models and Zod validation schemas shared between frontend and backend in the `/shared` package.
- **npm Workspaces**: The repository is organized as a monorepo using **npm workspaces** for dependency management and local package resolution.
- **Observability**: Structured JSON logging across all tiers for native Google Cloud Logging integration. Request-ID correlation enables cross-service debugging.
- **Stateless Logic**: Scalable, containerized backend optimized for cold-start performance.

## 🚀 Deployment (GitOps)
The project uses a fully automated CI/CD pipeline in GitHub Actions.

### Staging Environment
Push to the `main` branch to trigger:
1. **Hardened Test Gate**: Server (Jest + ESLint), Web (Vitest + ESLint), E2E (Playwright), and Terraform (validate + fmt) must all pass.
2. **Security & Audit**: `npm audit` is performed to catch high-severity vulnerabilities.
3. **Infra Sync**: Terraform updates roles, APIs, and scaling.
4. **Build & Deploy**: Automatic rollout to Cloud Run and Firebase Hosting via Cloud Build.

## 🛠️ Local Development

### 1. Setup Environment
Run the setup script to install all dependencies and create default configuration files:
```bash
./setup-local.sh
```

### 2. Run Unified Stack
Start both the Logic Tier (server) and Web Tier (frontend) simultaneously using `concurrently`:
```bash
npm run dev
```

### 3. Local Guardrails (Husky)
The project uses **Husky** and **lint-staged**. Staged files are automatically linted and formatted before every commit. You can run them manually:
```bash
npx lint-staged
```

### 3. Automated Testing (Agent Mode)
For AI agents or rapid local testing, you can bypass the manual Google Login by appending the `agentLogin` query parameter:
- **URL**: [http://localhost:3000/?agentLogin=true](http://localhost:3000/?agentLogin=true)
- **Effect**: Automatically authenticates as "Agent Gemini" using a mocked token that the local server accepts.

### 4. Run Tests
- **Full Suite**: `npm test` from the root (runs all workspaces).
- **Server**: `npm test --workspace server`
- **Web (Unit)**: `npm test --workspace web`
- **Web (E2E)**: `npm run test:e2e --workspace web`

---

## 🤖 AI Interaction
This repository is **AI-Native**. It includes a hierarchical instruction system to ensure architectural fidelity:
- **`CLAUDE.md`**: Root orchestrator and "Shipping Guard."
- **Tier-specific `CLAUDE.md`**: Local guides in `server/`, `web/`, `shared/`, `mobile/`, and `terraform/`.

> [!TIP]
> **Bootstrap Command**: If you are an AI assistant, simply say **"Load TaskManager"** to automatically ingest the full project context and safety protocols.

For the definitive system blueprint, see [TEMPLATE_PROMPT.md](./TEMPLATE_PROMPT.md).

## 🔐 Security Standards
- **Workload Identity Federation**: Zero static keys for deployment.
- **Least Privilege**: Service-specific IAM identities.
- **Firebase App Check**: Enforced for Web and Mobile surfaces.
- **Secret Manager**: Secure handling of API keys and database credentials.
