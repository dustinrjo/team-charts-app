<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const props = defineProps({
  paletteItems: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:paletteItems'])

const isModalOpen = ref(false)
const hasAttemptedSave = ref(false)
const newItem = ref({
  title: '',
  type: 'Full Time',
  function: 'engineering'
})

const types = ['Full Time', 'Fixed Contractor', 'Ad Hoc']
const functions = ['product', 'design', 'engineering', 'QA', 'program management']

const isFormValid = computed(() => {
  return newItem.value.title.trim() !== ''
})

const showTitleError = computed(() => {
  return hasAttemptedSave.value && !isFormValid.value
})

const openModal = () => {
  isModalOpen.value = true
  hasAttemptedSave.value = false
  newItem.value = {
    title: '',
    type: 'Full Time',
    function: 'engineering'
  }
}

const closeModal = () => {
  isModalOpen.value = false
  hasAttemptedSave.value = false
  newItem.value = {
    title: '',
    type: 'Full Time',
    function: 'engineering'
  }
}

const saveItem = () => {
  hasAttemptedSave.value = true
  
  if (!newItem.value.title.trim()) {
    return
  }
  
  const updatedItems = Array.from(props.paletteItems)
  updatedItems.push({ ...newItem.value })
  emit('update:paletteItems', updatedItems)
  closeModal()
}

const deleteItem = (index) => {
  const updatedItems = Array.from(props.paletteItems).filter((_, i) => i !== index)
  emit('update:paletteItems', updatedItems)
}
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

    <div class="grid grid-cols-6 gap-4">
      <div
        v-for="(item, index) in paletteItems"
        :key="item.title"
        class="p-3 border rounded relative group"
        :class="{
          'bg-green-100': item.type === 'Full Time',
          'bg-blue-100': item.type === 'Fixed Contractor',
          'bg-orange-100': item.type === 'Ad Hoc'
        }"
      >
        <button
          @click="deleteItem(index)"
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

    <Dialog
      :open="isModalOpen"
      @close="closeModal"
      class="relative z-50"
    >
      <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div class="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel class="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-200 shadow-lg">
          <DialogTitle class="text-lg font-medium mb-4">Add New Item</DialogTitle>
          
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
                Save
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
</template> 