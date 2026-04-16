const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Whitelist', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:    { type: DataTypes.INTEGER, allowNull: false },
    phoneNumber: { type: DataTypes.STRING(50), allowNull: false },
    label:       { type: DataTypes.STRING(255), defaultValue: '' },
  }, {
    tableName:   'whitelist',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
