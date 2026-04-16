const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Webhook', {
    id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
    url:      { type: DataTypes.STRING(500), allowNull: false },
    event:    { type: DataTypes.STRING(50), allowNull: false },
    label:    { type: DataTypes.STRING(255), defaultValue: '' },
    active:   { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  }, {
    tableName:   'webhooks',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
