import {
  batch,
  createEffect,
  createMemo,
  createResource,
  createRoot,
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
  createRoot(() => {
    onCleanup(() => controller.abort());
  });

  try {
    const res = await apiClient.get('/session/current', {
      signal: controller.signal,
    });

    return res.data.user as User;
  } catch (err) {
    return null;
  }
};

const getErrorMessage = (error: any, defaultMsg: string) => {
  console.log('LOGGING ERROR IN STORE:', error);
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

    return apiError.message || defaultMsg;
  }

  // Fallback
  return error?.message || defaultMsg;
};

// Automatically fetch/refetch the current user.
const [currentUser, { mutate: mutateUser, refetch: refetchUser }] =
  createResource(fetchUser);

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
    if (currentUser.error) {
      setState({
        status: 'error',
        error: getErrorMessage(
          currentUser.error,
          'Failed to fetch user information',
        ),
      });
      return;
    }

    const user = currentUser();
    if (!user) {
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
