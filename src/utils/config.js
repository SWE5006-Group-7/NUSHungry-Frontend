// 获取后端基础URL
export const getBackendBaseUrl = () => {
  // 在开发环境下，使用相对路径，让Vite的代理处理
  // 在生产环境下，使用环境变量或默认值
  if (import.meta.env.DEV) {
    return ''  // 开发环境使用相对路径，由Vite代理处理
  }
  return import.meta.env.VITE_BACKEND_URL || ''
}

// 获取完整的资源URL
export const getResourceUrl = (path) => {
  if (!path) return ''

  // 如果已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // 否则拼接后端基础URL
  const baseUrl = getBackendBaseUrl()
  return `${baseUrl}${path}`
}

// 获取API基础URL
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || '/api'
}