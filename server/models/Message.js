const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Message', {
    id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversationId: { type: DataTypes.INTEGER, allowNull: false },
    sender:         { type: DataTypes.STRING(20), allowNull: false },
    senderName:     { type: DataTypes.STRING(255), defaultValue: '' },
    content:        { type: DataTypes.TEXT('medium'), allowNull: false },
    messageType:    { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'text' },
    imageData:      { type: DataTypes.TEXT('long'), allowNull: true },
    audioData:      { type: DataTypes.TEXT('long'), allowNull: true },
    timestamp:      { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fileUrl:        { type: DataTypes.TEXT, allowNull: true },
    fileName:       { type: DataTypes.STRING(255), allowNull: true },
    fileMimetype:   { type: DataTypes.STRING(100), allowNull: true },
    isInternal:     { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    deliveryStatus: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'sent' },
    emojiReaction:  { type: DataTypes.STRING(20), allowNull: true },
    waMessageId:    { type: DataTypes.STRING(255), allowNull: true },
  }, {
    tableName:   'messages',
    underscored: true,
    timestamps:  false,
  });
};
