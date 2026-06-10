module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Course',
    {
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      coverUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      level: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false,
      },
      techStack: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      popularity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      durationHours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 8,
      },
    },
    {
      tableName: 'courses',
    }
  );
