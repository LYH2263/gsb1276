module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    'CodeVersion',
    {
      snippetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      versionNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      tableName: 'code_versions',
      indexes: [{ fields: ['snippet_id', 'version_no'], unique: true }],
    }
  );
