<script setup>
import { ref } from 'vue'

const props = defineProps({
  paletteItems: {
    type: Array,
    required: true
  }
})

// This will be expanded later with actual org chart rendering logic
</script>

<template>
  <div class="bg-white p-4 shadow-sm h-full relative canvas-container">
    <h2 class="text-xl font-semibold mb-4">Canvas</h2>
    
    <div class="h-[calc(100%-2rem)] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
      <p class="text-gray-500">Org chart will be rendered here</p>
    </div>

    <!-- Color Key -->
    <div class="absolute bottom-4 right-4 text-xs space-y-1">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-green-100 border border-green-300"></div>
        <span>Full Time</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-blue-100 border border-blue-300"></div>
        <span>Fixed Contractor</span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-orange-100 border border-orange-300"></div>
        <span>Ad Hoc</span>
      </div>
    </div>
  </div>
</template> 