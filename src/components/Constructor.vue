<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  paletteItems: {
    type: Array,
    required: true
  },
  quantities: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:quantities'])

// Define type order for sorting
const typeOrder = {
  'Full Time': 0,
  'Fixed Contractor': 1,
  'Ad Hoc': 2
}

// Define background colors for types
const typeColors = {
  'Full Time': 'bg-green-50',
  'Fixed Contractor': 'bg-blue-50',
  'Ad Hoc': 'bg-orange-50'
}

// Group and sort items
const groupedItems = computed(() => {
  // First group by function
  const groups = props.paletteItems.reduce((acc, item) => {
    if (!acc[item.function]) {
      acc[item.function] = []
    }
    acc[item.function].push(item)
    return acc
  }, {})

  // Sort each group by type
  Object.keys(groups).forEach((func) => {
    groups[func].sort((a, b) => {
      return typeOrder[a.type] - typeOrder[b.type]
    })
  })

  return groups
})

const updateQuantity = (itemId, value) => {
  const newQuantities = { ...props.quantities }
  if (value === 0) {
    delete newQuantities[itemId]
  } else {
    newQuantities[itemId] = value
  }
  emit('update:quantities', newQuantities)
}
</script>

<template>
  <div class="bg-white p-4 shadow-sm">
    <h2 class="text-xl font-semibold mb-4">Constructor</h2>
    
    <div class="space-y-6">
      <div v-for="(items, func) in groupedItems" :key="func" class="space-y-2">
        <h3 class="text-lg font-medium text-gray-700 capitalize">{{ func }}</h3>
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left py-2">Item</th>
              <th class="text-left py-2">Type</th>
              <th class="text-right py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="item in items" 
              :key="item.id" 
              class="border-b transition-colors duration-200"
              :class="typeColors[item.type]"
            >
              <td class="py-2">{{ item.title }}</td>
              <td class="py-2">{{ item.type }}</td>
              <td class="py-2 text-right">
                <input
                  type="number"
                  :value="quantities[item.id] || 0"
                  @input="updateQuantity(item.id, parseInt($event.target.value) || 0)"
                  min="0"
                  class="w-20 px-2 py-1 border rounded bg-white"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template> 