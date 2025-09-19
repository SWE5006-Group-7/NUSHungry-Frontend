<template>
  <a-layout style="min-height: 100vh; background: #f8fafc;">
    <Header />

    <a-layout-content style="padding: 96px 24px 24px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <a-button type="link" @click="goBack" style="padding-left: 0">← Back</a-button>

        <a-row :gutter="[24,24]">
          <!-- Left: Photos & Info -->
          <a-col :xs="24" :lg="14">
            <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
              <template #title>
                <a-tag color="blue-inverse">PHOTOS & INFO</a-tag>
              </template>

              <div
                :style="{
                  borderRadius: '12px',
                  height: '320px',
                  backgroundImage: `url(${stall.hero})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }"
              >
                <a-tag color="gold" style="position:absolute; top: 12px; right: 12px">{{ stall.rating }}</a-tag>
              </div>

              <div style="padding: 16px 8px 0 8px;">
                <a-typography-title :level="4" style="margin: 0;">{{ stall.name }}</a-typography-title>
                <a-space direction="vertical" size="small">
                  <a-typography-text type="secondary">7:00 AM - 9:00 PM</a-typography-text>
                  <a-space>
                    <a-tag>{{ stall.cuisine }}</a-tag>
                  </a-space>
                  <a-space>
                    <a-typography-text strong style="color:#f7931e">{{ stall.rating }}</a-typography-text>
                    <a-typography-text type="secondary">· {{ stall.reviews }} reviews</a-typography-text>
                  </a-space>
                  <a-typography-text type="secondary">Average price: {{ stall.avgPrice }}</a-typography-text>
                </a-space>
              </div>
            </a-card>

            <a-card :style="cardStyle" style="margin-top: 16px;" :body-style="{ padding: '16px' }">
              <a-typography-title :level="5" style="margin-top:0">Photos from Customers</a-typography-title>
              <a-typography-text type="secondary">Scroll to see more photos</a-typography-text>
            </a-card>
          </a-col>

          <!-- Right: Menu & Reviews -->
          <a-col :xs="24" :lg="10">
            <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
              <template #title>
                <a-tag color="purple-inverse">MENU & REVIEWS</a-tag>
              </template>

              <a-typography-title :level="5">Location</a-typography-title>
              <a-card :style="{ borderRadius: '12px', marginBottom: '16px' }" :body-style="{ padding: '16px' }">
                <a-typography-text> {{ cafeteria.building }} - Central Food Court </a-typography-text>
                <div style="margin-top: 12px;">
                  <MapSection :markers="[{ lat: cafeteria.lat, lng: cafeteria.lng, label: stall.location }]" height="180px" />
                </div>
              </a-card>

              <a-typography-title :level="5" style="margin-bottom: 12px;">Menu</a-typography-title>
              <a-row :gutter="[12,12]">
                <a-col v-for="m in stall.menu" :key="m.id" :xs="24" :sm="12">
                  <div :style="menuItemStyle">
                    <div :style="menuImgStyle(m.image)"></div>
                    <div style="padding: 8px 12px; display:flex; justify-content:space-between; align-items:center;">
                      <div>
                        <a-typography-text strong>{{ m.name }}</a-typography-text>
                        <div v-if="m.soldOut" style="color:#64748b; font-size:12px">Sold Out</div>
                      </div>
                      <a-typography-text strong style="color:#111827">${{ m.price }}</a-typography-text>
                    </div>
                  </div>
                </a-col>
              </a-row>

              <div style="margin-top: 16px;">
                <a-typography-title :level="5" style="margin-bottom: 8px;">Reviews ({{ reviews.length }})</a-typography-title>
                <ReviewCard v-for="r in reviews" :key="r.id" :review="r" />
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import MapSection from '@/components/MapSection.vue'
import { getStallById, getCafeteriaById, getReviewsByStallId } from '@/mock/data'

const route = useRoute()
const router = useRouter()

const stall = computed(() => getStallById(route.params.id))
const cafeteria = computed(() => getCafeteriaById(stall.value?.cafeteriaId))
const reviews = computed(() => getReviewsByStallId(route.params.id))

const goBack = () => router.back()

const cardStyle = {
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.03)'
}

// Map handled by MapSection

const menuItemStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.04)'
}

const menuImgStyle = (url) => ({
  height: '120px',
  backgroundImage: `url(${url})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
})
</script>
