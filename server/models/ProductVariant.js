const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ProductVariant', {
    id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId:       { type: DataTypes.INTEGER, allowNull: false },
    tenantId:        { type: DataTypes.INTEGER, allowNull: false },
    name:            { type: DataTypes.STRING(255), allowNull: false },
    sku:             { type: DataTypes.STRING(100), defaultValue: '' },
    priceAdjustment: { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    costAdjustment:  { type: DataTypes.DOUBLE, allowNull: false, defaultValue: 0 },
    stock:           { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active:          { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  }, {
    tableName:   'product_variants',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
