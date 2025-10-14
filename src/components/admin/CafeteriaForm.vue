<template>
  <div class="cafeteria-form">
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
          <a-form-item label="食堂名称" name="name">
            <a-input
              v-model:value="formData.name"
              placeholder="请输入食堂名称"
              :maxlength="100"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="位置" name="location">
            <a-input
              v-model:value="formData.location"
              placeholder="如: UTown, Faculty of Engineering"
              :maxlength="100"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="描述" name="description">
        <a-textarea
          v-model:value="formData.description"
          placeholder="请输入食堂描述"
          :rows="3"
          :maxlength="500"
          show-count
        />
      </a-form-item>

      <!-- 坐标信息 -->
      <a-divider orientation="left">地理位置</a-divider>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="纬度" name="latitude">
            <a-input-number
              v-model:value="formData.latitude"
              placeholder="如: 1.3064"
              :step="0.0001"
              :precision="4"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="经度" name="longitude">
            <a-input-number
              v-model:value="formData.longitude"
              placeholder="如: 103.7729"
              :step="0.0001"
              :precision="4"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 周边设施 -->
      <a-divider orientation="left">周边设施</a-divider>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="最近巴士站" name="nearestBusStop">
            <a-input
              v-model:value="formData.nearestBusStop"
              placeholder="如: UTown Bus Stop"
              :maxlength="100"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="最近停车场" name="nearestCarpark">
            <a-input
              v-model:value="formData.nearestCarpark"
              placeholder="如: UTown Carpark"
              :maxlength="100"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 其他信息 -->
      <a-divider orientation="left">其他信息</a-divider>

      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="座位数" name="seatingCapacity">
            <a-input-number
              v-model:value="formData.seatingCapacity"
              placeholder="座位数量"
              :min="0"
              :step="10"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="清真/素食信息" name="halalInfo">
            <a-input
              v-model:value="formData.halalInfo"
              placeholder="如: HALAL, VEGETARIAN"
              :maxlength="50"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="食堂图片URL" name="imageUrl">
        <a-input
          v-model:value="formData.imageUrl"
          placeholder="请输入图片URL"
          :maxlength="500"
        />
      </a-form-item>

      <!-- 营业时间 -->
      <OpeningHoursInput
        v-model:termTimeHours="formData.termTimeOpeningHours"
        v-model:vacationHours="formData.vacationOpeningHours"
      />
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, defineExpose } from 'vue';
import { message } from 'ant-design-vue';
import OpeningHoursInput from './OpeningHoursInput.vue';

const props = defineProps({
  cafeteria: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});

const formRef = ref(null);

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  location: '',
  latitude: null,
  longitude: null,
  nearestBusStop: '',
  nearestCarpark: '',
  halalInfo: '',
  seatingCapacity: null,
  imageUrl: '',
  termTimeOpeningHours: '周一至周五: 7:00-21:00',
  vacationOpeningHours: '周一至周日: 8:00-20:00'
});

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入食堂名称', trigger: 'blur' },
    { min: 2, max: 100, message: '名称长度应在 2-100 个字符', trigger: 'blur' }
  ],
  location: [
    { required: true, message: '请输入位置', trigger: 'blur' }
  ],
  latitude: [
    { required: true, message: '请输入纬度', trigger: 'blur' },
    { type: 'number', message: '纬度必须是数字', trigger: 'blur' }
  ],
  longitude: [
    { required: true, message: '请输入经度', trigger: 'blur' },
    { type: 'number', message: '经度必须是数字', trigger: 'blur' }
  ]
};

// 监听 cafeteria 变化,用于编辑模式
watch(
  () => props.cafeteria,
  (newCafeteria) => {
    if (newCafeteria) {
      Object.assign(formData, {
        name: newCafeteria.name || '',
        description: newCafeteria.description || '',
        location: newCafeteria.location || '',
        latitude: newCafeteria.latitude || null,
        longitude: newCafeteria.longitude || null,
        nearestBusStop: newCafeteria.nearestBusStop || '',
        nearestCarpark: newCafeteria.nearestCarpark || '',
        halalInfo: newCafeteria.halalInfo || '',
        seatingCapacity: newCafeteria.seatingCapacity || null,
        imageUrl: newCafeteria.imageUrl || '',
        termTimeOpeningHours: newCafeteria.termTimeOpeningHours || '周一至周五: 7:00-21:00',
        vacationOpeningHours: newCafeteria.vacationOpeningHours || '周一至周日: 8:00-20:00'
      });
    }
  },
  { immediate: true }
);

// 验证并返回表单数据
const validate = async () => {
  try {
    await formRef.value.validate();
    return { ...formData };
  } catch (error) {
    message.error('请检查表单输入');
    return null;
  }
};

// 重置表单
const resetFields = () => {
  formRef.value.resetFields();
};

// 暴露方法给父组件
defineExpose({
  validate,
  resetFields
});
</script>

<style scoped lang="scss">
.cafeteria-form {
  padding: 8px 0;

  :deep(.ant-divider-horizontal.ant-divider-with-text-left) {
    margin: 20px 0 16px;
    font-weight: 600;
    color: #262626;
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  :deep(.ant-input-number) {
    width: 100%;
  }
}
</style>
