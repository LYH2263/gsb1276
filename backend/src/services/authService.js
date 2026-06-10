const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { EmailCode, User } = require('../models');

function generateCode() {
  return String(Math.floor(Math.random() * 900000) + 100000);
}

function buildToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET || 'change-me-in-production',
    { expiresIn: '7d' }
  );
}

function userView(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    verified: user.verified,
    avatarUrl: user.avatarUrl,
    onboardingCompleted: user.onboardingCompleted,
    learningMinutes: user.learningMinutes,
    progressPercent: user.progressPercent,
    streakDays: user.streakDays,
    achievementCount: user.achievementCount,
    settings: user.settings,
  };
}

async function sendEmailCode({ email, purpose }) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailCode.create({
    email,
    purpose,
    code,
    expiresAt,
    used: false,
  });

  return {
    email,
    purpose,
    expiresAt,
    demoCode: code,
  };
}

async function verifyCode({ email, purpose, code }) {
  const item = await EmailCode.findOne({
    where: {
      email,
      purpose,
      code,
      used: false,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [['id', 'DESC']],
  });

  if (!item) return false;
  item.used = true;
  await item.save();
  return true;
}

async function register({ email, password, name, role, code }) {
  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return {
      ok: false,
      error: { code: 'EMAIL_EXISTS', message: '邮箱已注册' },
    };
  }

  const codeOk = await verifyCode({ email, purpose: 'register', code });
  if (!codeOk) {
    return {
      ok: false,
      error: { code: 'CODE_INVALID', message: '验证码错误或已过期' },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    passwordHash,
    name,
    role,
    verified: true,
  });

  const token = buildToken(user);
  return {
    ok: true,
    data: {
      token,
      user: userView(user),
    },
  };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return {
      ok: false,
      error: { code: 'LOGIN_FAILED', message: '账号或密码错误' },
    };
  }

  const matched = await bcrypt.compare(password, user.passwordHash);
  if (!matched) {
    return {
      ok: false,
      error: { code: 'LOGIN_FAILED', message: '账号或密码错误' },
    };
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = buildToken(user);
  return {
    ok: true,
    data: {
      token,
      user: userView(user),
    },
  };
}

async function resetPassword({ email, code, newPassword }) {
  const codeOk = await verifyCode({ email, purpose: 'reset', code });
  if (!codeOk) {
    return {
      ok: false,
      error: { code: 'CODE_INVALID', message: '验证码错误或已过期' },
    };
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return {
      ok: false,
      error: { code: 'NOT_FOUND', message: '用户不存在' },
    };
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { ok: true, data: { success: true } };
}

async function completeOnboarding(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    return {
      ok: false,
      error: { code: 'NOT_FOUND', message: '用户不存在' },
    };
  }

  user.onboardingCompleted = true;
  await user.save();

  return { ok: true, data: { user: userView(user) } };
}

async function getMe(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    return {
      ok: false,
      error: { code: 'NOT_FOUND', message: '用户不存在' },
    };
  }

  return {
    ok: true,
    data: { user: userView(user) },
  };
}

module.exports = {
  sendEmailCode,
  register,
  login,
  resetPassword,
  completeOnboarding,
  getMe,
};
