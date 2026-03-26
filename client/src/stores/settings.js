import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../lib/api'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(null)
  const whatsappStatus = ref('disconnected')
  const qrCode = ref('')
  const waError = ref('')
  const onlineStatus = ref(true)
  const modules = ref({})

  const setupCompleted = computed(() => settings.value?.setup_completed === 1)

  async function fetchSettings() {
    const { data } = await api.get('/settings')
    settings.value = data.settings
    if (data.settings) {
      onlineStatus.value = !!data.settings.online_status
    }
  }

  async function updateSettings(payload) {
    const { data } = await api.put('/settings', payload)
    settings.value = data.settings
  }

  async function toggleOnlineStatus() {
    const newStatus = !onlineStatus.value
    await api.put('/settings/online-status', { online_status: newStatus })
    onlineStatus.value = newStatus
  }

  async function fetchModules() {
    try {
      const { data } = await api.get('/modules')
      modules.value = data.modules || {}
    } catch (e) {
      modules.value = {}
    }
  }

  async function toggleModule(key, enabled) {
    await api.put(`/modules/${key}`, { enabled })
    modules.value = { ...modules.value, [key]: enabled }
  }

  return {
    settings, whatsappStatus, qrCode, waError, onlineStatus, modules, setupCompleted,
    fetchSettings, updateSettings, toggleOnlineStatus, fetchModules, toggleModule
  }
})
