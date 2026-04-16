const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Client', {
    id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:           { type: DataTypes.INTEGER, allowNull: false },
    phoneNumber:        { type: DataTypes.STRING(50), allowNull: false },
    name:               { type: DataTypes.STRING(255), defaultValue: '' },
    email:              { type: DataTypes.STRING(255), defaultValue: '' },
    notes:              { type: DataTypes.TEXT('medium'), allowNull: true },
    tags:               { type: DataTypes.STRING(500), defaultValue: '' },
    totalConversations: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    totalOrders:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lastContactAt:      { type: DataTypes.DATE, allowNull: true },
    segment:            { type: DataTypes.STRING(50), allowNull: true },
  }, {
    tableName:   'clients',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
