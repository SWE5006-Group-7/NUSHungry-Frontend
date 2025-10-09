import request from '@/utils/request';

/**
 * 管理员认证API
 */
const adminAuthApi = {
  /**
   * 管理员登录
   * @param {Object} data - 登录数据
   * @param {string} data.username - 用户名
   * @param {string} data.password - 密码
   * @returns {Promise} 登录响应
   */
  login(data) {
    return request({
      url: '/admin/auth/login',
      method: 'post',
      data
    });
  },

  /**
   * 刷新管理员Token
   * @returns {Promise} 新的token信息
   */
  refreshToken() {
    return request({
      url: '/admin/auth/refresh',
      method: 'post'
    });
  },

  /**
   * 验证管理员Token
   * @returns {Promise} token验证结果
   */
  verifyToken() {
    return request({
      url: '/admin/auth/verify',
      method: 'get'
    });
  },

  /**
   * 管理员登出
   * 清除本地存储的token和用户信息
   */
  logout() {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');

    // 可以在这里调用后端登出API（如果有的话）

    // 重定向到登录页
    window.location.href = '/admin/login';
  }
};

export default adminAuthApi;