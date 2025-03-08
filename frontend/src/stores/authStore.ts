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

const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  token: token,
};

export const [state, setState] = createStore<AppState>(initialState);

export const useStore = () => [state, setState];

export const login = (user: User, token: string) => {
  setState({
    user,
    isAuthenticated: true,
    token,
  });

  localStorage.setItem('token', token);
};

export const logout = () => {
  setState({
    user: null,
    isAuthenticated: false,
    token: null,
  });

  localStorage.removeItem('token');
};
