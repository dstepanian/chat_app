const { isDevelopment } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    name: err.name
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    message,
    error: isDevelopment() ? {
      message: err.message,
      stack: err.stack,
      name: err.name
    } : undefined
  });
};

module.exports = { errorHandler }; 