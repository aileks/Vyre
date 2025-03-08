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
}

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
};

export const [state, setState] = createStore<AppState>(initialState);

export const useStore = () => [state, setState];

export const login = (user: User) => {
  setState({
    user: {
      ...user,
    },
    isAuthenticated: true,
  });
};

export const logout = () => {
  setState(initialState);
};
