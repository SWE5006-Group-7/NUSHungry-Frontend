<template>
  <div class="content-moderation">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="goToDashboard" style="margin-right: 12px;">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <h2>内容审核</h2>
        <span class="subtitle">审核用户提交的评价内容</span>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="20" class="stats-row">
      <a-col :xs="12" :sm="6">
        <a-card hoverable class="stat-card pending">
          <div class="stat-content">
            <div class="stat-icon">
              <ClockCircleOutlined :style="{ fontSize: '32px' }" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card hoverable class="stat-card approved">
          <div class="stat-content">
            <div class="stat-icon">
              <CheckCircleOutlined :style="{ fontSize: '32px' }" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.approved }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card hoverable class="stat-card rejected">
          <div class="stat-content">
            <div class="stat-icon">
              <CloseCircleOutlined :style="{ fontSize: '32px' }" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.rejected }}</div>
              <div class="stat-label">已驳回</div>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="6">
        <a-card hoverable class="stat-card total">
          <div class="stat-content">
            <div class="stat-icon">
              <FileTextOutlined :style="{ fontSize: '32px' }" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总计</div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 批量操作栏 -->
    <a-card v-if="selectedRowKeys.length > 0" class="batch-actions-card" :bordered="false">
      <div class="batch-actions">
        <span class="selected-count">已选择 {{ selectedRowKeys.length }} 条评价</span>
        <a-space class="action-buttons">
          <a-button
            type="primary"
            @click="handleBatchApprove"
            :loading="batchLoading"
          >
            <template #icon><CheckOutlined /></template>
            批量通过
          </a-button>
          <a-button
            danger
            @click="showBatchRejectDialog"
            :loading="batchLoading"
          >
            <template #icon><CloseOutlined /></template>
            批量驳回
          </a-button>
          <a-button @click="clearSelection">取消选择</a-button>
        </a-space>
      </div>
    </a-card>

    <!-- 评价列表 -->
    <a-card class="reviews-card" :bordered="false">
      <template #title>
        <div class="table-header">
          <h3>待审核评价列表</h3>
          <a-button @click="loadReviews" :loading="loading">
            <template #icon><ReloadOutlined /></template>
            刷新
          </a-button>
        </div>
      </template>

      <a-table
        :dataSource="reviews"
        :columns="columns"
        :loading="loading"
        :row-selection="rowSelection"
        :pagination="false"
        :scroll="{ x: 1200 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="user-info">
              <a-avatar :size="32" :src="record.user?.avatar">
                {{ record.user?.username?.charAt(0).toUpperCase() }}
              </a-avatar>
              <span>{{ record.user?.username || '未知用户' }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'stall'">
            {{ record.stall?.name || '-' }}
          </template>

          <template v-else-if="column.key === 'rating'">
            <a-rate :value="record.rating" disabled allow-half />
          </template>

          <template v-else-if="column.key === 'comment'">
            <div class="comment-content">
              <p>{{ record.comment }}</p>
              <div v-if="record.imageUrls && record.imageUrls.length > 0" class="images-preview">
                <a-image
                  v-for="(url, index) in record.imageUrls.slice(0, 3)"
                  :key="index"
                  :src="url"
                  :width="60"
                  :height="60"
                  :preview="{ src: url }"
                  class="preview-image"
                />
                <span v-if="record.imageUrls.length > 3" class="more-images">
                  +{{ record.imageUrls.length - 3 }}
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>

          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="handleApprove(record)"
                :loading="record.moderating"
              >
                <template #icon><CheckOutlined /></template>
                通过
              </a-button>
              <a-button
                danger
                size="small"
                @click="handleReject(record)"
                :loading="record.moderating"
              >
                <template #icon><CloseOutlined /></template>
                驳回
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 分页 -->
      <div class="pagination">
        <a-pagination
          v-model:current="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :show-size-changer="true"
          :show-total="total => `共 ${total} 条`"
          :page-size-options="['10', '20', '50', '100']"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
        />
      </div>
    </a-card>

    <!-- 驳回原因对话框 -->
    <a-modal
      v-model:open="rejectDialogVisible"
      title="驳回原因"
      :confirm-loading="rejectLoading"
      @ok="confirmReject"
      @cancel="rejectDialogVisible = false"
    >
      <a-form layout="vertical">
        <a-form-item label="驳回原因" required>
          <a-textarea
            v-model:value="rejectForm.reason"
            :rows="5"
            placeholder="请输入驳回原因..."
            :maxlength="500"
            show-count
          />
        </a-form-item>
        <a-form-item label="常用原因">
          <a-radio-group v-model:value="rejectForm.reason" class="reason-presets">
            <a-radio-button value="内容包含敏感词或不当言论">内容包含敏感词</a-radio-button>
            <a-radio-button value="涉嫌恶意诋毁或诽谤">恶意诋毁</a-radio-button>
            <a-radio-button value="内容与评价无关或灌水">内容无关</a-radio-button>
            <a-radio-button value="包含广告或推广信息">包含广告</a-radio-button>
            <a-radio-button value="图片内容不符合规范">图片不规范</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue'
import moderationApi from '@/api/admin/moderation'

const router = useRouter()

// 统计数据
const stats = reactive({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

// 评价列表
const reviews = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])
const batchLoading = ref(false)

// 表格列定义
const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户', key: 'user', width: 150 },
  { title: '摊位', key: 'stall', width: 150 },
  { title: '评分', key: 'rating', width: 180 },
  { title: '评价内容', key: 'comment', width: 400 },
  { title: '提交时间', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' }
]

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys
  }
}))

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 驳回对话框
const rejectDialogVisible = ref(false)
const rejectLoading = ref(false)
const rejectForm = reactive({
  reason: '',
  reviewId: null,
  isBatch: false
})

// 加载统计数据
const loadStats = async () => {
  try {
    const response = await moderationApi.getModerationStats()
    Object.assign(stats, response.data)
  } catch (error) {
    message.error('加载统计数据失败')
  }
}

// 加载评价列表
const loadReviews = async () => {
  loading.value = true
  try {
    const response = await moderationApi.getPendingReviews({
      page: pagination.page - 1,
      size: pagination.size
    })

    const data = response.data
    reviews.value = data.content.map(review => ({
      ...review,
      moderating: false
    }))
    pagination.total = data.totalElements
  } catch (error) {
    message.error('加载评价列表失败')
  } finally {
    loading.value = false
  }
}

// 通过单个评价
const handleApprove = async (record) => {
  Modal.confirm({
    title: '确认通过',
    content: '确认通过该评价吗?',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      record.moderating = true
      try {
        await moderationApi.moderateReview(record.id, {
          action: 'APPROVED'
        })
        message.success('审核通过')
        await loadReviews()
        await loadStats()
      } catch (error) {
        message.error('审核失败: ' + (error.response?.data?.message || error.message))
      } finally {
        record.moderating = false
      }
    }
  })
}

// 驳回单个评价
const handleReject = (record) => {
  rejectForm.reviewId = record.id
  rejectForm.isBatch = false
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 确认驳回
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    message.warning('请填写驳回原因')
    return
  }

  rejectLoading.value = true
  try {
    if (rejectForm.isBatch) {
      // 批量驳回
      await moderationApi.batchModerateReviews({
        reviewIds: selectedRowKeys.value,
        action: 'REJECTED',
        reason: rejectForm.reason
      })
      message.success(`成功驳回 ${selectedRowKeys.value.length} 条评价`)
      clearSelection()
    } else {
      // 单个驳回
      await moderationApi.moderateReview(rejectForm.reviewId, {
        action: 'REJECTED',
        reason: rejectForm.reason
      })
      message.success('评价已驳回')
    }

    rejectDialogVisible.value = false
    await loadReviews()
    await loadStats()
  } catch (error) {
    message.error('驳回失败: ' + (error.response?.data?.message || error.message))
  } finally {
    rejectLoading.value = false
  }
}

// 批量通过
const handleBatchApprove = () => {
  Modal.confirm({
    title: '批量通过',
    content: `确认通过选中的 ${selectedRowKeys.value.length} 条评价吗?`,
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      batchLoading.value = true
      try {
        const response = await moderationApi.batchModerateReviews({
          reviewIds: selectedRowKeys.value,
          action: 'APPROVED'
        })
        const result = response.data
        message.success(`成功通过 ${result.success} 条评价`)
        clearSelection()
        await loadReviews()
        await loadStats()
      } catch (error) {
        message.error('批量审核失败')
      } finally {
        batchLoading.value = false
      }
    }
  })
}

// 显示批量驳回对话框
const showBatchRejectDialog = () => {
  rejectForm.isBatch = true
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

// 清除选择
const clearSelection = () => {
  selectedRowKeys.value = []
}

// 分页处理
const handleSizeChange = (current, size) => {
  pagination.page = 1
  pagination.size = size
  loadReviews()
}

const handlePageChange = (page, pageSize) => {
  pagination.page = page
  pagination.size = pageSize
  loadReviews()
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 返回dashboard
const goToDashboard = () => {
  router.back()
}

// 初始化
onMounted(() => {
  loadStats()
  loadReviews()
})
</script>

<style scoped>
.content-moderation {
  padding: 24px 12%;
  background: #f0f2f5;
  min-height: 100vh;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.subtitle {
  margin-left: 16px;
  color: #8c8c8c;
  font-size: 14px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
}

.stat-card.pending .stat-icon {
  background-color: #fff7e6;
  color: #faad14;
}

.stat-card.approved .stat-icon {
  background-color: #f6ffed;
  color: #52c41a;
}

.stat-card.rejected .stat-icon {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

.stat-card.total .stat-icon {
  background-color: #e6f7ff;
  color: #1890ff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 批量操作栏 */
.batch-actions-card {
  margin-bottom: 20px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 16px;
  color: #1890ff;
  font-weight: 500;
}

/* 评价列表 */
.reviews-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-content p {
  margin: 0 0 10px 0;
  line-height: 1.6;
  color: #606266;
  word-break: break-word;
}

.images-preview {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.preview-image {
  border-radius: 4px;
  cursor: pointer;
  object-fit: cover;
}

.more-images {
  font-size: 14px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 驳回原因对话框 */
.reason-presets {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 响应式 */
@media (max-width: 768px) {
  .batch-actions {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
  }
}
</style>
