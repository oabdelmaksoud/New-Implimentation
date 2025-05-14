class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.isOperational = true;
  }
}

class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
    this.isOperational = true;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with ID ${id} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.isOperational = true;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message || 'Internal server error');
    this.name = 'InternalServerError';
    this.statusCode = 500;
    this.isOperational = true;
  }
}

module.exports = {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  InternalServerError
};
