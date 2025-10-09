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
            <span v-if="review.updatedAt && review.updatedAt !== review.createdAt"> (已编辑)</span>
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
        展开
      </a>
      <a
        v-if="isExpanded && needsExpansion"
        @click="isExpanded = false"
        class="expand-link"
      >
        收起
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
      <a-space :size="16">
        <a-button
          v-if="review.canEdit"
          type="link"
          size="small"
          @click="handleEdit"
        >
          <template #icon><EditOutlined /></template>
          编辑
        </a-button>
        <a-button
          v-if="review.canDelete"
          type="link"
          size="small"
          danger
          @click="handleDelete"
        >
          <template #icon><DeleteOutlined /></template>
          删除
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { Modal, message } from 'ant-design-vue';
import ImageGallery from './ImageGallery.vue';
import reviewService from '../services/reviewService';

const props = defineProps({
  review: {
    type: Object,
    required: true
  },
  showStallName: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete']);

const isExpanded = ref(false);
const MAX_LENGTH = 200;

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
    return '刚刚';
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`;
  }
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
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
    title: '确认删除',
    content: '确定要删除这条评价吗？此操作不可恢复。',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      try {
        const response = await reviewService.deleteReview(props.review.id);
        if (response.success) {
          message.success('评价已删除');
          emit('delete', props.review.id);
        } else {
          message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除评价失败:', error);
        message.error('删除失败，请稍后重试');
      }
    }
  });
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
  justify-content: flex-end;
}
</style>
