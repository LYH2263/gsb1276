module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'EmailCode',
    {
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      purpose: {
        type: DataTypes.ENUM('register', 'reset'),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'email_codes',
      indexes: [{ fields: ['email', 'purpose'] }],
    }
  );
