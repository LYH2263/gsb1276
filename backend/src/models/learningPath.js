module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'LearningPath',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('not_started', 'learning', 'completed'),
        allowNull: false,
        defaultValue: 'not_started',
      },
      progressPercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'learning_paths',
      indexes: [{ fields: ['user_id', 'course_id'], unique: true }],
    }
  );
