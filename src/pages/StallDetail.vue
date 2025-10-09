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

              <!-- 图片展示 - 使用新的 ImageGallery 组件 -->
              <ImageGallery
                :images="displayImages"
                :columns="3"
                item-height="180px"
                :max-display="6"
                show-load-more
                use-thumbnail
                empty-text="暂无照片，快来分享第一张吧！"
              />
            </a-card>

            <!-- Menu 模块 -->
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

              <!-- 菜单图片展示 - 使用 ImageGallery 组件 -->
              <ImageGallery
                :images="menuImages"
                :columns="3"
                item-height="180px"
                :max-display="6"
                show-load-more
                use-thumbnail
                empty-text="暂无菜单图片，快来分享第一张吧！"
              />
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

    <!-- 摊位图片上传对话框 -->
    <ImageUploadDialog
      v-model:open="uploadDialogVisible"
      title="上传摊位图片"
      :max-count="9"
      main-text="点击或拖拽上传图片"
      sub-text="支持 JPG、PNG、GIF、WebP 格式，最多9张"
      tip="提示：图片将自动压缩优化，上传前可以预览和删除"
      @confirm="handleUploadConfirm"
    />

    <!-- 菜单图片上传对话框 -->
    <ImageUploadDialog
      v-model:open="menuUploadDialogVisible"
      title="上传菜单图片"
      :max-count="9"
      main-text="点击或拖拽上传菜单图片"
      sub-text="支持 JPG、PNG、GIF、WebP 格式，最多9张"
      tip="提示：图片将自动压缩优化，上传前可以预览和删除"
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
import { UploadOutlined } from '@ant-design/icons-vue'
import Header from '@/components/Header.vue'
import ReviewCard from '@/components/ReviewCard.vue'
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
const { currentStall: stall, reviews, loading, error } = storeToRefs(stallStore)
const { userId, isAuthenticated } = storeToRefs(userStore)

// 图片相关状态
const uploadDialogVisible = ref(false)
const menuUploadDialogVisible = ref(false)
const isFavorite = ref(false)

// 显示的图片列表（转换为 ImageGallery 需要的格式）
// 普通照片（PHOTO类型）
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

// 菜单图片（MENU类型）
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

// 为了兼容旧代码，保留displayImages（指向photoImages）
const displayImages = photoImages

onMounted(async () => {
  const stallId = route.params.id
  stallStore.fetchStallById(stallId)
  stallStore.fetchReviewsByStallId(stallId)

  // 检查是否已收藏（仅当用户已登录时）
  if (isAuthenticated.value && userId.value) {
    try {
      isFavorite.value = await favoriteService.checkFavorite(userId.value, stallId)
    } catch (error) {
      console.error('Failed to check favorite status', error)
    }
  }
})

const goBack = () => router.back()

// 收藏功能
const toggleFavorite = async () => {
  // 检查用户是否已登录
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

// 显示上传对话框
const showUploadDialog = () => {
  uploadDialogVisible.value = true
}

// 显示菜单上传对话框
const showMenuUploadDialog = () => {
  menuUploadDialogVisible.value = true
}

// 图片上传确认处理
const handleUploadConfirm = async (result) => {
  console.log('上传结果:', result)

  try {
    // 调用关联接口，将图片关联到摊位（PHOTO类型）
    await imageService.linkImagesToStall(
      route.params.id,
      result.imageUrls,
      result.thumbnailUrls,
      'PHOTO'
    )

    message.success('图片已成功关联到摊位！')

    // 重新加载摊位数据以更新图片列表
    await stallStore.fetchStallById(route.params.id)

  } catch (error) {
    console.error('关联图片失败:', error)
    message.error('关联图片失败，请重试')
  }
}

// 菜单图片上传确认处理
const handleMenuUploadConfirm = async (result) => {
  console.log('上传菜单图片结果:', result)

  try {
    // 调用关联接口，将菜单图片关联到摊位（MENU类型）
    await imageService.linkMenuImagesToStall(
      route.params.id,
      result.imageUrls,
      result.thumbnailUrls
    )

    message.success('菜单图片已成功关联到摊位！')

    // 重新加载摊位数据以更新图片列表
    await stallStore.fetchStallById(route.params.id)

  } catch (error) {
    console.error('关联菜单图片失败:', error)
    message.error('关联菜单图片失败，请重试')
  }
}

// 图片点击处理由 ImageGallery 组件自动处理，会打开 ImageViewer

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
