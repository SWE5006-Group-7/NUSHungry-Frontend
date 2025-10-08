import apiClient from '@/utils/request'

export const imageService = {
  // 上传 Cafeteria 图片
  async uploadCafeteriaImage(cafeteriaId, file, userId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    const response = await apiClient.post(`/images/cafeteria/${cafeteriaId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 上传 Stall 图片
  async uploadStallImage(stallId, file, userId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    const response = await apiClient.post(`/images/stall/${stallId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 获取 Cafeteria 图片列表
  async getCafeteriaImages(cafeteriaId) {
    const response = await apiClient.get(`/images/cafeteria/${cafeteriaId}`)
    return response.data
  },

  // 获取 Stall 图片列表
  async getStallImages(stallId) {
    const response = await apiClient.get(`/images/stall/${stallId}`)
    return response.data
  }
}