<template>
  <div class="change-password-container">
    <a-card title="修改密码" :bordered="false" class="password-card">
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item name="currentPassword" label="当前密码">
          <a-input-password
            v-model:value="formState.currentPassword"
            placeholder="请输入当前密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="newPassword" label="新密码">
          <a-input-password
            v-model:value="formState.newPassword"
            placeholder="请输入新密码（6-50个字符）"
            size="large"
          >
            <template #prefix>
              <KeyOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item name="confirmPassword" label="确认新密码">
          <a-input-password
            v-model:value="formState.confirmPassword"
            placeholder="请再次输入新密码"
            size="large"
          >
            <template #prefix>
              <CheckOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button
              type="primary"
              html-type="submit"
              size="large"
              :loading="loading"
            >
              确认修改
            </a-button>
            <a-button
              size="large"
              @click="handleReset"
            >
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <a-alert
        type="info"
        show-icon
        style="margin-top: 20px"
      >
        <template #message>
          <div>密码要求：</div>
          <ul style="margin: 5px 0 0 20px; padding: 0;">
            <li>长度为6-50个字符</li>
            <li>建议包含大小写字母、数字和特殊字符</li>
            <li>不要使用过于简单的密码</li>
          </ul>
        </template>
      </a-alert>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { LockOutlined, KeyOutlined, CheckOutlined } from '@ant-design/icons-vue';
import adminApi from '@/api/admin/users';
import { useRouter } from 'vue-router';

const router = useRouter();
const formRef = ref();
const loading = ref(false);

// 表单数据
const formState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 表单验证规则
const rules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度必须在6-50个字符之间', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value === formState.currentPassword) {
          return Promise.reject('新密码不能与当前密码相同');
        }
        return Promise.resolve();
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== formState.newPassword) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      },
      trigger: 'blur'
    }
  ]
};

// 提交表单
const handleSubmit = async () => {
  loading.value = true;

  try {
    const response = await adminApi.changePassword({
      currentPassword: formState.currentPassword,
      newPassword: formState.newPassword,
      confirmPassword: formState.confirmPassword
    });

    message.success('密码修改成功，请重新登录');

    // 清除登录信息
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');

    // 延迟后跳转到登录页
    setTimeout(() => {
      router.push('/admin/login');
    }, 1500);

  } catch (error) {
    console.error('Change password error:', error);

    if (error.response?.status === 401) {
      message.error(error.response.data.error || '当前密码不正确');
    } else if (error.response?.status === 400) {
      message.error(error.response.data.error || '请求参数错误');
    } else {
      message.error('密码修改失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formRef.value.resetFields();
};
</script>

<style scoped lang="scss">
.change-password-container {
  padding: 24px;

  .password-card {
    max-width: 600px;
    margin: 0 auto;

    :deep(.ant-card-head) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

      .ant-card-head-title {
        color: white;
        font-size: 18px;
        font-weight: 600;
      }
    }

    :deep(.ant-form-item) {
      margin-bottom: 24px;

      .ant-form-item-label {
        font-weight: 500;
        color: #303133;
      }
    }

    :deep(.ant-input-affix-wrapper) {
      &:hover {
        border-color: #667eea;
      }

      &.ant-input-affix-wrapper-focused {
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
      }
    }

    :deep(.ant-btn-primary) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      height: 40px;
      font-size: 15px;
      font-weight: 500;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #7289ef 0%, #8458a8 100%);
      }
    }

    :deep(.ant-alert) {
      background: #f0f5ff;
      border: 1px solid #d6e4ff;

      .ant-alert-message {
        color: #4c6ef5;
        font-weight: 500;
      }

      li {
        color: #606266;
        line-height: 1.8;
      }
    }
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .change-password-container {
    padding: 12px;

    .password-card {
      :deep(.ant-card-body) {
        padding: 16px;
      }
    }
  }
}
</style>