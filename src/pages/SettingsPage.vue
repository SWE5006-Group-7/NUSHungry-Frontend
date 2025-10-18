<template>
  <div class="settings-container">
    <Header />
    <div class="settings-content">
      <!-- 返回按钮 -->
      <div class="back-button-container">
        <a-button type="text" size="large" @click="goBack" class="back-btn">
          <LeftOutlined />
          <span>{{ $t('common.back') }}</span>
        </a-button>
      </div>

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">
          <SettingOutlined class="title-icon" />
          {{ $t('settings.title') }}
        </h1>
        <p class="page-description">{{ $t('settings.description') }}</p>
      </div>

      <!-- 设置卡片 -->
      <div class="settings-cards">
        <!-- 头像上传卡片 -->
        <a-card class="setting-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <UserOutlined class="card-icon" />
              <span>{{ $t('settings.avatarSettings') }}</span>
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
                <a-button type="primary" size="large">
                  <UploadOutlined />
                  {{ $t('settings.uploadAvatar') }}
                </a-button>
              </a-upload>
              <p class="upload-tip">{{ $t('settings.uploadTip') }}</p>
            </div>
          </div>
        </a-card>

        <!-- 个人信息卡片 -->
        <a-card class="setting-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <UserOutlined class="card-icon" />
              <span>{{ $t('settings.personalInfo') }}</span>
            </div>
          </template>
          <a-form
            :model="profileForm"
            :rules="profileRules"
            layout="vertical"
            @finish="handleUpdateProfile"
          >
            <a-form-item :label="$t('auth.username')" name="username">
              <a-input
                v-model:value="profileForm.username"
                :placeholder="$t('auth.username')"
                disabled
                size="large"
              >
                <template #prefix>
                  <UserOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item :label="$t('auth.email')" name="email">
              <a-input
                v-model:value="profileForm.email"
                :placeholder="$t('auth.email')"
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
                {{ $t('common.save') }}
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 修改密码卡片 -->
        <a-card class="setting-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <LockOutlined class="card-icon" />
              <span>{{ $t('settings.changePassword') }}</span>
            </div>
          </template>
          <a-form
            :model="passwordForm"
            :rules="passwordRules"
            layout="vertical"
            @finish="handleChangePassword"
          >
            <a-form-item :label="$t('settings.currentPassword')" name="currentPassword">
              <a-input-password
                v-model:value="passwordForm.currentPassword"
                :placeholder="$t('settings.currentPasswordPlaceholder')"
                size="large"
              >
                <template #prefix>
                  <LockOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item :label="$t('settings.newPassword')" name="newPassword">
              <a-input-password
                v-model:value="passwordForm.newPassword"
                :placeholder="$t('settings.newPasswordPlaceholder')"
                size="large"
              >
                <template #prefix>
                  <LockOutlined style="color: rgba(0, 0, 0, 0.45)" />
                </template>
              </a-input-password>
            </a-form-item>

            <a-form-item :label="$t('settings.confirmNewPassword')" name="confirmPassword">
              <a-input-password
                v-model:value="passwordForm.confirmPassword"
                :placeholder="$t('settings.confirmNewPasswordPlaceholder')"
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
                {{ $t('settings.changePassword') }}
              </a-button>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 账户管理卡片 -->
        <a-card class="setting-card danger-card" :hoverable="false">
          <template #title>
            <div class="card-title">
              <LogoutOutlined class="card-icon" />
              <span>{{ $t('settings.accountManagement') }}</span>
            </div>
          </template>
          <div class="account-section">
            <div class="logout-info">
              <p class="logout-title">{{ $t('settings.logoutTitle') }}</p>
              <p class="logout-description">{{ $t('settings.logoutDescription') }}</p>
            </div>
            <a-button
              type="primary"
              danger
              size="large"
              @click="handleLogout"
              block
            >
              <LogoutOutlined />
              {{ $t('common.logout') }}
            </a-button>
          </div>
        </a-card>
      </div>
    </div>

    <!-- 头像裁剪对话框 -->
    <AvatarCropper
      v-model="showCropper"
      :image-file="selectedFile"
      @success="handleAvatarSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  LogoutOutlined,
  SettingOutlined,
  UploadOutlined,
  LeftOutlined
} from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import Header from '@/components/Header.vue'
import AvatarCropper from '@/components/AvatarCropper.vue'
import authService from '@/services/authService'
import { getResourceUrl } from '@/utils/config'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()

const activeTab = ref('profile')
const loadingProfile = ref(false)
const loadingPassword = ref(false)
const avatarPreview = ref(null)
const showCropper = ref(false)
const selectedFile = ref(null)

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
const profileRules = computed(() => ({
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' }
  ]
}))

// 密码验证
const validateNewPassword = (rule, value) => {
  if (value === '') {
    return Promise.reject(t('auth.passwordRequired'))
  } else if (value.length < 6) {
    return Promise.reject(t('auth.passwordMinLength'))
  } else if (value === passwordForm.currentPassword) {
    return Promise.reject(t('settings.passwordNotSame'))
  } else {
    return Promise.resolve()
  }
}

const validateConfirmPassword = (rule, value) => {
  if (value === '') {
    return Promise.reject(t('auth.confirmPasswordRequired'))
  } else if (value !== passwordForm.newPassword) {
    return Promise.reject(t('auth.passwordNotMatch'))
  } else {
    return Promise.resolve()
  }
}

// 密码验证规则
const passwordRules = computed(() => ({
  currentPassword: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

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
      message.success(t('settings.profileUpdateSuccess'))
    } else {
      message.error(result.message || t('settings.profileUpdateFailed'))
    }
  } catch (error) {
    message.error(t('settings.profileUpdateFailed'))
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
      message.success(t('settings.passwordUpdateSuccess'))
      // 清空表单
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      message.error(result.message || t('settings.passwordUpdateFailed'))
    }
  } catch (error) {
    message.error(t('settings.passwordUpdateFailed'))
    console.error('Change password error:', error)
  } finally {
    loadingPassword.value = false
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  message.success(t('auth.logoutSuccess'))
  router.push('/login')
}

// 头像上传前的处理
const handleBeforeUpload = (file) => {
  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error(t('settings.onlyImage'))
    return false
  }

  // 检查文件大小 (10MB)
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error(t('settings.imageSizeLimit'))
    return false
  }

  // 显示裁剪器
  selectedFile.value = file
  showCropper.value = true

  return false // 阻止自动上传
}

// 头像上传成功回调
const handleAvatarSuccess = (newAvatarUrl) => {
  // 更新预览
  avatarPreview.value = getResourceUrl(newAvatarUrl)

  // 更新用户store
  if (userStore.user) {
    userStore.user.avatarUrl = newAvatarUrl
  }

  message.success(t('settings.avatarUploadSuccess'))
}

// 返回上一页
const goBack = () => {
  router.back()
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

/* 返回按钮 */
.back-button-container {
  margin-bottom: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.back-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
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
