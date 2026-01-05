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

  // 拆出查询参数与流式回调
  const { params, onMessage, ...restOptions } = options

  const mergedOptions = {
    ...defaultOptions,
    ...restOptions,
    headers: {
      ...defaultOptions.headers,
      ...restOptions.headers
    }
  }

  try {
    // 从环境变量获取API基础URL
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/ai';

    // 构建完整URL，附加查询参数
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const fullUrl = `${apiBaseUrl}${url}${queryString}`

    // 发送请求
    const response = await fetch(fullUrl, mergedOptions)

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 若有流式回调，按流式读取
    if (onMessage && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        result += chunk
        onMessage(chunk)
      }
      return result
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
 * @param {object} params - 查询参数
 * @param {object} options - 额外选项（如 onMessage）
 * @returns {Promise}
 */
export function get(url, params, options = {}) {
  return request(url, { params, ...options })
}

// 特定API方法
export const aiApi = {
  /**
   * 向AI发送问题并获取回答
   * @param {string} question - 用户问题
   * @param {function} onMessage - 流式回调
   * @returns {Promise} - AI回答
   */
  async askQuestion(question, onMessage) {
    return get('/aitest/answerQuestion', { question }, { onMessage })
  }
}

export default {
  request,
  get,
  post,
  aiApi
}
