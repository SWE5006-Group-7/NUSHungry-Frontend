<template>
  <div class="forgot-password-container">
    <a-card class="forgot-password-card" title="找回密码">
      <!-- 步骤指示器 -->
      <a-steps :current="currentStep" class="steps">
        <a-step title="输入邮箱" />
        <a-step title="验证身份" />
        <a-step title="重置密码" />
      </a-steps>

      <!-- 第一步:输入邮箱 -->
      <div v-if="currentStep === 0" class="step-content">
        <a-form
          :model="emailForm"
          :rules="emailRules"
          @finish="handleSendCode"
          layout="vertical"
        >
          <a-form-item label="邮箱地址" name="email">
            <a-input
              v-model:value="emailForm.email"
              placeholder="请输入注册时使用的邮箱"
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
              发送验证码
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 第二步:验证码 -->
      <div v-if="currentStep === 1" class="step-content">
        <a-alert
          message="验证码已发送"
          :description="`验证码已发送至 ${emailForm.email},请注意查收`"
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
          <a-form-item label="验证码" name="code">
            <a-input
              v-model:value="codeForm.code"
              placeholder="请输入6位验证码"
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
                验证
              </a-button>

              <a-button
                type="link"
                block
                :disabled="countdown > 0"
                @click="handleResendCode"
              >
                {{ countdown > 0 ? `${countdown}秒后可重新发送` : '重新发送验证码' }}
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- 第三步:重置密码 -->
      <div v-if="currentStep === 2" class="step-content">
        <a-alert
          message="验证成功"
          description="请设置新密码"
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
          <a-form-item label="新密码" name="newPassword">
            <a-input-password
              v-model:value="passwordForm.newPassword"
              placeholder="请输入新密码(6-20个字符)"
              size="large"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item label="确认密码" name="confirmPassword">
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
              block
              :loading="loading"
            >
              重置密码
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 返回登录 -->
      <div class="footer">
        <a @click="goToLogin">返回登录</a>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  MailOutlined,
  LockOutlined,
  SafetyOutlined
} from '@ant-design/icons-vue'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const currentStep = ref(0)
const countdown = ref(0)

// 第一步:邮箱表单
const emailForm = reactive({
  email: ''
})

const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 第二步:验证码表单
const codeForm = reactive({
  code: ''
})

const codeRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// 第三步:密码表单
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 发送验证码
const handleSendCode = async () => {
  try {
    loading.value = true
    const response = await axios.post('/api/password/send-reset-code', {
      email: emailForm.email
    })

    if (response.data.success) {
      message.success(response.data.message || '验证码已发送')
      currentStep.value = 1
      startCountdown()
    } else {
      message.error(response.data.message || '发送失败')
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    message.error(error.response?.data?.message || '发送验证码失败,请稍后重试')
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
      message.success('验证成功')
      currentStep.value = 2
    } else {
      message.error(response.data.message || '验证码错误')
    }
  } catch (error) {
    console.error('验证失败:', error)
    message.error(error.response?.data?.message || '验证失败,请重试')
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
      message.success('密码重置成功,请使用新密码登录')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      message.error(response.data.message || '密码重置失败')
    }
  } catch (error) {
    console.error('重置密码失败:', error)
    message.error(error.response?.data?.message || '密码重置失败,请重试')
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
