import 'module-alias/register';
import { startTracing } from './tracing';
// Start tracing before any other imports to ensure auto-instrumentation works
startTracing();

import express from 'express';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import expressWinston from 'express-winston';
import { APIResponse } from '@shared/api';
import logger from './logger';
import { requestId } from './middleware/request-id';

dotenv.config();

// Initialize Firebase Admin before any routes or repositories are imported
if (!admin.apps.length) {
  if (process.env.NODE_ENV === 'development') {
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
    logger.info('Using Firestore Emulator at localhost:8081');
  }
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'task-manager-dev',
  });
}

import taskRoutes from './routes/tasks';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Assign a unique request ID to every inbound request
app.use(requestId);

// Request Logging — include requestId in every log line
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  dynamicMeta: (req) => ({ requestId: req.requestId }),
}));

// Task Routes
app.use('/api/tasks', taskRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  const response: APIResponse<{ status: string; uptime: number }> = {
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
    },
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
  res.status(200).json(response);
});

app.use(expressWinston.errorLogger({
  winstonInstance: logger,
  dynamicMeta: (req) => ({ requestId: req.requestId }),
}));

// Start Server
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

export default app;
