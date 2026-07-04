'use strict';

const { randomUUID } = require('crypto');

/**
 * Attaches a unique X-Request-ID to every request and response.
 * Used for distributed tracing and error correlation.
 * Reuses incoming header if already set (e.g. from a load balancer).
 */
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

module.exports = requestId;
