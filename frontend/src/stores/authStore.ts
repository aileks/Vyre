import { createEffect, createMemo, createResource, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import type {
  AuthState,
  LoginCredentials,
  RegistrationData,
  User,
} from '../types';
import apiClient from '../utils/apiClient';

const fetchUser = async (): Promise<User | null> => {
  const controller = new AbortController();

  onCleanup(() => controller.abort());

  try {
    const response = await apiClient.get('/users/me', {
      signal: controller.signal,
    });
    return response.data.user as User;
  } catch (error) {
    // Treat any error as not authenticated or an unavailable user.
    return null;
  }
};

// Automatically fetch/refetch the current user.
const [currentUser, { refetch, mutate }] = createResource(fetchUser);

export const createAuthStore = () => {
  const [state, setState] = createStore<AuthState>({
    status: 'idle',
    user: null,
    error: null,
  });

  const isLoading = createMemo(() => state.status === 'loading');
  const isAuthenticated = createMemo(() => state.status === 'authenticated');
  const currentError = createMemo(() => state.error);

  // Handle session expiration
  const setupAuthEventListeners = () => {
    const handleSessionExpired = () => {
      // Clear auth state and redirect to login
      setState(
        reconcile({
          status: 'idle',
          user: null,
          error: 'Your session has expired. Please log in again.',
        }),
      );

      // window.location.href = '/login';
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);

    onCleanup(() => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    });
  };

  // Automatically refresh sessions.
  const setupRefreshInterval = () => {
    const interval = setInterval(
      async () => {
        if (isAuthenticated()) {
          try {
            await apiClient.post('/session/refresh');
          } catch (error) {
            console.error('Session validation failed');
          }
        }
      },
      60 * 60 * 1000,
    ); // 1 hour

    onCleanup(() => clearInterval(interval));
  };

  createEffect(() => {
    if (isAuthenticated()) {
      setupRefreshInterval();
    }
  });

  // When the currentUser resource updates, update our auth state.
  createEffect(() => {
    const user = currentUser();

    if (user === undefined) {
      setState('status', 'loading');
    } else if (user === null) {
      setState(
        reconcile({
          status: 'idle',
          user: null,
          error: null,
        }),
      );
    } else {
      setState(
        reconcile({
          status: 'authenticated',
          user,
          error: null,
        }),
      );
    }
  });

  const getErrorMessage = (error: any, defaultMsg: string) =>
    error?.response?.data?.error?.message || error?.message || defaultMsg;

  const login = async (credentials: LoginCredentials) => {
    setState('status', 'loading');
    setState('error', null);

    try {
      await apiClient.post('/session', {
        user: {
          email: credentials.email,
          password: credentials.password,
          remember_me: credentials.rememberMe,
        },
      });
      // Refetch to update the currentUser resource.
      await refetch();
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Network error (login)');

      setState('status', 'error');
      setState('error', errorMessage);

      throw error;
    }
  };

  const register = async (registrationData: RegistrationData) => {
    setState('status', 'loading');
    setState('error', null);

    try {
      await apiClient.post('/users/new', {
        user: {
          email: registrationData.email,
          password: registrationData.password,
          username: registrationData.username,
          display_name: registrationData.displayName,
        },
      });
      await refetch();
    } catch (error: any) {
      const errorMessage = getErrorMessage(
        error,
        'Network error (registration)',
      );

      setState('status', 'error');
      setState('error', errorMessage);

      throw error;
    }
  };

  const logout = async () => {
    setState({ status: 'loading' });

    try {
      await apiClient.delete('/session');

      mutate(null);
      setState(
        reconcile({
          status: 'idle',
          user: null,
          error: null,
        }),
      );
    } catch (error: any) {
      const errorMessage = getErrorMessage(error, 'Network error (logout)');

      setState('status', 'error');
      setState('error', errorMessage);

      throw error;
    }
  };

  setupAuthEventListeners();

  return {
    state,
    isLoading,
    isAuthenticated,
    currentError,
    login,
    register,
    logout,
    refetch,
  };
};
