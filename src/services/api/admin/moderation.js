import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/**
 * 审核相关API服务
 */
export default {
  /**
   * 获取待审核评价列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @param {string} params.sortBy - 排序字段
   * @param {string} params.sortDirection - 排序方向(asc/desc)
   */
  async getPendingReviews(params = {}) {
    const {
      page = 0,
      size = 20,
      sortBy = 'createdAt',
      sortDirection = 'desc'
    } = params

    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/admin/pending`, {
        params: { page, size, sortBy, sortDirection }
      })
      return response.data
    } catch (error) {
      console.error('获取待审核评价失败:', error)
      throw error
    }
  },

  /**
   * 获取审核统计
   */
  async getModerationStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/admin/stats`)
      return response.data
    } catch (error) {
      console.error('获取审核统计失败:', error)
      throw error
    }
  },

  /**
   * 审核单个评价
   * @param {number} reviewId - 评价ID
   * @param {Object} data - 审核数据
   * @param {string} data.action - 审核动作(APPROVED/REJECTED)
   * @param {string} data.reason - 审核原因(驳回时必填)
   */
  async moderateReview(reviewId, data) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews/admin/${reviewId}/moderate`,
        data
      )
      return response.data
    } catch (error) {
      console.error('审核评价失败:', error)
      throw error
    }
  },

  /**
   * 批量审核评价
   * @param {Object} data - 批量审核数据
   * @param {Array<number>} data.reviewIds - 评价ID列表
   * @param {string} data.action - 审核动作(APPROVED/REJECTED)
   * @param {string} data.reason - 审核原因(可选)
   */
  async batchModerateReviews(data) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews/admin/moderate/batch`,
        data
      )
      return response.data
    } catch (error) {
      console.error('批量审核失败:', error)
      throw error
    }
  },

  /**
   * 获取审核日志
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   */
  async getModerationLogs(params = {}) {
    const { page = 0, size = 20 } = params

    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/admin/logs`, {
        params: { page, size }
      })
      return response.data
    } catch (error) {
      console.error('获取审核日志失败:', error)
      throw error
    }
  },

  /**
   * 获取指定评价的审核日志
   * @param {number} reviewId - 评价ID
   */
  async getReviewModerationLogs(reviewId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/reviews/admin/${reviewId}/logs`
      )
      return response.data
    } catch (error) {
      console.error('获取评价审核日志失败:', error)
      throw error
    }
  }
}
