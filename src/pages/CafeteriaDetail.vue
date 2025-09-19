<template>
  <a-layout style="min-height: 100vh; background: #f8fafc;">
    <Header />

    <a-layout-content style="padding: 96px 24px 24px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <a-button type="link" @click="goBack" style="padding-left: 0">← Back to Map</a-button>

        <div v-if="loading">Loading...</div>
        <div v-if="error">Error: {{ error }}</div>

        <a-row v-if="cafeteria" :gutter="[24, 24]">
          <!-- Left: Photos & Info -->
          <a-col :xs="24" :lg="14">
            <a-card :body-style="{ padding: '16px' }" :style="cardStyle">
              <template #title>
                <a-space>
                  <a-tag color="blue-inverse">PHOTOS & INFO</a-tag>
                </a-space>
              </template>

              <div
                :style="{
                  borderRadius: '12px',
                  height: '320px',
                  backgroundImage: `url(${cafeteria.imageUrl || 'default-image.jpg'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }"
              >
                <!-- isOpen status is not available from backend yet -->
                <a-tag color="green" style="position:absolute; top: 12px; right: 12px">Open Now</a-tag>
              </div>

              <div style="padding: 16px 8px 0 8px;">
                <a-typography-title :level="4" style="margin: 0;">{{ cafeteria.name }}</a-typography-title>
                <a-space style="margin-top: 8px;" wrap>
                  <a-typography-text type="secondary">
                    <template #default>
                      <span style="margin-right:12px;">{{ cafeteria.termTimeOpeningHours }}</span>
                      <!-- distanceKm, rating, reviews are not available from backend yet -->
                      <span style="margin-right:12px;">⟂ 1.0 km</span>
                      <a-rate :value="4.5" disabled style="font-size: 14px; margin-right:6px"/>
                      <strong style="color:#f7931e">4.5</strong>
                      <span style="color:#64748b"> · 50 reviews</span>
                    </template>
                  </a-typography-text>
                </a-space>
                <div style="margin-top:8px;">
                  <a-space>
                    <!-- cuisines are not available from backend yet -->
                    <a-tag>Various</a-tag>
                  </a-space>
                </div>
              </div>
            </a-card>

            <a-card :style="cardStyle" style="margin-top: 16px;" :body-style="{ padding: '16px' }">
              <a-typography-title :level="5" style="margin-top:0">Photos from Visitors</a-typography-title>
              <a-typography-text type="secondary">Scroll to see more photos</a-typography-text>
            </a-card>
          </a-col>

          <!-- Right: Details & reviews -->
          <a-col :xs="24" :lg="10">
            <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
              <template #title>
                <a-space>
                  <a-tag color="purple-inverse">DETAILS & REVIEWS</a-tag>
                </a-space>
              </template>

              <a-typography-title :level="5">Location</a-typography-title>
              <MapSection :markers="[{ lat: cafeteria.latitude, lng: cafeteria.longitude, label: cafeteria.name }]" height="220px" />
            </a-card>

            <a-card :style="cardStyle" style="margin-top: 16px;" :body-style="{ padding: '16px' }">
              <a-typography-title :level="5">Food Stalls</a-typography-title>
              <a-list :data-source="cafeteria.stalls" item-layout="horizontal">
                <template #renderItem="{ item }">
                  <a-list-item :style="{ padding: '12px 0' }" @click="goStall(item.id)">
                    <a-list-item-meta>
                      <template #avatar>
                        <a-avatar :src="item.imageUrl" shape="square" :size="64" />
                      </template>
                      <template #title>
                        <a-typography-text strong>{{ item.name }}</a-typography-text>
                      </template>
                      <template #description>
                        <a-space>
                          <a-tag>{{ item.cuisineType }}</a-tag>
                          <!-- rating and reviews are not available from backend yet -->
                          <a-rate :value="4.2" disabled style="font-size: 12px"/>
                          <a-typography-text strong style="color:#f7931e">4.2</a-typography-text>
                          <a-typography-text type="secondary">· 30 reviews</a-typography-text>
                        </a-space>
                      </template>
                    </a-list-item-meta>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-layout-content>
  </a-layout>
  
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCafeteriaStore } from '@/stores/cafeteria'
import { storeToRefs } from 'pinia'
import Header from '@/components/Header.vue'
import MapSection from '@/components/MapSection.vue'

const route = useRoute()
const router = useRouter()
const cafeteriaStore = useCafeteriaStore()
const { currentCafeteria: cafeteria, loading, error } = storeToRefs(cafeteriaStore)

onMounted(() => {
  cafeteriaStore.fetchCafeteriaById(route.params.id)
})

const goBack = () => router.back()
const goStall = (id) => router.push({ name: 'StallDetail', params: { id } })

const cardStyle = {
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.03)'
}

// Map handled by MapSection
</script>
