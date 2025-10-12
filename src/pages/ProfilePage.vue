<template>
  <div class="profile-container">
    <Header />
    <div class="profile-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <div class="user-info">
            <a-avatar :size="64" class="user-avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
            <div class="user-details">
              <h1 class="user-name">{{ userStore.username || '用户' }}</h1>
              <p class="user-email">{{ userStore.user?.email || '' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容区域容器 -->
      <div class="content-grid">
        <!-- 我的评价 -->
        <div class="content-section">
          <div class="section-header">
            <div class="section-icon-box reviews-icon">
              <StarOutlined class="section-icon" />
            </div>
            <h2 class="section-title">我的评价</h2>
          </div>
          <a-spin :spinning="loadingReviews">
            <div v-if="reviews.length === 0" class="empty-state">
              <a-empty description="暂无评价">
                <template #image>
                  <StarOutlined style="font-size: 48px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
            <div v-else class="reviews-list">
              <div
                v-for="review in reviews"
                :key="review.id"
                class="review-card"
              >
                <div class="review-header">
                  <div class="review-title">
                    <ShopOutlined class="review-icon" />
                    <span class="review-stall">{{ review.stallName || 'Stall' }}</span>
                  </div>
                  <a-rate :value="review.rating" disabled class="review-rating" />
                </div>
                <p class="review-content">{{ review.comment }}</p>
                <div class="review-footer">
                  <span class="review-date">
                    <ClockCircleOutlined />
                    {{ formatDate(review.createdAt) }}
                  </span>
                  <a-button
                    type="text"
                    danger
                    size="small"
                    @click="handleDeleteReview(review.id)"
                    class="delete-btn"
                  >
                    <DeleteOutlined />
                    删除
                  </a-button>
                </div>
              </div>
            </div>
          </a-spin>
        </div>

        <!-- 我的收藏 -->
        <div class="content-section">
          <div class="section-header">
            <div class="section-icon-box favorites-icon">
              <HeartOutlined class="section-icon" />
            </div>
            <h2 class="section-title">我的收藏</h2>
            <a-button
              v-if="favorites.length > 0"
              type="link"
              @click="$router.push('/favorites')"
              class="view-all-btn"
            >
              查看全部
              <RightOutlined />
            </a-button>
          </div>
          <a-spin :spinning="loadingFavorites">
            <div v-if="favorites.length === 0" class="empty-state">
              <a-empty description="暂无收藏">
                <template #image>
                  <HeartOutlined style="font-size: 48px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
            <div v-else class="favorites-grid">
              <div
                v-for="favorite in favorites"
                :key="favorite.id"
                class="favorite-card"
                @click="goToStall(favorite.stallId)"
              >
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
                <div class="favorite-content">
                  <div class="favorite-header">
                    <h3 class="favorite-name">{{ favorite.stallName }}</h3>
                    <HeartFilled class="favorite-icon" />
                  </div>
                  <p class="favorite-location">{{ favorite.cafeteriaName }}</p>
                  <div class="favorite-actions">
                    <a-button
                      type="text"
                      danger
                      size="small"
                      @click.stop="handleRemoveFavorite(favorite.id)"
                      class="remove-btn"
                    >
                      取消收藏
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  UserOutlined,
  HeartFilled,
  HeartOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  StarOutlined,
  DeleteOutlined,
  RightOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import authService from '@/services/authService'
import { favoriteService } from '@/services/favoriteService'
import Header from '@/components/Header.vue'

const router = useRouter()
const userStore = useUserStore()

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
    const userId = userStore.user?.id
    if (!userId) return

    // 使用详细版本API获取收藏列表
    const data = await favoriteService.getUserFavoritesDetailed(userId.toString())
    // 只显示前4个
    favorites.value = data.slice(0, 4).map(fav => ({
      id: fav.favoriteId,
      stallId: fav.stallId,
      stallName: fav.stallName,
      stallImage: fav.stallImage,
      cafeteriaName: fav.cafeteriaName
    }))
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
  Modal.confirm({
    title: '确认取消收藏',
    content: '确定要取消收藏这个摊位吗?',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const userId = userStore.user?.id
        if (!userId) return

        await favoriteService.removeFavoriteById(userId.toString(), favoriteId)
        message.success('已取消收藏')
        await loadFavorites()
      } catch (error) {
        message.error('操作失败')
        console.error('Remove favorite error:', error)
      }
    }
  })
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
  background: linear-gradient(to bottom, #fafafa 0%, #f0f0f0 100%);
  padding-top: 80px;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  background: #111827;
  font-size: 28px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.user-email {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}


/* 内容区域网格 */
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  align-items: start;
}

.content-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
  position: relative;
}

.view-all-btn {
  margin-left: auto;
  color: #1890ff;
  font-weight: 500;
  padding-right: 0;
}

.section-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-icon-box.reviews-icon {
  background-color: #fef3c7;
}

.section-icon-box.favorites-icon {
  background-color: #fee2e2;
}

.section-icon {
  font-size: 24px;
}

.reviews-icon .section-icon {
  color: #d97706;
}

.favorites-icon .section-icon {
  color: #dc2626;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.3px;
}

.empty-state {
  padding: 64px 0;
  text-align: center;
}

/* 评价列表 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card {
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.review-card:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-icon {
  font-size: 18px;
  color: #6b7280;
}

.review-stall {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.review-rating {
  font-size: 16px;
}

.review-content {
  margin: 0 0 16px 0;
  color: #374151;
  line-height: 1.6;
  font-size: 15px;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.review-date {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9ca3af;
  font-size: 13px;
}

.delete-btn {
  color: #dc2626;
  font-weight: 500;
}

.delete-btn:hover {
  background-color: #fee2e2;
}

/* 收藏网格 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.favorite-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}

.favorite-image {
  height: 180px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
}

.favorite-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.favorite-card:hover .favorite-image img {
  transform: scale(1.05);
}

.placeholder-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 48px;
  color: #d1d5db;
}

.favorite-content {
  padding: 16px;
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
}

.favorite-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
}

.favorite-icon {
  color: #dc2626;
  font-size: 18px;
  flex-shrink: 0;
}

.favorite-location {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
}

.favorite-actions {
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  text-align: center;
}

.remove-btn {
  color: #dc2626;
  font-weight: 500;
  font-size: 13px;
}

.remove-btn:hover {
  background-color: #fee2e2;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-content {
    padding: 24px 16px;
  }

  .header-content {
    padding: 24px;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .user-name {
    font-size: 24px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
