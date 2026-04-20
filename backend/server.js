const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const taskRoutes = require('./routes/tasks');
const db = require('./database');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Health check endpoint (for Cloud Run/Load Balancer)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/tasks', taskRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error({ err, stack: err.stack }, 'Unhandled error occurred');
  res.status(500).json({ error: 'Something broke on the server!' });
});

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown handler for Cloud Run (SIGTERM)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    logger.info('HTTP server closed.');
    if (db.mongoose) {
      await db.mongoose.close();
      logger.info('MongoDB connection closed.');
    }
    process.exit(0);
  });
});

module.exports = { app, server };
