const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Product', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:    { type: DataTypes.INTEGER, allowNull: false },
    name:        { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT('medium'), allowNull: true },
    price:       { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    category:    { type: DataTypes.STRING(255), allowNull: true },
    imageUrl:    { type: DataTypes.TEXT('medium'), allowNull: true },
    stock:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active:      { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    costPrice:   { type: DataTypes.DOUBLE, defaultValue: 0 },
  }, {
    tableName:   'products',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
