# Developer & AI Agent Notes

This file contains "institutional knowledge" and critical patterns for the TaskManager project. Read this before starting any major feature development.

## 🧠 Core Philosophy
- **Shared First**: All data structures and API response formats **must** be defined in the `/shared` directory as TypeScript interfaces first. Do not define models locally in `server/` or `web/` without a corresponding shared definition.
- **Security by Default**: Every new endpoint in `server/` must be wrapped with the Firebase Auth middleware. No unauthenticated data access is permitted except for `/health`.

## 🔐 Authentication & Security
- **JWT Handling**: The backend validates tokens using `firebase-admin`. Clients must send the `Authorization: Bearer <ID_TOKEN>` header.
- **App Check**: All front-channel requests are protected by Firebase App Check. If you encounter 401/403 errors in production but not in development, verify the App Check enforcement settings.
- **Secret Management**: Do not use `.env` files for production secrets. Use Google Secret Manager. The `terraform/` layer handles the provisioning of these secrets.

## 🚀 Deployment & CI/CD
- **Environment**: Node.js 24 is the project standard. All CI/CD pipelines and local development should target Node 24.
- **Workflow**: We use GitHub Actions with **Workload Identity Federation (WIF)**. Use `npm ci` for all installations in CI/CD to ensure build stability.
- **Project Number**: The GCP Project Number is `1279412370`.
- **Promotion Path**: Code is pushed to `main`, which triggers a deployment to the `staging` environment. Production promotion is currently manual via Terraform.

## 📱 Mobile (Flutter) Patterns
- **Model Parity**: Dart models in `mobile/lib/models/` must manually track the `/shared` TypeScript interfaces. If you update a TS interface, you **must** update the corresponding Dart model.
- **State Management**: The project is currently set up for a service-based architecture. Use **Riverpod** for state management moving forward to ensure scalability.

## 🌐 Web (Next.js) Patterns
- **API Proxy**: Use the `/api` prefix for all backend calls. Firebase Hosting rewrites proxy these calls to the Cloud Run server.
- **Observability**: Use the structured `JSON` logger in `web/src/lib/logger.ts` for all important events. This ensures logs are properly parsed by Cloud Logging.
- **Firebase Initialization**: Firebase is initialized with a "build-aware" pattern in `web/src/lib/firebase.ts` to prevent build-time crashes when environment variables are missing.

## 🛠 Local Development
- **Backend**: `npm run dev` in `server/`. Run tests with `npm test`.
- **Frontend**: `npm run dev` in `web/`. Run tests with `npm test`.
- **Mobile**: `flutter run` in `mobile/`.
- **Local API**: To test the web-to-server connection locally, ensure you have configured your `.env` files based on the `.env.example` templates in each tier.
