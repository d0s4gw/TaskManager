# TaskManager Blueprint Index (v6.0)

This directory contains the modularized source code for the TaskManager architecture. Splitting the blueprint into focused modules reduces token usage while maintaining architectural fidelity.

## 🏗 Modular Blueprint Index

1.  **[README.md](./README.md)**: Setup, Phase 0 (Manual Steps), and Global Index.
2.  **[shared.md](./shared.md)**: Shared package configuration, Zod validation, and API types.
3.  **[server.md](./server.md)**: Server structural configs (package.json, Dockerfile), core logic, and middleware.
4.  **[web.md](./web.md)**: Web tier context (Firebase), Auth providers, and UI patterns.
5.  **[infrastructure.md](./infrastructure.md)**: Terraform (WIF, Cloud Run, AR), CI/CD workflows, and Execution Strategy.

---

## I. PHASE 0: THE HUMAN FOUNDATION (DAY 0)
*You must perform these steps manually before initiating the build.*

1.  **GCP Setup**: Create `${app}-staging` and `${app}-prod` projects.
2.  **State Management**: Create a GCS bucket `${app}-tfstate` in the staging project (Uniform access).
3.  **Auth Bootstrap**: Create a `github-deployer` Service Account in both projects. Grant `roles/owner` temporarily. Download JSON key for staging and save as GitHub Secret `GOOGLE_CREDENTIALS`.
4.  **Firebase & API Enablement**: Link Firebase to both projects. Enable Auth (Google), Firestore (Native), and generate App Check (ReCaptcha v3) site keys. **Critical APIs**: Ensure `iamcredentials`, `run`, `firestore`, and `artifactregistry` are enabled.
5.  **App Check Debug Setup**: In the Firebase Console (App Check > Apps), generate a **Debug Token** for your development environment. Save this as `NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN` in your `.env.local` or Secret Manager.
6.  **GitHub Secrets**: Configure the following secrets in your GitHub repository (Settings > Secrets and variables > Actions):

| Secret | Description | Example |
|---|---|---|
| `GCP_PROJECT_ID_STAGING` | Staging project ID | `${app}-staging-123456` |
| `GCP_PROJECT_ID_PROD` | Production project ID | `${app}-prod-123456` |
| `WIF_PROVIDER_STAGING` | WIF provider resource name (staging) | `projects/.../providers/github-deploy-provider` |
| `WIF_PROVIDER_PROD` | WIF provider resource name (prod) | `projects/.../providers/github-deploy-provider` |
| `WIF_SERVICE_ACCOUNT_STAGING` | Deployer SA email (staging) | `github-deployer@${app}-staging.iam.gserviceaccount.com` |
| `WIF_SERVICE_ACCOUNT_PROD` | Deployer SA email (prod) | `github-deployer@${app}-prod.iam.gserviceaccount.com` |
| `GCP_BILLING_ACCOUNT` | Billing account ID | `01ABCD-2EFGH3-4IJKL5` |
| `FIREBASE_API_KEY_STAGING` | Firebase web API key (staging) | From Firebase Console |
| `FIREBASE_API_KEY_PROD` | Firebase web API key (prod) | From Firebase Console |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key | From Firebase App Check |

  Configure as **variables** (not secrets): `ALERT_EMAIL`.
