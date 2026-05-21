/**
 * 基于 Fetch API 的 HTTP 请求工具
 * 提供统一的请求拦截、响应拦截、错误处理
 */

import type { ApiResponse } from '../types/knowledge'

// 请求配置类型
interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
}

// 基础 URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 构建 URL（处理查询参数）
const buildUrl = (url: string, params?: Record<string, any>): string => {
  if (!params) return url

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

// 请求超时处理
const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), ms)
  })
}

// 核心 fetch 函数
const fetchRequest = async <T = any>(
  url: string,
  method: string,
  config?: RequestConfig,
  data?: any
): Promise<ApiResponse<T>> => {
  const { headers = {}, params } = config || {}

  // 构建完整 URL
  const fullUrl = BASE_URL + buildUrl(url, params)

  // 构建 fetch options
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  // 添加 body（非 GET 请求）
  if (method !== 'GET' && data !== undefined) {
    options.body = JSON.stringify(data)
  }

  try {
    // 使用 Promise.race 实现超时
    const response = await Promise.race([
      fetch(fullUrl, options),
      timeoutPromise(30000)
    ]) as Response

    // 解析 JSON 响应
    const result = await response.json()

    // 检查 HTTP 状态码
    if (!response.ok) {
      throw new Error(result.message || `HTTP Error: ${response.status}`)
    }

    return result
  } catch (error: any) {
    // 统一错误处理
    if (error.message === '请求超时') {
      console.error('请求超时')
      throw new Error('请求超时，请检查网络连接')
    } else if (error.message.includes('Failed to fetch')) {
      console.error('网络错误')
      throw new Error('网络错误，请检查网络连接')
    } else {
      console.error('请求错误:', error.message)
      throw error
    }
  }
}

/**
 * 封装的请求方法
 */
export const request = {
  get: <T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return fetchRequest<T>(url, 'GET', config)
  },

  post: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return fetchRequest<T>(url, 'POST', config, data)
  },

  put: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return fetchRequest<T>(url, 'PUT', config, data)
  },

  delete: <T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return fetchRequest<T>(url, 'DELETE', config)
  },

  patch: <T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> => {
    return fetchRequest<T>(url, 'PATCH', config, data)
  }
}

export default request
