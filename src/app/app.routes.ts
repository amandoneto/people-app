import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/login/login').then((module) => module.Login),
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
