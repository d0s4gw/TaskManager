# TaskManager

A modern, cloud-native task management application designed for high-contrast readability and minimal UI clutter.

## Architecture
This project is built for the Google Cloud ecosystem:
- **Backend**: Node.js + Express API using **Google Cloud Firestore (via MongoDB API)** for scalable, serverless data storage.
- **Frontend**: React Single Page Application (SPA) built with Vite, secured with **Firebase Authentication**.
- **Deployment**: Configured for **Google Cloud Run** (Backend) and **Firebase Hosting** (Frontend).

## Development Setup

### 1. Database & Authentication
1. Enable **Firestore** and **Authentication** (Email/Google) in your Firebase Console.
2. Enable the **Firestore MongoDB API** and create a database instance.
3. Generate a Service Account key and save it as `backend/service-account.json`.
4. Create a `backend/.env` file with your `MONGODB_URI` and `GOOGLE_APPLICATION_CREDENTIALS` path.
5. Create a `frontend/.env` file with your Firebase Web Config.

### 2. Start the Backend
```bash
cd backend
npm install
npm start
```
*The backend runs on `http://localhost:3001`.*

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend.*

## Testing
The application includes a comprehensive test suite with auth mocking.

**Run backend tests (Jest + Supertest):**
```bash
cd backend
npm test
```

## Deployment
This project is ready for deployment:
- **Backend**: `gcloud run deploy taskmanager-backend --source .`
- **Frontend**: `npm run build && firebase deploy`
