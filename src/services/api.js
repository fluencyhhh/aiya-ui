/**
 * 封装的AJAX请求函数
 * @param {string} url - 请求路径（相对于apiBaseUrl）
 * @param {object} options - 请求选项
 * @returns {Promise} - 返回Promise对象
 */
async function request(url, options = {}) {
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }

  try {
    // 从环境变量获取API基础URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/ai';
    
    // 构建完整URL
    const fullUrl = `${apiBaseUrl}${url}`
    
    // 发送请求
    const response = await fetch(fullUrl, mergedOptions)
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // 解析JSON响应
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

/**
 * 发送POST请求
 * @param {string} url - 请求路径
 * @param {object} data - 请求数据
 * @returns {Promise}
 */
export function post(url, data) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * 发送GET请求
 * @param {string} url - 请求路径
 * @returns {Promise}
 */
export function get(url) {
  return request(url)
}

// 特定API方法
export const aiApi = {
  /**
   * 向AI发送问题并获取回答
   * @param {string} question - 用户问题
   * @returns {Promise} - AI回答
   */
  async askQuestion(question) {
    return post('/aitest/answerQuestion', { question })
  }
}

export default {
  request,
  get,
  post,
  aiApi
}
