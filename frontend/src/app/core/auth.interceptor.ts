import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const CLAVE_TOKEN = 'cmms_token';

/**
 * Añade el token JWT a cada request y, ante un 401, limpia la sesión
 * y manda al login. Los errores del backend (ProblemDetail) se propagan.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem(CLAVE_TOKEN);

  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        localStorage.removeItem(CLAVE_TOKEN);
        localStorage.removeItem('cmms_usuario');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
