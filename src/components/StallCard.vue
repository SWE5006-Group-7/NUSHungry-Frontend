<template>
  <a-card class="stall-card" :body-style="{ padding: 0 }">
    <div class="stall-image" :style="{ backgroundImage: `url(${stall.image})` }">
      <div class="stall-status" v-if="stall.isOpen">营业中</div>
    </div>
    <div class="stall-info">
      <a-typography-title :level="5" class="stall-name">
        {{ stall.name }}
      </a-typography-title>
      <a-typography-text class="stall-cuisine">
        {{ stall.cuisine }}
      </a-typography-text>
      <div class="rating-section">
        <a-rate :value="stall.rating" disabled class="rating-stars" />
        <a-typography-text strong class="rating-text">
          {{ stall.rating }}
        </a-typography-text>
        <a-typography-text type="secondary" class="reviews-text">
          ({{ stall.reviews }}条)
        </a-typography-text>
      </div>
    </div>
  </a-card>
</template>

<script setup>
defineProps({
  stall: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.stall-card {
  cursor: pointer;
  overflow: hidden;
}

.stall-image {
  height: 140px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.stall-status {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 2px var(--space-sm);
  border-radius: var(--border-radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.stall-info {
  padding: var(--space-md);
}

.stall-name {
  margin: 0 0 var(--space-xs) 0 !important;
  color: var(--text-color-primary) !important;
  font-weight: 600 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stall-cuisine {
  font-size: 13px;
  color: var(--text-color-secondary);
  display: block;
  margin-bottom: var(--space-sm);
}

.rating-section {
  display: flex;
  align-items: center;
}

.rating-stars {
  font-size: 14px !important;
  margin-right: var(--space-sm);
}

.rating-text {
  color: var(--secondary-color);
  font-size: 14px;
}

.reviews-text {
  font-size: 12px;
  margin-left: var(--space-sm);
}
</style>