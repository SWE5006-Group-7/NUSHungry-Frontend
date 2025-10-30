import request from '@/utils/request'

const API_BASE = '/admin/reviews'

export default {
  /**
   * 获取待审核评价列表
   */
  getPendingReviews(params) {
    return request({
      url: `${API_BASE}/pending`,
      method: 'get',
      params
    })
  },

  /**
   * 获取审核统计
   */
  getModerationStats() {
    return request({
      url: `${API_BASE}/stats`,
      method: 'get'
    })
  },

  /**
   * 审核单个评价
   */
  moderateReview(reviewId, data) {
    return request({
      url: `${API_BASE}/${reviewId}/moderate`,
      method: 'post',
      data
    })
  },

  /**
   * 批量审核评价
   */
  batchModerateReviews(data) {
    return request({
      url: `${API_BASE}/moderate/batch`,
      method: 'post',
      data
    })
  },

  /**
   * 获取审核日志
   */
  getModerationLogs(params) {
    return request({
      url: `${API_BASE}/logs`,
      method: 'get',
      params
    })
  },

  /**
   * 获取指定评价的审核日志
   */
  getReviewModerationLogs(reviewId) {
    return request({
      url: `${API_BASE}/${reviewId}/logs`,
      method: 'get'
    })
  }
}
