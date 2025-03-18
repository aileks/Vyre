import { Suspense } from 'solid-js';

import SpinnerFallback from './components/SpinnerFallback';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router';

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<SpinnerFallback />}>
        <AppRouter />
      </Suspense>
    </AuthProvider>
  );
}
