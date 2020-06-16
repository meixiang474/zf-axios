import Axios from './Axios'
import {AxiosInstance} from './types'
import {CancelToken, isCancel} from './cancel'
// 可以创建一个axios实例 axios其实就是一个函数
function createInstance() {
  let context: Axios = new Axios() //上下文
  // 让request里的this永远指向context
  let instance = Axios.prototype.request.bind(context)
  // 把Axios的类的原型和实例的方法都拷贝到request方法上
  instance = Object.assign(instance, Axios.prototype, context)
  return (instance as AxiosInstance)
}

let axios = createInstance()
axios.CancelToken = new CancelToken()
axios.isCancel = isCancel
export default axios
export * from './types'