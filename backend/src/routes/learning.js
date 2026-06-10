const express = require('express');
const { z } = require('zod');

const learningController = require('../controllers/learningController');
const { authRequired } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/courses', learningController.listCourses);

router.get(
  '/discussions',
  validate({
    query: z.object({
      courseId: z.coerce.number().int(),
      chapterId: z.coerce.number().int().optional(),
    }),
  }),
  learningController.listDiscussions
);

router.post(
  '/discussions',
  authRequired,
  validate({
    body: z.object({
      courseId: z.number().int(),
      chapterId: z.number().int().optional().nullable(),
      content: z.string().min(2).max(1200),
    }),
  }),
  learningController.addDiscussion
);

router.get(
  '/notes',
  authRequired,
  validate({
    query: z.object({
      chapterId: z.coerce.number().int().optional(),
    }),
  }),
  learningController.listNotes
);

router.post(
  '/notes',
  authRequired,
  validate({
    body: z.object({
      chapterId: z.number().int(),
      content: z.string().min(2).max(3000),
    }),
  }),
  learningController.saveNote
);

router.get('/path', authRequired, learningController.getPath);

router.post(
  '/path',
  authRequired,
  validate({
    body: z.object({
      courseId: z.number().int(),
      status: z.enum(['not_started', 'learning', 'completed']),
      progressPercent: z.number().int().min(0).max(100),
    }),
  }),
  learningController.updatePath
);

module.exports = router;
