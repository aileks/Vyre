import axios from 'axios';

// import { keysToCamelCase, keysToSnakeCase } from './caseTransformer';

let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

// Subscriber queue
const addSubscriber = (cb: () => void) => {
  refreshSubscribers.push(cb);
};

// Hook to execute all subscriber callbacks and clear the queue
const onRefreshed = () => {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
};

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

apiClient.interceptors.response.use(
  // Return successful responses
  res => res,

  async error => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
<<<<<<< HEAD
      !originalRequest.url?.includes('/session/refresh') &&
      !originalRequest.url?.includes('/session/current')
=======
      !originalRequest.url?.includes('/session/refresh')
>>>>>>> servers
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          // Attempt to refresh the token
          await apiClient.post('/session/refresh');
          isRefreshing = false;

          onRefreshed();

          // Retry the original request
          return apiClient(originalRequest);
        } catch (err) {
          isRefreshing = false;
          refreshSubscribers = [];

          // Dispatch an event to notify the app of a session expiration
          window.dispatchEvent(
            new CustomEvent('auth:session-expired', {
              detail: {
                message: 'Your session has expired. Please log in again.',
              },
            }),
          );

          return Promise.reject(err);
        }
      } else {
        // If another request is already refreshing the token,
        // wait for it to complete and then retry this request
        return new Promise(resolve => {
          addSubscriber(() => {
            resolve(apiClient(originalRequest));
          });
        });
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
