import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protege rutas privadas: sin sesión -> login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

/** Restringe una ruta a roles concretos: canActivate: [rolesGuard(['ADMIN','INGENIERO'])]. */
export const rolesGuard = (rolesPermitidos: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const rol = auth.rol();

    if (rol && rolesPermitidos.includes(rol)) {
      return true;
    }
    // Autenticado pero sin permisos: al dashboard (o login si no hay sesión)
    return router.createUrlTree(rol ? ['/dashboard'] : ['/login']);
  };
};
