<template>
  <div class="my-reviews-container">
    <Header />
    <div class="my-reviews-content">
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
          <CommentOutlined class="page-icon" />
          <div>
            <h1 class="page-title">{{ $t('review.myReviews') }}</h1>
            <p class="page-subtitle">{{ $t('review.totalReviews', { count: total }) }}</p>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="reviews-section">
        <a-spin :spinning="loading">
          <!-- 空状态 -->
          <div v-if="!loading && reviews.length === 0" class="empty-state">
            <a-empty :description="$t('profile.noReviews')">
              <template #image>
                <CommentOutlined style="font-size: 64px; color: #d9d9d9;" />
              </template>
              <a-button type="primary" @click="$router.push('/')">
                {{ $t('favorites.goExplore') }}
              </a-button>
            </a-empty>
          </div>

          <!-- 评价列表 -->
          <div v-else class="reviews-list">
            <ReviewCard
              v-for="review in reviews"
              :key="review.id"
              :review="review"
              :show-stall-name="true"
              :show-report-button="false"
              @edit="handleEdit"
              @delete="handleDeleteReview"
              @update="loadReviews"
            />
          </div>

          <!-- 加载更多 -->
          <div v-if="hasMore && !loading" class="load-more">
            <a-button
              type="link"
              @click="loadMore"
              :loading="loadingMore"
            >
              {{ $t('common.loadMore') }}
            </a-button>
          </div>
        </a-spin>
      </div>
    </div>

    <!-- 评价表单弹窗 -->
    <a-modal
      v-model:open="showFormModal"
      :title="$t('review.editReview')"
      :footer="null"
      width="700px"
      :destroyOnClose="true"
    >
      <ReviewForm
        v-if="editingReview"
        :stall-id="editingReview.stallId"
        :edit-review="editingReview"
        @success="handleFormSuccess"
        @cancel="showFormModal = false"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeftOutlined,
  CommentOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import authService from '@/services/authService'
import Header from '@/components/Header.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import ReviewForm from '@/components/ReviewForm.vue'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const reviews = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const total = ref(0)
const currentPage = ref(0)
const pageSize = ref(10)
const showFormModal = ref(false)
const editingReview = ref(null)

const hasMore = computed(() => reviews.value.length < total.value)

// 加载用户评价
const loadReviews = async (append = false) => {
  try {
    if (!userStore.user?.id) {
      message.error(t('messages.pleaseLogin'))
      router.push('/login')
      return
    }

    if (append) {
      loadingMore.value = true
    } else {
      loading.value = true
      if (!append) {
        reviews.value = []
      }
    }

    const response = await authService.getUserReviews({
      page: currentPage.value,
      size: pageSize.value
    })

    // 处理返回的数据结构
    let reviewsData = []
    let totalCount = 0

    if (Array.isArray(response)) {
      // 如果直接返回数组
      reviewsData = response
      totalCount = response.length
    } else if (response.data) {
      // 如果有data字段
      reviewsData = Array.isArray(response.data) ? response.data : []
      totalCount = response.totalItems || response.total || reviewsData.length
    } else {
      reviewsData = []
      totalCount = 0
    }

    if (append) {
      reviews.value = [...reviews.value, ...reviewsData]
    } else {
      reviews.value = reviewsData
    }

    total.value = totalCount

  } catch (error) {
    console.error('Load reviews error:', error)
    message.error(t('profile.loadReviewsFailed'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多
const loadMore = () => {
  currentPage.value++
  loadReviews(true)
}

// 处理编辑评价
const handleEdit = (review) => {
  editingReview.value = review
  showFormModal.value = true
}

// 处理删除评价
const handleDeleteReview = (reviewId) => {
  reviews.value = reviews.value.filter(r => r.id !== reviewId)
  total.value--
}

// 处理表单提交成功
const handleFormSuccess = (review) => {
  showFormModal.value = false

  // 更新评价列表中的评价
  const index = reviews.value.findIndex(r => r.id === review.id)
  if (index !== -1) {
    reviews.value[index] = review
  }

  editingReview.value = null
  message.success(t('review.updateSuccess'))
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.my-reviews-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #fafafa 0%, #f0f0f0 100%);
  padding-top: 80px;
}

.my-reviews-content {
  max-width: 900px;
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
  color: #2563eb;
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

/* 评价区域 */
.reviews-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04), 0 4px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  min-height: 400px;
}

/* 空状态 */
.empty-state {
  padding: 80px 0;
  text-align: center;
}

/* 评价列表 */
.reviews-list {
  display: flex;
  flex-direction: column;
}

/* 加载更多 */
.load-more {
  text-align: center;
  margin-top: 24px;
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-reviews-content {
    padding: 24px 16px;
  }

  .page-header {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .reviews-section {
    padding: 16px;
  }

  .back-btn {
    font-size: 18px;
  }

  .page-icon {
    font-size: 32px;
  }
}
</style>
