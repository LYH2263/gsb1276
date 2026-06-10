module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'FavoriteKnowledge',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tag: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      tableName: 'favorite_knowledge',
    }
  );
