const { asyncHandler } = require('../utils/asyncHandler');
const { Chapter, Course, Discussion, LearningPath, Note, User } = require('../models');

const listCourses = asyncHandler(async (req, res) => {
  const courses = await Course.findAll({ order: [['popularity', 'DESC']] });
  const courseIds = courses.map((item) => item.id);
  const chapters = courseIds.length
    ? await Chapter.findAll({
        where: { courseId: courseIds },
        order: [
          ['courseId', 'ASC'],
          ['chapterNo', 'ASC'],
        ],
      })
    : [];

  const chapterMap = new Map();
  chapters.forEach((chapter) => {
    if (!chapterMap.has(chapter.courseId)) chapterMap.set(chapter.courseId, []);
    chapterMap.get(chapter.courseId).push(chapter);
  });

  const courseList = courses.map((course) => ({
    ...course.toJSON(),
    chapters: chapterMap.get(course.id) || [],
  }));

  return res.json({ ok: true, data: { courses: courseList } });
});

const listDiscussions = asyncHandler(async (req, res) => {
  const where = { courseId: req.query.courseId };
  if (req.query.chapterId) where.chapterId = req.query.chapterId;

  const discussions = await Discussion.findAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'role', 'avatarUrl'] }],
    order: [['createdAt', 'DESC']],
    limit: 200,
  });

  return res.json({ ok: true, data: { discussions } });
});

const addDiscussion = asyncHandler(async (req, res) => {
  const discussion = await Discussion.create({
    courseId: req.body.courseId,
    chapterId: req.body.chapterId || null,
    userId: req.user.id,
    content: req.body.content,
    likes: 0,
  });

  return res.json({ ok: true, data: { discussion } });
});

const listNotes = asyncHandler(async (req, res) => {
  const where = { userId: req.user.id };
  if (req.query.chapterId) where.chapterId = req.query.chapterId;

  const notes = await Note.findAll({
    where,
    include: [{ model: Chapter, as: 'chapter', attributes: ['id', 'title', 'chapterNo'] }],
    order: [['updatedAt', 'DESC']],
  });

  return res.json({ ok: true, data: { notes } });
});

const saveNote = asyncHandler(async (req, res) => {
  const note = await Note.create({
    userId: req.user.id,
    chapterId: req.body.chapterId,
    content: req.body.content,
  });

  return res.json({ ok: true, data: { note } });
});

const getPath = asyncHandler(async (req, res) => {
  const rows = await LearningPath.findAll({
    where: { userId: req.user.id },
    include: [{ model: Course, as: 'course' }],
    order: [['updatedAt', 'DESC']],
  });

  return res.json({ ok: true, data: { paths: rows } });
});

const updatePath = asyncHandler(async (req, res) => {
  const [row] = await LearningPath.findOrCreate({
    where: {
      userId: req.user.id,
      courseId: req.body.courseId,
    },
    defaults: {
      userId: req.user.id,
      courseId: req.body.courseId,
      status: req.body.status,
      progressPercent: req.body.progressPercent,
    },
  });

  row.status = req.body.status;
  row.progressPercent = req.body.progressPercent;
  await row.save();

  return res.json({ ok: true, data: { path: row } });
});

module.exports = {
  listCourses,
  listDiscussions,
  addDiscussion,
  listNotes,
  saveNote,
  getPath,
  updatePath,
};
