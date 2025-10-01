<template>
  <div class="settings-container">
    <Header />
    <div class="settings-content">
      <a-card class="settings-card" title="设置">
        <a-tabs v-model:activeKey="activeTab">
          <!-- 个人信息 -->
          <a-tab-pane key="profile" tab="个人信息">
            <a-form
              :model="profileForm"
              :rules="profileRules"
              layout="vertical"
              @finish="handleUpdateProfile"
            >
              <a-form-item label="用户名" name="username">
                <a-input
                  v-model:value="profileForm.username"
                  placeholder="用户名"
                  disabled
                  size="large"
                >
                  <template #prefix>
                    <UserOutlined />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item label="邮箱" name="email">
                <a-input
                  v-model:value="profileForm.email"
                  placeholder="邮箱"
                  size="large"
                  type="email"
                >
                  <template #prefix>
                    <MailOutlined />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  :loading="loadingProfile"
                >
                  保存修改
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- 修改密码 -->
          <a-tab-pane key="password" tab="修改密码">
            <a-form
              :model="passwordForm"
              :rules="passwordRules"
              layout="vertical"
              @finish="handleChangePassword"
            >
              <a-form-item label="当前密码" name="currentPassword">
                <a-input-password
                  v-model:value="passwordForm.currentPassword"
                  placeholder="请输入当前密码"
                  size="large"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item label="新密码" name="newPassword">
                <a-input-password
                  v-model:value="passwordForm.newPassword"
                  placeholder="请输入新密码 (至少6个字符)"
                  size="large"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item label="确认新密码" name="confirmPassword">
                <a-input-password
                  v-model:value="passwordForm.confirmPassword"
                  placeholder="请再次输入新密码"
                  size="large"
                >
                  <template #prefix>
                    <LockOutlined />
                  </template>
                </a-input-password>
              </a-form-item>

              <a-form-item>
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  :loading="loadingPassword"
                >
                  修改密码
                </a-button>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- 账户管理 -->
          <a-tab-pane key="account" tab="账户管理">
            <div class="account-section">
              <a-alert
                message="退出登录"
                description="退出登录后,您将返回到登录页面"
                type="info"
                show-icon
                style="margin-bottom: 24px"
              />
              <a-button
                type="primary"
                danger
                size="large"
                @click="handleLogout"
              >
                <LogoutOutlined />
                退出登录
              </a-button>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import Header from '@/components/Header.vue'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('profile')
const loadingProfile = ref(false)
const loadingPassword = ref(false)

// 个人信息表单
const profileForm = reactive({
  username: '',
  email: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 个人信息验证规则
const profileRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 密码验证
const validateNewPassword = (rule, value) => {
  if (value === '') {
    return Promise.reject('请输入新密码')
  } else if (value.length < 6) {
    return Promise.reject('密码至少6个字符')
  } else if (value === passwordForm.currentPassword) {
    return Promise.reject('新密码不能与当前密码相同')
  } else {
    return Promise.resolve()
  }
}

const validateConfirmPassword = (rule, value) => {
  if (value === '') {
    return Promise.reject('请确认新密码')
  } else if (value !== passwordForm.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  } else {
    return Promise.resolve()
  }
}

// 密码验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 加载用户信息
const loadUserProfile = () => {
  const user = userStore.user
  if (user) {
    profileForm.username = user.username || ''
    profileForm.email = user.email || ''
  }
}

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    loadingProfile.value = true
    const result = await userStore.updateProfile({
      email: profileForm.email
    })

    if (result.success) {
      message.success('个人信息更新成功!')
    } else {
      message.error(result.message || '更新失败')
    }
  } catch (error) {
    message.error('更新失败,请稍后重试')
    console.error('Update profile error:', error)
  } finally {
    loadingProfile.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  try {
    loadingPassword.value = true
    const result = await userStore.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    if (result.success) {
      message.success('密码修改成功!')
      // 清空表单
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      message.error(result.message || '密码修改失败')
    }
  } catch (error) {
    message.error('密码修改失败,请稍后重试')
    console.error('Change password error:', error)
  } finally {
    loadingPassword.value = false
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/login')
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.settings-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.settings-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.account-section {
  padding: 24px;
  text-align: center;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}
</style>
