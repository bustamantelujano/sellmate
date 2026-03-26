const { dbRun, dbGet, dbAll } = require('../config/database');
const { generateResponse } = require('./ai');
const { mcpManager } = require('./mcp');

// Lazy require to avoid circular dependency
function getWhatsAppManager() {
  return require('./whatsapp').whatsappManager;
}

/**
 * Handles incoming messages and generates bot responses.
 * Now tenant-aware: all queries scoped to tenantId.
 */
async function handleIncomingMessage(tenantId, phoneNumber, contactName, messageContent, messageType, io, messageKey, imageBase64 = null, options = {}) {
  const { isLid = false } = options;

  // Check whitelist mode (skip for LID numbers — they can't be matched to real phone numbers)
  const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [tenantId]);
  if (settings && settings.whitelist_mode === 'whitelist' && !isLid) {
    const allowed = await dbGet('SELECT id FROM whitelist WHERE tenant_id = ? AND phone_number = ?', [tenantId, phoneNumber]);
    if (!allowed) {
      const withoutPlus = phoneNumber.replace(/^\+/, '');
      const allowed2 = await dbGet(
        'SELECT id FROM whitelist WHERE tenant_id = ? AND (phone_number = ? OR phone_number = ?)',
        [tenantId, withoutPlus, '+' + withoutPlus]
      );
      if (!allowed2) {
        console.log(`[WHITELIST] Tenant ${tenantId}: ${phoneNumber} not in whitelist, ignoring`);
        return null;
      }
    }
  }

  // Find or create conversation (scoped to tenant)
  let conversation = await dbGet('SELECT * FROM conversations WHERE tenant_id = ? AND phone_number = ?', [tenantId, phoneNumber]);
  if (!conversation) {
    const result = await dbRun(
      `INSERT INTO conversations (tenant_id, phone_number, contact_name, status) VALUES (?, ?, ?, 'bot')`,
      [tenantId, phoneNumber, contactName || phoneNumber]
    );
    conversation = await dbGet('SELECT * FROM conversations WHERE id = ?', [result.lastInsertRowid]);
  } else {
    await dbRun(
      `UPDATE conversations SET contact_name = COALESCE(NULLIF(?, ''), contact_name), last_message_at = NOW() WHERE id = ?`,
      [contactName, conversation.id]
    );
    conversation = await dbGet('SELECT * FROM conversations WHERE id = ?', [conversation.id]);
  }

  // Auto-create/update client record
  try {
    const existingClient = await dbGet('SELECT id FROM clients WHERE tenant_id = ? AND phone_number = ?', [tenantId, phoneNumber]);
    if (existingClient) {
      await dbRun('UPDATE clients SET name = COALESCE(NULLIF(?, \'\'), name), last_contact_at = NOW() WHERE id = ?', [contactName, existingClient.id]);
    } else {
      await dbRun('INSERT INTO clients (tenant_id, phone_number, name, last_contact_at) VALUES (?, ?, ?, NOW())', [tenantId, phoneNumber, contactName || phoneNumber]);
    }
  } catch (e) { /* ignore duplicate or errors */ }

  // Save incoming message
  const msgResult = await dbRun(
    'INSERT INTO messages (conversation_id, sender, sender_name, content, message_type, image_data) VALUES (?, ?, ?, ?, ?, ?)',
    [conversation.id, 'customer', contactName || phoneNumber, messageContent, messageType || 'text', imageBase64]
  );
  const savedMessage = await dbGet('SELECT * FROM messages WHERE id = ?', [msgResult.lastInsertRowid]);

  // Emit to tenant room
  if (io) {
    io.to(`tenant:${tenantId}`).emit('message:new', { conversation, message: savedMessage });
  }

  // If conversation is handled by human or closed, don't auto-respond
  if (conversation.status !== 'bot') {
    return null;
  }

  // If business is offline, send offline message instead of bot response
  if (settings && settings.online_status === 0) {
    const offlineMsg = settings.farewell_message
      ? settings.farewell_message.replace('{bot_name}', settings.bot_name || 'SellMate')
      : 'En este momento no estamos disponibles. Te responderemos pronto.';

    const offlineMsgResult = await dbRun(
      'INSERT INTO messages (conversation_id, sender, sender_name, content, message_type) VALUES (?, ?, ?, ?, ?)',
      [conversation.id, 'bot', settings.bot_name || 'SellMate', offlineMsg, 'text']
    );
    const savedOfflineMsg = await dbGet('SELECT * FROM messages WHERE id = ?', [offlineMsgResult.lastInsertRowid]);
    await dbRun(`UPDATE conversations SET last_message_at = NOW() WHERE id = ?`, [conversation.id]);

    if (io) {
      const updatedConv = await dbGet('SELECT * FROM conversations WHERE id = ?', [conversation.id]);
      io.to(`tenant:${tenantId}`).emit('message:new', { conversation: updatedConv, message: savedOfflineMsg });
    }

    return offlineMsg;
  }

  // Show typing indicator
  const wm = getWhatsAppManager();
  await wm.sendPresence(tenantId, phoneNumber, 'composing');

  // Generate bot response
  try {
    const business = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [tenantId]);
    const products = await dbAll('SELECT name, description, price, category, stock FROM products WHERE tenant_id = ? AND active = 1', [tenantId]);

    // Fetch enabled modules for this tenant
    const enabledModules = await dbAll('SELECT module_key FROM tenant_modules WHERE tenant_id = ? AND enabled = 1', [tenantId]);
    const moduleKeys = enabledModules.map(m => m.module_key);

    const history = (await dbAll(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 15',
      [conversation.id]
    )).reverse();

    const friendlinessDesc = settings.friendliness <= 3 ? 'directo y conciso' :
      settings.friendliness <= 6 ? 'amable y profesional' : 'muy amable, calido y cercano';

    const currentTopic = conversation.topic || null;

    const systemPrompt = `Eres "${settings.bot_name}", asistente de ventas por WhatsApp del negocio "${business.name}".

PERSONALIDAD: Se ${friendlinessDesc} (nivel ${settings.friendliness}/10).
IDIOMA: Responde en el mismo idioma que el cliente.
FORMATO: Mensajes cortos, sin markdown. Usa emojis con moderacion.

INFORMACION DEL NEGOCIO:
- Nombre: ${business.name}
- Descripcion: ${business.description}
- Direccion: ${business.address}
- Horario: ${business.hours}
- Politicas: ${business.policies}
${business.extra_info ? `- Extra: ${business.extra_info}` : ''}

PRODUCTOS DISPONIBLES:
${products.length > 0 ? products.map(p =>
  `- ${p.name} - $${p.price}${p.stock > 0 ? ` (${p.stock} en stock)` : ' (Agotado)'}\n  ${p.description}`
).join('\n') : 'No hay productos cargados aun.'}

REGLAS:
1. Ayuda al cliente a encontrar lo que busca.
2. Si preguntan por algo que no tienes, dilo amablemente.
3. NO inventes productos ni precios.
4. Si el cliente quiere comprar, indicale como proceder segun las politicas.
5. Si no sabes algo, sugiere contactar directamente al negocio.

ANALISIS DE IMAGENES:
Cuando el cliente envia una imagen, analízala cuidadosamente.
- Si la imagen muestra un espacio o superficie, intenta estimar las dimensiones aproximadas en metros cuadrados basandote en los elementos visibles (puertas, muebles, personas) como referencia de escala.
- Si un producto se vende por metro cuadrado, usa tu estimacion para calcular un precio aproximado y ofrece una cotizacion.
- Si la imagen muestra un producto o un problema, describelo y ofrece ayuda relevante.
- Siempre indica que tu estimacion de dimensiones es aproximada y puede variar.

${moduleKeys.includes('appointments') ? `AGENDAMIENTO DE CITAS:
Si el cliente quiere agendar una cita o servicio:
1. Pregunta por fecha y hora preferida si no las menciono.
2. Confirma los datos con el cliente antes de agendar.
3. Cuando el cliente CONFIRME, incluye el campo "appointment" en tu respuesta JSON.
4. Si el cliente no quiere cita o aun no ha confirmado, usa "appointment": null.` : ''}

${moduleKeys.includes('orders') ? `ORDENES / PEDIDOS:
Si el cliente quiere hacer un pedido:
1. Ayudalo a elegir productos del catalogo.
2. Confirma los items, cantidades y el total.
3. Cuando el cliente CONFIRME el pedido, incluye el campo "order" en tu respuesta JSON.
4. Si el cliente no quiere ordenar o aun no ha confirmado, usa "order": null.` : ''}

${moduleKeys.includes('quotes') ? `COTIZACIONES:
Si el cliente pide una cotizacion:
1. Identifica los productos o servicios que necesita.
2. Calcula el total basandote en los precios del catalogo.
3. Presenta la cotizacion de forma clara con desglose de items y precios.
4. Incluye el campo "quote" en tu respuesta JSON con los detalles.
5. Si no es una cotizacion, usa "quote": null.` : ''}

FORMATO DE RESPUESTA:
Debes responder SIEMPRE en formato JSON valido con esta estructura:
{
  "response": "Tu mensaje al cliente aqui",
  "topic": "categoria_del_tema",
  "emoji_reaction": "emoji_o_null"${moduleKeys.includes('appointments') ? `,
  "appointment": null` : ''}${moduleKeys.includes('orders') ? `,
  "order": null` : ''}${moduleKeys.includes('quotes') ? `,
  "quote": null` : ''}
}

${moduleKeys.includes('appointments') ? `Cuando el cliente CONFIRME una cita, cambia "appointment" a:
"appointment": {
  "title": "Nombre del servicio o cita",
  "description": "Detalles adicionales",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration_minutes": 60
}` : ''}

${moduleKeys.includes('orders') ? `Cuando el cliente CONFIRME un pedido, cambia "order" a:
"order": {
  "items": [{"name": "Producto", "quantity": 1, "unit_price": 100}],
  "total": 100,
  "notes": "Notas adicionales del pedido"
}` : ''}

${moduleKeys.includes('quotes') ? `Cuando generes una cotizacion, cambia "quote" a:
"quote": {
  "items": [{"name": "Producto o servicio", "quantity": 1, "unit_price": 100}],
  "total": 100,
  "valid_days": 15,
  "notes": "Condiciones o notas"
}` : ''}

Para "topic", clasifica la conversacion en UNA de estas categorias (en espanol):
- "cotizacion" (cuando el cliente pide precios o cotizaciones)
- "informacion_productos" (cuando pregunta sobre productos/servicios)
- "consulta_horario" (cuando pregunta por horarios)
- "consulta_sucursales" (cuando pregunta por ubicaciones/direcciones)
- "soporte" (cuando tiene un problema o queja)
- "compra" (cuando quiere comprar/hacer pedido)
- "cita" (cuando quiere agendar una cita o servicio)
- "saludo" (cuando solo saluda o inicia conversacion)
- "otro" (cualquier otra cosa)

${currentTopic ? `El tema actual de esta conversacion es "${currentTopic}". Solo cambialo si el cliente claramente cambio de tema.` : 'Esta es una conversacion nueva o sin tema asignado, asigna el tema apropiado.'}

Para "emoji_reaction", elige UN emoji apropiado para reaccionar al mensaje del cliente, o null si no es necesario reaccionar. Usa reacciones solo cuando sea natural (saludos, agradecimientos, confirmaciones). No reacciones a cada mensaje.

IMPORTANTE: Tu respuesta debe ser UNICAMENTE el JSON, sin texto adicional, sin backticks, sin markdown.`;

    const chatHistory = history.map(m => {
      if (m.image_data && m.sender === 'customer') {
        const contentParts = [];
        if (m.content && m.content !== '[Imagen]') {
          contentParts.push({ type: 'text', text: m.content });
        } else {
          contentParts.push({ type: 'text', text: 'El cliente envio esta imagen:' });
        }
        contentParts.push({ type: 'image_url', image_url: { url: m.image_data } });
        return { role: 'user', content: contentParts };
      }
      return {
        role: m.sender === 'customer' ? 'user' : 'assistant',
        content: m.content
      };
    });

    // Build MCP tool context for this tenant
    let toolCtx = null;
    if (mcpManager.hasToolsForTenant(tenantId)) {
      const { openaiTools, anthropicTools, toolMap } = mcpManager.getAllToolsForTenant(tenantId);
      toolCtx = {
        openaiTools,
        anthropicTools,
        toolMap,
        executeTool: (name, args, map) => mcpManager.executeTool(tenantId, name, args, map)
      };
    }

    const aiResult = await generateResponse(tenantId, systemPrompt, chatHistory, settings, toolCtx);

    // Stop typing
    await wm.sendPresence(tenantId, phoneNumber, 'paused');

    const botResponse = aiResult.response || aiResult;
    const newTopic = aiResult.topic || null;
    const emojiReaction = aiResult.emoji_reaction || null;
    const appointmentData = aiResult.appointment || null;

    // Update topic if changed
    if (newTopic && newTopic !== conversation.topic) {
      await dbRun('UPDATE conversations SET topic = ? WHERE id = ?', [newTopic, conversation.id]);
    }

    // Create appointment if AI scheduled one (only when appointments module is enabled)
    if (moduleKeys.includes('appointments') && appointmentData && appointmentData.date && appointmentData.time) {
      try {
        const apptResult = await dbRun(
          `INSERT INTO appointments (tenant_id, conversation_id, phone_number, contact_name, title, description, date, time, duration_minutes, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'bot')`,
          [tenantId, conversation.id, phoneNumber, contactName || phoneNumber,
           appointmentData.title || 'Cita', appointmentData.description || '',
           appointmentData.date, appointmentData.time,
           appointmentData.duration_minutes || 60]
        );
        const newAppt = await dbGet('SELECT * FROM appointments WHERE id = ?', [apptResult.lastInsertRowid]);
        if (io) {
          io.to(`tenant:${tenantId}`).emit('appointment:new', newAppt);
        }
        console.log(`Bot created appointment for ${phoneNumber}: ${appointmentData.title} on ${appointmentData.date} at ${appointmentData.time}`);
      } catch (apptErr) {
        console.error('Error creating bot appointment:', apptErr.message);
      }
    }

    // Send emoji reaction
    if (emojiReaction && messageKey) {
      try {
        await wm.sendReaction(tenantId, phoneNumber, messageKey, emojiReaction);
      } catch (e) {
        console.error('Error sending reaction:', e.message);
      }
    }

    // Save bot response
    const botMsg = await dbRun(
      'INSERT INTO messages (conversation_id, sender, sender_name, content, message_type) VALUES (?, ?, ?, ?, ?)',
      [conversation.id, 'bot', settings.bot_name, botResponse, 'text']
    );
    const savedBotMsg = await dbGet('SELECT * FROM messages WHERE id = ?', [botMsg.lastInsertRowid]);

    await dbRun(`UPDATE conversations SET last_message_at = NOW() WHERE id = ?`, [conversation.id]);

    const updatedConv = await dbGet('SELECT * FROM conversations WHERE id = ?', [conversation.id]);

    if (io) {
      io.to(`tenant:${tenantId}`).emit('message:new', { conversation: updatedConv, message: savedBotMsg });
      if (newTopic && newTopic !== conversation.topic) {
        io.to(`tenant:${tenantId}`).emit('conversation:updated', updatedConv);
      }
    }

    return botResponse;
  } catch (err) {
    console.error('Bot response error:', err);
    await wm.sendPresence(tenantId, phoneNumber, 'paused');
    return null;
  }
}

module.exports = { handleIncomingMessage };
