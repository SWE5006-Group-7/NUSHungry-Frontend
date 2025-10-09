<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑用户' : '添加用户'"
    width="500px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEditMode"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          type="email"
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
        />
      </el-form-item>

      <el-form-item v-if="!isEditMode" label="密码" prop="password">
        <el-input
          v-model="formData.password"
          placeholder="请输入密码"
          type="password"
          show-password
        />
      </el-form-item>

      <el-form-item v-if="!isEditMode" label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          placeholder="请再次输入密码"
          type="password"
          show-password
        />
      </el-form-item>

      <el-form-item label="用户角色" prop="role">
        <el-select
          v-model="formData.role"
          placeholder="请选择角色"
          style="width: 100%"
        >
          <el-option label="普通用户" value="ROLE_USER" />
          <el-option label="管理员" value="ROLE_ADMIN" />
        </el-select>
      </el-form-item>

      <el-form-item label="账户状态" prop="enabled">
        <el-switch
          v-model="formData.enabled"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEditMode ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import adminUserApi from '@/api/admin/user';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:visible', 'success']);

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
});

// 是否编辑模式
const isEditMode = computed(() => !!props.user?.id);

// 表单引用
const formRef = ref();
const loading = ref(false);

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'ROLE_USER',
  enabled: true,
  remark: ''
});

// 验证规则
const validatePassword = (rule, value, callback) => {
  if (!isEditMode.value && !value) {
    callback(new Error('请输入密码'));
  } else if (!isEditMode.value && value.length < 6) {
    callback(new Error('密码长度至少6位'));
  } else {
    callback();
  }
};

const validateConfirmPassword = (rule, value, callback) => {
  if (!isEditMode.value && !value) {
    callback(new Error('请确认密码'));
  } else if (!isEditMode.value && value !== formData.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
};

// 监听用户变化，初始化表单
watch(() => props.user, (newUser) => {
  if (newUser && newUser.id) {
    // 编辑模式，填充数据
    formData.username = newUser.username || '';
    formData.email = newUser.email || '';
    formData.phone = newUser.phone || '';
    formData.role = newUser.role || 'ROLE_USER';
    formData.enabled = newUser.enabled !== false;
    formData.remark = newUser.remark || '';
    formData.password = '';
    formData.confirmPassword = '';
  } else {
    // 新增模式，重置表单
    resetForm();
  }
}, { immediate: true });

// 重置表单
const resetForm = () => {
  formData.username = '';
  formData.email = '';
  formData.phone = '';
  formData.password = '';
  formData.confirmPassword = '';
  formData.role = 'ROLE_USER';
  formData.enabled = true;
  formData.remark = '';
  formRef.value?.clearValidate();
};

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const submitData = {
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      enabled: formData.enabled,
      remark: formData.remark
    };

    if (isEditMode.value) {
      // 编辑用户
      await adminUserApi.updateUser(props.user.id, submitData);
      ElMessage.success('用户更新成功');
    } else {
      // 创建用户
      submitData.password = formData.password;
      await adminUserApi.createUser(submitData);
      ElMessage.success('用户创建成功');
    }

    emit('success');
    handleClose();
  } catch (error) {
    console.error('Failed to save user:', error);
    ElMessage.error(isEditMode.value ? '更新用户失败' : '创建用户失败');
  } finally {
    loading.value = false;
  }
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
  setTimeout(() => {
    resetForm();
  }, 300);
};
</script>

<style scoped lang="scss">
:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  width: 100%;
}
</style>