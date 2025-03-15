import axios, { AxiosRequestConfig } from 'axios';
import { batch, createEffect, createRoot } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import {
  ApiAuthResponse,
  AuthState,
  ErrorResponse,
  LoginCredentials,
  RegistrationData,
  User,
} from '../types';
import apiClient from '../utils/apiClient';

let authInitialized = false;
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;

/*-----------------------------------------------------------------------------
 * State Setup
 *-----------------------------------------------------------------------------*/
const getInitialState = (): AuthState => ({
  status: 'idle',
  user: null,
  error: null,
});

export const [auth, setAuth] = createStore<AuthState>(getInitialState());

// Create derived state signals
export const currentUser = () => auth.user;
export const isAuthenticated = () => Boolean(currentUser());
export const isLoading = () => auth.status === 'loading';
export const currentError = () => auth.error;

/*-----------------------------------------------------------------------------
 * Session Utils
 *-----------------------------------------------------------------------------*/
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshAttempts++;

      // Clear cookies and abort if no refresh token
      if (!document.cookie.includes('_auth_refresh_token')) {
        await logout();
        return Promise.reject(error);
      }

      // Stop infinite loops
      if (refreshAttempts > MAX_REFRESH_ATTEMPTS) {
        await logout();
        return Promise.reject(error);
      }

      try {
        await apiClient.post('/api/session/refresh');
        return apiClient(originalRequest);
      } catch (refreshError) {
        await logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message || error.message;
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

/**
 * Fetches data from the API with proper error handling and response transformation.
 * Uses cookies for authentication and handles common headers.
 *
 * @param url - The API endpoint URL
 * @param options - Fetch options including method, body, headers, etc.
 * @returns Promise resolving to an object with ok status and transformed data
 * @internal This is an internal utility function
 */
const apiFetch = async <T>(
  url: string,
  options: AxiosRequestConfig = {},
): Promise<{
  ok: boolean;
  data: T;
}> => {
  console.log('\n\napiFetch called\n\n');

  try {
    const res = await apiClient({
      url,
      ...options,
    });

    return {
      ok: true,
      data: res.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        data: error.response?.data || { error: { message: error.message } },
      };
    }

    return {
      ok: false,
      data: { error: { message: 'Unknown error occurred' } } as unknown as T,
    };
  }
};

export const initializeAuth = async () => {
  if (authInitialized) return;
  authInitialized = true;

  try {
    setAuth('status', 'loading');

    // Short-circuit if no cookies
    if (!document.cookie.includes('_auth_token')) {
      throw new Error('No authentication tokens found');
    }

    const { data } = await apiClient.get<User>('/api/auth/me');
    setAuth('user', data);
    setAuth('status', 'authenticated');
  } catch (error) {
    await logout(true); // Silent logout
  }
};

/*-----------------------------------------------------------------------------
 * Auth Actions
 *-----------------------------------------------------------------------------*/
export const login = async (credentials: LoginCredentials) => {
  try {
    setAuth('status', 'loading');

    // Clear previous cookies first
    await apiClient.delete('/session');

    // Add explicit cookie check
    const response = await apiClient.post<{ user: User }>('/session', {
      user: credentials,
    });

    // Verify cookies were set
    const hasAuthCookie = document.cookie.includes('_auth_token');
    if (!hasAuthCookie) {
      throw new Error('Authentication cookies not set by server');
    }

    // Fetch user data directly from response
    batch(() => {
      setAuth('user', response.data.user);
      setAuth('status', 'authenticated');
      setAuth('error', null);
    });
  } catch (error) {
    batch(() => {
      setAuth('status', 'error');
      setAuth('error', getErrorMessage(error));
    });
    throw error; // Rethrow to propagate to component
  }
};

export const register = async (userData: RegistrationData) => {
  try {
    setAuth('status', 'loading');
    await apiClient.post('/auth/register', { user: userData });
    await initializeAuth(); // Re-check auth state after registration
  } catch (error) {
    setAuth('status', 'error');
    setAuth('error', getErrorMessage(error));
  }
};

export const logout = async (preventRedirect = false) => {
  try {
    // Clear client-side cookies
    document.cookie =
      '_auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie =
      '_auth_refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    // Reset auth state
    batch(() => {
      setAuth('user', null);
      setAuth('error', null);
      setAuth('status', 'idle');
    });

    // Only call server logout if actually authenticated
    if (isAuthenticated()) {
      await apiClient.delete('/api/session');
    }
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    if (!preventRedirect) {
      window.location.href = '/login'; // Full page redirect
    }
  }
};

/**
 * Fetches the current user data from the API
 *
 * @returns Promise resolving to the user object if successful, otherwise null
 */
export const fetchUserData = async (): Promise<User | null> => {
  try {
    setAuth('status', 'loading');

    const { ok, data } = await apiFetch<ApiAuthResponse | ErrorResponse>(
      '/auth/me',
      {
        method: 'get',
      },
    );

    if (ok && 'user' in data) {
      const res = data as ApiAuthResponse;

      batch(() => {
        setAuth('user', res.user);
        setAuth('status', 'authenticated');
        setAuth('error', null);
      });

      return res.user;
    }

    // If no valid user data, clear auth state
    setAuth(reconcile(getInitialState()));
    return null;
  } catch (error) {
    const message =
      axios.isAxiosError(error) ?
        error.response?.data?.error?.message || error.message
      : error instanceof Error ? error.message
      : 'Failed to fetch user data';

    batch(() => {
      setAuth('status', 'error');
      setAuth('error', message);
    });

    return null;
  }
};
/*-----------------------------------------------------------------------------
 * Reactive Effects
 *-----------------------------------------------------------------------------*/
createRoot(() => {
  createEffect(() => {
    if (auth.status === 'idle' && !authInitialized) {
      initializeAuth();
    }
  });
});
