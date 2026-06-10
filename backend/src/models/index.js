const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const EmailCode = require('./emailCode')(sequelize, DataTypes);
const Course = require('./course')(sequelize, DataTypes);
const Chapter = require('./chapter')(sequelize, DataTypes);
const Discussion = require('./discussion')(sequelize, DataTypes);
const Note = require('./note')(sequelize, DataTypes);
const CodingChallenge = require('./codingChallenge')(sequelize, DataTypes);
const Submission = require('./submission')(sequelize, DataTypes);
const CodeSnippet = require('./codeSnippet')(sequelize, DataTypes);
const CodeVersion = require('./codeVersion')(sequelize, DataTypes);
const LearningPath = require('./learningPath')(sequelize, DataTypes);
const PortfolioItem = require('./portfolioItem')(sequelize, DataTypes);
const FavoriteKnowledge = require('./favoriteKnowledge')(sequelize, DataTypes);
const CommunityPost = require('./communityPost')(sequelize, DataTypes);
const ProgressLog = require('./progressLog')(sequelize, DataTypes);

Course.hasMany(Chapter, { foreignKey: 'courseId', as: 'chapters' });
Chapter.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Course.hasMany(Discussion, { foreignKey: 'courseId', as: 'discussions' });
Discussion.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Chapter.hasMany(Discussion, { foreignKey: 'chapterId', as: 'discussions' });
Discussion.belongsTo(Chapter, { foreignKey: 'chapterId', as: 'chapter' });

User.hasMany(Discussion, { foreignKey: 'userId', as: 'discussionList' });
Discussion.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Chapter.hasMany(Note, { foreignKey: 'chapterId', as: 'notes' });
Note.belongsTo(Chapter, { foreignKey: 'chapterId', as: 'chapter' });

User.hasMany(Note, { foreignKey: 'userId', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'userId', as: 'user' });

CodingChallenge.hasMany(Submission, { foreignKey: 'challengeId', as: 'submissions' });
Submission.belongsTo(CodingChallenge, { foreignKey: 'challengeId', as: 'challenge' });

User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' });

CodingChallenge.hasMany(CodeSnippet, { foreignKey: 'challengeId', as: 'snippets' });
CodeSnippet.belongsTo(CodingChallenge, { foreignKey: 'challengeId', as: 'challenge' });

User.hasMany(CodeSnippet, { foreignKey: 'userId', as: 'snippets' });
CodeSnippet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

CodeSnippet.hasMany(CodeVersion, { foreignKey: 'snippetId', as: 'versions' });
CodeVersion.belongsTo(CodeSnippet, { foreignKey: 'snippetId', as: 'snippet' });

User.hasMany(LearningPath, { foreignKey: 'userId', as: 'learningPaths' });
LearningPath.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Course.hasMany(LearningPath, { foreignKey: 'courseId', as: 'learningUsers' });
LearningPath.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(PortfolioItem, { foreignKey: 'userId', as: 'portfolio' });
PortfolioItem.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(FavoriteKnowledge, { foreignKey: 'userId', as: 'favoritePoints' });
FavoriteKnowledge.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ProgressLog, { foreignKey: 'userId', as: 'progressLogs' });
ProgressLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  EmailCode,
  Course,
  Chapter,
  Discussion,
  Note,
  CodingChallenge,
  Submission,
  CodeSnippet,
  CodeVersion,
  LearningPath,
  PortfolioItem,
  FavoriteKnowledge,
  CommunityPost,
  ProgressLog,
};
