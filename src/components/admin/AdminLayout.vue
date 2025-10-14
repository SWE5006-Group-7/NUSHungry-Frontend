<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '250px'" class="admin-sidebar">
      <div class="logo-container">
        <img src="/logo.png" alt="Logo" class="logo" v-if="!isCollapse">
        <span class="logo-text" v-if="!isCollapse">NUSHungry Admin</span>
        <el-icon v-if="isCollapse" class="logo-icon"><Setting /></el-icon>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>仪表板</template>
        </el-menu-item>

        <el-sub-menu index="users">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">用户列表</el-menu-item>
          <el-menu-item index="/admin/users/roles">角色管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/cafeterias">
          <el-icon><Shop /></el-icon>
          <template #title>食堂管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/stalls">
          <el-icon><Dish /></el-icon>
          <template #title>摊位管理</template>
        </el-menu-item>

        <el-menu-item index="/admin/moderation">
          <el-icon><Comment /></el-icon>
          <template #title>内容审核</template>
        </el-menu-item>

        <el-menu-item index="/admin/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>数据统计</template>
        </el-menu-item>

        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主体区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon
            class="collapse-icon"
            @click="toggleSidebar"
          >
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>

          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- 通知 -->
          <el-badge :value="notificationCount" class="notification-badge">
            <el-icon class="header-icon"><Bell /></el-icon>
          </el-badge>

          <!-- 用户信息下拉 -->
          <el-dropdown class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="32" :src="userInfo.avatar || defaultAvatar">
                {{ userInfo.username?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userInfo.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">
                  <el-icon><User /></el-icon>
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item @click="changePassword">
                  <el-icon><Lock /></el-icon>
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided @click="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  DataLine,
  User,
  Shop,
  Dish,
  Comment,
  DataAnalysis,
  Setting,
  Bell,
  ArrowDown,
  SwitchButton,
  Lock,
  Expand,
  Fold
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 状态
const isCollapse = ref(false);
const notificationCount = ref(5);
const userInfo = ref({
  username: 'Admin',
  avatar: null
});
const defaultAvatar = '/default-avatar.png';

// 计算属性
const activeMenu = computed(() => route.path);

const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title);
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }));
});

// 方法
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
};

const goToProfile = () => {
  router.push('/admin/profile');
};

const changePassword = () => {
  router.push('/admin/change-password');
};

const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 清除token
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');

    ElMessage.success('退出成功');
    router.push('/login');
  } catch (error) {
    // 用户取消
  }
};

// 生命周期
onMounted(() => {
  // 获取用户信息
  const storedUserInfo = localStorage.getItem('userInfo');
  if (storedUserInfo) {
    try {
      const parsed = JSON.parse(storedUserInfo);
      userInfo.value = parsed;
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
  }
});
</script>

<style scoped lang="scss">
.admin-layout {
  height: 100vh;
  background-color: #f4f5f7;
}

.admin-sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2b3645;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    .logo {
      width: 32px;
      height: 32px;
      margin-right: 12px;
    }

    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
    }

    .logo-icon {
      color: #fff;
      font-size: 24px;
    }
  }

  :deep(.el-menu) {
    border-right: none;
    height: calc(100vh - 60px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
  }
}

.admin-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;

  .header-left {
    display: flex;
    align-items: center;

    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
      margin-right: 20px;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }

    .breadcrumb {
      :deep(.el-breadcrumb__inner) {
        font-size: 14px;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .notification-badge {
      cursor: pointer;

      .header-icon {
        font-size: 20px;
        color: #606266;
        transition: color 0.3s;

        &:hover {
          color: #409eff;
        }
      }
    }

    .user-dropdown {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        .username {
          font-size: 14px;
          color: #303133;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

.admin-main {
  padding: 20px;
  background-color: #f4f5f7;
  min-height: calc(100vh - 60px);
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    z-index: 999;
    height: 100vh;
  }

  .breadcrumb {
    display: none;
  }
}
</style>