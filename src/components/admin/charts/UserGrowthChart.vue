<template>
  <div class="user-growth-chart" ref="chartRef" v-loading="loading"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({ dates: [], values: [] })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref(null);
let chartInstance = null;

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}<br/>新增用户: {c}人'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.dates,
      axisTick: {
        alignWithLabel: true
      },
      axisLabel: {
        rotate: 45,
        formatter: (value) => {
          // 格式化日期显示
          const date = new Date(value);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '用户数',
      minInterval: 1
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: props.data.values,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#409EFF20' }
          ])
        },
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        itemStyle: {
          color: '#409EFF',
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            color: '#409EFF',
            borderColor: '#409EFF',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(64, 158, 255, 0.3)'
          }
        }
      }
    ]
  };

  chartInstance.setOption(option);
};

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) {
    initChart();
    return;
  }

  chartInstance.setOption({
    xAxis: {
      data: props.data.dates
    },
    series: [
      {
        data: props.data.values
      }
    ]
  });
};

// 监听窗口大小变化
const handleResize = () => {
  chartInstance?.resize();
};

// 监听数据变化
watch(
  () => props.data,
  () => {
    updateChart();
  },
  { deep: true }
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
});
</script>

<style scoped>
.user-growth-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>