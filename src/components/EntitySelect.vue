<script setup>
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectedOption = computed(() => {
  if (!props.modelValue) return null
  return props.options.find(option => option.id === props.modelValue)
})

const selectOption = (option) => {
  emit('update:modelValue', option.id)
  isOpen.value = false
}

// Close dropdown when clicking outside
const dropdownRef = ref(null)
onClickOutside(dropdownRef, () => {
  isOpen.value = false
})
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Selected value display -->
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="w-full px-3 py-2 text-left border rounded-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div v-if="selectedOption" class="flex flex-col">
        <span class="font-medium">{{ selectedOption.title }}</span>
        <span class="text-sm text-gray-600">{{ selectedOption.type }}</span>
        <span class="text-sm text-gray-600">{{ selectedOption.function }}</span>
      </div>
      <span v-else class="text-gray-500">{{ placeholder }}</span>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
    >
      <div class="py-1">
        <button
          @click="selectOption({ id: null })"
          class="w-full px-3 py-2 text-left hover:bg-gray-100"
        >
          None
        </button>
        <div class="border-t border-gray-200"></div>
        <button
          v-for="option in options"
          :key="option.id"
          @click="selectOption(option)"
          class="w-full px-3 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
        >
          <div class="flex flex-col space-y-1">
            <span class="font-medium text-gray-900">{{ option.title }}</span>
            <span class="text-sm text-gray-600">{{ option.type }}</span>
            <span class="text-sm text-gray-500">{{ option.function }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template> 