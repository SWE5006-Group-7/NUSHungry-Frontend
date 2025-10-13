<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1>仪表板</h1>
          <p>欢迎回来，{{ userInfo?.username || 'Admin' }}！这里是系统数据概览。</p>
        </div>
        <a-button type="primary" size="large" @click="goToHomepage">
          <template #icon><ShoppingOutlined /></template>
          前往首页
        </a-button>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <a-row :gutter="[16, 16]" class="quick-actions-row">
        <a-col :flex="1" v-for="action in quickActions" :key="action.title">
          <div class="action-card" @click="handleQuickAction(action)">
            <component :is="action.icon" :style="{ fontSize: '32px', color: action.color }" />
            <span>{{ action.title }}</span>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <h3>数据概览</h3>
      <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="12" :sm="12" :md="6" v-for="card in statsCards" :key="card.title">
        <a-card :loading="statsLoading" hoverable>
          <a-statistic
            :title="card.title"
            :value="card.value"
            :precision="0"
            :value-style="{ color: card.color }"
          >
            <template #prefix>
              <component :is="card.icon" />
            </template>
            <template #suffix v-if="card.trend">
              <span :style="{ color: card.trend > 0 ? '#52c41a' : '#f5222d', fontSize: '14px' }">
                {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
              </span>
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>
    </div>

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <!-- 用户增长趋势 -->
      <a-col :xs="24">
        <a-card title="用户增长趋势" :loading="chartsLoading">
          <template #extra>
            <a-space>
              <a-segmented
                v-model:value="chartViewMode"
                :options="chartViewOptions"
                @change="handleViewModeChange"
              />
              <a-range-picker
                v-model:value="dateRange"
                @change="fetchUserGrowth"
                :presets="datePresets"
              />
            </a-space>
          </template>
          <div class="chart-container" style="height: 300px;">
            <a-empty v-if="!userGrowthData.length" description="暂无数据" />
            <div v-else ref="userGrowthChart" style="width: 100%; height: 100%;"></div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据表格区域 -->
    <a-row :gutter="[16, 16]" class="tables-section">
      <!-- 最新用户 -->
      <a-col :xs="24" :lg="12">
        <a-card title="最新注册用户" class="table-card-equal-height">
          <template #extra>
            <a-button type="link" @click="goToUserManagement">
              查看全部 <RightOutlined />
            </a-button>
          </template>
          <a-table
            :columns="userColumns"
            :data-source="latestUsers"
            :loading="tablesLoading"
            :pagination="false"
            size="small"
          />
        </a-card>
      </a-col>

      <!-- 最新评价 -->
      <a-col :xs="24" :lg="12">
        <a-card title="最新评价" class="table-card-equal-height">
          <template #extra>
            <a-button type="link" @click="goToReviewManagement">
              查看全部 <RightOutlined />
            </a-button>
          </template>
          <a-table
            :columns="reviewColumns"
            :data-source="latestReviews"
            :loading="tablesLoading"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'rating'">
                <a-rate :value="record.rating" disabled allow-half style="font-size: 14px;" />
              </template>
              <template v-else-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed, h, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { message, Avatar, Tag } from 'ant-design-vue';
import dayjs from 'dayjs';
import * as echarts from 'echarts';
import {
  UserOutlined,
  ShoppingOutlined,
  StarOutlined,
  DollarOutlined,
  RightOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PictureOutlined
} from '@ant-design/icons-vue';
import adminDashboardApi from '@/api/admin/dashboard';

const router = useRouter();

// 用户信息
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'));

// 加载状态
const statsLoading = ref(false);
const chartsLoading = ref(false);
const tablesLoading = ref(false);

// 日期范围
const dateRange = ref([dayjs().subtract(7, 'days'), dayjs()]);

// 日期预设
const datePresets = ref([
  { label: '最近7天', value: [dayjs().subtract(7, 'days'), dayjs()] },
  { label: '最近30天', value: [dayjs().subtract(30, 'days'), dayjs()] },
  { label: '最近3个月', value: [dayjs().subtract(3, 'months'), dayjs()] }
]);

// 统计卡片数据
const statsCards = ref([
  {
    title: '总用户数',
    value: 0,
    icon: UserOutlined,
    color: '#1890ff',
    trend: 0
  },
  {
    title: '总食堂数',
    value: 0,
    icon: ShoppingOutlined,
    color: '#52c41a',
    trend: 0
  },
  {
    title: '总摊位数',
    value: 0,
    icon: ShoppingOutlined,
    color: '#13c2c2'
  },
  {
    title: '总评价数',
    value: 0,
    icon: StarOutlined,
    color: '#faad14',
    trend: 0
  }
]);

// 用户增长数据
const userGrowthData = ref([]);

// 图表视图模式
const chartViewMode = ref('incremental'); // 'incremental' 或 'cumulative'
const chartViewOptions = [
  { label: '新增用户', value: 'incremental' },
  { label: '累计用户', value: 'cumulative' }
];

// 图表实例
const userGrowthChart = ref(null);
let chartInstance = null;

// 最新用户数据
const latestUsers = ref([]);

// 默认头像
const defaultAvatar = '/default-avatar.png';

// 获取角色名称
const getRoleName = (role) => {
  const roleMap = {
    'ROLE_ADMIN': '管理员',
    'ROLE_USER': '普通用户',
    'ADMIN': '管理员',
    'USER': '普通用户'
  };
  return roleMap[role] || role;
};

// 获取角色标签颜色
const getRoleTagColor = (role) => {
  const colorMap = {
    'ROLE_ADMIN': 'red',
    'ROLE_USER': 'blue',
    'ADMIN': 'red',
    'USER': 'blue'
  };
  return colorMap[role] || 'default';
};

// 用户表格列配置
const userColumns = [
  {
    title: '用户',
    key: 'user',
    customRender: ({ record }) => {
      return h('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px' }
      }, [
        h(Avatar, {
          src: record.avatarUrl || defaultAvatar,
          size: 32
        }, () => record.username?.charAt(0)),
        h('div', {
          style: { flex: '1', minWidth: '0' }
        }, [
          h('div', {
            style: { fontWeight: '500', color: '#303133', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
          }, record.username),
          h('div', {
            style: { fontSize: '12px', color: '#909399', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
          }, record.email)
        ])
      ]);
    }
  },
  {
    title: '角色',
    key: 'role',
    width: 100,
    customRender: ({ record }) => {
      return h(Tag, { color: getRoleTagColor(record.role) }, () => getRoleName(record.role));
    }
  },
  {
    title: '注册时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    customRender: ({ text }) => formatDate(text)
  }
];

// 最新评价数据
const latestReviews = ref([]);

// 评价表格列配置
const reviewColumns = [
  { title: '用户', dataIndex: 'username', key: 'username', width: 100 },
  { title: '摊位', dataIndex: 'stallName', key: 'stallName' },
  { title: '评分', key: 'rating', width: 150 },
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt' }
];

// 快捷操作
const quickActions = ref([
  { title: '食堂管理', icon: ShoppingOutlined, color: '#13c2c2', action: 'manageCafeterias' },
  { title: '摊位管理', icon: ShoppingOutlined, color: '#722ed1', action: 'manageStalls' },
  { title: '用户管理', icon: UserOutlined, color: '#1890ff', action: 'manageUsers' },
  { title: '评价管理', icon: StarOutlined, color: '#faad14', action: 'manageReviews' },
  { title: '图片管理', icon: PictureOutlined, color: '#eb2f96', action: 'manageImages' }
]);

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

// 获取仪表板统计数据
const fetchDashboardData = async () => {
  statsLoading.value = true;
  chartsLoading.value = true;
  tablesLoading.value = true;

  try {
    const response = await adminDashboardApi.getDashboardStats();
    const data = response.data;

    // 更新统计卡片
    if (data.statsCards) {
      statsCards.value = [
        {
          title: '总用户数',
          value: data.statsCards.totalUsers || 0,
          icon: UserOutlined,
          color: '#1890ff',
          trend: data.statsCards.userTrend || 0
        },
        {
          title: '总食堂数',
          value: data.statsCards.totalCafeterias || 0,
          icon: ShoppingOutlined,
          color: '#52c41a',
          trend: data.statsCards.cafeteriaTrend || 0
        },
        {
          title: '总摊位数',
          value: data.statsCards.totalStalls || 0,
          icon: ShoppingOutlined,
          color: '#13c2c2'
        },
        {
          title: '总评价数',
          value: data.statsCards.totalReviews || 0,
          icon: StarOutlined,
          color: '#faad14',
          trend: data.statsCards.reviewTrend || 0
        }
      ];
    }

    // 更新用户增长数据
    if (data.userGrowthData) {
      userGrowthData.value = data.userGrowthData;
      console.log('User growth data loaded:', userGrowthData.value);
      // watch会自动监听数据变化并初始化图表
    }

    // 更新最新用户
    if (data.latestUsers) {
      latestUsers.value = data.latestUsers;
      console.log('Latest users data:', data.latestUsers);
      if (data.latestUsers.length > 0) {
        console.log('First user role:', data.latestUsers[0].role);
      }
    }

    // 更新最新评价
    if (data.latestReviews) {
      latestReviews.value = data.latestReviews;
    }

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    message.error('获取仪表板数据失败');
  } finally {
    statsLoading.value = false;
    chartsLoading.value = false;
    tablesLoading.value = false;
  }
};

// 跳转到用户管理
const goToUserManagement = () => {
  router.push('/admin/users');
};

// 跳转到评价管理
const goToReviewManagement = () => {
  router.push('/admin/reviews');
};

// 跳转到食堂管理
const goToCafeteriaManagement = () => {
  router.push('/admin/cafeterias');
};

// 跳转到摊位管理
const goToStallManagement = () => {
  router.push('/admin/stalls');
};

// 跳转到首页
const goToHomepage = () => {
  router.push('/');
};

// 初始化用户增长图表
const initUserGrowthChart = () => {
  console.log('initUserGrowthChart called:', {
    chartElement: userGrowthChart.value,
    dataLength: userGrowthData.value?.length,
    hasData: !!userGrowthData.value.length
  });

  if (!userGrowthChart.value) {
    console.warn('Chart DOM element not found');
    return;
  }

  if (!userGrowthData.value.length) {
    console.warn('No chart data available');
    return;
  }

  // 如果图表已存在,先销毁
  if (chartInstance) {
    console.log('Disposing existing chart');
    chartInstance.dispose();
  }

  // 创建新图表实例
  console.log('Creating chart instance');
  chartInstance = echarts.init(userGrowthChart.value);

  // 准备图表数据
  const dates = userGrowthData.value.map(item => item.date);
  const counts = userGrowthData.value.map(item => item.count);

  // 计算累计数据
  let displayData = counts;
  let labelText = '新增用户';

  if (chartViewMode.value === 'cumulative') {
    displayData = [];
    let cumulative = 0;
    for (let count of counts) {
      cumulative += count;
      displayData.push(cumulative);
    }
    labelText = '累计用户';
  }

  // 配置现代折线图选项
  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e8e8e8',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        },
        lineStyle: {
          type: 'dashed'
        }
      },
      formatter: function(params) {
        const param = params[0];
        return `<div style="padding: 8px;">
          <div style="font-weight: 600; margin-bottom: 4px;">${param.name}</div>
          <div style="color: #1890ff;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #1890ff; margin-right: 6px;"></span>
            ${labelText}: <strong>${param.value}</strong> 人
          </div>
        </div>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#e8e8e8'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12,
        rotate: 0
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: labelText,
        type: 'line',
        data: displayData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#36cfc9' }
            ]
          }
        },
        itemStyle: {
          color: '#1890ff',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
            ]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#1890ff',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(24, 144, 255, 0.5)'
          }
        }
      }
    ]
  };

  chartInstance.setOption(option);
  console.log('Chart initialized successfully');
};

// 获取用户增长数据
const fetchUserGrowth = async () => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return;
  }

  chartsLoading.value = true;
  try {
    const startDate = dateRange.value[0].format('YYYY-MM-DD');
    const endDate = dateRange.value[1].format('YYYY-MM-DD');

    console.log('Fetching user growth data:', { startDate, endDate });

    const response = await adminDashboardApi.getUserGrowth(startDate, endDate);
    if (response.data) {
      userGrowthData.value = response.data;
      console.log('User growth data fetched:', response.data);
      // watch会自动监听数据变化并初始化图表
    }
  } catch (error) {
    console.error('Failed to fetch user growth data:', error);
    message.error('获取用户增长数据失败');
  } finally {
    chartsLoading.value = false;
  }
};

// 处理视图模式切换
const handleViewModeChange = () => {
  console.log('Chart view mode changed to:', chartViewMode.value);
  // 重新初始化图表以应用新的视图模式
  if (userGrowthData.value.length > 0) {
    initUserGrowthChart();
  }
};

// 处理快捷操作
const handleQuickAction = (action) => {
  switch (action.action) {
    case 'addCafeteria':
      router.push('/admin/cafeterias');
      break;
    case 'manageCafeterias':
      goToCafeteriaManagement();
      break;
    case 'manageStalls':
      goToStallManagement();
      break;
    case 'manageUsers':
      goToUserManagement();
      break;
    case 'manageReviews':
      router.push('/admin/reviews');
      break;
    case 'manageImages':
      router.push('/admin/images');
      break;
    default:
      break;
  }
};

// 监听用户增长数据变化,数据更新后初始化图表
watch(userGrowthData, async (newData) => {
  if (newData && newData.length > 0) {
    console.log('userGrowthData changed, initializing chart...');
    // 等待DOM更新
    await nextTick();
    // 再等待一个tick确保v-if的DOM完全渲染
    await nextTick();
    initUserGrowthChart();
  }
}, { deep: true });

// 窗口大小调整处理
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 初始化数据
onMounted(() => {
  fetchDashboardData();
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding: 24px 12%;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);

  .dashboard-header {
    margin-bottom: 24px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;

      @media screen and (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    h1 {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 8px;
    }

    p {
      color: #606266;
      font-size: 14px;
    }
  }

  .stats-cards {
    margin-bottom: 24px;

    :deep(.ant-statistic-title) {
      color: #909399;
      font-size: 14px;
    }

    :deep(.ant-statistic-content) {
      font-size: 24px;
      font-weight: 600;
    }
  }

  .charts-section,
  .tables-section {
    margin-bottom: 24px;

    .chart-container {
      width: 100%;
      min-height: 300px;
    }

    .table-card-equal-height {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.ant-card-body) {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      :deep(.ant-table-wrapper) {
        flex: 1;
      }
    }
  }

  .quick-actions {
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }

    .quick-actions-row {
      display: flex;
      flex-wrap: wrap;
    }

    .action-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      border: 1px solid #e8e8e8;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: #1890ff;
      }

      span {
        display: block;
        margin-top: 12px;
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .stats-section {
    margin-bottom: 24px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .admin-dashboard {
    padding: 12px 5%;

    .dashboard-header {
      h1 {
        font-size: 24px;
      }
    }

    .quick-actions {
      .action-card {
        padding: 12px 8px;

        :deep(.anticon) {
          font-size: 24px !important;
        }

        span {
          font-size: 12px;
          margin-top: 8px;
        }
      }
    }
  }
}
</style>