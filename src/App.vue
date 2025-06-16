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
    const { items, quantities: savedQuantities } = JSON.parse(savedData)
    paletteItems.value = items
    quantities.value = savedQuantities
  }
})

// Save data to localStorage whenever it changes
watch(
  [paletteItems, quantities],
  ([newItems, newQuantities]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        items: newItems,
        quantities: newQuantities
      })
    )
  },
  { deep: true }
)

const clearAllData = () => {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    paletteItems.value = []
    quantities.value = {}
    localStorage.removeItem(STORAGE_KEY)
  }
}
</script>

<template>
  <div class="h-screen bg-gray-100 p-4 flex flex-col">
    <div class="flex-1 max-w-7xl mx-auto w-full">
      <!-- Top row with Palette and Constructor -->

        <div class="w-full">
          <Palette v-model:paletteItems="paletteItems" />
        </div>
        <div class="w-full">
          <Constructor
            :palette-items="paletteItems"
            v-model:quantities="quantities"
          />
          </div>

      
      <!-- Bottom row with Canvas -->
      <div class="w-full h-full">
        <Canvas
          :palette-items="paletteItems"
          :quantities="quantities"
        />
      </div>
    </div>
    <button
      @click="clearAllData"
      class="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Clear All Data
    </button>
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
