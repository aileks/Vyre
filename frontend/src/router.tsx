import { RouteDefinition, Router } from '@solidjs/router';
import { Component, ParentProps, lazy } from 'solid-js';

export type AppRouteDefinition = RouteDefinition & {
  protected?: boolean;
};

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Servers = lazy(() => import('./pages/Servers/Servers'));
const Server = lazy(() => import('./pages/Servers/Server'));

const Layout: Component<ParentProps> = props => {
  return <>{props.children}</>;
};

export const routes: AppRouteDefinition[] = [
  // Public routes
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
    path: '/servers',
    children: [
      {
        path: '/',
        component: Servers,
      },
      {
        path: '/:id',
        component: Server,
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
  return <Router root={Layout}>{routes}</Router>;
}
