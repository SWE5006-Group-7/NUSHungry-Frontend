<template>
  <div class="review-card">
    <!-- 用户信息和评分 -->
    <div class="review-header">
      <div class="user-info">
        <a-avatar
          :src="review.userAvatarUrl"
          :size="40"
        >
          {{ review.username?.charAt(0) }}
        </a-avatar>
        <div class="user-details">
          <a-typography-text strong class="username">
            {{ review.username }}
          </a-typography-text>
          <a-typography-text type="secondary" class="date">
            {{ formatDate(review.createdAt) }}
            <span v-if="review.updatedAt && review.updatedAt !== review.createdAt"> ({{ $t('profile.edited') }})</span>
          </a-typography-text>
        </div>
      </div>

      <div class="rating-display">
        <a-rate :value="review.rating" disabled allow-half class="rate-stars" />
        <a-typography-text strong class="rating-value">
          {{ review.rating }}
        </a-typography-text>
      </div>
    </div>

    <!-- 摊位名称（如果显示） -->
    <a-typography-text
      v-if="showStallName && review.stallName"
      strong
      class="stall-name"
    >
      @{{ review.stallName }}
    </a-typography-text>

    <!-- 评价内容 -->
    <a-typography-paragraph class="review-content">
      {{ isExpanded ? review.comment : truncatedComment }}
      <a
        v-if="needsExpansion && !isExpanded"
        @click="isExpanded = true"
        class="expand-link"
      >
        {{ $t('review.expand') }}
      </a>
      <a
        v-if="isExpanded && needsExpansion"
        @click="isExpanded = false"
        class="expand-link"
      >
        {{ $t('review.collapse') }}
      </a>
    </a-typography-paragraph>

    <!-- 图片区域 -->
    <ImageGallery
      v-if="review.imageUrls && review.imageUrls.length > 0"
      :images="review.imageUrls"
      :columns="3"
      :max-visible="6"
      class="review-images"
    />

    <!-- 操作按钮 -->
    <div class="review-actions">
      <div class="action-left">
        <a-space :size="16">
          <!-- 点赞按钮 -->
          <a-button
            type="link"
            size="small"
            :loading="liking"
            @click="handleLike"
            class="action-btn"
          >
            <template #icon>
              <LikeFilled v-if="localLiked" style="color: #1890ff;" />
              <LikeOutlined v-else />
            </template>
            {{ localLikesCount > 0 ? localLikesCount : $t('review.like') }}
          </a-button>

          <!-- 举报按钮 -->
          <a-button
            v-if="showReportButton"
            type="link"
            size="small"
            @click="handleReport"
            class="action-btn report-btn"
          >
            <template #icon><FlagOutlined /></template>
            {{ $t('review.report') }}
          </a-button>
        </a-space>
      </div>

      <div class="action-right">
        <a-space :size="16">
          <a-button
            v-if="review.canEdit"
            type="link"
            size="small"
            @click="handleEdit"
          >
            <template #icon><EditOutlined /></template>
            {{ $t('common.edit') }}
          </a-button>
          <a-button
            v-if="review.canDelete"
            type="link"
            size="small"
            danger
            @click="handleDelete"
          >
            <template #icon><DeleteOutlined /></template>
            {{ $t('common.delete') }}
          </a-button>
        </a-space>
      </div>
    </div>

    <!-- 举报对话框 -->
    <a-modal
      v-model:open="reportVisible"
      :title="$t('review.reportTitle')"
      @ok="submitReport"
      @cancel="cancelReport"
      :confirm-loading="reporting"
      :okText="$t('review.submitReport')"
      :cancelText="$t('common.cancel')"
    >
      <a-form layout="vertical">
        <a-form-item :label="$t('review.reportReason')" required>
          <a-select
            v-model:value="reportReason"
            :placeholder="$t('review.reportReasonPlaceholder')"
            :options="reportReasons"
          />
        </a-form-item>

        <a-form-item
          :label="$t('review.reportDescription')"
          :required="reportReason === 'OTHER'"
        >
          <a-textarea
            v-model:value="reportDescription"
            :placeholder="$t('review.reportDescriptionPlaceholder')"
            :rows="4"
            :maxlength="500"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { EditOutlined, DeleteOutlined, LikeOutlined, LikeFilled, FlagOutlined } from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import ImageGallery from './ImageGallery.vue';
import reviewService from '../services/reviewService';
import { useUserStore } from '../stores/user';

const props = defineProps({
  review: {
    type: Object,
    required: true
  },
  showStallName: {
    type: Boolean,
    default: false
  },
  showReportButton: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['edit', 'delete', 'update']);
const { t } = useI18n();

const userStore = useUserStore();
const isExpanded = ref(false);
const MAX_LENGTH = 200;

// 点赞和举报状态
const localLikesCount = ref(props.review.likesCount || 0);
const localLiked = ref(props.review.liked || false);
const liking = ref(false);

// 举报对话框
const reportVisible = ref(false);
const reportReason = ref(null);
const reportDescription = ref('');
const reporting = ref(false);

// 举报原因选项
const reportReasons = computed(() => [
  { value: 'SPAM', label: t('review.reportReasons.SPAM') },
  { value: 'OFFENSIVE', label: t('review.reportReasons.OFFENSIVE') },
  { value: 'INAPPROPRIATE', label: t('review.reportReasons.INAPPROPRIATE') },
  { value: 'FALSE_INFO', label: t('review.reportReasons.FALSE_INFO') },
  { value: 'OFF_TOPIC', label: t('review.reportReasons.OFF_TOPIC') },
  { value: 'DUPLICATE', label: t('review.reportReasons.DUPLICATE') },
  { value: 'OTHER', label: t('review.reportReasons.OTHER') }
]);

const needsExpansion = computed(() => {
  return props.review.comment && props.review.comment.length > MAX_LENGTH;
});

const truncatedComment = computed(() => {
  if (!needsExpansion.value) return props.review.comment;
  return props.review.comment.substring(0, MAX_LENGTH) + '...';
});

const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // 小于1分钟
  if (diff < 60000) {
    return t('time.justNow');
  }
  // 小于1小时
  if (diff < 3600000) {
    return t('time.minutesAgo', { n: Math.floor(diff / 60000) });
  }
  // 小于24小时
  if (diff < 86400000) {
    return t('time.hoursAgo', { n: Math.floor(diff / 3600000) });
  }
  // 小于7天
  if (diff < 604800000) {
    return t('time.daysAgo', { n: Math.floor(diff / 86400000) });
  }

  // 超过7天显示具体日期
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const handleEdit = () => {
  emit('edit', props.review);
};

const handleDelete = () => {
  Modal.confirm({
    title: t('review.confirmDeleteTitle'),
    content: t('review.confirmDeleteContent'),
    okText: t('common.confirm'),
    cancelText: t('common.cancel'),
    onOk: async () => {
      try {
        const response = await reviewService.deleteReview(props.review.id);
        if (response.success) {
          message.success(t('review.deleteSuccess'));
          emit('delete', props.review.id);
        } else {
          message.error(response.message || t('review.deleteFailed'));
        }
      } catch (error) {
        console.error('Delete review error:', error);
        message.error(t('review.deleteFailed'));
      }
    }
  });
};

const handleLike = async () => {
  if (!userStore.isAuthenticated) {
    message.warning(t('review.pleaseLogin'));
    return;
  }

  if (liking.value) return;

  liking.value = true;
  try {
    const response = await reviewService.toggleLike(props.review.id);
    if (response.success) {
      localLiked.value = response.liked;
      localLikesCount.value = response.liked
        ? localLikesCount.value + 1
        : Math.max(0, localLikesCount.value - 1);
      emit('update');
    } else {
      message.error(response.message || t('messages.operationFailed'));
    }
  } catch (error) {
    console.error('Like operation error:', error);
    // 401/403认证错误由request拦截器统一处理，这里不重复提示
    const status = error.response?.status;
    if (status !== 401 && status !== 403) {
      message.error(error.response?.data?.message || t('messages.operationFailed'));
    }
  } finally {
    liking.value = false;
  }
};

const handleReport = () => {
  if (!userStore.isAuthenticated) {
    message.warning(t('review.pleaseLogin'));
    return;
  }
  reportVisible.value = true;
};

const submitReport = async () => {
  if (!reportReason.value) {
    message.warning(t('review.reportReasonPlaceholder'));
    return;
  }

  if (reportReason.value === 'OTHER' && !reportDescription.value.trim()) {
    message.warning(t('review.reportDescriptionPlaceholder'));
    return;
  }

  reporting.value = true;
  try {
    const response = await reviewService.reportReview(props.review.id, {
      reason: reportReason.value,
      description: reportDescription.value
    });

    if (response.success) {
      message.success(t('review.reportSuccess'));
      reportVisible.value = false;
      reportReason.value = null;
      reportDescription.value = '';
    } else {
      message.error(response.message || t('review.reportFailed'));
    }
  } catch (error) {
    console.error('Report submit error:', error);
    if (error.message && error.message.includes('already reported')) {
      message.warning(t('review.alreadyReported'));
    } else {
      message.error(t('review.reportFailed'));
    }
  } finally {
    reporting.value = false;
  }
};

const cancelReport = () => {
  reportVisible.value = false;
  reportReason.value = null;
  reportDescription.value = '';
};
</script>

<style scoped>
.review-card {
  padding: 20px 0;
  border-bottom: 1px solid #f1f5f9;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  color: #1f2937;
  font-size: 15px;
}

.date {
  font-size: 13px;
  margin-top: 2px;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-stars {
  font-size: 14px;
}

.rating-value {
  color: #f7931e;
  font-size: 16px;
}

.stall-name {
  color: #667eea;
  font-size: 14px;
  display: block;
  margin-bottom: 12px;
}

.review-content {
  margin: 12px 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.expand-link {
  color: #667eea;
  margin-left: 8px;
  cursor: pointer;
  font-size: 13px;
}

.expand-link:hover {
  text-decoration: underline;
}

.review-images {
  margin: 16px 0;
}

.review-actions {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-left {
  display: flex;
  gap: 8px;
}

.action-right {
  display: flex;
  gap: 8px;
}

.action-btn {
  color: #64748b;
  padding: 0 8px;
}

.action-btn:hover {
  color: #1890ff;
}

.report-btn:hover {
  color: #ff4d4f;
}
</style>
