import { RouteDefinition, Router } from '@solidjs/router';
import { lazy } from 'solid-js';

import { AppContextProvider } from './context/AppContext';
import AppLayout from './layouts/AppLayout';

export type AppRouteDefinition = RouteDefinition & {
  protected?: boolean;
};

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Friends = lazy(() => import('./pages/Friends'));
const Channels = lazy(() => import('./pages/Channels'));

// Define routes with protection
export const routes: AppRouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/register',
    component: Register,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/app',
    component: AppLayout,
    children: [
      {
        path: '/friends',
        component: Friends,
      },
      {
        path: '/channels/:channelId',
        component: Channels,
      },
    ],
  },
  // Catch-all route for 404
  {
    path: '/*',
    component: NotFound,
  },
];

export default function AppRouter() {
  return (
    <AppContextProvider>
      <Router>{routes}</Router>
    </AppContextProvider>
  );
}
