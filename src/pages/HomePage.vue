<template>
  <a-layout style="min-height: 100vh; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
    <Header />

    <a-layout-content style="padding: 96px 24px 32px; flex: 1;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <a-row :gutter="[24, 24]">
          <!-- Left filter sidebar (sticks on the very left) -->
          <a-col :xs="24" :lg="6">
            <a-space direction="vertical" :style="{ width: '100%', position: 'sticky', top: '96px' }">
              <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
                <a-row :gutter="[12,12]">
                  <a-col :xs="8" :lg="12" v-for="cat in cuisineCats" :key="cat.name">
                    <a-button 
                      block 
                      :style="getCuisineBtnStyle(cat.name)" 
                      size="large" 
                      :type="selectedCuisines.has(cat.name) ? 'primary' : 'default'" 
                      @click="toggleCuisine(cat.name)"
                      class="cuisine-btn"
                      :data-selected="selectedCuisines.has(cat.name)"
                    >
                      <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span
                          role="img"
                          :aria-label="cat.name"
                          class="cuisine-icon cuisine-emoji"
                        >
                          {{ cat.icon }}
                        </span>
                        <span class="cuisine-text" style="font-size: 12px; font-weight: 500;">{{ cat.name }}</span>
                      </div>
                    </a-button>
                  </a-col>
                </a-row>
              </a-card>

              <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
                <a-row :gutter="[16, 16]" class="compact-filters">
                  <!-- Opening Hours section - takes full width on large screens, left column on small screens -->
                  <a-col :xs="10" :lg="24" class="opening-section">
                    <a-typography-title :level="5" style="margin-top:0; margin-bottom: 12px;">Opening Hours</a-typography-title>
                    <a-space direction="vertical">
                      <a-checkbox v-model:checked="openNow">Open now</a-checkbox>
                    </a-space>
                  </a-col>

                  <!-- Distance and Price section - stacked vertically on both screen sizes, right column on small screens -->
                  <a-col :xs="14" :lg="24" class="range-section">
                    <div style="margin-bottom: 16px;">
                      <a-typography-title :level="5" style="margin-top:0; margin-bottom: 8px;">Distance</a-typography-title>
                      <a-slider :min="0" :max="2" :step="0.1" v-model:value="distanceKm" />
                      <div style="display:flex; justify-content:space-between; color:#64748b; font-size:12px; margin-top: 4px;">
                        <span>{{ distanceKm.toFixed(1) }} km</span>
                        <span>2.0 km</span>
                      </div>
                    </div>

                    <div>
                      <a-typography-title :level="5" style="margin-top:0; margin-bottom: 8px;">Price Range</a-typography-title>
                      <a-slider range :min="0" :max="50" v-model:value="priceRange" />
                      <div style="display:flex; justify-content:space-between; color:#64748b; font-size:12px; margin-top: 4px;">
                        <span>$0 - ${{ priceRange[1] }}</span>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </a-card>
            </a-space>
          </a-col>

          <!-- Right content: map + list -->
          <a-col :xs="24" :lg="18">
            <!-- Map section at top of right column -->
            <div :class="{ 'map-pinned': isMapPinned }" class="map-container">
              <MapSection
                :markers="homeMarkers"
                height="360px"
                :focus-id="focusId"
                :route-on-click="true"
                @marker-click="focusAndScroll"
                @bounds-changed="handleMapBoundsChanged"
                @pin-changed="handlePinChanged"
              />
            </div>
            <a-card :style="cardStyle" :body-style="{ padding: '28px' }">
              <div :style="cardHeaderStyle">
                <a-typography-title :level="3" :style="{ margin: 0, color: '#1f2937', fontWeight: 700 }">Nearby Stalls</a-typography-title>
                <a-space>
                  <a-button size="middle" :style="getOpeningBtnStyle" @click="openNow = !openNow">Opening</a-button>
                  <a-button size="middle" :style="getSortBtnStyle" @click="toggleSort">Sort by Rating</a-button>
                </a-space>
              </div>

              <a-row :gutter="[28, 28]">
                <a-col v-for="stall in filteredCards" :key="stall.id" :xs="24" :md="12" :ref="el => setCardRef(stall.id, el)">
                  <StallCard :stall="stall" @hover="onHover" @leave="onLeave" />
                </a-col>
              </a-row>
            </a-card>
          </a-col>

        </a-row>
      </div>
    </a-layout-content>

    <a-layout-footer :style="footerStyle">
      <a-typography-text :style="{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 500 }">
        NUSHungry © 2025
      </a-typography-text>
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import Header from '@/components/Header.vue'
import MapSection from '@/components/MapSection.vue'
import StallCard from '@/components/StallCard.vue'
import { useStallStore } from '@/stores/stall';
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { getCafeterias } from '@/services/cafeteriaService';
import { calculateDistance, formatDistance } from '@/utils/distance';

const cardStyle = { borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.03)' }
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' }
const footerStyle = { textAlign: 'center', background: '#000000', padding: '32px 24px', marginTop: '40px' }
// Dynamic button styles
const getOpeningBtnStyle = computed(() => {
  return openNow.value
    ? { background: 'rgba(82, 196, 26, 0.1)', borderColor: 'rgba(82, 196, 26, 0.2)', color: '#52c41a', fontWeight: 500, transition: 'all 0.2s ease' }
    : { background: '#ffffff', borderColor: '#000000', color: '#000000', fontWeight: 500, transition: 'all 0.2s ease' }
})

const getSortBtnStyle = computed(() => {
  return sortByRating.value
    ? { background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)', color: '#f7931e', fontWeight: 500, transition: 'all 0.2s ease' }
    : { background: '#ffffff', borderColor: '#000000', color: '#000000', fontWeight: 500, transition: 'all 0.2s ease' }
})

// Store
const stallStore = useStallStore();
const { stalls: sourceStalls, loading, error } = storeToRefs(stallStore);

// Cafeterias data
const cafeterias = ref([]);

// Filter state
const selectedCuisines = ref(new Set())
const openNow = ref(false)
const distanceKm = ref(2.0)
const priceRange = ref([0, 50])
const sortByRating = ref(false)
const mapBounds = ref(null) // Store current map bounds for filtering
const userLocation = ref(null) // User's current location for distance calculation

// Options
const cuisineCats = [
  { name: 'Chinese', icon: '🥡', },
  { name: 'Indian', icon: '🍛' },
  { name: 'Malay', icon: '🍜' },
  { name: 'Western', icon: '🍔' },
  { name: 'Japanese', icon: '🍣' },
  { name: 'Korean', icon: '🍲' },

]
const catBtn = { background: '#f8fafc', borderColor: '#eef2f7', borderRadius: '10px', fontWeight: 500 }

const getCuisineBtnStyle = (cuisineName) => {
  const isSelected = selectedCuisines.value.has(cuisineName)
  return {
    background: isSelected ? '#667eea' : '#f8fafc',
    borderColor: isSelected ? '#667eea' : '#eef2f7',
    borderRadius: '10px',
    fontWeight: 500,
    padding: '12px 8px',
    height: 'auto',
    minHeight: '80px',
    transition: 'all 0.2s ease',
    color: isSelected ? '#ffffff' : '#374151'
  }
}

// Filtering
const filtered = computed(() => {
  const cuisines = selectedCuisines.value
  const keyword = route.query.keyword
  const bounds = mapBounds.value
  const maxDistanceKm = distanceKm.value

  let list = sourceStalls.value.filter(s => {
    // Filter by keyword (search in name and cuisine)
    if (keyword) {
      const kw = keyword.toLowerCase()
      const matchName = s.name?.toLowerCase().includes(kw)
      const matchCuisine = s.cuisine?.toLowerCase().includes(kw)
      if (!matchName && !matchCuisine) {
        return false
      }
    }

    // Filter by cuisine
    if (cuisines.size > 0 && s.cuisine && !cuisines.has(s.cuisine)) {
      return false
    }

    // Filter by map bounds (only show stalls within visible area)
    if (bounds) {
      const stallLocation = getStallLocation(s)
      if (stallLocation) {
        const { lat, lng } = stallLocation
        if (lat < bounds.south || lat > bounds.north || lng < bounds.west || lng > bounds.east) {
          return false
        }
      }
    }

    // Filter by distance from user location
    if (userLocation.value && maxDistanceKm < 2.0) {
      const stallLocation = getStallLocation(s)
      if (stallLocation) {
        const distance = calculateDistance(
          userLocation.value.lat,
          userLocation.value.lng,
          stallLocation.lat,
          stallLocation.lng
        )
        if (distance > maxDistanceKm) {
          return false
        }
      }
    }

    // Filter by open now (if backend provides isOpen data)
    // if (openNow.value && !s.isOpen) return false
    return true
  })
  if (sortByRating.value) list = [...list].sort((a,b) => (b.averageRating || 0) - (a.averageRating || 0))
  return list
})

// Helper function to get stall location (from cafeteria or its own coordinates)
const getStallLocation = (stall) => {
  // Get location from cafeteria if available
  const cafeteria = cafeterias.value.find(c => c.id === stall.cafeteriaId)
  if (cafeteria && cafeteria.latitude && cafeteria.longitude) {
    return { lat: cafeteria.latitude, lng: cafeteria.longitude }
  }
  // Otherwise use stall's own coordinates if available
  if (stall.latitude && stall.longitude) {
    return { lat: stall.latitude, lng: stall.longitude }
  }
  return null
}

const mapToCard = (s) => {
  let distance = 'N/A'
  if (userLocation.value) {
    const stallLocation = getStallLocation(s)
    if (stallLocation) {
      const distanceKm = calculateDistance(
        userLocation.value.lat,
        userLocation.value.lng,
        stallLocation.lat,
        stallLocation.lng
      )
      distance = formatDistance(distanceKm)
    }
  }

  return {
    id: s.id,
    name: s.name,
    cuisine: s.cuisine || 'Various',
    cafeteriaName: s.cafeteriaName || 'NUS Cafeteria',
    rating: s.averageRating || 0,
    reviews: s.reviewCount || 0,
    averagePrice: s.averagePrice || 0,
    distance,
    image: s.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop',
    halal: s.halal || false,
    isOpen: true, // Mock data
  }
}

const filteredCards = computed(() => filtered.value.map(mapToCard))

// 地图标记:包含所有cafeterias + 不属于任何cafeteria的stalls
const homeMarkers = computed(() => {
  const markers = []

  // 添加所有cafeterias
  cafeterias.value.forEach(cafeteria => {
    if (cafeteria.latitude && cafeteria.longitude) {
      markers.push({
        id: `cafeteria-${cafeteria.id}`,
        lat: cafeteria.latitude,
        lng: cafeteria.longitude,
        label: cafeteria.name,
        type: 'cafeteria'
      })
    }
  })

  // 添加不属于任何cafeteria的stalls (cafeteria为null或undefined)
  sourceStalls.value.forEach(stall => {
    // 检查stall是否有cafeteria关联
    if (!stall.cafeteriaId && stall.latitude && stall.longitude) {
      markers.push({
        id: `stall-${stall.id}`,
        lat: stall.latitude,
        lng: stall.longitude,
        label: stall.name,
        type: 'stall'
      })
    }
  })

  return markers
})

// Map pinning
const isMapPinned = ref(false)
const handlePinChanged = (pinned) => {
  isMapPinned.value = pinned
}

// Map <-> List linking
const focusId = ref(null)
const onHover = (id) => {
  // When hovering over a stall card, focus on its cafeteria or stall marker
  const stall = sourceStalls.value.find(s => s.id === id)
  if (!stall) return

  // Try to find corresponding cafeteria marker
  if (stall.cafeteriaId) {
    focusId.value = `cafeteria-${stall.cafeteriaId}`
  } else {
    // Or use the stall's own marker if it's standalone
    focusId.value = `stall-${id}`
  }
}
const onLeave = () => { focusId.value = null }

const cardRefs = new Map()
const setCardRef = (id, el) => { if (el) cardRefs.set(id, el) }
const focusAndScroll = (m) => {
  focusId.value = m.id
  const el = cardRefs.get(m.id)
  if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Handlers
const toggleCuisine = (name) => {
  const s = selectedCuisines.value
  if (s.has(name)) s.delete(name); else s.add(name)
  selectedCuisines.value = new Set(s)
}
const toggleSort = () => { sortByRating.value = !sortByRating.value }

// Handle map bounds change
const handleMapBoundsChanged = (bounds) => {
  mapBounds.value = bounds
}

// URL sync
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // 并行加载stalls和cafeterias
  await Promise.all([
    stallStore.fetchStalls(),
    loadCafeterias()
  ])

  // Get user location for distance calculation
  getUserLocation()

  const q = route.query
  if (q.cuisines) {
    const arr = String(q.cuisines).split(',').filter(Boolean)
    selectedCuisines.value = new Set(arr)
  }
  if (q.open) openNow.value = q.open === '1'
  if (q.dist) distanceKm.value = Math.min(2, Math.max(0, Number(q.dist)))
  if (q.sort === 'rating') sortByRating.value = true
})

// 加载cafeterias数据
const loadCafeterias = async () => {
  try {
    const response = await getCafeterias()
    cafeterias.value = response.data || []
  } catch (err) {
    console.error('Failed to load cafeterias:', err)
  }
}

// 获取用户位置
const getUserLocation = () => {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      userLocation.value = { lat: latitude, lng: longitude }
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

watch([selectedCuisines, openNow, distanceKm, sortByRating], () => {
  const cuisines = Array.from(selectedCuisines.value)
  const query = {
    ...(cuisines.length ? { cuisines: cuisines.join(',') } : {}),
    ...(openNow.value ? { open: '1' } : {}),
    ...(distanceKm.value !== 2 ? { dist: String(distanceKm.value.toFixed(1)) } : {}),
    ...(sortByRating.value ? { sort: 'rating' } : {})
  }
  router.replace({ query })
}, { deep: true })
</script>

<style scoped>
.map-container {
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.map-container.map-pinned {
  position: sticky;
  top: 80px;
  z-index: 100;
  margin-bottom: 24px;
}

.cuisine-btn {
  position: relative;
  overflow: hidden;
}

.cuisine-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.cuisine-btn:hover .cuisine-icon {
  filter: brightness(1.1);
}

.cuisine-btn:hover .cuisine-text {
  font-weight: 600;
}

.cuisine-icon {
  transition: all 0.2s ease;
}

.cuisine-emoji {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 20px; /* emoji size */
  line-height: 1;
}

.cuisine-text {
  transition: all 0.2s ease;
}

/* Selected state styles */
.cuisine-btn[data-selected="true"] .cuisine-icon {
  filter: brightness(1.2) drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
}

.cuisine-btn[data-selected="true"] .cuisine-text {
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Compact filters layout */
.compact-filters {
  align-items: flex-start;
}

/* On small screens (xs), add separator between opening and range sections */
@media (max-width: 991px) {
  .opening-section {
    border-right: 1px solid #f0f0f0;
    padding-right: 12px !important;
  }
  
  .range-section {
    padding-left: 12px !important;
  }
}

/* On large screens (lg), remove the border and stack vertically */
@media (min-width: 992px) {
  .opening-section {
    border-right: none;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 16px;
  }
}
</style>
