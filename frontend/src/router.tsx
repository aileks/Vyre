import { RouteDefinition, Router } from '@solidjs/router';
import { lazy } from 'solid-js';

export type AppRouteDefinition = RouteDefinition & {
  protected?: boolean;
};

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const routes: AppRouteDefinition[] = [
  // Public routes
  {
    path: '/',
    component: Home,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },

  // Catch-all route for 404
  {
    path: '/*',
    component: NotFound,
  },
];

export default function AppRouter() {
  return <Router>{routes}</Router>;
}
