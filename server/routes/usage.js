const express = require('express');
const router = express.Router();
const { dbGet, dbAll } = require('../config/database');
const { authMiddleware, adminOnly, requireTenant } = require('../middleware/auth');

// GET /api/usage - get usage summary for this tenant
router.get('/', authMiddleware, adminOnly, requireTenant, async (req, res) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month', 'all'
    let dateFilter = '';
    if (period === 'today') dateFilter = "AND DATE(created_at) = CURDATE()";
    else if (period === 'week') dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    else if (period === 'month') dateFilter = "AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";

    const summary = await dbGet(
      `SELECT
        COUNT(*) as total_requests,
        COALESCE(SUM(input_tokens), 0) as total_input_tokens,
        COALESCE(SUM(output_tokens), 0) as total_output_tokens,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(cost_estimate), 0) as total_cost
      FROM ai_usage WHERE tenant_id = ? ${dateFilter}`,
      [req.tenantId]
    );

    const byModel = await dbAll(
      `SELECT model, provider,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost_estimate) as cost
      FROM ai_usage WHERE tenant_id = ? ${dateFilter}
      GROUP BY model, provider ORDER BY tokens DESC`,
      [req.tenantId]
    );

    const daily = await dbAll(
      `SELECT DATE(created_at) as date,
        COUNT(*) as requests,
        SUM(total_tokens) as tokens,
        SUM(cost_estimate) as cost
      FROM ai_usage WHERE tenant_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30`,
      [req.tenantId]
    );

    res.json({ summary, byModel, daily });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
