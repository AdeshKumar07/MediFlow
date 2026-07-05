'use strict';

require('dotenv').config();
const path         = require('path');
const fs           = require('fs');

// Ensure upload directories exist on startup (especially for Render ephemeral filesystem)
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads', 'hospital-images')
];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');

const connectDB        = require('./config/db');
const swaggerSpec      = require('./config/swagger');
const swaggerUi        = require('swagger-ui-express');

const authRoutes          = require('./routes/auth.routes');
const dashboardRoutes     = require('./routes/dashboard.routes');
const hospitalRoutes      = require('./routes/hospital.routes');
const staffRoutes         = require('./routes/staff.routes');
const patientRoutes       = require('./routes/patient.routes');
const appointmentRoutes   = require('./routes/appointment.routes');
const medicalRecordRoutes = require('./routes/medicalRecord.routes');
const availabilityRoutes  = require('./routes/availability.routes');
const pharmacyRoutes      = require('./routes/pharmacy.routes');
const laboratoryRoutes    = require('./routes/laboratory.routes');
const billingRoutes       = require('./routes/billing.routes');
const announcementRoutes      = require('./routes/announcement.routes');
const consultationNoteRoutes  = require('./routes/consultationNote.routes');

const errorHandler  = require('./middlewares/error.middleware');
const requestId     = require('./middlewares/requestId.middleware');
const { globalLimiter, authLimiter, reportLimiter } = require('./middlewares/rateLimit.middleware');

const logger   = require('./utils/logger');
const ApiError = require('./utils/apiError');

// ── Database ─────────────────────────────────────────────────────────────────
connectDB();

const app  = express();
const isProd = process.env.NODE_ENV === 'production';

// ── Request ID (first — so every middleware has req.requestId) ────────────────
app.use(requestId);

// ── Security: Helmet (hardened) ───────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://unpkg.com'],
        scriptSrc:  ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        imgSrc:     ["'self'", 'data:', 'https:'],
        fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,       // 1 year
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin), whitelisted origins, and ANY .vercel.app preview domain
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  })
);

// ── Compression (gzip) ────────────────────────────────────────────────────────
app.use(compression());

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── HTTP Logging ──────────────────────────────────────────────────────────────
app.use(
  morgan(isProd ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/health' // suppress noisy health checks
  })
);

// ── Global Rate Limiter (all API routes) ──────────────────────────────────────
app.use('/api', globalLimiter);

// ── Swagger API Docs (disabled in production unless DEBUG_DOCS=true) ──────────
if (!isProd || process.env.DEBUG_DOCS === 'true') {
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'MediFlow API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
      }
    })
  );
  // Raw OpenAPI JSON for Postman / tooling
  app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
  logger.info(`Swagger UI → http://localhost:${process.env.PORT || 5000}/api/docs`);
}

// ── Health Check ──────────────────────────────────────────────────────────────
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Server health check
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:   { type: string, example: ok }
 *                 env:      { type: string, example: production }
 *                 uptime:   { type: number }
 *                 time:     { type: string, format: date-time }
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    env:    process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    time:   new Date()
  });
});

// ── Application Routes ────────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter, authRoutes);     // strict limiter on auth
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/hospital',     hospitalRoutes);
app.use('/api/staff',        staffRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emr',          medicalRecordRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/pharmacy',     pharmacyRoutes);
app.use('/api/laboratory',   laboratoryRoutes);
app.use('/api/billing',      billingRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notes',         consultationNoteRoutes);

// Report endpoints get their own stricter limiter
app.use('/api/dashboard/reports', reportLimiter);

// ── 404 Fallback ──────────────────────────────────────────────────────────────
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Route '${req.originalUrl}' not found on this server`));
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Server Start ──────────────────────────────────────────────────────────────
const PORT   = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 MediFlow server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// ── Graceful Shutdown (SIGTERM from Render / Docker) ──────────────────────────
const gracefulShutdown = (signal) => {
  logger.warn(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // Force exit after 10 s if connections don't drain
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app; // export for testing
