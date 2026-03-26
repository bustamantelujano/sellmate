<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Modulos</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Activa o desactiva las funciones de tu SellMate</p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>

    <div v-else class="space-y-8">
      <div v-for="group in groupedModules" :key="group.label">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{{ group.label }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="mod in group.modules" :key="mod.key"
            class="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border transition-colors"
            :class="mod.enabled
              ? 'border-primary-200 dark:border-primary-800'
              : 'border-gray-100 dark:border-gray-700'">
            <div class="flex items-start justify-between mb-3">
              <span class="text-3xl">{{ mod.icon }}</span>
              <button @click="toggleModule(mod)" :disabled="mod.toggling"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                :class="mod.enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="mod.enabled ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </div>
            <h4 class="text-sm font-semibold text-gray-800 dark:text-white mb-1">{{ mod.name }}</h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ mod.desc }}</p>
            <div v-if="mod.toggling" class="mt-2">
              <span class="text-xs text-primary-600 dark:text-primary-400">Guardando...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const loading = ref(true)

const moduleDefinitions = [
  { key: 'products', icon: '📦', name: 'Productos / Servicios', desc: 'Catalogo de productos con precios e imagenes', category: 'operations' },
  { key: 'orders', icon: '🛒', name: 'Pedidos', desc: 'Recibe y gestiona pedidos desde WhatsApp', category: 'sales' },
  { key: 'appointments', icon: '📅', name: 'Citas / Agenda', desc: 'Permite a clientes agendar citas por WhatsApp', category: 'operations' },
  { key: 'followups', icon: '💛', name: 'Fidelizacion', desc: 'Seguimiento automatico a clientes', category: 'engagement' },
  { key: 'copilot', icon: '🤖', name: 'Copiloto IA', desc: 'Sugerencias de respuesta para agentes humanos', category: 'ai' },
  { key: 'auto_reply', icon: '⚡', name: 'Respuesta automatica', desc: 'El bot responde automaticamente a clientes', category: 'ai' }
]

const modules = ref([])

const groupedModules = computed(() => {
  const groups = [
    { key: 'operations', label: 'Operaciones' },
    { key: 'sales', label: 'Ventas' },
    { key: 'engagement', label: 'Engagement' },
    { key: 'ai', label: 'IA' }
  ]
  return groups.map(g => ({
    ...g,
    modules: modules.value.filter(m => m.category === g.key)
  })).filter(g => g.modules.length > 0)
})

onMounted(async () => {
  try {
    await settingsStore.fetchModules()
    modules.value = moduleDefinitions.map(def => ({
      ...def,
      enabled: settingsStore.modules?.[def.key] ?? false,
      toggling: false
    }))
  } catch (e) {
    // Fallback: all disabled
    modules.value = moduleDefinitions.map(def => ({ ...def, enabled: false, toggling: false }))
  } finally {
    loading.value = false
  }
})

async function toggleModule(mod) {
  mod.toggling = true
  const newVal = !mod.enabled
  try {
    await settingsStore.toggleModule(mod.key, newVal)
    mod.enabled = newVal
  } catch (e) {
    // Revert on error
  } finally {
    mod.toggling = false
  }
}
</script>
