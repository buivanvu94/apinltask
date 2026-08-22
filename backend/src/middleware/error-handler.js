const { ZodError } = require('zod');

// Known Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
const PRISMA_ERROR_STATUS = { P2025: 404, P2002: 409 };

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.issues });
  }

  if (typeof err.code === 'string' && PRISMA_ERROR_STATUS[err.code]) {
    return res.status(PRISMA_ERROR_STATUS[err.code]).json({ error: err.code === 'P2025' ? 'Not found' : 'Conflict' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
