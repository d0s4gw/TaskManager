import { startTracing } from './tracing';
// Start tracing before any other imports to ensure auto-instrumentation works
startTracing();

import express from 'express';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import expressWinston from 'express-winston';
import { APIResponse } from '../../shared/api';
import logger from './logger';
import taskRoutes from './routes/tasks';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'task-manager-staging-494203',
  });
}

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Request Logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
}));

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

// Task Routes
app.use('/api/tasks', taskRoutes);

// Error Logging
app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

// Start Server
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

export default app;
