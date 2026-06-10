module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Discussion',
    {
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chapterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'discussions',
    }
  );
