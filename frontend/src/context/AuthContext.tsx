import { ParentProps, createContext, useContext } from 'solid-js';

import { createAuthStore } from '../stores/authStore';
import type { AuthState, LoginCredentials, RegistrationData } from '../types';

export interface AuthContextValue {
  state: AuthState;
  currentError: () => string | null;
  isLoading: () => boolean;
  isAuthenticated: () => boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue>();

export const AuthProvider = (props: ParentProps) => {
  const authStore = createAuthStore();

  return (
    <AuthContext.Provider value={authStore}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
