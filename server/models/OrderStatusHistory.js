const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('OrderStatusHistory', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId:   { type: DataTypes.INTEGER, allowNull: false },
    tenantId:  { type: DataTypes.INTEGER, allowNull: false },
    oldStatus: { type: DataTypes.STRING(20), allowNull: true },
    newStatus: { type: DataTypes.STRING(20), allowNull: false },
    changedBy: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName:   'order_status_history',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
