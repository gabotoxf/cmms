import { Routes } from '@angular/router';
import { authGuard, rolesGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión — CMMS',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'registro',
    title: 'Solicitar acceso — CMMS',
    loadComponent: () => import('./pages/registro/registro').then(m => m.Registro)
  },
  {
    path: 'recuperar',
    title: 'Recuperar contraseña — CMMS',
    loadComponent: () => import('./pages/recuperar/recuperar').then(m => m.Recuperar)
  },
  {
    path: 'restablecer',
    title: 'Restablecer contraseña — CMMS',
    loadComponent: () => import('./pages/restablecer/restablecer').then(m => m.Restablecer)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard — CMMS',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'equipos',
        title: 'Equipos — CMMS',
        loadComponent: () => import('./pages/equipos/equipos').then(m => m.Equipos)
      },
      {
        path: 'planes',
        title: 'Planes de mantenimiento — CMMS',
        loadComponent: () => import('./pages/planes/planes').then(m => m.Planes)
      },
      {
        path: 'ordenes',
        title: 'Órdenes de trabajo — CMMS',
        loadComponent: () => import('./pages/ordenes/ordenes').then(m => m.Ordenes)
      },
      {
        path: 'reportes',
        title: 'Reportes — CMMS',
        loadComponent: () => import('./pages/reportes/reportes').then(m => m.Reportes)
      },
      {
        path: 'usuarios',
        title: 'Usuarios — CMMS',
        canActivate: [rolesGuard(['ADMIN', 'INGENIERO'])],
        loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.Usuarios)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
