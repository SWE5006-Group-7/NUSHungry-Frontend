import request from '@/utils/request';
import debugStallUpdate from '@/utils/stallDebugger';

const adminStallApi = {
  // 获取摊位列表 (管理员)
  getStallList(params) {
    return request({
      url: '/stalls/admin',
      method: 'get',
      params
    });
  },

  // 获取摊位详情
  getStallDetail(id) {
    return request({
      url: `/stalls/${id}`,
      method: 'get'
    });
  },

  // 创建摊位
  createStall(data) {
    return request({
      url: '/stalls',
      method: 'post',
      data
    });
  },

  // 更新摊位信息
  updateStall(id, data) {
    // 调试：API请求
    debugStallUpdate('API_REQUEST', {
      method: 'PUT',
      url: `/stalls/${id}`,
      requestData: data
    });

    return request({
      url: `/stalls/${id}`,
      method: 'put',
      data
    }).then(response => {
      // 调试：API响应
      debugStallUpdate('API_RESPONSE', {
        status: response.status,
        responseData: response.data
      });
      return response;
    }).catch(error => {
      // 调试：API错误
      debugStallUpdate('API_ERROR', {
        status: error.response?.status,
        error: error.message,
        fullError: error
      });
      throw error;
    });
  },

  // 删除摊位
  deleteStall(id) {
    return request({
      url: `/stalls/${id}`,
      method: 'delete'
    });
  },

  // 批量删除摊位
  batchDeleteStalls(ids) {
    return request({
      url: '/stalls/batch',
      method: 'delete',
      data: { ids }
    });
  }
};

export default adminStallApi;
