const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const goalRoutes = require('./routes/goalRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Trust reverse proxy (Render, Heroku, AWS ELB, etc.) for HTTPS detection, secure cookies, and rate limiting
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic CORS configuration supporting credentials (cookies) across Vercel and local environments
const parseAllowedOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  if (process.env.CLIENT_URL) {
    const configured = process.env.CLIENT_URL.split(',')
      .map((url) => url.trim().replace(/\/+$/, ''))
      .filter(Boolean);
    return [...defaults, ...configured];
  }

  return defaults;
};

const allowedOrigins = parseAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');

      const isAllowed =
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:') ||
        (process.env.NODE_ENV === 'production' && normalizedOrigin.endsWith('.vercel.app'));

      if (isAllowed) {
        return callback(null, true);
      }

      // Return a structured CORS rejection
      return callback(new Error(`CORS Error: Origin ${origin} not authorized by policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging in non-test environments
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Dual health check endpoint (supports /health and /api/health for Render/cloud load balancers)
const healthHandler = (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    app: 'DevTrack — Developer Progress Hub API',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/integrations', integrationRoutes);

// Catch 404 and forward to error handler
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
