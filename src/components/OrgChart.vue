<script setup>
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import { ref, watch, onMounted, nextTick } from 'vue'

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

const nodeStyles = {
  'Full Time': 'bg-green-100 border-green-400',
  'Fixed Contractor': 'bg-blue-100 border-blue-400',
  'Ad Hoc': 'bg-orange-100 border-orange-400'
}
const nodeColors = {
  'Full Time': 'bg-green-100 border-green-400',
  'Fixed Contractor': 'bg-blue-100 border-blue-400',
  'Ad Hoc': 'bg-orange-100 border-orange-400'
}

const nodes = ref([])
const edges = ref([])
const containerRef = ref(null)
const { fitView } = useVueFlow()
const isDraggable = ref(false)

// Helper to robustly fit view after updates
async function fitViewRobust() {
  await nextTick()
  setTimeout(() => {
    fitView()
  }, 50)
}

function getNodeStyle(type) {
  if (type === 'Full Time') {
    return {
      '--vf-node-bg': '#d1fae5', // Tailwind green-100
      '--vf-node-color': '#4ade80' // Tailwind green-400
    }
  }
  if (type === 'Fixed Contractor') {
    return {
      '--vf-node-bg': '#dbeafe', // Tailwind blue-100
      '--vf-node-color': '#60a5fa' // Tailwind blue-400
    }
  }
  if (type === 'Ad Hoc') {
    return {
      '--vf-node-bg': '#ffedd5', // Tailwind orange-100
      '--vf-node-color': '#fdba74' // Tailwind orange-400
    }
  }
  return {}
}

// Recursive layout for up to 3 levels
function layoutNodes(items, quantities) {
  const newNodes = []
  const newEdges = []
  const leaders = items.filter(item => !item.reportsTo && quantities[item.id] > 0)
  const groupSpacing = 300 // reduced spacing
  const nodeWidth = 180
  const nodeHeight = 80
  const verticalSpacing = 140
  let groupX = 0

  function getNodeClass(type) {
    return `rounded-lg border-2 ${nodeStyles[type] || ''}`
  }

  function layoutSubtree(parentId, parentX, parentY, level, parentInstance = 0) {
    const children = items.filter(item => item.reportsTo === parentId && quantities[item.id] > 0)
    if (!children.length) return []
    const totalChildren = children.reduce((sum, c) => sum + quantities[c.id], 0)
    const totalWidth = totalChildren * nodeWidth + (totalChildren - 1) * 24
    let startX = parentX + nodeWidth / 2 - totalWidth / 2
    let childIdx = 0
    let childNodes = []
    children.forEach(child => {
      for (let i = 0; i < quantities[child.id]; i++) {
        const childNodeId = `${child.id}_${i}`
        const parentNodeId = `${parentId}_${parentInstance}`
        const x = startX + childIdx * (nodeWidth + 24)
        const y = parentY + nodeHeight + verticalSpacing
        newNodes.push({
          id: childNodeId,
          type: 'default',
          position: { x, y },
          data: { label: child.title, type: child.type },
          draggable: isDraggable.value,
          class: 'rounded-lg',
          style: getNodeStyle(child.type)
        })
        newEdges.push({
          id: `edge_${parentNodeId}_${childNodeId}`,
          source: parentNodeId,
          target: childNodeId,
          type: 'smoothstep',
          animated: false,
          markerEnd: { type: 'arrowclosed' }
        })
        // Recursively layout children of this child
        layoutSubtree(child.id, x, y, level + 1, i)
        childIdx++
      }
    })
    return childNodes
  }

  leaders.forEach((leader, groupIdx) => {
    // Place leader at the top center of their group
    const leaderNodeId = `${leader.id}_0`
    newNodes.push({
      id: leaderNodeId,
      type: 'default',
      position: { x: groupX + nodeWidth, y: 0 },
      data: { label: leader.title, type: leader.type },
      draggable: isDraggable.value,
      class: 'rounded-lg',
      style: getNodeStyle(leader.type)
    })
    // Layout direct and indirect reports recursively
    layoutSubtree(leader.id, groupX + nodeWidth, 0, 1, 0)
    // Move groupX for next group
    // Find the max width used by this group
    const groupChildren = items.filter(item => item.reportsTo === leader.id && quantities[item.id] > 0)
    const totalReports = groupChildren.reduce((sum, r) => sum + quantities[r.id], 0)
    const totalWidth = Math.max(totalReports * nodeWidth + (totalReports - 1) * 24, nodeWidth * 2)
    groupX += totalWidth + groupSpacing
  })
  return { newNodes, newEdges }
}

watch(
  [() => props.paletteItems, () => props.quantities, isDraggable],
  async ([items, quantities]) => {
    const { newNodes, newEdges } = layoutNodes(items, quantities)
    nodes.value = newNodes
    edges.value = newEdges
    await fitViewRobust()
  },
  { immediate: true, deep: true }
)

onMounted(async () => {
  await fitViewRobust()
  if (containerRef.value) {
    console.log('Container dimensions:', {
      width: containerRef.value.offsetWidth,
      height: containerRef.value.offsetHeight
    })
  }
})
</script>

<template>
  <div ref="containerRef" class="w-full h-full relative border border-gray-300 rounded-md">
    <div class="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
      <button
        @click="isDraggable = !isDraggable"
        class="bg-white px-3 py-1 rounded shadow text-sm mb-2"
        :class="{ 'bg-blue-100': isDraggable }"
      >
        {{ isDraggable ? 'Disable Dragging' : 'Enable Dragging' }}
      </button>
      <!-- Color Key -->
      <div class="flex gap-4 items-center bg-white rounded shadow px-2 py-1 text-xs">
        <span v-for="(cls, type) in nodeColors" :key="type" class="flex items-center gap-1">
          <span :class="`inline-block w-4 h-4 rounded border-2 ${cls}`"></span>
          <span class="ml-1 text-gray-800 font-medium">{{ type }}</span>
        </span>
      </div>
    </div>
    <VueFlow
      v-model="nodes"
      :edges="edges"
      :fit-view="true"
      :min-zoom="0.2"
      :max-zoom="4"
      class="bg-white"
      :nodes-draggable="isDraggable"
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
  width: 180px;
  min-height: 60px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  cursor: default;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.vue-flow__node.draggable {
  cursor: move;
}

.vue-flow__edge-path {
  stroke: #b1b1b7;
  stroke-width: 2;
}

.vue-flow__controls {
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
}
</style> 