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
      <div :style="imageStyle"></div>
      <a-tag :color="cafeteria.isOpen ? 'green' : 'default'" :style="openTag">{{ cafeteria.isOpen ? 'Open' : 'Closed' }}</a-tag>
      <a-tag color="default" :style="distanceTag">⟂ {{ cafeteria.distance }}</a-tag>
    </div>

    <div style="margin-top: 12px;">
      <a-typography-title :level="4" style="margin: 0 0 4px 0;">{{ cafeteria.name }}</a-typography-title>
      <a-typography-text type="secondary">{{ cafeteria.school }}</a-typography-text>

      <div style="margin-top: 8px;">
        <a-space size="small">
          <a-typography-text type="secondary">{{ cafeteria.hours || '6:00 AM - 6:00 PM' }}</a-typography-text>
        </a-space>
      </div>

      <div style="margin-top: 8px;">
        <a-space wrap>
          <a-tag v-for="(c, i) in cafeteria.cuisines || []" :key="i">{{ c }}</a-tag>
        </a-space>
      </div>

      <div style="margin-top: 10px; display:flex; align-items:center;">
        <a-rate :value="cafeteria.rating" disabled style="font-size:14px; margin-right:6px" />
        <strong style="color:#f7931e;">{{ cafeteria.rating }}</strong>
        <a-typography-text type="secondary" style="margin-left:8px">· {{ cafeteria.reviews }} reviews</a-typography-text>
      </div>

      <a-typography-text v-if="!hasMerchants" type="secondary" style="display:block; margin-top:8px;">No stalls listed</a-typography-text>
    </div>
  </a-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  cafeteria: { type: Object, required: true }
})

const emit = defineEmits(['hover', 'leave'])
const hover = ref(false)
const hasMerchants = computed(() => Array.isArray(props.cafeteria.merchants) && props.cafeteria.merchants.length > 0)

const router = useRouter()
const goDetail = () => router.push({ name: 'CafeteriaDetail', params: { id: props.cafeteria.id } })

const handleEnter = () => { hover.value = true; emit('hover', props.cafeteria.id) }
const handleLeave = () => { hover.value = false; emit('leave') }

const cardStyle = { borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s ease' }
const imageBox = { position: 'relative', height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9' }
const imageStyle = { position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: `url(${(props.cafeteria.image)})` }
const openTag = { position: 'absolute', top: '8px', right: '8px' }
const distanceTag = { position: 'absolute', bottom: '8px', left: '8px' }
</script>

<style scoped>
.card-hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
</style>
