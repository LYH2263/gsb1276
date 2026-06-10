module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Submission',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      challengeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      code: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      output: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
      runtimeMs: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'submissions',
    }
  );
