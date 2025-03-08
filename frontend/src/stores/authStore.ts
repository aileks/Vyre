import { createStore } from 'solid-js/store';

export interface User {
  id: string;
  status: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

const token =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  token: token,
};

export const [state, setState] = createStore<AppState>(initialState);

export const useStore = () => [state, setState];

export const login = (
  user: User,
  token: string,
  rememberMe: boolean = false,
  expiryOverride?: number,
) => {
  let expiry: number;
  if (expiryOverride) {
    expiry = expiryOverride;
  } else {
    if (rememberMe) {
      // 30 days
      expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    } else {
      // 1 hour
      expiry = Date.now() + 60 * 60 * 1000;
    }
  }

  localStorage.setItem(
    'token',
    JSON.stringify({
      value: token,
      expiry: expiry,
    }),
  );

  setState({
    user,
    isAuthenticated: true,
    token,
  });
};
export const logout = () => {
  setState({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  localStorage.removeItem('token');
};
