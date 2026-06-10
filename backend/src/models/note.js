module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Note',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chapterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'notes',
    }
  );
