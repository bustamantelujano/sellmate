const express = require('express');
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM conversations WHERE tenant_id = ?';
  const params = [req.tenantId];
  if (status && ['bot', 'human', 'closed'].includes(status)) {
    query += ' AND status = ?';
    params.push(status);
  }
  query += ' ORDER BY last_message_at DESC';
  const conversations = await dbAll(query, params);
  res.json({ conversations });
});

router.get('/:id', authMiddleware, requireTenant, async (req, res) => {
  const conversation = await dbGet('SELECT * FROM conversations WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!conversation) return res.status(404).json({ error: 'Conversación no encontrada' });
  const messages = await dbAll(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
    [Number(req.params.id)]
  );
  res.json({ conversation, messages });
});

router.put('/:id/status', authMiddleware, requireTenant, async (req, res) => {
  const { status } = req.body;
  if (!['bot', 'human', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  const agentId = status === 'human' ? req.user.id : null;
  await dbRun(
    'UPDATE conversations SET status = ?, assigned_agent_id = ? WHERE id = ? AND tenant_id = ?',
    [status, agentId, Number(req.params.id), req.tenantId]
  );
  const conversation = await dbGet('SELECT * FROM conversations WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  const io = req.app.get('io');
  if (io) {
    io.to(`tenant:${req.tenantId}`).emit('conversation:updated', conversation);
  }
  res.json({ conversation });
});

// DELETE /:id/messages - clear chat (delete all messages but keep conversation)
router.delete('/:id/messages', authMiddleware, requireTenant, async (req, res) => {
  const conv = await dbGet('SELECT * FROM conversations WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada' });
  await dbRun('DELETE FROM messages WHERE conversation_id = ?', [conv.id]);
  res.json({ success: true });
});

// DELETE /:id - delete conversation and all its messages
router.delete('/:id', authMiddleware, requireTenant, async (req, res) => {
  const conv = await dbGet('SELECT * FROM conversations WHERE id = ? AND tenant_id = ?',
    [Number(req.params.id), req.tenantId]);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada' });
  await dbRun('DELETE FROM messages WHERE conversation_id = ?', [conv.id]);
  await dbRun('DELETE FROM conversations WHERE id = ?', [conv.id]);
  res.json({ success: true });
});

module.exports = router;
