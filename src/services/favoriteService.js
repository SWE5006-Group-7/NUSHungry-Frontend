import axios from 'axios'

const API_URL = 'http://localhost:8080/api/favorites'

export const favoriteService = {
  // 添加收藏
  async addFavorite(userId, stallId) {
    const response = await axios.post(API_URL, { userId, stallId })
    return response.data
  },

  // 取消收藏
  async removeFavorite(userId, stallId) {
    await axios.delete(API_URL, {
      params: { userId, stallId }
    })
  },

  // 获取用户收藏列表
  async getUserFavorites(userId) {
    const response = await axios.get(`${API_URL}/user/${userId}`)
    return response.data
  },

  // 检查是否已收藏
  async checkFavorite(userId, stallId) {
    const response = await axios.get(`${API_URL}/check`, {
      params: { userId, stallId }
    })
    return response.data.isFavorite
  }
}