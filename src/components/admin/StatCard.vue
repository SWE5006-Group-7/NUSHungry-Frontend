<template>
  <div class="stat-card" :style="{ borderColor: color }">
    <div class="stat-content">
      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value" v-loading="loading">
          <template v-if="!loading">
            <animated-number :value="value" />
          </template>
        </div>
        <div class="stat-trend" v-if="trend && !loading">
          <el-icon :color="trend.type === 'up' ? '#67C23A' : '#F56C6C'">
            <component :is="trend.type === 'up' ? 'CaretTop' : 'CaretBottom'" />
          </el-icon>
          <span :class="['trend-value', trend.type]">
            {{ trend.value > 0 ? '+' : '' }}{{ trend.value }}%
          </span>
          <span class="trend-text">较昨日</span>
        </div>
      </div>
      <div class="stat-icon" :style="{ backgroundColor: color + '20', color: color }">
        <el-icon :size="32">
          <component :is="icon" />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';
import { CaretTop, CaretBottom } from '@element-plus/icons-vue';

// Props定义
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    default: 0
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#409EFF'
  },
  trend: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// 动画数字组件
const AnimatedNumber = {
  name: 'AnimatedNumber',
  props: {
    value: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 1000
    }
  },
  setup(props) {
    const displayValue = ref(0);
    let startTime = null;
    let startValue = 0;

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp;
        startValue = displayValue.value;
      }

      const progress = Math.min((timestamp - startTime) / props.duration, 1);
      displayValue.value = Math.floor(startValue + (props.value - startValue) * progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        displayValue.value = props.value;
      }
    };

    watch(() => props.value, (newValue) => {
      startTime = null;
      requestAnimationFrame(animate);
    }, { immediate: true });

    return {
      displayValue
    };
  },
  template: '<span>{{ displayValue.toLocaleString() }}</span>'
};
</script>

<style scoped lang="scss">
.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-left: 4px solid;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .stat-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stat-info {
      flex: 1;

      .stat-title {
        color: #909399;
        font-size: 14px;
        margin-bottom: 12px;
      }

      .stat-value {
        color: #303133;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
        min-height: 34px;
      }

      .stat-trend {
        display: flex;
        align-items: center;
        font-size: 12px;

        .el-icon {
          margin-right: 4px;
        }

        .trend-value {
          margin-right: 4px;
          font-weight: 500;

          &.up {
            color: #67c23a;
          }

          &.down {
            color: #f56c6c;
          }
        }

        .trend-text {
          color: #909399;
        }
      }
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-left: 20px;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .stat-card {
    padding: 16px;

    .stat-content {
      .stat-info {
        .stat-value {
          font-size: 24px;
        }
      }

      .stat-icon {
        width: 56px;
        height: 56px;
        margin-left: 16px;
      }
    }
  }
}
</style>