const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Conversation', {
    id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:          { type: DataTypes.INTEGER, allowNull: false },
    phoneNumber:       { type: DataTypes.STRING(50), allowNull: false },
    contactName:       { type: DataTypes.STRING(255), defaultValue: '' },
    status:            { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'bot' },
    topic:             { type: DataTypes.TEXT('medium'), allowNull: true },
    assignedAgentId:   { type: DataTypes.INTEGER, allowNull: true },
    lastMessageAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    lastReadMessageId: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName:   'conversations',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
