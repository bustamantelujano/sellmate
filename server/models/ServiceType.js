const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ServiceType', {
    id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:        { type: DataTypes.INTEGER, allowNull: false },
    name:            { type: DataTypes.STRING(255), allowNull: false },
    durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    bufferMinutes:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    price:           { type: DataTypes.DOUBLE, allowNull: true },
    color:           { type: DataTypes.STRING(20), defaultValue: '#3b82f6' },
    active:          { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  }, {
    tableName:   'service_types',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
