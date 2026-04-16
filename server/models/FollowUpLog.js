const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FollowUpLog', {
    id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:           { type: DataTypes.INTEGER, allowNull: false },
    ruleId:             { type: DataTypes.INTEGER, allowNull: false },
    conversationId:     { type: DataTypes.INTEGER, allowNull: false },
    phoneNumber:        { type: DataTypes.STRING(50), allowNull: false },
    messageSent:        { type: DataTypes.TEXT, allowNull: false },
    sentAt:             { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    responseReceived:   { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    responseReceivedAt: { type: DataTypes.DATE, allowNull: true },
    variantUsed:        { type: DataTypes.STRING(1), defaultValue: 'A' },
  }, {
    tableName:   'follow_up_log',
    underscored: true,
    timestamps:  false,
  });
};
