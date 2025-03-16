// authStore.ts
import { createResource, createSignal, onCleanup } from 'solid-js';

import type { LoginCredentials, RegistrationData, User } from '../types';
import apiClient from '../utils/apiClient';

/**
 * Fetches the current user using an abortable request.
 * If the user isn’t authenticated or an error occurs,
 * returns null.
 */
const fetchUser = async (): Promise<User | null> => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  try {
    const response = await apiClient.get('/user/current', {
      signal: controller.signal,
    });
    return response.data.user as User;
  } catch (error) {
    return null;
  }
};

/**
 * Creates an authentication store that provides:
 * - A reactive `currentUser` resource (with automatic cleanup)
 * - Signals for loading and error state
 * - Methods for logging in, registering, and logging out
 */
export function createAuthStore() {
  const [currentUser, { refetch, mutate }] = createResource(fetchUser);
  const isAuthenticated = () => !!currentUser();

  const [isLoading, setIsLoading] = createSignal(false);
  const [currentError, setCurrentError] = createSignal<string | null>(null);

  /**
   * Log in a user and refetch the current user.
   */
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setCurrentError(null);
    try {
      await apiClient.post('/session', {
        user: {
          email: credentials.email,
          password: credentials.password,
          remember_me: credentials.rememberMe,
        },
      });
      await refetch();
    } catch (error: any) {
      setCurrentError(error?.message || 'Unknown login error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user.
   *
   * After the successful call, refetch the current user.
   */
  const register = async (registrationData: RegistrationData) => {
    setIsLoading(true);
    setCurrentError(null);
    try {
      await apiClient.post('/users/new', {
        user: {
          username: registrationData.username,
          email: registrationData.email,
          password: registrationData.password,
          display_name: registrationData.displayName,
        },
      });

      await refetch();
    } catch (error: any) {
      setCurrentError(error?.message || 'Unknown registration error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out the user and set the current user to null immediately.
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.delete('/session');
      mutate(null);
    } catch (error: any) {
      setCurrentError(error?.message || 'Unknown logout error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentUser, // Resource holding the current user (or null)
    isAuthenticated, // Checks if currentUser exists
    isLoading, // Signal for loading state
    currentError, // Signal for error messages
    login, // Login handler
    register, // Registration handler
    logout, // Logout handler
    refetch, // Expose refetch in case it's needed
  };
}
