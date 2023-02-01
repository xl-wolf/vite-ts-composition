import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
// @ts-ignore
import { showLoading, hideLoading } from "@/assets/js/MagicLoading.js"
const loadingContainer = document.body

const service: AxiosInstance = axios.create({
    baseURL: 'http://localhost:6067', // url = base url + request url
    timeout: 20000, // request timeout
})

service.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        showLoading(loadingContainer, ['#409eff', '#409eff', '#409eff', '#409eff'])
        return config
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        hideLoading(loadingContainer)
        if (response.status === 200) {
            return response;
        } else {
            Promise.reject();
        }
    },
    (error: AxiosError) => {
        hideLoading(loadingContainer)
        console.log(error);
        return Promise.reject();
    }
);

export default service;
