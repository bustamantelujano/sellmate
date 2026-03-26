<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-8 px-4">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-600 mb-3">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Configura tu SellMate</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Completa estos pasos para empezar a vender</p>
    </div>

    <!-- Progress Bar -->
    <div class="w-full max-w-2xl mb-8">
      <div class="flex items-center justify-between mb-2">
        <span v-for="(s, i) in steps" :key="i"
          class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors"
          :class="i < step ? 'bg-primary-600 text-white' : i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'">
          <svg v-if="i < step" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
          <span v-else>{{ i + 1 }}</span>
        </span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div class="bg-primary-600 h-1.5 rounded-full transition-all duration-500" :style="{ width: ((step) / (steps.length - 1) * 100) + '%' }"></div>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">{{ steps[step] }}</p>
    </div>

    <!-- Card -->
    <div class="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">

      <!-- Step 1: Tipo de Negocio -->
      <div v-if="step === 0">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Tipo de negocio</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Selecciona el tipo que mejor describe tu negocio. Esto configura los modulos recomendados.</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button v-for="bt in businessTypes" :key="bt.key" @click="form.businessType = bt.key"
            class="flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center hover:shadow-md"
            :class="form.businessType === bt.key
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
            <span class="text-3xl mb-2">{{ bt.icon }}</span>
            <span class="text-sm font-semibold text-gray-800 dark:text-white">{{ bt.name }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ bt.desc }}</span>
          </button>
        </div>
      </div>

      <!-- Step 2: Info del Negocio -->
      <div v-if="step === 1">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Informacion del negocio</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Estos datos ayudan al bot a responder preguntas sobre tu negocio.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del negocio</label>
            <input v-model="form.businessName" placeholder="Ej: La Barberia de Juan"
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripcion</label>
              <button @click="generateDescription" :disabled="generatingDesc || !form.businessName.trim()"
                class="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <svg v-if="generatingDesc" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                <span v-else>✨</span>
                {{ generatingDesc ? 'Generando...' : 'Generar con IA' }}
              </button>
            </div>
            <textarea v-model="form.businessDescription" rows="3" placeholder="Describe brevemente que ofrece tu negocio..."
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direccion</label>
              <input v-model="form.businessAddress" placeholder="Calle, numero, colonia"
                class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefono</label>
              <input v-model="form.businessPhone" placeholder="521234567890"
                class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horario de atencion</label>
            <input v-model="form.businessHours" placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <!-- Step 3: Modulos -->
      <div v-if="step === 2">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Modulos</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Estos modulos se activaran segun tu tipo de negocio. Puedes personalizar cuales quieres usar.</p>
        <div class="space-y-3">
          <div v-for="mod in allModules" :key="mod.key"
            class="flex items-center justify-between p-4 rounded-xl border transition-colors"
            :class="form.modules[mod.key]
              ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10'
              : 'border-gray-200 dark:border-gray-600'">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ mod.icon }}</span>
              <div>
                <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ mod.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ mod.desc }}</p>
              </div>
            </div>
            <button @click="form.modules[mod.key] = !form.modules[mod.key]"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              :class="form.modules[mod.key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="form.modules[mod.key] ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 4: Configuracion IA -->
      <div v-if="step === 3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Configuracion de IA</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Conecta un proveedor de IA para que el bot pueda responder a tus clientes.</p>

        <!-- Provider cards -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <button v-for="prov in providers" :key="prov.key" @click="form.aiProvider = prov.key"
            class="flex flex-col items-center p-4 rounded-xl border-2 transition-all text-center"
            :class="form.aiProvider === prov.key
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
            <span class="text-2xl mb-1">{{ prov.icon }}</span>
            <span class="text-sm font-semibold text-gray-800 dark:text-white">{{ prov.name }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ prov.desc }}</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
            <div class="relative">
              <input v-model="form.aiApiKey" :type="showApiKey ? 'text' : 'password'" placeholder="sk-..."
                class="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              <button @click="showApiKey = !showApiKey" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg v-if="!showApiKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
            <select v-model="form.aiModel"
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Seleccionar modelo...</option>
              <option v-for="m in modelSuggestions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div v-if="form.aiProvider === 'custom'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint personalizado</label>
            <input v-model="form.aiCustomEndpoint" placeholder="https://your-api.com/v1/chat/completions"
              class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
      </div>

      <!-- Step 5: WhatsApp -->
      <div v-if="step === 4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">Conectar WhatsApp</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Vincula tu numero de WhatsApp para que el bot pueda recibir y enviar mensajes.</p>

        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
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
            <button v-if="settingsStore.whatsappStatus !== 'connected'"
              @click="connectWhatsApp" :disabled="waConnecting"
              class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {{ waConnecting ? 'Conectando...' : 'Conectar' }}
            </button>
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

          <!-- Disconnected empty state -->
          <div v-else class="text-center py-8">
            <span class="text-4xl mb-3 block">📱</span>
            <p class="text-sm text-gray-500 dark:text-gray-400">Haz clic en "Conectar" para vincular tu WhatsApp</p>
          </div>

          <!-- Error message -->
          <div v-if="settingsStore.waError" class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-700 dark:text-red-300">{{ settingsStore.waError }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button v-if="step > 0" @click="step--"
          class="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          Atras
        </button>
        <div v-else></div>

        <div class="flex items-center gap-3">
          <button v-if="step === 4" @click="finishSetup" :disabled="finishing"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Saltar por ahora
          </button>
          <button v-if="step < steps.length - 1" @click="nextStep" :disabled="!canProceed"
            class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
            Siguiente
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <button v-else @click="finishSetup" :disabled="finishing"
            class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
            <svg v-if="finishing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            {{ finishing ? 'Finalizando...' : 'Finalizar configuracion' }}
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mt-4 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '../stores/settings'
import api from '../lib/api'

const router = useRouter()
const settingsStore = useSettingsStore()

const step = ref(0)
const error = ref('')
const finishing = ref(false)
const showApiKey = ref(false)
const waConnecting = ref(false)
const generatingDesc = ref(false)

const steps = [
  'Tipo de negocio',
  'Informacion del negocio',
  'Modulos',
  'Configuracion de IA',
  'Conectar WhatsApp'
]

const businessTypes = [
  { key: 'restaurant', icon: '🍽️', name: 'Restaurante', desc: 'Recibe pedidos y gestiona tu menu' },
  { key: 'barbershop', icon: '💈', name: 'Barberia', desc: 'Agenda citas y gestiona servicios' },
  { key: 'clinic', icon: '🏥', name: 'Consultorio', desc: 'Programa consultas y seguimiento' },
  { key: 'store', icon: '🛍️', name: 'Tienda', desc: 'Catalogo y cotizaciones' },
  { key: 'services', icon: '🔧', name: 'Servicios', desc: 'Agenda y cotiza servicios profesionales' },
  { key: 'other', icon: '📦', name: 'Otro', desc: 'Configura segun tus necesidades' }
]

const presetModules = {
  restaurant: { products: true, orders: true, appointments: false, followups: true, copilot: true, auto_reply: true },
  barbershop: { products: true, orders: false, appointments: true, followups: true, copilot: true, auto_reply: true },
  clinic: { products: false, orders: false, appointments: true, followups: true, copilot: true, auto_reply: true },
  store: { products: true, orders: true, appointments: false, followups: true, copilot: true, auto_reply: true },
  services: { products: true, orders: true, appointments: true, followups: true, copilot: true, auto_reply: true },
  other: { products: true, orders: false, appointments: false, followups: false, copilot: true, auto_reply: true }
}

const allModules = [
  { key: 'products', icon: '📦', name: 'Productos / Servicios', desc: 'Catalogo de productos con precios e imagenes', category: 'operations' },
  { key: 'orders', icon: '🛒', name: 'Pedidos', desc: 'Recibe y gestiona pedidos desde WhatsApp', category: 'sales' },
  { key: 'appointments', icon: '📅', name: 'Citas / Agenda', desc: 'Permite a clientes agendar citas', category: 'operations' },
  { key: 'followups', icon: '💛', name: 'Fidelizacion', desc: 'Seguimiento automatico a clientes', category: 'engagement' },
  { key: 'copilot', icon: '🤖', name: 'Copiloto IA', desc: 'Sugerencias de respuesta para agentes humanos', category: 'ai' },
  { key: 'auto_reply', icon: '⚡', name: 'Respuesta automatica', desc: 'El bot responde automaticamente a clientes', category: 'ai' }
]

const providers = [
  { key: 'openai', icon: '🟢', name: 'OpenAI', desc: 'GPT-4o, GPT-4o mini' },
  { key: 'anthropic', icon: '🟠', name: 'Anthropic', desc: 'Claude Sonnet, Haiku' },
  { key: 'custom', icon: '🔧', name: 'Custom', desc: 'API compatible con OpenAI' }
]

const form = reactive({
  businessType: '',
  businessName: '',
  businessDescription: '',
  businessAddress: '',
  businessPhone: '',
  businessHours: '',
  modules: {},
  aiProvider: 'openai',
  aiApiKey: '',
  aiModel: '',
  aiCustomEndpoint: ''
})

const modelSuggestions = computed(() => {
  if (form.aiProvider === 'openai') return ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
  if (form.aiProvider === 'anthropic') return ['claude-sonnet-4-6', 'claude-haiku-4-5-20250315', 'claude-3-5-sonnet-20241022']
  return ['gpt-4o-mini', 'gpt-4o']
})

const canProceed = computed(() => {
  if (step.value === 0) return !!form.businessType
  if (step.value === 1) return !!form.businessName.trim()
  return true
})

const waStatusLabel = computed(() => {
  const map = { connected: 'Conectado', connecting: 'Conectando...', disconnected: 'Desconectado' }
  return map[settingsStore.whatsappStatus] || 'Desconectado'
})

// When business type changes, update module presets
watch(() => form.businessType, (type) => {
  if (type && presetModules[type]) {
    form.modules = { ...presetModules[type] }
  }
})

onMounted(async () => {
  // Load existing business/settings data
  try {
    const { data } = await api.get('/business')
    if (data.business) {
      form.businessName = data.business.name || ''
      form.businessDescription = data.business.description || ''
      form.businessAddress = data.business.address || ''
      form.businessPhone = data.business.phone || ''
      form.businessHours = data.business.hours || ''
    }
  } catch (e) { /* ignore */ }

  try {
    await settingsStore.fetchSettings()
    if (settingsStore.settings) {
      form.aiProvider = settingsStore.settings.ai_provider || 'openai'
      form.aiModel = settingsStore.settings.ai_model || ''
      form.aiApiKey = settingsStore.settings.ai_api_key || ''
      form.aiCustomEndpoint = settingsStore.settings.ai_custom_endpoint || ''
    }
  } catch (e) { /* ignore */ }

  // Fetch WhatsApp status
  try {
    const { data: statusData } = await api.get('/whatsapp/status')
    settingsStore.whatsappStatus = statusData.status || 'disconnected'
    const { data: qrData } = await api.get('/whatsapp/qr')
    if (qrData.qr) settingsStore.qrCode = qrData.qr
  } catch (e) { /* ignore */ }
})

async function generateDescription() {
  if (!form.businessName.trim() || generatingDesc.value) return
  generatingDesc.value = true
  try {
    const bt = businessTypes.find(b => b.key === form.businessType)
    const { data } = await api.post('/business/generate-description', {
      businessName: form.businessName,
      businessType: bt?.name || form.businessType || 'negocio'
    })
    if (data.description) form.businessDescription = data.description
  } catch (e) {
    error.value = 'No se pudo generar la descripcion. Verifica tu configuracion de IA.'
    setTimeout(() => error.value = '', 4000)
  } finally {
    generatingDesc.value = false
  }
}

function nextStep() {
  if (canProceed.value && step.value < steps.length - 1) {
    step.value++
  }
}

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

async function finishSetup() {
  finishing.value = true
  error.value = ''
  try {
    // 1. Save business info
    await api.put('/business', {
      name: form.businessName,
      description: form.businessDescription,
      address: form.businessAddress,
      phone: form.businessPhone,
      hours: form.businessHours
    })

    // 2. Apply module preset based on business type
    await api.post('/modules/apply-preset', {
      business_type: form.businessType,
      modules: form.modules
    })

    // 3. Save AI config
    await api.put('/settings', {
      ai_provider: form.aiProvider,
      ai_api_key: form.aiApiKey,
      ai_model: form.aiModel,
      ai_custom_endpoint: form.aiCustomEndpoint
    })

    // 4. Mark setup as complete
    await api.post('/modules/complete-setup')

    // Refresh settings
    await settingsStore.fetchSettings()
    await settingsStore.fetchModules()

    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar la configuracion. Intenta de nuevo.'
  } finally {
    finishing.value = false
  }
}
</script>
