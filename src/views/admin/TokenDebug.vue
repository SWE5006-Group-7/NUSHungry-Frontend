<template>
  <div style="padding: 20px">
    <h2>Token Debug Information</h2>
    <div v-if="tokenInfo">
      <h3>Token存在: {{ hasToken ? '是' : '否' }}</h3>
      <h3>解析后的Token内容:</h3>
      <pre>{{ JSON.stringify(tokenInfo, null, 2) }}</pre>

      <h3>用户信息 (localStorage):</h3>
      <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>

      <h3>角色判断结果:</h3>
      <ul>
        <li>当前角色: {{ currentRole }}</li>
        <li>是否为管理员 (isAdmin): {{ isAdminResult }}</li>
        <li>角色比较: {{ currentRole }} === 'ROLE_ADMIN' = {{ currentRole === 'ROLE_ADMIN' }}</li>
      </ul>
    </div>
    <div v-else>
      <p>没有找到Token</p>
    </div>

    <button @click="testLogin" style="margin-top: 20px">测试登录</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { parseToken, getCurrentUserRole, isAdmin } from '@/utils/role';

const hasToken = ref(false);
const tokenInfo = ref(null);
const userInfo = ref(null);
const currentRole = ref(null);
const isAdminResult = ref(false);

const checkToken = () => {
  const token = localStorage.getItem('token');
  hasToken.value = !!token;

  if (token) {
    tokenInfo.value = parseToken(token);
    currentRole.value = getCurrentUserRole();
    isAdminResult.value = isAdmin();
  }

  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr);
    } catch (e) {
      userInfo.value = { error: 'Failed to parse userInfo' };
    }
  }
};

const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      })
    });

    const data = await response.json();
    console.log('Login response:', data);

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      console.log('Token saved, decoded:', parseToken(data.token));

      // 重新检查
      checkToken();
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};

onMounted(() => {
  checkToken();
});
</script>