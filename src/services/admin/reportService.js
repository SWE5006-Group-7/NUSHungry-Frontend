import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加 token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token 过期或无效,清除本地存储并重定向到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default {
  /**
   * 获取待处理的举报列表
   */
  async getPendingReports() {
    try {
      const response = await apiClient.get('/admin/reports/pending')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  /**
   * 获取所有举报列表(分页)
   * @param {object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @param {string} params.status - 状态过滤 (PENDING, PROCESSED, REJECTED)
   * @param {string} params.reason - 原因过滤
   */
  async getAllReports(params = {}) {
    try {
      const response = await apiClient.get('/admin/reports', { params })
      // 后端返回格式: { success: true, data: [...], totalItems: xxx, ... }
      if (response.data.success) {
        return {
          content: response.data.data,
          totalElements: response.data.totalItems,
          number: response.data.currentPage,
          size: response.data.pageSize,
          totalPages: response.data.totalPages
        }
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  /**
   * 处理举报
   * @param {number} reportId - 举报ID
   * @param {object} handleData - 处理数据
   * @param {string} handleData.status - 状态 (PROCESSED, REJECTED)
   * @param {string} handleData.adminNote - 处理备注
   */
  async handleReport(reportId, handleData) {
    try {
      const response = await apiClient.post(`/admin/reports/${reportId}/handle`, {
        status: handleData.status,
        handleNote: handleData.adminNote
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  /**
   * 获取举报统计信息
   */
  async getReportStats() {
    try {
      const response = await apiClient.get('/admin/reports/stats')
      // 后端返回格式: { success: true, data: { totalCount, pendingCount, ... } }
      if (response.data.success) {
        return response.data.data
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  /**
   * 批量处理举报
   * @param {number[]} reportIds - 举报ID列表
   * @param {object} handleData - 处理数据
   */
  async batchHandleReports(reportIds, handleData) {
    try {
      const response = await apiClient.post('/admin/reports/batch-handle', {
        reportIds,
        ...handleData
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}
