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

/* FIXME: Implement proper automatic refresh later */
apiClient.interceptors.response.use(
  // Return success responses
  async res => res,

  async error => {
    const originalReq = error.config;

    if (
      error.response?.status !== 401 ||
      originalReq._retry ||
      originalReq.url === '/session/refresh' ||
      originalReq.url === '/session/me'
    ) {
      return Promise.reject(error);
    }

    try {
      originalReq._retry = true;

      await apiClient.post('/session/refresh');

      return await axios(originalReq);
    } catch (refreshErr) {
      return Promise.reject(error);
    }
  },
);
export default apiClient;
