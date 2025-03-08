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
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: credentials }),
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

export const doLogout = async () => {
  await fetch('/api/auth/logout', { method: 'DELETE' });
  logout();
};

export const fetchSession = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  const res = await fetch('/api/auth/me', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.ok) {
    const { user } = await res.json();
    login(user, token);
  } else {
    logout();
  }
};
