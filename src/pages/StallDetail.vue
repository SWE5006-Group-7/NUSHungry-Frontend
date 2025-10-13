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
                <!-- Real rating -->
                <a-tag v-if="stall.averageRating" color="gold" style="position:absolute; top: 12px; right: 12px">
                  {{ stall.averageRating.toFixed(1) }}
                </a-tag>
              </div>

              <div style="padding: 16px 8px 0 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <a-typography-title :level="4" style="margin: 0;">{{ stall.name }}</a-typography-title>
                  <a-button
                    type="text"
                    @click="toggleFavorite"
                    :style="{
                      fontSize: '24px',
                      color: isFavorite ? '#fadb14' : '#d9d9d9',
                      padding: '4px 8px',
                      height: 'auto',
                      lineHeight: '1'
                    }"
                  >
                    {{ isFavorite ? '★' : '☆' }}
                  </a-button>
                </div>
                <a-space direction="vertical" size="small" style="margin-top: 8px;">
                  <a-typography-text type="secondary">7:00 AM - 9:00 PM</a-typography-text>
                  <a-space>
                    <a-tag>{{ stall.cuisineType }}</a-tag>
                  </a-space>
                  <a-space>
                    <!-- Real rating and review count -->
                    <a-typography-text strong style="color:#f7931e">
                      {{ stall.averageRating ? stall.averageRating.toFixed(1) : 'No rating yet' }}
                    </a-typography-text>
                    <a-typography-text type="secondary">
                      · {{ stall.reviewCount || 0 }} reviews
                    </a-typography-text>
                  </a-space>
                  <a-typography-text type="secondary">
                    Average price: {{ stall.averagePrice && stall.averagePrice > 0 ? `~$${stall.averagePrice.toFixed(2)} per person` : 'No price info yet' }}
                  </a-typography-text>
                </a-space>
              </div>
            </a-card>

            <a-card :style="cardStyle" style="margin-top: 16px;" :body-style="{ padding: '16px' }">
              <template #title>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <a-typography-title :level="5" style="margin:0">Photos from Customers</a-typography-title>
                  <a-button
                    v-if="isAuthenticated"
                    type="primary"
                    size="small"
                    @click="showUploadDialog"
                  >
                    <template #icon><UploadOutlined /></template>
                    Upload Photos
                  </a-button>
                </div>
              </template>

              <ImageGallery
                :images="displayImages"
                :columns="3"
                item-height="180px"
                :max-display="6"
                show-load-more
                use-thumbnail
                empty-text="There are no photos yet, please share the first one!"
              />
            </a-card>

            <a-card :style="cardStyle" style="margin-top: 16px;" :body-style="{ padding: '16px' }">
              <template #title>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <a-typography-title :level="5" style="margin:0">Menu</a-typography-title>
                  <a-button
                    v-if="isAuthenticated"
                    type="primary"
                    size="small"
                    @click="showMenuUploadDialog"
                  >
                    <template #icon><UploadOutlined /></template>
                    Upload Menu
                  </a-button>
                </div>
              </template>

              <ImageGallery
                :images="menuImages"
                :columns="3"
                item-height="180px"
                :max-display="6"
                show-load-more
                use-thumbnail
                empty-text="There is no menu picture yet, please share the first one!"
              />
            </a-card>
          </a-col>

          <!-- Right: Location & Reviews -->
          <a-col :xs="24" :lg="10">
            <a-card :style="cardStyle" :body-style="{ padding: '16px' }">
              <template #title>
                <a-tag color="purple-inverse">LOCATION</a-tag>
              </template>

              <div v-if="locationInfo">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                  <a-typography-text> {{ locationInfo.name }} </a-typography-text>
                  <a-button type="primary" @click="openNavigation" size="small" style="border-radius: 6px;">
                    🧭 Navigate
                  </a-button>
                </div>
                <MapSection :markers="[locationInfo.marker]" height="200px" />
              </div>

              <!-- No location info -->
              <div v-else>
                <a-empty description="Location information not available" :image="null">
                  <template #description>
                    <a-typography-text type="secondary">No location data for this stall yet</a-typography-text>
                  </template>
                </a-empty>
              </div>
            </a-card>

            <!-- Review List Card -->
            <a-card :style="cardStyle" style="margin-top: 16px;" :body-style="{ padding: '16px' }">
              <template #title>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <a-tag color="orange-inverse">REVIEWS</a-tag>
                    <span v-if="reviewListRef?.total > 0" style="color: #64748b; font-size: 14px; font-weight: normal;">
                      ({{ reviewListRef?.total }})
                    </span>
                  </div>
                  <a-space>
                    <a-button
                      v-if="reviewListRef?.total > 0"
                      type="default"
                      size="small"
                      @click="viewAllReviews"
                    >
                      查看全部
                    </a-button>
                    <a-button
                      v-if="isAuthenticated"
                      type="primary"
                      size="small"
                      @click="handleWriteReview"
                    >
                      <template #icon><EditOutlined /></template>
                      Write Review
                    </a-button>
                  </a-space>
                </div>
              </template>

              <!-- Use ReviewList Component -->
              <ReviewList
                ref="reviewListRef"
                :stall-id="parseInt(route.params.id)"
                :show-write-button="false"
                :show-rating-stats="true"
                :average-rating="stall.averageRating || 0"
                @review-created="handleReviewCreated"
                @review-updated="handleReviewUpdated"
                @review-deleted="handleReviewDeleted"
              />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-layout-content>

    <!-- Stall Image Upload Dialog -->
    <ImageUploadDialog
      v-model:open="uploadDialogVisible"
      title="Upload Stall Photos"
      :max-count="9"
      main-text="Click or drag to upload photos"
      sub-text="Supports JPG, PNG, GIF, WebP formats, up to 9 images"
      tip="Tip: Images will be automatically compressed and optimized. You can preview and delete them before uploading."
      @confirm="handleUploadConfirm"
    />

    <!-- Menu Image Upload Dialog -->
    <ImageUploadDialog
      v-model:open="menuUploadDialogVisible"
      title="Upload Menu Photos"
      :max-count="9"
      main-text="Click or drag to upload menu photos"
      sub-text="Supports JPG, PNG, GIF, WebP formats, up to 9 images"
      tip="Tip: Images will be automatically compressed and optimized. You can preview and delete them before uploading."
      @confirm="handleMenuUploadConfirm"
    />
  </a-layout>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStallStore } from '@/stores/stall'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { UploadOutlined, EditOutlined } from '@ant-design/icons-vue'
import Header from '@/components/Header.vue'
import ReviewList from '@/components/ReviewList.vue'
import MapSection from '@/components/MapSection.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import ImageUploadDialog from '@/components/ImageUploadDialog.vue'
import { favoriteService } from '@/services/favoriteService'
import { imageService } from '@/services/imageService'
import { getResourceUrl } from '@/utils/config'

const route = useRoute()
const router = useRouter()
const stallStore = useStallStore()
const userStore = useUserStore()
const { currentStall: stall, loading, error } = storeToRefs(stallStore)
const { userId, isAuthenticated } = storeToRefs(userStore)

// Image related state
const uploadDialogVisible = ref(false)
const menuUploadDialogVisible = ref(false)
const isFavorite = ref(false)

// Review list reference
const reviewListRef = ref(null)

// Displayed image list (converted to the format required by ImageGallery)
// Normal photos (PHOTO type)
const photoImages = computed(() => {
  if (!stall.value?.images) return []
  return stall.value.images
    .filter(img => !img.type || img.type === 'PHOTO')
    .map(img => ({
      id: img.id,
      url: getResourceUrl(img.imageUrl),
      thumbnailUrl: img.thumbnailUrl ? getResourceUrl(img.thumbnailUrl) : null
    }))
})

// Menu images (MENU type)
const menuImages = computed(() => {
  if (!stall.value?.images) return []
  return stall.value.images
    .filter(img => img.type === 'MENU')
    .map(img => ({
      id: img.id,
      url: getResourceUrl(img.imageUrl),
      thumbnailUrl: img.thumbnailUrl ? getResourceUrl(img.thumbnailUrl) : null
    }))
})

// For compatibility with old code, keep displayImages (points to photoImages)
const displayImages = photoImages

// Location info computed property (supports both cafeteria and standalone stall)
const locationInfo = computed(() => {
  if (!stall.value) return null

  // Priority 1: If stall belongs to a cafeteria
  if (stall.value.cafeteria && stall.value.cafeteria.latitude && stall.value.cafeteria.longitude) {
    return {
      name: stall.value.cafeteria.name,
      latitude: stall.value.cafeteria.latitude,
      longitude: stall.value.cafeteria.longitude,
      marker: {
        lat: stall.value.cafeteria.latitude,
        lng: stall.value.cafeteria.longitude,
        label: stall.value.cafeteria.name,
        type: 'cafeteria'
      }
    }
  }

  // Priority 2: If stall has its own coordinates (standalone stall)
  if (stall.value.latitude && stall.value.longitude) {
    return {
      name: stall.value.name,
      latitude: stall.value.latitude,
      longitude: stall.value.longitude,
      marker: {
        lat: stall.value.latitude,
        lng: stall.value.longitude,
        label: stall.value.name,
        type: 'stall'
      }
    }
  }

  return null
})

onMounted(async () => {
  const stallId = route.params.id
  await stallStore.fetchStallById(stallId)

  // Check if it's a favorite (only when user is logged in)
  if (isAuthenticated.value && userId.value) {
    try {
      isFavorite.value = await favoriteService.checkFavorite(userId.value, stallId)
    } catch (error) {
      console.error('Failed to check favorite status', error)
    }
  }
})

const goBack = () => router.back()

// Favorite function
const toggleFavorite = async () => {
  if (!isAuthenticated.value || !userId.value) {
    message.warning('Please login to add favorites')
    router.push('/login')
    return
  }

  try {
    if (isFavorite.value) {
      await favoriteService.removeFavorite(userId.value, route.params.id)
      message.success('Removed from favorites')
      isFavorite.value = false
    } else {
      await favoriteService.addFavorite(userId.value, route.params.id)
      message.success('Added to favorites')
      isFavorite.value = true
    }
  } catch (error) {
    message.error('Failed to update favorite status')
    console.error(error)
  }
}

// Show upload dialog
const showUploadDialog = () => {
  uploadDialogVisible.value = true
}

// Show menu upload dialog
const showMenuUploadDialog = () => {
  menuUploadDialogVisible.value = true
}

// Image upload confirmation handler
const handleUploadConfirm = async (result) => {
  try {
    await imageService.linkImagesToStall(
      route.params.id,
      result.imageUrls,
      result.thumbnailUrls,
      'PHOTO'
    )
    message.success('Images have been successfully linked to the stall!')
    await stallStore.fetchStallById(route.params.id)
  } catch (error) {
    console.error('Failed to link images:', error)
    message.error('Failed to link images, please try again')
  }
}

// Menu image upload confirmation handler
const handleMenuUploadConfirm = async (result) => {
  try {
    await imageService.linkMenuImagesToStall(
      route.params.id,
      result.imageUrls,
      result.thumbnailUrls
    )
    message.success('Menu images have been successfully linked to the stall!')
    await stallStore.fetchStallById(route.params.id)
  } catch (error) {
    console.error('Failed to link menu images:', error)
    message.error('Failed to link menu images, please try again')
  }
}

// Handle review created/updated/deleted events
const handleReviewCreated = async () => {
  // Reload stall info to update rating stats
  await stallStore.fetchStallById(route.params.id)
}

const handleReviewUpdated = async () => {
  await stallStore.fetchStallById(route.params.id)
}

const handleReviewDeleted = async () => {
  await stallStore.fetchStallById(route.params.id)
}

// Handle write review button click
const handleWriteReview = () => {
  if (reviewListRef.value) {
    reviewListRef.value.handleWriteReview()
  }
}

// Navigation function
const openNavigation = () => {
  if (!locationInfo.value) return

  const lat = locationInfo.value.latitude
  const lng = locationInfo.value.longitude
  const label = encodeURIComponent(locationInfo.value.name)

  const userAgent = navigator.userAgent || navigator.vendor || window.opera

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    window.open(`maps://maps.apple.com/?q=${label}&ll=${lat},${lng}`)
  }
  else if (/android/i.test(userAgent)) {
    window.open(`geo:${lat},${lng}?q=${lat},${lng}(${label})`)
  }
  else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank')
  }
}

// View all reviews
const viewAllReviews = () => {
  router.push({
    name: 'AllReviews',
    params: { stallId: route.params.id }
  })
}

const cardStyle = {
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.03)'
}
</script>
