const express = require('express');
const { dbGet, dbAll } = require('../config/database');
const { authMiddleware, requireTenant } = require('../middleware/auth');
const { generateResponse } = require('../services/ai');

const router = express.Router();

router.post('/suggest', authMiddleware, requireTenant, async (req, res) => {
  try {
    const { conversation_id } = req.body;
    if (!conversation_id) {
      return res.status(400).json({ error: 'conversation_id requerido' });
    }

    // Verify conversation belongs to tenant
    const conv = await dbGet('SELECT id FROM conversations WHERE id = ? AND tenant_id = ?',
      [conversation_id, req.tenantId]);
    if (!conv) return res.status(404).json({ error: 'Conversación no encontrada' });

    const messages = (await dbAll(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 20',
      [conversation_id]
    )).reverse();

    if (messages.length === 0) {
      return res.json({ suggestion: '¡Hola! ¿En qué puedo ayudarte?' });
    }

    const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
    const business = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [req.tenantId]);
    const products = await dbAll('SELECT name, description, price, category FROM products WHERE tenant_id = ? AND active = 1', [req.tenantId]);

    const systemPrompt = `Eres un asistente de ventas llamado "${settings.bot_name}" para el negocio "${business.name}".
Tu nivel de amabilidad es ${settings.friendliness}/10.
Genera UNA respuesta corta y natural como sugerencia para que un agente humano la envíe al cliente.
No uses formato markdown. Solo texto plano conversacional.

Info del negocio:
${business.description}
Horario: ${business.hours}
Dirección: ${business.address}
Políticas: ${business.policies}

Productos disponibles:
${products.map(p => `- ${p.name}: $${p.price} - ${p.description}`).join('\n')}`;

    const chatHistory = messages.map(m => ({
      role: m.sender === 'customer' ? 'user' : 'assistant',
      content: m.content
    }));

    const suggestion = await generateResponse(req.tenantId, systemPrompt, chatHistory, settings);
    res.json({ suggestion });
  } catch (err) {
    console.error('Copilot error:', err);
    res.status(500).json({ error: 'Error generando sugerencia' });
  }
});

module.exports = router;
