<template>
  <a-card class="cafeteria-card" :body-style="{ padding: 'var(--space-sm)' }">
    <a-row :gutter="[16, 16]">
      <!-- 图片区域 -->
      <a-col :span="8">
        <div class="cafeteria-image" :style="{ backgroundImage: `url(${cafeteria.image})` }" />
      </a-col>

      <!-- 内容区域 -->
      <a-col :span="16">
        <div class="cafeteria-info">
          <a-typography-title :level="5" class="cafeteria-name">
            {{ cafeteria.name }}
          </a-typography-title>
          
          <a-typography-text class="cafeteria-meta">
            {{ cafeteria.school }} · {{ cafeteria.distance }}
          </a-typography-text>

          <!-- 评分和评价数 -->
          <div class="rating-section">
            <a-rate :value="cafeteria.rating" disabled class="rating-stars" />
            <a-typography-text strong class="rating-text">
              {{ cafeteria.rating }}
            </a-typography-text>
            <a-typography-text type="secondary" class="reviews-text">
              ({{ cafeteria.reviews }}条评价)
            </a-typography-text>
          </div>

          <!-- 商户列表 -->
          <a-space v-if="cafeteria.stalls && cafeteria.stalls.length" direction="vertical" :size="8" class="stalls-list">
            <div
              v-for="stall in cafeteria.stalls.slice(0, 2)"
              :key="stall.id"
              class="stall-item"
            >
              <div class="stall-info">
                <a-typography-text strong class="stall-name">
                  {{ stall.name }}
                </a-typography-text>
                <a-typography-text type="secondary" class="stall-cuisine">
                  {{ stall.cuisine }}
                </a-typography-text>
              </div>
              <div class="stall-details">
                <a-typography-text strong class="stall-rating">
                  {{ stall.rating }}
                </a-typography-text>
                <a-typography-text type="secondary" class="stall-price">
                  {{ stall.price }}
                </a-typography-text>
              </div>
            </div>
            
            <a-typography-text v-if="cafeteria.stalls.length > 2" class="more-stalls">
              还有{{ cafeteria.stalls.length - 2 }}家商户...
            </a-typography-text>
          </a-space>
        </div>
      </a-col>
    </a-row>
  </a-card>
</template>

<script setup>
defineProps({
  cafeteria: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.cafeteria-card {
  cursor: pointer;
}

.cafeteria-image {
  border-radius: var(--border-radius-md);
  height: 120px;
  background-size: cover;
  background-position: center;
}

.cafeteria-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.cafeteria-name {
  margin: 0 0 var(--space-xs) 0 !important;
  color: var(--text-color-primary) !important;
  font-weight: 600 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cafeteria-meta {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-bottom: var(--space-sm);
}

.rating-section {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-md);
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

.stalls-list {
  width: 100%;
}

.stall-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.stall-name {
  color: var(--text-color-primary);
}

.stall-cuisine {
  margin-left: var(--space-sm);
}

.stall-rating {
  color: var(--secondary-color);
  margin-right: var(--space-sm);
}

.more-stalls {
  font-size: 11px;
  color: var(--text-color-secondary);
}
</style>