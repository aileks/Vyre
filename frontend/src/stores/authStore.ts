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
  if (fetchUser.isFetching) return null;
  fetchUser.isFetching = true;

  onCleanup(() => controller.abort());

  try {
    const response = await apiClient.get('/session/current', {
      signal: controller.signal,
    });
    fetchUser.isFetching = false;

    return response.data.user as User;
  } catch (err) {
    fetchUser.isFetching = false;
    // Treat any error as not authenticated or an unavailable user.
    return null;
  }
};
fetchUser.isFetching = false;

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

  const getErrorMessage = (error: any, defaultMsg: string) => {
    if (error?.response?.data?.error) {
      const { error: apiError } = error.response.data;

      if (apiError.details && typeof apiError.details === 'object') {
        // Format the validation errors nicely
        return Object.entries(apiError.details)
          .map(([field, messages]) => {
            const fieldName =
              field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ');
            if (Array.isArray(messages)) {
              return `${fieldName}: ${messages.join(', ')}`;
            }
            return `${fieldName}: ${messages}`;
          })
          .join('\n');
      }

      return apiError || defaultMsg;
    }

    // Fallback
    return error?.message || defaultMsg;
  };

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

      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        'Logging in failed. Please try again.',
      );

      setState('status', 'error');
      setState('error', errorMessage);

      return false;
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
      return true;
    } catch (err) {
      const errorMessage = getErrorMessage(
        err,
        'Registration failed. Please try again.',
      );

      setState('status', 'error');
      setState('error', errorMessage);

      return false;
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

      return true;
    } catch (error: any) {
      const errorMessage = getErrorMessage(
        error,
        'Logging out failed. Please try again.',
      );

      setState('status', 'error');
      setState('error', errorMessage);

      return false;
    }
  };

  createEffect(() => {
    const handleSessionExpired = (e: CustomEvent<{ message: string }>) => {
      // Clear auth state
      setState(
        reconcile({
          status: 'idle',
          user: null,
          error: e.detail?.message || 'Session expired',
        }),
      );

      window.location.href = '/login';
    };

    window.addEventListener(
      'auth:session-expired',
      handleSessionExpired as EventListener,
    );

    onCleanup(() => {
      window.removeEventListener(
        'auth:session-expired',
        handleSessionExpired as EventListener,
      );
    });
  });

  createEffect(() => {
    if (isAuthenticated()) {
      let refreshing = false;

      const refreshInterval = setInterval(
        async () => {
          if (!refreshing) {
            refreshing = true;
            try {
              await apiClient.post('/session/refresh');
            } catch (err) {
              // Error handling will be done by interceptor
            } finally {
              refreshing = false;
            }
          }
        },
        60 * 60 * 1000, // 1 hour
      );

      onCleanup(() => {
        clearInterval(refreshInterval);
      });
    }
  });

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
