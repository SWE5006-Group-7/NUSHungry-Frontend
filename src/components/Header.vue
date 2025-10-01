<template>
  <a-layout-header :style="headerStyle">
    <div :style="brandBox" @click="goToHome" style="cursor: pointer;">
      <a-avatar :style="{ backgroundColor: '#111827' }" shape="square" size="small">🍱</a-avatar>
      <a-typography-title :level="4" :style="brandTitle">NUSHungry</a-typography-title>
    </div>

    <a-input-search
      allow-clear
      :style="searchStyle"
      size="large"
      placeholder="Search for canteens, stalls, or dishes..."
    />

    <!-- 未登录状态 -->
    <div v-if="!userStore.isAuthenticated" class="auth-buttons">
      <a-button type="primary" ghost :style="signInBtn" @click="goToLogin">
        登录
      </a-button>
      <a-button type="primary" :style="{ marginLeft: '12px' }" @click="goToRegister">
        注册
      </a-button>
    </div>

    <!-- 已登录状态 -->
    <a-dropdown v-else placement="bottomRight">
      <div class="user-menu">
        <a-avatar :style="{ backgroundColor: '#1890ff' }">
          {{ userStore.username.charAt(0).toUpperCase() }}
        </a-avatar>
        <span class="username">{{ userStore.username }}</span>
      </div>
      <template #overlay>
        <a-menu>
          <a-menu-item key="profile" @click="goToProfile">
            <UserOutlined />
            个人中心
          </a-menu-item>
          <a-menu-item key="settings" @click="goToSettings">
            <SettingOutlined />
            设置
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="logout" @click="handleLogout">
            <LogoutOutlined />
            退出登录
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </a-layout-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const headerStyle = {
  background: '#ffffff',
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #f1f5f9',
  position: 'fixed',
  top: '0',
  left: 0,
  right: 0,
  width: '100%',
  /* Ensure header sits above map tiles and other content */
  zIndex: 9999,
  /* create a new stacking context to avoid interference from descendants */
  transform: 'translateZ(0)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
}

const brandBox = { display: 'flex', alignItems: 'center' }
const brandTitle = { margin: 0, marginLeft: '8px', color: '#111827', fontWeight: 700 }
const searchStyle = { maxWidth: '720px', flex: 1, margin: '0 24px' }
const signInBtn = { borderColor: '#111827', color: '#111827' }

const goToHome = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/settings')
}

const handleLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/')
}
</script>

<style scoped>
.auth-buttons {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-menu:hover {
  background-color: #f5f5f5;
}

.username {
  font-weight: 500;
  color: #111827;
}
</style>
