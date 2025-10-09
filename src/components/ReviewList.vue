<template>
  <div class="review-list">
    <!-- 评分统计 -->
    <div v-if="showRatingStats && averageRating" class="rating-stats">
      <div class="average-rating">
        <span class="rating-value">{{ averageRating }}</span>
        <a-rate :value="averageRating" disabled allow-half />
      </div>
      <a-typography-text type="secondary" class="rating-desc">
        Based on {{ total }} reviews
      </a-typography-text>
    </div>

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
        :show-stall-name="showStallName"
        @edit="handleEdit"
        @delete="handleDeleteReview"
      />
    </div>

    <!-- 空状态 -->
    <a-empty
      v-else
      description="No reviews yet"
      class="empty-state"
    >
      <a-button
        v-if="showWriteButton"
        type="primary"
        @click="handleWriteReview"
      >
        Be the first to review
      </a-button>
    </a-empty>

    <!-- 加载更多 -->
    <div v-if="hasMore && !loading" class="load-more">
      <a-button
        type="link"
        @click="loadMore"
        :loading="loadingMore"
      >
        Load More
      </a-button>
    </div>

    <!-- 评价表单弹窗 -->
    <a-modal
      v-model:open="showFormModal"
      :title="editingReview ? 'Edit Review' : 'Write Review'"
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { EditOutlined } from '@ant-design/icons-vue';
import ReviewCard from './ReviewCard.vue';
import ReviewForm from './ReviewForm.vue';
import reviewService from '../services/reviewService';
import authService from '../services/authService';

const props = defineProps({
  stallId: {
    type: Number,
    required: true
  },
  showWriteButton: {
    type: Boolean,
    default: true
  },
  showRatingStats: {
    type: Boolean,
    default: true
  },
  showStallName: {
    type: Boolean,
    default: false
  },
  averageRating: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['review-created', 'review-updated', 'review-deleted']);

const reviews = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const showFormModal = ref(false);
const editingReview = ref(null);
const total = ref(0);
const currentPage = ref(0);
const pageSize = ref(10);
const hasMore = computed(() => reviews.value.length < total.value);

// 加载评价列表
const loadReviews = async (append = false) => {
  try {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
      reviews.value = [];
    }

    const response = await reviewService.getReviewsByStallId(props.stallId, {
      page: currentPage.value,
      size: pageSize.value
    });

    if (response.success) {
      if (append) {
        reviews.value = [...reviews.value, ...response.data];
      } else {
        reviews.value = response.data || [];
      }
      total.value = response.totalItems || response.total || 0;
    } else {
      message.error(response.message || 'Failed to load reviews');
    }
  } catch (error) {
    console.error('Failed to load reviews:', error);
    message.error('Failed to load reviews, please try again later');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 加载更多
const loadMore = () => {
  currentPage.value++;
  loadReviews(true);
};

// 处理写评价
const handleWriteReview = () => {
  if (!authService.isAuthenticated()) {
    message.warning('Please login first');
    return;
  }
  editingReview.value = null;
  showFormModal.value = true;
};

// 处理编辑评价
const handleEdit = (review) => {
  editingReview.value = review;
  showFormModal.value = true;
};

// 处理删除评价
const handleDeleteReview = (reviewId) => {
  reviews.value = reviews.value.filter(r => r.id !== reviewId);
  total.value--;
  emit('review-deleted', reviewId);
};

// 处理表单提交成功
const handleFormSuccess = (review) => {
  showFormModal.value = false;

  if (editingReview.value) {
    // 更新评价
    const index = reviews.value.findIndex(r => r.id === review.id);
    if (index !== -1) {
      reviews.value[index] = review;
    }
    emit('review-updated', review);
  } else {
    // 新增评价
    reviews.value.unshift(review);
    total.value++;
    emit('review-created', review);
  }

  editingReview.value = null;
};

// 监听 stallId 变化
watch(() => props.stallId, () => {
  currentPage.value = 0;
  loadReviews();
});

// 组件挂载时加载评价
onMounted(() => {
  loadReviews();
});

// 暴露方法和数据给父组件
defineExpose({
  total,
  handleWriteReview
});
</script>

<style scoped>
.review-list {
  width: 100%;
}

.rating-stats {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.average-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-value {
  font-size: 32px;
  font-weight: bold;
  color: #f7931e;
}

.rating-desc {
  font-size: 14px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.reviews-container {
  min-height: 200px;
}

.empty-state {
  padding: 60px 0;
}

.load-more {
  text-align: center;
  margin-top: 24px;
  padding: 12px 0;
}
</style>
