<template>
  <a-layout-header :style="headerStyle">
    <div :style="brandBox" @click="goToHome" style="cursor: pointer;">
      <a-avatar :style="{ backgroundColor: '#111827' }" shape="square" size="small">🍱</a-avatar>
      <a-typography-title :level="4" :style="brandTitle">NUSHungry</a-typography-title>
    </div>

    <a-dropdown
      v-model:open="dropdownVisible"
      :trigger="['focus']"
      placement="bottomLeft"
    >
      <a-input-search
        v-model:value="searchKeyword"
        allow-clear
        :style="searchStyle"
        size="large"
        placeholder="Search for canteens, stalls, or dishes..."
        @search="handleSearch"
        @clear="handleSearch"
        @focus="onSearchFocus"
        @blur="onSearchBlur"
        @input="onSearchInput"
      />
      <template #overlay>
        <a-menu v-if="searchOptions.length > 0" class="search-dropdown-menu">
          <a-menu-item
            v-for="(option, index) in searchOptions"
            :key="index"
            @click="onSelectKeyword(option.keyword)"
          >
            <div class="search-option">
              <ClockCircleOutlined style="color: #8c8c8c; margin-right: 8px;" />
              <span>{{ option.keyword }}</span>
            </div>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>

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
        <a-avatar
          :src="userStore.user?.avatarUrl ? getResourceUrl(userStore.user.avatarUrl) : undefined"
          :style="{ backgroundColor: '#1890ff' }"
        >
          <template v-if="!userStore.user?.avatarUrl">
            {{ userStore.username.charAt(0).toUpperCase() }}
          </template>
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
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, SettingOutlined, LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { getResourceUrl } from '@/utils/config'
import searchService from '@/services/searchService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const searchKeyword = ref('')
const searchOptions = ref([])
const recentKeywords = ref([])
const dropdownVisible = ref(false)

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

// 加载搜索历史
const loadSearchSuggestions = async () => {
  // 只加载已登录用户的搜索历史
  if (!userStore.isAuthenticated) {
    console.log('用户未登录，不加载搜索历史')
    return
  }

  try {
    // 加载用户搜索历史
    const keywords = await searchService.getRecentKeywords(10)
    recentKeywords.value = keywords
    console.log('成功加载搜索历史:', keywords)
  } catch (error) {
    // 静默处理错误，不影响用户体验
    console.error('无法加载搜索历史:', error)
  }
}

// 搜索框聚焦时显示建议
const onSearchFocus = () => {
  updateSearchOptions(searchKeyword.value)
  console.log('搜索框聚焦，searchOptions:', searchOptions.value)
  console.log('recentKeywords:', recentKeywords.value)
  if (searchOptions.value.length > 0) {
    dropdownVisible.value = true
    console.log('显示下拉框')
  } else {
    console.log('没有搜索选项，不显示下拉框')
  }
}

// 搜索框失焦时延迟隐藏（给点击事件时间）
const onSearchBlur = () => {
  setTimeout(() => {
    dropdownVisible.value = false
  }, 200)
}

// 输入搜索关键词时的处理
const onSearchInput = (e) => {
  const value = e.target.value
  updateSearchOptions(value)
  dropdownVisible.value = searchOptions.value.length > 0
}

// 更新搜索选项
const updateSearchOptions = (value) => {
  console.log('>>> updateSearchOptions 被调用')
  console.log('>>> 输入值:', value)
  console.log('>>> recentKeywords:', recentKeywords.value)
  console.log('>>> recentKeywords.length:', recentKeywords.value.length)

  if (!value || value.trim() === '') {
    // 显示所有历史搜索
    searchOptions.value = recentKeywords.value.map(k => ({
      value: k,
      label: k,
      keyword: k,
      isHistory: true
    }))
  } else {
    // 根据输入过滤历史搜索
    searchOptions.value = recentKeywords.value
      .filter(k => k.toLowerCase().includes(value.toLowerCase()))
      .map(k => ({
        value: k,
        label: k,
        keyword: k,
        isHistory: true
      }))
  }

  console.log('>>> 更新后的searchOptions:', searchOptions.value)
  console.log('>>> searchOptions.length:', searchOptions.value.length)
}

// 选择关键词时的处理
const onSelectKeyword = (value) => {
  searchKeyword.value = value
  dropdownVisible.value = false
  handleSearch()
}

// 执行搜索
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()

  dropdownVisible.value = false

  // 跳转到首页，如果关键词为空则清除keyword参数
  if (!keyword) {
    // 清空搜索：移除keyword参数，保留其他查询参数
    const { keyword: _, ...otherQuery } = route.query
    router.push({
      path: '/',
      query: otherQuery
    })
  } else {
    // 有关键词：添加keyword参数
    router.push({
      path: '/',
      query: {
        ...route.query,
        keyword: keyword
      }
    })

    // 调用搜索API以记录搜索历史（后台执行，不影响页面显示）
    try {
      console.log('调用搜索API记录搜索历史:', keyword)
      await searchService.searchStalls({ keyword })
      console.log('搜索API调用成功')
      // 重新加载搜索历史以更新下拉建议
      await loadSearchSuggestions()
    } catch (error) {
      console.error('调用搜索API失败:', error)
      // 静默处理错误，不影响用户体验
    }
  }
}

// 监听路由变化，从URL参数中恢复搜索关键词
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    searchKeyword.value = newKeyword
  }
}, { immediate: true })

// 监听用户登录状态变化
watch(() => userStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadSearchSuggestions()
  } else {
    recentKeywords.value = []
    searchOptions.value = []
  }
})

onMounted(() => {
  loadSearchSuggestions()

  // 从URL参数中恢复搜索关键词
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword
  }
})

const goToHome = () => {
  router.push('/')
}

const goToLogin = () => {
  console.log('goToLogin clicked')
  router.push('/login')
}

const goToRegister = () => {
  console.log('goToRegister clicked')
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

.search-option {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.search-option span {
  color: #333;
}

:deep(.search-dropdown-menu) {
  min-width: 300px;
  max-width: 720px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.search-dropdown-menu .ant-menu-item) {
  padding: 8px 16px;
}

:deep(.search-dropdown-menu .ant-menu-item:hover) {
  background-color: #f5f5f5;
}
</style>
