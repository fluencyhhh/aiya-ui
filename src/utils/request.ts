import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { errorCode } from '@/utils/errorCode';
import { blobValidate, tansParams } from '@/utils/ruoyi';
import cache from '@/plugins/cache';
import { HttpStatus } from '@/enums/RespEnum';
import { ElMessage } from 'element-plus/es';
import { LoadingInstance } from 'element-plus/es/components/loading/src/loading';

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 600000
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {

    if (config.url === 'integrate/system/export/excel') {
      config.timeout = 600000; // 缩短超时时间
    }

// 是否需要防止数据重复提交
    const isRepeatSubmit = config.headers?.repeatSubmit === false;
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime()
      };
      const sessionObj = cache.session.getJSON('sessionObj');
      if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
        cache.session.setJSON('sessionObj', requestObj);
      } else {
        const s_url = sessionObj.url; // 请求地址
        const s_data = sessionObj.data; // 请求数据
        const s_time = sessionObj.time; // 请求时间
        const interval = 500; // 间隔时间(ms)，小于此时间视为重复提交
        if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
          const message = '数据正在处理，请勿重复提交';
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.setJSON('sessionObj', requestObj);
        }
      }
    }

    // FormData数据去请求头Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || HttpStatus.SUCCESS;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    if (res.request.responseType === 'arraybuffer') {
      return res;
    }

    //对导出数据的返回做特殊处理
    if (res.request.responseType === 'blob') {
      if (res.data.type === 'application/json') {
        const blob = res.data;
        const reader = new FileReader();
        reader.onload = () => {
          const contentJson = JSON.parse(typeof reader.result === 'string' ? reader.result : '');
          console.log('JSON:', contentJson);
          ElMessage.error(contentJson.msg);
        };
        reader.readAsText(blob);
        return Promise.reject(new Error('Invalid response'));
      } else {
        return res;
      }
    }

    console.log('router.currentRoute.value.fullPath===', router.currentRoute.value.fullPath);

    if (code === HttpStatus.SERVER_ERROR) {
      ElMessage({ message: msg, type: 'error' });
      return Promise.reject(new Error(msg));
    } else if (code === HttpStatus.WARN) {
      ElMessage({ message: msg, type: 'warning' });
      return Promise.reject(new Error(msg));
    } else if (code !== HttpStatus.SUCCESS) {
      ElNotification.error({ title: msg });
      return Promise.reject('error');
    } else {
      return Promise.resolve(res.data);
    }
  },
  async (error: any) => {

    // 原有的错误处理逻辑
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常' + error;
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时' + error;
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常' + error;
    }
    // ElMessage({ message: message, type: 'error', duration: 5 * 1000 });
    ElMessage({ message: '请求异常' + error, type: 'error', duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

// 🔥 新增：统一的自动重新登录处理函数
async function handleAutoReLogin(loginParams: any): Promise<void> {
  try {
    // 动态导入登录函数，避免循环依赖
    const { handleLogin } = await import('@/views/iframeApi');

    // 清除过期token
    removeToken();
    console.log('已清除过期token');

    // 执行自动登录
    await handleLogin(loginParams);
    console.log('iframe自动重新登录成功');

    // 🔥 关键：不再刷新页面，让新token在后续请求中生效
  } catch (error) {
    console.error('自动重新登录过程失败:', error);
    throw error;
  }
}

// 通用下载方法
export function download(url: string, params: any, fileName: string) {
  downloadLoadingInstance = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
  return service
    .post(url, params, {
      transformRequest: [
        (params: any) => {
          return tansParams(params);
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob'
    })
    .then(async (resp: any) => {
      const isLogin = blobValidate(resp);
      if (isLogin) {
        const blob = new Blob([resp]);
        FileSaver.saveAs(blob, fileName);
      } else {
        const blob = new Blob([resp]);
        const resText = await blob.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
        ElMessage.error(errMsg);
      }
      downloadLoadingInstance.close();
    })
    .catch((r: any) => {
      console.error(r);
      ElMessage.error('下载文件出现错误，请联系管理员！');
      downloadLoadingInstance.close();
    });
}

// 导出 axios 实例
export default service;
