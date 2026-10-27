const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const { connectMariaDB, syncMariaDB, sequelize } = require('./config/db.mariadb');
const { connectMongoDB, mongoose } = require('./config/db.mongodb');
const auditLogger = require('./middleware/auditLogger');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy for reverse proxies / Cloudflare Tunnel
app.set('trust proxy', 1);

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://10.100.30.57:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      // Allow localhost or local IP matches dynamically in dev
      if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('10.100.30.57'))) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for tunnel ease-of-use
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'cf-connecting-ip'],
  })
);

// Standard Body Parsers & Cookie Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Audit & Telemetry Logger Middleware (runs on every request to record footprint to MongoDB)
app.use(auditLogger);

// Dual-Database Health Check Endpoint
app.get('/api/health', async (req, res) => {
  let mariaStatus = 'disconnected';
  let mongoStatus = 'disconnected';

  try {
    await sequelize.authenticate();
    mariaStatus = 'connected';
  } catch (e) {
    mariaStatus = `error: ${e.message}`;
  }

  if (mongoose.connection.readyState === 1) {
    mongoStatus = 'connected';
  } else {
    mongoStatus = `state_${mongoose.connection.readyState}`;
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    databases: {
      mariaDB: mariaStatus,
      mongoDB: mongoStatus,
    },
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount Central API Routes
app.use('/api', apiRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DevShowcase Dual-Database Backend API is active.',
    documentation: '/api/health',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[GlobalErrorHandler]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

/**
 * Bootstrap Server and Database Connections
 */
const startServer = async () => {
  console.log('--- Initializing DevShowcase Server ---');
  
  // 1. Connect and sync MariaDB
  const mariaConnected = await connectMariaDB();
  if (mariaConnected) {
    try {
      await syncMariaDB(false);
    } catch (e) {
      console.warn('[MariaDB] Sync warning:', e.message);
    }
  } else {
    console.warn('[MariaDB] Continuing startup without initial MariaDB connection (will retry on queries).');
  }

  // 2. Connect MongoDB
  const mongoConnected = await connectMongoDB();
  if (!mongoConnected) {
    console.warn('[MongoDB] Continuing startup without initial MongoDB connection (will retry on queries).');
  }

  // 3. Start Express HTTP Server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DevShowcase Server is listening on http://0.0.0.0:${PORT}`);
    console.log(`📡 Health check available at: http://localhost:${PORT}/api/health`);
  });
};

startServer();

module.exports = app;
