const express = require('express');
const { dbRun, dbGet } = require('../config/database');
const { generateResponse, parseStructuredResponse } = require('../services/ai');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, requireTenant, async (req, res) => {
  const info = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  res.json({ business: info });
});

router.put('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  const { name, description, address, phone, hours, policies, extra_info } = req.body;
  await dbRun(
    `UPDATE business_info SET name=?, description=?, address=?, phone=?, hours=?, policies=?, extra_info=?, updated_at=NOW() WHERE tenant_id=?`,
    [name || '', description || '', address || '', phone || '', hours || '', policies || '', extra_info || '', req.tenantId]
  );
  const info = await dbGet('SELECT * FROM business_info WHERE tenant_id = ?', [req.tenantId]);
  res.json({ business: info });
});

// Generate business description with AI
router.post('/generate-description', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { businessName, businessType } = req.body;
    if (!businessName) return res.status(400).json({ error: 'Nombre del negocio requerido' });

    const settings = await dbGet('SELECT * FROM settings WHERE tenant_id = ?', [req.tenantId]);
    if (!settings || !settings.ai_api_key) {
      return res.status(400).json({ error: 'Configura tu proveedor de IA primero' });
    }

    const systemPrompt = `Eres un experto en marketing para pequeños negocios. Genera una descripcion breve y profesional para un negocio. La descripcion debe ser en español, en 2-3 oraciones, destacando lo que ofrece el negocio y su propuesta de valor. No uses comillas ni formato especial. Solo devuelve la descripcion, nada más.`;

    const messages = [
      { role: 'user', content: `Genera una descripcion para mi negocio:\nNombre: ${businessName}\nTipo: ${businessType}` }
    ];

    const aiResponse = await generateResponse(req.tenantId, systemPrompt, messages, settings);
    const description = (aiResponse || '').replace(/^["']|["']$/g, '').trim();

    res.json({ description });
  } catch (e) {
    console.error('Error generating description:', e.message);
    res.status(500).json({ error: 'Error al generar descripcion' });
  }
});

module.exports = router;
