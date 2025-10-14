import apiClient from '@/utils/request';

/**
 * 评价服务
 * 提供评价相关的API调用
 */
const reviewService = {
  /**
   * 创建评价
   * @param {Object} reviewData - 评价数据
   * @param {number} reviewData.stallId - 摊位ID
   * @param {number} reviewData.rating - 评分 (1-5)
   * @param {string} reviewData.comment - 评价内容
   * @param {string[]} reviewData.imageUrls - 图片URL列表
   * @returns {Promise} - 返回创建的评价
   */
  async createReview(reviewData) {
    try {
      const response = await apiClient.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('创建评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 更新评价
   * @param {number} reviewId - 评价ID
   * @param {Object} reviewData - 评价数据
   * @returns {Promise} - 返回更新后的评价
   */
  async updateReview(reviewId, reviewData) {
    try {
      const response = await apiClient.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('更新评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 删除评价
   * @param {number} reviewId - 评价ID
   * @returns {Promise}
   */
  async deleteReview(reviewId) {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('删除评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取评价详情
   * @param {number} reviewId - 评价ID
   * @returns {Promise} - 返回评价详情
   */
  async getReviewById(reviewId) {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('获取评价详情失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取摊位的评价列表
   * @param {number} stallId - 摊位ID
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码（从0开始）
   * @param {number} options.size - 每页大小（设为0返回所有数据）
   * @param {string} options.sortBy - 排序方式 (createdAt, likesCount)
   * @param {string} options.sortOrder - 排序顺序 (asc, desc)
   * @returns {Promise} - 返回评价列表
   */
  async getReviewsByStallId(stallId, options = {}) {
    try {
      const { page = 0, size = 0, sortBy, sortOrder } = options;
      const response = await apiClient.get(`/reviews/stall/${stallId}`, {
        params: { page, size, sortBy, sortOrder }
      });
      return response.data;
    } catch (error) {
      console.error('获取摊位评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取用户的评价历史
   * @param {number} userId - 用户ID
   * @param {Object} options - 查询选项
   * @param {number} options.page - 页码（从0开始）
   * @param {number} options.size - 每页大小（设为0返回所有数据）
   * @returns {Promise} - 返回评价列表
   */
  async getReviewsByUserId(userId, options = {}) {
    try {
      const { page = 0, size = 0 } = options;
      const response = await apiClient.get(`/reviews/user/${userId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('获取用户评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 点赞/取消点赞评价
   * @param {number} reviewId - 评价ID
   * @returns {Promise} - 返回点赞状态
   */
  async toggleLike(reviewId) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      console.error('点赞操作失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 举报评价
   * @param {number} reviewId - 评价ID
   * @param {Object} reportData - 举报数据
   * @param {string} reportData.reason - 举报原因
   * @param {string} reportData.description - 详细描述
   * @returns {Promise} - 返回举报结果
   */
  async reportReview(reviewId, reportData) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/report`, reportData);
      return response.data;
    } catch (error) {
      console.error('举报提交失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取摊位的评分分布统计
   * @param {number} stallId - 摊位ID
   * @returns {Promise} - 返回评分分布数据
   */
  async getRatingDistribution(stallId) {
    try {
      const response = await apiClient.get(`/reviews/stall/${stallId}/rating-distribution`);
      return response.data;
    } catch (error) {
      console.error('获取评分分布失败:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default reviewService;
