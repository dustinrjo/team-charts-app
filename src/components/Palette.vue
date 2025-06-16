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

const formData = ref({
  id: '',
  title: '',
  type: 'Full Time',
  function: 'engineering',
  reportsTo: null,
  vendor: ''
})

const types = ['Full Time', 'Fixed Contractor', 'Ad Hoc']
const functions = ['product', 'design', 'engineering', 'QA', 'program management']

const isFormValid = computed(() => {
  return formData.value.title.trim() !== ''
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

const schema = computed(() => {
  const currentItem = isEditing.value ? props.paletteItems[editingIndex.value] : null
  
  return {
    title: { 
      type: 'text', 
      label: '', 
      rules: 'required', 
      placeholder: 'Enter title',
      default: currentItem?.title || ''
    },
    type: { 
      type: 'select', 
      label: '', 
      items: types, 
      rules: 'required', 
      placeholder: 'Select type',
      default: currentItem?.type || 'Full Time'
    },
    function: { 
      type: 'select', 
      label: '', 
      items: functions, 
      rules: 'required', 
      placeholder: 'Select function',
      default: currentItem?.function || 'engineering'
    },
    reportsTo: {
      type: 'select',
      label: '',
      items: props.paletteItems.filter((item, idx) => !isEditing.value || idx !== editingIndex.value).map(item => ({ value: item.id, label: item.title })),
      placeholder: 'Select reporting entity',
      clearable: true,
      default: currentItem?.reportsTo || null
    },
    vendor: {
      type: 'select',
      label: '',
      items: vendorOptions.value,
      optionCreate: true,
      search: true,
      clearable: true,
      placeholder: 'Select or create vendor',
      default: currentItem?.vendor || ''
    },
    cancel: {
      type: 'button',
      buttonLabel: 'Cancel',
      secondary: true,
      onClick: () => closeModal()
    },
    submit: {
      type: 'button',
      buttonLabel: isEditing.value ? 'Save Changes' : 'Save',
      submits: true
    }
  }
})

function openModal() {
  isModalOpen.value = true
  isEditing.value = false
  editingIndex.value = -1
}

function editItem(index) {
  isModalOpen.value = true
  isEditing.value = true
  editingIndex.value = index
}

function closeModal() {
  isModalOpen.value = false
  isEditing.value = false
  editingIndex.value = -1
}

function saveItem(form$) {
  const data = form$.data
  const cleanData = {
    id: isEditing.value ? props.paletteItems[editingIndex.value].id : generateId(),
    title: data.title,
    type: data.type,
    function: data.function,
    reportsTo: data.reportsTo,
    vendor: data.vendor
  }
  
  const updatedItems = Array.from(props.paletteItems)
  if (isEditing.value) {
    updatedItems[editingIndex.value] = cleanData
  } else {
    updatedItems.push(cleanData)
  }
  
  emit('update:paletteItems', updatedItems)
  closeModal()
}

function deleteItem(index) {
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

// Compute unique vendor options from palette
const vendorOptions = computed(() => {
  const vendors = props.paletteItems
    .map(item => item.vendor)
    .filter(v => v && v.trim() !== '')
  return Array.from(new Set(vendors))
    .sort()
    .map(v => ({ value: v, label: v }))
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
            <h3 class="text-xs font-medium">{{ item.title }}</h3>
            <p class="text-xs text-gray-600">{{ item.type }}</p>
            <p class="text-xs text-gray-600">{{ item.function }}</p>
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
            <h3 class="text-xs font-medium">{{ item.title }}</h3>
            <p class="text-xs text-gray-600">{{ item.type }}</p>
            <p class="text-xs text-gray-600">{{ item.function }}</p>
            <p class="text-xs text-gray-500 mt-2">
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
            <h3 class="text-xs font-medium">{{ item.title }}</h3>
            <p class="text-xs text-gray-600">{{ item.type }}</p>
            <p class="text-xs text-gray-600">{{ item.function }}</p>
            <p class="text-xs text-gray-500 mt-2">
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
        <DialogPanel class="bg-white rounded-lg p-6 max-w-md w-full border border-gray-200 shadow-lg">
          <DialogTitle class="text-lg font-medium mb-4">
            {{ isEditing ? 'Edit Item' : 'Add New Item' }}
          </DialogTitle>
          
          <Vueform
            :schema="schema"
            @submit="saveItem"
            :endpoint="false"
          />
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template> 