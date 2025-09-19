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
                  <a-col :span="12" v-for="cat in cuisineCats" :key="cat.name">
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
                <a-typography-title :level="5" style="margin-top:0">Opening Hours</a-typography-title>
                <a-space direction="vertical">
                  <a-checkbox v-model:checked="openNow">Open now</a-checkbox>
                </a-space>
              </a-card>

              <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
                <a-typography-title :level="5" style="margin-top:0">Distance</a-typography-title>
                <a-slider :min="0" :max="2" :step="0.1" v-model:value="distanceKm" />
                <div style="display:flex; justify-content:space-between; color:#64748b; font-size:12px;">
                  <span>{{ distanceKm.toFixed(1) }} km</span>
                  <span>2.0 km</span>
                </div>
              </a-card>

              <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
                <a-typography-title :level="5" style="margin-top:0">Price Range</a-typography-title>
                <a-slider range :min="0" :max="50" v-model:value="priceRange" />
                <div style="display:flex; justify-content:space-between; color:#64748b; font-size:12px;">
                  <span>$0 - ${{ priceRange[1] }}</span>
                </div>
              </a-card>
            </a-space>
          </a-col>

          <!-- Right content: map + list -->
          <a-col :xs="24" :lg="18">
            <!-- Map section at top of right column -->
            <div style="margin-bottom: 24px;">
              <MapSection :markers="homeMarkers" height="360px" :focus-id="focusId" :route-on-click="true" @marker-click="focusAndScroll" />
            </div>
            <a-card :style="cardStyle" :body-style="{ padding: '28px' }">
              <div :style="cardHeaderStyle">
                <a-typography-title :level="3" :style="{ margin: 0, color: '#1f2937', fontWeight: 700 }">Nearby Cafeterias</a-typography-title>
                <a-space>
                  <a-button size="middle" :style="pillBtnBlue" @click="openNow = !openNow">Opening</a-button>
                  <a-button size="middle" :style="pillBtnGold" @click="toggleSort">Sort by Rating</a-button>
                </a-space>
              </div>

              <a-row :gutter="[28, 28]">
                <a-col v-for="cafeteria in filteredCards" :key="cafeteria.id" :xs="24" :md="12" :ref="el => setCardRef(cafeteria.id, el)">
                  <CafeteriaCard :cafeteria="cafeteria" @hover="onHover" @leave="onLeave" />
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
import CafeteriaCard from '@/components/CafeteriaCard.vue'
import { useCafeteriaStore } from '@/stores/cafeteria'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

const cardStyle = { borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.03)' }
const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' }
const footerStyle = { textAlign: 'center', background: '#000000', padding: '32px 24px', marginTop: '40px' }
const pillBtnBlue = { background: 'rgba(102, 126, 234, 0.1)', borderColor: 'rgba(102, 126, 234, 0.2)', color: '#667eea', fontWeight: 500 }
const pillBtnGold = { background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)', color: '#f7931e', fontWeight: 500 }

const cafeteriaStore = useCafeteriaStore()
const { cafeterias, loading, error } = storeToRefs(cafeteriaStore)

// Filter state
const openNow = ref(false)
// NOTE: Filtering by distance, price, rating, and cuisine is temporarily disabled
// as the backend data structure has changed. These features can be re-implemented later.

// Filtering
const filtered = computed(() => {
  // Basic filtering for now
  return cafeterias.value.filter(c => {
    // A simple check for 'open' status can be implemented if the API provides it.
    // For now, we just return the list.
    return true
  })
})

const mapToCard = (c) => ({
  id: c.id,
  name: c.name,
  school: c.location, // Use 'location' from backend
  rating: 0, // Placeholder
  reviews: 0, // Placeholder
  distance: 'N/A', // Placeholder
  image: c.imageUrl, // Use 'imageUrl' from backend
  merchants: [], // This can be populated later
  cuisines: [], // This can be populated later
  isOpen: true, // Placeholder, needs logic based on opening hours
  hours: c.termTimeOpeningHours // Use 'termTimeOpeningHours'
})

const filteredCards = computed(() => filtered.value.map(mapToCard))
const homeMarkers = computed(() => filtered.value.map(c => ({ id: c.id, lat: c.lat, lng: c.lng, label: c.name })))

// Map <-> List linking
const focusId = ref(null)
const onHover = (id) => { focusId.value = id }
const onLeave = () => { focusId.value = null }

const cardRefs = new Map()
const setCardRef = (id, el) => { if (el) cardRefs.set(id, el) }
const focusAndScroll = (m) => {
  focusId.value = m.id
  const el = cardRefs.get(m.id)
  if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Handlers
const toggleSort = () => { /* Sorting logic to be re-implemented */ }

// URL sync
const route = useRoute()
const router = useRouter()

onMounted(() => {
  cafeteriaStore.fetchCafeterias()
  // Logic to sync with URL params can be re-added here later
})

// Watcher for URL sync can be re-added here later
</script>

<style scoped>
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
</style>
