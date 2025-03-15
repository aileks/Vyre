import { batch, createEffect } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import {
  AuthResult,
  AuthState,
  ErrorResponse,
  LoginCredentials,
  RegistrationData,
  SuccessResponse,
  TokenData,
  User,
} from '../types';
import { keysToCamelCase, keysToSnakeCase } from '../utils/caseTransformer';

/*-----------------------------------------------------------------------------
 * State Setup
 *-----------------------------------------------------------------------------*/
const getInitialState = (): AuthState => {
  const defaultState: AuthState = {
    status: 'idle',
    user: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
    refreshExpiresAt: null,
    error: null,
  };

  try {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      return defaultState;
    }

    const tokenData = JSON.parse(storedToken) as TokenData;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = tokenData.expiresAt;
    const refreshExpiresAt = tokenData.refreshExpiresAt;

    // Check token expiration
    if (expiresAt && now > expiresAt) {
      // If refresh token exists and is still valid, we'll handle refresh in the effect
      if (!refreshExpiresAt || now > refreshExpiresAt) {
        localStorage.removeItem('token');
        return defaultState;
      }

      // If refresh token is still valid, set status to refresh_needed
      return {
        status: 'refresh_needed',
        user: null,
        token: null,
        refreshToken: tokenData.refreshToken,
        expiresAt: null,
        refreshExpiresAt,
        error: null,
      };
    }

    return {
      status: 'authenticated',
      user: null,
      token: tokenData.value,
      refreshToken: tokenData.refreshToken,
      expiresAt,
      refreshExpiresAt,
      error: null,
    };
  } catch (err) {
    // If any error in parsing, clear the token
    localStorage.removeItem('token');
    return defaultState;
  }
};

export const [auth, setAuth] = createStore<AuthState>(getInitialState());

// Create derived state signals
export const isAuthenticated = () => Boolean(auth.user && auth.token);
export const isLoading = () => auth.status === 'loading';
export const currentUser = () => auth.user;
export const currentError = () => auth.error;

/*-----------------------------------------------------------------------------
 * Token Management
 *-----------------------------------------------------------------------------*/
const setStoredToken = (
  token: string,
  expiresAt: number,
  refreshToken?: string,
  refreshExpiresAt?: number,
) => {
  const stringifiedToken = JSON.stringify({
    value: token,
    expiresAt,
    refreshToken,
    refreshExpiresAt,
  });

  localStorage.setItem('token', stringifiedToken);
};

const clearStoredToken = () => {
  localStorage.removeItem('token');
};

/**
 * Refresh the access token using the refresh token
 *
 * @returns {Promise<boolean>} - True if the token was refreshed successfully, false otherwise
 */
const refreshAccessToken = async (): Promise<boolean> => {
  if (!auth.refreshToken) return false;

  try {
    setAuth('status', 'loading');
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: auth.refreshToken }),
    });

    if (!res.ok) {
      clearStoredToken();
      setAuth(
        reconcile({
          status: 'idle',
          user: null,
          token: null,
          refreshToken: null,
          expiresAt: null,
          refreshExpiresAt: null,
          error: 'Session expired',
        }),
      );
      return false;
    }

    const data = await res.json();
    const { token, expiresAt, refreshToken, refreshExpiresAt } =
      keysToCamelCase(data);

    setStoredToken(token, expiresAt, refreshToken, refreshExpiresAt);

    batch(() => {
      setAuth('status', 'authenticated');
      setAuth('token', token);
      setAuth('refreshToken', refreshToken);
      setAuth('expiresAt', expiresAt);
      setAuth('refreshExpiresAt', refreshExpiresAt);
    });

    return true;
  } catch (err) {
    console.error('Failed to refresh token:', err);

    clearStoredToken();
    setAuth(
      reconcile({
        status: 'idle',
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        refreshExpiresAt: null,
        error: 'Failed to refresh session',
      }),
    );

    return false;
  }
};

/**
 * Fetches data from the API with proper error handling and response transformation.
 * Automatically adds authentication token and handles common headers.
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
    // Try to refresh token first if needed
    if (auth.status === 'refresh_needed' && auth.refreshToken) {
      await refreshAccessToken();
    }

    // Add auth token if available
    if (auth.token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${auth.token}`,
      };
    }

    // Add default headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    options.signal = controller.signal;
    const res = await fetch(url, options);

    // Handle unauthorized responses by attempting token refresh
    if (res.status === 401 && auth.refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request with the new token
        return apiFetch(url, options);
      }
    }

    const data = await res.json().catch(() => ({}));
    const transformedData = keysToCamelCase<T>(data);

    return {
      ok: res.ok,
      data: transformedData,
    };
  } catch (err) {
    return {
      ok: false,
      data: { error: { message: 'Network error occurred' } } as unknown as T,
    };
  } finally {
    clearTimeout(timeout);
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

  const snakeCaseData = keysToSnakeCase(userData);
  const { ok, data } = await apiFetch<SuccessResponse | ErrorResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ user: snakeCaseData }),
    },
  );

  if (ok && 'user' in data) {
    const { user, token, expiresAt, refreshToken, refreshExpiresAt } = data;

    // Update storage and state
    setStoredToken(token, expiresAt, refreshToken, refreshExpiresAt);
    setAuth(
      reconcile({
        status: 'authenticated',
        user,
        token,
        refreshToken,
        expiresAt,
        refreshExpiresAt,
        error: null,
      }),
    );

    return { user, token, expiresAt, refreshToken, refreshExpiresAt };
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

  const { ok, data } = await apiFetch<SuccessResponse | ErrorResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ user: credentials }),
    },
  );

  if (ok && 'user' in data) {
    const { user, token, expiresAt, refreshToken, refreshExpiresAt } = data;

    // Update storage and state
    setStoredToken(token, expiresAt, refreshToken, refreshExpiresAt);
    setAuth(
      reconcile({
        status: 'authenticated',
        user,
        token,
        expiresAt,
        refreshToken,
        refreshExpiresAt,
        error: null,
      }),
    );

    return { user, token, expiresAt, refreshToken, refreshExpiresAt };
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
    if (auth.token) {
      // Revoke the token on the server
      await apiFetch('/api/auth/logout', { method: 'DELETE' });
    }
  } catch (err) {
    console.error('Logout failed:', err);
  } finally {
    clearStoredToken();
    setAuth(
      reconcile({
        status: 'idle',
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        refreshExpiresAt: null,
        error: null,
      }),
    );
  }
};

/**
 * Refreshes the current session by validating the token and fetching user data.
 *
 * @returns Promise resolving to the user object if successful, otherwise null
 */
export const refreshSession = async (): Promise<User | null> => {
  // If we need to refresh the token first
  if (auth.status === 'refresh_needed' && auth.refreshToken) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
  }

  if (!auth.token) {
    setAuth('status', 'idle');
    return null;
  }

  batch(() => {
    setAuth('status', auth.user ? 'authenticated' : 'loading');
    setAuth('error', null);
  });

  const { ok, data } = await apiFetch<{ user: User } | ErrorResponse>(
    '/api/auth/me',
  );

  if (ok && 'user' in data) {
    batch(() => {
      setAuth('status', 'authenticated');
      setAuth('user', data.user);
      setAuth('error', null);
    });

    return data.user;
  } else {
    if (auth.refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Try again after refresh
        return refreshSession();
      }
    }

    // Something has gone horribly wrong...
    clearStoredToken();
    setAuth(
      reconcile({
        status: 'idle',
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        refreshExpiresAt: null,
        error: 'Invalid session',
      }),
    );

    return null;
  }
};

// Fetch user data when we have a token but no user
// NOTE: This usually only happens on initial mount
createEffect(() => {
  if (auth.token && !currentUser() && !isLoading()) {
    refreshSession();
  }
});

// Set up token expiration and refresh
createEffect(() => {
  if (!auth.expiresAt) {
    // If we need a refresh and have a refresh token
    if (auth.status === 'refresh_needed' && auth.refreshToken) {
      refreshAccessToken();
    }
    return;
  }

  const now = Date.now() / 1000;

  // If token is expired
  if (now > auth.expiresAt) {
    // Try to refresh if we have a valid refresh token
    if (
      auth.refreshToken &&
      auth.refreshExpiresAt &&
      now < auth.refreshExpiresAt
    ) {
      refreshAccessToken();
    } else {
      logout();
    }
    return;
  }

  // Schedule token refresh when token is about to expire (1 minute before)
  const refreshDelay = (auth.expiresAt - now - 60) * 1000;
  if (refreshDelay > 0 && auth.refreshToken) {
    const timeoutId = setTimeout(() => {
      refreshAccessToken();
    }, refreshDelay);

    // Clean up the timeout if this effect reruns
    return () => clearTimeout(timeoutId);
  }
});
