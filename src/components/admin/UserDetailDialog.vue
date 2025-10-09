<template>
  <el-dialog
    v-model="dialogVisible"
    title="用户详情"
    width="600px"
    :before-close="handleClose"
  >
    <div v-loading="loading" class="user-detail">
      <div v-if="userDetail" class="detail-content">
        <!-- 用户基本信息 -->
        <div class="info-section">
          <h4>基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>用户ID：</label>
              <span>{{ userDetail.id }}</span>
            </div>
            <div class="info-item">
              <label>用户名：</label>
              <span>{{ userDetail.username }}</span>
            </div>
            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ userDetail.email || '未设置' }}</span>
            </div>
            <div class="info-item">
              <label>手机：</label>
              <span>{{ userDetail.phone || '未设置' }}</span>
            </div>
            <div class="info-item">
              <label>角色：</label>
              <el-tag :type="getRoleTagType(userDetail.role)">
                {{ getRoleName(userDetail.role) }}
              </el-tag>
            </div>
            <div class="info-item">
              <label>状态：</label>
              <el-tag :type="userDetail.enabled ? 'success' : 'danger'">
                {{ userDetail.enabled ? '已启用' : '已禁用' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="info-section">
          <h4>时间信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>注册时间：</label>
              <span>{{ formatDate(userDetail.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>最后登录：</label>
              <span>{{ formatDate(userDetail.lastLoginAt) || '从未登录' }}</span>
            </div>
            <div class="info-item">
              <label>更新时间：</label>
              <span>{{ formatDate(userDetail.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="info-section">
          <h4>统计信息</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.reviewCount || 0 }}</div>
              <div class="stat-label">评价数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.favoriteCount || 0 }}</div>
              <div class="stat-label">收藏数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.loginCount || 0 }}</div>
              <div class="stat-label">登录次数</div>
            </div>
          </div>
        </div>

        <!-- 最近活动 -->
        <div v-if="activities && activities.length > 0" class="info-section">
          <h4>最近活动</h4>
          <el-timeline>
            <el-timeline-item
              v-for="activity in activities"
              :key="activity.id"
              :timestamp="formatDate(activity.createdAt)"
              placement="top"
            >
              {{ activity.description }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleEdit">编辑用户</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import adminUserApi from '@/api/admin/user';
import { formatDate } from '@/utils/date';
import { getRoleName } from '@/utils/role';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:visible', 'update', 'edit']);

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// 数据
const loading = ref(false);
const userDetail = ref(null);
const activities = ref([]);

// 监听用户变化，加载详情
watch(() => props.user, async (newUser) => {
  if (newUser && props.visible) {
    await loadUserDetail(newUser.id);
  }
}, { immediate: true });

// 加载用户详情
const loadUserDetail = async (userId) => {
  if (!userId) return;

  loading.value = true;
  try {
    // 获取用户详情
    const response = await adminUserApi.getUserDetail(userId);
    userDetail.value = response.data;

    // 获取用户活动记录
    try {
      const activitiesResponse = await adminUserApi.getUserActivities(userId, {
        limit: 5
      });
      activities.value = activitiesResponse.data || [];
    } catch (error) {
      // 活动记录加载失败不影响主要功能
      console.error('Failed to load user activities:', error);
      activities.value = [];
    }
  } catch (error) {
    console.error('Failed to load user detail:', error);
    ElMessage.error('加载用户详情失败');
  } finally {
    loading.value = false;
  }
};

// 获取角色标签类型
const getRoleTagType = (role) => {
  switch (role) {
    case 'ROLE_ADMIN':
      return 'danger';
    case 'ROLE_USER':
      return 'info';
    default:
      return 'info';
  }
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};

// 编辑用户
const handleEdit = () => {
  emit('edit', userDetail.value);
  handleClose();
};
</script>

<style scoped lang="scss">
.user-detail {
  min-height: 300px;

  .detail-content {
    padding: 10px 0;
  }

  .info-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 16px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 500;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .info-item {
      display: flex;
      align-items: center;
      padding: 8px 0;

      label {
        color: #909399;
        margin-right: 8px;
        min-width: 80px;
      }

      span {
        color: #303133;
        flex: 1;
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 12px;

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  :deep(.el-timeline) {
    margin-left: 0;
    padding-left: 0;
  }
}

@media screen and (max-width: 600px) {
  .info-grid {
    grid-template-columns: 1fr !important;
  }

  .stats-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>