import { A } from '@solidjs/router';
import { createSignal } from 'solid-js';

interface RegisterCredentials {
  username: string;
  display_name: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  error?: string;
}

export default function Register() {
  const [username, setUsername] = createSignal<string>('');
  const [email, setEmail] = createSignal<string>('');
  const [password, setPassword] = createSignal<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal<boolean>(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password() !== passwordConfirmation()) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const credentials: RegisterCredentials = {
      username: username(),
      display_name: username(), // display_name defaults to username
      email: email(),
      password: password(),
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: credentials }),
      });

      const data: RegisterResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Handle successful registration
      console.log('Registration successful', data);
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class='bg-midnight-700 shadow-midnight-900/50 mx-auto mt-64 max-w-lg rounded-sm border border-gray-700 p-7 shadow-lg'>
      <div class='mb-4 text-4xl font-bold tracking-wide text-pink-400'>Register</div>

      {error() && (
        <div class='border-error-700 bg-midnight-800 text-error-400 mb-5 rounded-sm border p-3 text-sm'>
          <div class='flex items-center'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              class='text-error-500 mr-2 h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>{error()}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} class='space-y-4'>
        <div>
          <label for='name' class='text-cybertext-300 mb-2 block'>
            Username
          </label>

          <input
            id='name'
            name='name'
            type='text'
            autocomplete='name'
            required
            value={username()}
            onInput={(e: InputEvent) => setUsername((e.target as HTMLInputElement).value)}
            class='bg-midnight-900 text-cybertext-100 w-full rounded-sm border border-gray-700 px-3 py-2.5 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none'
            placeholder='user'
          />
        </div>

        <div>
          <label for='email' class='text-cybertext-300 mb-2 block'>
            Email
          </label>

          <input
            id='email'
            name='email'
            type='email'
            autocomplete='email'
            required
            value={email()}
            onInput={(e: InputEvent) => setEmail((e.target as HTMLInputElement).value)}
            class='bg-midnight-900 text-cybertext-100 w-full rounded-sm border border-gray-700 px-3 py-2.5 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none'
            placeholder='user@domain.com'
          />
        </div>

        <div>
          <label for='password' class='text-cybertext-300 mb-2 block'>
            Password
          </label>

          <input
            id='password'
            name='password'
            type='password'
            autocomplete='new-password'
            required
            value={password()}
            onInput={(e: InputEvent) => setPassword((e.target as HTMLInputElement).value)}
            class='bg-midnight-900 text-cybertext-100 w-full rounded-sm border border-gray-700 px-3 py-2.5 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none'
            placeholder='••••••••'
          />
          <div class='mt-1 text-xs text-gray-400'>Minimum 8 characters</div>
        </div>

        <div>
          <label for='password_confirmation' class='text-cybertext-300 mb-2 block'>
            Confirm Password
          </label>

          <input
            id='password_confirmation'
            name='password_confirmation'
            type='password'
            autocomplete='new-password'
            required
            value={passwordConfirmation()}
            onInput={(e: InputEvent) => setPasswordConfirmation((e.target as HTMLInputElement).value)}
            class='bg-midnight-900 text-cybertext-100 w-full rounded-sm border border-gray-700 px-3 py-2.5 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none'
            placeholder='••••••••'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading()}
          class='text-cybertext-100 mt-6 w-full rounded-sm border border-pink-400 bg-pink-600 px-4 py-2.5 transition-all duration-200 hover:cursor-pointer hover:bg-pink-500 focus:ring-2 focus:ring-pink-500/50 focus:outline-none disabled:opacity-70'
        >
          {isLoading() ?
            <span class='flex items-center justify-center'>
              <svg class='mr-2 h-4 w-4 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                <circle class='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' stroke-width='4'></circle>
                <path
                  class='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Registering...
            </span>
          : 'Register'}
        </button>
      </form>

      <div class='mt-8 border-t border-gray-700 pt-6 text-center'>
        <span class='text-cybertext-500'>Already have an account?</span>{' '}
        <A href='/login' class='text-teal-400 transition-colors duration-200 hover:text-teal-300'>
          Log in here
        </A>
      </div>
    </div>
  );
}
