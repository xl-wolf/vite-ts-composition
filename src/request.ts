import axios, { RawAxiosRequestConfig } from "axios"

export const request = (config: RawAxiosRequestConfig<any>) => {
  //1.创建axios实例
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:6066/',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset:UTF-8"
    },
    timeout: 5000
  })

  //2.axios拦截器的使用
  //请求拦截器
  /*需要拦截请求的原因
  *   1.config中包含了某些不符合服务器要求的信息
  *   2.发送网络请求的时候需要向用户展示一些加载中的图标
  *   3.网站需要登录才能请求资源，也就是需要token才能请求资源*/
  instance.interceptors.request.use(config => {
    console.log(config)
    return config//拦截器里一定要记得将拦截的结果处理后返回，否则无法进行数据获取
  }, err => {
    console.log(err)
  })
  //响应拦截器
  instance.interceptors.response.use(res => {
    console.log(res)
    return res.data
  }, err => {
    console.log(err)
  })

  //3.发送网络请求
  //axios实例本身返回的就是Promise对象，直接调用即可
  return instance(config)
}