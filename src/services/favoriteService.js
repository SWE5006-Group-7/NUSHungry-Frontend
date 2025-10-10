import apiClient from '@/utils/request'

export const favoriteService = {
  // 添加收藏
  async addFavorite(userId, stallId) {
    const response = await apiClient.post('/favorites', { userId, stallId })
    return response.data
  },

  // 取消收藏
  async removeFavorite(userId, stallId) {
    await apiClient.delete('/favorites', {
      params: { userId, stallId }
    })
  },

  // 获取用户收藏列表
  async getUserFavorites(userId) {
    const response = await apiClient.get(`/favorites/user/${userId}`)
    return response.data
  },

  // 检查是否已收藏
  async checkFavorite(userId, stallId) {
    const response = await apiClient.get('/favorites/check', {
      params: { userId, stallId }
    })
    return response.data.isFavorite
  },

  // 获取用户收藏列表（包含完整Favorite信息）
  async getUserFavoritesFull(userId) {
    const response = await apiClient.get(`/favorites/user/${userId}/full`)
    return response.data
  },

  // 批量删除收藏
  async batchDeleteFavorites(userId, favoriteIds) {
    await apiClient.delete('/favorites/batch', {
      data: { userId, favoriteIds }
    })
  },

  // 批量更新收藏排序
  async reorderFavorites(userId, favoriteIds) {
    await apiClient.put('/favorites/reorder', {
      userId,
      favoriteIds
    })
  }
}