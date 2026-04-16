const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('AiModel', {
    id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
    aiKeyId:  { type: DataTypes.INTEGER, allowNull: false },
    model:    { type: DataTypes.STRING(100), allowNull: false },
    label:    { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    isActive: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
  }, {
    tableName:   'ai_models',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
