const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('WhatsappSession', {
    id:   { type: DataTypes.STRING(255), primaryKey: true },
    data: { type: DataTypes.TEXT('long'), allowNull: false },
  }, {
    tableName:   'whatsapp_session',
    underscored: true,
    timestamps:  false,
  });
};
