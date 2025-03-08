import { A } from '@solidjs/router';
import { createSignal } from 'solid-js';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}

export default function Login() {
  const [email, setEmail] = createSignal<string>('');
  const [password, setPassword] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal<boolean>(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const credentials: LoginCredentials = {
      email: email(),
      password: password(),
    };

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Handle successful login
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class='mx-auto my-12 max-w-md rounded border border-gray-800 bg-gray-900 p-7'>
      <div class='text-accent-500 mb-3 text-4xl font-semibold'>Login</div>
      <div class='mb-6 text-gray-400'>Sign in to your account</div>

      {error() && <div class='text-error-500 mb-4 text-sm'>{error()}</div>}

      <form onSubmit={handleSubmit}>
        <div class='mb-4'>
          <label for='email' class='mb-2 block text-gray-300'>
            Username
          </label>

          <input
            id='email'
            name='email'
            type='email'
            autocomplete='email'
            required
            value={email()}
            onInput={(e: InputEvent) => setEmail((e.target as HTMLInputElement).value)}
            class='focus:border-accent-500 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-white focus:outline-none'
            placeholder='username or email'
          />
        </div>

        <div class='mb-6'>
          <label for='password' class='mb-2 block text-gray-300'>
            Password
          </label>

          <input
            id='password'
            name='password'
            type='password'
            autocomplete='current-password'
            required
            value={password()}
            onInput={(e: InputEvent) => setPassword((e.target as HTMLInputElement).value)}
            class='focus:border-accent-500 w-full rounded border border-gray-900 bg-gray-900 px-3 py-2 text-white focus:outline-none'
            placeholder='••••••••'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading()}
          class='bg-accent-500 hover:bg-accent-600 mb-4 w-full rounded px-4 py-2 text-white transition-colors'
        >
          {isLoading() ? 'Signing In...' : 'Sign In'}
        </button>

        <div class='text-center text-sm'>
          <A href='/forgot-password' class='text-accent-400 hover:text-accent-300 underline'>
            Forgot your password? Reset it here
          </A>
        </div>
      </form>

      <div class='mt-6 border-t border-gray-700 pt-4 text-center text-sm'>
        <span class='text-gray-400'>Don't have an account?</span>{' '}
        <A href='/register' class='text-accent-400 hover:text-accent-300 underline'>
          Register now
        </A>
      </div>
    </div>
  );
}
