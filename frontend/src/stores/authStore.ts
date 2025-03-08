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
  token?: string | null;
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
};

const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

export const [state, setState] = createStore<AppState>({
  ...initialState,
  token,
});

export const useStore = () => [state, setState];

export const login = (user: User) => {
  setState({
    user,
    isAuthenticated: true,
    token,
  });

  localStorage.setItem('token', token!);
};

export const logout = () => {
  setState(initialState);
  localStorage.removeItem('token');
};
