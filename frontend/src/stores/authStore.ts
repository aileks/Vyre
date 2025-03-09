import { createStore } from 'solid-js/store';

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
}

const token =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const initialState: AppState = {
  user: null,
  token: token,
};

export const [state, setState] = createStore<AppState>(initialState);

export const useStore = () => [state, setState];

export const login = (
  user: User,
  token: string,
  rememberMe: boolean = false,
  expiresAt?: number,
) => {
  if (!expiresAt) {
    if (rememberMe) {
      expiresAt = new Date().getTime() + 1000 * 60 * 60 * 24 * 30;
    } else {
      expiresAt = new Date().getTime() + 1000 * 60 * 60;
    }
  }

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
  });
};
export const logout = () => {
  setState({
    user: null,
    token: null,
  });

  localStorage.removeItem('token');
};
