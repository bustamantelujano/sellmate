import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api, { setAccessToken, clearAccessToken, getAccessToken } from '../lib/api'

export const useAuthStore = defineStore('auth', () => {
  // user persists in localStorage (not sensitive — no passwords/tokens)
  // token lives ONLY in memory via api.js module variable
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // Tracks whether we already attempted a session restore this page load
  let _restoreAttempted = false

  const isLoggedIn  = computed(() => !!user.value)
  const isAdmin     = computed(() => user.value?.role === 'admin')
  const isSuperAdmin= computed(() => !!user.value?.superAdmin)
  const tenantId    = computed(() => user.value?.tenantId || null)

  // ── Shared: store user + access token after any successful auth ─────────────
  function _applySession(data) {
    setAccessToken(data.token)
    user.value = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
  }

  // ── Login ────────────────────────────────────────────────────────────────────
  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    _applySession(data)
  }

  // ── Register (first admin) ───────────────────────────────────────────────────
  async function register(email, password, name, businessName) {
    const { data } = await api.post('/auth/register', { email, password, name, businessName })
    _applySession(data)
  }

  // ── Register new tenant ──────────────────────────────────────────────────────
  async function registerTenant(email, password, name, businessName) {
    const { data } = await api.post('/auth/register-tenant', { email, password, name, businessName })
    _applySession(data)
  }

  // ── Restore session on page reload ──────────────────────────────────────────
  // Uses the httpOnly refresh cookie (sent automatically by the browser).
  // Uses a plain axios instance so it doesn't trigger the 401 interceptor loop.
  async function tryRestoreSession() {
    if (_restoreAttempted) return isLoggedIn.value
    _restoreAttempted = true

    if (!user.value) return false      // no stored user → definitely no session
    if (getAccessToken()) return true  // already have a live token (e.g. just logged in)

    try {
      const { data } = await axios.post('/api/auth/refresh', {}, { withCredentials: true })
      _applySession(data)
      return true
    } catch {
      // Refresh cookie expired or invalid → clear stale user data
      user.value = null
      localStorage.removeItem('user')
      return false
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────────────
  async function logout() {
    try { await api.post('/auth/logout') } catch (_) {}
    clearAccessToken()
    user.value = null
    localStorage.removeItem('user')
    _restoreAttempted = false
  }

  return {
    user, isLoggedIn, isAdmin, isSuperAdmin, tenantId,
    login, register, registerTenant, logout, tryRestoreSession,
  }
})
