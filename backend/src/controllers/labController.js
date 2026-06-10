const { asyncHandler } = require('../utils/asyncHandler');
const { runCode } = require('../services/executionService');
const { CodeSnippet, CodeVersion, CodingChallenge, Submission } = require('../models');

const listChallenges = asyncHandler(async (req, res) => {
  const challenges = await CodingChallenge.findAll({
    order: [
      ['status', 'ASC'],
      ['deadline', 'ASC'],
    ],
  });

  return res.json({ ok: true, data: { challenges } });
});

const run = asyncHandler(async (req, res) => {
  const { language, code, input, challengeId } = req.body;
  try {
    const result = await runCode({ language, code, input: input || '' });

    let submissionId = null;
    if (req.user?.id && challengeId) {
      const score = result.exitCode !== 0 ? 40 : Math.min(100, 70 + Math.floor((result.stdout || '').length / 8));
      const submission = await Submission.create({
        userId: req.user.id,
        challengeId,
        language,
        code,
        output: `${result.stdout || ''}${result.stderr ? `\n${result.stderr}` : ''}`,
        runtimeMs: result.runtimeMs,
        score,
      });
      submissionId = submission.id;
    }

    return res.json({
      ok: true,
      data: {
        ...result,
        submissionId,
      },
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: {
        code: 'RUN_FAILED',
        message: error.message || '代码运行失败',
      },
    });
  }
});

const listSnippets = asyncHandler(async (req, res) => {
  const snippets = await CodeSnippet.findAll({
    where: { userId: req.user.id },
    order: [['updatedAt', 'DESC']],
    limit: 100,
  });

  return res.json({ ok: true, data: { snippets } });
});

const saveSnippet = asyncHandler(async (req, res) => {
  const { snippetId, challengeId, title, language, content, message, lastRunOutput } = req.body;

  let snippet;
  if (snippetId) {
    snippet = await CodeSnippet.findOne({ where: { id: snippetId, userId: req.user.id } });
    if (!snippet) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: '代码片段不存在' },
      });
    }

    snippet.challengeId = challengeId || null;
    snippet.title = title;
    snippet.language = language;
    snippet.content = content;
    snippet.lastRunOutput = lastRunOutput || snippet.lastRunOutput;
    await snippet.save();
  } else {
    snippet = await CodeSnippet.create({
      userId: req.user.id,
      challengeId: challengeId || null,
      title,
      language,
      content,
      lastRunOutput: lastRunOutput || '',
    });
  }

  const latestVersion =
    (await CodeVersion.max('versionNo', {
      where: { snippetId: snippet.id },
    })) || 0;

  const version = await CodeVersion.create({
    snippetId: snippet.id,
    versionNo: latestVersion + 1,
    content,
    message: message || '手动保存',
  });

  return res.json({ ok: true, data: { snippet, version } });
});

const listVersions = asyncHandler(async (req, res) => {
  const snippet = await CodeSnippet.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!snippet) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: '代码片段不存在' },
    });
  }

  const versions = await CodeVersion.findAll({
    where: { snippetId: snippet.id },
    order: [['versionNo', 'DESC']],
  });

  return res.json({ ok: true, data: { versions } });
});

const restoreVersion = asyncHandler(async (req, res) => {
  const snippet = await CodeSnippet.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!snippet) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: '代码片段不存在' },
    });
  }

  const version = await CodeVersion.findOne({
    where: { snippetId: snippet.id, id: req.body.versionId },
  });

  if (!version) {
    return res.status(404).json({
      ok: false,
      error: { code: 'NOT_FOUND', message: '目标版本不存在' },
    });
  }

  snippet.content = version.content;
  await snippet.save();

  return res.json({ ok: true, data: { snippet } });
});

module.exports = {
  listChallenges,
  run,
  listSnippets,
  saveSnippet,
  listVersions,
  restoreVersion,
};
