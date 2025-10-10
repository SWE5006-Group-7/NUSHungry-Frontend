import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/reviews';

/**
 * 评价举报服务
 */
export const reviewReportService = {
  /**
   * 创建举报
   * @param {number} reviewId - 评价ID
   * @param {object} reportData - 举报数据
   * @param {string} reportData.reason - 举报原因（SPAM, INAPPROPRIATE, OFFENSIVE, FALSE_INFO, ADVERTISING, PRIVACY, OTHER）
   * @param {string} reportData.description - 详细描述（可选）
   */
  async createReport(reviewId, reportData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/${reviewId}/reports`, reportData);
      return response.data;
    } catch (error) {
      console.error('提交举报失败:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * 检查当前用户是否已举报某评价
   */
  async checkReportStatus(reviewId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${reviewId}/reports/status`);
      return response.data;
    } catch (error) {
      console.error('检查举报状态失败:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * 获取某评价的举报统计
   */
  async getReportCount(reviewId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/${reviewId}/reports/count`);
      return response.data;
    } catch (error) {
      console.error('获取举报统计失败:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * 举报原因枚举
   */
  REPORT_REASONS: {
    SPAM: { value: 'SPAM', label: '垃圾信息' },
    INAPPROPRIATE: { value: 'INAPPROPRIATE', label: '不当内容' },
    OFFENSIVE: { value: 'OFFENSIVE', label: '侮辱谩骂' },
    FALSE_INFO: { value: 'FALSE_INFO', label: '虚假信息' },
    ADVERTISING: { value: 'ADVERTISING', label: '广告推广' },
    PRIVACY: { value: 'PRIVACY', label: '侵犯隐私' },
    OTHER: { value: 'OTHER', label: '其他' }
  },

  /**
   * 获取举报原因列表
   */
  getReportReasonsList() {
    return Object.values(this.REPORT_REASONS);
  }
};

export default reviewReportService;
