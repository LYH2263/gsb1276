module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'ProgressLog',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dateKey: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      solvedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'progress_logs',
      indexes: [{ fields: ['user_id', 'date_key'], unique: true }],
    }
  );
