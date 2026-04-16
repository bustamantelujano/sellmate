const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('McpServer', {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:     { type: DataTypes.INTEGER, allowNull: false },
    name:         { type: DataTypes.STRING(255), allowNull: false },
    transport:    { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'stdio' },
    command:      { type: DataTypes.STRING(500), defaultValue: '' },
    args:         { type: DataTypes.TEXT, allowNull: true },
    url:          { type: DataTypes.STRING(500), defaultValue: '' },
    envVars:      { type: DataTypes.TEXT, allowNull: true },
    enabled:      { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    disabledTools:{ type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName:   'mcp_servers',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
