const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, requireTenant } = require('../middleware/auth');

// GET /api/clients - list all clients for this tenant
router.get('/', authMiddleware, requireTenant, async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT c.*,
      (SELECT COUNT(*) FROM conversations cv WHERE cv.tenant_id = c.tenant_id AND cv.phone_number = c.phone_number) as conversation_count,
      (SELECT MAX(cv.last_message_at) FROM conversations cv WHERE cv.tenant_id = c.tenant_id AND cv.phone_number = c.phone_number) as last_message
    FROM clients c WHERE c.tenant_id = ?`;
    const params = [req.tenantId];

    if (search) {
      query += ' AND (c.name LIKE ? OR c.phone_number LIKE ? OR c.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY c.last_contact_at DESC';

    const clients = await dbAll(query, params);
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get('/:id', authMiddleware, requireTenant, async (req, res) => {
  try {
    const client = await dbGet('SELECT * FROM clients WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });

    // Get conversations for this client
    const conversations = await dbAll(
      'SELECT id, status, topic, last_message_at, created_at FROM conversations WHERE tenant_id = ? AND phone_number = ? ORDER BY last_message_at DESC',
      [req.tenantId, client.phone_number]
    );

    res.json({ client, conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients - create client manually
router.post('/', authMiddleware, requireTenant, async (req, res) => {
  try {
    const { phone_number, name, email, notes, tags } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'Numero de telefono requerido' });

    const result = await dbRun(
      'INSERT INTO clients (tenant_id, phone_number, name, email, notes, tags) VALUES (?, ?, ?, ?, ?, ?)',
      [req.tenantId, phone_number, name || '', email || '', notes || null, tags || '']
    );
    const client = await dbGet('SELECT * FROM clients WHERE id = ?', [result.lastInsertRowid]);
    res.json({ client });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Este numero ya esta registrado' });
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', authMiddleware, requireTenant, async (req, res) => {
  try {
    const { name, email, notes, tags } = req.body;
    await dbRun(
      'UPDATE clients SET name = ?, email = ?, notes = ?, tags = ? WHERE id = ? AND tenant_id = ?',
      [name || '', email || '', notes || null, tags || '', req.params.id, req.tenantId]
    );
    const client = await dbGet('SELECT * FROM clients WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json({ client });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authMiddleware, requireTenant, async (req, res) => {
  try {
    await dbRun('DELETE FROM clients WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
