<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">Informacion del Negocio</h2>
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del negocio</label>
          <input v-model="form.name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripcion</label>
            <button v-if="auth.isAdmin" @click="generateDescription" :disabled="generatingDesc || !form.name?.trim()"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <svg v-if="generatingDesc" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              <span v-else>✨</span>
              {{ generatingDesc ? 'Generando...' : 'Generar con IA' }}
            </button>
          </div>
          <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direccion</label>
          <input v-model="form.address" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefono</label>
          <input v-model="form.phone" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horario de atencion</label>
          <input v-model="form.hours" placeholder="Ej: Lun-Vie 9am-6pm" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Politicas (envio, devoluciones, pagos)</label>
          <textarea v-model="form.policies" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Informacion adicional</label>
          <textarea v-model="form.extra_info" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
        </div>
        <button v-if="auth.isAdmin" @click="save" :disabled="saving"
          class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>
        <p v-if="saved" class="text-green-600 text-sm">Guardado correctamente</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../lib/api'

const auth = useAuthStore()
const form = ref({ name: '', description: '', address: '', phone: '', hours: '', policies: '', extra_info: '' })
const saving = ref(false)
const saved = ref(false)
const generatingDesc = ref(false)

onMounted(async () => {
  const { data } = await api.get('/business')
  if (data.business) form.value = { ...data.business }
})

async function generateDescription() {
  if (!form.value.name?.trim() || generatingDesc.value) return
  generatingDesc.value = true
  try {
    const { data } = await api.post('/business/generate-description', {
      businessName: form.value.name,
      businessType: 'negocio'
    })
    if (data.description) form.value.description = data.description
  } catch (e) {
    alert('No se pudo generar la descripcion. Verifica tu configuracion de IA.')
  } finally {
    generatingDesc.value = false
  }
}

async function save() {
  saving.value = true
  saved.value = false
  try {
    await api.put('/business', form.value)
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (err) {
    alert(err.response?.data?.error || 'Error')
  } finally {
    saving.value = false
  }
}
</script>
