import axios from 'axios';

// import { keysToCamelCase, keysToSnakeCase } from './caseTransformer';

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: string) => void;
}

let isRefreshing = false;
let failedReqsQueue: Array<QueueItem> = [];

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// apiClient.interceptors.request.use(config => {
//   if (config.data) {
//     config.data = keysToSnakeCase(config.data);
//   }
//   return config;
// });

// apiClient.interceptors.response.use(response => {
//   if (response.data) {
//     response.data = keysToCamelCase(response.data);
//   }
//   return response;
// });

const processQueue = (error: any = null) => {
  failedReqsQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedReqsQueue = [];
};

apiClient.interceptors.response.use(
  // Automatically return successful responses
  res => res,

  async error => {
    const originalRequest = error.config;

    // Reject if the error is not 401 or we already tried to refresh
    if (error.response?.status !== 401 || originalRequest._retry)
      Promise.reject(error);

    originalRequest._retry = true;

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedReqsQueue.push({ resolve, reject });
      })
        .then(() => {
          return apiClient(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    isRefreshing = true;

    try {
      // Try to refresh the token
      await apiClient.post('/session/refresh');

      // Process any queued requests
      processQueue();

      // Retry the original request
      return apiClient(originalRequest);
    } catch (refreshErr) {
      // If refresh fails, process queue with error and handle logout
      processQueue(refreshErr);

      // NOTE: Implement when app is ready
      const event = new CustomEvent('sessionExpired', {
        detail: { message: 'Session expired.' },
      });
      window.dispatchEvent(event);

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);
export default apiClient;
