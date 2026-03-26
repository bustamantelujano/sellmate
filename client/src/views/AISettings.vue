<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Configuracion de IA</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona el proveedor de inteligencia artificial y sus parametros</p>
    </div>

    <div v-if="!form" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>

    <div v-else class="max-w-3xl space-y-6">

      <!-- Section 1: Proveedor de IA -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Proveedor de IA</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button v-for="prov in providers" :key="prov.key" @click="form.ai_provider = prov.key"
            class="flex flex-col items-center p-5 rounded-xl border-2 transition-all text-center hover:shadow-md"
            :class="form.ai_provider === prov.key
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
            <span class="text-3xl mb-2">{{ prov.icon }}</span>
            <span class="text-sm font-semibold text-gray-800 dark:text-white">{{ prov.name }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ prov.desc }}</span>
            <div class="flex flex-wrap gap-1 mt-2 justify-center">
              <span v-for="feat in prov.features" :key="feat"
                class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                {{ feat }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Section 2: Configuracion -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Configuracion</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
            <div class="relative">
              <input v-model="form.ai_api_key" :type="showApiKey ? 'text' : 'password'" placeholder="sk-..."
                class="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              <button @click="showApiKey = !showApiKey" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg v-if="!showApiKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
              </button>
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Tu API key se almacena de forma segura en el servidor</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
            <select v-model="form.ai_model"
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Seleccionar modelo...</option>
              <option v-for="m in modelSuggestions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div v-if="form.ai_provider === 'custom'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint personalizado</label>
            <input v-model="form.ai_custom_endpoint" placeholder="https://your-api.com/v1/chat/completions"
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-3 pt-2">
            <button @click="save" :disabled="saving"
              class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {{ saving ? 'Guardando...' : 'Guardar configuracion' }}
            </button>
            <button @click="testConnection" :disabled="testing"
              class="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {{ testing ? 'Probando...' : 'Probar conexion' }}
            </button>
            <p v-if="saved" class="text-green-600 text-sm">Guardado</p>
            <p v-if="testResult" class="text-sm" :class="testResult.success ? 'text-green-600' : 'text-red-600'">{{ testResult.message }}</p>
          </div>
        </div>
      </div>

      <!-- Section 3: Consumo (placeholder) -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Consumo</h3>
        <div class="flex flex-col items-center justify-center py-8 text-center">
          <span class="text-4xl mb-3">📊</span>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Proximamente: estadisticas de uso de IA</p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Aqui podras ver cuantos tokens y mensajes procesa tu bot</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '../stores/settings'
import api from '../lib/api'

const settingsStore = useSettingsStore()
const form = ref(null)
const showApiKey = ref(false)
const saving = ref(false)
const saved = ref(false)
const testing = ref(false)
const testResult = ref(null)

const providers = [
  { key: 'openai', icon: '🟢', name: 'OpenAI', desc: 'GPT-4o, GPT-4o mini', features: ['Vision', 'Tool Calling', 'JSON Mode'] },
  { key: 'anthropic', icon: '🟠', name: 'Anthropic', desc: 'Claude Sonnet, Haiku', features: ['Vision', 'Tool Calling', 'Largo contexto'] },
  { key: 'gemini', icon: '🔵', name: 'Google Gemini', desc: 'Gemini 2.0 Flash, 2.5 Pro', features: ['Vision', 'Rapido', 'Economico'] },
  { key: 'custom', icon: '🔧', name: 'Custom', desc: 'API compatible OpenAI', features: ['Flexible', 'Auto-hospedado'] }
]

const modelSuggestions = computed(() => {
  if (!form.value) return []
  if (form.value.ai_provider === 'openai') return ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo']
  if (form.value.ai_provider === 'anthropic') return ['claude-sonnet-4-6', 'claude-haiku-4-5-20250315']
  if (form.value.ai_provider === 'gemini') return ['gemini-2.0-flash', 'gemini-2.5-flash-preview-05-20', 'gemini-2.5-pro-preview-05-06']
  return ['gpt-4o-mini', 'gpt-4o']
})

onMounted(async () => {
  await settingsStore.fetchSettings()
  if (settingsStore.settings) {
    form.value = {
      ai_provider: settingsStore.settings.ai_provider || 'openai',
      ai_api_key: settingsStore.settings.ai_api_key || '',
      ai_model: settingsStore.settings.ai_model || '',
      ai_custom_endpoint: settingsStore.settings.ai_custom_endpoint || ''
    }
  }
})

async function save() {
  saving.value = true
  saved.value = false
  testResult.value = null
  try {
    await settingsStore.updateSettings(form.value)
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e) {
    alert('Error al guardar configuracion de IA')
  } finally {
    saving.value = false
  }
}

async function testConnection() {
  testing.value = true
  testResult.value = null
  try {
    const { data } = await api.post('/settings/test-ai', {
      ai_provider: form.value.ai_provider,
      ai_api_key: form.value.ai_api_key,
      ai_model: form.value.ai_model,
      ai_custom_endpoint: form.value.ai_custom_endpoint
    })
    testResult.value = { success: true, message: data.message || 'Conexion exitosa' }
  } catch (e) {
    testResult.value = { success: false, message: e.response?.data?.error || 'Error de conexion' }
  } finally {
    testing.value = false
  }
}
</script>
