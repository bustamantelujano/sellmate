const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('AiUsage', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:     { type: DataTypes.INTEGER, allowNull: false },
    provider:     { type: DataTypes.STRING(50), allowNull: false },
    model:        { type: DataTypes.STRING(100), allowNull: false },
    inputTokens:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    outputTokens: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    totalTokens:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    costEstimate: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    requestType:  { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'chat' },
  }, {
    tableName:   'ai_usage',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
