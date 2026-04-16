const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('TenantModule', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:  { type: DataTypes.INTEGER, allowNull: false },
    moduleKey: { type: DataTypes.STRING(50), allowNull: false },
    enabled:   { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    config:    { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName:   'tenant_modules',
    underscored: true,
    timestamps:  false,
  });
};
