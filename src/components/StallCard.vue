<template>
  <a-card
    :style="cardStyle"
    :body-style="{ padding: '16px' }"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
    :class="{ 'card-hover': hover }"
    @click="goDetail"
  >
    <div :style="imageBox">
      <img
        :src="imageUrl"
        :style="imageStyle"
        @error="handleImageError"
        alt="Stall image"
      />
      <a-tag :color="stall.isOpen ? 'green' : 'default'" :style="openTag">{{ stall.isOpen ? 'Open' : 'Closed' }}</a-tag>
      <a-tag color="default" :style="distanceTag">⟂ {{ stall.distance || '0.8 km' }}</a-tag>
    </div>

    <div style="margin-top: 12px;">
      <a-typography-title :level="4" style="margin: 0 0 8px 0;">{{ stall.name }}</a-typography-title>

      <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center; min-height: 24px;">
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <a-tag v-if="stall.cuisine">{{ stall.cuisine }}</a-tag>
          <a-tag v-if="stall.halal" color="green">Halal</a-tag>
        </div>
        <a-tag v-if="stall.cafeteriaName" color="blue" style="flex-shrink: 0;">{{ stall.cafeteriaName }}</a-tag>
      </div>

      <div style="margin-top: 10px; display:flex; align-items:center;">
        <a-rate :value="stall.rating || 0" disabled style="font-size:14px; margin-right:6px" />
        <strong style="color:#f7931e;">{{ stall.rating || 0 }}</strong>
        <a-typography-text type="secondary" style="margin-left:8px">· {{ stall.reviews || 0 }} reviews</a-typography-text>
      </div>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  stall: { type: Object, required: true }
})

const emit = defineEmits(['hover', 'leave'])
const hover = ref(false)
const imageFailed = ref(false)

// 默认图片URL
const defaultImage = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop'

// 计算最终使用的图片URL
const imageUrl = computed(() => {
  if (imageFailed.value) {
    return defaultImage
  }

  // 如果图片URL是Facebook链接，直接使用默认图片（避免403错误）
  const url = props.stall.image || defaultImage
  if (url.includes('facebook.com') || url.includes('fbcdn.net')) {
    return defaultImage
  }

  return url
})

// 处理图片加载失败
const handleImageError = (e) => {
  console.log('图片加载失败:', props.stall.image)
  imageFailed.value = true
  e.target.src = defaultImage
}

const router = useRouter()
const goDetail = () => router.push({ name: 'StallDetail', params: { id: props.stall.id } })

const handleEnter = () => { hover.value = true; emit('hover', props.stall.id) }
const handleLeave = () => { hover.value = false; emit('leave') }

const cardStyle = { borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s ease' }
const imageBox = { position: 'relative', height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' }
const openTag = { position: 'absolute', top: '8px', right: '8px' }
const distanceTag = { position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }
</script>

<style scoped>
.card-hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
</style>