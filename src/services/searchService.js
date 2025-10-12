import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 搜索服务
 */
const searchService = {
  /**
   * 搜索摊位
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 关键词
   * @param {Array<string>} params.cuisineTypes - 菜系类型
   * @param {number} params.minRating - 最低评分
   * @param {boolean} params.halalOnly - 只显示Halal
   * @param {number} params.cafeteriaId - 食堂ID
   * @param {number} params.userLatitude - 用户纬度
   * @param {number} params.userLongitude - 用户经度
   * @param {number} params.maxDistance - 最大距离
   * @param {string} params.sortBy - 排序字段
   * @param {string} params.sortDirection - 排序方向
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页大小
   * @returns {Promise<Object>} 搜索结果
   */
  async searchStalls(params) {
    try {
      const token = localStorage.getItem('token');
      const config = { params };

      // 如果用户已登录，添加Authorization header
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const response = await axios.get(`${API_BASE_URL}/stalls/search`, config);
      return response.data;
    } catch (error) {
      console.error('搜索摊位失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户搜索历史（分页）
   * @param {number} page - 页码
   * @param {number} size - 每页大小
   * @returns {Promise<Object>} 搜索历史
   */
  async getUserSearchHistory(page = 0, size = 20) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/search-history`, {
        params: { page, size },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('获取搜索历史失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户最近的搜索历史
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 搜索历史列表
   */
  async getRecentSearches(limit = 10) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/search-history/recent`, {
        params: { limit },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('获取最近搜索失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户最近的搜索关键词（去重）
   * @param {number} limit - 限制数量
   * @returns {Promise<Array<string>>} 关键词列表
   */
  async getRecentKeywords(limit = 10) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return [];
      }
      const response = await axios.get(`${API_BASE_URL}/search-history/keywords`, {
        params: { limit },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('获取最近关键词失败:', error);
      return [];
    }
  },

  /**
   * 获取热门搜索关键词
   * @param {number} days - 统计天数
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 热门关键词列表
   */
  async getPopularKeywords(days = 7, limit = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/search-history/popular`, {
        params: { days, limit }
      });
      return response.data;
    } catch (error) {
      console.error('获取热门关键词失败:', error);
      return [];
    }
  },

  /**
   * 删除单条搜索历史
   * @param {number} id - 搜索历史ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteSearchHistory(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/search-history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('删除搜索历史失败:', error);
      throw error;
    }
  },

  /**
   * 清空所有搜索历史
   * @returns {Promise<Object>} 删除结果
   */
  async clearSearchHistory() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/search-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('清空搜索历史失败:', error);
      throw error;
    }
  }
};

export default searchService;
