module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'CommunityPost',
    {
      author: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(160),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      topic: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      heat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      comments: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'community_posts',
    }
  );
