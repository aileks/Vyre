import { A, useNavigate } from '@solidjs/router';
import { createEffect, createSignal } from 'solid-js';

import { useAuth } from '../context/authContext';
import { AuthResult, RegistrationData } from '../types';

export default function Register() {
  const [username, setUsername] = createSignal<string>('');
  const [email, setEmail] = createSignal<string>('');
  const [password, setPassword] = createSignal<string>('');
  const [passwordConfirmation, setPasswordConfirmation] =
    createSignal<string>('');
  const [error, setError] = createSignal<string>('');

  const navigate = useNavigate();
  const { isAuthenticated, isLoading, register } = useAuth();

  createEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true });
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    if (password() !== passwordConfirmation()) {
      setError('Passwords do not match');
      return;
    }

    const credentials: RegistrationData = {
      username: username(),
      displayName: username(), // using username as display_name by default
      email: email(),
      password: password(),
    };

    const res: AuthResult = await register(credentials);

    if ('error' in res) {
      setError(res.error.message!);
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div class='flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8'>
      <div class='bg-midnight-700 shadow-midnight-900/50 w-full max-w-md rounded-xs border border-gray-700 p-5 shadow-lg sm:p-7'>
        <div class='mb-4 text-2xl font-bold tracking-wide text-pink-400 sm:text-4xl'>
          Register
        </div>
        <div style='position: fixed; bottom: 10px; right: 10px; background: #333; color: white; padding: 5px;'>
          Error state: {error() ? `"${error()}"` : 'none'}
        </div>

        {/* TODO: Use Show component here */}
        {error() && (
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
        )}

        <form onSubmit={handleSubmit} class='space-y-3 sm:space-y-4'>
          <div>
            <label
              for='name'
              class='text-cybertext-300 mb-1 block text-sm sm:mb-2 sm:text-base'
            >
              Username
            </label>
            <input
              id='name'
              name='name'
              type='text'
              autocomplete='name'
              required
              value={username()}
              onInput={(e: InputEvent) =>
                setUsername((e.target as HTMLInputElement).value)
              }
              class='bg-midnight-900 text-cybertext-100 w-full rounded-xs border border-gray-700 px-3 py-2 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none sm:py-2.5'
              placeholder='user'
            />
          </div>

          <div>
            <label
              for='email'
              class='text-cybertext-300 mb-1 block text-sm sm:mb-2 sm:text-base'
            >
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
              class='bg-midnight-900 text-cybertext-100 w-full rounded-xs border border-gray-700 px-3 py-2 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none sm:py-2.5'
              placeholder='user@domain.com'
            />
          </div>

          <div>
            <label
              for='password'
              class='text-cybertext-300 mb-1 block text-sm sm:mb-2 sm:text-base'
            >
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autocomplete='new-password'
              required
              value={password()}
              onInput={(e: InputEvent) =>
                setPassword((e.target as HTMLInputElement).value)
              }
              class='bg-midnight-900 text-cybertext-100 w-full rounded-xs border border-gray-700 px-3 py-2 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none sm:py-2.5'
              placeholder='••••••••'
            />
            <div class='mt-1 text-xs text-gray-400'>Minimum 8 characters</div>
          </div>

          <div>
            <label
              for='password_confirmation'
              class='text-cybertext-300 mb-1 block text-sm sm:mb-2 sm:text-base'
            >
              Confirm Password
            </label>
            <input
              id='password_confirmation'
              name='password_confirmation'
              type='password'
              autocomplete='new-password'
              required
              value={passwordConfirmation()}
              onInput={(e: InputEvent) =>
                setPasswordConfirmation((e.target as HTMLInputElement).value)
              }
              class='bg-midnight-900 text-cybertext-100 w-full rounded-xs border border-gray-700 px-3 py-2 transition-colors duration-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 focus:outline-none sm:py-2.5'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading()}
            class='text-cybertext-100 mt-4 w-full rounded-xs border border-pink-400 bg-pink-600 px-4 py-2 transition-all duration-200 hover:cursor-pointer hover:bg-pink-500 focus:ring-2 focus:ring-pink-500/50 focus:outline-none disabled:opacity-70 sm:mt-6 sm:py-2.5'
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
                Registering...
              </span>
            : 'Register'}
          </button>
        </form>

        <div class='mt-6 border-t border-gray-700 pt-4 text-center sm:mt-8 sm:pt-6'>
          <span class='text-cybertext-500 text-sm sm:text-base'>
            Already have an account?
          </span>{' '}
          <A
            href='/login'
            class='text-sm text-teal-400 transition-colors duration-200 hover:text-teal-300 sm:text-base'
          >
            Log in here
          </A>
        </div>
      </div>
    </div>
  );
}
