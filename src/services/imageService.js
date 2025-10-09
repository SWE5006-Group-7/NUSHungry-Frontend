import apiClient from '@/utils/request'

export const imageService = {
  // 上传 Cafeteria 图片（旧接口，保留兼容）
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

  // 上传 Stall 图片（旧接口，保留兼容）
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

  // 关联图片到摊位（新接口）
  async linkImagesToStall(stallId, imageUrls, thumbnailUrls = [], type = 'PHOTO') {
    const response = await apiClient.post(`/stalls/${stallId}/images`, {
      imageUrls,
      thumbnailUrls,
      type
    })
    return response.data
  },

  // 关联菜单图片到摊位
  async linkMenuImagesToStall(stallId, imageUrls, thumbnailUrls = []) {
    return this.linkImagesToStall(stallId, imageUrls, thumbnailUrls, 'MENU')
  },

  // 关联图片到食堂（新接口）
  async linkImagesToCafeteria(cafeteriaId, imageUrls, thumbnailUrls = []) {
    const response = await apiClient.post(`/cafeterias/${cafeteriaId}/images`, {
      imageUrls,
      thumbnailUrls
    })
    return response.data
  },

  // 删除摊位图片
  async deleteStallImage(stallId, imageId) {
    const response = await apiClient.delete(`/stalls/${stallId}/images/${imageId}`)
    return response.data
  },

  // 删除食堂图片
  async deleteCafeteriaImage(cafeteriaId, imageId) {
    const response = await apiClient.delete(`/cafeterias/${cafeteriaId}/images/${imageId}`)
    return response.data
  },

  // 获取 Cafeteria 图片列表
  async getCafeteriaImages(cafeteriaId) {
    const response = await apiClient.get(`/cafeterias/${cafeteriaId}/images`)
    return response.data
  },

  // 获取 Stall 图片列表
  async getStallImages(stallId, type = null) {
    const url = type
      ? `/stalls/${stallId}/images?type=${type}`
      : `/stalls/${stallId}/images`
    const response = await apiClient.get(url)
    return response.data
  },

  // 获取摊位的照片（PHOTO类型）
  async getStallPhotos(stallId) {
    return this.getStallImages(stallId, 'PHOTO')
  },

  // 获取摊位的菜单图片（MENU类型）
  async getStallMenuImages(stallId) {
    return this.getStallImages(stallId, 'MENU')
  }
}