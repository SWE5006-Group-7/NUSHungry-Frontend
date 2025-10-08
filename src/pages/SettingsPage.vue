<template>
  <div class="settings-container">
    <Header />
    <div class="settings-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <SettingOutlined class="title-icon" />
          设置
        </h1>
        <p class="page-description">管理您的账户设置和偏好</p>
      </div>

      <!-- 设置卡片 -->
      <div class="settings-cards">
        <!-- 头像上传卡片 -->
        <a-card class="setting-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <UserOutlined class="card-icon" />
              <span>头像设置</span>
            </div>
          </template>
          <div class="avatar-section">
            <div class="avatar-preview">
              <a-avatar
                :size="120"
                :src="avatarPreview || (userStore.user?.avatarUrl ? getResourceUrl(userStore.user.avatarUrl) : undefined)"
                :style="{ backgroundColor: '#1890ff' }"
              >
                <template v-if="!avatarPreview && !userStore.user?.avatarUrl">
                  {{ userStore.username.charAt(0).toUpperCase() }}
                </template>
              </a-avatar>
            </div>
            <div class="avatar-upload">
              <a-upload
                :before-upload="handleBeforeUpload"
                :show-upload-list="false"
                accept="image/*"
              >
                <a-button type="primary" size="large" :loading="uploadingAvatar">
                  <UploadOutlined />
                  选择头像
                </a-button>
              </a-upload>
              <p class="upload-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
            </div>
          </div>
        </a-card>

        <!-- 个人信息卡片 -->
        <a-card class="setting-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <UserOutlined class="card-icon" />
              <span>个人信息</span>
            </div>
          </template>
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
                  <UserOutlined style="color: rgba(0, 0, 0, 0.45)" />
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
                  <MailOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item style="margin-bottom: 0">
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="loadingProfile"
                block
              >
                保存修改
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 修改密码卡片 -->
        <a-card class="setting-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <LockOutlined class="card-icon" />
              <span>修改密码</span>
            </div>
          </template>
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
                  <LockOutlined style="color: rgba(0, 0, 0, 0.45)" />
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
                  <LockOutlined style="color: rgba(0, 0, 0, 0.45)" />
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
                  <LockOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item style="margin-bottom: 0">
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="loadingPassword"
                block
              >
                修改密码
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 账户管理卡片 -->
        <a-card class="setting-card danger-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <LogoutOutlined class="card-icon" />
              <span>账户管理</span>
            </div>
          </template>
          <div class="account-section">
            <div class="logout-info">
              <p class="logout-title">退出登录</p>
              <p class="logout-description">退出登录后，您将返回到登录页面</p>
            </div>
            <a-button
              type="primary"
              danger
              size="large"
              @click="handleLogout"
              block
            >
              <LogoutOutlined />
              退出登录
            </a-button>
          </div>
        </a-card>
      </div>
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
  LogoutOutlined,
  SettingOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import Header from '@/components/Header.vue'
import authService from '@/services/authService'
import { getResourceUrl } from '@/utils/config'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('profile')
const loadingProfile = ref(false)
const loadingPassword = ref(false)
const uploadingAvatar = ref(false)
const avatarPreview = ref(null)

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

// 头像上传前的处理
const handleBeforeUpload = async (file) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }

  // 检查文件大小 (2MB)
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }

  // 上传头像
  try {
    uploadingAvatar.value = true

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    // 上传到服务器
    const avatarUrl = await authService.uploadAvatar(file)

    // 更新用户store
    userStore.user.avatarUrl = avatarUrl

    message.success('头像上传成功!')
  } catch (error) {
    message.error('头像上传失败,请稍后重试')
    console.error('Upload avatar error:', error)
    avatarPreview.value = null
  } finally {
    uploadingAvatar.value = false
  }

  return false // 阻止自动上传
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #fafafa 0%, #f0f0f0 100%);
  padding-top: 80px;
}

.settings-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.title-icon {
  font-size: 36px;
  color: #374151;
}

.page-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

/* 设置卡片容器 */
.settings-cards {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  background: #ffffff;
  overflow: hidden;
  transition: all 0.2s ease;
}

.setting-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06);
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.danger-card {
  border-color: #fecaca;
  background: #ffffff;
}

.danger-card:hover {
  border-color: #fca5a5;
}

/* 卡片标题 */
.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.card-icon {
  font-size: 20px;
  color: #374151;
}

.danger-card .card-icon {
  color: #dc2626;
}

/* 表单样式优化 */
:deep(.ant-card-head) {
  background-color: #fafafa;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.ant-form-item-label > label) {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
}

:deep(.ant-input),
:deep(.ant-input-password) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

:deep(.ant-input:hover),
:deep(.ant-input-password:hover) {
  border-color: #9ca3af;
}

:deep(.ant-input:focus),
:deep(.ant-input-password .ant-input:focus) {
  border-color: #111827;
  box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.08);
}

:deep(.ant-input-disabled) {
  background-color: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}

:deep(.ant-btn) {
  border-radius: 6px;
  font-weight: 500;
  height: 44px;
  font-size: 15px;
  transition: all 0.2s ease;
}

:deep(.ant-btn-primary) {
  background: #111827;
  border-color: #111827;
  color: #ffffff;
}

:deep(.ant-btn-primary:hover) {
  background: #1f2937;
  border-color: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(17, 24, 39, 0.15);
}

:deep(.ant-btn-primary:active) {
  background: #0f1419;
  border-color: #0f1419;
  transform: translateY(0);
}

:deep(.ant-btn-primary.ant-btn-dangerous) {
  background: #dc2626;
  border-color: #dc2626;
}

:deep(.ant-btn-primary.ant-btn-dangerous:hover) {
  background: #b91c1c;
  border-color: #b91c1c;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);
}

:deep(.ant-btn-primary.ant-btn-dangerous:active) {
  background: #991b1b;
  border-color: #991b1b;
}

/* 头像上传区域 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 12px 0;
}

.avatar-preview {
  flex-shrink: 0;
}

.avatar-upload {
  flex: 1;
}

.upload-tip {
  margin-top: 12px;
  color: #6b7280;
  font-size: 13px;
}

/* 账户管理区域 */
.account-section {
  padding: 12px 0;
}

.logout-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.logout-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.logout-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-content {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 26px;
  }

  .title-icon {
    font-size: 28px;
  }

  .page-description {
    font-size: 14px;
  }

  .card-title {
    font-size: 16px;
  }
}
</style>
