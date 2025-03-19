import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
      console.error('Failed to refresh session:', refreshErr);

      return Promise.reject(error);
    }
  },
);
export default apiClient;
