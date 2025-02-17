import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getUrlParam } from './getUrlParams';


// 创建 axios 实例
const request = axios.create({
    // API 请求的默认前缀
    baseURL: 'https://ultra.lcago.cn',
    // baseURL: 'http://carbontest.dcps.info',
    // baseURL: 'http://58.56.184.222:19964',
    timeout: 6000, // 请求超时时间
});

export type RequestError = AxiosError<{
  message?: string
  result?: any
  errorMessage?: string
}>

// 异常拦截处理器
const errorHandler = (error: RequestError): Promise<any> => {
  return Promise.reject(error)
}

// 请求拦截器
const requestHandler = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> => {
  config.headers.channel = getUrlParam('channel') ?? 'qtx'
  config.headers.token = getUrlParam('token') ?? '8766A1D6634E66F6DEBAE5A5E35EEA75';

  return config
}

// Add a request interceptor
request.interceptors.request.use(requestHandler, errorHandler)

// 响应拦截器
const responseHandler = (response: { data: any }) => {
  return response.data
}

// Add a response interceptor
request.interceptors.response.use(responseHandler, errorHandler)

export default request
