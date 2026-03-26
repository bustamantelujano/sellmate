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
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" :d="sectionIcons[sec.key]" />
            </svg>
            {{ sec.label }}
          </button>
        </div>
      </nav>

      <!-- Mobile section selector -->
      <select v-model="activeSection" class="md:hidden w-full mb-4 px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm">
        <option v-for="sec in sections" :key="sec.key" :value="sec.key">{{ sec.label }}</option>
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

              <!-- Bot always on -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                <div class="pr-4">
                  <p class="text-sm font-medium text-gray-800 dark:text-white">Bot activo en modo offline</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">El bot sigue respondiendo aunque el negocio este marcado como offline. Si se desactiva, se envia el mensaje de despedida.</p>
                </div>
                <button @click="form.bot_always_on = form.bot_always_on ? 0 : 1"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
                  :class="form.bot_always_on ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'">
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="form.bot_always_on ? 'translate-x-6' : 'translate-x-1'"></span>
                </button>
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
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-base font-semibold text-gray-800 dark:text-white">Modulos</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Activa o desactiva funcionalidades segun tu negocio</p>
              </div>
              <router-link to="/setup" class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1">
                ✨ Asistente
              </router-link>
            </div>

            <!-- Active count -->
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">
              {{ allModules.filter(m => settingsStore.modules?.[m.key]).length }} de {{ allModules.length }} modulos activos
            </p>

            <div class="space-y-2">
              <div v-for="mod in allModules" :key="mod.key"
                class="rounded-xl border transition-colors overflow-hidden"
                :class="settingsStore.modules?.[mod.key]
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50/30 dark:bg-primary-900/10'
                  : 'border-gray-200 dark:border-gray-600'">

                <!-- Header row (always visible) -->
                <div class="flex items-center justify-between p-3.5 cursor-pointer" @click="expandedModule = expandedModule === mod.key ? null : mod.key">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <span class="text-xl flex-shrink-0">{{ mod.icon }}</span>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-medium text-gray-800 dark:text-white">{{ mod.name }}</p>
                        <span v-if="settingsStore.modules?.[mod.key]" class="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium">Activo</span>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ mod.desc }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 flex-shrink-0 ml-3">
                    <button @click.stop="toggleModule(mod.key)"
                      class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                      :class="settingsStore.modules?.[mod.key] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'">
                      <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        :class="settingsStore.modules?.[mod.key] ? 'translate-x-6' : 'translate-x-1'"></span>
                    </button>
                    <svg class="w-4 h-4 text-gray-400 transition-transform" :class="expandedModule === mod.key ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </div>

                <!-- Expanded details -->
                <div v-if="expandedModule === mod.key" class="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div class="pt-3 pl-9">
                    <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">{{ mod.details }}</p>
                    <ul class="space-y-1.5">
                      <li v-for="feat in mod.features" :key="feat" class="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <svg class="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        {{ feat }}
                      </li>
                    </ul>

                    <!-- Order notification config -->
                    <div v-if="mod.key === 'orders' && settingsStore.modules?.orders" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notificaciones de pedidos</h4>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Numeros de WhatsApp que recibiran una notificacion cuando llegue un nuevo pedido.</p>
                      <div class="flex gap-2 mb-3">
                        <input v-model="orderNotifyInput" placeholder="521234567890"
                          class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                          @keyup.enter="addOrderNotifyNumber" />
                        <button @click="addOrderNotifyNumber" :disabled="!orderNotifyInput.trim()"
                          class="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                          +
                        </button>
                      </div>
                      <div v-if="orderNotifyNumbers.length === 0" class="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
                        Sin numeros configurados
                      </div>
                      <div v-else class="space-y-1 mb-3">
                        <div v-for="(num, idx) in orderNotifyNumbers" :key="idx"
                          class="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
                          <span class="text-sm font-mono text-gray-800 dark:text-white">{{ num }}</span>
                          <button @click="removeOrderNotifyNumber(idx)" class="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                        </div>
                      </div>
                      <!-- Customer status notifications -->
                      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">Notificar al cliente por WhatsApp</h4>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Elige en que pasos se le envia un mensaje automatico al cliente sobre su pedido.</p>
                      <div class="space-y-2 mb-4">
                        <label v-for="step in customerNotifySteps" :key="step.key" class="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <input type="checkbox" v-model="customerNotifications[step.key]"
                            class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                          <div class="flex-1">
                            <span class="text-sm font-medium text-gray-800 dark:text-white">{{ step.label }}</span>
                            <p class="text-xs text-gray-500 dark:text-gray-400">{{ step.preview }}</p>
                          </div>
                        </label>
                      </div>

                      <button @click="saveOrderNotifyConfig" :disabled="savingOrderConfig"
                        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                        {{ savingOrderConfig ? 'Guardando...' : 'Guardar configuracion' }}
                      </button>
                      <span v-if="savedOrderConfig" class="ml-2 text-green-600 text-sm">Guardado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== COLABORADORES ===== -->
        <template v-if="activeSection === 'team'">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-semibold text-gray-800 dark:text-white">Colaboradores</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Personas que pueden atender conversaciones desde la plataforma</p>
              </div>
              <button @click="showTeamForm = true" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                + Nuevo
              </button>
            </div>

            <div v-if="teamMembers.length === 0" class="text-center py-10 text-gray-400 dark:text-gray-500">
              <span class="text-3xl block mb-2">👥</span>
              <p class="text-sm">No hay colaboradores aun</p>
              <p class="text-xs mt-1">Agrega personas para que puedan atender conversaciones</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="member in teamMembers" :key="member.id"
                class="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-600">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                    {{ member.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800 dark:text-white">{{ member.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ member.email }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="member.active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'">
                    {{ member.active ? 'Activo' : 'Inactivo' }}
                  </span>
                  <button v-if="member.active" @click="deactivateMember(member.id)" class="text-xs text-red-400 hover:text-red-600">Desactivar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- New team member modal -->
          <div v-if="showTeamForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-1">Nuevo colaborador</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Esta persona podra iniciar sesion y atender conversaciones manualmente.</p>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nombre</label>
                  <input v-model="teamForm.name" placeholder="Ej: Maria Lopez" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <input v-model="teamForm.email" type="email" placeholder="maria@ejemplo.com" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contrasena</label>
                  <input v-model="teamForm.password" type="password" placeholder="Minimo 6 caracteres" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <p v-if="teamFormError" class="text-red-500 text-sm mt-2">{{ teamFormError }}</p>
              <div class="flex justify-end gap-2 mt-5">
                <button @click="showTeamForm = false; teamFormError = ''" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancelar</button>
                <button @click="createMember" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Crear colaborador</button>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== MI NEGOCIO ===== -->
        <template v-if="activeSection === 'business'">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-base font-semibold text-gray-800 dark:text-white mb-4">Ajustes de mi negocio</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del negocio</label>
                <input v-model="businessForm.name" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripcion</label>
                  <button @click="generateDescription" :disabled="generatingDesc || !businessForm.name?.trim()"
                    class="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <svg v-if="generatingDesc" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    <span v-else>✨</span>
                    {{ generatingDesc ? 'Generando...' : 'Generar con IA' }}
                  </button>
                </div>
                <textarea v-model="businessForm.description" rows="3" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direccion</label>
                  <input v-model="businessForm.address" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefono</label>
                  <input v-model="businessForm.phone" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horario de atencion</label>
                <input v-model="businessForm.hours" placeholder="Ej: Lun-Vie 9am-6pm" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Politicas (envio, devoluciones, pagos)</label>
                  <button @click="generateField('policies')" :disabled="generatingPolicies || !businessForm.name?.trim()"
                    class="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <svg v-if="generatingPolicies" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    <span v-else>✨</span>
                    {{ generatingPolicies ? 'Generando...' : 'Generar con IA' }}
                  </button>
                </div>
                <textarea v-model="businessForm.policies" rows="2" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              </div>
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Informacion adicional</label>
                  <button @click="generateField('extra_info')" :disabled="generatingExtraInfo || !businessForm.name?.trim()"
                    class="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <svg v-if="generatingExtraInfo" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    <span v-else>✨</span>
                    {{ generatingExtraInfo ? 'Generando...' : 'Generar con IA' }}
                  </button>
                </div>
                <textarea v-model="businessForm.extra_info" rows="2" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
              </div>
              <div class="flex items-center gap-3 pt-2">
                <button @click="saveBusiness" :disabled="savingBusiness" class="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {{ savingBusiness ? 'Guardando...' : 'Guardar' }}
                </button>
                <p v-if="savedBusiness" class="text-green-600 text-sm">Guardado</p>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== WHATSAPP ===== -->
        <template v-if="activeSection === 'whatsapp'">
          <!-- Status Card -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <!-- Header with gradient -->
            <div class="px-6 py-4" :class="settingsStore.whatsappStatus === 'connected' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700'">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.214l-.252-.149-2.868.852.852-2.868-.149-.252A8 8 0 1112 20z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-white font-semibold text-sm">WhatsApp Business</h3>
                    <p class="text-white/80 text-xs">Canal principal de mensajeria</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" :class="{
                    'bg-white/20 text-white': settingsStore.whatsappStatus === 'connected',
                    'bg-yellow-400/20 text-yellow-100': settingsStore.whatsappStatus === 'connecting',
                    'bg-white/10 text-white/70': settingsStore.whatsappStatus === 'disconnected'
                  }">
                    <span class="relative flex h-2 w-2">
                      <span v-if="settingsStore.whatsappStatus === 'connected'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2" :class="{
                        'bg-white': settingsStore.whatsappStatus === 'connected',
                        'bg-yellow-300': settingsStore.whatsappStatus === 'connecting',
                        'bg-white/50': settingsStore.whatsappStatus === 'disconnected'
                      }"></span>
                    </span>
                    {{ waStatusLabel }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="p-6">
              <!-- Connected state -->
              <div v-if="settingsStore.whatsappStatus === 'connected'" class="text-center py-6">
                <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <p class="text-sm font-medium text-gray-800 dark:text-white mb-1">Conectado y funcionando</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-5">Tu bot esta recibiendo y respondiendo mensajes</p>
                <button @click="disconnectWhatsApp" :disabled="waDisconnecting"
                  class="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">
                  {{ waDisconnecting ? 'Desconectando...' : 'Desconectar WhatsApp' }}
                </button>
              </div>

              <!-- QR Code -->
              <div v-else-if="settingsStore.qrCode" class="text-center py-4">
                <p class="text-sm font-medium text-gray-800 dark:text-white mb-1">Escanea el codigo QR</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Abre WhatsApp en tu telefono → Dispositivos vinculados → Vincular dispositivo</p>
                <div class="inline-block p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <img :src="settingsStore.qrCode" alt="QR Code" class="w-52 h-52" />
                </div>
              </div>

              <!-- Loading QR -->
              <div v-else-if="settingsStore.whatsappStatus === 'connecting'" class="text-center py-8">
                <svg class="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p class="text-sm text-gray-600 dark:text-gray-300 font-medium">Preparando conexion...</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Generando codigo QR</p>
              </div>

              <!-- Disconnected -->
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 9.9a9 9 0 01-4.95-4.95m2.122-2.122a5 5 0 017.07 0"/>
                  </svg>
                </div>
                <p class="text-sm font-medium text-gray-800 dark:text-white mb-1">WhatsApp no conectado</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-5">Vincula tu numero de WhatsApp para que el bot pueda enviar y recibir mensajes</p>
                <button @click="connectWhatsApp" :disabled="waConnecting"
                  class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                  <svg v-if="waConnecting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                  </svg>
                  {{ waConnecting ? 'Conectando...' : 'Conectar WhatsApp' }}
                </button>
              </div>

              <!-- Error -->
              <div v-if="settingsStore.waError" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                <svg class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-red-700 dark:text-red-300">{{ settingsStore.waError }}</p>
              </div>
            </div>
          </div>
        </template>

        <!-- ===== PROVEEDOR DE IA ===== -->
        <template v-if="activeSection === 'ai'">
          <!-- 1. API Keys -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-semibold text-gray-800 dark:text-white">Llaves de API</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Una llave por proveedor. Se usan para autenticar los modelos.</p>
              </div>
              <button @click="openAddKeyModal()" class="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Agregar
              </button>
            </div>
            <div v-if="aiKeysLoading" class="flex items-center justify-center py-8">
              <svg class="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            </div>
            <div v-else-if="aiKeys.length === 0" class="text-center py-8">
              <p class="text-sm text-gray-400 dark:text-gray-500">No tienes llaves. Agrega una para empezar.</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="akey in aiKeys" :key="akey.id" class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" :class="aiProviderBg(akey.provider)">
                  <svg v-if="akey.provider === 'openai'" class="w-4 h-4 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>
                  <svg v-else-if="akey.provider === 'anthropic'" class="w-4 h-4 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>
                  <svg v-else-if="akey.provider === 'gemini'" class="w-4 h-4" viewBox="0 0 24 24"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" fill="url(#gl)"/><defs><linearGradient id="gl" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#4285F4"/><stop offset=".5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>
                  <svg v-else-if="akey.provider === 'deepseek'" class="w-4 h-4" viewBox="0 0 512 509.64" fill="#4D6BFE"><path d="M440.898 139.167c-4.001-1.961-5.723 1.776-8.062 3.673-.801.612-1.479 1.407-2.154 2.141-5.848 6.246-12.681 10.349-21.607 9.859-13.048-.734-24.192 3.368-34.04 13.348-2.093-12.307-9.048-19.658-19.635-24.37-5.54-2.449-11.141-4.9-15.02-10.227-2.708-3.795-3.447-8.021-4.801-12.185-.861-2.509-1.725-5.082-4.618-5.512-3.139-.49-4.372 2.142-5.601 4.349-4.925 9.002-6.833 18.921-6.647 28.962.432 22.597 9.972 40.597 28.932 53.397 2.154 1.47 2.707 2.939 2.032 5.082-1.293 4.41-2.832 8.695-4.186 13.105-.862 2.817-2.157 3.429-5.172 2.205-10.402-4.346-19.391-10.778-27.332-18.553-13.481-13.044-25.668-27.434-40.873-38.702a177.614 177.614 0 00-10.834-7.409c-15.512-15.063 2.032-27.434 6.094-28.902 4.247-1.532 1.478-6.797-12.251-6.736-13.727.061-26.285 4.653-42.288 10.777-2.34.92-4.801 1.593-7.326 2.142-14.527-2.756-29.608-3.368-45.367-1.593-29.671 3.305-53.368 17.329-70.788 41.272-20.928 28.785-25.854 61.482-19.821 95.59 6.34 35.943 24.683 65.704 52.876 88.974 29.239 24.123 62.911 35.943 101.32 33.677 23.329-1.346 49.307-4.468 78.607-29.27 7.387 3.673 15.142 5.144 28.008 6.246 9.911.92 19.452-.49 26.839-2.019 11.573-2.449 10.773-13.166 6.586-15.124-33.915-15.797-26.47-9.368-33.24-14.573 17.235-20.39 43.213-41.577 53.369-110.222.8-5.448.121-8.877 0-13.287-.061-2.692.553-3.734 3.632-4.041 8.494-.981 16.742-3.305 24.314-7.471 21.975-12.002 30.84-31.719 32.933-55.355.307-3.612-.061-7.348-3.879-9.245v-.003zM249.4 351.89c-32.872-25.838-48.814-34.352-55.4-33.984-6.155.368-5.048 7.41-3.694 12.002 1.415 4.532 3.264 7.654 5.848 11.634 1.785 2.634 3.017 6.551-1.784 9.493-10.587 6.55-28.993-2.205-29.856-2.635-21.421-12.614-39.334-29.269-51.954-52.047-12.187-21.924-19.267-45.435-20.435-70.542-.308-6.061 1.478-8.207 7.509-9.307 7.94-1.471 16.127-1.778 24.068-.615 33.547 4.9 62.108 19.902 86.054 43.66 13.666 13.531 24.007 29.699 34.658 45.496 11.326 16.778 23.514 32.761 39.026 45.865 5.479 4.592 9.848 8.083 14.035 10.656-12.62 1.407-33.673 1.714-48.075-9.676zm15.899-102.519c.521-2.111 2.421-3.658 4.722-3.658a4.74 4.74 0 011.661.305c.678.246 1.293.614 1.786 1.163.861.859 1.354 2.083 1.354 3.368 0 2.695-2.154 4.837-4.862 4.837a4.748 4.748 0 01-4.738-4.034 5.01 5.01 0 01.077-1.981zm47.208 26.915c-2.606.996-5.2 1.778-7.707 1.88-4.679.244-9.787-1.654-12.556-3.981-4.308-3.612-7.386-5.631-8.679-11.941-.554-2.695-.247-6.858.246-9.246 1.108-5.144-.124-8.451-3.754-11.451-2.954-2.449-6.711-3.122-10.834-3.122-1.539 0-2.954-.673-4.001-1.224-1.724-.856-3.139-3-1.785-5.634.432-.856 2.525-2.939 3.018-3.305 5.6-3.185 12.065-2.144 18.034.244 5.54 2.266 9.727 6.429 15.759 12.307 6.155 7.102 7.263 9.063 10.773 14.39 2.771 4.163 5.294 8.451 7.018 13.348.877 2.561.071 4.74-2.341 6.277-.981.625-2.109 1.044-3.191 1.458z"/></svg>
                  <svg v-else class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ akey.label }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 font-mono">{{ akey.api_key_masked }}</p>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500 capitalize">{{ akey.provider }}</span>
                <button @click="aiDeleteTarget = akey; showAiDeleteModal = true" title="Eliminar" class="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 2. Modelos favoritos -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-semibold text-gray-800 dark:text-white">Modelos</h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Agrega modelos y alterna entre ellos. El activo es el que usa el bot.</p>
              </div>
              <button @click="openAddModelModal()" :disabled="aiKeys.length === 0"
                class="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Agregar
              </button>
            </div>
            <div v-if="aiKeys.length === 0" class="text-center py-6">
              <p class="text-sm text-gray-400 dark:text-gray-500">Primero agrega una llave de API arriba</p>
            </div>
            <div v-else-if="aiModels.length === 0" class="text-center py-6">
              <p class="text-sm text-gray-400 dark:text-gray-500">No tienes modelos configurados</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="m in aiModels" :key="m.id"
                class="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                :class="m.is_active ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
                @click="!m.is_active && activateAiModel(m.id)">
                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" :class="m.is_active ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'">
                  <svg v-if="m.is_active" class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span v-else class="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-500"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 dark:text-white">{{ m.label || m.model }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    <span class="capitalize">{{ m.provider }}</span> · <span class="font-mono">{{ m.model }}</span>
                  </p>
                </div>
                <span v-if="m.is_active" class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">Activo</span>
                <button @click.stop="aiModelDeleteTarget = m; showAiModelDeleteModal = true" title="Eliminar" class="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <p v-if="aiTestMsg" class="mt-3 text-sm" :class="aiTestSuccess ? 'text-green-600' : 'text-red-600'">{{ aiTestMsg }}</p>
          </div>

          <!-- 3. Consumo -->
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-base font-semibold text-gray-800 dark:text-white">Consumo este mes</h3>
              <router-link to="/ai-usage" class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">Ver detalle</router-link>
            </div>
            <div v-if="aiUsageLoading" class="flex items-center justify-center py-6">
              <svg class="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            </div>
            <div v-else-if="aiUsage" class="grid grid-cols-3 gap-2">
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                <p class="text-lg font-bold text-gray-800 dark:text-white">{{ (aiUsage.total_requests || 0).toLocaleString() }}</p>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">Requests</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                <p class="text-lg font-bold text-gray-800 dark:text-white">{{ (aiUsage.total_tokens || 0).toLocaleString() }}</p>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">Tokens</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2.5 text-center">
                <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">${{ Number(aiUsage.total_cost || 0).toFixed(2) }}</p>
                <p class="text-[10px] text-gray-400 dark:text-gray-500">Costo</p>
              </div>
            </div>
            <div v-else class="text-center py-6">
              <p class="text-sm text-gray-400 dark:text-gray-500">Sin datos de consumo aun</p>
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

    <!-- Add AI key modal (simplified - no model) -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showAiKeyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showAiKeyModal = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Agregar llave de API</h3>
              <button @click="showAiKeyModal = false" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proveedor</label>
              <div class="grid grid-cols-5 gap-2">
                <button @click="aiKeyForm.provider = 'openai'" class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all" :class="aiKeyForm.provider === 'openai' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
                  <svg class="w-6 h-6 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>
                  <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-200">OpenAI</span>
                </button>
                <button @click="aiKeyForm.provider = 'anthropic'" class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all" :class="aiKeyForm.provider === 'anthropic' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
                  <svg class="w-6 h-6 text-gray-800 dark:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>
                  <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Anthropic</span>
                </button>
                <button @click="aiKeyForm.provider = 'gemini'" class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all" :class="aiKeyForm.provider === 'gemini' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
                  <svg class="w-6 h-6" viewBox="0 0 24 24"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81" fill="url(#gm3)"/><defs><linearGradient id="gm3" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#4285F4"/><stop offset=".5" stop-color="#9B72CB"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs></svg>
                  <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Gemini</span>
                </button>
                <button @click="aiKeyForm.provider = 'deepseek'" class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all" :class="aiKeyForm.provider === 'deepseek' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
                  <svg class="w-6 h-6" viewBox="0 0 512 509.64" fill="#4D6BFE"><path d="M440.898 139.167c-4.001-1.961-5.723 1.776-8.062 3.673-.801.612-1.479 1.407-2.154 2.141-5.848 6.246-12.681 10.349-21.607 9.859-13.048-.734-24.192 3.368-34.04 13.348-2.093-12.307-9.048-19.658-19.635-24.37-5.54-2.449-11.141-4.9-15.02-10.227-2.708-3.795-3.447-8.021-4.801-12.185-.861-2.509-1.725-5.082-4.618-5.512-3.139-.49-4.372 2.142-5.601 4.349-4.925 9.002-6.833 18.921-6.647 28.962.432 22.597 9.972 40.597 28.932 53.397 2.154 1.47 2.707 2.939 2.032 5.082-1.293 4.41-2.832 8.695-4.186 13.105-.862 2.817-2.157 3.429-5.172 2.205-10.402-4.346-19.391-10.778-27.332-18.553-13.481-13.044-25.668-27.434-40.873-38.702a177.614 177.614 0 00-10.834-7.409c-15.512-15.063 2.032-27.434 6.094-28.902 4.247-1.532 1.478-6.797-12.251-6.736-13.727.061-26.285 4.653-42.288 10.777-2.34.92-4.801 1.593-7.326 2.142-14.527-2.756-29.608-3.368-45.367-1.593-29.671 3.305-53.368 17.329-70.788 41.272-20.928 28.785-25.854 61.482-19.821 95.59 6.34 35.943 24.683 65.704 52.876 88.974 29.239 24.123 62.911 35.943 101.32 33.677 23.329-1.346 49.307-4.468 78.607-29.27 7.387 3.673 15.142 5.144 28.008 6.246 9.911.92 19.452-.49 26.839-2.019 11.573-2.449 10.773-13.166 6.586-15.124-33.915-15.797-26.47-9.368-33.24-14.573 17.235-20.39 43.213-41.577 53.369-110.222.8-5.448.121-8.877 0-13.287-.061-2.692.553-3.734 3.632-4.041 8.494-.981 16.742-3.305 24.314-7.471 21.975-12.002 30.84-31.719 32.933-55.355.307-3.612-.061-7.348-3.879-9.245v-.003zM249.4 351.89c-32.872-25.838-48.814-34.352-55.4-33.984-6.155.368-5.048 7.41-3.694 12.002 1.415 4.532 3.264 7.654 5.848 11.634 1.785 2.634 3.017 6.551-1.784 9.493-10.587 6.55-28.993-2.205-29.856-2.635-21.421-12.614-39.334-29.269-51.954-52.047-12.187-21.924-19.267-45.435-20.435-70.542-.308-6.061 1.478-8.207 7.509-9.307 7.94-1.471 16.127-1.778 24.068-.615 33.547 4.9 62.108 19.902 86.054 43.66 13.666 13.531 24.007 29.699 34.658 45.496 11.326 16.778 23.514 32.761 39.026 45.865 5.479 4.592 9.848 8.083 14.035 10.656-12.62 1.407-33.673 1.714-48.075-9.676zm15.899-102.519c.521-2.111 2.421-3.658 4.722-3.658a4.74 4.74 0 011.661.305c.678.246 1.293.614 1.786 1.163.861.859 1.354 2.083 1.354 3.368 0 2.695-2.154 4.837-4.862 4.837a4.748 4.748 0 01-4.738-4.034 5.01 5.01 0 01.077-1.981zm47.208 26.915c-2.606.996-5.2 1.778-7.707 1.88-4.679.244-9.787-1.654-12.556-3.981-4.308-3.612-7.386-5.631-8.679-11.941-.554-2.695-.247-6.858.246-9.246 1.108-5.144-.124-8.451-3.754-11.451-2.954-2.449-6.711-3.122-10.834-3.122-1.539 0-2.954-.673-4.001-1.224-1.724-.856-3.139-3-1.785-5.634.432-.856 2.525-2.939 3.018-3.305 5.6-3.185 12.065-2.144 18.034.244 5.54 2.266 9.727 6.429 15.759 12.307 6.155 7.102 7.263 9.063 10.773 14.39 2.771 4.163 5.294 8.451 7.018 13.348.877 2.561.071 4.74-2.341 6.277-.981.625-2.109 1.044-3.191 1.458z"/></svg>
                  <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-200">DeepSeek</span>
                </button>
                <button @click="aiKeyForm.provider = 'custom'" class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all" :class="aiKeyForm.provider === 'custom' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'">
                  <svg class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span class="text-[10px] font-semibold text-gray-700 dark:text-gray-200">Custom</span>
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input v-model="aiKeyForm.label" placeholder="Ej: OpenAI produccion" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
              <div class="relative">
                <input v-model="aiKeyForm.api_key" :type="showAiModalKey ? 'text' : 'password'" placeholder="sk-..." class="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                <button @click="showAiModalKey = !showAiModalKey" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <svg v-if="!showAiModalKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                </button>
              </div>
            </div>
            <div v-if="aiKeyForm.provider === 'custom'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endpoint</label>
              <input v-model="aiKeyForm.custom_endpoint" placeholder="https://your-api.com/v1" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <p v-if="aiKeyError" class="text-sm text-red-600">{{ aiKeyError }}</p>
            <div class="flex items-center justify-end gap-3 pt-1">
              <button @click="showAiKeyModal = false" class="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
              <button @click="saveAiKey" :disabled="aiKeySaving" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">{{ aiKeySaving ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Add AI model modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showAiModelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showAiModelModal = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Agregar modelo</h3>
              <button @click="showAiModelModal = false" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Llave de API</label>
              <select v-model="aiModelForm.ai_key_id" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Seleccionar llave...</option>
                <option v-for="k in aiKeys" :key="k.id" :value="k.id">{{ k.label }} ({{ k.provider }})</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
              <div class="relative">
                <select v-model="aiModelForm.model" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" :disabled="aiLoadingModels">
                  <option value="">Seleccionar modelo...</option>
                  <option v-for="m in aiModalModels" :key="typeof m === 'string' ? m : m.id" :value="typeof m === 'string' ? m : m.id">{{ typeof m === 'string' ? m : (m.name || m.id) }}</option>
                </select>
                <svg v-if="aiLoadingModels" class="animate-spin h-4 w-4 text-gray-400 absolute right-8 top-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Etiqueta (opcional)</label>
              <input v-model="aiModelForm.label" :placeholder="aiModelForm.model || 'Nombre del modelo'" class="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <p v-if="aiModelError" class="text-sm text-red-600">{{ aiModelError }}</p>
            <div class="flex items-center justify-end gap-3 pt-1">
              <button @click="showAiModelModal = false" class="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
              <button @click="saveAiModel" :disabled="aiModelSaving" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">{{ aiModelSaving ? 'Guardando...' : 'Agregar' }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete AI key modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showAiDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showAiDeleteModal = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Eliminar llave</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Esto tambien eliminara los modelos asociados a <strong>{{ aiDeleteTarget?.label }}</strong>.</p>
            <div class="flex items-center justify-center gap-3">
              <button @click="showAiDeleteModal = false" class="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
              <button @click="deleteAiKey()" :disabled="aiDeleting" class="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Eliminar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete AI model modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showAiModelDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" @click="showAiModelDeleteModal = false"></div>
          <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Eliminar modelo</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">Quitar <strong>{{ aiModelDeleteTarget?.label || aiModelDeleteTarget?.model }}</strong> de tus favoritos?</p>
            <div class="flex items-center justify-center gap-3">
              <button @click="showAiModelDeleteModal = false" class="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
              <button @click="deleteAiModel()" :disabled="aiDeleting" class="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">Eliminar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useSettingsStore } from '../stores/settings'
import { useAuthStore } from '../stores/auth'
import api from '../lib/api'

const settingsStore = useSettingsStore()
const auth = useAuthStore()
const form = ref(null)
const aiUsage = ref(null)
const aiUsageLoading = ref(false)

// AI Keys state
const aiKeys = ref([])
const aiKeysLoading = ref(true)
const showAiKeyModal = ref(false)
const showAiModalKey = ref(false)
const aiKeySaving = ref(false)
const aiKeyError = ref('')
const aiKeyForm = ref({ provider: 'openai', label: '', api_key: '', custom_endpoint: '' })
const showAiDeleteModal = ref(false)
const aiDeleteTarget = ref(null)
const aiDeleting = ref(false)

// AI Models state
const aiModels = ref([])
const showAiModelModal = ref(false)
const aiModelSaving = ref(false)
const aiModelError = ref('')
const aiModelForm = ref({ ai_key_id: '', model: '', label: '' })
const showAiModelDeleteModal = ref(false)
const aiModelDeleteTarget = ref(null)
const aiLoadingModels = ref(false)
const aiFetchedModels = ref(null)
const aiTestMsg = ref('')
const aiTestSuccess = ref(false)

const aiFallbackModels = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1', 'gpt-4.1-nano', 'gpt-4-turbo', 'o3-mini', 'o4-mini'],
  anthropic: ['claude-haiku-4-5-20250315', 'claude-sonnet-4-6-20250514', 'claude-opus-4-6-20250514'],
  gemini: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  custom: ['gpt-4o-mini', 'gpt-4o']
}

const selectedKeyForModel = computed(() => aiKeys.value.find(k => k.id === aiModelForm.value.ai_key_id))
const aiModalModels = computed(() => {
  const key = selectedKeyForModel.value
  if (!key) return []
  if (aiFetchedModels.value?.length > 0) return aiFetchedModels.value
  return aiFallbackModels[key.provider] || aiFallbackModels.custom
})

function aiProviderBg(provider) {
  return { openai: 'bg-emerald-100 dark:bg-emerald-900/30', anthropic: 'bg-amber-100 dark:bg-amber-900/30', gemini: 'bg-blue-100 dark:bg-blue-900/30', deepseek: 'bg-indigo-100 dark:bg-indigo-900/30', custom: 'bg-purple-100 dark:bg-purple-900/30' }[provider] || 'bg-gray-100 dark:bg-gray-700'
}

async function fetchAiKeys() {
  aiKeysLoading.value = true
  try { aiKeys.value = (await api.get('/settings/ai-keys')).data.keys || [] } catch (e) { aiKeys.value = [] } finally { aiKeysLoading.value = false }
}

async function fetchAiModelsData() {
  try { aiModels.value = (await api.get('/settings/ai-models')).data.models || [] } catch (e) { aiModels.value = [] }
}

async function fetchProviderModels() {
  const key = selectedKeyForModel.value
  if (!key) { aiFetchedModels.value = null; return }
  aiLoadingModels.value = true
  try {
    const { data } = await api.get('/settings/models', { params: { ai_key_id: key.id } })
    aiFetchedModels.value = data.models?.length > 0 ? data.models : null
  } catch (e) { aiFetchedModels.value = null } finally { aiLoadingModels.value = false }
}

watch(() => aiModelForm.value.ai_key_id, () => { aiModelForm.value.model = ''; aiFetchedModels.value = null; fetchProviderModels() })

function openAddKeyModal() {
  aiKeyForm.value = { provider: 'openai', label: '', api_key: '', custom_endpoint: '' }
  aiKeyError.value = ''; showAiModalKey.value = false; showAiKeyModal.value = true
}

function openAddModelModal() {
  aiModelForm.value = { ai_key_id: aiKeys.value[0]?.id || '', model: '', label: '' }
  aiModelError.value = ''; aiFetchedModels.value = null; showAiModelModal.value = true
  fetchProviderModels()
}

async function saveAiKey() {
  if (!aiKeyForm.value.api_key) { aiKeyError.value = 'La API key es requerida'; return }
  aiKeySaving.value = true; aiKeyError.value = ''
  try {
    await api.post('/settings/ai-keys', { label: aiKeyForm.value.label || `${aiKeyForm.value.provider} key`, provider: aiKeyForm.value.provider, api_key: aiKeyForm.value.api_key, custom_endpoint: aiKeyForm.value.custom_endpoint })
    showAiKeyModal.value = false; await fetchAiKeys()
  } catch (e) { aiKeyError.value = e.response?.data?.error || 'Error al guardar' } finally { aiKeySaving.value = false }
}

async function saveAiModel() {
  if (!aiModelForm.value.ai_key_id || !aiModelForm.value.model) { aiModelError.value = 'Selecciona llave y modelo'; return }
  aiModelSaving.value = true; aiModelError.value = ''
  try {
    await api.post('/settings/ai-models', { ai_key_id: aiModelForm.value.ai_key_id, model: aiModelForm.value.model, label: aiModelForm.value.label || aiModelForm.value.model })
    showAiModelModal.value = false; await fetchAiModelsData()
    await settingsStore.fetchSettings(); if (settingsStore.settings) form.value = { ...settingsStore.settings }
  } catch (e) { aiModelError.value = e.response?.data?.error || 'Error al guardar' } finally { aiModelSaving.value = false }
}

async function activateAiModel(id) {
  try {
    await api.put(`/settings/ai-models/${id}/activate`); await fetchAiModelsData()
    await settingsStore.fetchSettings(); if (settingsStore.settings) form.value = { ...settingsStore.settings }
  } catch (e) { alert('Error al activar modelo') }
}

async function deleteAiKey() {
  if (!aiDeleteTarget.value) return
  aiDeleting.value = true
  try {
    await api.delete(`/settings/ai-keys/${aiDeleteTarget.value.id}`); showAiDeleteModal.value = false; aiDeleteTarget.value = null
    await fetchAiKeys(); await fetchAiModelsData()
    await settingsStore.fetchSettings(); if (settingsStore.settings) form.value = { ...settingsStore.settings }
  } catch (e) { alert('Error al eliminar') } finally { aiDeleting.value = false }
}

async function deleteAiModel() {
  if (!aiModelDeleteTarget.value) return
  aiDeleting.value = true
  try {
    await api.delete(`/settings/ai-models/${aiModelDeleteTarget.value.id}`); showAiModelDeleteModal.value = false; aiModelDeleteTarget.value = null
    await fetchAiModelsData()
    await settingsStore.fetchSettings(); if (settingsStore.settings) form.value = { ...settingsStore.settings }
  } catch (e) { alert('Error al eliminar') } finally { aiDeleting.value = false }
}

const saving = ref(false)
const saved = ref(false)
const activeSection = ref('bot')
const expandedModule = ref(null)

const sections = [
  { key: 'bot', label: 'Bot' },
  { key: 'business', label: 'Mi negocio' },
  { key: 'modules', label: 'Modulos' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'ai', label: 'Proveedor de IA' },
  { key: 'team', label: 'Colaboradores' },
  { key: 'mcp', label: 'Integraciones' }
]

const sectionIcons = {
  bot: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  business: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  modules: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  whatsapp: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  ai: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  team: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  mcp: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
}

const allModules = [
  {
    key: 'products', icon: '📦', name: 'Productos / Servicios',
    desc: 'Catalogo de productos con precios',
    details: 'Gestiona tu catalogo de productos o servicios. El bot los conoce y puede recomendarlos a tus clientes durante la conversacion.',
    features: ['Catalogo con nombre, precio, descripcion y stock', 'El bot recomienda productos segun lo que pide el cliente', 'Tabla con paginacion y busqueda en la interfaz', 'Soporte para categorias y estado activo/inactivo']
  },
  {
    key: 'orders', icon: '🛒', name: 'Pedidos / Comandas',
    desc: 'Recibe y gestiona pedidos desde WhatsApp',
    details: 'Ideal para restaurantes y negocios de comida. Los clientes hacen pedidos por WhatsApp y el bot confirma items, cantidades y total.',
    features: ['El bot toma pedidos del catalogo por conversacion', 'Confirma items, cantidades y precio total antes de procesar', 'Notificacion en tiempo real cuando llega un pedido', 'Historial de pedidos por cliente']
  },
  {
    key: 'appointments', icon: '📅', name: 'Citas / Agenda',
    desc: 'Permite a clientes agendar citas',
    details: 'Perfecto para barberias, consultorios y servicios. El bot agenda citas preguntando fecha, hora y servicio deseado.',
    features: ['Agendamiento por conversacion con confirmacion', 'Vista de calendario con citas del dia, semana y mes', 'El bot pregunta fecha y hora antes de confirmar', 'Recordatorios y seguimiento automatico']
  },
  {
    key: 'quotes', icon: '💰', name: 'Cotizaciones',
    desc: 'Genera cotizaciones automaticas',
    details: 'El bot genera cotizaciones detalladas con desglose de productos, cantidades y precios basandose en tu catalogo.',
    features: ['Cotizaciones automaticas por conversacion', 'Desglose de items con precios unitarios y total', 'Vigencia configurable de la cotizacion', 'Basado en los precios de tu catalogo']
  },
  {
    key: 'followups', icon: '💛', name: 'Fidelizacion',
    desc: 'Seguimiento automatico a clientes',
    details: 'Envia mensajes de seguimiento automaticos a clientes que no han regresado en un tiempo. Ideal para mantener la relacion.',
    features: ['Reglas configurables por tipo de trigger', 'Mensajes personalizables con plantillas', 'Seguimiento por dias despues de ultima visita, cita o compra', 'Registro de mensajes enviados y respuestas recibidas']
  },
  {
    key: 'image_generation', icon: '🎨', name: 'Imagenes IA',
    desc: 'Genera imagenes con inteligencia artificial',
    details: 'Usa DALL-E de OpenAI para generar imagenes desde la plataforma. Util para crear contenido visual para tus productos o marketing.',
    features: ['Generacion de imagenes con DALL-E 3', 'Descripciones en lenguaje natural', 'Multiples resoluciones disponibles', 'Requiere proveedor OpenAI configurado']
  }
]

// Order notification config
const orderNotifyNumbers = ref([])
const orderNotifyInput = ref('')
const savingOrderConfig = ref(false)
const savedOrderConfig = ref(false)
const customerNotifications = ref({
  confirmed: true,
  preparing: true,
  ready: true,
  delivered: false,
  cancelled: true
})

const customerNotifySteps = [
  { key: 'confirmed', label: 'Pedido confirmado', preview: '"Tu pedido ha sido confirmado y sera procesado en breve."' },
  { key: 'preparing', label: 'En preparacion', preview: '"Tu pedido esta siendo preparado. Te avisaremos cuando este listo."' },
  { key: 'ready', label: 'Pedido listo', preview: '"Tu pedido esta listo para entrega."' },
  { key: 'delivered', label: 'Entregado', preview: '"Tu pedido ha sido entregado. Gracias por elegirnos."' },
  { key: 'cancelled', label: 'Cancelado', preview: '"Tu pedido ha sido cancelado."' }
]

function addOrderNotifyNumber() {
  const num = orderNotifyInput.value.trim()
  if (!num) return
  if (!orderNotifyNumbers.value.includes(num)) {
    orderNotifyNumbers.value.push(num)
  }
  orderNotifyInput.value = ''
}

function removeOrderNotifyNumber(idx) {
  orderNotifyNumbers.value.splice(idx, 1)
}

async function saveOrderNotifyConfig() {
  savingOrderConfig.value = true
  savedOrderConfig.value = false
  try {
    await api.put('/modules/orders', {
      enabled: true,
      config: {
        notifyNumbers: orderNotifyNumbers.value,
        customerNotifications: customerNotifications.value
      }
    })
    savedOrderConfig.value = true
    setTimeout(() => savedOrderConfig.value = false, 3000)
  } catch (e) {
    alert('Error guardando configuracion de notificaciones')
  } finally {
    savingOrderConfig.value = false
  }
}

// Team / Colaboradores
const teamMembers = ref([])
const showTeamForm = ref(false)
const teamForm = ref({ name: '', email: '', password: '' })
const teamFormError = ref('')

// Business
const businessForm = ref({ name: '', description: '', address: '', phone: '', hours: '', policies: '', extra_info: '' })
const businessFormLoaded = ref(false)
const savingBusiness = ref(false)
const savedBusiness = ref(false)
const generatingDesc = ref(false)
const generatingPolicies = ref(false)
const generatingExtraInfo = ref(false)

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
  // Load order notification config
  try {
    const { data } = await api.get('/modules')
    const ordersMod = (data.modules || []).find(m => m.key === 'orders')
    if (ordersMod?.config) {
      if (ordersMod.config.notifyNumbers) orderNotifyNumbers.value = ordersMod.config.notifyNumbers
      if (ordersMod.config.customerNotifications) customerNotifications.value = { ...customerNotifications.value, ...ordersMod.config.customerNotifications }
    }
  } catch (e) { /* ignore */ }
  try {
    const { data } = await api.get('/business')
    if (data.business) {
      businessForm.value = { ...data.business }
      settingsStore.patchBusinessInfo(data.business)
    }
    businessFormLoaded.value = true
  } catch (e) { /* ignore */ businessFormLoaded.value = true }
  try {
    const { data } = await api.get('/auth/agents')
    teamMembers.value = data.agents || []
  } catch (e) { /* ignore */ }
  try {
    const { data: s } = await api.get('/whatsapp/status')
    settingsStore.whatsappStatus = s.status || 'disconnected'
    const { data: q } = await api.get('/whatsapp/qr')
    if (q.qr) settingsStore.qrCode = q.qr
  } catch (e) { /* ignore */ }
  // Fetch AI usage summary
  fetchAiKeys().then(() => fetchAiModelsData())
  aiUsageLoading.value = true
  try {
    const { data } = await api.get('/usage', { params: { period: 'month' } })
    aiUsage.value = data.summary || null
  } catch (e) { /* ignore */ } finally {
    aiUsageLoading.value = false
  }
})

watch(() => form.value?.whitelist_mode, (mode) => {
  if (mode === 'whitelist') loadWhitelist()
})

watch(
  () => businessForm.value.name,
  (name) => {
    if (!businessFormLoaded.value) return
    settingsStore.patchBusinessInfo({ name: name ?? '' })
  }
)

async function save() {
  saving.value = true; saved.value = false
  try {
    await settingsStore.updateSettings(form.value)
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e) { alert('Error guardando') }
  finally { saving.value = false }
}

async function createMember() {
  teamFormError.value = ''
  try {
    const { data } = await api.post('/auth/agents', teamForm.value)
    teamMembers.value.push({ ...data.agent, active: 1 })
    showTeamForm.value = false
    teamForm.value = { name: '', email: '', password: '' }
  } catch (e) { teamFormError.value = e.response?.data?.error || 'Error al crear colaborador' }
}

async function deactivateMember(id) {
  if (!confirm('Desactivar este colaborador? Ya no podra iniciar sesion.')) return
  await api.delete(`/auth/agents/${id}`)
  const member = teamMembers.value.find(m => m.id === id)
  if (member) member.active = 0
}

async function saveBusiness() {
  savingBusiness.value = true; savedBusiness.value = false
  try {
    const { data } = await api.put('/business', businessForm.value)
    if (data?.business) {
      settingsStore.patchBusinessInfo(data.business)
      if (auth.user) {
        auth.user = { ...auth.user, tenantName: data.business.name }
        localStorage.setItem('user', JSON.stringify(auth.user))
      }
    } else {
      await settingsStore.fetchBusinessInfo()
    }
    savedBusiness.value = true
    setTimeout(() => savedBusiness.value = false, 3000)
  } catch (e) { alert('Error guardando') }
  finally { savingBusiness.value = false }
}

async function generateDescription() {
  if (!businessForm.value.name?.trim() || generatingDesc.value) return
  generatingDesc.value = true
  try {
    const { data } = await api.post('/business/generate-description', {
      businessName: businessForm.value.name,
      businessType: 'negocio'
    })
    if (data.description) businessForm.value.description = data.description
  } catch (e) { alert('No se pudo generar la descripcion. Verifica tu configuracion de IA.') }
  finally { generatingDesc.value = false }
}

async function generateField(field) {
  if (!businessForm.value.name?.trim()) return
  const loading = field === 'policies' ? generatingPolicies : generatingExtraInfo
  if (loading.value) return
  loading.value = true
  try {
    const { data } = await api.post('/business/generate-field', {
      field,
      businessName: businessForm.value.name,
      businessType: 'negocio',
      description: businessForm.value.description || ''
    })
    if (data.result) businessForm.value[field] = data.result
  } catch (e) { alert('No se pudo generar. Verifica tu configuracion de IA.') }
  finally { loading.value = false }
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
