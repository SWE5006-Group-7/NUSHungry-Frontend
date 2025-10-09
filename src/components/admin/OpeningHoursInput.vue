<template>
  <div class="opening-hours-input">
    <a-divider orientation="left">营业时间</a-divider>

    <!-- 学期营业时间 -->
    <a-form-item label="学期营业时间">
      <a-input
        :value="termTimeHours"
        @input="handleTermTimeInput"
        placeholder="如: 周一至周五: 7:00-21:00"
        :maxlength="100"
      >
        <template #addonAfter>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleTermTimePreset">
                <a-menu-item key="weekday">周一至周五: 7:00-21:00</a-menu-item>
                <a-menu-item key="everyday">每天: 7:00-22:00</a-menu-item>
                <a-menu-item key="limited">周一至周五: 8:00-18:00</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="closed">暂停营业</a-menu-item>
              </a-menu>
            </template>
            <a-button size="small">
              快速填充 <DownOutlined />
            </a-button>
          </a-dropdown>
        </template>
      </a-input>
      <div class="input-hint">
        学期期间的营业时间
      </div>
    </a-form-item>

    <!-- 假期营业时间 -->
    <a-form-item label="假期营业时间">
      <a-input
        :value="vacationHours"
        @input="handleVacationInput"
        placeholder="如: 周一至周日: 8:00-20:00"
        :maxlength="100"
      >
        <template #addonAfter>
          <a-dropdown>
            <template #overlay>
              <a-menu @click="handleVacationPreset">
                <a-menu-item key="everyday">每天: 8:00-20:00</a-menu-item>
                <a-menu-item key="weekend">周末: 9:00-18:00</a-menu-item>
                <a-menu-item key="limited">每天: 10:00-17:00</a-menu-item>
                <a-menu-divider />
                <a-menu-item key="closed">暂停营业</a-menu-item>
              </a-menu>
            </template>
            <a-button size="small">
              快速填充 <DownOutlined />
            </a-button>
          </a-dropdown>
        </template>
      </a-input>
      <div class="input-hint">
        假期期间的营业时间
      </div>
    </a-form-item>

    <!-- 营业时间预览 -->
    <a-card size="small" class="preview-card">
      <template #title>
        <ClockCircleOutlined /> 营业时间预览
      </template>
      <div class="preview-content">
        <div class="preview-item">
          <strong>学期:</strong> {{ termTimeHours || '未设置' }}
        </div>
        <div class="preview-item">
          <strong>假期:</strong> {{ vacationHours || '未设置' }}
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { DownOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  termTimeHours: {
    type: String,
    default: ''
  },
  vacationHours: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:termTimeHours', 'update:vacationHours']);

// 学期时间输入处理
const handleTermTimeInput = (e) => {
  emit('update:termTimeHours', e.target.value);
};

// 假期时间输入处理
const handleVacationInput = (e) => {
  emit('update:vacationHours', e.target.value);
};

// 学期时间预设值
const termTimePresets = {
  weekday: '周一至周五: 7:00-21:00',
  everyday: '每天: 7:00-22:00',
  limited: '周一至周五: 8:00-18:00',
  closed: '暂停营业'
};

// 假期时间预设值
const vacationPresets = {
  everyday: '每天: 8:00-20:00',
  weekend: '周末: 9:00-18:00',
  limited: '每天: 10:00-17:00',
  closed: '暂停营业'
};

// 学期时间预设选择
const handleTermTimePreset = ({ key }) => {
  emit('update:termTimeHours', termTimePresets[key]);
};

// 假期时间预设选择
const handleVacationPreset = ({ key }) => {
  emit('update:vacationHours', vacationPresets[key]);
};
</script>

<style scoped lang="scss">
.opening-hours-input {
  margin-top: 16px;

  .input-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #8c8c8c;
  }

  .preview-card {
    margin-top: 16px;
    background-color: #fafafa;

    :deep(.ant-card-head) {
      padding: 0 12px;
      min-height: 36px;
      font-size: 14px;
    }

    :deep(.ant-card-body) {
      padding: 12px;
    }

    .preview-content {
      .preview-item {
        padding: 6px 0;
        font-size: 13px;
        line-height: 1.8;

        strong {
          color: #262626;
          margin-right: 8px;
        }
      }
    }
  }

  :deep(.ant-input-group-addon) {
    padding: 0;

    .ant-btn {
      border: none;
      height: 100%;
    }
  }
}
</style>
