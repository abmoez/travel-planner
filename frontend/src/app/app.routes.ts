import { Routes } from '@angular/router';
import { adminGuard, userGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'user',
    canActivate: [userGuard],
    loadComponent: () => import('./components/user-dashboard/user-dashboard.component').then(m => m.UserDashboardComponent)
  },
  {
    path: 'user/destination/:id',
    canActivate: [userGuard],
    loadComponent: () => import('./components/destination-detail/destination-detail.component').then(m => m.DestinationDetailComponent)
  },
  { path: '**', redirectTo: '/login' }
];
