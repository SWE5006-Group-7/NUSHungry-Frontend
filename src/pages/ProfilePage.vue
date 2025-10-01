<template>
  <div class="profile-container">
    <Header />
    <div class="profile-content">
      <a-card class="profile-card">
        <template #title>
          <div class="profile-header">
            <UserOutlined class="profile-icon" />
            <span>{{ userStore.username }}的个人中心</span>
          </div>
        </template>

        <a-tabs v-model:activeKey="activeTab">
          <!-- 我的评价 -->
          <a-tab-pane key="reviews" tab="我的评价">
            <a-spin :spinning="loadingReviews">
              <div v-if="reviews.length === 0" class="empty-state">
                <a-empty description="暂无评价" />
              </div>
              <div v-else class="reviews-list">
                <a-card
                  v-for="review in reviews"
                  :key="review.id"
                  class="review-item"
                  :title="`评价 ${review.stallName || 'Stall'}`"
                  size="small"
                >
                  <template #extra>
                    <a-rate :value="review.rating" disabled />
                  </template>
                  <p class="review-content">{{ review.comment }}</p>
                  <div class="review-meta">
                    <span class="review-date">
                      <ClockCircleOutlined />
                      {{ formatDate(review.createdAt) }}
                    </span>
                    <a-button
                      type="link"
                      danger
                      size="small"
                      @click="handleDeleteReview(review.id)"
                    >
                      删除
                    </a-button>
                  </div>
                </a-card>
              </div>
            </a-spin>
          </a-tab-pane>

          <!-- 我的收藏 -->
          <a-tab-pane key="favorites" tab="我的收藏">
            <a-spin :spinning="loadingFavorites">
              <div v-if="favorites.length === 0" class="empty-state">
                <a-empty description="暂无收藏" />
              </div>
              <div v-else class="favorites-grid">
                <a-card
                  v-for="favorite in favorites"
                  :key="favorite.id"
                  hoverable
                  class="favorite-item"
                  @click="goToStall(favorite.stallId)"
                >
                  <template #cover>
                    <div class="favorite-image">
                      <img
                        v-if="favorite.stallImage"
                        :src="favorite.stallImage"
                        :alt="favorite.stallName"
                      />
                      <div v-else class="placeholder-image">
                        <ShopOutlined />
                      </div>
                    </div>
                  </template>
                  <a-card-meta
                    :title="favorite.stallName"
                    :description="favorite.cafeteriaName"
                  >
                    <template #avatar>
                      <HeartFilled class="heart-icon" />
                    </template>
                  </a-card-meta>
                  <div class="favorite-footer">
                    <a-button
                      type="text"
                      danger
                      size="small"
                      @click.stop="handleRemoveFavorite(favorite.id)"
                    >
                      取消收藏
                    </a-button>
                  </div>
                </a-card>
              </div>
            </a-spin>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  HeartFilled,
  ShopOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import authService from '@/services/authService'
import Header from '@/components/Header.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('reviews')
const reviews = ref([])
const favorites = ref([])
const loadingReviews = ref(false)
const loadingFavorites = ref(false)

// 加载用户评价
const loadReviews = async () => {
  try {
    loadingReviews.value = true
    const data = await authService.getUserReviews()
    reviews.value = data
  } catch (error) {
    message.error('加载评价失败')
    console.error('Load reviews error:', error)
  } finally {
    loadingReviews.value = false
  }
}

// 加载用户收藏
const loadFavorites = async () => {
  try {
    loadingFavorites.value = true
    const data = await authService.getUserFavorites()
    favorites.value = data
  } catch (error) {
    message.error('加载收藏失败')
    console.error('Load favorites error:', error)
  } finally {
    loadingFavorites.value = false
  }
}

// 删除评价
const handleDeleteReview = async (reviewId) => {
  // TODO: 实现删除评价的API
  message.warning('删除评价功能待实现')
}

// 取消收藏
const handleRemoveFavorite = async (favoriteId) => {
  // TODO: 实现取消收藏的API
  message.warning('取消收藏功能待实现')
}

// 跳转到stall详情
const goToStall = (stallId) => {
  router.push(`/stalls/${stallId}`)
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  loadReviews()
  loadFavorites()
})
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.profile-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
}

.profile-icon {
  font-size: 24px;
  color: #1890ff;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
}

/* 评价列表样式 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  border: 1px solid #f0f0f0;
}

.review-content {
  margin: 12px 0;
  color: #666;
  line-height: 1.6;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.review-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
}

/* 收藏网格样式 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.favorite-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.favorite-image {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 48px;
  color: #d9d9d9;
}

.heart-icon {
  color: #ff4d4f;
  font-size: 20px;
}

.favorite-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
