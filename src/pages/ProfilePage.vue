<template>
  <div class="profile-container">
    <Header />
    <div class="profile-content">
      <!-- 返回按钮 -->
      <div class="back-button-container">
        <a-button type="text" size="large" @click="goBack" class="back-btn">
          <LeftOutlined />
          <span>{{ $t('profile.backButton') }}</span>
        </a-button>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-content">
          <div class="user-info">
            <div class="avatar-container">
              <a-avatar :size="64" class="user-avatar" :src="avatarUrl">
                <template #icon><UserOutlined /></template>
              </a-avatar>
            </div>
            <div class="user-details">
              <h1 class="user-name">{{ userStore.username || $t('profile.user') }}</h1>
              <p class="user-email">{{ userStore.user?.email || '' }}</p>
            </div>
            <a-button type="primary" @click="goToSettings" class="settings-btn">
              {{ $t('profile.goToSettings') }}
            </a-button>
          </div>
        </div>
      </div>


      <!-- 内容区域容器 -->
      <div class="content-grid">
        <!-- 我的评价 -->
        <div class="content-section">
          <div class="section-header">
            <div class="section-icon-box reviews-icon">
              <CommentOutlined class="section-icon" />
            </div>
            <h2 class="section-title">{{ $t('profile.myReviews') }}</h2>
            <a-button
              v-if="reviews.length > 0"
              type="link"
              @click="$router.push('/my-reviews')"
              class="view-all-btn"
            >
              {{ $t('profile.viewAll') }}
              <RightOutlined />
            </a-button>
          </div>
          <a-spin :spinning="loadingReviews">
            <div v-if="reviews.length === 0" class="empty-state">
              <a-empty :description="$t('profile.noReviews')">
                <template #image>
                  <CommentOutlined style="font-size: 48px; color: #d9d9d9;" />
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
                    {{ $t('profile.deleteReview') }}
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
              <StarOutlined class="section-icon" />
            </div>
            <h2 class="section-title">{{ $t('profile.myFavorites') }}</h2>
            <a-button
              v-if="favorites.length > 0"
              type="link"
              @click="$router.push('/favorites')"
              class="view-all-btn"
            >
              {{ $t('profile.viewAll') }}
              <RightOutlined />
            </a-button>
          </div>
          <a-spin :spinning="loadingFavorites">
            <div v-if="favorites.length === 0" class="empty-state">
              <a-empty :description="$t('profile.noFavorites')">
                <template #image>
                  <StarOutlined style="font-size: 48px; color: #d9d9d9;" />
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
                  <!-- 收藏按钮 -->
                  <a-button
                    type="text"
                    size="small"
                    @click.stop="handleRemoveFavorite(favorite.id)"
                    class="favorite-star-overlay"
                  >
                    <StarFilled />
                  </a-button>
                </div>
                <div class="favorite-content">
                  <h3 class="favorite-name">{{ favorite.stallName }}</h3>
                  <p class="favorite-location">{{ favorite.cafeteriaName }}</p>
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
import { useI18n } from 'vue-i18n'
import {
  UserOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  StarOutlined,
  StarFilled,
  DeleteOutlined,
  RightOutlined,
  CommentOutlined,
  LeftOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import authService from '@/services/authService'
import { favoriteService } from '@/services/favoriteService'
import Header from '@/components/Header.vue'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const reviews = ref([])
const favorites = ref([])
const loadingReviews = ref(false)
const loadingFavorites = ref(false)
const avatarUrl = ref('')

// 加载用户评价
const loadReviews = async () => {
  try {
    loadingReviews.value = true
    const data = await authService.getUserReviews()
    reviews.value = data
  } catch (error) {
    message.error(t('profile.loadReviewsFailed'))
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
    message.error(t('profile.loadFavoritesFailed'))
    console.error('Load favorites error:', error)
  } finally {
    loadingFavorites.value = false
  }
}

// 删除评价
const handleDeleteReview = async (reviewId) => {
  // TODO: 实现删除评价的API
  message.warning(t('profile.deleteFailed'))
}

// 取消收藏
const handleRemoveFavorite = async (favoriteId) => {
  Modal.confirm({
    title: t('profile.confirmRemoveFavorite'),
    content: t('profile.confirmRemoveFavoriteContent'),
    okText: t('common.confirm'),
    okType: 'danger',
    cancelText: t('common.cancel'),
    onOk: async () => {
      try {
        const userId = userStore.user?.id
        if (!userId) return

        await favoriteService.removeFavoriteById(userId.toString(), favoriteId)
        message.success(t('profile.removeFavoriteSuccess'))
        await loadFavorites()
      } catch (error) {
        message.error(t('messages.operationFailed'))
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

// 跳转到设置页面
const goToSettings = () => {
  router.push('/settings')
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 初始化头像URL
  avatarUrl.value = userStore.user?.avatarUrl
    ? 'http://localhost:8080' + userStore.user.avatarUrl
    : ''

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

/* 返回按钮 */
.back-button-container {
  margin-bottom: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.back-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
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

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.change-avatar-btn {
  font-size: 12px;
  padding: 0;
  height: auto;
  color: #1890ff;
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
  background-color: #dbeafe;
}

.section-icon-box.favorites-icon {
  background-color: #fef3c7;
}

.section-icon {
  font-size: 24px;
}

.reviews-icon .section-icon {
  color: #2563eb;
}

.favorites-icon .section-icon {
  color: #d97706;
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
  position: relative;
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

/* 收藏按钮悬浮在图片右下角 */
.favorite-star-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fadb14;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
  padding: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.favorite-star-overlay:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(250, 219, 20, 0.4);
  background: rgba(255, 255, 255, 1);
}

.favorite-star-overlay:active {
  transform: scale(0.95);
}

.favorite-content {
  padding: 16px;
}

.favorite-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.favorite-location {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
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
