<template>
  <div class="review-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="goToDashboard" style="margin-right: 12px;">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <h2>评价管理</h2>
        <span class="subtitle">评价与举报统一管理</span>
      </div>
      <div class="header-right">
        <a-button @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
    </div>

    <!-- 标签页 -->
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <!-- 所有评价标签 -->
      <a-tab-pane key="reviews" tab="所有评价">
        <!-- 统计卡片 -->
        <a-row :gutter="16" style="margin-bottom: 16px;">
          <a-col :span="6">
            <a-card>
              <a-statistic title="总评价数" :value="reviewStats.totalCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="平均评分" :value="reviewStats.avgRating" :precision="1" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="今日新增" :value="reviewStats.todayCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="被举报" :value="reviewStats.reportedCount" />
            </a-card>
          </a-col>
        </a-row>

        <!-- 搜索和筛选 -->
        <a-card class="filter-card">
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :md="8">
              <a-input
                v-model:value="reviewFilters.keyword"
                placeholder="搜索评论内容"
                allow-clear
                @pressEnter="fetchReviews"
              >
                <template #prefix>
                  <SearchOutlined />
                </template>
              </a-input>
            </a-col>
            <a-col :xs="12" :sm="6" :md="4">
              <a-select
                v-model:value="reviewFilters.rating"
                placeholder="评分筛选"
                style="width: 100%"
                allow-clear
                @change="fetchReviews"
              >
                <a-select-option :value="null">全部评分</a-select-option>
                <a-select-option :value="5">5星</a-select-option>
                <a-select-option :value="4">4星</a-select-option>
                <a-select-option :value="3">3星</a-select-option>
                <a-select-option :value="2">2星</a-select-option>
                <a-select-option :value="1">1星</a-select-option>
              </a-select>
            </a-col>
            <a-col :xs="24" :sm="12" :md="8">
              <a-space>
                <a-button type="primary" @click="fetchReviews">
                  <template #icon><SearchOutlined /></template>
                  搜索
                </a-button>
                <a-button @click="resetReviewFilters">
                  <template #icon><ReloadOutlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-card>

        <!-- 评价表格 -->
        <a-card class="table-card">
          <a-table
            :columns="reviewColumns"
            :data-source="reviews"
            :loading="reviewLoading"
            :pagination="reviewPagination"
            @change="handleReviewTableChange"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'user'">
                <a-space>
                  <a-avatar :src="record.user?.avatarUrl" :size="32">
                    {{ record.user?.username?.[0] }}
                  </a-avatar>
                  <span>{{ record.user?.username }}</span>
                </a-space>
              </template>
              <template v-else-if="column.key === 'stall'">
                {{ record.stall?.name }}
              </template>
              <template v-else-if="column.key === 'rating'">
                <a-rate :value="record.rating" disabled allow-half />
              </template>
              <template v-else-if="column.key === 'comment'">
                <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;">
                  {{ record.comment }}
                </div>
              </template>
              <template v-else-if="column.key === 'moderationStatus'">
                <a-tag :color="getModerationStatusColor(record.moderationStatus)">
                  {{ getModerationStatusText(record.moderationStatus) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="viewReviewDetail(record)">
                    查看详情
                  </a-button>
                  <a-button type="link" size="small" danger @click="deleteReview(record)">
                    删除
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <!-- 举报管理标签 -->
      <a-tab-pane key="reports" tab="举报管理">
        <!-- 统计卡片 -->
        <a-row :gutter="16" style="margin-bottom: 16px;">
          <a-col :span="6">
            <a-card>
              <a-statistic title="待处理" :value="reportStats.pendingCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="已处理" :value="reportStats.processedCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="已驳回" :value="reportStats.rejectedCount" />
            </a-card>
          </a-col>
          <a-col :span="6">
            <a-card>
              <a-statistic title="总举报数" :value="reportStats.totalCount" />
            </a-card>
          </a-col>
        </a-row>

        <!-- 搜索和筛选 -->
        <a-card class="filter-card">
          <a-row :gutter="[16, 16]">
            <a-col :xs="12" :sm="6" :md="4">
              <a-select
                v-model:value="reportFilters.status"
                placeholder="状态筛选"
                style="width: 100%"
                allow-clear
                @change="fetchReports"
              >
                <a-select-option value="">全部状态</a-select-option>
                <a-select-option value="PENDING">待处理</a-select-option>
                <a-select-option value="RESOLVED">已处理</a-select-option>
                <a-select-option value="REJECTED">已驳回</a-select-option>
              </a-select>
            </a-col>
            <a-col :xs="12" :sm="6" :md="4">
              <a-select
                v-model:value="reportFilters.reason"
                placeholder="举报原因"
                style="width: 100%"
                allow-clear
                @change="fetchReports"
              >
                <a-select-option value="">全部原因</a-select-option>
                <a-select-option value="SPAM">垃圾信息</a-select-option>
                <a-select-option value="INAPPROPRIATE">不当内容</a-select-option>
                <a-select-option value="FAKE">虚假评价</a-select-option>
                <a-select-option value="OTHER">其他</a-select-option>
              </a-select>
            </a-col>
            <a-col :xs="24" :sm="12" :md="8">
              <a-space>
                <a-button type="primary" @click="fetchReports">
                  <template #icon><SearchOutlined /></template>
                  搜索
                </a-button>
                <a-button @click="resetReportFilters">
                  <template #icon><ReloadOutlined /></template>
                  重置
                </a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-card>

        <!-- 举报表格 -->
        <a-card class="table-card">
          <a-table
            :columns="reportColumns"
            :data-source="reports"
            :loading="reportLoading"
            :pagination="reportPagination"
            @change="handleReportTableChange"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'reporter'">
                <a-space>
                  <a-avatar :src="record.reporter?.avatarUrl" :size="32">
                    {{ record.reporter?.username?.[0] }}
                  </a-avatar>
                  <span>{{ record.reporter?.username }}</span>
                </a-space>
              </template>
              <template v-else-if="column.key === 'review'">
                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                  {{ record.review?.comment }}
                </div>
              </template>
              <template v-else-if="column.key === 'reason'">
                <a-tag>{{ getReasonText(record.reason) }}</a-tag>
              </template>
              <template v-else-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'createdAt'">
                {{ formatDate(record.createdAt) }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="viewReportDetail(record)">
                    查看详情
                  </a-button>
                  <a-button
                    v-if="record.status === 'PENDING'"
                    type="link"
                    size="small"
                    @click="handleReport(record, 'RESOLVED')"
                  >
                    处理
                  </a-button>
                  <a-button
                    v-if="record.status === 'PENDING'"
                    type="link"
                    size="small"
                    danger
                    @click="handleReport(record, 'REJECTED')"
                  >
                    驳回
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>

    <!-- 评价详情模态框 -->
    <a-modal
      v-model:open="reviewDetailVisible"
      title="评价详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions v-if="currentReview" :column="1" bordered>
        <a-descriptions-item label="用户">
          <a-space>
            <a-avatar :src="currentReview.user?.avatarUrl">
              {{ currentReview.user?.username?.[0] }}
            </a-avatar>
            <span>{{ currentReview.user?.username }}</span>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="摊位">
          {{ currentReview.stall?.name }}
        </a-descriptions-item>
        <a-descriptions-item label="评分">
          <a-rate :value="currentReview.rating" disabled allow-half />
        </a-descriptions-item>
        <a-descriptions-item label="评论内容">
          {{ currentReview.comment }}
        </a-descriptions-item>
        <a-descriptions-item label="审核状态">
          <a-tag :color="getModerationStatusColor(currentReview.moderationStatus)">
            {{ getModerationStatusText(currentReview.moderationStatus) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatDate(currentReview.createdAt) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- 举报详情模态框 -->
    <a-modal
      v-model:open="reportDetailVisible"
      title="举报详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions v-if="currentReport" :column="1" bordered>
        <a-descriptions-item label="举报人">
          <a-space>
            <a-avatar :src="currentReport.reporter?.avatarUrl">
              {{ currentReport.reporter?.username?.[0] }}
            </a-avatar>
            <span>{{ currentReport.reporter?.username }}</span>
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="被举报评价">
          {{ currentReport.review?.comment }}
        </a-descriptions-item>
        <a-descriptions-item label="举报原因">
          <a-tag>{{ getReasonText(currentReport.reason) }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="详细说明">
          {{ currentReport.description || '无' }}
        </a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="getStatusColor(currentReport.status)">
            {{ getStatusText(currentReport.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="举报时间">
          {{ formatDate(currentReport.createdAt) }}
        </a-descriptions-item>
        <a-descriptions-item v-if="currentReport.handledAt" label="处理时间">
          {{ formatDate(currentReport.handledAt) }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons-vue';
import axios from 'axios';
import reportService from '@/services/admin/reportService';

const router = useRouter();

// 当前标签页
const activeTab = ref('reviews');

// 评价相关数据
const reviews = ref([]);
const reviewLoading = ref(false);
const reviewStats = ref({
  totalCount: 0,
  avgRating: 0,
  todayCount: 0,
  reportedCount: 0
});

const reviewFilters = reactive({
  keyword: '',
  rating: null
});

const reviewPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: total => `共 ${total} 条`
});

const reviewColumns = [
  { title: '用户', key: 'user', width: 150 },
  { title: '摊位', key: 'stall', width: 150 },
  { title: '评分', key: 'rating', width: 150 },
  { title: '评论内容', key: 'comment' },
  { title: '审核状态', key: 'moderationStatus', width: 100 },
  { title: '创建时间', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
];

// 举报相关数据
const reports = ref([]);
const reportLoading = ref(false);
const reportStats = ref({
  pendingCount: 0,
  processedCount: 0,
  rejectedCount: 0,
  totalCount: 0
});

const reportFilters = reactive({
  status: '',
  reason: ''
});

const reportPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: total => `共 ${total} 条`
});

const reportColumns = [
  { title: '举报人', key: 'reporter', width: 150 },
  { title: '被举报评价', key: 'review' },
  { title: '举报原因', key: 'reason', width: 120 },
  { title: '状态', key: 'status', width: 100 },
  { title: '举报时间', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
];

// 详情模态框
const reviewDetailVisible = ref(false);
const currentReview = ref(null);
const reportDetailVisible = ref(false);
const currentReport = ref(null);

// 返回仪表板
const goToDashboard = () => {
  router.push('/admin/dashboard');
};

// 刷新当前标签页
const handleRefresh = () => {
  if (activeTab.value === 'reviews') {
    fetchReviews();
  } else {
    fetchReports();
  }
};

// 标签页切换
const handleTabChange = (key) => {
  if (key === 'reviews') {
    fetchReviews();
  } else {
    fetchReports();
  }
};

// 获取评价列表
const fetchReviews = async () => {
  reviewLoading.value = true;
  try {
    const params = {
      page: reviewPagination.current - 1,
      size: reviewPagination.pageSize,
      keyword: reviewFilters.keyword || undefined,
      rating: reviewFilters.rating || undefined
    };

    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/reviews', {
      params,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    reviews.value = response.data.content || [];
    reviewPagination.total = response.data.totalElements || 0;

    // 获取统计数据
    const statsResponse = await axios.get('/api/admin/reviews/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    reviewStats.value = statsResponse.data;
  } catch (error) {
    console.error('获取评价列表失败:', error);
    message.error(error.response?.data?.message || '获取评价列表失败');
  } finally {
    reviewLoading.value = false;
  }
};

// 获取举报列表
const fetchReports = async () => {
  reportLoading.value = true;
  try {
    const params = {
      page: reportPagination.current - 1,
      size: reportPagination.pageSize,
      status: reportFilters.status || undefined,
      reason: reportFilters.reason || undefined
    };

    const response = await reportService.getAllReports(params);
    reports.value = response.content || [];
    reportPagination.total = response.totalElements || 0;

    // 获取统计数据
    const stats = await reportService.getReportStats();
    reportStats.value = stats;
  } catch (error) {
    console.error('获取举报列表失败:', error);
    message.error('获取举报列表失败');
  } finally {
    reportLoading.value = false;
  }
};

// 评价表格变化
const handleReviewTableChange = (pagination) => {
  reviewPagination.current = pagination.current;
  reviewPagination.pageSize = pagination.pageSize;
  fetchReviews();
};

// 举报表格变化
const handleReportTableChange = (pagination) => {
  reportPagination.current = pagination.current;
  reportPagination.pageSize = pagination.pageSize;
  fetchReports();
};

// 重置评价筛选
const resetReviewFilters = () => {
  reviewFilters.keyword = '';
  reviewFilters.rating = null;
  reviewPagination.current = 1;
  fetchReviews();
};

// 重置举报筛选
const resetReportFilters = () => {
  reportFilters.status = '';
  reportFilters.reason = '';
  reportPagination.current = 1;
  fetchReports();
};

// 查看评价详情
const viewReviewDetail = (record) => {
  currentReview.value = record;
  reviewDetailVisible.value = true;
};

// 查看举报详情
const viewReportDetail = (record) => {
  currentReport.value = record;
  reportDetailVisible.value = true;
};

// 删除评价
const deleteReview = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条评价吗?此操作不可撤销。',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/admin/reviews/${record.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        message.success('删除成功');
        fetchReviews();
      } catch (error) {
        console.error('删除评价失败:', error);
        message.error('删除评价失败');
      }
    }
  });
};

// 处理举报
const handleReport = async (record, status) => {
  const actionText = status === 'RESOLVED' ? '处理' : '驳回';
  Modal.confirm({
    title: `确认${actionText}`,
    content: `确定要${actionText}这条举报吗?`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await reportService.handleReport(record.id, {
          status,
          adminNote: `管理员${actionText}了此举报`
        });
        message.success(`${actionText}成功`);
        fetchReports();
      } catch (error) {
        console.error(`${actionText}举报失败:`, error);
        message.error(`${actionText}举报失败`);
      }
    }
  });
};

// 审核状态文本
const getModerationStatusText = (status) => {
  const map = {
    'PENDING': '待审核',
    'APPROVED': '已通过',
    'REJECTED': '已驳回'
  };
  return map[status] || status;
};

// 审核状态颜色
const getModerationStatusColor = (status) => {
  const map = {
    'PENDING': 'orange',
    'APPROVED': 'green',
    'REJECTED': 'red'
  };
  return map[status] || 'default';
};

// 举报原因文本
const getReasonText = (reason) => {
  const map = {
    'SPAM': '垃圾信息',
    'INAPPROPRIATE': '不当内容',
    'FAKE': '虚假评价',
    'OTHER': '其他'
  };
  return map[reason] || reason;
};

// 举报状态文本
const getStatusText = (status) => {
  const map = {
    'PENDING': '待处理',
    'REVIEWING': '处理中',
    'RESOLVED': '已处理',
    'REJECTED': '已驳回',
    'CLOSED': '已关闭'
  };
  return map[status] || status;
};

// 举报状态颜色
const getStatusColor = (status) => {
  const map = {
    'PENDING': 'orange',
    'REVIEWING': 'blue',
    'RESOLVED': 'green',
    'REJECTED': 'red',
    'CLOSED': 'default'
  };
  return map[status] || 'default';
};

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 初始化
onMounted(() => {
  fetchReviews();
});
</script>

<style scoped lang="scss">
.review-management {
  padding: 24px 12%;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    background: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

    .header-left {
      display: flex;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .subtitle {
        margin-left: 12px;
        color: #909399;
        font-size: 14px;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-table) {
      background: white;
    }
  }

  :deep(.ant-tabs) {
    background: white;
    padding: 16px;
    border-radius: 8px;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .review-management {
    padding: 12px 5%;

    .page-header {
      flex-direction: column;
      align-items: flex-start;

      .header-right {
        margin-top: 12px;
        width: 100%;
      }
    }
  }
}
</style>
