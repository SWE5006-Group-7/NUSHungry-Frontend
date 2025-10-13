import apiClient from '@/utils/request'

/**
 * 管理员图片管理服务
 */
export default {
  /**
   * 获取图片列表(分页)
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码(从0开始)
   * @param {number} params.size - 每页数量
   * @param {string} params.type - 图片类型(PHOTO/MENU)
   * @param {string} params.uploadedBy - 上传者
   * @param {string} params.keyword - 搜索关键词
   * @returns {Promise}
   */
  async getImages(params = {}) {
    const response = await apiClient.get('/admin/images', { params })
    return response.data
  },

  /**
   * 获取图片统计信息
   * @returns {Promise}
   */
  async getImageStats() {
    const response = await apiClient.get('/admin/images/stats')
    return response.data
  },

  /**
   * 获取图片详情
   * @param {number} id - 图片ID
   * @returns {Promise}
   */
  async getImageDetail(id) {
    const response = await apiClient.get(`/admin/images/${id}`)
    return response.data
  },

  /**
   * 删除单张图片
   * @param {number} id - 图片ID
   * @returns {Promise}
   */
  async deleteImage(id) {
    const response = await apiClient.delete(`/admin/images/${id}`)
    return response.data
  },

  /**
   * 批量删除图片
   * @param {Array<number>} imageIds - 图片ID数组
   * @returns {Promise}
   */
  async batchDeleteImages(imageIds) {
    const response = await apiClient.delete('/admin/images/batch', {
      data: imageIds
    })
    return response.data
  }
}
