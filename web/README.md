# TaskManager - Web Surface

The web surface for TaskManager is a high-performance, minimalist dashboard built with Next.js. It serves as the primary desktop interface for managing workflows and project dependencies.

## 🚀 Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google Sign-In)
- **Security**: Firebase App Check
- **Deployment**: Firebase Hosting + Cloud Run Proxy

## 🏗 Architecture
- **API Proxying**: All requests to `/api/**` are proxied via `firebase.json` to the backend running on Google Cloud Run. This avoids CORS issues and consolidates the API under the same origin.
- **Shared Types**: Utilizes the centralized `/shared` directory for API response and data models, ensuring type safety between frontend and backend.

## 🛠 Features Implemented
- **Premium UI**: Custom-built dashboard with glassmorphism elements and dark mode support.
- **Login with Google**: Ready-to-connect UI for Google authentication.
- **App Check Protection**: Integrated security layer to protect backend tokens.
- **API Simulation**: Built-in console to test connectivity with the Cloud Run backend.

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)

### Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env.local` (see `next_steps.txt`).
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## 📄 Documentation
- [Decisions Log](decisions.log): Why we chose these technologies.
- [Next Steps](next_steps.txt): Immediate tasks for the next development session.
