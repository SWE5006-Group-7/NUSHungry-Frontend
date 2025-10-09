import request from '@/utils/request';

const adminUserApi = {
  // 获取用户列表
  getUserList(params) {
    return request({
      url: '/admin/users',
      method: 'get',
      params
    });
  },

  // 获取用户详情
  getUserDetail(id) {
    return request({
      url: `/admin/users/${id}`,
      method: 'get'
    });
  },

  // 创建用户
  createUser(data) {
    return request({
      url: '/admin/users',
      method: 'post',
      data
    });
  },

  // 更新用户信息
  updateUser(id, data) {
    return request({
      url: `/admin/users/${id}`,
      method: 'put',
      data
    });
  },

  // 更新用户状态
  updateUserStatus(id, data) {
    return request({
      url: `/admin/users/${id}/status`,
      method: 'patch',
      data
    });
  },

  // 重置密码
  resetPassword(id, data) {
    return request({
      url: `/admin/users/${id}/reset-password`,
      method: 'post',
      data
    });
  },

  // 删除用户
  deleteUser(id) {
    return request({
      url: `/admin/users/${id}`,
      method: 'delete'
    });
  },

  // 批量操作
  batchOperation(data) {
    return request({
      url: '/admin/users/batch',
      method: 'post',
      data
    });
  },

  // 导出用户列表
  exportUsers(params) {
    return request({
      url: '/admin/users/export',
      method: 'get',
      params,
      responseType: 'blob'
    });
  },

  // 获取用户活动日志
  getUserActivities(id, params) {
    return request({
      url: `/admin/users/${id}/activities`,
      method: 'get',
      params
    });
  }
};

export default adminUserApi;