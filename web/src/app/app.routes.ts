import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ChatLayoutComponent } from './components/chat-layout.component';

const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  if (typeof window !== 'undefined' && localStorage.getItem('adminToken')) {
    return true;
  }
  if (typeof window !== 'undefined') {
    router.navigate(['/admin/login']);
  }
  return false;
};

export const routes: Routes = [
  { path: '', component: ChatLayoutComponent },
  { path: 'admin/login', loadComponent: () => import('./pages/admin/login.component').then(m => m.LoginComponent) },
  { 
    path: 'admin', 
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/admin/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'doctors', loadComponent: () => import('./pages/admin/doctors.component').then(m => m.DoctorsComponent) },
      { path: 'patients', loadComponent: () => import('./pages/admin/patients.component').then(m => m.PatientsComponent) },
      { path: 'appointments', loadComponent: () => import('./pages/admin/appointments.component').then(m => m.AppointmentsComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];