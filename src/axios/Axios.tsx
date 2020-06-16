import {AxiosRequestConfig, AxiosResponse} from './types'
import AxiosInterceptorManager, {Interceptor} from './AxiosInterceptorManager'
import qs from 'qs'
import parseHeaders from 'parse-headers'
let defaults: AxiosRequestConfig = {
  method: 'get',
  timeout: 0,
  headers: {
    common: {
      accept: 'application/json' // 告诉服务器返回json
    }
  },
  transformRequest: (data: any, headers: any) => {
    headers['common']['content-type'] = 'application/json'
    return data
  },
  transformResponse: (response: any) => {
    return response.data
  }
}
let getStyleMethods = ['get', 'head', 'delete', 'options']
getStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {}
})
let postStyleMethods = ['put', 'post', 'patch']
postStyleMethods.forEach((method: string) => {
  defaults.headers![method] = {
    'content-type': 'application/json'
  }
})
let allMethods = [...getStyleMethods, ...postStyleMethods]

export default class Axios {
  public defaults: AxiosRequestConfig = defaults
  public interceptors = {
    request: new AxiosInterceptorManager<AxiosRequestConfig>(),
    response: new AxiosInterceptorManager<AxiosResponse>()
  }
  request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>{
    let headers = Object.assign(config.headers, this.defaults.headers)
    config = Object.assign(config, this.defaults)
    config.headers = headers
    if(config.transformRequest && config.data){
      config.data = config.transformRequest(config.data, config.headers)
    }
    const chain: Array<Interceptor<AxiosRequestConfig> | Interceptor<AxiosResponse<T>>> = [
      {
        onFulfilled: this.dispatchRequest, 
        onRejected: error => error
      }
    ]
    this.interceptors.request.interceptors.forEach((interceptor: Interceptor<AxiosRequestConfig> | null) => {
      interceptor && chain.unshift(interceptor)
    })
    this.interceptors.response.interceptors.forEach((interceptor: Interceptor<AxiosResponse<T>> | null) => {
      interceptor && chain.push(interceptor)
    })
    let promise: Promise<any> = Promise.resolve(config)
    while(chain.length){
      const {onFulfilled, onRejected} = chain.shift()!
      promise = promise.then(onFulfilled!, onRejected)
    }
    return promise
  }
  // 定义一个派发请求方法
  dispatchRequest<T>(config: AxiosRequestConfig): Promise< AxiosResponse<T>>{
    return new Promise<AxiosResponse<T>>(function (resolve, reject) {
      let {method, url, params, headers, data, timeout} = config
      let request = new XMLHttpRequest()
      if(params) {
        params = qs.stringify(params)
        url += ((url!.includes('?') ? '&' : '?') + params)
      }
      request.open(method!, url!, true)
      request.responseType = 'json'
      request.onreadystatechange = function () {
        if(request.readyState === 4 && request.status !== 0){
          if(request.status >= 200 && request.status < 300) {
            let response: AxiosResponse<T> = {
              data: request.response ? request.response : request.responseText,
              status: request.status,
              statusText: request.statusText,
              headers: parseHeaders(request.getAllResponseHeaders()),
              config,
              request
            }
            if(config.transformResponse){
              response = config.transformResponse(response)
              console.log(response)
            }
            resolve(response)
          }else {
            reject(`Error: Request failed with status code ${request.status}`)
          }
        }
      }
      if(headers){
        for(let key in headers){
          if(key === 'common' || key === config.method){
            for(let key2 in headers[key]){
              request.setRequestHeader(key2, headers[key][key2])
            }
          }else if(!allMethods.includes(key)) {
            request.setRequestHeader(key, headers[key])
          }
        }
      }
      let body: string | null = null
      if(data){
        body = JSON.stringify(data)
      }
      request.onerror = function(){
        reject('net::ERR_INTERNET_DISCONNECTED')
      }
      if(timeout){
        request.timeout = timeout
        request.ontimeout = function () {
          reject(`Error: timeout of ${timeout}ms exceeded`)
        }
      }
      if(config.cancelToken){
        config.cancelToken.then((message: any) => {
          request.abort()
          reject(message)
        })
      }
      request.send(body)
    })
  }
}
