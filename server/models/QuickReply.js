const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('QuickReply', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:  { type: DataTypes.INTEGER, allowNull: false },
    title:     { type: DataTypes.STRING(255), allowNull: false },
    content:   { type: DataTypes.TEXT, allowNull: false },
    shortcut:  { type: DataTypes.STRING(50), defaultValue: '' },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    tableName:   'quick_replies',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
