const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '请先登录',
      },
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me-in-production');
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'TOKEN_INVALID',
        message: '登录状态已失效',
      },
    });
  }
}

function parseOptionalAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'change-me-in-production');
  } catch (_) {
    req.user = null;
  }
  return next();
}

module.exports = { authRequired, parseOptionalAuth };
