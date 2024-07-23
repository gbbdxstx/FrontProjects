import axios from "axios";

const instance = axios.create({
    baseURL: 'http://localhost:8101/api',
    timeout: 10000,
    headers: {}
});

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    // 从localStorage中取出JWT令牌: token
    const token = localStorage.getItem('token');
    if (token) {
        // 将token设置到请求头中
        config.headers['token'] = token;
    }
    return config;
  });

// 添加响应拦截器 自动将返回的数据的data取出
instance.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    const data = response.data;
    if (data.code === 0) {
        // return data.data;
        return data;
    }
    console.error('response error', data);
    return response.data;
  }, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    return Promise.reject(error);
  });


export default instance;