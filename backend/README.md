# TaskManager Backend

This is the Express API that powers the TaskManager application. It is a cloud-native service designed for serverless deployment.

## Tech Stack
- **Database**: Google Cloud Firestore (via MongoDB API)
- **ODM**: Mongoose
- **Authentication**: Firebase Admin SDK (JWT Verification)
- **Security**: `helmet` and `cors`
- **Validation**: `express-validator`

## Setup
1. **Service Account**: Place your Google Cloud `service-account.json` in this directory.
2. **Environment**: Create a `.env` file with `MONGODB_URI` and `GOOGLE_APPLICATION_CREDENTIALS`.
3. **Install**: `npm install`
4. **Run**: `npm start`

## Scripts
- `npm start`: Runs `node server.js`.
- `npm test`: Runs the Jest integration test suite with Firebase Auth mocking.

## API Endpoints
All endpoints require a `Bearer <token>` in the `Authorization` header.
- `GET /api/tasks`: Retrieve tasks for the authenticated user.
- `POST /api/tasks`: Create a new task.
- `PUT /api/tasks/:id`: Update a task (owner only).
- `DELETE /api/tasks/:id`: Delete a task (owner only).
