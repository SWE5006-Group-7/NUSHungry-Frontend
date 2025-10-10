import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/reviews';

/**
 * 评价点赞服务
 */
export const reviewLikeService = {
  /**
   * 点赞评价
   */
  async likeReview(reviewId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/${reviewId}/likes`);
      return response.data;
    } catch (error) {
      console.error('点赞失败:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * 取消点赞
   */
  async unlikeReview(reviewId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${reviewId}/likes`);
      return response.data;
    } catch (error) {
      console.error('取消点赞失败:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * 检查当前用户是否已点赞
   */
  async checkLikeStatus(reviewId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${reviewId}/likes/status`);
      return response.data;
    } catch (error) {
      console.error('检查点赞状态失败:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * 获取当前用户点赞的所有评价ID列表
   */
  async getUserLikedReviews() {
    try {
      const response = await axios.get(`${API_BASE_URL}/0/likes/user/liked-reviews`);
      return response.data;
    } catch (error) {
      console.error('获取用户点赞列表失败:', error);
      throw error.response?.data || error;
    }
  }
};

export default reviewLikeService;
