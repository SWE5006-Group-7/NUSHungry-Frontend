<template>
  <div class="login-container">
    <a-card class="login-card" title="登录 NUSHungry">
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
        layout="vertical"
      >
        <a-form-item label="用户名" name="username">
          <a-input
            v-model:value="formState.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item label="密码" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="请输入密码"
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
            登录
          </a-button>
        </a-form-item>

        <a-form-item>
          <div class="login-footer">
            <span>还没有账号?</span>
            <a @click="goToRegister">立即注册</a>
          </div>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    loading.value = true
    const result = await userStore.login({
      username: formState.username,
      password: formState.password
    })

    if (result.success) {
      message.success('登录成功!')
      // 跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)
    } else {
      message.error(result.message || '登录失败')
    }
  } catch (error) {
    message.error('登录失败,请稍后重试')
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
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
