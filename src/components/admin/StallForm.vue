<template>
  <div class="stall-form">
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      layout="vertical"
    >
      <!-- 基本信息 -->
      <a-divider orientation="left">基本信息</a-divider>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="摊位名称" name="name">
            <a-input
              v-model:value="formData.name"
              placeholder="请输入摊位名称"
              :maxlength="100"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="菜系类型" name="cuisineType">
            <a-select
              v-model:value="formData.cuisineType"
              placeholder="请选择菜系类型"
              show-search
              allow-clear
            >
              <a-select-option value="Chinese">中餐</a-select-option>
              <a-select-option value="Western">西餐</a-select-option>
              <a-select-option value="Japanese">日本料理</a-select-option>
              <a-select-option value="Korean">韩国料理</a-select-option>
              <a-select-option value="Indian">印度料理</a-select-option>
              <a-select-option value="Malay">马来料理</a-select-option>
              <a-select-option value="Thai">泰国料理</a-select-option>
              <a-select-option value="Vietnamese">越南料理</a-select-option>
              <a-select-option value="Mixed">混合</a-select-option>
              <a-select-option value="Vegetarian">素食</a-select-option>
              <a-select-option value="Halal">清真</a-select-option>
              <a-select-option value="Beverages">饮料</a-select-option>
              <a-select-option value="Desserts">甜品</a-select-option>
              <a-select-option value="Other">其他</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="所属食堂" name="cafeteriaId">
            <a-select
              v-model:value="formData.cafeteriaId"
              placeholder="请选择所属食堂"
              show-search
              allow-clear
              :filter-option="filterCafeteria"
              :loading="cafeteriaLoading"
            >
              <a-select-option
                v-for="cafeteria in cafeteriaList"
                :key="cafeteria.id"
                :value="cafeteria.id"
              >
                {{ cafeteria.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="Halal信息" name="halalInfo">
            <a-select
              v-model:value="formData.halalInfo"
              placeholder="请选择Halal信息"
            >
              <a-select-option value="Halal-certified">Halal认证</a-select-option>
              <a-select-option value="Muslim-owned">穆斯林经营</a-select-option>
              <a-select-option value="No pork, no lard">无猪肉无猪油</a-select-option>
              <a-select-option value="Non-halal">非Halal</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="联系方式" name="contact">
        <a-input
          v-model:value="formData.contact"
          placeholder="电话或其他联系方式"
          :maxlength="50"
        />
      </a-form-item>

      <a-form-item label="封面图片URL" name="imageUrl">
        <a-input
          v-model:value="formData.imageUrl"
          placeholder="请输入图片URL或稍后上传"
          :maxlength="500"
        />
        <div v-if="formData.imageUrl" class="image-preview">
          <img :src="formData.imageUrl" alt="封面预览" />
        </div>
      </a-form-item>

      <!-- 统计信息 (仅编辑模式显示) -->
      <template v-if="mode === 'edit' && formData.id">
        <a-divider orientation="left">统计信息</a-divider>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic
              title="平均评分"
              :value="formData.averageRating || 0"
              :precision="1"
              suffix="/ 5.0"
            >
              <template #prefix>
                <star-filled style="color: #faad14" />
              </template>
            </a-statistic>
          </a-col>

          <a-col :span="8">
            <a-statistic
              title="评价数量"
              :value="formData.reviewCount || 0"
              suffix="条"
            />
          </a-col>

          <a-col :span="8">
            <a-statistic
              title="图片数量"
              :value="formData.images?.length || 0"
              suffix="张"
            />
          </a-col>
        </a-row>
      </template>

      <!-- 表单操作按钮 -->
      <a-divider />

      <a-row :gutter="16" justify="end">
        <a-col>
          <a-button @click="handleCancel">取消</a-button>
        </a-col>
        <a-col>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ mode === 'create' ? '创建' : '保存' }}
          </a-button>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { StarFilled } from '@ant-design/icons-vue';
import adminCafeteriaApi from '@/api/admin/cafeteria';

// Props
const props = defineProps({
  mode: {
    type: String,
    default: 'create', // 'create' 或 'edit'
    validator: (value) => ['create', 'edit'].includes(value)
  },
  initialData: {
    type: Object,
    default: () => ({})
  }
});

// Emits
const emit = defineEmits(['submit', 'cancel']);

// 表单引用
const formRef = ref(null);

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  cuisineType: '',
  cafeteriaId: null,
  halalInfo: '',
  contact: '',
  imageUrl: '',
  averageRating: 0,
  reviewCount: 0,
  images: []
});

// 食堂列表
const cafeteriaList = ref([]);
const cafeteriaLoading = ref(false);

// 提交状态
const submitting = ref(false);

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入摊位名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  cuisineType: [
    { required: true, message: '请选择菜系类型', trigger: 'change' }
  ],
  cafeteriaId: [
    { required: false, message: '请选择所属食堂', trigger: 'change' }
  ],
  halalInfo: [
    { required: false, message: '请选择Halal信息', trigger: 'change' }
  ]
};

// 监听初始数据变化
watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      Object.assign(formData, {
        id: newData.id || null,
        name: newData.name || '',
        cuisineType: newData.cuisineType || '',
        cafeteriaId: newData.cafeteria?.id || null,
        halalInfo: newData.halalInfo || '',
        contact: newData.contact || '',
        imageUrl: newData.imageUrl || '',
        averageRating: newData.averageRating || 0,
        reviewCount: newData.reviewCount || 0,
        images: newData.images || []
      });
    }
  },
  { immediate: true, deep: true }
);

// 加载食堂列表
const loadCafeteriaList = async () => {
  try {
    cafeteriaLoading.value = true;
    const response = await adminCafeteriaApi.getCafeteriaList({
      page: 0,
      size: 100 // 加载所有食堂
    });

    if (response.data && response.data.success) {
      cafeteriaList.value = response.data.cafeterias || [];
    }
  } catch (error) {
    console.error('加载食堂列表失败:', error);
    message.error('加载食堂列表失败');
  } finally {
    cafeteriaLoading.value = false;
  }
};

// 食堂搜索过滤
const filterCafeteria = (input, option) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate();

    submitting.value = true;

    // 准备提交数据
    const submitData = {
      name: formData.name,
      cuisineType: formData.cuisineType,
      cafeteriaId: formData.cafeteriaId,
      halalInfo: formData.halalInfo,
      contact: formData.contact,
      imageUrl: formData.imageUrl
    };

    // 触发提交事件
    emit('submit', {
      mode: props.mode,
      data: submitData,
      id: formData.id
    });

  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单填写是否完整');
  } finally {
    submitting.value = false;
  }
};

// 取消
const handleCancel = () => {
  emit('cancel');
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  Object.assign(formData, {
    id: null,
    name: '',
    cuisineType: '',
    cafeteriaId: null,
    halalInfo: '',
    contact: '',
    imageUrl: '',
    averageRating: 0,
    reviewCount: 0,
    images: []
  });
};

// 暴露方法
defineExpose({
  resetForm
});

// 组件挂载时加载食堂列表
onMounted(() => {
  loadCafeteriaList();
});
</script>

<style scoped lang="less">
.stall-form {
  padding: 20px;

  .image-preview {
    margin-top: 10px;

    img {
      max-width: 300px;
      max-height: 200px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
    }
  }

  :deep(.ant-statistic) {
    .ant-statistic-title {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
    }

    .ant-statistic-content {
      color: rgba(0, 0, 0, 0.85);
      font-size: 24px;
    }
  }
}
</style>
