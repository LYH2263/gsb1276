const express = require('express');
const { z } = require('zod');

const { authRequired } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/send-email-code',
  validate({
    body: z.object({
      email: z.string().email('邮箱格式不正确'),
      purpose: z.enum(['register', 'reset']),
    }),
  }),
  authController.sendEmailCode
);

router.post(
  '/register',
  validate({
    body: z.object({
      email: z.string().email('邮箱格式不正确'),
      password: z.string().min(6, '密码至少 6 位'),
      name: z.string().min(2, '用户名至少 2 位').max(30, '用户名过长'),
      role: z.enum(['student', 'teacher', 'enterprise']),
      code: z.string().length(6, '验证码为 6 位'),
    }),
  }),
  authController.register
);

router.post(
  '/login',
  validate({
    body: z.object({
      email: z.string().email('邮箱格式不正确'),
      password: z.string().min(1, '请输入密码'),
    }),
  }),
  authController.login
);

router.post(
  '/forgot-password',
  validate({
    body: z.object({
      email: z.string().email('邮箱格式不正确'),
    }),
  }),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate({
    body: z.object({
      email: z.string().email('邮箱格式不正确'),
      code: z.string().length(6, '验证码为 6 位'),
      newPassword: z.string().min(6, '密码至少 6 位'),
    }),
  }),
  authController.resetPassword
);

router.get('/me', authRequired, authController.me);
router.post('/onboarding/complete', authRequired, authController.completeOnboarding);

module.exports = router;
