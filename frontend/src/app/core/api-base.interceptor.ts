import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { signal } from '@angular/core';
import { catchError, finalize, switchMap, throwError, timer } from 'rxjs';
import { environment } from '../../environments/environment';

/** true mientras el backend tarda (>3s): Render gratis duerme y despierta en ~30-60s. */
export const backendWakingUp = signal(false);
let pendientes = 0;

// Base URL sale de frontend/.env (API_BASE_URL) via `npm run build`.
// Override sin recompilar: localStorage.setItem('API_BASE_URL', 'https://...')
function resolveBase(): string {
  try {
    const override = localStorage.getItem('API_BASE_URL');
    if (override !== null) return override.replace(/\/$/, '');
  } catch {}
  // en desarrollo siempre proxy local (/api -> 127.0.0.1:8080); en prod vale lo de frontend/.env
  if (typeof location !== 'undefined' &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) return '';
  return (environment.apiBaseUrl || '').replace(/\/$/, '');
}

/** Prefija /api con la URL del backend + 1 reintento ante caida/red (cold-start Render). */
export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const base = resolveBase();
  const peticion = req.url.startsWith('/api') && base ? req.clone({ url: base + req.url }) : req;
  pendientes++;
  const t = setTimeout(() => { if (pendientes > 0) backendWakingUp.set(true); }, 3000);
  const enviar = () => next(peticion);
  return enviar().pipe(
    catchError((e: unknown) => {
      // ponytail: reintento solo en caida/red, no en 4xx (clave mal = falla rapido)
      if (e instanceof HttpErrorResponse && (e.status === 0 || e.status >= 500)) {
        return timer(4000).pipe(switchMap(enviar));
      }
      return throwError(() => e);
    }),
    finalize(() => {
      clearTimeout(t);
      pendientes = Math.max(0, pendientes - 1);
      if (pendientes === 0) backendWakingUp.set(false);
    })
  );
};
