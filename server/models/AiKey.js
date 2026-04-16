const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('AiKey', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:       { type: DataTypes.INTEGER, allowNull: false },
    label:          { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    provider:       { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'openai' },
    apiKey:         { type: DataTypes.STRING(500), allowNull: false },
    customEndpoint: { type: DataTypes.STRING(500), defaultValue: '' },
  }, {
    tableName:   'ai_keys',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
