<template>
  <div class="admin-login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo">
        <h2>NUSHungry 管理后台</h2>
        <p>管理员登录</p>
      </div>

      <a-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        layout="vertical"
        @finish="handleLogin"
      >
        <a-form-item name="username" label="管理员账号">
          <a-input
            v-model:value="loginForm.username"
            placeholder="请输入管理员账号"
            size="large"
            allow-clear
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="loginForm.password"
            placeholder="请输入密码"
            size="large"
            @pressEnter="handleLogin"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-checkbox v-model:checked="loginForm.remember">记住我</a-checkbox>
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登 录
          </a-button>
        </a-form-item>
      </a-form>

      <div class="login-footer">
        <router-link to="/login" class="back-link">
          <ArrowLeftOutlined />
          返回用户登录
        </router-link>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';
import adminAuthApi from '@/api/admin/auth';
import { isAdmin } from '@/utils/role';

const router = useRouter();
const loginFormRef = ref();
const loading = ref(false);

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
};

// 处理登录
const handleLogin = async (values) => {
  loading.value = true;

  try {
    // 调用管理员登录API
    const response = await adminAuthApi.login({
      username: loginForm.username,
      password: loginForm.password
    });

    // 保存token和用户信息
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userInfo', JSON.stringify(response.data.user));

    // 如果勾选了记住我，保存用户名
    if (loginForm.remember) {
      localStorage.setItem('adminUsername', loginForm.username);
    } else {
      localStorage.removeItem('adminUsername');
    }

    message.success('登录成功');

    // 获取重定向地址或默认跳转到管理后台首页
    const redirect = router.currentRoute.value.query.redirect || '/admin/dashboard';

    // 使用 replace 替换当前页面历史记录，避免返回到登录页
    await router.replace(redirect);

  } catch (error) {
    console.error('Login error:', error);

    if (error.response?.status === 403) {
      message.error('您没有管理员权限');
    } else if (error.response?.status === 401) {
      message.error('用户名或密码错误');
    } else {
      message.error(error.response?.data?.error || '登录失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

// 组件挂载时检查
onMounted(() => {
  // 如果已经是管理员登录状态，直接跳转到后台
  const token = localStorage.getItem('token');
  if (token && isAdmin()) {
    const redirect = router.currentRoute.value.query.redirect || '/admin/dashboard';
    router.replace(redirect);
    return;
  }

  // 自动填充记住的用户名
  const savedUsername = localStorage.getItem('adminUsername');
  if (savedUsername) {
    loginForm.username = savedUsername;
    loginForm.remember = true;
  }
});
</script>

<style scoped lang="scss">
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  .login-box {
    background: white;
    border-radius: 20px;
    padding: 40px;
    width: 420px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    z-index: 1;

    .login-header {
      text-align: center;
      margin-bottom: 40px;

      .logo {
        width: 60px;
        height: 60px;
        margin-bottom: 20px;
      }

      h2 {
        font-size: 28px;
        color: #303133;
        margin-bottom: 10px;
        font-weight: 600;
      }

      p {
        color: #909399;
        font-size: 14px;
      }
    }

    .login-form {
      :deep(.ant-form-item) {
        margin-bottom: 24px;
      }

      :deep(.ant-form-item-label) {
        font-weight: 500;
      }

      :deep(.ant-input-affix-wrapper) {
        border-radius: 6px;

        &:hover {
          border-color: #667eea;
        }

        &.ant-input-affix-wrapper-focused {
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
      }

      :deep(.ant-checkbox-wrapper) {
        color: #606266;
        font-size: 14px;
      }

      :deep(.ant-btn-primary) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        height: 40px;
        font-size: 16px;
        font-weight: 500;
        letter-spacing: 1px;

        &:hover {
          background: linear-gradient(135deg, #7289ef 0%, #8458a8 100%);
        }
      }
    }

    .login-footer {
      margin-top: 20px;
      text-align: center;

      .back-link {
        color: #909399;
        font-size: 14px;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: color 0.3s;

        &:hover {
          color: #667eea;
        }
      }
    }
  }

  // 背景装饰
  .decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 0;

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite ease-in-out;

      &.circle-1 {
        width: 300px;
        height: 300px;
        top: -150px;
        right: -150px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 200px;
        height: 200px;
        bottom: -100px;
        left: -100px;
        animation-delay: 5s;
      }

      &.circle-3 {
        width: 150px;
        height: 150px;
        top: 50%;
        left: -75px;
        animation-delay: 10s;
      }
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    25% {
      transform: translateY(-20px) rotate(90deg);
    }
    50% {
      transform: translateY(10px) rotate(180deg);
    }
    75% {
      transform: translateY(-10px) rotate(270deg);
    }
  }
}

// 响应式设计
@media screen and (max-width: 480px) {
  .admin-login-container {
    padding: 20px;

    .login-box {
      width: 100%;
      padding: 30px 20px;

      .login-header {
        h2 {
          font-size: 24px;
        }
      }
    }
  }
}
</style>