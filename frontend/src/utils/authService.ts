import { login, logout } from '../stores/authStore';

export const register = async (userData: any) => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: userData }),
  });

  if (res.ok) {
    const { user, token } = await res.json();
    login(user, token, false);
    return { user, token };
  } else {
    const error = await res.json();
    return { error };
  }
};

export const doLogin = async (credentials: {
  email: string;
  password: string;
  rememberMe: boolean;
}) => {
  const { email, password, rememberMe } = credentials;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: { email, password } }),
  });

  if (res.ok) {
    const { user, token } = await res.json();
    login(user, token, rememberMe);
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
  const tokenData = localStorage.getItem('token');
  if (!tokenData) return;

  try {
    const parsedData = JSON.parse(tokenData);
    const { value: token, expiry } = parsedData;

    const now = new Date();
    if (now.getTime() > expiry) {
      // Token expired, clean up and return
      localStorage.removeItem('token');
      return;
    }

    // Token is valid, proceed with the request
    const res = await fetch('/api/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const { user } = await res.json();
      // Pass in the original expiry so it’s preserved
      login(user, token, false, expiry);
    } else {
      logout();
    }
  } catch (error) {
    // If there's any error parsing the token data, clean up
    localStorage.removeItem('token');
    return;
  }
};
