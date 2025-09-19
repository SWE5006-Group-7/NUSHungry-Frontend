<template>
  <div :style="wrapperStyle">
    <div ref="mapEl" class="leaflet-host" :style="{ height, borderRadius: '20px' }"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  markers: { type: Array, default: () => [] }, // {id,lat,lng,label}
  height: { type: String, default: '320px' },
  focusId: { type: [String, Number, null], default: null },
  routeOnClick: { type: Boolean, default: false },
})

const emit = defineEmits(['marker-click'])

const mapEl = ref(null)
let map
let layerGroup
let markerById = new Map()

onMounted(() => {
  map = L.map(mapEl.value, { zoomControl: false })
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  })
  tiles.addTo(map)

  layerGroup = L.layerGroup().addTo(map)
  renderMarkers()
})

onBeforeUnmount(() => {
  if (map) map.remove()
})

watch(() => props.markers, renderMarkers, { deep: true })
watch(() => props.focusId, (id) => {
  if (!id || !markerById.has(id)) return
  const m = markerById.get(id)
  map.setView(m.getLatLng(), Math.max(map.getZoom(), 16), { animate: true })
  m.openPopup()
})

function renderMarkers() {
  if (!map) return
  layerGroup.clearLayers()
  markerById = new Map()

  const bounds = []
  props.markers.forEach((m) => {
    const marker = L.marker([m.lat, m.lng])
      .bindTooltip(m.label)
      .on('click', () => { if (props.routeOnClick) emit('marker-click', m) })
    marker.addTo(layerGroup)
    markerById.set(m.id ?? m.label, marker)
    bounds.push([m.lat, m.lng])
  })

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [20, 20] })
  } else {
    map.setView([1.2967, 103.7764], 15)
  }
}

const wrapperStyle = {
  background: 'white',
  borderRadius: '20px',
  padding: '8px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.03)',
  /* Avoid creating a new stacking context here (no transform) */
  transform: undefined
}
</script>

<style scoped>
.leaflet-host :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  /* Ensure map tiles don't float above fixed header */
  z-index: 1; /* header uses 9999 */
}

/* Also ensure the wrapper itself doesn't create an unexpected stacking context */
.leaflet-host {
  position: relative;
  z-index: 0;
}

</style>
