<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Ajustes</h2>
    <div v-if="form" class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- LEFT COLUMN: Bot + Filtro + IA -->
      <div class="space-y-6">
        <!-- Bot Configuration -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Configuracion del Bot</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del bot</label>
              <input v-model="form.bot_name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amabilidad: <span class="text-primary-600 font-bold">{{ form.friendliness }}/10</span>
                <span class="text-gray-400 dark:text-gray-500 text-xs ml-2">{{ friendlinessLabel }}</span>
              </label>
              <input v-model.number="form.friendliness" type="range" min="1" max="10" class="w-full accent-primary-600" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje de saludo</label>
              <textarea v-model="form.greeting_message" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Usa {bot_name} para insertar el nombre del bot</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje de despedida</label>
              <textarea v-model="form.farewell_message" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
            </div>
          </div>
        </div>

        <!-- Filtro de contactos -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-3">Filtro de contactos</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Decide a quienes responde el bot automaticamente.</p>
          <div class="flex gap-3">
            <label class="flex-1 cursor-pointer">
              <input type="radio" v-model="form.whitelist_mode" value="all" class="sr-only peer" />
              <div class="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-center transition-colors peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="text-sm font-medium text-gray-800 dark:text-white">Todos</span>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">El bot responde a cualquier numero</p>
              </div>
            </label>
            <label class="flex-1 cursor-pointer">
              <input type="radio" v-model="form.whitelist_mode" value="whitelist" class="sr-only peer" />
              <div class="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-center transition-colors peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                <svg class="w-6 h-6 mx-auto mb-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                <span class="text-sm font-medium text-gray-800 dark:text-white">Solo lista blanca</span>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Solo responde a numeros autorizados</p>
              </div>
            </label>
          </div>

          <!-- Whitelist Management (only when whitelist mode) -->
          <div v-if="form.whitelist_mode === 'whitelist'" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Numeros autorizados</h4>
            <div class="flex gap-2 mb-3">
              <input v-model="newPhone" placeholder="Ej: 521234567890"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                @keyup.enter="addToWhitelist" />
              <input v-model="newLabel" placeholder="Etiqueta (opcional)"
                class="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                @keyup.enter="addToWhitelist" />
              <button @click="addToWhitelist" :disabled="!newPhone.trim() || addingPhone"
                class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                {{ addingPhone ? '...' : '+ Agregar' }}
              </button>
            </div>
            <p v-if="whitelistError" class="text-red-600 text-xs mb-2">{{ whitelistError }}</p>
            <div v-if="whitelist.length === 0" class="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              No hay numeros en la lista blanca. El bot no respondera a nadie hasta que agregues al menos un numero.
            </div>
            <div v-else class="space-y-1 max-h-60 overflow-y-auto">
              <div v-for="entry in whitelist" :key="entry.id"
                class="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-800 dark:text-white">{{ entry.phone_number }}</span>
                  <span v-if="entry.label" class="text-xs text-gray-400 dark:text-gray-500">{{ entry.label }}</span>
                </div>
                <button @click="removeFromWhitelist(entry.id)"
                  class="text-red-400 hover:text-red-600 text-sm transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Provider Link -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Configuracion de IA</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Proveedor: {{ form.ai_provider || 'No configurado' }} {{ form.ai_model ? '(' + form.ai_model + ')' : '' }}</p>
          <router-link to="/ai-settings"
            class="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            Configuracion avanzada de IA
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </router-link>
        </div>

        <!-- Save Button -->
        <div class="flex items-center gap-3">
          <button @click="save" :disabled="saving"
            class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {{ saving ? 'Guardando...' : 'Guardar ajustes' }}
          </button>
          <p v-if="saved" class="text-green-600 text-sm">Guardado</p>
        </div>
      </div>

      <!-- RIGHT COLUMN: WhatsApp + MCP -->
      <div class="space-y-6">
        <!-- WhatsApp Connection -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Conexion WhatsApp</h3>
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <!-- Status indicator -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="relative flex h-3 w-3">
                  <span v-if="settingsStore.whatsappStatus === 'connected'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3" :class="{
                    'bg-green-500': settingsStore.whatsappStatus === 'connected',
                    'bg-yellow-500': settingsStore.whatsappStatus === 'connecting',
                    'bg-gray-400': settingsStore.whatsappStatus === 'disconnected'
                  }"></span>
                </span>
                <span class="text-sm font-medium" :class="{
                  'text-green-700 dark:text-green-300': settingsStore.whatsappStatus === 'connected',
                  'text-yellow-700 dark:text-yellow-300': settingsStore.whatsappStatus === 'connecting',
                  'text-gray-600 dark:text-gray-400': settingsStore.whatsappStatus === 'disconnected'
                }">
                  {{ waStatusLabel }}
                </span>
              </div>
              <div class="flex gap-2">
                <button v-if="settingsStore.whatsappStatus !== 'connected'"
                  @click="connectWhatsApp" :disabled="waConnecting"
                  class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {{ waConnecting ? 'Conectando...' : 'Conectar' }}
                </button>
                <button v-if="settingsStore.whatsappStatus === 'connected'"
                  @click="disconnectWhatsApp" :disabled="waDisconnecting"
                  class="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {{ waDisconnecting ? 'Desconectando...' : 'Desconectar' }}
                </button>
              </div>
            </div>

            <!-- QR Code Display -->
            <div v-if="settingsStore.qrCode" class="text-center py-4">
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Escanea este codigo QR con WhatsApp en tu telefono:</p>
              <img :src="settingsStore.qrCode" alt="QR Code" class="mx-auto w-64 h-64 rounded-lg border border-gray-200 dark:border-gray-600" />
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">Abre WhatsApp &gt; Dispositivos vinculados &gt; Vincular dispositivo</p>
            </div>

            <!-- Waiting for QR -->
            <div v-else-if="settingsStore.whatsappStatus === 'connecting' && !settingsStore.qrCode" class="text-center py-6">
              <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p class="text-sm text-gray-500 dark:text-gray-400">Generando codigo QR...</p>
            </div>

            <!-- Connected message -->
            <div v-else-if="settingsStore.whatsappStatus === 'connected'" class="text-center py-4">
              <svg class="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-green-700 dark:text-green-300 font-medium">WhatsApp conectado y funcionando</p>
            </div>

            <!-- Error message -->
            <div v-if="settingsStore.waError" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p class="text-sm text-red-700 dark:text-red-300">{{ settingsStore.waError }}</p>
              <button @click="connectWhatsApp" class="text-xs text-red-600 dark:text-red-400 underline mt-1 hover:text-red-800">
                Intentar reconectar
              </button>
            </div>
          </div>
        </div>

        <!-- MCP Servers -->
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-1">Servidores MCP</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Conecta herramientas externas para que el bot pueda consultar APIs, bases de datos y mas.</p>

          <!-- Existing servers list -->
          <div v-if="mcpServers.length > 0" class="space-y-3 mb-4">
            <div v-for="srv in mcpServers" :key="srv.id"
              class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="srv.connected ? 'bg-green-500' : 'bg-gray-400'"></span>
                  <span class="text-sm font-medium text-gray-800 dark:text-white">{{ srv.name }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="srv.transport === 'stdio' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'">
                    {{ srv.transport.toUpperCase() }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="srv.connected" class="text-xs text-green-600 dark:text-green-400">{{ srv.toolCount }} herramienta{{ srv.toolCount !== 1 ? 's' : '' }}</span>
                  <button @click="testMcpServer(srv.id)" :disabled="mcpTesting === srv.id"
                    class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors disabled:opacity-50">
                    {{ mcpTesting === srv.id ? 'Probando...' : 'Probar' }}
                  </button>
                  <button @click="removeMcpServer(srv.id)"
                    class="text-xs text-red-400 hover:text-red-600 transition-colors">
                    Eliminar
                  </button>
                </div>
              </div>
              <!-- Tools list -->
              <div v-if="srv.tools && srv.tools.length > 0" class="mt-2">
                <div class="flex flex-wrap gap-1">
                  <span v-for="tool in srv.tools" :key="tool.name"
                    class="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    :title="tool.description">
                    {{ tool.name }}
                  </span>
                </div>
              </div>
              <p v-if="mcpTestResult && mcpTestResult.id === srv.id" class="text-xs mt-2"
                :class="mcpTestResult.success ? 'text-green-600' : 'text-red-600'">
                {{ mcpTestResult.message }}
              </p>
            </div>
          </div>

          <!-- Add new server form -->
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Agregar servidor MCP</h4>
            <div class="space-y-3">
              <div class="flex gap-3">
                <div class="flex-1">
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                  <input v-model="mcpForm.name" placeholder="Ej: weather-api"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div class="w-36">
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Transporte</label>
                  <select v-model="mcpForm.transport"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="stdio">STDIO</option>
                    <option value="sse">SSE</option>
                  </select>
                </div>
              </div>

              <!-- STDIO fields -->
              <div v-if="mcpForm.transport === 'stdio'">
                <div class="flex gap-3">
                  <div class="w-40">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Comando</label>
                    <input v-model="mcpForm.command" placeholder="Ej: npx, node, python"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Argumentos (separados por coma)</label>
                    <input v-model="mcpForm.argsStr" placeholder="Ej: -y, @modelcontextprotocol/server-weather"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div class="mt-3">
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Variables de entorno (JSON)</label>
                  <input v-model="mcpForm.envStr" placeholder='Ej: {"API_KEY": "abc123"}'
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <!-- SSE fields -->
              <div v-if="mcpForm.transport === 'sse'">
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">URL del servidor</label>
                <input v-model="mcpForm.url" placeholder="https://your-mcp-server.com/sse"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div class="flex items-center gap-3">
                <button @click="addMcpServer" :disabled="mcpAdding || !mcpForm.name.trim()"
                  class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {{ mcpAdding ? 'Conectando...' : 'Agregar servidor' }}
                </button>
                <p v-if="mcpError" class="text-red-600 text-xs">{{ mcpError }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import api from '../lib/api'

const settingsStore = useSettingsStore()
const form = ref(null)
const saving = ref(false)
const saved = ref(false)

// Whitelist state
const whitelist = ref([])
const newPhone = ref('')
const newLabel = ref('')
const addingPhone = ref(false)
const whitelistError = ref('')

// WhatsApp connection state
const waConnecting = ref(false)
const waDisconnecting = ref(false)

const waStatusLabel = computed(() => {
  const map = {
    connected: 'Conectado',
    connecting: 'Conectando...',
    disconnected: 'Desconectado'
  }
  return map[settingsStore.whatsappStatus] || 'Desconectado'
})

async function connectWhatsApp() {
  waConnecting.value = true
  settingsStore.waError = ''
  settingsStore.qrCode = ''
  try {
    await api.post('/whatsapp/connect')
  } catch (e) {
    settingsStore.waError = e.response?.data?.error || 'Error al conectar'
  } finally {
    waConnecting.value = false
  }
}

async function disconnectWhatsApp() {
  if (!confirm('¿Desconectar WhatsApp? Tendras que escanear un nuevo QR para reconectar.')) return
  waDisconnecting.value = true
  try {
    await api.post('/whatsapp/disconnect')
    settingsStore.whatsappStatus = 'disconnected'
    settingsStore.qrCode = ''
    settingsStore.waError = ''
  } catch (e) {
    settingsStore.waError = e.response?.data?.error || 'Error al desconectar'
  } finally {
    waDisconnecting.value = false
  }
}

const friendlinessLabel = computed(() => {
  if (!form.value) return ''
  const f = form.value.friendliness
  if (f <= 3) return '(Directo y conciso)'
  if (f <= 6) return '(Amable y profesional)'
  return '(Muy calido y cercano)'
})

onMounted(async () => {
  await settingsStore.fetchSettings()
  form.value = { ...settingsStore.settings }
  await loadWhitelist()
  await loadMcpServers()
  // Fetch current WhatsApp status and QR
  try {
    const { data: statusData } = await api.get('/whatsapp/status')
    settingsStore.whatsappStatus = statusData.status || 'disconnected'
    const { data: qrData } = await api.get('/whatsapp/qr')
    if (qrData.qr) settingsStore.qrCode = qrData.qr
  } catch (e) { /* ignore */ }
})

watch(() => form.value?.whitelist_mode, (mode) => {
  if (mode === 'whitelist') loadWhitelist()
})

async function loadWhitelist() {
  try {
    const { data } = await api.get('/settings/whitelist')
    whitelist.value = data.whitelist
  } catch (e) { /* ignore */ }
}

async function addToWhitelist() {
  if (!newPhone.value.trim()) return
  addingPhone.value = true
  whitelistError.value = ''
  try {
    const { data } = await api.post('/settings/whitelist', {
      phone_number: newPhone.value.trim(),
      label: newLabel.value.trim()
    })
    whitelist.value.unshift(data.entry)
    newPhone.value = ''
    newLabel.value = ''
  } catch (e) {
    whitelistError.value = e.response?.data?.error || 'Error al agregar numero'
  } finally {
    addingPhone.value = false
  }
}

async function removeFromWhitelist(id) {
  try {
    await api.delete(`/settings/whitelist/${id}`)
    whitelist.value = whitelist.value.filter(e => e.id !== id)
  } catch (e) {
    alert('Error al eliminar numero')
  }
}

async function save() {
  saving.value = true
  saved.value = false
  try {
    await settingsStore.updateSettings(form.value)
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (err) {
    alert('Error guardando ajustes')
  } finally {
    saving.value = false
  }
}

// ===== MCP Servers =====
const mcpServers = ref([])
const mcpForm = ref({
  name: '',
  transport: 'stdio',
  command: '',
  argsStr: '',
  envStr: '',
  url: ''
})
const mcpAdding = ref(false)
const mcpError = ref('')
const mcpTesting = ref(null)
const mcpTestResult = ref(null)

async function loadMcpServers() {
  try {
    const { data } = await api.get('/settings/mcp')
    mcpServers.value = data.servers
  } catch (e) { /* ignore */ }
}

async function addMcpServer() {
  if (!mcpForm.value.name.trim()) return
  mcpAdding.value = true
  mcpError.value = ''

  // Parse args string into array
  const args = mcpForm.value.argsStr
    ? mcpForm.value.argsStr.split(',').map(a => a.trim()).filter(Boolean)
    : []

  // Parse env vars
  let env_vars = {}
  if (mcpForm.value.envStr.trim()) {
    try {
      env_vars = JSON.parse(mcpForm.value.envStr)
    } catch (e) {
      mcpError.value = 'Variables de entorno no es JSON valido'
      mcpAdding.value = false
      return
    }
  }

  try {
    const { data } = await api.post('/settings/mcp', {
      name: mcpForm.value.name.trim(),
      transport: mcpForm.value.transport,
      command: mcpForm.value.command || '',
      args,
      url: mcpForm.value.url || '',
      env_vars
    })

    if (data.connectionError) {
      mcpError.value = `Servidor guardado pero fallo la conexion: ${data.connectionError}`
    }

    if (data.servers) {
      mcpServers.value = data.servers
    } else {
      await loadMcpServers()
    }

    // Reset form
    mcpForm.value = { name: '', transport: 'stdio', command: '', argsStr: '', envStr: '', url: '' }
  } catch (e) {
    mcpError.value = e.response?.data?.error || 'Error al agregar servidor'
  } finally {
    mcpAdding.value = false
  }
}

async function removeMcpServer(id) {
  if (!confirm('Eliminar este servidor MCP?')) return
  try {
    await api.delete(`/settings/mcp/${id}`)
    mcpServers.value = mcpServers.value.filter(s => s.id !== id)
  } catch (e) {
    alert('Error al eliminar servidor')
  }
}

async function testMcpServer(id) {
  mcpTesting.value = id
  mcpTestResult.value = null
  try {
    const { data } = await api.post(`/settings/mcp/${id}/test`)
    mcpTestResult.value = {
      id,
      success: true,
      message: `Conexion exitosa! ${data.tools?.length || 0} herramienta(s) disponibles.`
    }
    await loadMcpServers()
  } catch (e) {
    mcpTestResult.value = {
      id,
      success: false,
      message: e.response?.data?.error || 'Error de conexion'
    }
  } finally {
    mcpTesting.value = null
  }
}

</script>
