const { asyncHandler } = require('../utils/asyncHandler');
const {
  Course,
  FavoriteKnowledge,
  LearningPath,
  PortfolioItem,
  ProgressLog,
  Submission,
  User,
  CodingChallenge,
} = require('../models');

const overview = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: '用户不存在' },
    });
  }

  const paths = await LearningPath.findAll({
    where: { userId: user.id },
    include: [{ model: Course, as: 'course' }],
    order: [['updatedAt', 'DESC']],
  });
  const recentSubmissions = await Submission.findAll({
    where: { userId: user.id },
    order: [['createdAt', 'DESC']],
    limit: 8,
  });

  const portfolioCount = await PortfolioItem.count({ where: { userId: user.id } });
  const favoriteCount = await FavoriteKnowledge.count({ where: { userId: user.id } });

  return res.json({
    ok: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        settings: user.settings,
        learningMinutes: user.learningMinutes,
        progressPercent: user.progressPercent,
        achievementCount: user.achievementCount,
        streakDays: user.streakDays,
      },
      learningPaths: paths,
      recentSubmissions,
      stats: {
        portfolioCount,
        favoriteCount,
      },
    },
  });
});

const listPortfolio = asyncHandler(async (req, res) => {
  const items = await PortfolioItem.findAll({
    where: { userId: req.user.id },
    order: [['updatedAt', 'DESC']],
  });

  return res.json({ ok: true, data: { items } });
});

const addPortfolio = asyncHandler(async (req, res) => {
  const item = await PortfolioItem.create({
    userId: req.user.id,
    title: req.body.title,
    description: req.body.description,
    repoUrl: req.body.repoUrl || '',
    demoUrl: req.body.demoUrl || '',
    imageUrl: req.body.imageUrl || '',
  });

  return res.json({ ok: true, data: { item } });
});

const listFavorites = asyncHandler(async (req, res) => {
  const items = await FavoriteKnowledge.findAll({
    where: { userId: req.user.id },
    order: [['updatedAt', 'DESC']],
  });

  return res.json({ ok: true, data: { items } });
});

const addFavorite = asyncHandler(async (req, res) => {
  const item = await FavoriteKnowledge.create({
    userId: req.user.id,
    title: req.body.title,
    summary: req.body.summary,
    tag: req.body.tag,
  });

  return res.json({ ok: true, data: { item } });
});

const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: '用户不存在' },
    });
  }

  user.avatarUrl = req.body.avatarUrl;
  await user.save();

  return res.json({ ok: true, data: { avatarUrl: user.avatarUrl } });
});

const updateSettings = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: '用户不存在' },
    });
  }

  user.settings = {
    ...(user.settings || {}),
    ...(req.body.settings || {}),
  };
  await user.save();

  return res.json({ ok: true, data: { settings: user.settings } });
});

const reports = asyncHandler(async (req, res) => {
  const rows = await ProgressLog.findAll({
    where: { userId: req.user.id },
    order: [['dateKey', 'ASC']],
    limit: 30,
  });

  return res.json({ ok: true, data: { reports: rows } });
});

const submissions = asyncHandler(async (req, res) => {
  const rows = await Submission.findAll({
    where: { userId: req.user.id },
    include: [{ model: CodingChallenge, as: 'challenge', attributes: ['id', 'title', 'difficulty'] }],
    order: [['createdAt', 'DESC']],
    limit: 50,
  });

  return res.json({ ok: true, data: { submissions: rows } });
});

module.exports = {
  overview,
  listPortfolio,
  addPortfolio,
  listFavorites,
  addFavorite,
  updateAvatar,
  updateSettings,
  reports,
  submissions,
};
