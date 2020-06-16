import { AxiosInterceptorManager } from "axios";

export type Methods = 'get' | 'GET' | 'post' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE' | 'options' | 'OPTIONS'
export interface AxiosRequestConfig {
  url?: string;
  method?: Methods;
  params?: any,
  headers?: Record<string, any>
  data?: Record<string, any>
  timeout?: number;
  transformRequest?: (data: any, headers: any) => any
  transformResponse?: (data: any) => any
  cancelToken?: any
}
// Axios.prototype.request
// Promise的泛型T代表promise变成成功态之后的resolve的值
export interface AxiosInstance {
  <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestConfig>
    response: AxiosInterceptorManager<AxiosResponse>
  }
  isCancel: any;
  CancelToken: any
}

// 泛型T代表响应体的类型
export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string
  headers?: Record<string, any>
  config?: AxiosRequestConfig;
  request?: XMLHttpRequest
}