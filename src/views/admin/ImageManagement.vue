<template>
  <div class="image-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="goToDashboard" style="margin-right: 12px;">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <h2>图片管理</h2>
        <span class="subtitle">管理用户上传的图片</span>
      </div>
      <div class="header-right">
        <a-button @click="handleRefresh">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 16px;">
      <a-col :span="8">
        <a-card>
          <a-statistic title="总图片数" :value="stats.totalImages" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="普通图片" :value="stats.photoCount" />
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card>
          <a-statistic title="菜单图片" :value="stats.menuCount" />
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索和筛选 -->
    <a-card class="filter-card">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input
            v-model:value="filters.keyword"
            placeholder="搜索图片URL或上传者"
            allow-clear
            @pressEnter="fetchImages"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col :xs="12" :sm="6" :md="4">
          <a-select
            v-model:value="filters.type"
            placeholder="图片类型"
            style="width: 100%"
            allow-clear
            @change="fetchImages"
          >
            <a-select-option value="">全部类型</a-select-option>
            <a-select-option value="PHOTO">普通图片</a-select-option>
            <a-select-option value="MENU">菜单图片</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-button type="primary" @click="fetchImages">
              <template #icon><SearchOutlined /></template>
              搜索
            </a-button>
            <a-button @click="resetFilters">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- 批量操作栏 -->
    <a-card v-if="selectedRowKeys.length > 0" class="batch-actions-card">
      <a-alert
        :message="`已选择 ${selectedRowKeys.length} 张图片`"
        type="info"
        show-icon
        :closable="false"
      >
        <template #description>
          <a-space>
            <a-button size="small" danger @click="handleBatchDelete">
              批量删除
            </a-button>
            <a-button size="small" @click="clearSelection">
              取消选择
            </a-button>
          </a-space>
        </template>
      </a-alert>
    </a-card>

    <!-- 图片表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="images"
        :loading="loading"
        :pagination="pagination"
        :row-selection="rowSelection"
        @change="handleTableChange"
        row-key="id"
        :scroll="{ x: 1400 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <div class="image-preview">
              <a-image
                :src="`http://localhost:8080${record.thumbnailUrl || record.imageUrl}`"
                :width="80"
                :height="80"
                :preview="{ src: `http://localhost:8080${record.imageUrl}` }"
                style="object-fit: cover; border-radius: 4px;"
              />
            </div>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag :color="record.type === 'PHOTO' ? 'blue' : 'green'">
              {{ getTypeText(record.type) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'related'">
            <div v-if="record.cafeteria">
              <a-tag color="cyan">食堂</a-tag>
              <span>{{ record.cafeteria.name }}</span>
            </div>
            <div v-else-if="record.stall">
              <a-tag color="purple">摊位</a-tag>
              <span>{{ record.stall.name }}</span>
            </div>
            <span v-else style="color: #999;">无关联</span>
          </template>
          <template v-else-if="column.key === 'uploadedAt'">
            {{ formatDate(record.uploadedAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="viewImageDetail(record)">
                查看详情
              </a-button>
              <a-button type="link" size="small" danger @click="deleteImage(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 图片详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="图片详情"
      :footer="null"
      width="700px"
    >
      <a-descriptions v-if="currentImage" :column="1" bordered>
        <a-descriptions-item label="预览">
          <a-image
            :src="`http://localhost:8080${currentImage.imageUrl}`"
            :width="300"
            style="border-radius: 8px;"
          />
        </a-descriptions-item>
        <a-descriptions-item label="图片ID">
          {{ currentImage.id }}
        </a-descriptions-item>
        <a-descriptions-item label="图片类型">
          <a-tag :color="currentImage.type === 'PHOTO' ? 'blue' : 'green'">
            {{ getTypeText(currentImage.type) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="关联对象">
          <div v-if="currentImage.cafeteria">
            <a-tag color="cyan">食堂</a-tag>
            <span>{{ currentImage.cafeteria.name }} (ID: {{ currentImage.cafeteria.id }})</span>
          </div>
          <div v-else-if="currentImage.stall">
            <a-tag color="purple">摊位</a-tag>
            <span>{{ currentImage.stall.name }} (ID: {{ currentImage.stall.id }})</span>
          </div>
          <span v-else style="color: #999;">无关联</span>
        </a-descriptions-item>
        <a-descriptions-item label="上传者">
          {{ currentImage.uploadedBy || '未知' }}
        </a-descriptions-item>
        <a-descriptions-item label="上传时间">
          {{ formatDate(currentImage.uploadedAt) }}
        </a-descriptions-item>
        <a-descriptions-item label="图片URL">
          <a-typography-paragraph :copyable="{ text: currentImage.imageUrl }">
            {{ currentImage.imageUrl }}
          </a-typography-paragraph>
        </a-descriptions-item>
        <a-descriptions-item v-if="currentImage.thumbnailUrl" label="缩略图URL">
          <a-typography-paragraph :copyable="{ text: currentImage.thumbnailUrl }">
            {{ currentImage.thumbnailUrl }}
          </a-typography-paragraph>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons-vue';
import imageService from '@/services/admin/imageService';

const router = useRouter();

// 加载状态
const loading = ref(false);

// 图片列表
const images = ref([]);

// 统计数据
const stats = ref({
  totalImages: 0,
  photoCount: 0,
  menuCount: 0
});

// 筛选条件
const filters = reactive({
  keyword: '',
  type: ''
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: total => `共 ${total} 条`
});

// 选中的行
const selectedRowKeys = ref([]);

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  }
}));

// 表格列配置
const columns = [
  { title: '图片预览', key: 'image', width: 120, align: 'center' },
  { title: '图片ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '类型', key: 'type', width: 100 },
  { title: '关联对象', key: 'related', width: 200 },
  { title: '上传者', dataIndex: 'uploadedBy', key: 'uploadedBy', width: 150 },
  { title: '上传时间', key: 'uploadedAt', width: 180 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' }
];

// 详情模态框
const detailModalVisible = ref(false);
const currentImage = ref(null);

// 返回仪表板
const goToDashboard = () => {
  router.back();
};

// 刷新
const handleRefresh = () => {
  fetchImages();
  fetchStats();
};

// 获取图片列表
const fetchImages = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      keyword: filters.keyword || undefined,
      type: filters.type || undefined
    };

    const response = await imageService.getImages(params);
    images.value = response.content || [];
    pagination.total = response.totalElements || 0;
  } catch (error) {
    console.error('获取图片列表失败:', error);
    message.error('获取图片列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const data = await imageService.getImageStats();
    stats.value = data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 表格变化处理
const handleTableChange = (paginationInfo) => {
  pagination.current = paginationInfo.current;
  pagination.pageSize = paginationInfo.pageSize;
  fetchImages();
};

// 重置筛选
const resetFilters = () => {
  filters.keyword = '';
  filters.type = '';
  pagination.current = 1;
  fetchImages();
};

// 清除选择
const clearSelection = () => {
  selectedRowKeys.value = [];
};

// 查看图片详情
const viewImageDetail = async (record) => {
  try {
    const data = await imageService.getImageDetail(record.id);
    currentImage.value = data;
    detailModalVisible.value = true;
  } catch (error) {
    console.error('获取图片详情失败:', error);
    message.error('获取图片详情失败');
  }
};

// 删除图片
const deleteImage = (record) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗?此操作不可撤销,且会删除文件系统中的图片文件。',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await imageService.deleteImage(record.id);
        message.success('删除成功');
        fetchImages();
        fetchStats();
      } catch (error) {
        console.error('删除图片失败:', error);
        message.error('删除图片失败');
      }
    }
  });
};

// 批量删除
const handleBatchDelete = () => {
  Modal.confirm({
    title: '批量删除确认',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 张图片吗?此操作不可撤销。`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const result = await imageService.batchDeleteImages(selectedRowKeys.value);
        message.success(`删除完成: 成功 ${result.deletedCount} 张, 失败 ${result.failedCount} 张`);
        clearSelection();
        fetchImages();
        fetchStats();
      } catch (error) {
        console.error('批量删除失败:', error);
        message.error('批量删除失败');
      }
    }
  });
};

// 获取类型文本
const getTypeText = (type) => {
  const map = {
    'PHOTO': '普通图片',
    'MENU': '菜单图片'
  };
  return map[type] || type;
};

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

// 初始化
onMounted(() => {
  fetchImages();
  fetchStats();
});
</script>

<style scoped lang="scss">
.image-management {
  padding: 24px 12%;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;

      h2 {
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
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .batch-actions-card {
    margin-bottom: 16px;
  }

  .table-card {
    :deep(.ant-table) {
      background: white;
    }

    .image-preview {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .image-management {
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
