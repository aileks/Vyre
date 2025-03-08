import { RouteDefinition, Router } from '@solidjs/router';
import { lazy } from 'solid-js';

// Define route types with TypeScript
export type AppRouteDefinition = RouteDefinition & {
  protected?: boolean;
};

// Lazy load components for better performance
const Home = lazy(() => import('./pages/home'));
const Login = lazy(() => import('./pages/login'));
const Register = lazy(() => import('./pages/register'));
const NotFound = lazy(() => import('./pages/not_found'));

// Define routes as an array
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

// App Router component
export default function AppRouter() {
  return <Router>{routes}</Router>;
}
