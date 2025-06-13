<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  paletteItems: {
    type: Array,
    required: true
  }
})

const quantities = ref({})

watch(() => props.paletteItems, (newItems) => {
  const newQuantities = { ...quantities.value }
  newItems.forEach(item => {
    if (!newQuantities[item.title]) {
      newQuantities[item.title] = 0
    }
  })
  quantities.value = newQuantities
}, { deep: true })

const updateQuantity = (title, delta) => {
  const newQuantities = { ...quantities.value }
  newQuantities[title] = Math.max(0, (newQuantities[title] || 0) + delta)
  quantities.value = newQuantities
}
</script>

<template>
  <div class="bg-white p-4 shadow-sm h-full">
    <h2 class="text-xl font-semibold mb-4">Constructor</h2>
    
    <div class="space-y-4">
      <div
        v-for="item in paletteItems"
        :key="item.title"
        class="flex items-center justify-between p-3 border rounded"
        :class="{
          'bg-green-50': item.type === 'Full Time',
          'bg-blue-50': item.type === 'Fixed Contractor',
          'bg-orange-50': item.type === 'Ad Hoc'
        }"
      >
        <div>
          <h3 class="font-medium">{{ item.title }}</h3>
          <p class="text-sm text-gray-600">{{ item.type }} - {{ item.function }}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="updateQuantity(item.title, -1)"
            class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            -
          </button>
          <span class="w-8 text-center">{{ quantities[item.title] || 0 }}</span>
          <button
            @click="updateQuantity(item.title, 1)"
            class="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 