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
          :label="$t('review.rating')"
          name="rating"
          :rules="[{ required: true, message: $t('review.ratingPlaceholder') }]"
        >
          <div class="rating-section">
            <a-rate v-model:value="formState.rating" :style="{ fontSize: '28px' }" allow-half />
            <span v-if="formState.rating" class="rating-text">
              {{ formState.rating }} {{ $t('review.stars') }}
            </span>
          </div>
        </a-form-item>

        <!-- 评价内容 -->
        <a-form-item
          :label="$t('review.comment')"
          name="comment"
          :rules="[
            { required: true, message: $t('review.commentRequired') },
            { min: 1, message: $t('review.commentMinLength') },
            { max: 1000, message: $t('review.commentMaxLength') }
          ]"
        >
          <a-textarea
            v-model:value="formState.comment"
            :placeholder="$t('review.commentPlaceholder')"
            :rows="6"
            :maxlength="1000"
            :showCount="true"
          />
        </a-form-item>

        <!-- 花费信息（可选） -->
        <a-form-item :label="$t('review.costInfo')">
          <a-space direction="vertical" style="width: 100%;">
            <div class="cost-info-section">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item
                    :label="$t('review.totalCost')"
                    name="totalCost"
                    :rules="[
                      { type: 'number', min: 0.01, message: $t('review.totalCostMin') }
                    ]"
                  >
                    <a-input-number
                      v-model:value="formState.totalCost"
                      :placeholder="$t('review.totalCostPlaceholder')"
                      :min="0.01"
                      :step="0.5"
                      :precision="2"
                      style="width: 100%;"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item
                    :label="$t('review.numberOfPeople')"
                    name="numberOfPeople"
                    :rules="[
                      { type: 'number', min: 1, message: $t('review.numberOfPeopleMin') }
                    ]"
                  >
                    <a-input-number
                      v-model:value="formState.numberOfPeople"
                      :placeholder="$t('review.numberOfPeoplePlaceholder')"
                      :min="1"
                      :step="1"
                      style="width: 100%;"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
            <div class="upload-tips">
              <InfoCircleOutlined />
              {{ $t('review.costInfoTip') }}
            </div>
          </a-space>
        </a-form-item>

        <!-- 图片上传 -->
        <a-form-item :label="$t('review.uploadImages') + ' (可选)'">
          <ImageUpload
            v-model="formState.imageUrls"
            :max-count="9"
            accept="image/jpeg,image/png,image/jpg"
            :max-size="5"
          />
          <div class="upload-tips">
            <InfoCircleOutlined />
            {{ $t('review.uploadImagesTip') }}
          </div>
        </a-form-item>

        <!-- 操作按钮 -->
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" :loading="submitting">
              {{ editMode ? $t('review.updateReview') : $t('review.submitReview') }}
            </a-button>
            <a-button @click="handleCancel">{{ $t('common.cancel') }}</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();

const editMode = ref(!!props.editReview);
const submitting = ref(false);

const formState = reactive({
  rating: props.editReview?.rating || 0,
  comment: props.editReview?.comment || '',
  imageUrls: props.editReview?.imageUrls || [],
  totalCost: props.editReview?.totalCost || null,
  numberOfPeople: props.editReview?.numberOfPeople || null
});

// 监听 editReview 变化
watch(() => props.editReview, (newVal) => {
  if (newVal) {
    editMode.value = true;
    formState.rating = newVal.rating;
    formState.comment = newVal.comment;
    formState.imageUrls = newVal.imageUrls || [];
    formState.totalCost = newVal.totalCost || null;
    formState.numberOfPeople = newVal.numberOfPeople || null;
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
        imageUrls: formState.imageUrls,
        totalCost: formState.totalCost,
        numberOfPeople: formState.numberOfPeople
      });

      if (response.success) {
        message.success(t('review.updateSuccess'));
        emit('success', response.data);
        resetForm();
      } else {
        message.error(response.message || t('review.updateFailed'));
      }
    } else {
      // 创建新评价
      const response = await reviewService.createReview({
        stallId: props.stallId,
        rating: formState.rating,
        comment: formState.comment,
        imageUrls: formState.imageUrls,
        totalCost: formState.totalCost,
        numberOfPeople: formState.numberOfPeople
      });

      if (response.success) {
        message.success(t('review.submitSuccess'));
        emit('success', response.data);
        resetForm();
      } else {
        message.error(response.message || t('review.submitFailed'));
      }
    }
  } catch (error) {
    console.error('Submit review error:', error);
    message.error(error.message || t('messages.operationFailed'));
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
  formState.totalCost = null;
  formState.numberOfPeople = null;
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

.cost-info-section {
  width: 100%;
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
