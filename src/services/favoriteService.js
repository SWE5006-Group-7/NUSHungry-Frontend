import apiClient from '@/utils/request'

export const favoriteService = {
  // 添加收藏
  async addFavorite(userId, stallId) {
    const response = await apiClient.post('/favorites', { userId, stallId })
    return response.data
  },

  // 取消收藏 (通过userId和stallId)
  async removeFavorite(userId, stallId) {
    await apiClient.delete('/favorites', {
      params: { userId, stallId }
    })
  },

  // 通过favoriteId删除收藏
  async removeFavoriteById(userId, favoriteId) {
    await apiClient.delete(`/favorites/${favoriteId}`, {
      params: { userId }
    })
  },

  // 批量删除收藏
  async batchDeleteFavorites(userId, favoriteIds) {
    await apiClient.delete('/favorites/batch', {
      params: { userId },
      data: { favoriteIds }
    })
  },

  // 更新收藏排序
  async updateFavoriteOrders(userId, orders) {
    await apiClient.put('/favorites/order',
      { orders },
      { params: { userId } }
    )
  },

  // 获取用户收藏列表 (简单版本)
  async getUserFavorites(userId) {
    const response = await apiClient.get(`/favorites/user/${userId}`)
    return response.data
  },

  // 获取用户收藏列表 (详细版本, 带排序和完整信息)
  async getUserFavoritesDetailed(userId) {
    const response = await apiClient.get(`/favorites/user/${userId}/detailed`)
    return response.data
  },

  // 检查是否已收藏
  async checkFavorite(userId, stallId) {
    try {
      const response = await apiClient.get('/favorites/check', {
        params: { userId, stallId }
      })
      return response.data.isFavorite
    } catch (error) {
      // 如果是403或401错误，返回false（未登录或未授权）
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        return false
      }
      throw error
    }
  }
}