<template>
  <div :style="wrapperStyle">
    <div ref="mapEl" class="leaflet-host" :style="{ height, borderRadius: '20px' }"></div>
    <button v-if="userLocation" @click="returnToUserLocation" class="location-btn" title="Return to my location">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
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
const userLocation = ref(null)
let map
let layerGroup
let markerById = new Map()
let userMarker = null

onMounted(() => {
  map = L.map(mapEl.value, { zoomControl: false })
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  })
  tiles.addTo(map)

  layerGroup = L.layerGroup().addTo(map)
  renderMarkers()
  getUserLocation()
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

function getUserLocation() {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      userLocation.value = { lat: latitude, lng: longitude }

      // 创建用户位置标记
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div class="user-location-pulse"></div>',
        iconSize: [20, 20]
      })

      if (userMarker) {
        userMarker.setLatLng([latitude, longitude])
      } else {
        userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .bindTooltip('Your Location')
          .addTo(map)
      }
    },
    (error) => {
      console.warn('Error getting user location:', error.message)
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}

function returnToUserLocation() {
  if (userLocation.value && map) {
    map.setView([userLocation.value.lat, userLocation.value.lng], 16, { animate: true })
  }
}

const wrapperStyle = {
  position: 'relative',
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

.location-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 44px;
  height: 44px;
  background: white;
  border: none;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1000;
}

.location-btn:hover {
  background: #f7931e;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(247, 147, 30, 0.3);
}

.location-btn:active {
  transform: scale(0.95);
}

:deep(.user-location-marker) {
  background: transparent;
  border: none;
}

:deep(.user-location-pulse) {
  width: 20px;
  height: 20px;
  background: #4285f4;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(66, 133, 244, 0);
  }
}
</style>
