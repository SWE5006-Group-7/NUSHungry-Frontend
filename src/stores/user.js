import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const username = computed(() => user.value?.username || '')
  const userId = computed(() => user.value?.id || null)

  // Actions
  function initializeAuth() {
    // 从localStorage恢复用户状态
    const savedToken = authService.getToken()
    const savedUser = authService.getCurrentUser()

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = savedUser
    }
  }

  async function login(credentials) {
    try {
      isLoading.value = true
      const response = await authService.login(credentials)

      console.log('Login response:', response)

      token.value = response.token
      user.value = response.user

      console.log('User store updated:', {
        token: token.value,
        user: user.value,
        isAuthenticated: isAuthenticated.value
      })

      return { success: true, user: response.user }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error.message || '登录失败,请检查用户名和密码'
      }
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData) {
    try {
      isLoading.value = true
      const response = await authService.register(userData)

      // 注册成功后自动登录
      if (response.token) {
        token.value = response.token
        user.value = response.user
      }

      return { success: true, user: response.user }
    } catch (error) {
      console.error('Register error:', error)
      return {
        success: false,
        message: error.message || '注册失败,请稍后重试'
      }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    authService.logout()
    token.value = null
    user.value = null
  }

  async function updateProfile(userData) {
    try {
      isLoading.value = true
      const updatedUser = await authService.updateUserProfile(userData)
      user.value = updatedUser
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        message: error.message || '更新失败,请稍后重试'
      }
    } finally {
      isLoading.value = false
    }
  }

  async function changePassword(passwordData) {
    try {
      isLoading.value = true
      await authService.updatePassword(passwordData)
      return { success: true, message: '密码修改成功' }
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: error.message || '密码修改失败'
      }
    } finally {
      isLoading.value = false
    }
  }

  // 初始化时恢复登录状态
  initializeAuth()

  return {
    // State
    user,
    token,
    isLoading,

    // Getters
    isAuthenticated,
    username,
    userId,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    initializeAuth
  }
})
