import axios from 'axios'
// 封装 HTTP 请求

// 引入loading加载
import { ElLoading } from 'element-plus'

import router from '@/router'

// 引入Message消息提示封装后的文件
import Message from '../utils/Message'

// form表单的内容类型
// 用于定义网络文件的类型和网页的编码
const contentTypeForm = 'application/x-www-form-urlencoded;charset=UTF-8'
const contentTypeJson = 'application/json'

const responseTypeJson = "json"

let loading = null;
const instance = axios.create({
    baseURL: '/api',
    // 超时时间
    timeout: 30 * 1000,
});
//请求前拦截器
instance.interceptors.request.use(
    (config) => {
        // 查看发送请求的接口有没有showLoading加载组件
        if (config.showLoading) {
            loading = ElLoading.service({
                // 先设置lock 为true，动态添加数据的时候，
                // 请求没有成功之前会会出现一个正在加载标示，请求成功，显示数据，lock值变为false，锁定加载
                lock: true,
                // 显示在加载图标下方的加载文案
                text: '加载中......',
                // 遮罩背景色
                background: 'rgba(0, 0, 0, 0.7)',
            });
        }
        return config;
    },
    (error) => {
        if (config.showLoading && loading) {
            loading.close();
        }
        Message.error("请求发送失败");
        return Promise.reject("请求发送失败");
    }
);
//请求后拦截器
instance.interceptors.response.use(
    (response) => {
        const { showLoading, errorCallback, showError = true, responseType } = response.config;
        // 之前出现了请求且请求已经发送完毕，将loading遮罩关闭
        if (showLoading && loading) {
            loading.close()
        }
        const responseData = response.data;
        // ArrayBuffer 对象代表储存二进制数据的一段内存
        // Blob 对象表示一个二进制文件的数据内容，通常用来读写文件，比如一个图片文件的内容就可以通过 Blob 对象读写。
        if (responseType == "arraybuffer" || responseType == "blob") {
            return responseData;
        }
        //正常请求
        if (responseData.code == 200) {
            return responseData;
        } else if (responseData.code == 901) {
            //登录超时 自动跳转到原来的页面
            router.push("/login?redirectUrl=" + encodeURI(router.currentRoute.value.path));
            return Promise.reject({ showError: false, msg: "登录超时" });
        } else {
            //其他错误
            if (errorCallback) {
                errorCallback(responseData.info);
            }
            return Promise.reject({ showError: showError, msg: responseData.info });
        }
    },
    (error) => {
        if (error.config.showLoading && loading) {
            loading.close();
        }
        return Promise.reject({ showError: true, msg: "网络异常" })
    }
);

const request = (config) => {
    const { url, params, dataType, showLoading = true, responseType = responseTypeJson } = config;
    let contentType = contentTypeForm;
    let formData = new FormData(); // 创建form对象
    for (let key in params) {
        formData.append(key, params[key] == undefined ? "" : params[key]);
    }
    if (dataType != null && dataType == 'json') {
        contentType = contentTypeJson;
    }
    let headers = {
        'Content-Type': contentType,
        'X-Requested-With': 'XMLHttpRequest',
    }

    return instance.post(url, formData, {
        // 进度更新
        onUploadProgress: (event) => {
            if (config.uploadProgressCallback) {
                config.uploadProgressCallback(event);
            }
        },
        responseType: responseType,
        headers: headers,
        showLoading: showLoading,
        errorCallback: config.errorCallback,
        showError: config.showError
    }).catch(error => {
        console.log(error);
        if (error.showError) {
            Message.error(error.msg);
        }
        return null;
    });
};

export default request;