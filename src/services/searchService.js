import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/search';

/**
 * 搜索服务
 * 提供搜索、筛选、建议等功能
 */
export const searchService = {
  /**
   * 综合搜索(摊位+食堂)
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @param {string} params.searchType - 搜索类型: STALL, CAFETERIA, ALL
   * @param {Array<string>} params.cuisineTypes - 菜系类型筛选
   * @param {boolean} params.halalOnly - 是否只显示Halal
   * @param {number} params.minRating - 最低评分
   * @param {number} params.maxRating - 最高评分
   * @param {number} params.cafeteriaId - 食堂ID
   * @param {string} params.sortBy - 排序方式
   * @param {string} params.sortDirection - 排序方向
   * @param {number} params.page - 页码
   * @param {number} params.size - 每页数量
   */
  search(params) {
    return axios.get(API_BASE_URL, { params })
      .then(response => response.data)
      .catch(error => {
        console.error('搜索失败:', error);
        throw error;
      });
  },

  /**
   * 搜索摊位
   * @param {Object} searchRequest - 搜索请求对象
   */
  searchStalls(searchRequest) {
    return axios.post(`${API_BASE_URL}/stalls`, searchRequest)
      .then(response => response.data)
      .catch(error => {
        console.error('摊位搜索失败:', error);
        throw error;
      });
  },

  /**
   * 搜索食堂
   * @param {Object} searchRequest - 搜索请求对象
   */
  searchCafeterias(searchRequest) {
    return axios.post(`${API_BASE_URL}/cafeterias`, searchRequest)
      .then(response => response.data)
      .catch(error => {
        console.error('食堂搜索失败:', error);
        throw error;
      });
  },

  /**
   * 获取搜索建议
   * @param {string} prefix - 搜索前缀
   */
  getSearchSuggestions(prefix) {
    return axios.get(`${API_BASE_URL}/suggestions`, {
      params: { q: prefix }
    })
      .then(response => response.data)
      .catch(error => {
        console.error('获取搜索建议失败:', error);
        return {
          suggestions: [],
          popularKeywords: [],
          recentSearches: []
        };
      });
  },

  /**
   * 获取筛选选项
   * 包括菜系类型、食堂列表、评分范围等
   */
  getFilterOptions() {
    return axios.get(`${API_BASE_URL}/filter-options`)
      .then(response => response.data)
      .catch(error => {
        console.error('获取筛选选项失败:', error);
        return {
          cuisineTypes: [],
          cafeterias: [],
          ratingRange: { min: 0, max: 5 }
        };
      });
  },

  /**
   * 获取推荐摊位
   * @param {number} limit - 数量限制
   */
  getRecommendedStalls(limit = 10) {
    return axios.get(`${API_BASE_URL}/recommended`, {
      params: { limit }
    })
      .then(response => response.data)
      .catch(error => {
        console.error('获取推荐摊位失败:', error);
        return [];
      });
  },

  /**
   * 获取热门搜索关键词
   * @param {number} limit - 数量限制
   */
  getPopularKeywords(limit = 10) {
    return axios.get(`${API_BASE_URL}/popular-keywords`, {
      params: { limit }
    })
      .then(response => response.data)
      .catch(error => {
        console.error('获取热门关键词失败:', error);
        return [];
      });
  },

  /**
   * 构建搜索请求对象
   * @param {Object} filters - 筛选条件
   */
  buildSearchRequest(filters) {
    return {
      keyword: filters.keyword || '',
      searchType: filters.searchType || 'ALL',
      cuisineTypes: filters.cuisineTypes || null,
      halalOnly: filters.halalOnly || null,
      minRating: filters.minRating || null,
      maxRating: filters.maxRating || null,
      cafeteriaId: filters.cafeteriaId || null,
      sortBy: filters.sortBy || 'RELEVANCE',
      sortDirection: filters.sortDirection || 'DESC',
      page: filters.page || 0,
      size: filters.size || 20
    };
  },

  /**
   * 验证搜索参数
   * @param {Object} params - 搜索参数
   */
  validateSearchParams(params) {
    const errors = [];

    if (params.minRating !== null && params.minRating !== undefined) {
      if (params.minRating < 0 || params.minRating > 5) {
        errors.push('最低评分必须在0-5之间');
      }
    }

    if (params.maxRating !== null && params.maxRating !== undefined) {
      if (params.maxRating < 0 || params.maxRating > 5) {
        errors.push('最高评分必须在0-5之间');
      }
    }

    if (params.minRating && params.maxRating && params.minRating > params.maxRating) {
      errors.push('最低评分不能大于最高评分');
    }

    if (params.page !== null && params.page !== undefined && params.page < 0) {
      errors.push('页码必须大于等于0');
    }

    if (params.size !== null && params.size !== undefined) {
      if (params.size < 1 || params.size > 100) {
        errors.push('每页数量必须在1-100之间');
      }
    }

    return errors;
  }
};

export default searchService;
