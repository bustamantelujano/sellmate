import axios from 'axios'

// ── In-memory access token ───────────────────────────────────────────────────
// Stored here (not in localStorage) so XSS cannot read it.
// The auth store calls setAccessToken() / clearAccessToken() to manage it.
let _accessToken = ''
export function setAccessToken(token) { _accessToken = token }
export function clearAccessToken() { _accessToken = '' }
export function getAccessToken() { return _accessToken }

// ── Main API instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,           // sends the httpOnly refresh cookie automatically
  headers: { 'Content-Type': 'application/json' },
})

// ── Separate instance for refresh calls (no interceptors → no infinite loop) ─
const refreshApi = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// ── Request interceptor: attach access token ─────────────────────────────────
api.interceptors.request.use(config => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

// ── Response interceptor: silent token refresh on 401 ───────────────────────
let _isRefreshing = false
let _waitingQueue = []   // requests that arrived while a refresh was in progress

function flushQueue(error, newToken) {
  _waitingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(newToken)
  )
  _waitingQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config

    // Only intercept 401s that haven't been retried yet
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err)
    }

    // If a refresh is already in flight, queue this request until it resolves
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _waitingQueue.push({ resolve, reject })
      }).then(newToken => {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }).catch(e => Promise.reject(e))
    }

    original._retry = true
    _isRefreshing = true

    try {
      const { data } = await refreshApi.post('/auth/refresh')
      setAccessToken(data.token)
      flushQueue(null, data.token)
      original.headers.Authorization = `Bearer ${data.token}`
      return api(original)
    } catch (refreshErr) {
      flushQueue(refreshErr, null)
      clearAccessToken()
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(refreshErr)
    } finally {
      _isRefreshing = false
    }
  }
)

export default api
