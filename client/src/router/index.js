import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'Landing', component: () => import('../views/Landing.vue'), meta: { public: true } },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/setup', name: 'SetupWizard', component: () => import('../views/SetupWizard.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
  { path: '/business', name: 'Business', component: () => import('../views/BusinessInfo.vue') },
  { path: '/conversations', name: 'Conversations', component: () => import('../views/Conversations.vue') },
  { path: '/conversations/:id', name: 'ChatView', component: () => import('../views/ChatView.vue') },
  { path: '/appointments', name: 'Appointments', component: () => import('../views/Appointments.vue') },
  { path: '/followups', name: 'FollowUps', component: () => import('../views/FollowUps.vue') },
  { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue') },
  { path: '/agents', name: 'Agents', component: () => import('../views/Agents.vue') },
  { path: '/modules', name: 'Modules', component: () => import('../views/Modules.vue') },
  { path: '/ai-settings', redirect: '/settings' },
  { path: '/ai-usage', name: 'AIUsage', component: () => import('../views/AIUsage.vue') },
  { path: '/clients', name: 'Clients', component: () => import('../views/Clients.vue') },
  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue') },
  { path: '/cita/:token', name: 'AppointmentConfirm', component: () => import('../views/AppointmentConfirm.vue'), meta: { public: true } },
  { path: '/privacidad', name: 'Privacy', component: () => import('../views/Privacy.vue'), meta: { public: true } },
  { path: '/terminos', name: 'Terms', component: () => import('../views/Terms.vue'), meta: { public: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!to.meta.public) {
    // Try to restore session from refresh cookie on first protected navigation
    const loggedIn = await auth.tryRestoreSession()

    if (!loggedIn) {
      next('/login')
      return
    }

    // Authenticated user going to landing → dashboard
    if (to.name === 'Landing') {
      next('/dashboard')
      return
    }

    // Check setup completion (skip for setup page itself)
    if (to.name !== 'SetupWizard') {
      try {
        const { useSettingsStore } = await import('../stores/settings')
        const settingsStore = useSettingsStore()
        if (!settingsStore.settings) await settingsStore.fetchSettings()
        if (settingsStore.settings?.setup_completed === 0) {
          next('/setup')
          return
        }
      } catch (_) {
        // If settings fetch fails, let them through
      }
    }

    next()
    return
  }

  // Public route: redirect logged-in users away from landing/login
  if (auth.isLoggedIn && (to.name === 'Landing' || to.name === 'Login')) {
    next('/dashboard')
    return
  }

  next()
})

export default router
