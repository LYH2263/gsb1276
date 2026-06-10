module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('student', 'teacher', 'enterprise'),
        allowNull: false,
        defaultValue: 'student',
      },
      avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      onboardingCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      learningMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      progressPercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      streakDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      achievementCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      settings: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          theme: 'light',
          language: 'zh-CN',
          editorFontSize: 14,
        },
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'users',
    }
  );
