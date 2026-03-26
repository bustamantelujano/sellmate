<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-3">
        <router-link to="/conversations" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </router-link>
        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
          {{ (conv?.contact_name || conv?.phone_number || '?').charAt(0).toUpperCase() }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ conv?.contact_name || conv?.phone_number }}</p>
            <!-- Topic badge -->
            <span v-if="conv?.topic" class="text-[10px] px-1.5 py-0.5 rounded font-medium" :class="topicBadgeClass(conv.topic)">
              {{ topicLabel(conv.topic) }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ conv?.phone_number }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="statusBadgeClass">
          {{ statusText }}
        </span>
        <button v-if="conv?.status === 'bot'" @click="takeOver"
          class="text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
          Tomar control
        </button>
        <button v-if="conv?.status === 'human'" @click="returnToBot"
          class="text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
          Devolver al bot
        </button>
        <button v-if="conv?.status !== 'closed'" @click="closeConv"
          class="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Cerrar conversacion">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        <!-- More menu -->
        <div class="relative">
          <button @click="showMenu = !showMenu" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/></svg>
          </button>
          <div v-if="showMenu" class="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            <button @click="clearChat" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Vaciar chat
            </button>
            <button @click="deleteConversation" class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              Eliminar conversacion
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
      <div v-for="msg in messages" :key="msg.id"
        class="flex" :class="msg.sender === 'customer' ? 'justify-start' : 'justify-end'">
        <div class="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm"
          :class="bubbleClass(msg.sender)">
          <p v-if="msg.sender !== 'customer'" class="text-xs font-medium mb-0.5 opacity-70 flex items-center gap-1">
            <svg v-if="msg.sender === 'bot'" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            {{ msg.sender_name }}
          </p>
          <img v-if="msg.image_data" :src="msg.image_data" alt="Imagen enviada"
            class="max-w-full rounded-lg mb-2 cursor-pointer" style="max-height: 300px"
            @click="openImageFullscreen(msg.image_data)" />
          <p v-if="msg.content && msg.content !== '[Imagen]'" class="whitespace-pre-wrap">{{ msg.content }}</p>
          <p class="text-[10px] mt-1 opacity-50 text-right">{{ formatTime(msg.timestamp) }}</p>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div v-if="conv?.status === 'human'" class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 shrink-0">
      <!-- Copilot suggestion -->
      <div v-if="copilotSuggestion" class="mb-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Sugerencia del Copilot
          </span>
          <button @click="copilotSuggestion = ''" class="text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 p-0.5 rounded">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <p class="text-sm text-purple-900 dark:text-purple-200">{{ copilotSuggestion }}</p>
        <button @click="useSuggestion" class="mt-2 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg font-medium transition-colors">
          Usar sugerencia
        </button>
      </div>

      <div class="flex gap-2">
        <button @click="getCopilotSuggestion" :disabled="loadingCopilot"
          class="shrink-0 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          title="Copilot: sugerir respuesta con IA">
          <svg v-if="!loadingCopilot" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
        </button>
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..."
          class="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        <button @click="sendMessage" :disabled="!newMessage.trim()"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          Enviar
        </button>
      </div>
    </div>

    <!-- Bot handling notice -->
    <div v-else-if="conv?.status === 'bot'" class="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 p-3 text-center text-sm text-blue-700 dark:text-blue-300 shrink-0 flex items-center justify-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
      El bot esta atendiendo esta conversacion.
      <button @click="takeOver" class="underline font-medium">Tomar control</button>
    </div>

    <!-- Closed notice -->
    <div v-else-if="conv?.status === 'closed'" class="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-gray-500 dark:text-gray-400 shrink-0">
      Esta conversacion esta cerrada.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConversationsStore } from '../stores/conversations'
import { useSocket } from '../composables/useSocket'
import api from '../lib/api'

const route = useRoute()
const router = useRouter()
const convStore = useConversationsStore()
const { emit } = useSocket()

const messagesContainer = ref(null)
const newMessage = ref('')
const copilotSuggestion = ref('')
const loadingCopilot = ref(false)

const conv = computed(() => convStore.currentConversation)
const messages = computed(() => convStore.currentMessages)

// Topic badge
const topicLabels = {
  cotizacion: 'Cotizacion', informacion_productos: 'Productos', consulta_horario: 'Horario',
  consulta_sucursales: 'Sucursales', soporte: 'Soporte', compra: 'Compra', saludo: 'Saludo', otro: 'General'
}
const topicColors = {
  cotizacion: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  informacion_productos: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  consulta_horario: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  consulta_sucursales: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  soporte: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  compra: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  saludo: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  otro: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
}
function topicLabel(topic) { return topicLabels[topic] || topic }
function topicBadgeClass(topic) { return topicColors[topic] || topicColors.otro }

const statusBadgeClass = computed(() => ({
  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': conv.value?.status === 'bot',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300': conv.value?.status === 'human',
  'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300': conv.value?.status === 'closed'
}))

const statusText = computed(() => {
  return { bot: 'Bot', human: 'Humano', closed: 'Cerrada' }[conv.value?.status] || ''
})

onMounted(async () => {
  await convStore.fetchConversation(route.params.id)
  scrollToBottom()
})

watch(messages, () => nextTick(scrollToBottom), { deep: true })

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function bubbleClass(sender) {
  return {
    'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600': sender === 'customer',
    'bg-blue-500 text-white': sender === 'bot',
    'bg-primary-600 text-white': sender === 'agent'
  }
}

function isPhoneNumber(num) {
  if (!num) return false
  return /^\+?\d{10,15}$/.test(num)
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts + 'Z')
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function sendMessage() {
  if (!newMessage.value.trim()) return
  emit('message:send', { conversation_id: conv.value.id, content: newMessage.value.trim() })
  newMessage.value = ''
}

const showMenu = ref(false)

async function takeOver() { await convStore.changeStatus(conv.value.id, 'human') }
async function returnToBot() { await convStore.changeStatus(conv.value.id, 'bot') }
async function closeConv() {
  if (confirm('Cerrar esta conversacion?')) await convStore.changeStatus(conv.value.id, 'closed')
}

async function clearChat() {
  showMenu.value = false
  if (!confirm('Vaciar todos los mensajes de este chat? La conversacion se mantiene.')) return
  try {
    await api.delete(`/conversations/${conv.value.id}/messages`)
    convStore.currentMessages = []
  } catch (e) { alert('Error al vaciar chat') }
}

async function deleteConversation() {
  showMenu.value = false
  if (!confirm('Eliminar esta conversacion y todos sus mensajes? Esta accion no se puede deshacer.')) return
  try {
    await api.delete(`/conversations/${conv.value.id}`)
    router.push('/conversations')
  } catch (e) { alert('Error al eliminar') }
}

async function getCopilotSuggestion() {
  loadingCopilot.value = true; copilotSuggestion.value = ''
  try {
    const { data } = await api.post('/copilot/suggest', { conversation_id: conv.value.id })
    copilotSuggestion.value = data.suggestion
  } catch (err) { copilotSuggestion.value = 'Error obteniendo sugerencia' }
  finally { loadingCopilot.value = false }
}

function useSuggestion() { newMessage.value = copilotSuggestion.value; copilotSuggestion.value = '' }

function openImageFullscreen(dataUri) {
  const win = window.open()
  if (win) {
    win.document.write(`<html><head><title>Imagen</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000}</style></head><body><img src="${dataUri}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`)
  }
}
</script>
