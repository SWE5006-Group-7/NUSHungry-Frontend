<template>
  <div class="admin-dashboard">
    <!-- 页面标题 -->
    <div class="dashboard-header">
      <h1>仪表板</h1>
      <p>欢迎回来，{{ userInfo?.username || 'Admin' }}！这里是系统数据概览。</p>
    </div>

    <!-- 统计卡片区域 -->
    <a-row :gutter="[16, 16]" class="stats-cards">
      <a-col :xs="24" :sm="12" :md="6" v-for="card in statsCards" :key="card.title">
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

    <!-- 图表区域 -->
    <a-row :gutter="[16, 16]" class="charts-section">
      <!-- 用户增长趋势 -->
      <a-col :xs="24" :lg="16">
        <a-card title="用户增长趋势" :loading="chartsLoading">
          <template #extra>
            <a-range-picker
              v-model:value="dateRange"
              @change="fetchUserGrowth"
              :presets="datePresets"
            />
          </template>
          <div class="chart-container" style="height: 300px;">
            <a-empty v-if="!userGrowthData.length" description="暂无数据" />
            <div v-else>
              <!-- 这里应该放置图表组件，暂时用占位符 -->
              <div style="text-align: center; padding: 50px 0; color: #999;">
                用户增长趋势图表
              </div>
            </div>
          </div>
        </a-card>
      </a-col>

      <!-- 系统概览 -->
      <a-col :xs="24" :lg="8">
        <a-card title="系统概览">
          <div class="overview-content">
            <div class="overview-item" v-for="item in overviewItems" :key="item.label">
              <div class="overview-label">{{ item.label }}</div>
              <div class="overview-value">{{ item.value }}</div>
              <a-progress
                v-if="item.progress !== undefined"
                :percent="item.progress"
                :stroke-color="item.progressColor"
                :stroke-width="6"
              />
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 数据表格区域 -->
    <a-row :gutter="[16, 16]" class="tables-section">
      <!-- 最新用户 -->
      <a-col :xs="24" :lg="12">
        <a-card title="最新注册用户">
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
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.enabled ? 'green' : 'red'">
                  {{ record.enabled ? '正常' : '禁用' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>

      <!-- 最新评价 -->
      <a-col :xs="24" :lg="12">
        <a-card title="最新评价">
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
                <a-rate :value="record.rating" disabled allow-half />
              </template>
              <template v-else-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="6" :md="4" v-for="action in quickActions" :key="action.title">
          <div class="action-card" @click="handleQuickAction(action)">
            <component :is="action.icon" :style="{ fontSize: '32px', color: action.color }" />
            <span>{{ action.title }}</span>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  UserOutlined,
  ShoppingOutlined,
  StarOutlined,
  DollarOutlined,
  RightOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined
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
    title: '总摊位数',
    value: 0,
    icon: ShoppingOutlined,
    color: '#52c41a',
    trend: 0
  },
  {
    title: '总评价数',
    value: 0,
    icon: StarOutlined,
    color: '#faad14',
    trend: 0
  },
  {
    title: '今日订单',
    value: 0,
    icon: DollarOutlined,
    color: '#722ed1',
    trend: 0
  }
]);

// 系统概览数据
const overviewItems = ref([
  { label: '系统运行时间', value: '0天' },
  { label: '活跃用户', value: '0', progress: 0, progressColor: '#52c41a' },
  { label: '待处理投诉', value: '0', progress: 0, progressColor: '#faad14' },
  { label: '系统健康度', value: '加载中...', progress: 0, progressColor: '#1890ff' }
]);

// 用户增长数据
const userGrowthData = ref([]);

// 最新用户数据
const latestUsers = ref([]);

// 用户表格列配置
const userColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '状态', key: 'status', width: 80 }
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
  { title: '添加用户', icon: PlusOutlined, color: '#1890ff', action: 'addUser' },
  { title: '添加摊位', icon: PlusOutlined, color: '#52c41a', action: 'addStall' },
  { title: '查看评价', icon: StarOutlined, color: '#faad14', action: 'viewReviews' },
  { title: '系统设置', icon: SettingOutlined, color: '#722ed1', action: 'settings' }
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
          title: '总摊位数',
          value: data.statsCards.totalStalls || 0,
          icon: ShoppingOutlined,
          color: '#52c41a',
          trend: data.statsCards.stallTrend || 0
        },
        {
          title: '总评价数',
          value: data.statsCards.totalReviews || 0,
          icon: StarOutlined,
          color: '#faad14',
          trend: data.statsCards.reviewTrend || 0
        },
        {
          title: '今日订单',
          value: data.statsCards.todayOrders || 0,
          icon: DollarOutlined,
          color: '#722ed1',
          trend: data.statsCards.orderTrend || 0
        }
      ];
    }

    // 更新系统概览
    if (data.systemOverview) {
      const overview = data.systemOverview;
      overviewItems.value = [
        {
          label: '系统运行时间',
          value: `${overview.runningDays || 0}天`
        },
        {
          label: '活跃用户',
          value: `${overview.activeUsers || 0}`,
          progress: overview.activeUserPercentage || 0,
          progressColor: '#52c41a'
        },
        {
          label: '待处理投诉',
          value: `${overview.pendingComplaints || 0}`,
          progress: overview.pendingComplaintPercentage || 0,
          progressColor: '#faad14'
        },
        {
          label: '系统健康度',
          value: overview.healthStatus || '良好',
          progress: overview.healthScore || 0,
          progressColor: '#1890ff'
        }
      ];
    }

    // 更新用户增长数据
    if (data.userGrowthData) {
      userGrowthData.value = data.userGrowthData;
    }

    // 更新最新用户
    if (data.latestUsers) {
      latestUsers.value = data.latestUsers;
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
  message.info('评价管理功能正在开发中');
};

// 处理快捷操作
const handleQuickAction = (action) => {
  switch (action.action) {
    case 'addUser':
      message.info('添加用户功能正在开发中');
      break;
    case 'addStall':
      message.info('添加摊位功能正在开发中');
      break;
    case 'viewReviews':
      goToReviewManagement();
      break;
    case 'settings':
      message.info('系统设置功能正在开发中');
      break;
    default:
      break;
  }
};

// 初始化数据
onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped lang="scss">
.admin-dashboard {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);

  .dashboard-header {
    margin-bottom: 24px;

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
  }

  .overview-content {
    .overview-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .overview-label {
        color: #909399;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .overview-value {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }
    }
  }

  .quick-actions {
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
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
}

// 响应式设计
@media screen and (max-width: 768px) {
  .admin-dashboard {
    padding: 12px;

    .dashboard-header {
      h1 {
        font-size: 24px;
      }
    }

    .quick-actions {
      .action-card {
        padding: 16px;
      }
    }
  }
}
</style>