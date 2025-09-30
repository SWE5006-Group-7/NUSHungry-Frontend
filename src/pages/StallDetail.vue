<template>
  <a-layout style="min-height: 100vh; background: #f8fafc;">
    <Header />

    <a-layout-content style="padding: 96px 24px 24px;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <a-button type="link" @click="goBack" style="padding-left: 0">← Back</a-button>

        <div v-if="loading">Loading...</div>
        <div v-if="error">Error: {{ error }}</div>

        <a-row v-if="stall" :gutter="[24,24]">
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
                  backgroundImage: `url(${stall.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }"
              >
                <!-- Rating from mock data -->
                <a-tag color="gold" style="position:absolute; top: 12px; right: 12px">4.5</a-tag>
              </div>

              <div style="padding: 16px 8px 0 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <a-typography-title :level="4" style="margin: 0;">{{ stall.name }}</a-typography-title>
                  <a-button
                    :type="isFavorite ? 'primary' : 'default'"
                    :icon="isFavorite ? '❤️' : '🤍'"
                    @click="toggleFavorite"
                    style="border-radius: 8px;"
                  >
                    {{ isFavorite ? 'Favorited' : 'Add to Favorites' }}
                  </a-button>
                </div>
                <a-space direction="vertical" size="small" style="margin-top: 8px;">
                  <!-- Opening hours not in Stall model -->
                  <a-typography-text type="secondary">7:00 AM - 9:00 PM</a-typography-text>
                  <a-space>
                    <a-tag>{{ stall.cuisineType }}</a-tag>
                  </a-space>
                  <a-space>
                    <!-- Rating and reviews count from mock data -->
                    <a-typography-text strong style="color:#f7931e">4.5</a-typography-text>
                    <a-typography-text type="secondary">· {{ reviews.length }} reviews</a-typography-text>
                  </a-space>
                  <!-- Avg price not in Stall model -->
                  <a-typography-text type="secondary">Average price: $10-15</a-typography-text>
                </a-space>
              </div>
            </a-card>

            <a-card :style="cardStyle" style="margin-top: 16px;" :body-style="{ padding: '16px' }">
              <a-typography-title :level="5" style="margin-top:0">Photos from Customers</a-typography-title>

              <!-- 图片上传 -->
              <a-upload
                :before-upload="beforeUpload"
                :custom-request="handleUploadStallImage"
                :show-upload-list="false"
                accept="image/*"
              >
                <a-button type="primary" style="margin-bottom: 16px;">
                  <template #icon><UploadOutlined /></template>
                  Upload Photo
                </a-button>
              </a-upload>

              <!-- 图片展示 -->
              <div v-if="customerImages.length > 0" style="display: flex; gap: 12px; overflow-x: auto; padding: 8px 0;">
                <div
                  v-for="img in customerImages"
                  :key="img.id"
                  :style="{
                    minWidth: '150px',
                    height: '150px',
                    borderRadius: '8px',
                    backgroundImage: `url(http://localhost:8080${img.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer'
                  }"
                  @click="previewImage(img.imageUrl)"
                />
              </div>
              <a-typography-text v-else type="secondary">No photos yet. Be the first to share!</a-typography-text>
            </a-card>
          </a-col>

          <!-- Right: Menu & Reviews -->
          <a-col :xs="24" :lg="10">
            <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
              <template #title>
                <a-tag color="purple-inverse">MENU & REVIEWS</a-tag>
              </template>

              <div style="display: flex; justify-content: space-between; align-items: center;">
                <a-typography-title :level="5">Location</a-typography-title>
                <a-button v-if="stall.cafeteria" type="primary" @click="openNavigation" size="small" style="border-radius: 6px;">
                  🧭 Navigate
                </a-button>
              </div>
              <a-card v-if="stall.cafeteria" :style="{ borderRadius: '12px', marginBottom: '16px' }" :body-style="{ padding: '16px' }">
                <a-typography-text> {{ stall.cafeteria.name }} </a-typography-text>
                <div style="margin-top: 12px;">
                  <MapSection :markers="[{ lat: stall.cafeteria.latitude, lng: stall.cafeteria.longitude, label: stall.name }]" height="180px" />
                </div>
              </a-card>

              <a-typography-title :level="5" style="margin-bottom: 12px;">Menu</a-typography-title>
              <!-- Menu data is not available from backend -->
              <a-typography-text type="secondary">Menu information is not available at the moment.</a-typography-text>

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
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStallStore } from '@/stores/stall'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import Header from '@/components/Header.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import MapSection from '@/components/MapSection.vue'
import { imageService } from '@/services/imageService'
import { favoriteService } from '@/services/favoriteService'

const route = useRoute()
const router = useRouter()
const stallStore = useStallStore()
const { currentStall: stall, reviews, loading, error } = storeToRefs(stallStore)

const customerImages = computed(() => stall.value?.images || [])
const isFavorite = ref(false)

// 临时用户ID，实际应该从认证系统获取
const userId = 'guest-user-1'

onMounted(async () => {
  const stallId = route.params.id
  stallStore.fetchStallById(stallId)
  stallStore.fetchReviewsByStallId(stallId)

  // 检查是否已收藏
  try {
    isFavorite.value = await favoriteService.checkFavorite(userId, stallId)
  } catch (error) {
    console.error('Failed to check favorite status', error)
  }
})

const goBack = () => router.back()

// 收藏功能
const toggleFavorite = async () => {
  try {
    if (isFavorite.value) {
      await favoriteService.removeFavorite(userId, route.params.id)
      message.success('Removed from favorites')
      isFavorite.value = false
    } else {
      await favoriteService.addFavorite(userId, route.params.id)
      message.success('Added to favorites')
      isFavorite.value = true
    }
  } catch (error) {
    message.error('Failed to update favorite status')
    console.error(error)
  }
}

// 图片上传
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('You can only upload image files!')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('Image must be smaller than 5MB!')
    return false
  }
  return true
}

const handleUploadStallImage = async ({ file }) => {
  try {
    const userId = 'guest-' + Date.now()
    await imageService.uploadStallImage(route.params.id, file, userId)
    message.success('Image uploaded successfully!')
    stallStore.fetchStallById(route.params.id)
  } catch (error) {
    message.error('Failed to upload image')
    console.error(error)
  }
}

const previewImage = (imageUrl) => {
  window.open(`http://localhost:8080${imageUrl}`, '_blank')
}

// 导航功能
const openNavigation = () => {
  if (!stall.value?.cafeteria) return

  const lat = stall.value.cafeteria.latitude
  const lng = stall.value.cafeteria.longitude
  const label = encodeURIComponent(stall.value.cafeteria.name)

  // 检测用户设备/浏览器，打开相应的地图应用
  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  // iOS 设备
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    window.open(`maps://maps.apple.com/?q=${label}&ll=${lat},${lng}`)
  }
  // Android 设备
  else if (/android/i.test(userAgent)) {
    window.open(`geo:${lat},${lng}?q=${lat},${lng}(${label})`)
  }
  // 桌面端，使用 Google Maps
  else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }
}

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
