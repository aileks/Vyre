import { batch, createEffect, createRoot, onCleanup } from 'solid-js';
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

// Flags
let tokenRefreshInProgress = false;
// let userDataRefreshInProgress = false;

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
export const currentUser = () => auth.user;
export const currentToken = () => auth.token;
export const isAuthenticated = () => Boolean(currentUser() && currentToken());
export const isLoading = () => auth.status === 'loading';
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
export const refreshTokens = async (): Promise<boolean> => {
  if (tokenRefreshInProgress) {
    return false;
  }

  if (!auth.refreshToken) {
    console.error('Cannot refresh token: No refresh token available');
    setAuth('status', 'idle');
    return false;
  }

  try {
    tokenRefreshInProgress = true;

    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: auth.refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();

      setAuth('token', data.access_token);
      setAuth('refreshToken', data.refresh_token);
      setAuth('expiresAt', data.expires_at);
      setAuth('status', 'authenticated');

      return true;
    }

    setAuth('status', 'idle');

    return false;
  } catch (err) {
    console.error('Error refreshing token:', err);

    setAuth('status', 'error');

    return false;
  } finally {
    tokenRefreshInProgress = false;
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
    // Add auth token if available
    if (currentToken()) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${currentToken()}`,
      };
    }

    // Add default headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    options.signal = controller.signal;
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

export const setupSession = async (): Promise<User | null> => {
  console.log(
    'Starting setupSession',
    'token:',
    Boolean(auth.token),
    'user:',
    Boolean(auth.user),
    'status:',
    auth.status,
  );

  // If we already have a user, nothing to do
  if (currentUser()) {
    console.log('Session already has user, returning');
    return auth.user;
  }

  // If we have a token but no user, let's explicitly fetch the user
  if (currentToken()) {
    console.log('Have token but no user, fetching user data');
    const user = await fetchUserData();
    console.log('User data fetch result:', user);
    return user;
  }

  console.log('No valid token found');
  return null;
};

// const isTokenExpired = (): boolean => {
//   if (!auth.expiresAt) return true;

//   const now = Date.now() / 1000;
//   return now >= auth.expiresAt;
// };

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

  console.log('LOGGING DATA FROM WITHIN login:', data);

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
    if (currentToken()) {
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
export const fetchUserData = async (): Promise<User | null> => {
  try {
    console.log(
      'Fetching user data with token:',
      auth.token?.substring(0, 15) + '...',
    );

    // Set status to loading
    setAuth('status', 'loading');

    // Explicitly call the /me endpoint to get user data
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('User data fetch response status:', response.status);

    if (!response.ok) {
      console.error('Failed to fetch user data:', response.status);
      setAuth('status', 'error');
      setAuth('error', `Failed to fetch user: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('User data received:', data);

    // Transform data if needed
    const userData = keysToCamelCase<{ user: User }>(data);

    if (userData && userData.user) {
      // Update auth state with user data
      batch(() => {
        setAuth('user', userData.user);
        setAuth('status', 'authenticated');
        setAuth('error', null);
      });

      console.log('User data updated in auth state');
      return userData.user;
    } else {
      console.error('User data missing from response');
      setAuth('status', 'error');
      setAuth('error', 'User data missing from response');
      return null;
    }
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
  // Auto-refresh token before expiration
  createEffect(() => {
    if (!auth.expiresAt || !currentToken()) return;

    const now = Date.now() / 1000;
    const timeUntilExpiry = auth.expiresAt - now;

    // If already expired, refresh immediately
    if (timeUntilExpiry <= 0) {
      refreshTokens();
      return;
    }

    // Schedule refresh 30 seconds before expiration
    const refreshTime = Math.max(timeUntilExpiry - 30, 0) * 1000;
    const timerId = setTimeout(() => refreshTokens(), refreshTime);

    // Clean up timer when dependencies change
    onCleanup(() => clearTimeout(timerId));
  });

  // Auto-fetch user data when we have token but no user
  createEffect(() => {
    if (currentToken() && !currentUser() && auth.status === 'authenticated') {
      fetchUserData();
    }
  });

  // Handle refresh_needed status
  createEffect(() => {
    if (auth.status === 'refresh_needed' && auth.refreshToken) {
      refreshTokens();
    }
  });
});
