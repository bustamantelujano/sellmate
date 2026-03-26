<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Ajustes</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Configura tu asistente, modulos y conexiones</p>
    </div>

    <div v-if="!form" class="flex items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
    </div>

    <div v-else class="flex gap-6">
      <!-- Section Nav -->
      <nav class="hidden md:block w-48 flex-shrink-0">
        <div class="sticky top-6 space-y-1">
          <button v-for="sec in sections" :key="sec.key" @click="activeSection = sec.key"
            class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left"
            :class="activeSection === sec.key
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'">
            <span class="text-base">{{ sec.icon }}</span>
            {{ sec.label }}
          </button>
        </div>
      </nav>

      <!-- Mobile section selector -->
      <select v-model="activeSection" class="md:hidden w-full mb-4 px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
        <option v-for="sec in sections" :key="sec.key" :value="sec.key">{{ sec.icon }} {{ sec.label }}</option>
      </select>

      <!-- Content -->
      <div class="flex-1 max-w-3xl space-y-6">

        <!-- ===== BOT ===== -->
        <template v-if="activeSection === 'bot'">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Configuracion del Bot</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del bot</label>
                <input v-model="form.bot_name" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
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
                <textarea v-model="form.greeting_message" rows="2" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Usa {bot_name} para insertar el nombre del bot</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje de despedida</label>
                <textarea v-model="form.farewell_message" rows="2" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              </div>
              <div class="flex items-center gap-3 pt-2">
                <button @click="save" :disabled="saving" class="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {{ saving ? 'Guardando...' : 'Guardar' }}
                </button>
                <p v-if="saved" class="text-green-600 text-sm">Guardado</p>
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
                  <span class="text-lg">🌍</span>
                  <span class="block text-sm font-medium text-gray-800 dark:text-white mt-1">Todos</span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Responde a cualquier numero</p>
                </div>
              </label>
              <label class="flex-1 cursor-pointer">
                <input type="radio" v-model="form.whitelist_mode" value="whitelist" class="sr-only peer" />
                <div class="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-center transition-colors peer-checked:border-primary-500 peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20">
                  <span class="text-lg">📋</span>
                  <span class="block text-sm font-medium text-gray-800 dark:text-white mt-1">Solo lista blanca</span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Solo numeros autorizados</p>
                </div>
              </label>
            </div>

            <div v-if="form.whitelist_mode === 'whitelist'" class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Numeros autorizados</h4>
              <div class="flex gap-2 mb-3">
                <input v-model="newPhone" placeholder="521234567890"
                  class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  @keyup.enter="addToWhitelist" />
                <input v-model="newLabel" placeholder="Etiqueta"
                  class="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  @keyup.enter="addToWhitelist" />
                <button @click="addToWhitelist" :disabled="!newPhone.trim() || addingPhone"
                  class="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {{ addingPhone ? '...' : '+' }}
                </button>
              </div>
              <p v-if="whitelistError" class="text-red-600 text-xs mb-2">{{ whitelistError }}</p>
              <div v-if="whitelist.length === 0" class="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
                Sin numeros. El bot no respondera a nadie.
              </div>
              <div v-else class="space-y-1 max-h-48 overflow-y-auto">
                <div v-for="entry in whitelist" :key="entry.id"
                  class="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-mono text-gray-800 dark:text-white">{{ entry.phone_number }}</span>
                    <span v-if="entry.label" class="text-xs text-gray-400">{{ entry.label }}</span>
                  </div>
                  <button @click="removeFromWhitelist(entry.id)" class="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== MODULOS ===== -->
        <template v-if="activeSection === 'modules'">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-semibold text-gray-800 dark:text-white">Modulos</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Activa o desactiva funcionalidades segun tu negocio</p>
              </div>
              <router-link to="/setup" class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1">
                ✨ Asistente de configuracion
              </router-link>
            </div>
            <div class="space-y-2">
              <div v-for="mod in allModules" :key="mod.key"
                class="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
                :class="settingsStore.modules?.[mod.key]
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'border-gray-200 dark:border-gray-600'">
                <div class="flex items-center gap-3">
                  <span class="text-xl">{{ mod.icon }}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-800 dark:text-white">{{ mod.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ mod.desc }}</p>
                  </div>
                </div>
                <button @click="toggleModule(mod.key)"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  :class="settingsStore.modules?.[mod.key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'">
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="settingsStore.modules?.[mod.key] ? 'translate-x-6' : 'translate-x-1'"></span>
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== IA ===== -->
        <template v-if="activeSection === 'ai'">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-2">Inteligencia Artificial</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Proveedor actual: <span class="font-medium text-gray-700 dark:text-gray-200">{{ form.ai_provider || 'No configurado' }}</span>
              <span v-if="form.ai_model" class="text-gray-400"> ({{ form.ai_model }})</span>
            </p>
            <router-link to="/ai-settings"
              class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Configurar proveedor de IA
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </router-link>
          </div>
        </template>

        <!-- ===== WHATSAPP ===== -->
        <template v-if="activeSection === 'whatsapp'">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Conexion WhatsApp</h3>
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-600">
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
                  }">{{ waStatusLabel }}</span>
                </div>
                <div class="flex gap-2">
                  <button v-if="settingsStore.whatsappStatus !== 'connected'" @click="connectWhatsApp" :disabled="waConnecting"
                    class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {{ waConnecting ? 'Conectando...' : 'Conectar' }}
                  </button>
                  <button v-if="settingsStore.whatsappStatus === 'connected'" @click="disconnectWhatsApp" :disabled="waDisconnecting"
                    class="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    {{ waDisconnecting ? '...' : 'Desconectar' }}
                  </button>
                </div>
              </div>

              <div v-if="settingsStore.qrCode" class="text-center py-4">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Escanea con WhatsApp:</p>
                <img :src="settingsStore.qrCode" alt="QR" class="mx-auto w-56 h-56 rounded-lg border border-gray-200 dark:border-gray-600" />
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">WhatsApp → Dispositivos vinculados → Vincular</p>
              </div>

              <div v-else-if="settingsStore.whatsappStatus === 'connecting' && !settingsStore.qrCode" class="text-center py-6">
                <svg class="animate-spin h-8 w-8 text-primary-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p class="text-sm text-gray-500 dark:text-gray-400">Generando QR...</p>
              </div>

              <div v-else-if="settingsStore.whatsappStatus === 'connected'" class="text-center py-4">
                <span class="text-4xl block mb-2">✅</span>
                <p class="text-sm text-green-700 dark:text-green-300 font-medium">WhatsApp conectado</p>
              </div>

              <div v-if="settingsStore.waError" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p class="text-sm text-red-700 dark:text-red-300">{{ settingsStore.waError }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== MCP ===== -->
        <template v-if="activeSection === 'mcp'">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-1">Servidores MCP</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Conecta herramientas externas para el bot.</p>

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
                    <span v-if="srv.connected" class="text-xs text-green-600 dark:text-green-400">{{ srv.toolCount }} tool{{ srv.toolCount !== 1 ? 's' : '' }}</span>
                    <button @click="testMcpServer(srv.id)" :disabled="mcpTesting === srv.id" class="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-50">
                      {{ mcpTesting === srv.id ? '...' : 'Probar' }}
                    </button>
                    <button @click="removeMcpServer(srv.id)" class="text-xs text-red-400 hover:text-red-600">Eliminar</button>
                  </div>
                </div>
                <div v-if="srv.tools && srv.tools.length > 0" class="flex flex-wrap gap-1 mt-1">
                  <span v-for="tool in srv.tools" :key="tool.name" class="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">{{ tool.name }}</span>
                </div>
                <p v-if="mcpTestResult && mcpTestResult.id === srv.id" class="text-xs mt-2" :class="mcpTestResult.success ? 'text-green-600' : 'text-red-600'">{{ mcpTestResult.message }}</p>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-600">
              <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Agregar servidor</h4>
              <div class="space-y-3">
                <div class="flex gap-3">
                  <div class="flex-1">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                    <input v-model="mcpForm.name" placeholder="weather-api" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div class="w-32">
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Transporte</label>
                    <select v-model="mcpForm.transport" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="stdio">STDIO</option>
                      <option value="sse">SSE</option>
                    </select>
                  </div>
                </div>
                <div v-if="mcpForm.transport === 'stdio'" class="space-y-3">
                  <div class="flex gap-3">
                    <div class="w-36">
                      <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Comando</label>
                      <input v-model="mcpForm.command" placeholder="npx" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div class="flex-1">
                      <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Args (coma separados)</label>
                      <input v-model="mcpForm.argsStr" placeholder="-y, @mcp/server" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Variables de entorno (JSON)</label>
                    <input v-model="mcpForm.envStr" placeholder='{"API_KEY": "abc"}' class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <div v-if="mcpForm.transport === 'sse'">
                  <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">URL del servidor</label>
                  <input v-model="mcpForm.url" placeholder="https://mcp-server.com/sse" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div class="flex items-center gap-3">
                  <button @click="addMcpServer" :disabled="mcpAdding || !mcpForm.name.trim()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                    {{ mcpAdding ? 'Conectando...' : 'Agregar' }}
                  </button>
                  <p v-if="mcpError" class="text-red-600 text-xs">{{ mcpError }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import api from '../lib/api'

const settingsStore = useSettingsStore()
const form = ref(null)
const saving = ref(false)
const saved = ref(false)
const activeSection = ref('bot')

const sections = [
  { key: 'bot', icon: '🤖', label: 'Bot' },
  { key: 'modules', icon: '📦', label: 'Modulos' },
  { key: 'ai', icon: '🧠', label: 'Inteligencia Artificial' },
  { key: 'whatsapp', icon: '📱', label: 'WhatsApp' },
  { key: 'mcp', icon: '🔌', label: 'MCP Servers' }
]

const allModules = [
  { key: 'products', icon: '📦', name: 'Productos / Servicios', desc: 'Catalogo de productos con precios' },
  { key: 'orders', icon: '🛒', name: 'Pedidos', desc: 'Recibe y gestiona pedidos desde WhatsApp' },
  { key: 'appointments', icon: '📅', name: 'Citas / Agenda', desc: 'Permite a clientes agendar citas' },
  { key: 'quotes', icon: '💰', name: 'Cotizaciones', desc: 'Genera cotizaciones automaticas' },
  { key: 'followups', icon: '💛', name: 'Fidelizacion', desc: 'Seguimiento automatico a clientes' },
  { key: 'image_generation', icon: '🎨', name: 'Imagenes IA', desc: 'Genera imagenes con inteligencia artificial' }
]

// Whitelist
const whitelist = ref([])
const newPhone = ref('')
const newLabel = ref('')
const addingPhone = ref(false)
const whitelistError = ref('')

// WhatsApp
const waConnecting = ref(false)
const waDisconnecting = ref(false)
const waStatusLabel = computed(() => {
  const map = { connected: 'Conectado', connecting: 'Conectando...', disconnected: 'Desconectado' }
  return map[settingsStore.whatsappStatus] || 'Desconectado'
})

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
  await settingsStore.fetchModules()
  await loadWhitelist()
  await loadMcpServers()
  try {
    const { data: s } = await api.get('/whatsapp/status')
    settingsStore.whatsappStatus = s.status || 'disconnected'
    const { data: q } = await api.get('/whatsapp/qr')
    if (q.qr) settingsStore.qrCode = q.qr
  } catch (e) { /* ignore */ }
})

watch(() => form.value?.whitelist_mode, (mode) => {
  if (mode === 'whitelist') loadWhitelist()
})

async function save() {
  saving.value = true; saved.value = false
  try {
    await settingsStore.updateSettings(form.value)
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e) { alert('Error guardando') }
  finally { saving.value = false }
}

async function toggleModule(key) {
  const current = !!settingsStore.modules?.[key]
  await settingsStore.toggleModule(key, !current)
}

async function connectWhatsApp() {
  waConnecting.value = true; settingsStore.waError = ''; settingsStore.qrCode = ''
  try { await api.post('/whatsapp/connect') } catch (e) { settingsStore.waError = e.response?.data?.error || 'Error' }
  finally { waConnecting.value = false }
}

async function disconnectWhatsApp() {
  if (!confirm('Desconectar WhatsApp?')) return
  waDisconnecting.value = true
  try { await api.post('/whatsapp/disconnect'); settingsStore.whatsappStatus = 'disconnected'; settingsStore.qrCode = '' }
  catch (e) { settingsStore.waError = e.response?.data?.error || 'Error' }
  finally { waDisconnecting.value = false }
}

async function loadWhitelist() {
  try { const { data } = await api.get('/settings/whitelist'); whitelist.value = data.whitelist } catch (e) {}
}

async function addToWhitelist() {
  if (!newPhone.value.trim()) return
  addingPhone.value = true; whitelistError.value = ''
  try {
    const { data } = await api.post('/settings/whitelist', { phone_number: newPhone.value.trim(), label: newLabel.value.trim() })
    whitelist.value.unshift(data.entry); newPhone.value = ''; newLabel.value = ''
  } catch (e) { whitelistError.value = e.response?.data?.error || 'Error' }
  finally { addingPhone.value = false }
}

async function removeFromWhitelist(id) {
  try { await api.delete(`/settings/whitelist/${id}`); whitelist.value = whitelist.value.filter(e => e.id !== id) } catch (e) { alert('Error') }
}

// MCP
const mcpServers = ref([])
const mcpForm = ref({ name: '', transport: 'stdio', command: '', argsStr: '', envStr: '', url: '' })
const mcpAdding = ref(false)
const mcpError = ref('')
const mcpTesting = ref(null)
const mcpTestResult = ref(null)

async function loadMcpServers() {
  try { const { data } = await api.get('/settings/mcp'); mcpServers.value = data.servers } catch (e) {}
}

async function addMcpServer() {
  if (!mcpForm.value.name.trim()) return
  mcpAdding.value = true; mcpError.value = ''
  const args = mcpForm.value.argsStr ? mcpForm.value.argsStr.split(',').map(a => a.trim()).filter(Boolean) : []
  let env_vars = {}
  if (mcpForm.value.envStr.trim()) {
    try { env_vars = JSON.parse(mcpForm.value.envStr) } catch (e) { mcpError.value = 'JSON invalido'; mcpAdding.value = false; return }
  }
  try {
    const { data } = await api.post('/settings/mcp', { name: mcpForm.value.name.trim(), transport: mcpForm.value.transport, command: mcpForm.value.command || '', args, url: mcpForm.value.url || '', env_vars })
    if (data.connectionError) mcpError.value = `Guardado pero: ${data.connectionError}`
    if (data.servers) mcpServers.value = data.servers; else await loadMcpServers()
    mcpForm.value = { name: '', transport: 'stdio', command: '', argsStr: '', envStr: '', url: '' }
  } catch (e) { mcpError.value = e.response?.data?.error || 'Error' }
  finally { mcpAdding.value = false }
}

async function removeMcpServer(id) {
  if (!confirm('Eliminar?')) return
  try { await api.delete(`/settings/mcp/${id}`); mcpServers.value = mcpServers.value.filter(s => s.id !== id) } catch (e) { alert('Error') }
}

async function testMcpServer(id) {
  mcpTesting.value = id; mcpTestResult.value = null
  try {
    const { data } = await api.post(`/settings/mcp/${id}/test`)
    mcpTestResult.value = { id, success: true, message: `OK! ${data.tools?.length || 0} herramienta(s)` }
    await loadMcpServers()
  } catch (e) { mcpTestResult.value = { id, success: false, message: e.response?.data?.error || 'Error' } }
  finally { mcpTesting.value = null }
}
</script>
