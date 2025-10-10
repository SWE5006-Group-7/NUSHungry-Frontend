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
            <div class="section-actions">
              <a-button
                v-if="!batchMode && favorites.length > 0"
                type="primary"
                size="small"
                @click="toggleBatchMode"
              >
                批量管理
              </a-button>
              <template v-if="batchMode">
                <a-button
                  type="default"
                  size="small"
                  @click="toggleSelectAll"
                >
                  <CheckOutlined v-if="!isAllSelected" />
                  <CloseOutlined v-else />
                  {{ isAllSelected ? '取消全选' : '全选' }}
                </a-button>
                <a-button
                  type="primary"
                  danger
                  size="small"
                  :disabled="selectedFavorites.length === 0"
                  @click="handleBatchDelete"
                >
                  删除 ({{ selectedFavorites.length }})
                </a-button>
                <a-button
                  type="default"
                  size="small"
                  @click="toggleBatchMode"
                >
                  取消
                </a-button>
              </template>
            </div>
          </div>
          <a-spin :spinning="loadingFavorites">
            <div v-if="favorites.length === 0" class="empty-state">
              <a-empty description="暂无收藏">
                <template #image>
                  <HeartOutlined style="font-size: 48px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
            <div v-else class="favorites-container">
              <!-- 拖拽排序提示 -->
              <div v-if="!batchMode && favorites.length > 1" class="drag-hint">
                <DragOutlined /> 拖拽卡片可调整顺序
              </div>

              <draggable
                v-model="fullFavorites"
                :disabled="batchMode"
                item-key="id"
                class="favorites-grid"
                :class="{ 'is-dragging': isDragging, 'batch-mode': batchMode }"
                @start="handleDragStart"
                @end="handleDragEnd"
              >
                <template #item="{ element }">
                  <div
                    :key="element.id"
                    class="favorite-card"
                    :class="{
                      'is-selected': selectedFavorites.includes(element.id),
                      'batch-mode': batchMode
                    }"
                    @click="batchMode ? toggleSelectFavorite(element.id) : goToStall(element.stall.id)"
                  >
                    <!-- 批量选择复选框 -->
                    <div v-if="batchMode" class="favorite-checkbox" @click.stop="toggleSelectFavorite(element.id)">
                      <a-checkbox :checked="selectedFavorites.includes(element.id)" />
                    </div>

                    <!-- 拖拽手柄 -->
                    <div v-if="!batchMode" class="drag-handle">
                      <DragOutlined />
                    </div>

                    <div class="favorite-image">
                      <img
                        v-if="element.stall.imageUrls && element.stall.imageUrls[0]"
                        :src="element.stall.imageUrls[0]"
                        :alt="element.stall.name"
                      />
                      <div v-else class="placeholder-image">
                        <ShopOutlined />
                      </div>
                    </div>
                    <div class="favorite-content">
                      <div class="favorite-header">
                        <h3 class="favorite-name">{{ element.stall.name }}</h3>
                        <HeartFilled class="favorite-icon" />
                      </div>
                      <p class="favorite-location">{{ element.stall.cafeteria?.name || '' }}</p>
                      <div v-if="!batchMode" class="favorite-actions">
                        <a-button
                          type="text"
                          danger
                          size="small"
                          @click.stop="handleRemoveFavorite(element.id)"
                          class="remove-btn"
                        >
                          取消收藏
                        </a-button>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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
  DragOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import authService from '@/services/authService'
import { favoriteService } from '@/services/favoriteService'
import Header from '@/components/Header.vue'
import draggable from 'vuedraggable'

const router = useRouter()
const userStore = useUserStore()

const reviews = ref([])
const favorites = ref([])
const fullFavorites = ref([]) // 完整的Favorite对象（包含ID和sortOrder）
const loadingReviews = ref(false)
const loadingFavorites = ref(false)

// 批量管理相关
const batchMode = ref(false)
const selectedFavorites = ref([])
const isDragging = ref(false)

// 计算属性：是否全选
const isAllSelected = computed(() => {
  return fullFavorites.value.length > 0 &&
         selectedFavorites.value.length === fullFavorites.value.length
})

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
    const userId = userStore.user?.id || userStore.userId
    if (!userId) {
      message.error('用户未登录')
      return
    }

    // 获取完整的Favorite对象（包含ID和sortOrder）
    const data = await favoriteService.getUserFavoritesFull(userId.toString())
    fullFavorites.value = data

    // 转换为显示用的格式
    favorites.value = data.map(fav => ({
      id: fav.id,
      stallId: fav.stall.id,
      stallName: fav.stall.name,
      stallImage: fav.stall.imageUrls?.[0] || '',
      cafeteriaName: fav.stall.cafeteria?.name || ''
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

// 切换批量管理模式
const toggleBatchMode = () => {
  batchMode.value = !batchMode.value
  if (!batchMode.value) {
    selectedFavorites.value = []
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedFavorites.value = []
  } else {
    selectedFavorites.value = fullFavorites.value.map(f => f.id)
  }
}

// 切换单个收藏的选择状态
const toggleSelectFavorite = (favoriteId) => {
  const index = selectedFavorites.value.indexOf(favoriteId)
  if (index > -1) {
    selectedFavorites.value.splice(index, 1)
  } else {
    selectedFavorites.value.push(favoriteId)
  }
}

// 批量删除收藏
const handleBatchDelete = async () => {
  if (selectedFavorites.value.length === 0) {
    message.warning('请至少选择一个收藏')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedFavorites.value.length} 个收藏吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const userId = userStore.user?.id || userStore.userId
        await favoriteService.batchDeleteFavorites(userId.toString(), selectedFavorites.value)
        message.success('批量删除成功')
        selectedFavorites.value = []
        batchMode.value = false
        await loadFavorites()
      } catch (error) {
        message.error('批量删除失败')
        console.error('Batch delete error:', error)
      }
    }
  })
}

// 取消单个收藏
const handleRemoveFavorite = async (favoriteId) => {
  Modal.confirm({
    title: '确认取消收藏',
    content: '确定要取消这个收藏吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const userId = userStore.user?.id || userStore.userId
        await favoriteService.batchDeleteFavorites(userId.toString(), [favoriteId])
        message.success('已取消收藏')
        await loadFavorites()
      } catch (error) {
        message.error('取消收藏失败')
        console.error('Remove favorite error:', error)
      }
    }
  })
}

// 拖拽结束后保存排序
const handleDragEnd = async () => {
  isDragging.value = false
  try {
    const userId = userStore.user?.id || userStore.userId
    const favoriteIds = fullFavorites.value.map(f => f.id)
    await favoriteService.reorderFavorites(userId.toString(), favoriteIds)
    message.success('排序已保存')
  } catch (error) {
    message.error('保存排序失败')
    console.error('Reorder error:', error)
    await loadFavorites() // 重新加载以恢复原顺序
  }
}

// 拖拽开始
const handleDragStart = () => {
  isDragging.value = true
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
}

.section-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
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

/* 拖拽提示 */
.drag-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  margin-bottom: 16px;
  color: #0284c7;
  font-size: 14px;
}

/* 收藏容器 */
.favorites-container {
  width: 100%;
}

/* 收藏网格 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.favorites-grid.is-dragging .favorite-card {
  cursor: move;
}

.favorites-grid.batch-mode .favorite-card {
  cursor: pointer;
}

.favorite-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}

.favorite-card.batch-mode:hover {
  transform: none;
  border-color: #3b82f6;
}

.favorite-card.is-selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* 拖拽手柄 */
.drag-handle {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  cursor: move;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: #6b7280;
}

.favorite-card:hover .drag-handle {
  opacity: 1;
}

.drag-handle:hover {
  background: #f3f4f6;
  color: #111827;
}

/* 批量选择复选框 */
.favorite-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  padding: 4px;
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
