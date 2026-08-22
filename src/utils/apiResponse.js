// ─────────────────────────────────────────────────────────────
// EchoSign — Standardised API Response Helpers
// ─────────────────────────────────────────────────────────────

const { HTTP_STATUS } = require('../constants');

/**
 * Send a successful JSON response.
 * @param {import('express').Response} res
 * @param {*}      data       - Response payload
 * @param {string} message    - Human-readable success message
 * @param {number} statusCode - HTTP status (default 200)
 */
function success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send an error JSON response.
 * @param {import('express').Response} res
 * @param {string}       message    - Human-readable error description
 * @param {number}       statusCode - HTTP status (default 500)
 * @param {Array|null}   errors     - Optional array of detailed error objects
 */
function error(res, message = 'Internal Server Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

/**
 * Send a validation-error JSON response (400).
 * @param {import('express').Response} res
 * @param {Array} errors - Array of validation error objects from express-validator
 */
function validationError(res, errors) {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: 'Validation failed',
    errors: errors.map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    })),
    timestamp: new Date().toISOString(),
  });
}

module.exports = { success, error, validationError };
