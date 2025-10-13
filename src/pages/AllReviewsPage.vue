<template>
  <a-layout style="min-height: 100vh; background: #f8fafc;">
    <Header />

    <a-layout-content style="padding: 96px 24px 24px;">
      <div style="max-width: 1000px; margin: 0 auto;">
        <!-- 返回按钮和标题 -->
        <div style="margin-bottom: 24px;">
          <a-button type="link" @click="goBack" style="padding-left: 0; margin-bottom: 16px;">
            <template #icon><ArrowLeftOutlined /></template>
            返回摊位详情
          </a-button>

          <a-typography-title :level="3" style="margin: 0;">
            全部评价
            <a-typography-text type="secondary" style="font-size: 16px; font-weight: normal; margin-left: 8px;">
              ({{ total }} 条评价)
            </a-typography-text>
          </a-typography-title>
        </div>

        <a-row :gutter="[24, 24]">
          <!-- 左侧：评分分布 -->
          <a-col :xs="24" :lg="8">
            <a-card :style="cardStyle" :body-style="{ padding: '24px' }">
              <template #title>
                <a-tag color="orange-inverse">评分分布</a-tag>
              </template>

              <!-- 平均分 -->
              <div v-if="ratingDistribution" class="rating-summary">
                <div class="average-rating">
                  <span class="rating-value">
                    {{ ratingDistribution.average ? ratingDistribution.average.toFixed(1) : 'N/A' }}
                  </span>
                  <a-rate
                    :value="ratingDistribution.average || 0"
                    disabled
                    allow-half
                    style="font-size: 18px;"
                  />
                </div>
                <a-typography-text type="secondary" class="rating-desc">
                  基于 {{ ratingDistribution.total || 0 }} 条评价
                </a-typography-text>
              </div>

              <!-- 评分分布柱状图 -->
              <div v-if="ratingDistribution" class="rating-bars">
                <div
                  v-for="star in [5, 4, 3, 2, 1]"
                  :key="star"
                  class="rating-bar-row"
                >
                  <span class="star-label">{{ star }}星</span>
                  <div class="bar-container">
                    <div
                      class="bar-fill"
                      :style="{
                        width: calculatePercentage(star) + '%',
                        backgroundColor: getBarColor(star)
                      }"
                    ></div>
                  </div>
                  <span class="count-label">{{ getRatingCount(star) }}</span>
                </div>
              </div>
            </a-card>
          </a-col>

          <!-- 右侧：评价列表 -->
          <a-col :xs="24" :lg="16">
            <a-card :style="cardStyle" :body-style="{ padding: '24px' }">
              <template #title>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <a-tag color="blue-inverse">全部评价</a-tag>

                  <!-- 排序选择器 -->
                  <a-select
                    v-model:value="sortBy"
                    style="width: 150px;"
                    @change="handleSortChange"
                  >
                    <a-select-option value="createdAt">最新优先</a-select-option>
                    <a-select-option value="likesCount">最多点赞</a-select-option>
                  </a-select>
                </div>
              </template>

              <!-- 加载状态 -->
              <div v-if="loading" class="loading-container">
                <a-spin size="large" />
              </div>

              <!-- 评价列表 -->
              <div v-else-if="reviews.length > 0" class="reviews-container">
                <ReviewCard
                  v-for="review in reviews"
                  :key="review.id"
                  :review="review"
                  :show-stall-name="false"
                  @edit="handleEdit"
                  @delete="handleDeleteReview"
                  @update="loadReviews"
                />

                <!-- 分页 -->
                <div v-if="totalPages > 1" class="pagination-container">
                  <a-pagination
                    v-model:current="currentPage"
                    v-model:page-size="pageSize"
                    :total="total"
                    :show-size-changer="false"
                    :show-total="total => `共 ${total} 条评价`"
                    @change="handlePageChange"
                  />
                </div>
              </div>

              <!-- 空状态 -->
              <a-empty
                v-else
                description="暂无评价"
                class="empty-state"
              />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-layout-content>

    <!-- 评价表单弹窗 -->
    <a-modal
      v-model:open="showFormModal"
      :title="editingReview ? '编辑评价' : '写评价'"
      :footer="null"
      width="700px"
      :destroyOnClose="true"
    >
      <ReviewForm
        :stall-id="stallId"
        :edit-review="editingReview"
        @success="handleFormSuccess"
        @cancel="showFormModal = false"
      />
    </a-modal>
  </a-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import Header from '@/components/Header.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import ReviewForm from '@/components/ReviewForm.vue'
import reviewService from '@/services/reviewService'

const route = useRoute()
const router = useRouter()

const stallId = parseInt(route.params.stallId)
const reviews = ref([])
const loading = ref(false)
const ratingDistribution = ref(null)
const sortBy = ref('createdAt')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const showFormModal = ref(false)
const editingReview = ref(null)

// 加载评分分布
const loadRatingDistribution = async () => {
  try {
    const response = await reviewService.getRatingDistribution(stallId)
    if (response.success) {
      ratingDistribution.value = response.data
    }
  } catch (error) {
    console.error('加载评分分布失败:', error)
  }
}

// 加载评价列表
const loadReviews = async () => {
  try {
    loading.value = true
    const response = await reviewService.getReviewsByStallId(stallId, {
      page: currentPage.value - 1, // API从0开始
      size: pageSize.value,
      sortBy: sortBy.value
    })

    if (response.success) {
      reviews.value = response.data || []
      total.value = response.totalItems || 0
      totalPages.value = response.totalPages || 0
    } else {
      message.error(response.message || '加载评价失败')
    }
  } catch (error) {
    console.error('加载评价失败:', error)
    message.error('加载评价失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理排序变化
const handleSortChange = () => {
  currentPage.value = 1
  loadReviews()
}

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadReviews()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 获取指定星级的评价数量
const getRatingCount = (star) => {
  if (!ratingDistribution.value?.distribution) return 0
  return ratingDistribution.value.distribution[star] || 0
}

// 计算百分比
const calculatePercentage = (star) => {
  if (!ratingDistribution.value?.total || ratingDistribution.value.total === 0) return 0
  const count = getRatingCount(star)
  return (count / ratingDistribution.value.total * 100).toFixed(1)
}

// 获取柱状图颜色
const getBarColor = (star) => {
  const colors = {
    5: '#52c41a',
    4: '#95de64',
    3: '#fadb14',
    2: '#ffa940',
    1: '#ff4d4f'
  }
  return colors[star] || '#d9d9d9'
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
  loadRatingDistribution()
}

// 处理表单提交成功
const handleFormSuccess = (review) => {
  showFormModal.value = false

  if (editingReview.value) {
    // 更新评价
    const index = reviews.value.findIndex(r => r.id === review.id)
    if (index !== -1) {
      reviews.value[index] = review
    }
  } else {
    // 新增评价
    loadReviews()
  }

  loadRatingDistribution()
  editingReview.value = null
}

// 组件挂载时加载数据
onMounted(() => {
  loadRatingDistribution()
  loadReviews()
})

const cardStyle = {
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  border: '1px solid rgba(0,0,0,0.03)'
}
</script>

<style scoped>
.rating-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.rating-value {
  font-size: 48px;
  font-weight: bold;
  color: #f7931e;
  line-height: 1;
}

.rating-desc {
  font-size: 14px;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-label {
  width: 40px;
  font-size: 14px;
  color: #64748b;
}

.bar-container {
  flex: 1;
  height: 20px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.count-label {
  width: 40px;
  text-align: right;
  font-size: 14px;
  color: #64748b;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.reviews-container {
  min-height: 400px;
}

.empty-state {
  padding: 60px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}
</style>
