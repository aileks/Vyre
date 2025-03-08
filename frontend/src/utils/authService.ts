import { login, logout } from '../stores/authStore';

export const register = async (userData: any) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: userData }),
  });

  if (res.ok) {
    const { user, token } = await res.json();
    login(user, token);
    return { user, token };
  } else {
    const error = await res.json();
    return { error };
  }
};

export const doLogin = async (credentials: { email: string; password: string }) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: credentials }),
  });

  if (response.ok) {
    const { user, token } = await response.json();
    login(user, token);
    return { user, token };
  } else {
    const error = await response.json();
    return { error };
  }
};

export const doLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  logout();
};

export const fetchSession = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;

  const response = await fetch('/api/auth/me', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    const { user } = await response.json();
    login(user, token);
  } else {
    logout();
  }
};
