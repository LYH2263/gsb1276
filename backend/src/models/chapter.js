module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'Chapter',
    {
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      chapterNo: {
        type: DataTypes.INTEGER,
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
      videoUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sampleCode: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      durationMin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
    },
    {
      tableName: 'chapters',
      indexes: [{ fields: ['course_id', 'chapter_no'], unique: true }],
    }
  );
