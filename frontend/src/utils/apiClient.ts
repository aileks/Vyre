import axios from 'axios';

import { keysToCamelCase, keysToSnakeCase } from './caseTransformer';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  if (config.data) {
    config.data = keysToSnakeCase(config.data);
  }
  return config;
});

apiClient.interceptors.response.use(response => {
  if (response.data) {
    response.data = keysToCamelCase(response.data);
  }
  return response;
});

// apiClient.interceptors.response.use(
//   res => {
//     if (res.data) {
//       res.data = keysToCamelCase(res.data);
//     }
//     return res;
//   },

//   async error => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         await apiClient.post('/session/refresh');

//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         window.dispatchEvent(new CustomEvent('auth:session-expired'));

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

export default apiClient;
