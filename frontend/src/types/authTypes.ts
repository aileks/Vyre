type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface User {
  id: string;
  status: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

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

export interface SuccessResponse {
  user: User;
  expiresAt?: number | null;
  refreshToken?: string;
  refreshExpiresAt?: number | null;
}

export interface ErrorResponse {
  error: {
    message?: string;
  };
}

export interface ApiAuthResponse {
  user: User;
  expiresAt?: string;
  refreshExpiresAt?: string;
}

export interface ApiRefreshResponse {
  user: User;
  expiresAt: string;
  refreshExpiresAt: string;
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  error: string | null;
}

export type AuthResult = User | null;
