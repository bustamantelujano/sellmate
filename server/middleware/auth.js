const jwt = require('jsonwebtoken');
const { dbGet } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function generateToken(user, tenantId = null) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      tenantId: tenantId,
      superAdmin: !!user.super_admin
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbGet('SELECT id, email, name, role, active, tenant_id, super_admin FROM users WHERE id = ?', [decoded.id]);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    req.user = user;
    // Set tenantId from JWT (preferred) or from user record
    req.tenantId = decoded.tenantId || user.tenant_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Requires admin role within the tenant
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin' && !req.user.super_admin) {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  next();
}

// Requires tenant context (tenantId must be set)
async function requireTenant(req, res, next) {
  if (!req.tenantId) {
    return res.status(403).json({ error: 'Contexto de tenant requerido' });
  }
  // Verify tenant exists and is active
  const tenant = await dbGet('SELECT id, active FROM tenants WHERE id = ?', [req.tenantId]);
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant no encontrado' });
  }
  if (!tenant.active) {
    return res.status(403).json({ error: 'Tenant desactivado' });
  }
  next();
}

// Requires platform-level super admin
function superAdminOnly(req, res, next) {
  if (!req.user.super_admin) {
    return res.status(403).json({ error: 'Solo super administradores' });
  }
  next();
}

module.exports = { generateToken, authMiddleware, adminOnly, requireTenant, superAdminOnly, JWT_SECRET };
