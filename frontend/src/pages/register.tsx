import { A } from '@solidjs/router';
import { createSignal } from 'solid-js';

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
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
  const [name, setName] = createSignal<string>('');
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
      name: name(),
      email: email(),
      password: password(),
      password_confirmation: passwordConfirmation(),
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
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
    <div class='mx-auto my-12 max-w-md rounded border border-[#333333] bg-[#1e1e1e] p-7'>
      <div class='text-accent-500 mb-3 text-2xl font-semibold'>Register</div>
      <div class='mb-6 text-gray-400'>Create a new account</div>

      {error() && <div class='text-error-500 mb-4 text-sm'>{error()}</div>}

      <form onSubmit={handleSubmit}>
        <div class='mb-4'>
          <label for='name' class='mb-2 block text-gray-300'>
            Username
          </label>
          <input
            id='name'
            name='name'
            type='text'
            autocomplete='name'
            required
            value={name()}
            onInput={(e: InputEvent) => setName((e.target as HTMLInputElement).value)}
            class='focus:border-accent-500 w-full rounded border border-[#333333] bg-[#171717] px-3 py-2 text-white focus:outline-none'
            placeholder='username'
          />
        </div>

        <div class='mb-4'>
          <label for='email' class='mb-2 block text-gray-300'>
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
            class='focus:border-accent-500 w-full rounded border border-[#333333] bg-[#171717] px-3 py-2 text-white focus:outline-none'
            placeholder='your@email.com'
          />
        </div>

        <div class='mb-4'>
          <label for='password' class='mb-2 block text-gray-300'>
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
            class='focus:border-accent-500 w-full rounded border border-[#333333] bg-[#171717] px-3 py-2 text-white focus:outline-none'
            placeholder='••••••••'
          />
        </div>

        <div class='mb-6'>
          <label for='password_confirmation' class='mb-2 block text-gray-300'>
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
            class='focus:border-accent-500 w-full rounded border border-[#333333] bg-[#171717] px-3 py-2 text-white focus:outline-none'
            placeholder='••••••••'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading()}
          class='bg-accent-500 hover:bg-accent-600 w-full rounded px-4 py-2 text-white transition-colors'
        >
          {isLoading() ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div class='mt-6 border-t border-[#333333] pt-4 text-center text-sm'>
        <span class='text-gray-400'>Already have an account?</span>{' '}
        <A href='/login' class='text-accent-400 hover:text-accent-300 underline'>
          Login here
        </A>
      </div>
    </div>
  );
}
