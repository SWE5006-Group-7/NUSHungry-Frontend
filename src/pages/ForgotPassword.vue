<template>
  <div class="forgot-password-container">
    <a-card class="forgot-password-card" :title="$t('forgotPassword.title')">
      <!-- 步骤指示器 -->
      <a-steps :current="currentStep" class="steps">
        <a-step :title="$t('forgotPassword.stepEmail')" />
        <a-step :title="$t('forgotPassword.stepVerify')" />
        <a-step :title="$t('forgotPassword.stepReset')" />
      </a-steps>

      <!-- 第一步:输入邮箱 -->
      <div v-if="currentStep === 0" class="step-content">
        <a-form
          :model="emailForm"
          :rules="emailRules"
          @finish="handleSendCode"
          layout="vertical"
        >
          <a-form-item :label="$t('forgotPassword.emailLabel')" name="email">
            <a-input
              v-model:value="emailForm.email"
              :placeholder="$t('forgotPassword.emailPlaceholder')"
              size="large"
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
              block
              :loading="loading"
            >
              {{ $t('forgotPassword.sendCode') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 第二步:验证码 -->
      <div v-if="currentStep === 1" class="step-content">
        <a-alert
          :message="$t('forgotPassword.codeSent')"
          :description="$t('forgotPassword.codeDescription', { email: emailForm.email })"
          type="success"
          show-icon
          class="alert-info"
        />

        <a-form
          :model="codeForm"
          :rules="codeRules"
          @finish="handleVerifyCode"
          layout="vertical"
        >
          <a-form-item :label="$t('forgotPassword.verificationCode')" name="code">
            <a-input
              v-model:value="codeForm.code"
              :placeholder="$t('forgotPassword.verificationCodePlaceholder')"
              size="large"
              maxlength="6"
            >
              <template #prefix>
                <SafetyOutlined />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-space direction="vertical" style="width: 100%">
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                block
                :loading="loading"
              >
                {{ $t('forgotPassword.verify') }}
              </a-button>

              <a-button
                type="link"
                block
                :disabled="countdown > 0"
                @click="handleResendCode"
              >
                {{ countdown > 0 ? $t('forgotPassword.resendCountdown', { n: countdown }) : $t('forgotPassword.resendCode') }}
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- 第三步:重置密码 -->
      <div v-if="currentStep === 2" class="step-content">
        <a-alert
          :message="$t('forgotPassword.verificationSuccess')"
          :description="$t('forgotPassword.setNewPassword')"
          type="success"
          show-icon
          class="alert-info"
        />

        <a-form
          :model="passwordForm"
          :rules="passwordRules"
          @finish="handleResetPassword"
          layout="vertical"
        >
          <a-form-item :label="$t('forgotPassword.newPassword')" name="newPassword">
            <a-input-password
              v-model:value="passwordForm.newPassword"
              :placeholder="$t('forgotPassword.newPasswordPlaceholder')"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item :label="$t('forgotPassword.confirmPassword')" name="confirmPassword">
            <a-input-password
              v-model:value="passwordForm.confirmPassword"
              :placeholder="$t('forgotPassword.confirmPasswordPlaceholder')"
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
              {{ $t('forgotPassword.resetPassword') }}
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 返回登录 -->
      <div class="footer">
        <a @click="goToLogin">{{ $t('forgotPassword.backToLogin') }}</a>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import {
  MailOutlined,
  LockOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'
import axios from 'axios'

const router = useRouter()
const { t } = useI18n()
const loading = ref(false)
const currentStep = ref(0)
const countdown = ref(0)

// 第一步:邮箱表单
const emailForm = reactive({
  email: ''
})

const emailRules = computed(() => ({
  email: [
    { required: true, message: t('forgotPassword.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('auth.emailInvalid'), trigger: 'blur' }
  ]
}))

// 第二步:验证码表单
const codeForm = reactive({
  code: ''
})

const codeRules = computed(() => ({
  code: [
    { required: true, message: t('forgotPassword.codeRequired'), trigger: 'blur' },
    { len: 6, message: t('forgotPassword.codeLength'), trigger: 'blur' }
  ]
}))

// 第三步:密码表单
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = computed(() => ({
  newPassword: [
    { required: true, message: t('auth.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('forgotPassword.passwordLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('auth.confirmPasswordRequired'), trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject(t('auth.passwordNotMatch'))
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}))

// 发送验证码
const handleSendCode = async () => {
  try {
    loading.value = true
    const response = await axios.post('/api/password/send-reset-code', {
      email: emailForm.email
    })

    if (response.data.success) {
      message.success(response.data.message || t('forgotPassword.codeSent'))
      currentStep.value = 1
      startCountdown()
    } else {
      message.error(response.data.message || t('messages.operationFailed'))
    }
  } catch (error) {
    console.error('Send code error:', error)
    message.error(error.response?.data?.message || t('messages.operationFailed'))
  } finally {
    loading.value = false
  }
}

// 验证验证码
const handleVerifyCode = async () => {
  try {
    loading.value = true
    const response = await axios.post('/api/password/verify-reset-code', {
      email: emailForm.email,
      code: codeForm.code
    })

    if (response.data.success) {
      message.success(t('forgotPassword.verificationSuccess'))
      currentStep.value = 2
    } else {
      message.error(response.data.message || t('messages.operationFailed'))
    }
  } catch (error) {
    console.error('Verify code error:', error)
    message.error(error.response?.data?.message || t('messages.operationFailed'))
  } finally {
    loading.value = false
  }
}

// 重置密码
const handleResetPassword = async () => {
  try {
    loading.value = true
    const response = await axios.post('/api/password/reset', {
      email: emailForm.email,
      code: codeForm.code,
      newPassword: passwordForm.newPassword
    })

    if (response.data.success) {
      message.success(t('forgotPassword.resetSuccess'))
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      message.error(response.data.message || t('messages.operationFailed'))
    }
  } catch (error) {
    console.error('Reset password error:', error)
    message.error(error.response?.data?.message || t('messages.operationFailed'))
  } finally {
    loading.value = false
  }
}

// 重新发送验证码
const handleResendCode = async () => {
  await handleSendCode()
}

// 倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 返回登录
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.forgot-password-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.steps {
  margin-bottom: 30px;
}

.step-content {
  margin-top: 30px;
}

.alert-info {
  margin-bottom: 20px;
}

.footer {
  text-align: center;
  margin-top: 20px;
}

.footer a {
  color: #1890ff;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
