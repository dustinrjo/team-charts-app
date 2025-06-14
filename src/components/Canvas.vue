<script setup>
import OrgChart from './OrgChart.vue'

defineProps({
  paletteItems: {
    type: Array,
    required: true
  },
  quantities: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="bg-white p-4 shadow-sm h-full flex flex-col">
    <h2 class="text-xl font-semibold mb-4">Canvas</h2>
    <div class="flex-1 relative">
      <OrgChart
        :palette-items="paletteItems"
        :quantities="quantities"
      />
    </div>
  </div>
</template>

<style scoped>
.vue-flow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style> 