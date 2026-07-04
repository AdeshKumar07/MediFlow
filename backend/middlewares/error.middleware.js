'use strict';

const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = err instanceof ApiError ? err : new ApiError(500, err.message || 'Internal Server Error');

  // ── Mongoose: CastError (bad ObjectId) ────────────────────────────
  if (err.name === 'CastError') {
    error = new ApiError(404, `Resource not found — invalid ID: ${err.value}`);
  }

  // ── Mongoose: Duplicate key ────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `Duplicate value for '${field}'. Please use a different value.`);
  }

  // ── Mongoose: ValidationError ──────────────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((v) => ({
      field: v.path,
      message: v.message
    }));
    error = new ApiError(400, 'Validation failed', errors);
  }

  // ── JWT Errors ─────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Session expired — please log in again');
  }

  // ── Malformed JSON body ────────────────────────────────────────────
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new ApiError(400, 'Malformed JSON in request body');
  }

  // ── Multer file-upload errors ──────────────────────────────────────
  if (err.name === 'MulterError') {
    const msgs = {
      LIMIT_FILE_SIZE: 'Uploaded file exceeds the maximum allowed size',
      LIMIT_FILE_COUNT: 'Too many files uploaded',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field in upload'
    };
    error = new ApiError(400, msgs[err.code] || `File upload error: ${err.message}`);
  }

  // ── Rate limit (express-rate-limit passes its own JSON, but just in case) ──
  if (err.status === 429) {
    error = new ApiError(429, err.message || 'Too many requests');
  }

  const statusCode = error.statusCode || 500;
  const requestId  = req.requestId || 'unknown';
  const isProd     = process.env.NODE_ENV === 'production';

  // Structured log — always log to server console
  logger.error(`[${requestId}] ${req.method} ${req.originalUrl} → ${statusCode} — ${error.message}`);
  if (!isProd && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: error.message,
    errors: error.errors || [],
    requestId,
    // Stack only in development
    ...((!isProd && err.stack) ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;
