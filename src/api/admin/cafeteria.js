import request from '@/utils/request';

const adminCafeteriaApi = {
  // 获取食堂列表
  getCafeteriaList(params) {
    return request({
      url: '/admin/cafeterias',
      method: 'get',
      params
    });
  },

  // 获取食堂详情
  getCafeteriaDetail(id) {
    return request({
      url: `/admin/cafeterias/${id}`,
      method: 'get'
    });
  },

  // 创建食堂
  createCafeteria(data) {
    return request({
      url: '/admin/cafeterias',
      method: 'post',
      data
    });
  },

  // 更新食堂信息
  updateCafeteria(id, data) {
    return request({
      url: `/admin/cafeterias/${id}`,
      method: 'put',
      data
    });
  },

  // 删除食堂
  deleteCafeteria(id) {
    return request({
      url: `/admin/cafeterias/${id}`,
      method: 'delete'
    });
  },

  // 更新食堂营业状态
  updateCafeteriaStatus(id, status) {
    return request({
      url: `/admin/cafeterias/${id}/status`,
      method: 'put',
      data: { status }
    });
  }
};

export default adminCafeteriaApi;
