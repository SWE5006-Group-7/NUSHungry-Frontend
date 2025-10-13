<template>
  <div class="favorites-container">
    <Header />
    <div class="favorites-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <a-button
            type="text"
            size="large"
            @click="$router.back()"
            class="back-btn"
          >
            <ArrowLeftOutlined />
          </a-button>
          <StarFilled class="page-icon" />
          <div>
            <h1 class="page-title">我的收藏</h1>
            <p class="page-subtitle">共 {{ favorites.length }} 个收藏</p>
          </div>
        </div>
        <div class="header-actions">
          <a-button
            v-if="!isEditMode && favorites.length > 0"
            type="default"
            @click="enterEditMode"
          >
            <EditOutlined />
            管理收藏
          </a-button>
          <template v-if="isEditMode">
            <a-button
              type="primary"
              danger
              :disabled="selectedFavorites.length === 0"
              @click="handleBatchDelete"
            >
              <DeleteOutlined />
              删除选中 ({{ selectedFavorites.length }})
            </a-button>
            <a-button @click="exitEditMode">
              取消
            </a-button>
          </template>
        </div>
      </div>

      <!-- 内容区域 -->
      <a-spin :spinning="loading">
        <!-- 空状态 -->
        <div v-if="favorites.length === 0" class="empty-state">
          <a-empty description="暂无收藏">
            <template #image>
              <StarOutlined style="font-size: 64px; color: #d9d9d9;" />
            </template>
            <a-button type="primary" @click="$router.push('/')">
              去逛逛
            </a-button>
          </a-empty>
        </div>

        <!-- 收藏列表 -->
        <div v-else>
          <!-- 收藏网格 -->
          <div class="favorites-grid">
            <div
              v-for="element in favorites"
              :key="element.favoriteId"
              class="favorite-card"
              :class="{ 'edit-mode': isEditMode, 'selected': isSelected(element.favoriteId) }"
            >
              <!-- 选择框 -->
              <div v-if="isEditMode" class="select-overlay" @click="toggleSelect(element.favoriteId)">
                <a-checkbox :checked="isSelected(element.favoriteId)" />
              </div>

              <!-- 卡片内容 -->
                <div class="card-content" @click="!isEditMode && goToStall(element.stallId)">
                  <!-- 图片 -->
                  <div class="favorite-image">
                    <img
                      v-if="element.stallImage"
                      :src="element.stallImage"
                      :alt="element.stallName"
                    />
                    <div v-else class="placeholder-image">
                      <ShopOutlined />
                    </div>
                    <!-- Halal标签 -->
                    <div v-if="element.halal" class="halal-badge">
                      <span>HALAL</span>
                    </div>
                    <!-- 收藏按钮 -->
                    <a-button
                      v-if="!isEditMode"
                      type="text"
                      size="small"
                      @click.stop="handleRemoveSingle(element.favoriteId)"
                      class="favorite-star-overlay"
                    >
                      <StarFilled />
                    </a-button>
                  </div>

                  <!-- 信息 -->
                  <div class="favorite-info">
                    <h3 class="stall-name">{{ element.stallName }}</h3>
                    <p class="cafeteria-name">
                      <EnvironmentOutlined />
                      {{ element.cafeteriaName }}
                    </p>
                    <p class="cuisine-type">
                      <TagOutlined />
                      {{ element.cuisineType }}
                    </p>

                    <!-- 评分 -->
                    <div class="rating-row">
                      <a-rate
                        :value="element.averageRating"
                        disabled
                        allow-half
                        class="rating"
                      />
                      <span class="rating-text">
                        {{ element.averageRating?.toFixed(1) || 'N/A' }}
                      </span>
                      <span class="review-count">
                        ({{ element.reviewCount || 0 }})
                      </span>
                    </div>

                    <!-- 收藏时间 -->
                    <p class="favorite-date">
                      <ClockCircleOutlined />
                      收藏于 {{ formatDate(element.createdAt) }}
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  HeartOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  TagOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { favoriteService } from '@/services/favoriteService'
import Header from '@/components/Header.vue'

const router = useRouter()
const userStore = useUserStore()

const favorites = ref([])
const loading = ref(false)
const isEditMode = ref(false)
const selectedFavorites = ref([])

// 加载收藏列表
const loadFavorites = async () => {
  try {
    loading.value = true
    const userId = userStore.user?.id
    if (!userId) {
      message.error('请先登录')
      router.push('/login')
      return
    }

    const data = await favoriteService.getUserFavoritesDetailed(userId.toString())
    favorites.value = data
  } catch (error) {
    message.error('加载收藏失败')
    console.error('Load favorites error:', error)
  } finally {
    loading.value = false
  }
}

// 进入编辑模式
const enterEditMode = () => {
  isEditMode.value = true
  selectedFavorites.value = []
}

// 退出编辑模式
const exitEditMode = () => {
  isEditMode.value = false
  selectedFavorites.value = []
}

// 切换选中状态
const toggleSelect = (favoriteId) => {
  const index = selectedFavorites.value.indexOf(favoriteId)
  if (index > -1) {
    selectedFavorites.value.splice(index, 1)
  } else {
    selectedFavorites.value.push(favoriteId)
  }
}

// 判断是否选中
const isSelected = (favoriteId) => {
  return selectedFavorites.value.includes(favoriteId)
}

// 批量删除
const handleBatchDelete = () => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedFavorites.value.length} 个收藏吗?`,
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const userId = userStore.user?.id
        if (!userId) return

        await favoriteService.batchDeleteFavorites(
          userId.toString(),
          selectedFavorites.value
        )

        message.success('删除成功')
        exitEditMode()
        await loadFavorites()
      } catch (error) {
        message.error('删除失败')
        console.error('Batch delete error:', error)
      }
    }
  })
}

// 删除单个收藏
const handleRemoveSingle = (favoriteId) => {
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

// 跳转到摊位详情
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
  loadFavorites()
})
</script>

<style scoped>
.favorites-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #fafafa 0%, #f0f0f0 100%);
  padding-top: 80px;
}

.favorites-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  font-size: 20px;
  color: #6b7280;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:hover {
  color: #111827;
  background-color: #f3f4f6;
}

.page-icon {
  font-size: 40px;
  color: #fadb14;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 空状态 */
.empty-state {
  padding: 80px 0;
  text-align: center;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* 收藏网格 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.favorite-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}

.favorite-card.edit-mode {
  cursor: pointer;
}

.favorite-card.edit-mode:active {
  cursor: pointer;
}

.favorite-card.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

/* 选择覆盖层 */
.select-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  cursor: pointer;
}

.favorite-card.selected .select-overlay {
  background: rgba(24, 144, 255, 0.1);
}

/* 卡片内容 */
.card-content {
  cursor: pointer;
}

.favorite-card.edit-mode .card-content {
  pointer-events: none;
}

.favorite-image {
  height: 200px;
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
  font-size: 64px;
  color: #d1d5db;
}

.halal-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* 收藏按钮悬浮在图片右下角 */
.favorite-star-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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

/* 信息区域 */
.favorite-info {
  padding: 20px;
}

.stall-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.cafeteria-name,
.cuisine-type,
.favorite-date {
  font-size: 14px;
  color: #6b7280;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}

.rating {
  font-size: 16px;
}

.rating-text {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.review-count {
  font-size: 14px;
  color: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .favorites-content {
    padding: 24px 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .ant-btn {
    flex: 1;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>
