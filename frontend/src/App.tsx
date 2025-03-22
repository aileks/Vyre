import { Suspense } from 'solid-js';

import SpinnerFallback from './components/SpinnerFallback';
import { AppContextProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router';

export default function App() {
  return (
    <AppContextProvider>
      <AuthProvider>
        <Suspense fallback={<SpinnerFallback />}>
          <AppRouter />
        </Suspense>
      </AuthProvider>
    </AppContextProvider>
  );
}
