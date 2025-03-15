import { A } from '@solidjs/router';
import { useNavigate } from '@solidjs/router';
import { Show, createEffect, createSignal } from 'solid-js';

import { useAuth } from '../context/authContext';
import { LoginCredentials } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, currentError } = useAuth();

  const [email, setEmail] = createSignal<string>('');
  const [password, setPassword] = createSignal<string>('');
  const [error, setError] = createSignal<string | null>(null);
  const [remember, setRemember] = createSignal<boolean>(false);

  createEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true });
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const credentials: LoginCredentials = {
      email: email(),
      password: password(),
      rememberMe: remember(),
    };

    try {
      await login(credentials);
      navigate('/', { replace: true });
    } catch (error) {
      setError(currentError());
    }
  };

  return (
    <div class='flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8'>
      <div class='bg-midnight-700 shadow-midnight-900/50 w-full max-w-md rounded-xs border border-gray-700 p-5 shadow-lg sm:p-7'>
        <div class='text-primary-400 mb-4 text-2xl font-bold tracking-wide sm:text-4xl'>
          Login
        </div>

        <Show when={error()}>
          <div class='border-error-700 bg-midnight-800 text-error-400 mb-5 rounded-xs border p-3 text-sm'>
            <div class='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                class='text-error-500 mr-2 h-4 w-4 flex-shrink-0'
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

              <span class='text-wrap'>{error()}</span>
            </div>
          </div>
        </Show>

        <form onSubmit={handleSubmit} class='space-y-4 sm:space-y-5'>
          <div>
            <label for='email' class='mb-1 block text-sm sm:mb-2 sm:text-base'>
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
              class='bg-midnight-900 focus:border-primary-500 focus:ring-primary-500/30 w-full rounded-xs border border-gray-700 px-3 py-2 transition-colors duration-200 focus:ring-1 focus:outline-none sm:py-2.5'
              placeholder='user@domain.com'
            />
          </div>

          <div>
            <div class='mb-1 flex justify-between sm:mb-2'>
              <label for='password' class='block text-sm sm:text-base'>
                Password
              </label>

              {/* <A
                href='/forgot-password'
                class='text-xs text-teal-400 transition-colors duration-200 hover:text-teal-300 sm:text-sm'
              >
                Forgot?
              </A> */}
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
              class='bg-midnight-900 focus:border-primary-500 focus:ring-primary-500/30 w-full rounded-xs border border-gray-700 px-3 py-2 transition-colors duration-200 focus:ring-1 focus:outline-none sm:py-2.5'
              placeholder='••••••••'
            />
          </div>

          <div class='flex items-center'>
            <input
              id='remember-me'
              type='checkbox'
              class='bg-midnight-800 text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-600'
              checked={remember()}
              onChange={() => {
                setRemember(!remember());
              }}
            />
            <label
              for='remember-me'
              class='text-cybertext-400 ml-2 block text-sm'
            >
              Remember Me
            </label>
          </div>

          <button
            type='submit'
            disabled={isLoading()}
            class='bg-primary-600 hover:bg-primary-500 focus:ring-primary-500/50 border-primary-400 w-full rounded-xs border px-4 py-2 transition-all duration-200 hover:cursor-pointer focus:ring-2 focus:outline-none disabled:opacity-70 sm:py-2.5'
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

        <div class='mt-6 border-t border-gray-700 pt-4 text-center sm:mt-8 sm:pt-6'>
          <span class='text-cybertext-600 text-sm sm:text-base'>
            Need an account?
          </span>{' '}
          <A
            href='/register'
            class='text-electric-500 hover:text-electric-400 text-sm transition-colors duration-200 sm:text-base'
          >
            Register here
          </A>
        </div>
      </div>
    </div>
  );
}
