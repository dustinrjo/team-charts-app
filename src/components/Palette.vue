<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import EntitySelect from './EntitySelect.vue'

const props = defineProps({
  paletteItems: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:paletteItems'])

const isModalOpen = ref(false)
const hasAttemptedSave = ref(false)
const isEditing = ref(false)
const editingIndex = ref(-1)
const newItem = ref({
  id: '',
  title: '',
  type: 'Full Time',
  function: 'engineering',
  reportsTo: null
})

const types = ['Full Time', 'Fixed Contractor', 'Ad Hoc']
const functions = ['product', 'design', 'engineering', 'QA', 'program management']

const isFormValid = computed(() => {
  return newItem.value.title.trim() !== ''
})

const showTitleError = computed(() => {
  return hasAttemptedSave.value && !isFormValid.value
})

// Generate a unique ID
const generateId = () => {
  return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Get available report options (excluding current item when editing)
const availableReportOptions = computed(() => {
  return props.paletteItems.filter((item, index) => {
    if (isEditing.value && index === editingIndex.value) {
      return false
    }
    return true
  })
})

const openModal = () => {
  isModalOpen.value = true
  hasAttemptedSave.value = false
  isEditing.value = false
  editingIndex.value = -1
  newItem.value = {
    id: generateId(),
    title: '',
    type: 'Full Time',
    function: 'engineering',
    reportsTo: null
  }
}

const editItem = (index) => {
  isModalOpen.value = true
  hasAttemptedSave.value = false
  isEditing.value = true
  editingIndex.value = index
  newItem.value = { ...props.paletteItems[index] }
}

const closeModal = () => {
  isModalOpen.value = false
  hasAttemptedSave.value = false
  isEditing.value = false
  editingIndex.value = -1
  newItem.value = {
    id: generateId(),
    title: '',
    type: 'Full Time',
    function: 'engineering',
    reportsTo: null
  }
}

const saveItem = () => {
  hasAttemptedSave.value = true
  
  if (!newItem.value.title.trim()) {
    return
  }
  
  const updatedItems = Array.from(props.paletteItems)
  if (isEditing.value) {
    // Preserve the original ID when editing
    const originalId = updatedItems[editingIndex.value].id
    updatedItems[editingIndex.value] = { ...newItem.value, id: originalId }
  } else {
    updatedItems.push({ ...newItem.value })
  }
  emit('update:paletteItems', updatedItems)
  closeModal()
}

const deleteItem = (index) => {
  const updatedItems = Array.from(props.paletteItems).filter((_, i) => i !== index)
  emit('update:paletteItems', updatedItems)
}

// Get the title of the reporting entity
const getReportingEntityTitle = (reportsToId) => {
  if (!reportsToId) return 'None'
  const entity = props.paletteItems.find(item => item.id === reportsToId)
  return entity ? entity.title : 'Unknown'
}

// Computed properties for organizing items
const topLevelItems = computed(() => {
  return props.paletteItems.filter(item => !item.reportsTo)
})

const secondLevelItems = computed(() => {
  return props.paletteItems.filter(item => {
    if (!item.reportsTo) return false
    const reportsTo = props.paletteItems.find(i => i.id === item.reportsTo)
    return reportsTo && !reportsTo.reportsTo
  })
})

const thirdLevelItems = computed(() => {
  return props.paletteItems.filter(item => {
    if (!item.reportsTo) return false
    const reportsTo = props.paletteItems.find(i => i.id === item.reportsTo)
    return reportsTo && reportsTo.reportsTo
  })
})
</script>

<template>
  <div class="bg-white p-4 shadow-sm">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Palette</h2>
      <button
        @click="openModal"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Add Item
      </button>
    </div>

    <div class="space-y-6">
      <!-- Top Level Row -->
      <div class="space-y-4">
        <h3 class="text-sm font-medium text-gray-500">Top Level</h3>
        <div class="grid grid-cols-6 gap-4">
          <div
            v-for="(item, index) in topLevelItems"
            :key="item.id"
            @click="editItem(props.paletteItems.indexOf(item))"
            class="p-3 border rounded relative group cursor-pointer hover:shadow-md transition-shadow"
            :class="{
              'bg-green-100': item.type === 'Full Time',
              'bg-blue-100': item.type === 'Fixed Contractor',
              'bg-orange-100': item.type === 'Ad Hoc'
            }"
          >
            <button
              @click.stop="deleteItem(props.paletteItems.indexOf(item))"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 aspect-square"
              style="aspect-ratio: 1/1;"
            >
              ×
            </button>
            <h3 class="font-medium">{{ item.title }}</h3>
            <p class="text-sm text-gray-600">{{ item.type }}</p>
            <p class="text-sm text-gray-600">{{ item.function }}</p>
          </div>
        </div>
      </div>

      <!-- Second Level Row -->
      <div class="space-y-4">
        <div class="border-t border-dotted border-gray-300 pt-6"></div>
        <h3 class="text-sm font-medium text-gray-500">Second Level</h3>
        <div class="grid grid-cols-6 gap-4">
          <div
            v-for="(item, index) in secondLevelItems"
            :key="item.id"
            @click="editItem(props.paletteItems.indexOf(item))"
            class="p-3 border rounded relative group cursor-pointer hover:shadow-md transition-shadow"
            :class="{
              'bg-green-100': item.type === 'Full Time',
              'bg-blue-100': item.type === 'Fixed Contractor',
              'bg-orange-100': item.type === 'Ad Hoc'
            }"
          >
            <button
              @click.stop="deleteItem(props.paletteItems.indexOf(item))"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 aspect-square"
              style="aspect-ratio: 1/1;"
            >
              ×
            </button>
            <h3 class="font-medium">{{ item.title }}</h3>
            <p class="text-sm text-gray-600">{{ item.type }}</p>
            <p class="text-sm text-gray-600">{{ item.function }}</p>
            <p class="text-sm text-gray-500 mt-2">
              Reports to: {{ getReportingEntityTitle(item.reportsTo) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Third Level Row -->
      <div v-if="thirdLevelItems.length > 0" class="space-y-4">
        <div class="border-t border-dotted border-gray-300 pt-6"></div>
        <h3 class="text-sm font-medium text-gray-500">Third Level</h3>
        <div class="grid grid-cols-6 gap-4">
          <div
            v-for="(item, index) in thirdLevelItems"
            :key="item.id"
            @click="editItem(props.paletteItems.indexOf(item))"
            class="p-3 border rounded relative group cursor-pointer hover:shadow-md transition-shadow"
            :class="{
              'bg-green-100': item.type === 'Full Time',
              'bg-blue-100': item.type === 'Fixed Contractor',
              'bg-orange-100': item.type === 'Ad Hoc'
            }"
          >
            <button
              @click.stop="deleteItem(props.paletteItems.indexOf(item))"
              class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center hover:bg-red-600 aspect-square"
              style="aspect-ratio: 1/1;"
            >
              ×
            </button>
            <h3 class="font-medium">{{ item.title }}</h3>
            <p class="text-sm text-gray-600">{{ item.type }}</p>
            <p class="text-sm text-gray-600">{{ item.function }}</p>
            <p class="text-sm text-gray-500 mt-2">
              Reports to: {{ getReportingEntityTitle(item.reportsTo) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <Dialog
      :open="isModalOpen"
      @close="closeModal"
      class="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-200 shadow-lg">
          <DialogTitle class="text-lg font-medium mb-4">
            {{ isEditing ? 'Edit Item' : 'Add New Item' }}
          </DialogTitle>
          
          <form @submit.prevent="saveItem" class="space-y-6">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <input
                v-model="newItem.title"
                type="text"
                class="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                :class="[
                  showTitleError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                ]"
              />
              <div class="h-5">
                <p v-if="showTitleError" class="text-sm text-red-600">
                  Title is required
                </p>
              </div>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Type</label>
              <select
                v-model="newItem.type"
                class="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option v-for="type in types" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Function</label>
              <select
                v-model="newItem.function"
                class="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option v-for="func in functions" :key="func" :value="func">
                  {{ func }}
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-sm font-medium text-gray-700">Reports to</label>
              <EntitySelect
                v-model="newItem.reportsTo"
                :options="availableReportOptions"
                placeholder="Select reporting entity"
              />
            </div>

            <div class="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
              >
                {{ isEditing ? 'Save Changes' : 'Save' }}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template> 