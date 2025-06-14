<script setup>
import { ref, watch } from 'vue'

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
    <table class="w-full">
      <thead>
        <tr class="border-b">
          <th class="text-left py-2">Item</th>
          <th class="text-left py-2">Type</th>
          <th class="text-left py-2">Function</th>
          <th class="text-right py-2">Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in paletteItems" :key="item.id" class="border-b">
          <td class="py-2">{{ item.title }}</td>
          <td class="py-2">{{ item.type }}</td>
          <td class="py-2">{{ item.function }}</td>
          <td class="py-2 text-right">
            <input
              type="number"
              :value="quantities[item.id] || 0"
              @input="updateQuantity(item.id, parseInt($event.target.value) || 0)"
              min="0"
              class="w-20 px-2 py-1 border rounded"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template> 