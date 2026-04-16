const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Appointment', {
    id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenantId:            { type: DataTypes.INTEGER, allowNull: false },
    conversationId:      { type: DataTypes.INTEGER, allowNull: true },
    phoneNumber:         { type: DataTypes.STRING(50), allowNull: false },
    contactName:         { type: DataTypes.STRING(255), defaultValue: '' },
    title:               { type: DataTypes.STRING(255), allowNull: false },
    description:         { type: DataTypes.TEXT, allowNull: true },
    date:                { type: DataTypes.DATEONLY, allowNull: false },
    time:                { type: DataTypes.TIME, allowNull: false },
    durationMinutes:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
    status:              { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'scheduled' },
    notes:               { type: DataTypes.TEXT, allowNull: true },
    createdBy:           { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'bot' },
    createdByUserId:     { type: DataTypes.INTEGER, allowNull: true },
    reminderSent:        { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    confirmToken:        { type: DataTypes.STRING(64), allowNull: true },
    confirmedAt:         { type: DataTypes.DATE, allowNull: true },
    reminder24hSent:     { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    reminder1hSent:      { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0 },
    serviceTypeId:       { type: DataTypes.INTEGER, allowNull: true },
    recurrenceType:      { type: DataTypes.STRING(20), allowNull: true },
    recurrenceInterval:  { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
    recurrenceEndDate:   { type: DataTypes.DATEONLY, allowNull: true },
    parentAppointmentId: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName:   'appointments',
    underscored: true,
    timestamps:  true,
    createdAt:   'created_at',
    updatedAt:   false,
  });
};
