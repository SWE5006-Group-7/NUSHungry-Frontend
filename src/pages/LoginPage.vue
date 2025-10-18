<template>
  <div class="login-container">
    <a-card class="login-card" :title="$t('auth.loginTitle')">
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
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
          <div style="text-align: right; margin-top: 8px;">
            <a @click="goToForgotPassword" style="font-size: 14px;">{{ $t('auth.forgotPassword') }}</a>
          </div>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            {{ $t('common.login') }}
          </a-button>
        </a-form-item>

        <a-form-item>
          <div class="login-footer">
            <span>{{ $t('auth.noAccount') }}</span>
            <a @click="goToRegister">{{ $t('auth.registerNow') }}</a>
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
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const { t } = useI18n()

const formState = reactive({
  username: '',
  password: ''
})

const rules = computed(() => ({
  username: [
    { required: true, message: t('auth.usernameRequired'), trigger: 'blur' },
    { min: 3, message: t('auth.usernameMinLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('auth.passwordMinLength'), trigger: 'blur' }
  ]
}))

const handleLogin = async () => {
  try {
    loading.value = true
    const result = await userStore.login({
      username: formState.username,
      password: formState.password
    })

    if (result.success) {
      message.success(t('auth.loginSuccess'))
      // 跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
    } else {
      message.error(result.message || t('auth.loginFailed'))
    }
  } catch (error) {
    message.error(t('auth.loginFailed'))
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.login-card :deep(.ant-card-head) {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  border-bottom: 2px solid #f0f0f0;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
}

.login-footer span {
  margin-right: 8px;
  color: #666;
}

.login-footer a {
  color: #1890ff;
  cursor: pointer;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>
