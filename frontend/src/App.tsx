import { Suspense, createEffect } from 'solid-js';

import SpinnerFallback from './components/SpinnerFallback';
import { AuthProvider } from './context/authContext';
import AppRouter from './router';
import { setupSession } from './stores/authStore';

export default function App() {
  createEffect(() => {
    setupSession();
  });

  return (
    <AuthProvider>
      <Suspense fallback={<SpinnerFallback />}>
        <AppRouter />
      </Suspense>
    </AuthProvider>
  );
}
