'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Global API rate limiter — 200 requests per 15 minutes per IP.
 * Applied to all /api/* routes.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errors: []
  },
  skip: (req) => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
});

/**
 * Strict auth limiter — 10 requests per 15 minutes per IP.
 * Applied to /api/auth/login, /api/auth/register, /api/auth/forgot-password, /api/auth/reset-password.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Increased limit for dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    errors: []
  },
  skip: (req) => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
});

/**
 * Report generation limiter — 30 requests per 15 minutes per IP.
 * Applied to /api/dashboard/reports/* and PDF endpoints.
 */
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // Increased limit for dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Report generation limit reached. Please wait 15 minutes.',
    errors: []
  },
  skip: (req) => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
});

module.exports = { globalLimiter, authLimiter, reportLimiter };
