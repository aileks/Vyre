import { A } from '@solidjs/router';

import { state } from '../stores/authStore';

export default function Nav() {
  const { user } = state;

  return (
    <nav class='bg-midnight-700 shadow-midnight-900/50 shadow-md'>
      <ul class='text-cybertext-200 border-primary-800 flex items-center justify-between border-b p-2 text-lg font-medium'>
        <li>
          <A
            class='text-cybertext-500 hover:text-cybertext-300 transition-all duration-100 hover:font-semibold'
            href='/'
          >
            Home
          </A>
        </li>

        <span class='flex gap-4'>
          {user ?
            <li>
              <A class='bg-primary-800 rounded-sm px-2 py-0.5' href='/logout'>
                Logout
              </A>
            </li>
          : <>
              <li>
                <A
                  class='hover:text-cybertext-400 rounded-sm bg-pink-600 px-2 py-0.5 transition-all duration-200 hover:bg-pink-500'
                  href='/register'
                >
                  Register
                </A>
              </li>

              <li>
                <A
                  class='bg-electric-600 hover:bg-electric-500 hover:text-cybertext-400 rounded-sm px-2 py-0.5 transition-all duration-200'
                  href='/login'
                >
                  Login
                </A>
              </li>
            </>
          }
        </span>
      </ul>
    </nav>
  );
}
