# TaskManager - Full Stack 3-Tier Application

TaskManager is a robust, cloud-native application designed to manage project dependencies and workflows across Web and Mobile platforms.

## 📂 Project Structure

```text
TaskManager/
├── web/            # Next.js Web Surface (App Router, Tailwind)
├── mobile/         # Flutter Mobile Surface (iOS/Android)
├── server/         # Node.js/Express Backend (Cloud Run)
├── shared/         # TypeScript Interfaces (Single Source of Truth)
├── terraform/      # GCP Infrastructure as Code
└── .github/        # Deployment Workflows (WIF enabled)
```

## 🚀 Architectural Overview
- **Frontend**: Next.js (Web) and Flutter (Mobile) providing a consistent, premium experience.
- **Backend**: Serverless Node.js API deployed on **Google Cloud Run**.
- **Database**: **Cloud Firestore** for real-time persistence.
- **Infrastructure**: Fully provisioned via **Terraform** with **Workload Identity Federation** for secure CI/CD.
- **Security**: **Firebase App Check** for API protection and **Secret Manager** for credential handling.

## 🛠 Quick Start

### 1. Backend
Navigate to `/server`, install dependencies, and run locally or deploy via Cloud Build.

### 2. Frontend (Web)
Navigate to `/web`, run `npm run dev` to start the dashboard. Proxies to backend via Firebase Hosting.

### 3. Frontend (Mobile)
Navigate to `/mobile`, run `flutter run` to start the mobile app.

## 📄 Key Documentation
- [System Design Artifact](.gemini/antigravity/brain/da24c583-dfc9-4823-93fb-da2a163ea602/system_design.md): Deep dive into the stack architecture.
- [Walkthrough](.gemini/antigravity/brain/da24c583-dfc9-4823-93fb-da2a163ea602/walkthrough.md): Deployment and verification records.
- [Developer Notes](DEVELOPER_NOTES.md): Essential patterns and "institutional knowledge" for AI agents.
- **Decisions Logs**: Found in each surface directory (`web/`, `mobile/`, `server/`).
- **Next Steps**: Roadmaps found in each surface directory.

## 🔐 Security Note
This project uses **Workload Identity Federation**. Ensure your GitHub repository is authorized in the Terraform WIF pool before running the deployment pipeline.
