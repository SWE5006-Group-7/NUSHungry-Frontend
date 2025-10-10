<template>
  <div class="stall-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="goToDashboard" style="margin-right: 12px;">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <h2>摊位管理</h2>
        <span class="subtitle">共 {{ totalStalls }} 个摊位</span>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleAddStall">
          <template #icon><PlusOutlined /></template>
          添加摊位
        </a-button>
        <a-button @click="fetchStalls">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <a-card class="filter-card">
      <a-form layout="inline">
        <a-form-item label="所属食堂">
          <a-select
            v-model:value="filterCafeteriaId"
            placeholder="全部食堂"
            style="width: 200px"
            allow-clear
            @change="handleFilterChange"
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

        <a-form-item label="排序方式">
          <a-select
            v-model:value="sortBy"
            style="width: 150px"
            @change="handleSortChange"
          >
            <a-select-option value="id">默认排序</a-select-option>
            <a-select-option value="name">名称</a-select-option>
            <a-select-option value="cuisineType">菜系</a-select-option>
            <a-select-option value="averageRating">评分</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="排序方向">
          <a-radio-group v-model:value="sortDirection" @change="handleSortChange">
            <a-radio-button value="ASC">升序</a-radio-button>
            <a-radio-button value="DESC">降序</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 摊位列表 -->
    <a-card class="table-card">
      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="stalls"
        :pagination="pagination"
        @change="handleTableChange"
        :row-key="record => record.id"
        :row-selection="rowSelection"
      >
        <!-- 摊位名称 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="stall-name">
              <a-avatar :src="record.imageUrl" shape="square" :size="48">
                {{ record.name.substring(0, 2) }}
              </a-avatar>
              <div class="name-info">
                <div class="name">{{ record.name }}</div>
                <div class="cuisine">{{ record.cuisineType }}</div>
              </div>
            </div>
          </template>

          <!-- 所属食堂 -->
          <template v-else-if="column.key === 'cafeteria'">
            <a-tag v-if="record.cafeteria" color="blue">
              {{ record.cafeteria.name }}
            </a-tag>
            <a-tag v-else color="default">未分配</a-tag>
          </template>

          <!-- Halal信息 -->
          <template v-else-if="column.key === 'halalInfo'">
            <a-tag v-if="record.halalInfo" color="green">
              {{ record.halalInfo }}
            </a-tag>
            <span v-else>-</span>
          </template>

          <!-- 评分 -->
          <template v-else-if="column.key === 'rating'">
            <div class="rating-info">
              <a-rate
                :value="record.averageRating"
                allow-half
                disabled
                style="font-size: 14px"
              />
              <span class="rating-text">
                {{ record.averageRating?.toFixed(1) || '0.0' }}
                ({{ record.reviewCount || 0 }}条)
              </span>
            </div>
          </template>

          <!-- 操作 -->
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="handleView(record)">
                查看
              </a-button>
              <a-button type="link" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                title="确认删除此摊位吗?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <!-- 批量操作 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-actions">
        <span>已选择 {{ selectedRowKeys.length }} 项</span>
        <a-button
          danger
          type="primary"
          @click="handleBatchDelete"
          :loading="batchDeleting"
        >
          批量删除
        </a-button>
      </div>
    </a-card>

    <!-- 摊位编辑/创建对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="isEditMode ? '编辑摊位' : '添加摊位'"
      width="800px"
      :footer="null"
      @cancel="handleCancel"
    >
      <StallForm
        ref="stallFormRef"
        :mode="isEditMode ? 'edit' : 'create'"
        :initial-data="currentStall"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </a-modal>

    <!-- 摊位详情抽屉 -->
    <a-drawer
      v-model:open="detailDrawerVisible"
      title="摊位详情"
      :width="720"
      placement="right"
    >
      <div v-if="selectedStall" class="stall-detail">
        <a-descriptions title="基本信息" bordered :column="1">
          <a-descriptions-item label="ID">{{ selectedStall.id }}</a-descriptions-item>
          <a-descriptions-item label="名称">{{ selectedStall.name }}</a-descriptions-item>
          <a-descriptions-item label="菜系类型">{{ selectedStall.cuisineType }}</a-descriptions-item>
          <a-descriptions-item label="所属食堂">
            {{ selectedStall.cafeteria?.name || '未分配' }}
          </a-descriptions-item>
          <a-descriptions-item label="Halal信息">
            {{ selectedStall.halalInfo || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="联系方式">
            {{ selectedStall.contact || '无' }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <a-descriptions title="统计信息" bordered :column="2">
          <a-descriptions-item label="平均评分">
            <a-rate
              :value="selectedStall.averageRating"
              allow-half
              disabled
              style="font-size: 14px"
            />
            {{ selectedStall.averageRating?.toFixed(1) || '0.0' }}
          </a-descriptions-item>
          <a-descriptions-item label="评价数量">
            {{ selectedStall.reviewCount || 0 }} 条
          </a-descriptions-item>
          <a-descriptions-item label="图片数量">
            {{ selectedStall.images?.length || 0 }} 张
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <div v-if="selectedStall.imageUrl">
          <h3>封面图片</h3>
          <img :src="selectedStall.imageUrl" alt="摊位图片" style="max-width: 100%; border-radius: 8px;" />
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  PlusOutlined,
  ReloadOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue';
import adminStallApi from '@/api/admin/stall';
import adminCafeteriaApi from '@/api/admin/cafeteria';
import StallForm from '@/components/admin/StallForm.vue';

const router = useRouter();

// 状态
const loading = ref(false);
const stalls = ref([]);
const totalStalls = ref(0);
const cafeteriaList = ref([]);

// 筛选和排序
const filterCafeteriaId = ref(null);
const sortBy = ref('id');
const sortDirection = ref('ASC');

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
});

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '摊位信息',
    key: 'name',
    width: 250
  },
  {
    title: '所属食堂',
    key: 'cafeteria',
    width: 150
  },
  {
    title: 'Halal信息',
    key: 'halalInfo',
    width: 150
  },
  {
    title: '评分',
    key: 'rating',
    width: 200
  },
  {
    title: '联系方式',
    dataIndex: 'contact',
    key: 'contact',
    width: 150,
    ellipsis: true
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right'
  }
];

// 行选择
const selectedRowKeys = ref([]);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  }
}));

// 编辑模态框
const editModalVisible = ref(false);
const isEditMode = ref(false);
const currentStall = ref({});
const stallFormRef = ref(null);
const submitting = ref(false);

// 详情抽屉
const detailDrawerVisible = ref(false);
const selectedStall = ref(null);

// 批量删除
const batchDeleting = ref(false);

// 返回dashboard
const goToDashboard = () => {
  router.push('/admin/dashboard');
};

// 获取摊位列表
const fetchStalls = async () => {
  try {
    loading.value = true;

    const params = {
      page: pagination.current - 1,
      size: pagination.pageSize,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value
    };

    // 添加食堂筛选
    if (filterCafeteriaId.value) {
      params.cafeteriaId = filterCafeteriaId.value;
    }

    const response = await adminStallApi.getStallList(params);

    if (response.data && response.data.success) {
      stalls.value = response.data.stalls || [];
      totalStalls.value = response.data.totalItems || 0;
      pagination.total = response.data.totalItems || 0;
    }
  } catch (error) {
    console.error('获取摊位列表失败:', error);
    message.error(error.response?.data?.message || '获取摊位列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取食堂列表
const fetchCafeterias = async () => {
  try {
    const response = await adminCafeteriaApi.getCafeteriaList({
      page: 0,
      size: 100
    });

    if (response.data && response.data.success) {
      cafeteriaList.value = response.data.cafeterias || [];
    }
  } catch (error) {
    console.error('获取食堂列表失败:', error);
  }
};

// 处理表格变化
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchStalls();
};

// 处理筛选变化
const handleFilterChange = () => {
  pagination.current = 1;
  fetchStalls();
};

// 处理排序变化
const handleSortChange = () => {
  pagination.current = 1;
  fetchStalls();
};

// 添加摊位
const handleAddStall = () => {
  isEditMode.value = false;
  currentStall.value = {};
  editModalVisible.value = true;
};

// 编辑摊位
const handleEdit = (record) => {
  isEditMode.value = true;
  currentStall.value = { ...record };
  editModalVisible.value = true;
};

// 查看详情
const handleView = (record) => {
  selectedStall.value = record;
  detailDrawerVisible.value = true;
};

// 删除摊位
const handleDelete = async (id) => {
  try {
    const response = await adminStallApi.deleteStall(id);

    if (response.data && response.data.success) {
      message.success('删除成功');
      fetchStalls();
    }
  } catch (error) {
    console.error('删除摊位失败:', error);
    message.error(error.response?.data?.message || '删除失败');
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请先选择要删除的摊位');
    return;
  }

  try {
    batchDeleting.value = true;

    const response = await adminStallApi.batchDeleteStalls(selectedRowKeys.value);

    if (response.data && response.data.success) {
      message.success(response.data.message || '批量删除成功');
      selectedRowKeys.value = [];
      fetchStalls();
    } else {
      message.warning(response.data.message || '部分删除失败');
      if (response.data.errors) {
        response.data.errors.forEach(error => {
          console.error(error);
        });
      }
      fetchStalls();
    }
  } catch (error) {
    console.error('批量删除失败:', error);
    message.error(error.response?.data?.message || '批量删除失败');
  } finally {
    batchDeleting.value = false;
  }
};

// 提交表单
const handleSubmit = async ({ mode, data, id }) => {
  try {
    submitting.value = true;

    let response;
    if (mode === 'create') {
      response = await adminStallApi.createStall(data);
    } else {
      response = await adminStallApi.updateStall(id, data);
    }

    if (response.data && response.data.success) {
      message.success(mode === 'create' ? '创建成功' : '更新成功');
      editModalVisible.value = false;
      fetchStalls();
    }
  } catch (error) {
    console.error('提交失败:', error);
    message.error(error.response?.data?.message || '操作失败');
  } finally {
    submitting.value = false;
  }
};

// 取消
const handleCancel = () => {
  editModalVisible.value = false;
  currentStall.value = {};
};

// 组件挂载
onMounted(() => {
  fetchCafeterias();
  fetchStalls();
});
</script>

<style scoped lang="less">
.stall-management {
  padding: 24px 12%;

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
    margin-bottom: 20px;
  }

  .table-card {
    .stall-name {
      display: flex;
      align-items: center;
      gap: 12px;

      .name-info {
        .name {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .cuisine {
          color: rgba(0, 0, 0, 0.45);
          font-size: 12px;
        }
      }
    }

    .rating-info {
      display: flex;
      align-items: center;
      gap: 8px;

      .rating-text {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
      }
    }

    .batch-actions {
      margin-top: 16px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        font-weight: 500;
      }
    }
  }

  .stall-detail {
    :deep(.ant-descriptions-title) {
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
    }

    h3 {
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
    }

    img {
      margin-top: 12px;
    }
  }
}
</style>
