import apiClient from '@/utils/request'

/**
 * 文件上传服务
 * 调用后端的通用文件上传接口
 */
export const uploadService = {
  /**
   * 上传单张图片
   * @param {File} file - 图片文件
   * @param {boolean} generateThumbnail - 是否生成缩略图，默认true
   * @param {boolean} compress - 是否压缩图片，默认true
   * @param {Function} onProgress - 上传进度回调
   * @returns {Promise} 返回上传结果 {success, message, url, thumbnailUrl}
   */
  async uploadImage(file, generateThumbnail = true, compress = true, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('generateThumbnail', generateThumbnail)
    formData.append('compress', compress)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }

    // 如果提供了进度回调，添加到配置中
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }

    const response = await apiClient.post('/upload/image', formData, config)
    return response.data
  },

  /**
   * 批量上传图片
   * @param {File[]} files - 图片文件数组
   * @param {boolean} generateThumbnail - 是否生成缩略图，默认true
   * @param {boolean} compress - 是否压缩图片，默认true
   * @param {Function} onProgress - 上传进度回调
   * @returns {Promise} 返回批量上传结果
   */
  async uploadImages(files, generateThumbnail = true, compress = true, onProgress = null) {
    const formData = new FormData()

    // 添加所有文件
    files.forEach(file => {
      formData.append('files', file)
    })

    formData.append('generateThumbnail', generateThumbnail)
    formData.append('compress', compress)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }

    // 添加进度回调
    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }

    const response = await apiClient.post('/upload/images', formData, config)
    return response.data
  },

  /**
   * 删除图片
   * @param {string} imageUrl - 图片URL
   * @returns {Promise} 返回删除结果
   */
  async deleteImage(imageUrl) {
    const response = await apiClient.delete('/upload/image', {
      params: { url: imageUrl }
    })
    return response.data
  },

  /**
   * 批量删除图片
   * @param {string[]} imageUrls - 图片URL数组
   * @returns {Promise} 返回批量删除结果
   */
  async deleteImages(imageUrls) {
    const response = await apiClient.delete('/upload/images', {
      data: imageUrls
    })
    return response.data
  },

  /**
   * 获取图片信息
   * @param {File} file - 图片文件
   * @returns {Promise} 返回图片信息 {width, height, contentType, size}
   */
  async getImageInfo(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/upload/image/info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * 验证图片文件
   * @param {File} file - 图片文件
   * @param {number} maxSize - 最大文件大小（MB），默认10MB
   * @returns {Object} {valid: boolean, error: string}
   */
  validateImage(file, maxSize = 10) {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `不支持的文件类型：${file.type}。只允许上传 JPEG、PNG、GIF、WebP 格式的图片。`
      }
    }

    // 验证文件大小
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      return {
        valid: false,
        error: `文件大小超过限制：${fileSizeMB.toFixed(2)} MB，最大允许 ${maxSize} MB。`
      }
    }

    return { valid: true, error: null }
  },

  /**
   * 批量验证图片文件
   * @param {File[]} files - 图片文件数组
   * @param {number} maxSize - 最大文件大小（MB）
   * @returns {Object} {valid: boolean, errors: string[]}
   */
  validateImages(files, maxSize = 10) {
    const errors = []

    files.forEach((file, index) => {
      const result = this.validateImage(file, maxSize)
      if (!result.valid) {
        errors.push(`文件 ${index + 1} (${file.name}): ${result.error}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
