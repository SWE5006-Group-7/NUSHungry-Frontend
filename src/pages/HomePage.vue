<template>
  <a-layout class="home-page-layout">
    <Header />
    
    <a-layout-content class="home-page-content">
      <div class="content-wrapper">
        <!-- Map Area -->
        <section class="section">
          <a-typography-title :level="2" class="section-title">
            Discover Nearby Food
          </a-typography-title>
          <MapSection />
        </section>

        <!-- Canteen List -->
        <section class="section">
          <a-card class="stalls-card" :body-style="{ padding: 'var(--space-xl)' }">
            <div class="stalls-card-header">
              <a-typography-title :level="3" class="stalls-card-title">
                Nearby Stalls
              </a-typography-title>
              <a-space>
                <a-button class="filter-button filter-button--status">
                  <template #icon><ClockCircleOutlined /></template>
                  Open Now
                </a-button>
                <a-button class="filter-button filter-button--rating">
                  <template #icon><StarOutlined /></template>
                  Sort by Rating
                </a-button>
              </a-space>
            </div>
            
            <div v-if="loading" class="loading-spinner">
              <a-spin size="large" />
            </div>
            <div v-else-if="error">
              <a-alert type="error" :message="error" />
            </div>
            <a-row v-else :gutter="[28, 28]">
              <a-col
                v-for="stall in stalls"
                :key="stall.id"
                :xs="24" :sm="12" :md="8" :lg="6"
                class="fade-in-up"
              >
                <StallCard :stall="stall" />
              </a-col>
            </a-row>
          </a-card>
        </section>
      </div>
    </a-layout-content>

    <a-layout-footer class="home-page-footer">
      <a-typography-text class="footer-text">
        Campus Food Map © 2025 - Discover and share campus culinary experiences
      </a-typography-text>
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStallStore } from '@/stores/stall'
import Header from '@/components/Header.vue'
import MapSection from '@/components/MapSection.vue'
import StallCard from '@/components/StallCard.vue'
import { ClockCircleOutlined, StarOutlined } from '@ant-design/icons-vue'

const stallStore = useStallStore()
const { stalls, loading, error } = storeToRefs(stallStore)

onMounted(() => {
  stallStore.fetchStalls()
})
</script>

<style scoped>
.home-page-layout {
  min-height: 100vh;
  background-color: var(--background-color);
}

.home-page-content {
  padding: var(--space-xl) var(--space-lg);
  flex: 1;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: calc(var(--space-xl) * 1.5);
}

.section-title {
  color: var(--text-color-primary) !important;
  font-weight: 700 !important;
  text-align: center;
  margin-bottom: var(--space-lg) !important;
}

.stalls-card {
  border-radius: var(--border-radius-lg);
}

.stalls-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border-color);
}

.stalls-card-title {
  margin: 0 !important;
  color: var(--text-color-primary) !important;
  font-weight: 700 !important;
}

.filter-button {
  font-weight: 500;
  border: 1px solid transparent;
}

.filter-button--status {
  background-color: #eff6ff;
  border-color: #dbeafe;
  color: #3b82f6;
}
.filter-button--status:hover {
  background-color: #dbeafe;
  color: #2563eb;
}

.filter-button--rating {
  background-color: #fffbeb;
  border-color: #fef3c7;
  color: var(--secondary-color);
}
.filter-button--rating:hover {
  background-color: #fef3c7;
  color: #d97706;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.home-page-footer {
  text-align: center;
  background: var(--surface-color);
  border-top: 1px solid var(--border-color);
  padding: var(--space-xl) var(--space-lg);
  margin-top: var(--space-xl);
}

.footer-text {
  color: var(--text-color-secondary);
  font-size: 14px;
}
</style>