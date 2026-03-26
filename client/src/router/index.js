import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/setup', name: 'SetupWizard', component: () => import('../views/SetupWizard.vue') },
  { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue') },
  { path: '/products', name: 'Products', component: () => import('../views/Products.vue') },
  { path: '/business', name: 'Business', component: () => import('../views/BusinessInfo.vue') },
  { path: '/conversations', name: 'Conversations', component: () => import('../views/Conversations.vue') },
  { path: '/conversations/:id', name: 'ChatView', component: () => import('../views/ChatView.vue') },
  { path: '/appointments', name: 'Appointments', component: () => import('../views/Appointments.vue') },
  { path: '/followups', name: 'FollowUps', component: () => import('../views/FollowUps.vue') },
  { path: '/settings', name: 'Settings', component: () => import('../views/Settings.vue') },
  { path: '/agents', name: 'Agents', component: () => import('../views/Agents.vue') },
  { path: '/modules', name: 'Modules', component: () => import('../views/Modules.vue') },
  { path: '/ai-settings', name: 'AISettings', component: () => import('../views/AISettings.vue') },
  { path: '/clients', name: 'Clients', component: () => import('../views/Clients.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) {
    next('/login')
  } else if (token && to.name !== 'SetupWizard' && to.name !== 'Login') {
    // Check if setup is completed
    try {
      const { useSettingsStore } = await import('../stores/settings')
      const settingsStore = useSettingsStore()
      if (!settingsStore.settings) {
        await settingsStore.fetchSettings()
      }
      if (settingsStore.settings && settingsStore.settings.setup_completed === 0) {
        next('/setup')
        return
      }
    } catch (e) {
      // If settings fetch fails, let them through
    }
    next()
  } else {
    next()
  }
})

export default router
