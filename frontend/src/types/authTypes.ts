type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'error'
  | 'refresh_needed';

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

export interface TokenData {
  value: string;
  expiresAt: number;
  refreshToken?: string;
  refreshExpiresAt?: number;
}

export interface SuccessResponse {
  user: User;
  token: string;
  expiresAt: number;
  refreshToken?: string;
  refreshExpiresAt?: number;
}

export interface ErrorResponse {
  error: {
    message?: string;
  };
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  refreshToken?: string | null;
  refreshExpiresAt?: number | null;
  error: string | null;
}

export type AuthResult = SuccessResponse | ErrorResponse;
