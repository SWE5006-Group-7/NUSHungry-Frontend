import request from '@/utils/request';

const API_BASE = '/api/admin/users';

export default {
  /**
   * 获取用户列表
   */
  getUsers(params) {
    return request({
      url: API_BASE,
      method: 'get',
      params
    });
  },

  /**
   * 获取用户详情
   */
  getUserDetail(id) {
    return request({
      url: `${API_BASE}/${id}`,
      method: 'get'
    });
  },

  /**
   * 更新用户信息
   */
  updateUser(id, data) {
    return request({
      url: `${API_BASE}/${id}`,
      method: 'put',
      data
    });
  },

  /**
   * 删除用户
   */
  deleteUser(id) {
    return request({
      url: `${API_BASE}/${id}`,
      method: 'delete'
    });
  },

  /**
   * 启用/禁用用户
   */
  toggleUserStatus(id, enabled) {
    return request({
      url: `${API_BASE}/${id}/toggle-status`,
      method: 'post',
      data: { enabled }
    });
  },

  /**
   * 重置用户密码
   */
  resetPassword(id) {
    return request({
      url: `${API_BASE}/${id}/reset-password`,
      method: 'post'
    });
  },

  /**
   * 修改管理员自己的密码
   */
  changePassword(data) {
    return request({
      url: `${API_BASE}/change-password`,
      method: 'post',
      data
    });
  },

  /**
   * 批量操作
   */
  batchOperation(data) {
    return request({
      url: `${API_BASE}/batch`,
      method: 'post',
      data
    });
  },

  /**
   * 获取最新注册用户
   */
  getLatestUsers(limit = 10) {
    return request({
      url: `${API_BASE}/latest`,
      method: 'get',
      params: { limit }
    });
  }
};