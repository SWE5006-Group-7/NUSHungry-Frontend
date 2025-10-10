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
  },

  /**
   * 获取热门评价（综合算法：点赞数 + 评分 + 时间新鲜度）
   * @param {number} stallId - 摊位ID
   * @param {Object} options - 查询选项
   * @returns {Promise} - 返回热门评价列表
   */
  async getHotReviews(stallId, options = {}) {
    try {
      const { page = 0, size = 10 } = options;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/stall/${stallId}/hot`,
        {
          params: { page, size },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('获取热门评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取高分评价（4星及以上）
   */
  async getHighRatedReviews(stallId, options = {}) {
    try {
      const { page = 0, size = 10 } = options;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/stall/${stallId}/high-rated`,
        {
          params: { page, size },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('获取高分评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取低分评价（2星及以下）
   */
  async getLowRatedReviews(stallId, options = {}) {
    try {
      const { page = 0, size = 10 } = options;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/stall/${stallId}/low-rated`,
        {
          params: { page, size },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('获取低分评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取有图评价
   */
  async getReviewsWithImages(stallId, options = {}) {
    try {
      const { page = 0, size = 10 } = options;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/stall/${stallId}/with-images`,
        {
          params: { page, size },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('获取有图评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 按点赞数排序获取评价
   */
  async getReviewsByLikes(stallId, options = {}) {
    try {
      const { page = 0, size = 10 } = options;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/stall/${stallId}/by-likes`,
        {
          params: { page, size },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('按点赞数获取评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 按评分排序获取评价
   */
  async getReviewsByRating(stallId, options = {}) {
    try {
      const { page = 0, size = 10 } = options;
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${API_BASE_URL}/reviews/stall/${stallId}/by-rating`,
        {
          params: { page, size },
          headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('按评分获取评价失败:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * 获取评价筛选选项
   */
  FILTER_OPTIONS: {
    LATEST: { value: 'latest', label: '最新', endpoint: (stallId) => `/reviews/stall/${stallId}` },
    HOT: { value: 'hot', label: '热门', endpoint: (stallId) => `/reviews/stall/${stallId}/hot` },
    HIGH_RATED: { value: 'high-rated', label: '好评', endpoint: (stallId) => `/reviews/stall/${stallId}/high-rated` },
    LOW_RATED: { value: 'low-rated', label: '差评', endpoint: (stallId) => `/reviews/stall/${stallId}/low-rated` },
    WITH_IMAGES: { value: 'with-images', label: '有图', endpoint: (stallId) => `/reviews/stall/${stallId}/with-images` },
    BY_LIKES: { value: 'by-likes', label: '点赞最多', endpoint: (stallId) => `/reviews/stall/${stallId}/by-likes` },
    BY_RATING: { value: 'by-rating', label: '评分最高', endpoint: (stallId) => `/reviews/stall/${stallId}/by-rating` }
  },

  /**
   * 根据筛选类型获取评价
   */
  async getReviewsByFilter(stallId, filter, options = {}) {
    switch (filter) {
      case 'hot':
        return this.getHotReviews(stallId, options);
      case 'high-rated':
        return this.getHighRatedReviews(stallId, options);
      case 'low-rated':
        return this.getLowRatedReviews(stallId, options);
      case 'with-images':
        return this.getReviewsWithImages(stallId, options);
      case 'by-likes':
        return this.getReviewsByLikes(stallId, options);
      case 'by-rating':
        return this.getReviewsByRating(stallId, options);
      case 'latest':
      default:
        return this.getReviewsByStallId(stallId, options);
    }
  }
};

export default reviewService;
