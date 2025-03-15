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

export default apiClient;
