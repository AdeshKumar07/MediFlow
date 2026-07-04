'use strict';

/**
 * Standard API response envelope.
 *
 * Shape: { success, statusCode, message, data, requestId? }
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success', requestId = undefined) {
    this.success    = statusCode < 400;
    this.statusCode = statusCode;
    this.message    = message;
    this.data       = data;
    if (requestId) this.requestId = requestId;
  }
}

module.exports = ApiResponse;
