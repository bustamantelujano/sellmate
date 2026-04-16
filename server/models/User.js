const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:     { type: DataTypes.INTEGER, allowNull: true },
    email:        { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    name:         { type: DataTypes.STRING(255), allowNull: false },
    role:         { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'agent' },
    superAdmin:   { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    createdBy:    { type: DataTypes.INTEGER, allowNull: true },
    active:       { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  }, {
    tableName:   'users',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
