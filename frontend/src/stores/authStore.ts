import {
  batch,
  createEffect,
  createMemo,
  createResource,
  onCleanup,
} from 'solid-js';
import { createStore } from 'solid-js/store';

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
    const res = await apiClient.get('/session/current', {
      signal: controller.signal,
    });

    return res.data.user as User;
  } catch (err) {
    return null;
  }
};

// Automatically fetch/refetch the current user.
const [currentUser, { mutate: mutateUser, refetch: refetchUser }] =
  createResource(fetchUser);
// const [refreshFetch] = createResource(refreshUser);

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
      batch(() => {
        setState('status', 'idle');
        setState('user', null);
        setState('error', null);
      });
    } else {
      batch(() => {
        setState('status', 'authenticated');
        setState('user', user);
        setState('error', null);
      });
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

      await refetchUser();

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

      await refetchUser();
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
    setState('status', 'loading');

    try {
      await apiClient.delete('/session');

      mutateUser(null);

      batch(() => {
        setState('status', 'idle');
        setState('error', null);
        setState('user', null);
      });

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

  const handleSessionExpired = (event: CustomEvent) => {
    console.warn('Session expired:', event.detail.message);

    setState({
      status: 'idle',
      user: null,
      error: 'Your session has expired.',
    });
  };

  window.addEventListener(
    'sessionExpired',
    handleSessionExpired as EventListener,
  );

  // Clean up the listener when the component/store is destroyed
  onCleanup(() => {
    window.removeEventListener(
      'sessionExpired',
      handleSessionExpired as EventListener,
    );
  });
  return {
    state,
    isLoading,
    isAuthenticated,
    currentError,
    login,
    register,
    logout,
  };
};
