const express = require('express');
const { z } = require('zod');

const { authRequired, parseOptionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const labController = require('../controllers/labController');

const router = express.Router();

router.get('/challenges', labController.listChallenges);

router.post(
  '/run',
  parseOptionalAuth,
  validate({
    body: z.object({
      language: z.enum(['javascript', 'typescript', 'python', 'java']),
      code: z.string().min(1, '代码不能为空').max(30000, '代码过长'),
      input: z.string().max(3000).optional().default(''),
      challengeId: z.number().int().optional(),
    }),
  }),
  labController.run
);

router.get('/snippets', authRequired, labController.listSnippets);

router.post(
  '/snippets',
  authRequired,
  validate({
    body: z.object({
      snippetId: z.number().int().optional(),
      challengeId: z.number().int().optional().nullable(),
      title: z.string().min(1).max(120),
      language: z.enum(['javascript', 'typescript', 'python', 'java']),
      content: z.string().min(1).max(30000),
      message: z.string().max(200).optional(),
      lastRunOutput: z.string().max(30000).optional(),
    }),
  }),
  labController.saveSnippet
);

router.get(
  '/snippets/:id/versions',
  authRequired,
  validate({
    params: z.object({
      id: z.coerce.number().int(),
    }),
  }),
  labController.listVersions
);

router.post(
  '/snippets/:id/restore',
  authRequired,
  validate({
    params: z.object({
      id: z.coerce.number().int(),
    }),
    body: z.object({
      versionId: z.number().int(),
    }),
  }),
  labController.restoreVersion
);

module.exports = router;
