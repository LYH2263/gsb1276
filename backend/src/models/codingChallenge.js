module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'CodingChallenge',
    {
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
        defaultValue: 'easy',
      },
      techStack: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      reward: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      starterCode: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM('upcoming', 'ongoing', 'ended'),
        allowNull: false,
        defaultValue: 'ongoing',
      },
    },
    {
      tableName: 'coding_challenges',
    }
  );
