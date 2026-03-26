<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Clientes</h2>
      <div class="flex items-center gap-3">
        <div class="relative">
          <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="searchQuery" @input="debouncedSearch" type="text" placeholder="Buscar cliente..."
            class="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 w-64" />
        </div>
        <button @click="openNewModal"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo cliente
        </button>
      </div>
    </div>

    <!-- Client Form Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">{{ editingClient ? 'Editar' : 'Nuevo' }} Cliente</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Telefono *</label>
            <input v-model="form.phone_number" placeholder="Ej: +521234567890" :disabled="!!editingClient"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
            <input v-model="form.name" placeholder="Nombre del cliente"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <input v-model="form.email" type="email" placeholder="correo@ejemplo.com"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Etiquetas</label>
            <input v-model="form.tags" placeholder="VIP, frecuente, nuevo (separadas por coma)"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notas</label>
            <textarea v-model="form.notes" placeholder="Notas sobre el cliente..." rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
          </div>
        </div>
        <p v-if="formError" class="text-red-500 text-xs mt-2">{{ formError }}</p>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="closeModal" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancelar</button>
          <button @click="saveClient" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {{ editingClient ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && clients.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <p class="text-sm">{{ searchQuery ? 'No se encontraron clientes.' : 'No hay clientes aun. Agrega el primero.' }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16 text-gray-400 dark:text-gray-500">
      <p class="text-sm">Cargando clientes...</p>
    </div>

    <!-- Clients Table -->
    <div v-if="!loading && clients.length > 0">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 text-left">
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Telefono</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Etiquetas</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ultimo contacto</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Conversaciones</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="client in paginatedClients" :key="client.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-bold flex-shrink-0">
                      {{ (client.name || client.phone_number).charAt(0).toUpperCase() }}
                    </div>
                    <p class="font-medium text-gray-800 dark:text-white">{{ client.name || client.phone_number }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ client.phone_number }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ client.email || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="tag in parseTags(client.tags)" :key="tag"
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="tagColor(tag)">
                      {{ tag }}
                    </span>
                    <span v-if="!client.tags" class="text-gray-400 dark:text-gray-500">—</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                  {{ client.last_contact_at ? formatDate(client.last_contact_at) : '—' }}
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {{ client.conversation_count || 0 }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-1.5">
                    <button @click="editClient(client)" class="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors" title="Editar">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="deleteClient(client.id)" class="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors" title="Eliminar">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }}–{{ Math.min(currentPage * itemsPerPage, clients.length) }} de {{ clients.length }}
        </p>
        <div class="flex items-center gap-1">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300">
            Anterior
          </button>
          <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
            class="w-8 h-8 text-sm rounded-lg transition-colors"
            :class="page === currentPage
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'">
            {{ page }}
          </button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../lib/api'

const clients = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingClient = ref(null)
const formError = ref('')
const searchQuery = ref('')
const form = ref({ phone_number: '', name: '', email: '', notes: '', tags: '' })

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(clients.value.length / itemsPerPage))

const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return clients.value.slice(start, start + itemsPerPage)
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

watch(() => clients.value.length, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})

// Debounced search
let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchClients()
  }, 300)
}

async function fetchClients() {
  loading.value = true
  try {
    const params = searchQuery.value ? { search: searchQuery.value } : {}
    const { data } = await api.get('/clients', { params })
    clients.value = data.clients
    currentPage.value = 1
  } catch (err) {
    console.error('Error fetching clients:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClients()
})

function openNewModal() {
  editingClient.value = null
  form.value = { phone_number: '', name: '', email: '', notes: '', tags: '' }
  formError.value = ''
  showModal.value = true
}

function editClient(client) {
  editingClient.value = client
  form.value = {
    phone_number: client.phone_number,
    name: client.name || '',
    email: client.email || '',
    notes: client.notes || '',
    tags: client.tags || ''
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingClient.value = null
  formError.value = ''
  form.value = { phone_number: '', name: '', email: '', notes: '', tags: '' }
}

async function saveClient() {
  formError.value = ''
  try {
    if (editingClient.value) {
      const { data } = await api.put(`/clients/${editingClient.value.id}`, form.value)
      const idx = clients.value.findIndex(c => c.id === editingClient.value.id)
      if (idx !== -1) clients.value[idx] = { ...clients.value[idx], ...data.client }
    } else {
      if (!form.value.phone_number) {
        formError.value = 'El numero de telefono es requerido'
        return
      }
      const { data } = await api.post('/clients', form.value)
      clients.value.unshift(data.client)
    }
    closeModal()
  } catch (err) {
    formError.value = err.response?.data?.error || 'Error al guardar'
  }
}

async function deleteClient(id) {
  if (!confirm('¿Eliminar este cliente?')) return
  try {
    await api.delete(`/clients/${id}`)
    clients.value = clients.value.filter(c => c.id !== id)
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar')
  }
}

function parseTags(tags) {
  if (!tags) return []
  return tags.split(',').map(t => t.trim()).filter(Boolean)
}

const tagColors = [
  'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
]

function tagColor(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return tagColors[Math.abs(hash) % tagColors.length]
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
