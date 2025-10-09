import request from '@/utils/request';

const adminDashboardApi = {
  // 获取仪表板统计数据
  getDashboardStats() {
    return request({
      url: '/admin/dashboard/stats',
      method: 'get'
    });
  },

  // 获取用户统计
  getUserStats() {
    return request({
      url: '/admin/dashboard/stats/users',
      method: 'get'
    });
  },

  // 获取系统概览
  getSystemOverview() {
    return request({
      url: '/admin/dashboard/stats/system',
      method: 'get'
    });
  }
};

export default adminDashboardApi;
