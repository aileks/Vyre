import { createStore } from 'solid-js/store';

import { keysToCamelCase, keysToSnakeCase } from '../utils/caseTransformer';

export interface RegistrationData {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface TokenData {
  value: string;
  expiresAt: number;
}

interface SuccessResponse {
  user: User;
  token: string;
  expiresAt: number;
}

interface ErrorResponse {
  error: {
    message?: string;
  };
}

export type AuthResult = SuccessResponse | ErrorResponse;

export interface User {
  id: string;
  status: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

export interface AppState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
}

/*-----------------------------------------------------------------------------
 * Auth Store State
 * Actions for managing the user's authentication state
 *-----------------------------------------------------------------------------*/
const storedToken =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;
let tokenData: TokenData | null = null;
if (storedToken) {
  try {
    tokenData = JSON.parse(storedToken) as TokenData;
  } catch (error) {
    tokenData = null;
  }
}

const initialState: AppState = {
  user: null,
  token: tokenData ? tokenData.value : null,
  expiresAt: tokenData ? tokenData.expiresAt : 0,
};

export const [state, setState] = createStore<AppState>(initialState);

export const useStore = () => [state, setState];

export const login = (user: User, token: string, expiresAt: number) => {
  localStorage.setItem(
    'token',
    JSON.stringify({
      value: token,
      expiresAt,
    }),
  );

  setState({
    user,
    token,
    expiresAt,
  });
};

export const logout = () => {
  setState({
    user: null,
    token: null,
    expiresAt: null,
  });
  localStorage.removeItem('token');
};

/*-----------------------------------------------------------------------------
 * Auth Service "Thunks"
 * Functions for handling user registration, login, logout and session mgmt
 *-----------------------------------------------------------------------------*/
/**
 * Registers a new user with the provided data.
 *
 * @param userData - User registration information
 * @returns Promise resolving to either the authenticated user data with token or an error
 */
export const register = async (
  userData: RegistrationData,
): Promise<AuthResult> => {
  // Convert request data to snake_case for the API
  const snakeCaseData = keysToSnakeCase(userData);

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: snakeCaseData }),
  });

  if (res.ok) {
    // Convert response data to camelCase for frontend use
    const data = keysToCamelCase<SuccessResponse>(await res.json());
    const { user, token, expiresAt } = data;

    login(user, token, expiresAt);
    return { user, token, expiresAt };
  } else {
    const error = keysToCamelCase<ErrorResponse>(await res.json());
    return error;
  }
};

/**
 * Authenticates a user with email and password.
 *
 * @param credentials - Object containing login credentials and remember preference
 * @returns Promise resolving to either the authenticated user data with token or an error
 */
export const doLogin = async (
  credentials: LoginCredentials,
): Promise<AuthResult> => {
  const { email, password, rememberMe } = credentials;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: { email, password, rememberMe } }),
  });

  if (res.ok) {
    // Convert all response data to camelCase
    const data = keysToCamelCase<SuccessResponse>(await res.json());
    const { user, token, expiresAt } = data;

    login(user, token, expiresAt);
    return { user, token, expiresAt };
  } else {
    const error = keysToCamelCase<ErrorResponse>(await res.json());
    return error;
  }
};

/**
 * Handles logging out the current user and updating the app state.
 *
 * @returns Promise that resolves when the logout is complete
 */
export const doLogout = async (): Promise<void> => {
  await fetch('/api/auth/logout', { method: 'DELETE' });
  logout();
};

/**
 * Retrieves and validates the user's session from localStorage.
 * If a valid token is found, fetches the current user data from the API.
 *
 * @returns Promise that resolves when session validation is complete
 */
export const fetchSession = async (): Promise<void> => {
  const tokenData = localStorage.getItem('token');
  if (!tokenData) return;

  try {
    const parsedData = JSON.parse(tokenData) as TokenData;

    const { value: token, expiresAt } = parsedData;

    if (!token || !expiresAt) {
      return;
    }

    const now = Date.now() / 1000;

    if (now > expiresAt) {
      localStorage.removeItem('token');
      return;
    }

    // Token is valid, proceed with the request
    const res = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = keysToCamelCase<{ user: User }>(await res.json());
      const { user } = data;

      login(user, token, expiresAt);
    } else {
      logout();
    }
  } catch (error) {
    localStorage.removeItem('token');
  }
};
