const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbGet, dbRun } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const REFRESH_EXPIRY_DAYS = 7;

// ── Access token (15 min) ────────────────────────────────────────────────────
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
    { expiresIn: '15m' }
  );
}

// ── Refresh token (random 128-char hex, stored in DB) ────────────────────────
function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

async function saveRefreshToken(userId, tenantId, token) {
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
  await dbRun(
    'INSERT INTO refresh_tokens (user_id, tenant_id, token, expires_at) VALUES (?, ?, ?, ?)',
    [userId, tenantId, token, expiresAtStr]
  );
}

async function revokeRefreshToken(token) {
  await dbRun('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

async function revokeAllUserRefreshTokens(userId) {
  await dbRun('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

// ── Cookie helpers ───────────────────────────────────────────────────────────
const COOKIE_NAME = 'rt';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};

function setRefreshCookie(res, token) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
}

function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'strict', path: '/' });
}

// ── Auth middleware ──────────────────────────────────────────────────────────
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbGet(
      'SELECT id, email, name, role, active, tenant_id, super_admin FROM users WHERE id = ?',
      [decoded.id]
    );
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no válido' });
    }
    req.user = user;
    req.tenantId = decoded.tenantId || user.tenant_id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin' && !req.user.super_admin) {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  next();
}

async function requireTenant(req, res, next) {
  if (!req.tenantId) {
    return res.status(403).json({ error: 'Contexto de tenant requerido' });
  }
  const tenant = await dbGet('SELECT id, active FROM tenants WHERE id = ?', [req.tenantId]);
  if (!tenant) return res.status(404).json({ error: 'Tenant no encontrado' });
  if (!tenant.active) return res.status(403).json({ error: 'Tenant desactivado' });
  next();
}

function superAdminOnly(req, res, next) {
  if (!req.user.super_admin) {
    return res.status(403).json({ error: 'Solo super administradores' });
  }
  next();
}

module.exports = {
  generateToken,
  generateRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  setRefreshCookie,
  clearRefreshCookie,
  authMiddleware,
  adminOnly,
  requireTenant,
  superAdminOnly,
  JWT_SECRET,
  COOKIE_NAME,
};
