const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FollowUpTemplate', {
    id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:        { type: DataTypes.INTEGER, allowNull: false },
    name:            { type: DataTypes.STRING(255), allowNull: false },
    category:        { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'general' },
    messageTemplate: { type: DataTypes.TEXT, allowNull: false },
    triggerType:     { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'days_after_last_contact' },
    delayDays:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
    targetAudience:  { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'all' },
  }, {
    tableName:   'follow_up_templates',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
