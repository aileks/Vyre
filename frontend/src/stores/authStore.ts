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
    expiresAt: null,
    error: null,
  };

  try {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      return defaultState;
    }

    const tokenData = JSON.parse(storedToken) as TokenData;

    const now = Date.now() / 1000;
    let expiresAt = tokenData.expiresAt;

    // Check expiration
    if (expiresAt && now > expiresAt) {
      localStorage.removeItem('token');
      return defaultState;
    }

    return {
      status: 'authenticated',
      user: null,
      token: tokenData.value,
      expiresAt,
      error: null,
    };
  } catch (error) {
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
const setStoredToken = (token: string, expiresAt: number) => {
  if (typeof window !== 'undefined') {
    const stringifiedToken = JSON.stringify({
      value: token,
      expiresAt,
    });

    localStorage.setItem('token', stringifiedToken);
  }
};

const clearStoredToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('token');
};

// Set up token expiration
createEffect(() => {
  if (!auth.expiresAt) return;

  const now = Date.now() / 1000; // Convert to seconds

  if (now > auth.expiresAt) {
    logout();
    return;
  }
});

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
  try {
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
    const { user, token, expiresAt } = data;

    // Update storage and state
    setStoredToken(token, expiresAt);
    setAuth(
      reconcile({
        status: 'authenticated',
        user,
        token,
        expiresAt,
        error: null,
      }),
    );

    return { user, token, expiresAt };
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
    const { user, token, expiresAt } = data;

    // Update storage and state
    setStoredToken(token, expiresAt);
    setAuth(
      reconcile({
        status: 'authenticated',
        user,
        token,
        expiresAt,
        error: null,
      }),
    );

    return { user, token, expiresAt };
  } else {
    const errorData = data as ErrorResponse;
    setAuth('status', 'error');
    setAuth('error', errorData.error?.message || 'Login failed');

    return errorData;
  }
};

export const logout = async (): Promise<void> => {
  setAuth('status', 'loading');

  // TODO: Handle any errors more gracefully
  if (auth.token) {
    apiFetch('/api/auth/logout', { method: 'DELETE' }).catch(console.error);
  }

  clearStoredToken();
  setAuth(
    reconcile({
      status: 'idle',
      user: null,
      token: null,
      expiresAt: null,
      error: null,
    }),
  );
};

/**
 * Refreshes the current session by validating the token and fetching user data.
 *
 * @returns Promise resolving to the user object if successful, otherwise null
 */
export const refreshSession = async (): Promise<User | null> => {
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
    // Something went wrong
    clearStoredToken();
    setAuth(
      reconcile({
        status: 'idle',
        user: null,
        token: null,
        expiresAt: null,
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
