import request from '@/utils/request';

const adminStallApi = {
  // 获取摊位列表
  getStallList(params) {
    return request({
      url: '/admin/stalls',
      method: 'get',
      params
    });
  },

  // 获取摊位详情
  getStallDetail(id) {
    return request({
      url: `/admin/stalls/${id}`,
      method: 'get'
    });
  },

  // 创建摊位
  createStall(data) {
    return request({
      url: '/admin/stalls',
      method: 'post',
      data
    });
  },

  // 更新摊位信息
  updateStall(id, data) {
    return request({
      url: `/admin/stalls/${id}`,
      method: 'put',
      data
    });
  },

  // 删除摊位
  deleteStall(id) {
    return request({
      url: `/admin/stalls/${id}`,
      method: 'delete'
    });
  },

  // 批量删除摊位
  batchDeleteStalls(ids) {
    return request({
      url: '/admin/stalls/batch',
      method: 'delete',
      data: { ids }
    });
  }
};

export default adminStallApi;
