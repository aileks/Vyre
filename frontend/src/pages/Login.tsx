import { A } from '@solidjs/router';
import { useNavigate } from '@solidjs/router';
import { createEffect, createSignal } from 'solid-js';

import { state } from '../stores/authStore';
import { AuthResult, doLogin } from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal<string>('');
  const [password, setPassword] = createSignal<string>('');
  const [error, setError] = createSignal<string>('');
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [remember, setRemember] = createSignal<boolean>(false);

  createEffect(() => {
    if (state.user) navigate('/', { replace: true });
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const credentials = {
      email: email(),
      password: password(),
      rememberMe: remember(),
    };

    const res: AuthResult = await doLogin(credentials);

    if ('error' in res) {
      setError(res.error.message || 'Login failed');
      setIsLoading(false);
      return;
    }

    navigate('/', { replace: true });

    setIsLoading(false);
  };

  return (
    <div class='bg-midnight-700 shadow-midnight-900/50 mx-auto mt-64 max-w-lg rounded-xs border border-gray-700 p-7 shadow-lg'>
      <div class='text-primary-400 mb-4 text-4xl font-bold tracking-wide'>
        Login
      </div>

      {error() && (
        <div class='border-error-700 bg-midnight-800 text-error-400 mb-5 rounded-xs border p-3 text-sm'>
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

      <form onSubmit={handleSubmit} class='space-y-5'>
        <div>
          <label for='email' class='mb-2 block'>
            Email
          </label>

          <input
            id='email'
            name='email'
            type='email'
            autocomplete='email'
            required
            value={email()}
            onInput={(e: InputEvent) =>
              setEmail((e.target as HTMLInputElement).value)
            }
            class='bg-midnight-900 focus:border-primary-500 focus:ring-primary-500/30 w-full rounded-xs border border-gray-700 px-3 py-2.5 transition-colors duration-200 focus:ring-1 focus:outline-none'
            placeholder='user@domain.com'
          />
        </div>

        <div>
          <div class='mb-2 flex justify-between'>
            <label for='password' class='block'>
              Password
            </label>

            <A
              href='/forgot-password'
              class='text-sm text-teal-400 transition-colors duration-200 hover:text-teal-300'
            >
              Forgot?
            </A>
          </div>

          <input
            id='password'
            name='password'
            type='password'
            autocomplete='current-password'
            required
            value={password()}
            onInput={(e: InputEvent) =>
              setPassword((e.target as HTMLInputElement).value)
            }
            class='bg-midnight-900 focus:border-primary-500 focus:ring-primary-500/30 w-full rounded-xs border border-gray-700 px-3 py-2.5 transition-colors duration-200 focus:ring-1 focus:outline-none'
            placeholder='••••••••'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading()}
          class='bg-primary-600 hover:bg-primary-500 focus:ring-primary-500/50 border-primary-400 w-full rounded-xs border px-4 py-2.5 transition-all duration-200 hover:cursor-pointer focus:ring-2 focus:outline-none disabled:opacity-70'
        >
          {isLoading() ?
            <span class='flex items-center justify-center'>
              <svg
                class='mr-2 h-4 w-4 animate-spin'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  class='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  stroke-width='4'
                ></circle>
                <path
                  class='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Logging In...
            </span>
          : 'Log In'}
        </button>
      </form>

      <div class='mt-8 border-t border-gray-700 pt-6 text-center'>
        <span class='text-cybertext-600'>Need an account?</span>{' '}
        <A
          href='/register'
          class='text-electric-500 hover:text-electric-400 transition-colors duration-200'
        >
          Register here
        </A>
        <div class='text-cybertext-400 mt-3 flex items-center justify-center gap-1'>
          <input
            type='checkbox'
            checked={remember()}
            onChange={() => {
              setRemember(!remember());
            }}
          />
          Remember Me
        </div>
      </div>
    </div>
  );
}
