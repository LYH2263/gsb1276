const express = require('express');
const { z } = require('zod');

const { authRequired } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/overview', authRequired, dashboardController.overview);
router.get('/portfolio', authRequired, dashboardController.listPortfolio);
router.get('/favorites', authRequired, dashboardController.listFavorites);
router.get('/reports', authRequired, dashboardController.reports);
router.get('/submissions', authRequired, dashboardController.submissions);

router.post(
  '/portfolio',
  authRequired,
  validate({
    body: z.object({
      title: z.string().min(2).max(120),
      description: z.string().min(4).max(1000),
      repoUrl: z.string().url().optional().or(z.literal('')),
      demoUrl: z.string().url().optional().or(z.literal('')),
      imageUrl: z.string().url().optional().or(z.literal('')),
    }),
  }),
  dashboardController.addPortfolio
);

router.post(
  '/favorites',
  authRequired,
  validate({
    body: z.object({
      title: z.string().min(2).max(120),
      summary: z.string().min(2).max(800),
      tag: z.string().min(1).max(50),
    }),
  }),
  dashboardController.addFavorite
);

router.post(
  '/avatar',
  authRequired,
  validate({
    body: z.object({
      avatarUrl: z.string().min(10).max(250000),
    }),
  }),
  dashboardController.updateAvatar
);

router.post(
  '/settings',
  authRequired,
  validate({
    body: z.object({
      settings: z.object({
        theme: z.enum(['light', 'dark']).optional(),
        language: z.string().max(20).optional(),
        editorFontSize: z.number().int().min(12).max(22).optional(),
      }),
    }),
  }),
  dashboardController.updateSettings
);

module.exports = router;
