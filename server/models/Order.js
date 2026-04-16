const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Order', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:       { type: DataTypes.INTEGER, allowNull: false },
    conversationId: { type: DataTypes.INTEGER, allowNull: true },
    phoneNumber:    { type: DataTypes.STRING(50), allowNull: false },
    contactName:    { type: DataTypes.STRING(255), defaultValue: '' },
    items:          { type: DataTypes.TEXT, allowNull: false },
    total:          { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    notes:          { type: DataTypes.TEXT, allowNull: true },
    status:         { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pending' },
  }, {
    tableName:   'orders',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   'updated_at',
  });
};
