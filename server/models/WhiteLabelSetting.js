const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('WhiteLabelSetting', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:     { type: DataTypes.INTEGER, allowNull: false, unique: true },
    appName:      { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'SellMate' },
    logoUrl:      { type: DataTypes.TEXT, allowNull: true },
    primaryColor: { type: DataTypes.STRING(20), defaultValue: '#6366f1' },
    accentColor:  { type: DataTypes.STRING(20), defaultValue: '#f59e0b' },
    faviconUrl:   { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName:   'white_label_settings',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   'updated_at',
  });
};
