import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/login/login').then((module) => module.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/ui/dashboard').then((module) => module.Dashboard),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/ui/register').then((module) => module.Register),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
