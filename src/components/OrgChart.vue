<script setup>
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import { ref, computed, watch, onMounted, nextTick } from 'vue'

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

// Define node styles based on type
const nodeStyles = {
  'Full Time': 'bg-green-100 border-green-300',
  'Fixed Contractor': 'bg-blue-100 border-blue-300',
  'Ad Hoc': 'bg-orange-100 border-orange-300'
}

// Generate nodes and edges from the data
const nodes = ref([])
const edges = ref([])
const containerRef = ref(null)
const { fitView } = useVueFlow()

// Function to create a node
const createNode = (item, index, position) => ({
  id: `${item.id}_${index}`,
  type: 'default',
  position,
  data: { 
    label: item.title,
    type: item.type
  },
  class: `rounded-lg border-2 ${nodeStyles[item.type]}`
})

// Function to create an edge
const createEdge = (source, target) => ({
  id: `${source}_${target}`,
  source,
  target,
  type: 'smoothstep',
  animated: false,
  markerEnd: {
    type: 'arrowclosed'
  }
})

// Update the chart when data changes
watch(
  [() => props.paletteItems, () => props.quantities],
  async ([newItems, newQuantities]) => {
    const newNodes = []
    const newEdges = []
    const nodePositions = new Map()
    let xOffset = 0
    let yOffset = 0

    // First, create nodes for items without relationships
    newItems.forEach(item => {
      if (!item.reportsTo && newQuantities[item.id] > 0) {
        for (let i = 0; i < newQuantities[item.id]; i++) {
          const node = createNode(item, i, { x: xOffset, y: yOffset })
          newNodes.push(node)
          nodePositions.set(`${item.id}_${i}`, { x: xOffset, y: yOffset })
          yOffset += 100
        }
        xOffset += 200
        yOffset = 0
      }
    })

    // Then create nodes for items with relationships
    newItems.forEach(item => {
      if (item.reportsTo && newQuantities[item.id] > 0) {
        const parentItem = newItems.find(i => i.id === item.reportsTo)
        if (parentItem) {
          const parentNodeId = `${parentItem.id}_0` // Use first instance of parent
          const parentPos = nodePositions.get(parentNodeId)
          
          if (parentPos) {
            for (let i = 0; i < newQuantities[item.id]; i++) {
              const node = createNode(item, i, { 
                x: parentPos.x + 200, 
                y: yOffset 
              })
              newNodes.push(node)
              nodePositions.set(`${item.id}_${i}`, { 
                x: parentPos.x + 200, 
                y: yOffset 
              })
              newEdges.push(createEdge(parentNodeId, `${item.id}_${i}`))
              yOffset += 100
            }
          }
        }
      }
    })

    nodes.value = newNodes
    edges.value = newEdges

    // Wait for the next tick to ensure nodes are rendered
    await nextTick()
    // Fit the view after nodes are rendered
    fitView()
  },
  { immediate: true, deep: true }
)

onMounted(async () => {
  // Wait for the next tick to ensure container is mounted
  await nextTick()
  // Log container dimensions for debugging
  if (containerRef.value) {
    console.log('Container dimensions:', {
      width: containerRef.value.offsetWidth,
      height: containerRef.value.offsetHeight
    })
  }
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full relative">
    <VueFlow
      v-model="nodes"
      :edges="edges"
      :fit-view="true"
      :min-zoom="0.2"
      :max-zoom="4"
      class="bg-white"
    >
      <Background />
      <Controls />
    </VueFlow>
  </div>
</template>

<style>
.vue-flow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100% !important;
  height: 100% !important;
}

.vue-flow__node {
  padding: 10px;
  border-radius: 8px;
  width: 150px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
}

.vue-flow__edge-path {
  stroke: #b1b1b7;
  stroke-width: 2;
}

.vue-flow__controls {
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
}
</style> 