const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('BusinessInfo', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:    { type: DataTypes.INTEGER, allowNull: false, unique: true },
    name:        { type: DataTypes.STRING(255), allowNull: false, defaultValue: '' },
    description: { type: DataTypes.TEXT, allowNull: true },
    address:     { type: DataTypes.TEXT, allowNull: true },
    phone:       { type: DataTypes.STRING(50), defaultValue: '' },
    hours:       { type: DataTypes.TEXT, allowNull: true },
    policies:    { type: DataTypes.TEXT, allowNull: true },
    extraInfo:   { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName:   'business_info',
    underscored: true,
    timestamps:  true,
    createdAt:   false,
    updatedAt:   'updated_at',
  });
};
