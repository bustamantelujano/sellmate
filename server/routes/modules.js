const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

// All module definitions with metadata
const MODULE_DEFINITIONS = {
  orders: { name: 'Órdenes', description: 'Recibe y gestiona pedidos por WhatsApp', icon: 'clipboard-list', category: 'operations' },
  appointments: { name: 'Citas', description: 'Agenda y gestiona citas con clientes', icon: 'calendar', category: 'operations' },
  quotes: { name: 'Cotizaciones', description: 'Genera cotizaciones automáticas', icon: 'calculator', category: 'sales' },
  products: { name: 'Catálogo', description: 'Muestra y gestiona tu catálogo de productos', icon: 'shopping-bag', category: 'sales' },
  followups: { name: 'Seguimiento', description: 'Mensajes automáticos de fidelización', icon: 'refresh', category: 'engagement' },
  image_generation: { name: 'Imágenes IA', description: 'Genera imágenes con inteligencia artificial', icon: 'photo', category: 'ai' },
};

// Business type presets
const BUSINESS_PRESETS = {
  restaurant: { name: 'Restaurante', modules: ['orders', 'products', 'followups'] },
  barbershop: { name: 'Barbería', modules: ['appointments', 'products', 'followups'] },
  clinic: { name: 'Consultorio', modules: ['appointments', 'followups'] },
  store: { name: 'Tienda', modules: ['products', 'quotes', 'followups'] },
  services: { name: 'Servicios', modules: ['appointments', 'quotes', 'followups'] },
  other: { name: 'Otro', modules: ['products', 'followups'] },
};

// GET /api/modules - list all modules with their status for this tenant
router.get('/', authMiddleware, requireTenant, async (req, res) => {
  try {
    const tenantModules = await dbAll('SELECT module_key, enabled, config FROM tenant_modules WHERE tenant_id = ?', [req.tenantId]);
    const enabledMap = {};
    for (const tm of tenantModules) {
      enabledMap[tm.module_key] = { enabled: !!tm.enabled, config: tm.config ? JSON.parse(tm.config) : null };
    }

    const modules = Object.entries(MODULE_DEFINITIONS).map(([key, def]) => ({
      key,
      ...def,
      enabled: enabledMap[key]?.enabled ?? false,
      config: enabledMap[key]?.config ?? null,
    }));

    res.json({ modules, definitions: MODULE_DEFINITIONS, presets: BUSINESS_PRESETS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/modules/:key - enable/disable a module
router.put('/:key', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { key } = req.params;
    if (!MODULE_DEFINITIONS[key]) return res.status(400).json({ error: 'Módulo no válido' });

    const { enabled, config } = req.body;
    await dbRun(
      'INSERT INTO tenant_modules (tenant_id, module_key, enabled, config) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), config = VALUES(config)',
      [req.tenantId, key, enabled ? 1 : 0, config ? JSON.stringify(config) : null]
    );

    res.json({ key, enabled: !!enabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/modules/apply-preset - apply a business type preset
router.post('/apply-preset', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { businessType } = req.body;
    const preset = BUSINESS_PRESETS[businessType];
    if (!preset) return res.status(400).json({ error: 'Tipo de negocio no válido' });

    // Disable all modules first
    for (const key of Object.keys(MODULE_DEFINITIONS)) {
      await dbRun(
        'INSERT INTO tenant_modules (tenant_id, module_key, enabled) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE enabled = 0',
        [req.tenantId, key]
      );
    }

    // Enable preset modules
    for (const key of preset.modules) {
      await dbRun(
        'INSERT INTO tenant_modules (tenant_id, module_key, enabled) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE enabled = 1',
        [req.tenantId, key]
      );
    }

    // Update business type in settings
    await dbRun('UPDATE settings SET business_type = ? WHERE tenant_id = ?', [businessType, req.tenantId]);

    res.json({ businessType, enabledModules: preset.modules });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/modules/complete-setup - mark setup as completed
router.post('/complete-setup', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    await dbRun('UPDATE settings SET setup_completed = 1 WHERE tenant_id = ?', [req.tenantId]);
    res.json({ setup_completed: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
