import { A } from '@solidjs/router';

import { state } from '../stores/authStore';

export default function Nav() {
  const { user } = state;

  return (
    <nav>
      <ul>
        <li>
          <A href='/'>Home</A>
        </li>

        {user ?
          <li>
            <A href='/logout'>Logout</A>
          </li>
        : <li>
            <A href='/login'>Login</A>
          </li>
        }
      </ul>
    </nav>
  );
}
