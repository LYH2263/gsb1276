const { asyncHandler } = require('../utils/asyncHandler');
const authService = require('../services/authService');

function sendResult(res, result, successStatus = 200) {
  if (!result.ok) return res.status(400).json(result);
  return res.status(successStatus).json(result);
}

const sendEmailCode = asyncHandler(async (req, res) => {
  const data = await authService.sendEmailCode(req.body);
  return res.json({ ok: true, data });
});

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendResult(res, result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendResult(res, result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.sendEmailCode({
    email: req.body.email,
    purpose: 'reset',
  });
  return res.json({ ok: true, data });
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return sendResult(res, result);
});

const me = asyncHandler(async (req, res) => {
  const result = await authService.getMe(req.user.id);
  if (!result.ok) return res.status(404).json(result);
  return res.json(result);
});

const completeOnboarding = asyncHandler(async (req, res) => {
  const result = await authService.completeOnboarding(req.user.id);
  if (!result.ok) return res.status(404).json(result);
  return res.json(result);
});

module.exports = {
  sendEmailCode,
  register,
  login,
  forgotPassword,
  resetPassword,
  me,
  completeOnboarding,
};
