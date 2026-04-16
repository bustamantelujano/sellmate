const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('FollowUpRule', {
    id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:        { type: DataTypes.INTEGER, allowNull: false },
    name:            { type: DataTypes.STRING(255), allowNull: false },
    triggerType:     { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'days_after_last_contact' },
    delayDays:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
    messageTemplate: { type: DataTypes.TEXT, allowNull: false },
    active:          { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    targetAudience:  { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'all' },
    allowedDays:     { type: DataTypes.STRING(50), defaultValue: '1,2,3,4,5' },
    allowedHourStart:{ type: DataTypes.INTEGER, defaultValue: 9 },
    allowedHourEnd:  { type: DataTypes.INTEGER, defaultValue: 18 },
    variantB:        { type: DataTypes.TEXT, allowNull: true },
    abTestEnabled:   { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    totalSent:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    totalResponded:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    tableName:   'follow_up_rules',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
