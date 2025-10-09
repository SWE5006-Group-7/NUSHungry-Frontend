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
              <template #title>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <a-typography-title :level="5" style="margin:0">Photos from Visitors</a-typography-title>
                  <a-button
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
                :columns="4"
                item-height="200px"
                :max-display="8"
                show-load-more
                use-thumbnail
                empty-text="暂无照片，快来分享第一张吧！"
              />
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

              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <a-typography-title :level="5" style="margin: 0;">Location</a-typography-title>
                <a-button type="primary" @click="openNavigation" size="small" style="border-radius: 6px;">
                  🧭 Navigate
                </a-button>
              </div>
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

    <!-- 图片上传对话框 -->
    <ImageUploadDialog
      v-model:open="uploadDialogVisible"
      title="上传食堂图片"
      :max-count="9"
      main-text="点击或拖拽上传图片"
      sub-text="支持 JPG、PNG、GIF、WebP 格式，最多9张"
      tip="提示：图片将自动压缩优化，上传前可以预览和删除"
      @confirm="handleUploadConfirm"
    />
  </a-layout>

</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCafeteriaStore } from '@/stores/cafeteria'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import Header from '@/components/Header.vue'
import MapSection from '@/components/MapSection.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import ImageUploadDialog from '@/components/ImageUploadDialog.vue'
import { imageService } from '@/services/imageService'
import { getResourceUrl } from '@/utils/config'

const route = useRoute()
const router = useRouter()
const cafeteriaStore = useCafeteriaStore()
const { currentCafeteria: cafeteria, loading, error } = storeToRefs(cafeteriaStore)

// 图片相关状态
const uploadDialogVisible = ref(false)

// 显示的图片列表（转换为 ImageGallery 需要的格式）
const displayImages = computed(() => {
  if (!cafeteria.value?.images) return []
  return cafeteria.value.images.map(img => ({
    id: img.id,
    url: getResourceUrl(img.imageUrl),
    thumbnailUrl: img.thumbnailUrl ? getResourceUrl(img.thumbnailUrl) : null
  }))
})

onMounted(() => {
  cafeteriaStore.fetchCafeteriaById(route.params.id)
})

const goBack = () => router.back()
const goStall = (id) => router.push({ name: 'StallDetail', params: { id } })

// 显示上传对话框
const showUploadDialog = () => {
  uploadDialogVisible.value = true
}

// 图片上传确认处理
const handleUploadConfirm = async (result) => {
  console.log('上传结果:', result)

  try {
    // 调用关联接口，将图片关联到食堂
    await imageService.linkImagesToCafeteria(
      route.params.id,
      result.imageUrls,
      result.thumbnailUrls
    )

    message.success('图片已成功关联到食堂！')

    // 重新加载食堂数据以更新图片列表
    await cafeteriaStore.fetchCafeteriaById(route.params.id)

  } catch (error) {
    console.error('关联图片失败:', error)
    message.error('关联图片失败，请重试')
  }
}

// 图片点击处理由 ImageGallery 组件自动处理，会打开 ImageViewer

// 导航功能
const openNavigation = () => {
  if (!cafeteria.value) return

  const lat = cafeteria.value.latitude
  const lng = cafeteria.value.longitude
  const label = encodeURIComponent(cafeteria.value.name)

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
</script>
