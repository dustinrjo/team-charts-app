<script setup>
import { ref, watch, onMounted } from 'vue'
import Palette from './components/Palette.vue'
import Constructor from './components/Constructor.vue'
import Canvas from './components/Canvas.vue'

const STORAGE_KEY = 'team-charts-data'

const paletteItems = ref([])
const quantities = ref({})

// Load data from localStorage on mount
onMounted(() => {
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (savedData) {
    const { paletteItems: savedPaletteItems, quantities: savedQuantities } = JSON.parse(savedData)
    paletteItems.value = savedPaletteItems
    quantities.value = savedQuantities
  }
})

// Save data to localStorage whenever it changes
watch([paletteItems, quantities], ([newPaletteItems, newQuantities]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    paletteItems: newPaletteItems,
    quantities: newQuantities
  }))
}, { deep: true })

const clearAllData = () => {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    paletteItems.value = []
    quantities.value = {}
    localStorage.removeItem(STORAGE_KEY)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <button
      @click="clearAllData"
      class="fixed top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
    >
      Clear All Data
    </button>

    <div class="container mx-auto p-4 min-w-[60vw]">
      <header class="mb-4">
        <h1 class="text-2xl font-bold text-gray-800">Team Charts App</h1>
      </header>

      <div class="grid grid-cols-12 gap-4">
        <!-- Palette (Top) -->
        <div class="col-span-12">
          <Palette v-model:palette-items="paletteItems" />
        </div>

        <!-- Canvas (Center) -->
        <div class="col-span-8 min-h-[90vh]">
          <Canvas :palette-items="paletteItems" />
        </div>

        <!-- Constructor (Right) -->
        <div class="col-span-4">
          <Constructor 
            :palette-items="paletteItems"
            v-model:quantities="quantities"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

header {
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

p {
  color: #666;
  font-size: 1.1rem;
}

.welcome-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}
</style>
