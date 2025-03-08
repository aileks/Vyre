import { Suspense } from 'solid-js';

import AppRouter from './router';

export default function App() {
  return (
    <Suspense
      fallback={
        <div class='bg-midnight-400 flex min-h-screen items-center justify-center'>
          <div class='border-accent-600 h-10 w-10 animate-spin rounded-full border-2 border-t-transparent'></div>
        </div>
      }
    >
      <AppRouter />
    </Suspense>
  );
}
