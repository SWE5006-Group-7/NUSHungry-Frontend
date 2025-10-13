<template>
  <div class="cafeteria-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <a-button type="text" @click="goToDashboard" style="margin-right: 12px;">
          <template #icon><ArrowLeftOutlined /></template>
        </a-button>
        <h2>食堂管理</h2>
        <span class="subtitle">共 {{ totalCafeterias }} 个食堂</span>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleAddCafeteria">
          <template #icon><PlusOutlined /></template>
          添加食堂
        </a-button>
        <a-button @click="fetchCafeterias">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
    </div>

    <!-- 食堂列表 -->
    <a-card class="table-card">
      <a-table
        :loading="loading"
        :columns="columns"
        :data-source="cafeterias"
        :pagination="pagination"
        @change="handleTableChange"
        :row-key="record => record.id"
        :scroll="{ x: 1200 }"
      >
        <!-- 食堂名称 -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="cafeteria-name">
              <a-avatar :src="record.imageUrl" shape="square" :size="48">
                {{ record.name.substring(0, 2) }}
              </a-avatar>
              <div class="name-info">
                <div class="name">{{ record.name }}</div>
                <div class="location">{{ record.location }}</div>
              </div>
            </div>
          </template>

          <!-- 营业时间 -->
          <template v-else-if="column.key === 'hours'">
            <div class="hours-info">
              <div><strong>学期:</strong> {{ record.termTimeOpeningHours || '未设置' }}</div>
              <div><strong>假期:</strong> {{ record.vacationOpeningHours || '未设置' }}</div>
            </div>
          </template>

          <!-- 状态 -->
          <template v-else-if="column.key === 'status'">
            <a-tag v-if="isOpen(record)" color="success">营业中</a-tag>
            <a-tag v-else color="error">暂停营业</a-tag>
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
                title="确认删除此食堂吗?"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
              <a-dropdown>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-if="isOpen(record)" @click="handleToggleStatus(record, 'CLOSED')">
                      <CloseCircleOutlined /> 暂停营业
                    </a-menu-item>
                    <a-menu-item v-else @click="handleToggleStatus(record, 'OPEN')">
                      <CheckCircleOutlined /> 恢复营业
                    </a-menu-item>
                  </a-menu>
                </template>
                <a-button type="link" size="small">
                  更多 <DownOutlined />
                </a-button>
              </a-dropdown>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 食堂编辑/创建对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="isEditMode ? '编辑食堂' : '添加食堂'"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :confirm-loading="submitting"
    >
      <CafeteriaForm
        ref="cafeteriaFormRef"
        :cafeteria="currentCafeteria"
        :is-edit="isEditMode"
      />
    </a-modal>

    <!-- 食堂详情模态框 -->
    <a-modal
      v-model:open="detailDrawerVisible"
      title="食堂详情"
      :footer="null"
      width="600px"
    >
      <a-descriptions v-if="selectedCafeteria" :column="1" bordered>
        <a-descriptions-item label="ID">{{ selectedCafeteria.id }}</a-descriptions-item>
        <a-descriptions-item label="名称">{{ selectedCafeteria.name }}</a-descriptions-item>
        <a-descriptions-item label="描述">{{ selectedCafeteria.description }}</a-descriptions-item>
        <a-descriptions-item label="位置">{{ selectedCafeteria.location }}</a-descriptions-item>
        <a-descriptions-item label="坐标">
          {{ selectedCafeteria.latitude }}, {{ selectedCafeteria.longitude }}
        </a-descriptions-item>
        <a-descriptions-item label="座位数">{{ selectedCafeteria.seatingCapacity }}</a-descriptions-item>
        <a-descriptions-item label="清真/素食">{{ selectedCafeteria.halalInfo || '无' }}</a-descriptions-item>
        <a-descriptions-item label="最近巴士站">{{ selectedCafeteria.nearestBusStop }}</a-descriptions-item>
        <a-descriptions-item label="最近停车场">{{ selectedCafeteria.nearestCarpark }}</a-descriptions-item>
        <a-descriptions-item label="学期营业时间">{{ selectedCafeteria.termTimeOpeningHours }}</a-descriptions-item>
        <a-descriptions-item label="假期营业时间">{{ selectedCafeteria.vacationOpeningHours }}</a-descriptions-item>
        <a-descriptions-item v-if="selectedCafeteria.imageUrl" label="食堂图片">
          <img :src="selectedCafeteria.imageUrl" alt="食堂图片" style="max-width: 100%; border-radius: 8px; margin-top: 8px;" />
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  PlusOutlined,
  ReloadOutlined,
  DownOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue';
import CafeteriaForm from '@/components/admin/CafeteriaForm.vue';
import adminCafeteriaApi from '@/api/admin/cafeteria';

const router = useRouter();

// 数据状态
const loading = ref(false);
const submitting = ref(false);
const cafeterias = ref([]);
const totalCafeterias = ref(0);
const editModalVisible = ref(false);
const detailDrawerVisible = ref(false);
const isEditMode = ref(false);
const currentCafeteria = ref(null);
const selectedCafeteria = ref(null);
const cafeteriaFormRef = ref(null);

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条数据`
});

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    sorter: true
  },
  {
    title: '食堂名称',
    dataIndex: 'name',
    key: 'name',
    width: 250
  },
  {
    title: '位置',
    dataIndex: 'location',
    key: 'location',
    width: 150
  },
  {
    title: '营业时间',
    key: 'hours',
    width: 300
  },
  {
    title: '状态',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'action',
    width: 250,
    fixed: 'right'
  }
];

// 判断是否营业中
const isOpen = (cafeteria) => {
  return cafeteria.termTimeOpeningHours !== '暂停营业' &&
         cafeteria.vacationOpeningHours !== '暂停营业';
};

// 返回dashboard
const goToDashboard = () => {
  router.back();
};

// 获取食堂列表
const fetchCafeterias = async () => {
  loading.value = true;
  try {
    const response = await adminCafeteriaApi.getCafeteriaList({
      page: pagination.current - 1,
      size: pagination.pageSize
    });

    if (response.data.success) {
      cafeterias.value = response.data.cafeterias;
      totalCafeterias.value = response.data.totalItems;
      pagination.total = response.data.totalItems;
    } else {
      message.error(response.data.message || '获取食堂列表失败');
    }
  } catch (error) {
    console.error('获取食堂列表失败:', error);
    message.error('获取食堂列表失败');
  } finally {
    loading.value = false;
  }
};

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchCafeterias();
};

// 添加食堂
const handleAddCafeteria = () => {
  isEditMode.value = false;
  currentCafeteria.value = null;
  editModalVisible.value = true;
};

// 查看详情
const handleView = (record) => {
  selectedCafeteria.value = { ...record };
  detailDrawerVisible.value = true;
};

// 编辑食堂
const handleEdit = (record) => {
  isEditMode.value = true;
  currentCafeteria.value = { ...record };
  editModalVisible.value = true;
};

// 删除食堂
const handleDelete = async (id) => {
  try {
    const response = await adminCafeteriaApi.deleteCafeteria(id);

    if (response.data.success) {
      message.success('删除成功');
      fetchCafeterias();
    } else {
      message.error(response.data.message || '删除失败');
    }
  } catch (error) {
    console.error('删除食堂失败:', error);
    message.error('删除失败');
  }
};

// 切换营业状态
const handleToggleStatus = async (record, status) => {
  try {
    const response = await adminCafeteriaApi.updateCafeteriaStatus(record.id, status);

    if (response.data.success) {
      message.success('状态修改成功');
      fetchCafeterias();
    } else {
      message.error(response.data.message || '状态修改失败');
    }
  } catch (error) {
    console.error('修改状态失败:', error);
    message.error('状态修改失败');
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!cafeteriaFormRef.value) {
    message.error('表单未加载');
    return;
  }

  const formData = await cafeteriaFormRef.value.validate();
  if (!formData) return;

  submitting.value = true;
  try {
    let response;
    if (isEditMode.value) {
      response = await adminCafeteriaApi.updateCafeteria(currentCafeteria.value.id, formData);
    } else {
      response = await adminCafeteriaApi.createCafeteria(formData);
    }

    if (response.data.success) {
      message.success(isEditMode.value ? '更新成功' : '创建成功');
      editModalVisible.value = false;
      fetchCafeterias();
    } else {
      message.error(response.data.message || '操作失败');
    }
  } catch (error) {
    console.error('提交失败:', error);
    message.error('操作失败');
  } finally {
    submitting.value = false;
  }
};

// 取消编辑
const handleCancel = () => {
  editModalVisible.value = false;
  currentCafeteria.value = null;
};

// 页面加载时获取数据
onMounted(() => {
  fetchCafeterias();
});
</script>

<style scoped lang="scss">
.cafeteria-management {
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

  .table-card {
    .cafeteria-name {
      display: flex;
      align-items: center;
      gap: 12px;

      .name-info {
        .name {
          font-weight: 500;
          color: #262626;
        }

        .location {
          font-size: 12px;
          color: #8c8c8c;
          margin-top: 4px;
        }
      }
    }

    .hours-info {
      font-size: 13px;

      div {
        margin-bottom: 4px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .cafeteria-detail {
    :deep(.ant-descriptions-title) {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
  }
}
</style>
