// authStore.ts
import { batch, createEffect, createRoot, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import {
  ApiAuthResponse,
  ApiRefreshResponse,
  AuthResult,
  AuthState,
  ErrorResponse,
  LoginCredentials,
  RegistrationData,
  User,
} from '../types';
import { keysToCamelCase, keysToSnakeCase } from '../utils/caseTransformer';

// Flags
let refreshInProgress = false;

/*-----------------------------------------------------------------------------
 * State Setup
 *-----------------------------------------------------------------------------*/
const getInitialState = (): AuthState => {
  return {
    status: 'idle',
    user: null,
    expiresAt: null,
    refreshExpiresAt: null,
    error: null,
  };
};

export const [auth, setAuth] = createStore<AuthState>(getInitialState());

// Create derived state signals
export const currentUser = () => auth.user;
export const isAuthenticated = () => Boolean(currentUser());
export const isLoading = () => auth.status === 'loading';
export const currentError = () => auth.error;
export const currentToken = () => (isAuthenticated() ? 'cookie-auth' : null);

/*-----------------------------------------------------------------------------
 * Helper Functions
 *-----------------------------------------------------------------------------*/

/**
 * Utility function to determine if the session is likely expired
 */
export const isSessionExpired = () => {
  if (!auth.expiresAt) return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= auth.expiresAt;
};

/**
 * Utility function to determine if the refresh token is likely expired
 */
export const isRefreshExpired = () => {
  if (!auth.refreshExpiresAt) return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= auth.refreshExpiresAt;
};

/**
 * Converts ISO date string to timestamp (seconds)
 */
const dateToTimestamp = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  return Math.floor(new Date(dateStr).getTime() / 1000);
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
  options: RequestInit = {},
): Promise<{ ok: boolean; data: T }> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    // Add default headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add credentials to include cookies in the request
    options.credentials = 'include';
    options.signal = controller.signal;

    // Transform request body if needed
    if (options.body && typeof options.body === 'string') {
      try {
        const bodyObj = JSON.parse(options.body);
        options.body = JSON.stringify(keysToSnakeCase(bodyObj));
      } catch (e) {
        // If parsing fails, use the original body
      }
    }

    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    const transformedData = keysToCamelCase<T>(data);

    return {
      ok: res.ok,
      data: transformedData,
    };
  } catch (error) {
    return {
      ok: false,
      data: { error: { message: 'Network error occurred' } } as unknown as T,
    };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Refresh the session by calling the refresh endpoint
 *
 * @returns {Promise<boolean>} - True if the session was refreshed successfully
 */
export const refreshSession = async (): Promise<boolean> => {
  if (refreshInProgress) return false;

  try {
    refreshInProgress = true;
    setAuth('status', 'loading');

    const { ok, data } = await apiFetch<ApiRefreshResponse | ErrorResponse>(
      '/api/session/refresh',
      { method: 'POST' },
    );

    if (ok && 'expiresAt' in data) {
      // Update state with new expiry times
      const expiresAt = dateToTimestamp(data.expiresAt);
      const refreshExpiresAt = dateToTimestamp(data.refreshExpiresAt);

      batch(() => {
        setAuth('expiresAt', expiresAt);
        setAuth('refreshExpiresAt', refreshExpiresAt);
        setAuth('status', 'authenticated');
      });

      // Fetch user data to ensure it's up to date
      await fetchUserData();
      return true;
    }

    // If refresh failed, clear the state
    setAuth(
      reconcile({
        status: 'idle',
        user: null,
        expiresAt: null,
        refreshExpiresAt: null,
        error: null,
      }),
    );

    return false;
  } catch (err) {
    console.error('Error refreshing session:', err);
    setAuth('status', 'error');
    return false;
  } finally {
    refreshInProgress = false;
  }
};

export const setupSession = async (): Promise<User | null> => {
  // If we already have a user, nothing to do
  if (currentUser()) return currentUser();

  try {
    // Try to fetch the user data to check if cookies are valid
    const user = await fetchUserData();

    // If session is expired but refresh token is valid, try refreshing
    if (!user && !isRefreshExpired()) await refreshSession();

    if (user) return user;

    return null;
  } catch (e) {
    console.error('Error setting up session:', e);
    setAuth('status', 'error');
    return null;
  }
};

/*-----------------------------------------------------------------------------
 * Auth Actions
 *-----------------------------------------------------------------------------*/
export const register = async (
  userData: RegistrationData,
): Promise<AuthResult> => {
  setAuth('status', 'loading');
  setAuth('error', null);

  const { ok, data } = await apiFetch<ApiAuthResponse | ErrorResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ user: userData }),
    },
  );

  if (ok && 'user' in data) {
    // We need to cast data to ApiAuthResponse to access its properties safely
    const responseData = data as ApiAuthResponse;
    const user = responseData.user;
    const expiresAt = dateToTimestamp(responseData.expiresAt);
    const refreshExpiresAt = dateToTimestamp(responseData.refreshExpiresAt);

    setAuth(
      reconcile({
        status: 'authenticated',
        user,
        expiresAt,
        refreshExpiresAt,
        error: null,
      }),
    );

    return {
      user,
      expiresAt: expiresAt,
      refreshExpiresAt,
    };
  } else {
    const errorData = data as ErrorResponse;
    batch(() => {
      setAuth('status', 'error');
      setAuth('error', errorData.error?.message || 'Registration failed');
    });

    return errorData;
  }
};

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResult> => {
  setAuth('status', 'loading');
  setAuth('error', null);

  const { ok, data } = await apiFetch<ApiAuthResponse | ErrorResponse>(
    '/api/session',
    {
      method: 'POST',
      body: JSON.stringify({ user: credentials }),
    },
  );

  if (ok && 'user' in data) {
    // We need to cast data to ApiAuthResponse to access its properties safely
    const responseData = data as ApiAuthResponse;
    const user = responseData.user;
    const expiresAt = dateToTimestamp(responseData.expiresAt);
    const refreshExpiresAt = dateToTimestamp(responseData.refreshExpiresAt);

    // Update state
    setAuth(
      reconcile({
        status: 'authenticated',
        user,
        expiresAt,
        refreshExpiresAt,
        error: null,
      }),
    );
    return {
      user,
      expiresAt: expiresAt,
      refreshExpiresAt,
    };
  } else {
    const errorData = data as ErrorResponse;
    setAuth('status', 'error');
    setAuth('error', errorData.error?.message || 'Login failed');

    return errorData;
  }
};

export const logout = async (): Promise<void> => {
  setAuth('status', 'loading');

  try {
    // Call logout endpoint to clear cookies on server
    await apiFetch('/api/session', { method: 'DELETE' });
  } catch (err) {
    console.error('Logout failed:', err);
  } finally {
    // Clear state
    setAuth(
      reconcile({
        status: 'idle',
        user: null,
        expiresAt: null,
        refreshExpiresAt: null,
        error: null,
      }),
    );
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
      '/api/auth/me',
      { method: 'GET' },
    );

    if (!ok || !('user' in data)) {
      console.error('Failed to fetch user data:', data);
      setAuth('status', 'idle');
      setAuth('user', null);
      return null;
    }

    // We need to cast data to ApiAuthResponse to access its properties safely
    const responseData = data as ApiAuthResponse;
    const user = responseData.user;

    // Update auth state with user data
    batch(() => {
      setAuth('user', user);
      setAuth('status', 'authenticated');
      setAuth('error', null);
    });

    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    setAuth('status', 'error');
    setAuth(
      'error',
      error instanceof Error ? error.message : 'Unknown error fetching user',
    );
    return null;
  }
};

/*-----------------------------------------------------------------------------
 * Reactive Effects
 *-----------------------------------------------------------------------------*/
createRoot(() => {
  // Auto-refresh session before expiration
  createEffect(() => {
    if (!auth.expiresAt) return;

    const now = Date.now() / 1000;
    const timeUntilExpiry = auth.expiresAt - now;

    // If already expired, refresh immediately
    if (timeUntilExpiry <= 0) {
      refreshSession();
      return;
    }

    // Schedule refresh 30 seconds before expiration
    const refreshTime = Math.max(timeUntilExpiry - 30, 0) * 1000;
    const timerId = setTimeout(() => refreshSession(), refreshTime);

    // Clean up timer
    onCleanup(() => clearTimeout(timerId));
  });

  // Handle refresh_needed status
  createEffect(() => {
    if (auth.status === 'refresh_needed') {
      refreshSession();
    }
  });
});
