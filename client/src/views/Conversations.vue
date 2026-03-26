<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Conversaciones</h2>

    <!-- Filters -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value"
        class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors border"
        :class="activeFilter === f.value
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'">
        {{ f.label }}
      </button>
    </div>

    <!-- Conversations List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div v-if="convStore.conversations.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-sm">No hay conversaciones aun</p>
      </div>
      <div v-else>
        <router-link v-for="conv in convStore.conversations" :key="conv.id"
          :to="`/conversations/${conv.id}`"
          class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm">
              {{ (conv.contact_name || conv.phone_number).charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ conv.contact_name || conv.phone_number }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ conv.phone_number }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Topic badge -->
            <span v-if="conv.topic" class="text-xs px-2 py-0.5 rounded-full font-medium" :class="topicBadgeClass(conv.topic)">
              {{ topicLabel(conv.topic) }}
            </span>
            <!-- Status badge -->
            <span class="text-xs px-2 py-1 rounded-full font-medium" :class="statusBadge(conv.status)">
              {{ statusText(conv.status) }}
            </span>
            <span class="text-xs text-gray-400 dark:text-gray-500 ml-1 min-w-[40px] text-right">{{ formatTime(conv.last_message_at) }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useConversationsStore } from '../stores/conversations'

const convStore = useConversationsStore()
const activeFilter = ref('')

const filters = [
  { label: 'Todas', value: '' },
  { label: 'Bot', value: 'bot' },
  { label: 'Humano', value: 'human' },
  { label: 'Cerradas', value: 'closed' }
]

// Topic labels and colors
const topicLabels = {
  cotizacion: 'Cotizacion',
  informacion_productos: 'Productos',
  consulta_horario: 'Horario',
  consulta_sucursales: 'Sucursales',
  soporte: 'Soporte',
  compra: 'Compra',
  saludo: 'Saludo',
  otro: 'General'
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

function topicLabel(topic) {
  return topicLabels[topic] || topic
}

function topicBadgeClass(topic) {
  return topicColors[topic] || topicColors.otro
}

function statusText(status) {
  return { bot: 'Bot', human: 'Humano', closed: 'Cerrada' }[status] || status
}

onMounted(() => convStore.fetchConversations())

watch(activeFilter, (val) => convStore.fetchConversations(val))

function statusBadge(status) {
  return {
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': status === 'bot',
    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300': status === 'human',
    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300': status === 'closed'
  }
}

function isPhoneNumber(num) {
  if (!num) return false
  // Real phone numbers start with country code (1-3 digits) and are 10-15 chars
  // LIDs are WhatsApp internal IDs that don't follow phone format
  return /^\+?\d{10,15}$/.test(num)
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts + 'Z')
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Ahora'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return d.toLocaleDateString('es')
}
</script>
