<template>
  <div class="review-form">
    <a-card :bordered="false">
      <a-form
        :model="formState"
        name="reviewForm"
        @finish="handleSubmit"
        layout="vertical"
      >
        <!-- 评分选择 -->
        <a-form-item
          label="评分"
          name="rating"
          :rules="[{ required: true, message: '请选择评分' }]"
        >
          <div class="rating-section">
            <a-rate v-model:value="formState.rating" :style="{ fontSize: '28px' }" allow-half />
            <span v-if="formState.rating" class="rating-text">
              {{ formState.rating }} 星
            </span>
          </div>
        </a-form-item>

        <!-- 评价内容 -->
        <a-form-item
          label="评价内容"
          name="comment"
          :rules="[
            { required: true, message: '请输入评价内容' },
            { min: 10, message: '评价内容至少10个字符' },
            { max: 1000, message: '评价内容不能超过1000个字符' }
          ]"
        >
          <a-textarea
            v-model:value="formState.comment"
            placeholder="分享您的用餐体验..."
            :rows="6"
            :maxlength="1000"
            :showCount="true"
          />
        </a-form-item>

        <!-- 图片上传 -->
        <a-form-item label="上传图片（可选）">
          <ImageUpload
            v-model="formState.imageUrls"
            :max-count="9"
            accept="image/jpeg,image/png,image/jpg"
            :max-size="5"
          />
          <div class="upload-tips">
            <InfoCircleOutlined />
            最多可上传9张图片，每张不超过5MB
          </div>
        </a-form-item>

        <!-- 操作按钮 -->
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting">
              {{ editMode ? '更新评价' : '提交评价' }}
            </a-button>
            <a-button @click="handleCancel">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { InfoCircleOutlined } from '@ant-design/icons-vue';
import ImageUpload from './ImageUpload.vue';
import reviewService from '../services/reviewService';

const props = defineProps({
  stallId: {
    type: Number,
    required: true
  },
  editReview: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['success', 'cancel']);

const editMode = ref(!!props.editReview);
const submitting = ref(false);

const formState = reactive({
  rating: props.editReview?.rating || 0,
  comment: props.editReview?.comment || '',
  imageUrls: props.editReview?.imageUrls || []
});

// 监听 editReview 变化
watch(() => props.editReview, (newVal) => {
  if (newVal) {
    editMode.value = true;
    formState.rating = newVal.rating;
    formState.comment = newVal.comment;
    formState.imageUrls = newVal.imageUrls || [];
  } else {
    editMode.value = false;
    resetForm();
  }
}, { deep: true });

const handleSubmit = async () => {
  try {
    submitting.value = true;

    if (editMode.value) {
      // 更新评价
      const response = await reviewService.updateReview(props.editReview.id, {
        rating: formState.rating,
        comment: formState.comment,
        imageUrls: formState.imageUrls
      });

      if (response.success) {
        message.success('评价更新成功');
        emit('success', response.data);
        resetForm();
      } else {
        message.error(response.message || '更新失败');
      }
    } else {
      // 创建新评价
      const response = await reviewService.createReview({
        stallId: props.stallId,
        rating: formState.rating,
        comment: formState.comment,
        imageUrls: formState.imageUrls
      });

      if (response.success) {
        message.success('评价提交成功');
        emit('success', response.data);
        resetForm();
      } else {
        message.error(response.message || '提交失败');
      }
    }
  } catch (error) {
    console.error('提交评价失败:', error);
    message.error(error.message || '操作失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};

const resetForm = () => {
  formState.rating = 0;
  formState.comment = '';
  formState.imageUrls = [];
};
</script>

<style scoped>
.review-form {
  width: 100%;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-text {
  font-size: 16px;
  font-weight: 500;
  color: #f7931e;
}

.upload-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
