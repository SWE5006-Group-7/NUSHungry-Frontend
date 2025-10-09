<template>
  <div class="user-management">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2>用户管理</h2>
        <span class="subtitle">共 {{ totalUsers }} 个用户</span>
      </div>
      <div class="header-right">
        <a-button type="primary" @click="handleAddUser">
          <template #icon><PlusOutlined /></template>
          添加用户
        </a-button>
        <a-button @click="fetchUsers">
          <template #icon><ReloadOutlined /></template>
          刷新
        </a-button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <a-card class="filter-card">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input
            v-model:value="searchQuery"
            placeholder="搜索用户名或邮箱"
            allow-clear
            @pressEnter="handleSearch"
            @change="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-col>
        <a-col :xs="12" :sm="6" :md="4">
          <a-select
            v-model:value="roleFilter"
            placeholder="角色筛选"
            style="width: 100%"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="">全部角色</a-select-option>
            <a-select-option value="ROLE_ADMIN">管理员</a-select-option>
            <a-select-option value="ROLE_USER">普通用户</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="12" :sm="6" :md="4">
          <a-select
            v-model:value="statusFilter"
            placeholder="状态筛选"
            style="width: 100%"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="">全部状态</a-select-option>
            <a-select-option value="enabled">已启用</a-select-option>
            <a-select-option value="disabled">已禁用</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <a-space>
            <a-button type="primary" @click="handleSearch">
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

    <!-- 用户表格 -->
    <a-card class="table-card">
      <!-- 批量操作栏 -->
      <div v-if="selectedRowKeys.length > 0" class="batch-actions">
        <a-alert
          :message="`已选择 ${selectedRowKeys.length} 个用户`"
          type="info"
          show-icon
          :closable="false"
        >
          <template #description>
            <a-space>
              <a-button size="small" type="primary" @click="handleBatchEnable">
                批量启用
              </a-button>
              <a-button size="small" danger @click="handleBatchDisable">
                批量禁用
              </a-button>
              <a-button size="small" danger @click="handleBatchDelete">
                批量删除
              </a-button>
              <a-button size="small" @click="clearSelection">
                取消选择
              </a-button>
            </a-space>
          </template>
        </a-alert>
      </div>

      <!-- 数据表格 -->
      <a-table
        ref="tableRef"
        :loading="loading"
        :columns="columns"
        :data-source="users"
        :row-selection="rowSelection"
        :pagination="pagination"
        @change="handleTableChange"
        :row-key="record => record.id"
      />
    </a-card>

    <!-- 用户详情抽屉 -->
    <a-drawer
      v-model:open="detailDrawerVisible"
      title="用户详情"
      :width="640"
      placement="right"
    >
      <div v-if="selectedUser" class="user-detail">
        <a-descriptions title="基本信息" bordered :column="1">
          <a-descriptions-item label="ID">{{ selectedUser.id }}</a-descriptions-item>
          <a-descriptions-item label="用户名">{{ selectedUser.username }}</a-descriptions-item>
          <a-descriptions-item label="邮箱">{{ selectedUser.email }}</a-descriptions-item>
          <a-descriptions-item label="角色">
            <a-tag :color="getRoleTagColor(selectedUser.role)">
              {{ getRoleName(selectedUser.role) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="selectedUser.enabled ? 'success' : 'error'">
              {{ selectedUser.enabled ? '已启用' : '已禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="注册时间">
            {{ formatDate(selectedUser.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="最后更新">
            {{ formatDate(selectedUser.updatedAt) }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-drawer>

    <!-- 编辑用户对话框 -->
    <a-modal
      v-model:open="editModalVisible"
      :title="selectedUser ? '编辑用户' : '添加用户'"
      :confirm-loading="editLoading"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
      width="600px"
    >
      <a-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="用户名" name="username">
          <a-input v-model:value="editForm.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="邮箱" name="email">
          <a-input v-model:value="editForm.email" placeholder="请输入邮箱" />
        </a-form-item>
        <a-form-item label="角色" name="role">
          <a-select v-model:value="editForm.role" placeholder="请选择角色">
            <a-select-option value="ROLE_USER">普通用户</a-select-option>
            <a-select-option value="ROLE_ADMIN">管理员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态" name="enabled">
          <a-switch v-model:checked="editForm.enabled" />
        </a-form-item>
        <a-form-item v-if="!selectedUser" label="密码" name="password">
          <a-input-password v-model:value="editForm.password" placeholder="请输入密码" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码对话框 -->
    <a-modal
      v-model:open="resetPasswordModalVisible"
      title="重置密码"
      :confirm-loading="resetPasswordLoading"
      @ok="confirmResetPassword"
      @cancel="resetPasswordModalVisible = false"
      width="400px"
    >
      <a-form
        ref="resetPasswordFormRef"
        :model="resetPasswordForm"
        :rules="resetPasswordRules"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-item label="用户名">
          <a-input :value="selectedUser?.username" disabled />
        </a-form-item>
        <a-form-item label="新密码" name="password">
          <a-input-password
            v-model:value="resetPasswordForm.password"
            placeholder="请输入新密码"
          />
        </a-form-item>
        <a-form-item label="确认密码" name="confirmPassword">
          <a-input-password
            v-model:value="resetPasswordForm.confirmPassword"
            placeholder="请再次输入密码"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, h } from 'vue';
import { message, Modal, Avatar, Tag, Switch, Button, Space } from 'ant-design-vue';
import dayjs from 'dayjs';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons-vue';
import adminUserApi from '@/api/admin/user';

// 默认头像
const defaultAvatar = '/default-avatar.png';

// 当前用户ID（防止操作自己）
const currentUserId = ref(null);

// 加载状态
const loading = ref(false);
const editLoading = ref(false);
const resetPasswordLoading = ref(false);

// 表格ref
const tableRef = ref();
const editFormRef = ref();
const resetPasswordFormRef = ref();

// 分页数据
const currentPage = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);

// 用户列表
const users = ref([]);

// 选中的行键
const selectedRowKeys = ref([]);
const selectedUser = ref(null);

// 搜索和筛选
const searchQuery = ref('');
const roleFilter = ref('');
const statusFilter = ref('');

// 对话框状态
const detailDrawerVisible = ref(false);
const editModalVisible = ref(false);
const resetPasswordModalVisible = ref(false);

// 编辑表单
const editForm = reactive({
  username: '',
  email: '',
  role: 'ROLE_USER',
  enabled: true,
  password: ''
});

// 编辑表单验证规则
const editRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
};

// 重置密码表单
const resetPasswordForm = reactive({
  password: '',
  confirmPassword: ''
});

// 重置密码验证规则
const resetPasswordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: async (rule, value) => {
        if (value !== resetPasswordForm.password) {
          return Promise.reject('两次输入密码不一致');
        }
      },
      trigger: 'blur'
    }
  ]
};

// 表格列配置
const columns = [
  {
    title: '用户',
    key: 'user',
    width: 250,
    customRender: ({ record }) => {
      return h('div', { class: 'user-info' }, [
        h(Avatar, {
          src: record.avatarUrl || defaultAvatar,
          size: 40
        }, () => record.username?.charAt(0)),
        h('div', { class: 'user-text' }, [
          h('div', { class: 'username' }, record.username),
          h('div', { class: 'email' }, record.email)
        ])
      ]);
    }
  },
  {
    title: '角色',
    dataIndex: 'role',
    key: 'role',
    width: 120,
    customRender: ({ text }) => {
      return h(Tag, { color: getRoleTagColor(text) }, () => getRoleName(text));
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    customRender: ({ record }) => {
      return h(Switch, {
        checked: record.enabled,
        disabled: record.id === currentUserId.value,
        onChange: (checked) => {
          record.enabled = checked;
          handleStatusChange(record);
        }
      });
    }
  },
  {
    title: '注册时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    sorter: true,
    customRender: ({ text }) => formatDate(text)
  },
  {
    title: '操作',
    key: 'action',
    width: 280,
    fixed: 'right',
    customRender: ({ record }) => {
      return h(Space, {}, () => [
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleView(record)
        }, () => '查看'),
        h(Button, {
          type: 'link',
          size: 'small',
          onClick: () => handleEdit(record)
        }, () => '编辑'),
        h(Button, {
          type: 'link',
          size: 'small',
          danger: true,
          onClick: () => handleResetPassword(record)
        }, () => '重置密码'),
        h(Button, {
          type: 'link',
          size: 'small',
          danger: true,
          disabled: record.id === currentUserId.value,
          onClick: () => handleDelete(record)
        }, () => '删除')
      ]);
    }
  }
];

// 分页配置
const pagination = computed(() => ({
  current: currentPage.value,
  pageSize: pageSize.value,
  total: totalUsers.value,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100']
}));

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys) => {
    selectedRowKeys.value = keys;
  }
}));

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm');
};

// 获取角色名称
const getRoleName = (role) => {
  const roleMap = {
    'ROLE_ADMIN': '管理员',
    'ROLE_USER': '普通用户'
  };
  return roleMap[role] || role;
};

// 获取角色标签颜色
const getRoleTagColor = (role) => {
  const colorMap = {
    'ROLE_ADMIN': 'red',
    'ROLE_USER': 'blue'
  };
  return colorMap[role] || 'default';
};

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await adminUserApi.getUserList({
      page: currentPage.value - 1,
      size: pageSize.value,
      search: searchQuery.value,
      role: roleFilter.value,
      status: statusFilter.value
    });

    users.value = response.data.users || [];
    totalUsers.value = response.data.totalItems || 0;

  } catch (error) {
    console.error('Failed to fetch users:', error);
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};

// 重置筛选
const resetFilters = () => {
  searchQuery.value = '';
  roleFilter.value = '';
  statusFilter.value = '';
  currentPage.value = 1;
  fetchUsers();
};

// 表格变化处理
const handleTableChange = (paginationInfo, filters, sorter) => {
  currentPage.value = paginationInfo.current;
  pageSize.value = paginationInfo.pageSize;
  fetchUsers();
};

// 清除选择
const clearSelection = () => {
  selectedRowKeys.value = [];
};

// 状态切换
const handleStatusChange = async (user) => {
  try {
    await adminUserApi.updateUserStatus(user.id, { enabled: user.enabled });
    message.success(user.enabled ? '账户已启用' : '账户已禁用');
  } catch (error) {
    console.error('Failed to update user status:', error);
    message.error('更新用户状态失败');
    // 恢复原状态
    user.enabled = !user.enabled;
  }
};

// 查看详情
const handleView = (user) => {
  selectedUser.value = user;
  detailDrawerVisible.value = true;
};

// 编辑用户
const handleEdit = (user) => {
  selectedUser.value = user;
  editForm.username = user.username;
  editForm.email = user.email;
  editForm.role = user.role;
  editForm.enabled = user.enabled;
  editForm.password = '';
  editModalVisible.value = true;
};

// 添加用户
const handleAddUser = () => {
  selectedUser.value = null;
  editForm.username = '';
  editForm.email = '';
  editForm.role = 'ROLE_USER';
  editForm.enabled = true;
  editForm.password = '';
  editModalVisible.value = true;
};

// 提交编辑
const handleEditSubmit = async () => {
  try {
    await editFormRef.value.validate();
    editLoading.value = true;

    if (selectedUser.value) {
      // 更新用户
      await adminUserApi.updateUser(selectedUser.value.id, {
        username: editForm.username,
        email: editForm.email,
        role: editForm.role,
        enabled: editForm.enabled
      });
      message.success('用户更新成功');
    } else {
      // 创建用户
      await adminUserApi.createUser(editForm);
      message.success('用户创建成功');
    }

    editModalVisible.value = false;
    fetchUsers();
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    console.error('Failed to save user:', error);
    message.error(selectedUser.value ? '更新用户失败' : '创建用户失败');
  } finally {
    editLoading.value = false;
  }
};

// 重置密码
const handleResetPassword = (user) => {
  selectedUser.value = user;
  resetPasswordForm.password = '';
  resetPasswordForm.confirmPassword = '';
  resetPasswordModalVisible.value = true;
};

// 确认重置密码
const confirmResetPassword = async () => {
  try {
    await resetPasswordFormRef.value.validate();
    resetPasswordLoading.value = true;

    await adminUserApi.resetPassword(selectedUser.value.id, {
      password: resetPasswordForm.password
    });

    message.success('密码重置成功');
    resetPasswordModalVisible.value = false;
  } catch (error) {
    if (error.errorFields) {
      // 表单验证错误
      return;
    }
    console.error('Failed to reset password:', error);
    message.error('重置密码失败');
  } finally {
    resetPasswordLoading.value = false;
  }
};

// 删除用户
const handleDelete = async (user) => {
  Modal.confirm({
    title: '删除确认',
    content: `确定要删除用户 "${user.username}" 吗？此操作不可撤销。`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        await adminUserApi.deleteUser(user.id);
        message.success('用户删除成功');
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        message.error('删除用户失败');
      }
    }
  });
};

// 批量操作
const handleBatchEnable = async () => {
  try {
    const userIds = selectedRowKeys.value;
    await adminUserApi.batchOperation({
      userIds,
      operation: 'enable'
    });
    message.success('批量启用成功');
    fetchUsers();
    clearSelection();
  } catch (error) {
    console.error('Failed to batch enable:', error);
    message.error('批量启用失败');
  }
};

const handleBatchDisable = async () => {
  try {
    const userIds = selectedRowKeys.value;
    await adminUserApi.batchOperation({
      userIds,
      operation: 'disable'
    });
    message.success('批量禁用成功');
    fetchUsers();
    clearSelection();
  } catch (error) {
    console.error('Failed to batch disable:', error);
    message.error('批量禁用失败');
  }
};

const handleBatchDelete = async () => {
  Modal.confirm({
    title: '批量删除确认',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 个用户吗？此操作不可撤销。`,
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      try {
        const userIds = selectedRowKeys.value;
        await adminUserApi.batchOperation({
          userIds,
          operation: 'delete'
        });
        message.success('批量删除成功');
        fetchUsers();
        clearSelection();
      } catch (error) {
        console.error('Failed to batch delete:', error);
        message.error('批量删除失败');
      }
    }
  });
};

// 初始化
onMounted(() => {
  // 获取当前用户ID
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  currentUserId.value = userInfo.id;

  // 获取用户列表
  fetchUsers();
});
</script>

<style scoped lang="scss">
.user-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h2 {
        font-size: 24px;
        color: #303133;
        margin: 0;
        display: inline-block;
      }

      .subtitle {
        color: #909399;
        font-size: 14px;
        margin-left: 12px;
      }
    }

    .header-right {
      display: flex;
      gap: 10px;
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .table-card {
    .batch-actions {
      margin-bottom: 16px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-text {
        .username {
          font-weight: 500;
          color: #303133;
        }

        .email {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }

  .user-detail {
    :deep(.ant-descriptions) {
      margin-bottom: 24px;
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .user-management {
    padding: 10px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      .header-right {
        width: 100%;
        display: flex;
        gap: 10px;

        .ant-btn {
          flex: 1;
        }
      }
    }
  }
}
</style>