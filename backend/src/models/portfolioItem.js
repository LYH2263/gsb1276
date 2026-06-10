module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'PortfolioItem',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      repoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      demoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'portfolio_items',
    }
  );
