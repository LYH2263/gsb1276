const { ZodError } = require('zod');
const { logger } = require('../utils/logger');

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.issues[0]?.message || '请求参数不合法',
        details: err.issues,
      },
    });
  }

  logger.error('request_failed', {
    path: req.path,
    method: req.method,
    message: err?.message,
    stack: err?.stack,
  });

  if (res.headersSent) return next(err);

  return res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
    },
  });
}

module.exports = { errorHandler };
