import axios, {AxiosResponse, AxiosRequestConfig} from './axios'
const baseURL = 'http://localhost:8080'
// 它指的是服务器返回的对象
interface User {
  name: string;
  password: string 
}
let user: User = {
  name: 'zhufeng',
  password: '123456'
}
const CancelToken = axios.CancelToken
const source = CancelToken.source()
console.time('cost')
axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
  config.headers!.name += '1'
  console.timeEnd('cost')
  return config
})
let request = axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
  config.headers!.name += '2'
  return config
})
axios.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
  config.headers!.name += '3'
  return new Promise(function (resolve) {
    setTimeout(() => {
      config.headers!.name += '3'
      resolve(config)
    }, 3000)
  })
})
axios.interceptors.request.eject(request)
axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.name += '1'
  return response
})
let response = axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.name += '2'
  return response
})
axios.interceptors.response.use((response: AxiosResponse) => {
  response.data.name += '3'
  return response
})
axios.interceptors.response.eject(response)
axios({
  method: 'post',
  url: baseURL + '/post',
  headers: {
    'content-type': 'application/json',
    'name': 'zhufeng'
  },
  cancelToken: source.token,
  data: user
}).then((response: AxiosResponse<User>) => {
  console.log(response)
  return response.data
}).then((data: User) => {
 console.log(data)
 return data 
}).catch((error: any) => {
  console.log(error)
})
source.cancel('用户取消了请求')

