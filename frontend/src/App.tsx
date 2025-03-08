import { Suspense } from 'solid-js';

import AppRouter from './router';

export default function App() {
  return (
    <Suspense
      fallback={
        <div class='bg-cream-100 dark:bg-navy-900 flex min-h-screen items-center justify-center'>
          <div class='border-accent-600 dark:border-accent-400 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent dark:border-t-transparent'></div>
        </div>
      }
    >
      <AppRouter />
    </Suspense>
  );
}
