const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Tenant', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    slug:         { type: DataTypes.STRING(255), allowNull: false, unique: true },
    name:         { type: DataTypes.STRING(255), allowNull: false },
    ownerUserId:  { type: DataTypes.INTEGER, allowNull: true },
    plan:         { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'free' },
    active:       { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  }, {
    tableName:  'tenants',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
