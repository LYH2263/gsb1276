const { asyncHandler } = require('../utils/asyncHandler');
const { CodingChallenge, CommunityPost, Course, LearningPath, User } = require('../models');

const overview = asyncHandler(async (req, res) => {
  const featuredCourses = await Course.findAll({
    order: [
      ['featured', 'DESC'],
      ['popularity', 'DESC'],
    ],
    limit: 6,
  });

  const allCourses = await Course.findAll({ order: [['popularity', 'DESC']] });
  const stackCount = {};
  allCourses.forEach((course) => {
    (course.techStack || []).forEach((tag) => {
      stackCount[tag] = (stackCount[tag] || 0) + 1;
    });
  });

  const hotStacks = Object.entries(stackCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  const challenges = await CodingChallenge.findAll({
    order: [['deadline', 'ASC']],
    limit: 3,
  });

  const communityPosts = await CommunityPost.findAll({
    order: [
      ['heat', 'DESC'],
      ['comments', 'DESC'],
    ],
    limit: 6,
  });

  let progress = {
    learningMinutes: 0,
    progressPercent: 0,
    achievementCount: 0,
    streakDays: 0,
  };

  let recommendations = featuredCourses.slice(0, 3);

  if (req.user?.id) {
    const user = await User.findByPk(req.user.id);
    if (user) {
      progress = {
        learningMinutes: user.learningMinutes,
        progressPercent: user.progressPercent,
        achievementCount: user.achievementCount,
        streakDays: user.streakDays,
      };

      const pathRows = await LearningPath.findAll({ where: { userId: user.id }, limit: 4 });
      if (pathRows.length > 0) {
        const courseIds = pathRows.map((item) => item.courseId);
        recommendations = await Course.findAll({ where: { id: courseIds } });
      }
    }
  }

  return res.json({
    ok: true,
    data: {
      serverTime: new Date().toISOString(),
      featuredCourses,
      hotStacks,
      challenges,
      communityPosts,
      recommendations,
      progress,
      quickStartTemplates: {
        javascript: "function solve() {\n  process.stdout.write('Hello JavaScript\\n');\n}\nsolve();",
        typescript:
          "type User = { name: string };\nconst user: User = { name: 'Code Orbit' };\nprocess.stdout.write(`${user.name}\\n`);",
        python: "def solve():\n    print('Hello Python')\n\nsolve()",
        java: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello Java\");\n  }\n}",
      },
    },
  });
});

module.exports = { overview };
