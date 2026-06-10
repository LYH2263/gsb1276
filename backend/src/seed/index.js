require('dotenv').config();

const bcrypt = require('bcryptjs');

const {
  sequelize,
  User,
  Course,
  Chapter,
  CodingChallenge,
  CommunityPost,
  LearningPath,
  FavoriteKnowledge,
  PortfolioItem,
  ProgressLog,
  Discussion,
  Note,
  CodeSnippet,
  CodeVersion,
} = require('../models');
const { waitForDb } = require('../utils/waitForDb');
const { logger } = require('../utils/logger');

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const [admin] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Orbit Admin',
      role: 'teacher',
      verified: true,
      onboardingCompleted: false,
      learningMinutes: 1260,
      progressPercent: 72,
      streakDays: 9,
      achievementCount: 18,
      avatarUrl:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=260&q=80',
    },
  });

  const [student] = await User.findOrCreate({
    where: { email: 'student@example.com' },
    defaults: {
      email: 'student@example.com',
      passwordHash,
      name: 'Nova Student',
      role: 'student',
      verified: true,
      onboardingCompleted: true,
      learningMinutes: 580,
      progressPercent: 45,
      streakDays: 4,
      achievementCount: 7,
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=260&q=80',
    },
  });

  await User.findOrCreate({
    where: { email: 'enterprise@example.com' },
    defaults: {
      email: 'enterprise@example.com',
      passwordHash,
      name: 'Acme Mentor',
      role: 'enterprise',
      verified: true,
      onboardingCompleted: true,
      learningMinutes: 980,
      progressPercent: 61,
      streakDays: 12,
      achievementCount: 21,
      avatarUrl:
        'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=260&q=80',
    },
  });

  return { admin, student };
}

async function seedCourses() {
  const coursePayload = [
    {
      title: 'JavaScript 全栈入门冲刺',
      summary: '从变量、函数到异步，再到接口联调，建立完整工程认知。',
      coverUrl:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1280&q=80',
      level: 'beginner',
      techStack: ['JavaScript', 'Node.js', 'REST API'],
      popularity: 98,
      featured: true,
      durationHours: 16,
    },
    {
      title: 'TypeScript 工程化实战',
      summary: '掌握类型系统、泛型、模块化和大型前端项目结构化开发。',
      coverUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1280&q=80',
      level: 'intermediate',
      techStack: ['TypeScript', 'Vue3', 'Vite'],
      popularity: 92,
      featured: true,
      durationHours: 22,
    },
    {
      title: 'Python 数据脚本与自动化',
      summary: '通过脚本化思维解决重复问题，构建实用自动化工具链。',
      coverUrl:
        'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1280&q=80',
      level: 'beginner',
      techStack: ['Python', 'Automation', 'CLI'],
      popularity: 88,
      featured: false,
      durationHours: 14,
    },
    {
      title: 'Java 面向对象与并发基础',
      summary: '理解 OOP、集合框架与并发编程，打下后端开发核心基础。',
      coverUrl:
        'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1280&q=80',
      level: 'intermediate',
      techStack: ['Java', 'JVM', 'OOP'],
      popularity: 85,
      featured: false,
      durationHours: 20,
    },
    {
      title: '前端性能优化挑战课',
      summary: '定位渲染瓶颈，优化资源加载与运行性能，打造流畅页面体验。',
      coverUrl:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1280&q=80',
      level: 'advanced',
      techStack: ['Web Performance', 'Lighthouse', 'Caching'],
      popularity: 80,
      featured: true,
      durationHours: 18,
    },
  ];

  const courseMap = new Map();
  for (const payload of coursePayload) {
    const [course] = await Course.findOrCreate({
      where: { title: payload.title },
      defaults: payload,
    });
    courseMap.set(payload.title, course);
  }

  const chapterPayload = [
    {
      courseTitle: 'JavaScript 全栈入门冲刺',
      chapterNo: 1,
      title: '变量、类型与表达式',
      videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
      content: '理解基础语法并通过小练习掌握表达式求值。',
      sampleCode: "const name = 'Code Orbit';\nprocess.stdout.write(`Hi ${name}\\n`);",
      durationMin: 18,
    },
    {
      courseTitle: 'JavaScript 全栈入门冲刺',
      chapterNo: 2,
      title: '函数与作用域',
      videoUrl: 'https://www.youtube.com/embed/N8ap4k_1QEQ',
      content: '掌握函数声明、箭头函数与闭包的实战用法。',
      sampleCode: "const add = (a, b) => a + b;\nprocess.stdout.write(`${add(2, 3)}\\n`);",
      durationMin: 22,
    },
    {
      courseTitle: 'TypeScript 工程化实战',
      chapterNo: 1,
      title: '类型系统速览',
      videoUrl: 'https://www.youtube.com/embed/BwuLxPH8IDs',
      content: '通过基础类型、联合类型快速建立类型化思维。',
      sampleCode: "type User = { id: number; name: string };\nconst u: User = { id: 1, name: 'Neo' };",
      durationMin: 20,
    },
    {
      courseTitle: 'TypeScript 工程化实战',
      chapterNo: 2,
      title: '接口、泛型与工具类型',
      videoUrl: 'https://www.youtube.com/embed/3qBXWUpoPHo',
      content: '用泛型让函数复用并保证安全。',
      sampleCode: 'function wrap<T>(value: T): T[] {\n  return [value];\n}',
      durationMin: 24,
    },
    {
      courseTitle: 'Python 数据脚本与自动化',
      chapterNo: 1,
      title: '脚本结构与输入输出',
      videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
      content: '了解脚本组织方式和常见输入输出模式。',
      sampleCode: "name = 'Orbit'\nprint(f'hello {name}')",
      durationMin: 16,
    },
  ];

  for (const payload of chapterPayload) {
    const course = courseMap.get(payload.courseTitle);
    if (!course) continue;

    await Chapter.findOrCreate({
      where: {
        courseId: course.id,
        chapterNo: payload.chapterNo,
      },
      defaults: {
        courseId: course.id,
        chapterNo: payload.chapterNo,
        title: payload.title,
        videoUrl: payload.videoUrl,
        content: payload.content,
        sampleCode: payload.sampleCode,
        durationMin: payload.durationMin,
      },
    });
  }

  return courseMap;
}

async function seedChallenges() {
  const payloads = [
    {
      title: '算法热身赛：数组去重与排序',
      description: '实现一个函数，输入整数数组，输出升序去重结果。',
      difficulty: 'easy',
      techStack: 'JavaScript',
      reward: '50 积分 + 热身徽章',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      status: 'ongoing',
      starterCode: {
        javascript:
          "function solve(nums) {\n  return [];\n}\nprocess.stdout.write(JSON.stringify(solve([3,2,2,1])) + '\\n');",
        typescript:
          "function solve(nums: number[]): number[] {\n  return [];\n}\nprocess.stdout.write(JSON.stringify(solve([3,2,2,1])) + '\\n');",
        python: 'def solve(nums):\n    return []\n\nprint(solve([3,2,2,1]))',
        java: 'import java.util.*;\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Implement solve");\n  }\n}',
      },
    },
    {
      title: '接口并发请求优化挑战',
      description: '将串行请求改写为并发并控制错误回退。',
      difficulty: 'medium',
      techStack: 'TypeScript',
      reward: '120 积分 + 工程优化徽章',
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      status: 'ongoing',
      starterCode: {
        javascript: "async function run() {\n  return 'todo';\n}\nrun().then(console.log);",
        typescript: "async function run(): Promise<string> {\n  return 'todo';\n}\nrun().then(console.log);",
        python: "import asyncio\n\nasync def run():\n    return 'todo'\n\nprint(asyncio.run(run()))",
        java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Concurrency challenge");\n  }\n}',
      },
    },
  ];

  for (const payload of payloads) {
    await CodingChallenge.findOrCreate({
      where: { title: payload.title },
      defaults: payload,
    });
  }
}

async function seedCommunity() {
  const posts = [
    {
      author: 'Luna',
      title: '如何高效记忆 TypeScript 工具类型？',
      content: '我用“场景驱动”方法来记工具类型，效果很好。欢迎补充你的记忆方式。',
      topic: 'TypeScript',
      heat: 328,
      comments: 58,
    },
    {
      author: 'Orion',
      title: 'Python 自动化脚本如何做异常重试更优雅？',
      content: '最近在做批量任务，重试策略和告警机制有什么最佳实践？',
      topic: 'Python',
      heat: 280,
      comments: 44,
    },
    {
      author: 'Milo',
      title: '前端性能分析从哪里下手？',
      content: '想建立一套可复用的排查流程，从指标到定位再到优化。',
      topic: 'Performance',
      heat: 246,
      comments: 37,
    },
  ];

  for (const post of posts) {
    await CommunityPost.findOrCreate({
      where: { title: post.title },
      defaults: post,
    });
  }
}

async function seedUserData(admin, student, courseMap) {
  const jsCourse = courseMap.get('JavaScript 全栈入门冲刺');
  const tsCourse = courseMap.get('TypeScript 工程化实战');

  if (jsCourse) {
    await LearningPath.findOrCreate({
      where: { userId: admin.id, courseId: jsCourse.id },
      defaults: {
        userId: admin.id,
        courseId: jsCourse.id,
        status: 'learning',
        progressPercent: 80,
      },
    });

    await LearningPath.findOrCreate({
      where: { userId: student.id, courseId: jsCourse.id },
      defaults: {
        userId: student.id,
        courseId: jsCourse.id,
        status: 'learning',
        progressPercent: 46,
      },
    });
  }

  if (tsCourse) {
    await LearningPath.findOrCreate({
      where: { userId: admin.id, courseId: tsCourse.id },
      defaults: {
        userId: admin.id,
        courseId: tsCourse.id,
        status: 'learning',
        progressPercent: 65,
      },
    });
  }

  await FavoriteKnowledge.findOrCreate({
    where: { userId: admin.id, title: '闭包与作用域' },
    defaults: {
      userId: admin.id,
      title: '闭包与作用域',
      summary: '闭包是函数与其词法环境的组合，适合封装状态。',
      tag: 'JavaScript',
    },
  });

  await FavoriteKnowledge.findOrCreate({
    where: { userId: admin.id, title: 'TypeScript 泛型约束' },
    defaults: {
      userId: admin.id,
      title: 'TypeScript 泛型约束',
      summary: '通过 extends 约束泛型，保证调用方满足结构要求。',
      tag: 'TypeScript',
    },
  });

  await PortfolioItem.findOrCreate({
    where: { userId: admin.id, title: '在线刷题助手' },
    defaults: {
      userId: admin.id,
      title: '在线刷题助手',
      description: '一个支持多语言模板、题单管理和学习统计的练习平台。',
      repoUrl: 'https://github.com/example/code-assistant',
      demoUrl: 'https://example.com/demo',
      imageUrl:
        'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1100&q=80',
    },
  });

  const today = new Date();
  for (let i = 9; i >= 0; i -= 1) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = formatDate(d);
    await ProgressLog.findOrCreate({
      where: { userId: admin.id, dateKey },
      defaults: {
        userId: admin.id,
        dateKey,
        minutes: 45 + (i % 3) * 12,
        solvedCount: 2 + (i % 4),
      },
    });
  }

  const firstCourse = await Course.findOne({ order: [['id', 'ASC']] });
  const firstChapter = await Chapter.findOne({ order: [['id', 'ASC']] });

  if (firstCourse) {
    await Discussion.findOrCreate({
      where: {
        courseId: firstCourse.id,
        userId: admin.id,
        content: '这节课里对闭包的解释非常清晰，推荐先自己写一个计数器练习。',
      },
      defaults: {
        courseId: firstCourse.id,
        chapterId: firstChapter?.id || null,
        userId: admin.id,
        content: '这节课里对闭包的解释非常清晰，推荐先自己写一个计数器练习。',
        likes: 6,
      },
    });
  }

  if (firstChapter) {
    await Note.findOrCreate({
      where: {
        userId: admin.id,
        chapterId: firstChapter.id,
        content: '记住：函数定义的位置决定了它能访问哪些变量。',
      },
      defaults: {
        userId: admin.id,
        chapterId: firstChapter.id,
        content: '记住：函数定义的位置决定了它能访问哪些变量。',
      },
    });
  }

  const firstChallenge = await CodingChallenge.findOne({ order: [['id', 'ASC']] });
  if (firstChallenge) {
    const [snippet] = await CodeSnippet.findOrCreate({
      where: {
        userId: admin.id,
        title: '数组去重练习稿',
      },
      defaults: {
        userId: admin.id,
        challengeId: firstChallenge.id,
        title: '数组去重练习稿',
        language: 'javascript',
        content:
          "function solve(nums) {\n  return [...new Set(nums)].sort((a, b) => a - b);\n}\nprocess.stdout.write(JSON.stringify(solve([3,2,2,1])) + '\\n');",
        lastRunOutput: '[1,2,3]',
      },
    });

    await CodeVersion.findOrCreate({
      where: { snippetId: snippet.id, versionNo: 1 },
      defaults: {
        snippetId: snippet.id,
        versionNo: 1,
        content: snippet.content,
        message: '初始化版本',
      },
    });
  }
}

async function seed() {
  await waitForDb({ retries: 60, delayMs: 2000 });
  await sequelize.sync();

  const { admin, student } = await seedUsers();
  const courseMap = await seedCourses();
  await seedChallenges();
  await seedCommunity();
  await seedUserData(admin, student, courseMap);

  logger.info('seed_success', { project: 'label-1276' });
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('seed_failed', {
      message: error?.message,
      stack: error?.stack,
    });
    process.exit(1);
  });
