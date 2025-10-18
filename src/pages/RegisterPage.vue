<template>
  <div class="register-container">
    <a-card class="register-card" :title="$t('auth.registerTitle')">
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleRegister"
        layout="vertical"
      >
        <a-form-item :label="$t('auth.username')" name="username">
          <a-input
            v-model:value="formState.username"
            :placeholder="$t('auth.usernamePlaceholder')"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item :label="$t('auth.email')" name="email">
          <a-input
            v-model:value="formState.email"
            :placeholder="$t('auth.emailPlaceholder')"
            size="large"
            type="email"
          >
            <template #prefix>
              <MailOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item :label="$t('auth.password')" name="password">
          <a-input-password
            v-model:value="formState.password"
            :placeholder="$t('auth.passwordPlaceholder')"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item :label="$t('auth.confirmPassword')" name="confirmPassword">
          <a-input-password
            v-model:value="formState.confirmPassword"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
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
            block
            :loading="loading"
          >
            {{ $t('common.register') }}
          </a-button>
        </a-form-item>

        <a-form-item>
          <div class="register-footer">
            <span>{{ $t('auth.hasAccount') }}</span>
            <a @click="goToLogin">{{ $t('auth.loginNow') }}</a>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const { t } = useI18n()

const formState = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePassword = (rule, value) => {
  if (value === '') {
    return Promise.reject(t('auth.passwordRequired'))
  } else if (value.length < 6) {
    return Promise.reject(t('auth.passwordMinLength'))
  } else {
    return Promise.resolve()
  }
}

const validateConfirmPassword = (rule, value) => {
  if (value === '') {
    return Promise.reject(t('auth.confirmPasswordRequired'))
  } else if (value !== formState.password) {
    return Promise.reject(t('auth.passwordNotMatch'))
  } else {
    return Promise.resolve()
  }
}

const rules = computed(() => ({
  username: [
    { required: true, message: t('auth.usernameRequired'), trigger: 'blur' },
    { min: 3, message: t('auth.usernameMinLength'), trigger: 'blur' },
    { max: 20, message: t('validation.tooLong'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('auth.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))

const handleRegister = async () => {
  try {
    loading.value = true
    const result = await userStore.register({
      username: formState.username,
      email: formState.email,
      password: formState.password
    })

    if (result.success) {
      message.success(t('auth.registerSuccess'))
      // 跳转到首页
      router.push('/')
    } else {
      message.error(result.message || t('auth.registerFailed'))
    }
  } catch (error) {
    message.error(t('auth.registerFailed'))
    console.error('Register error:', error)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.register-card :deep(.ant-card-head) {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border-bottom: 2px solid #f0f0f0;
}

.register-footer {
  text-align: center;
  margin-top: 16px;
}

.register-footer span {
  margin-right: 8px;
  color: #666;
}

.register-footer a {
  color: #1890ff;
  cursor: pointer;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
