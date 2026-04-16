const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('WaAuthState', {
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:   { type: DataTypes.INTEGER, allowNull: false },
    dataKey:    { type: DataTypes.STRING(255), allowNull: false },
    dataValue:  { type: DataTypes.TEXT('long'), allowNull: false },
  }, {
    tableName:   'wa_auth_state',
    underscored: true,
    timestamps:  false,
  });
};
