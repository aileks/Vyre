import { Suspense, createEffect } from 'solid-js';

import AppRouter from './router';
import { fetchSession } from './stores/authStore';

export default function App() {
  createEffect(() => {
    fetchSession();
  });

  return (
    <Suspense
      fallback={
        <div class='bg-midnight-400 flex min-h-screen items-center justify-center'>
          <div class='border-primary-600 rounded-xs-full h-10 w-10 animate-spin border-2 border-t-transparent'></div>
        </div>
      }
    >
      <AppRouter />
    </Suspense>
  );
}
