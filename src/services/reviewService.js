import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/reviews`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
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
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/reviews/${reviewId}`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
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
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE_URL}/reviews/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
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
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/${reviewId}`,
        { headers }
      );
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
   * @returns {Promise} - 返回评价列表
   */
  async getReviewsByStallId(stallId, options = {}) {
    try {
      const { page = 0, size = 0 } = options;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/stall/${stallId}`,
        {
          params: { page, size },
          headers
        }
      );
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
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/user/${userId}`,
        {
          params: { page, size },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('获取用户评价失败:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default reviewService;
