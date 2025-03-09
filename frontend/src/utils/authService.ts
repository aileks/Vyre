import { User, login, logout } from '../stores/authStore';
import { keysToCamelCase, keysToSnakeCase } from './caseTransformer';

interface RegistrationData {
  email: string;
  password: string;
  username?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface TokenData {
  value: string;
  expiry: number;
}

interface SuccessResponse {
  user: User;
  token: string;
  expiresAt?: number;
}

interface ErrorResponse {
  error: {
    message?: string;
  };
}

type AuthResult = Promise<SuccessResponse | ErrorResponse>;

/**
 * Registers a new user with the provided data.
 *
 * @param userData - User registration information
 * @returns Promise resolving to either the authenticated user data with token or an error
 */
export const register = async (userData: RegistrationData): AuthResult => {
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

    login(user, token, false, expiresAt);
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
export const doLogin = async (credentials: LoginCredentials): AuthResult => {
  const { email, password, rememberMe } = credentials;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (res.ok) {
    // Convert all response data to camelCase
    const data = keysToCamelCase<SuccessResponse>(await res.json());
    const { user, token, expiresAt } = data;

    // Use the expiresAt value directly
    login(user, token, rememberMe, expiresAt);
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
    const { value: token, expiry } = parsedData;

    const now = new Date();
    if (now.getTime() > expiry) {
      // Token expired, clean up and return
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
      // Convert the response data to camelCase
      const data = keysToCamelCase<{ user: User }>(await res.json());
      const { user } = data;

      // Pass in the original expiry so it's preserved
      login(user, token, false, expiry);
    } else {
      logout();
    }
  } catch (error) {
    // If there's any error parsing the token data, clean up
    localStorage.removeItem('token');
    return;
  }
};
