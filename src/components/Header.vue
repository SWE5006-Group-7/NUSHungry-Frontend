<template>
  <a-layout-header class="app-header">
    <div class="header-left">
      <div class="logo">
        <img src="/src/assets/logo.svg" alt="NUSHungry Logo" class="logo-icon" />
        <a-typography-title :level="3" class="logo-text">
          Nushungry
        </a-typography-title>
      </div>
      <a-space :size="24" class="header-nav">
        <a-button type="link" class="nav-link">
          <template #icon><HomeOutlined /></template>
          Home
        </a-button>
        <a-button type="link" class="nav-link">
          <template #icon><ShopOutlined /></template>
          Cafeterias
        </a-button>
        <a-button type="link" class="nav-link">
          <template #icon><FireOutlined /></template>
          Stalls
        </a-button>
      </a-space>
    </div>

    <a-space :size="16" class="header-right">
      <a-button size="middle" class="login-btn">
        Sign In
      </a-button>
      <a-button type="primary" size="middle" class="signup-btn">
        Sign Up
      </a-button>
    </a-space>
  </a-layout-header>
</template>

<script setup>
import { HomeOutlined, ShopOutlined, FireOutlined, MessageOutlined } from '@ant-design/icons-vue';
</script>

<style scoped>
.app-header {
  background: var(--surface-color);
  padding: 0 var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  height: 64px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: var(--box-shadow-sm);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: var(--space-xl);
}

.logo-icon {
  height: 32px;
  margin-right: var(--space-sm);
}

.logo-text {
  color: var(--primary-color) !important;
  margin: 0 !important;
  font-weight: 700 !important;
  font-size: 20px !important;
}

.nav-link {
  color: var(--text-color-secondary) !important;
  font-weight: 500 !important;
  font-size: 15px;
  padding: 0 var(--space-sm);
}

.nav-link:hover {
  color: var(--primary-color) !important;
}

.header-right {
  display: flex;
  align-items: center;
}

.login-btn {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.login-btn:hover {
  background-color: rgba(109, 40, 217, 0.05);
}
</style>