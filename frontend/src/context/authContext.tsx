import { JSX, createContext, useContext } from 'solid-js';

import {
  currentError,
  currentUser,
  isAuthenticated,
  isLoading,
  login,
  logout,
  refreshSession,
  register,
} from '../stores/authStore';
import { AuthResult, LoginCredentials, RegistrationData, User } from '../types';

interface AuthContextValue {
  isAuthenticated: () => boolean;
  currentUser: () => User | null;
  isLoading: () => boolean;
  currentError: () => string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (userData: RegistrationData) => Promise<AuthResult>;
  refreshSession: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = (props: { children: JSX.Element }) => {
  return (
    <AuthContext.Provider
      value={{
        currentError,
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshSession,
        register,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
