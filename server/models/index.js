const { Sequelize } = require('sequelize');
require('dotenv').config();

// ── Connection ───────────────────────────────────────────────────────────────
const rawUrl = process.env.JAWSDB_MARIA_URL || process.env.DATABASE_URL;

const sharedOptions = {
  dialect: 'mysql',
  logging: false,
  dialectOptions: { charset: 'utf8mb4' },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
};

const sequelize = rawUrl
  ? new Sequelize(rawUrl, sharedOptions)
  : new Sequelize(
      process.env.DB_NAME     || 'sellmate',
      process.env.DB_USER     || 'root',
      process.env.DB_PASSWORD || '',
      {
        ...sharedOptions,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
      }
    );

// ── Model definitions ────────────────────────────────────────────────────────
const AiKey              = require('./AiKey')(sequelize);
const AiModel            = require('./AiModel')(sequelize);
const AiUsage            = require('./AiUsage')(sequelize);
const Appointment        = require('./Appointment')(sequelize);
const BusinessInfo       = require('./BusinessInfo')(sequelize);
const Client             = require('./Client')(sequelize);
const ClientNote         = require('./ClientNote')(sequelize);
const Conversation       = require('./Conversation')(sequelize);
const FollowUpLog        = require('./FollowUpLog')(sequelize);
const FollowUpRule       = require('./FollowUpRule')(sequelize);
const FollowUpTemplate   = require('./FollowUpTemplate')(sequelize);
const McpServer          = require('./McpServer')(sequelize);
const Message            = require('./Message')(sequelize);
const Order              = require('./Order')(sequelize);
const OrderStatusHistory = require('./OrderStatusHistory')(sequelize);
const Product            = require('./Product')(sequelize);
const ProductVariant     = require('./ProductVariant')(sequelize);
const QuickReply         = require('./QuickReply')(sequelize);
const Quote              = require('./Quote')(sequelize);
const QuoteTemplate      = require('./QuoteTemplate')(sequelize);
const ServiceType        = require('./ServiceType')(sequelize);
const Setting            = require('./Setting')(sequelize);
const Tenant             = require('./Tenant')(sequelize);
const TenantModule       = require('./TenantModule')(sequelize);
const User               = require('./User')(sequelize);
const WaAuthState        = require('./WaAuthState')(sequelize);
const Webhook            = require('./Webhook')(sequelize);
const WhatsappSession    = require('./WhatsappSession')(sequelize);
const WhiteLabelSetting  = require('./WhiteLabelSetting')(sequelize);
const Whitelist          = require('./Whitelist')(sequelize);

// ── Associations ─────────────────────────────────────────────────────────────

// Tenant → everything
Tenant.hasMany(AiKey,             { foreignKey: 'tenantId' });
Tenant.hasMany(AiModel,           { foreignKey: 'tenantId' });
Tenant.hasMany(AiUsage,           { foreignKey: 'tenantId' });
Tenant.hasMany(Appointment,       { foreignKey: 'tenantId' });
Tenant.hasOne (BusinessInfo,      { foreignKey: 'tenantId' });
Tenant.hasMany(Client,            { foreignKey: 'tenantId' });
Tenant.hasMany(ClientNote,        { foreignKey: 'tenantId' });
Tenant.hasMany(Conversation,      { foreignKey: 'tenantId' });
Tenant.hasMany(FollowUpLog,       { foreignKey: 'tenantId' });
Tenant.hasMany(FollowUpRule,      { foreignKey: 'tenantId' });
Tenant.hasMany(FollowUpTemplate,  { foreignKey: 'tenantId' });
Tenant.hasMany(McpServer,         { foreignKey: 'tenantId' });
Tenant.hasMany(Order,             { foreignKey: 'tenantId' });
Tenant.hasMany(OrderStatusHistory,{ foreignKey: 'tenantId' });
Tenant.hasMany(Product,           { foreignKey: 'tenantId' });
Tenant.hasMany(ProductVariant,    { foreignKey: 'tenantId' });
Tenant.hasMany(QuickReply,        { foreignKey: 'tenantId' });
Tenant.hasMany(Quote,             { foreignKey: 'tenantId' });
Tenant.hasMany(QuoteTemplate,     { foreignKey: 'tenantId' });
Tenant.hasMany(ServiceType,       { foreignKey: 'tenantId' });
Tenant.hasOne (Setting,           { foreignKey: 'tenantId' });
Tenant.hasMany(TenantModule,      { foreignKey: 'tenantId' });
Tenant.hasMany(User,              { foreignKey: 'tenantId' });
Tenant.hasMany(WaAuthState,       { foreignKey: 'tenantId' });
Tenant.hasMany(Webhook,           { foreignKey: 'tenantId' });
Tenant.hasMany(Whitelist,         { foreignKey: 'tenantId' });
Tenant.hasOne (WhiteLabelSetting, { foreignKey: 'tenantId' });

// → Tenant (belongsTo)
AiKey.belongsTo            (Tenant, { foreignKey: 'tenantId' });
AiModel.belongsTo          (Tenant, { foreignKey: 'tenantId' });
AiUsage.belongsTo          (Tenant, { foreignKey: 'tenantId' });
Appointment.belongsTo      (Tenant, { foreignKey: 'tenantId' });
BusinessInfo.belongsTo     (Tenant, { foreignKey: 'tenantId' });
Client.belongsTo           (Tenant, { foreignKey: 'tenantId' });
ClientNote.belongsTo       (Tenant, { foreignKey: 'tenantId' });
Conversation.belongsTo     (Tenant, { foreignKey: 'tenantId' });
FollowUpLog.belongsTo      (Tenant, { foreignKey: 'tenantId' });
FollowUpRule.belongsTo     (Tenant, { foreignKey: 'tenantId' });
FollowUpTemplate.belongsTo (Tenant, { foreignKey: 'tenantId' });
McpServer.belongsTo        (Tenant, { foreignKey: 'tenantId' });
Order.belongsTo            (Tenant, { foreignKey: 'tenantId' });
OrderStatusHistory.belongsTo(Tenant,{ foreignKey: 'tenantId' });
Product.belongsTo          (Tenant, { foreignKey: 'tenantId' });
ProductVariant.belongsTo   (Tenant, { foreignKey: 'tenantId' });
QuickReply.belongsTo       (Tenant, { foreignKey: 'tenantId' });
Quote.belongsTo            (Tenant, { foreignKey: 'tenantId' });
QuoteTemplate.belongsTo    (Tenant, { foreignKey: 'tenantId' });
ServiceType.belongsTo      (Tenant, { foreignKey: 'tenantId' });
Setting.belongsTo          (Tenant, { foreignKey: 'tenantId' });
TenantModule.belongsTo     (Tenant, { foreignKey: 'tenantId' });
User.belongsTo             (Tenant, { foreignKey: 'tenantId' });
WaAuthState.belongsTo      (Tenant, { foreignKey: 'tenantId' });
Webhook.belongsTo          (Tenant, { foreignKey: 'tenantId' });
Whitelist.belongsTo        (Tenant, { foreignKey: 'tenantId' });
WhiteLabelSetting.belongsTo(Tenant, { foreignKey: 'tenantId' });

// Conversation ↔ Message
Conversation.hasMany(Message,       { foreignKey: 'conversationId' });
Message.belongsTo   (Conversation,  { foreignKey: 'conversationId' });

// Conversation ↔ Agent (User)
Conversation.belongsTo(User, { foreignKey: 'assignedAgentId', as: 'assignedAgent' });
User.hasMany(Conversation,   { foreignKey: 'assignedAgentId', as: 'assignedConversations' });

// Conversation ↔ Appointment / Order / Quote / FollowUpLog
Conversation.hasMany(Appointment, { foreignKey: 'conversationId' });
Appointment.belongsTo(Conversation,{ foreignKey: 'conversationId' });

Conversation.hasMany(Order,   { foreignKey: 'conversationId' });
Order.belongsTo(Conversation, { foreignKey: 'conversationId' });

Conversation.hasMany(Quote,   { foreignKey: 'conversationId' });
Quote.belongsTo(Conversation, { foreignKey: 'conversationId' });

Conversation.hasMany(FollowUpLog,  { foreignKey: 'conversationId' });
FollowUpLog.belongsTo(Conversation,{ foreignKey: 'conversationId' });

// FollowUpRule ↔ FollowUpLog
FollowUpRule.hasMany(FollowUpLog,  { foreignKey: 'ruleId' });
FollowUpLog.belongsTo(FollowUpRule,{ foreignKey: 'ruleId' });

// AiKey ↔ AiModel
AiKey.hasMany   (AiModel, { foreignKey: 'aiKeyId' });
AiModel.belongsTo(AiKey,  { foreignKey: 'aiKeyId' });

// Product ↔ ProductVariant
Product.hasMany       (ProductVariant, { foreignKey: 'productId' });
ProductVariant.belongsTo(Product,      { foreignKey: 'productId' });

// Order ↔ OrderStatusHistory
Order.hasMany               (OrderStatusHistory, { foreignKey: 'orderId' });
OrderStatusHistory.belongsTo(Order,              { foreignKey: 'orderId' });

// Client ↔ ClientNote
Client.hasMany      (ClientNote, { foreignKey: 'clientId' });
ClientNote.belongsTo(Client,     { foreignKey: 'clientId' });

// Appointment → User (created by) / ServiceType
Appointment.belongsTo(User,        { foreignKey: 'createdByUserId', as: 'creator' });
Appointment.belongsTo(ServiceType, { foreignKey: 'serviceTypeId' });
ServiceType.hasMany  (Appointment, { foreignKey: 'serviceTypeId' });

// ClientNote → User (author)
ClientNote.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// OrderStatusHistory → User (changed by)
OrderStatusHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  sequelize,
  Sequelize,
  AiKey,
  AiModel,
  AiUsage,
  Appointment,
  BusinessInfo,
  Client,
  ClientNote,
  Conversation,
  FollowUpLog,
  FollowUpRule,
  FollowUpTemplate,
  McpServer,
  Message,
  Order,
  OrderStatusHistory,
  Product,
  ProductVariant,
  QuickReply,
  Quote,
  QuoteTemplate,
  ServiceType,
  Setting,
  Tenant,
  TenantModule,
  User,
  WaAuthState,
  Webhook,
  WhatsappSession,
  WhiteLabelSetting,
  Whitelist,
};
