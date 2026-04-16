const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('QuoteTemplate', {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:  { type: DataTypes.INTEGER, allowNull: false },
    name:      { type: DataTypes.STRING(255), allowNull: false },
    items:     { type: DataTypes.TEXT, allowNull: false },
    notes:     { type: DataTypes.TEXT, allowNull: true },
    validDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
  }, {
    tableName:   'quote_templates',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
