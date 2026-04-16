const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ClientNote', {
    id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
    userId:   { type: DataTypes.INTEGER, allowNull: true },
    content:  { type: DataTypes.TEXT, allowNull: false },
  }, {
    tableName:   'client_notes',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
