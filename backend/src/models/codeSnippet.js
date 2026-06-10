module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'CodeSnippet',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      challengeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      lastRunOutput: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
      },
    },
    {
      tableName: 'code_snippets',
    }
  );
