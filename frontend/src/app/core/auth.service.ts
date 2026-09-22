import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export type RolUsuario = 'ADMIN' | 'INGENIERO' | 'TECNICO' | 'AUDITOR';

/** Respuesta de POST /api/auth/login */
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiraEnSegundos: number;
  email: string;
  nombre: string;
  apellido: string;
  celular: string | null;
  rol: RolUsuario;
}

const CLAVE_TOKEN = 'cmms_token';
const CLAVE_USUARIO = 'cmms_usuario';

interface UsuarioEnSesion {
  email: string;
  nombre: string;
  apellido: string;
  celular: string | null;
  rol: RolUsuario;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  /** Señales reactivas de sesión (el template y los guards las leen). */
  private readonly usuarioSignal = signal<UsuarioEnSesion | null>(this.leerSesionGuardada());
  readonly usuario = computed(() => this.usuarioSignal());
  readonly estaAutenticado = computed(() => this.usuarioSignal() !== null);
  readonly rol = computed(() => this.usuarioSignal()?.rol ?? null);
  /** Nombre para mostrar en toda la app: nombre + apellido. */
  readonly nombreCompleto = computed(() => {
    const u = this.usuarioSignal();
    if (!u) return '';
    return `${u.nombre} ${u.apellido ?? ''}`.trim();
  });

  /** URL objeto del avatar propio (null = iniciales). */
  readonly avatarUrl = signal<string | null>(null);

  login(email: string, password: string) {
    return this.http.post<TokenResponse>('/api/auth/login', { email, password })
      .pipe(tap(respuesta => { this.establecerSesion(respuesta); this.cargarMiAvatar(); }));
  }

  registrar(req: { email: string; password: string; nombre: string; apellido: string; celular?: string; rol: RolUsuario }) {
    return this.http.post<TokenResponse>('/api/auth/registro', req);
  }

  actualizarPerfil(req: { nombre: string; apellido: string; celular?: string; passwordActual?: string; passwordNueva?: string }) {
    return this.http.patch<TokenResponse>('/api/auth/perfil', req)
      .pipe(tap(respuesta => this.establecerSesion(respuesta)));
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuarioSignal.set(null);
    this.fijarAvatar(null);
    this.router.navigate(['/login']);
  }

  // ===== Avatar propio =====

  cargarMiAvatar(): void {
    this.http.get('/api/auth/perfil/avatar', { responseType: 'blob' }).subscribe({
      next: (b) => this.fijarAvatar(b),
      error: () => this.fijarAvatar(null),
    });
  }

  subirMiAvatar(archivo: File) {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.put<void>('/api/auth/perfil/avatar', form)
      .pipe(tap(() => this.cargarMiAvatar()));
  }

  quitarMiAvatar() {
    return this.http.delete<void>('/api/auth/perfil/avatar')
      .pipe(tap(() => this.fijarAvatar(null)));
  }

  private fijarAvatar(b: Blob | null): void {
    const actual = this.avatarUrl();
    if (actual) URL.revokeObjectURL(actual);
    this.avatarUrl.set(b && b.size > 0 ? URL.createObjectURL(b) : null);
  }

  private establecerSesion(respuesta: TokenResponse): void {
    localStorage.setItem(CLAVE_TOKEN, respuesta.accessToken);
    const sesion: UsuarioEnSesion = {
      email: respuesta.email,
      nombre: respuesta.nombre,
      apellido: respuesta.apellido ?? '',
      celular: respuesta.celular ?? null,
      rol: respuesta.rol
    };
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(sesion));
    this.usuarioSignal.set(sesion);
  }

  private leerSesionGuardada(): UsuarioEnSesion | null {
    const token = localStorage.getItem(CLAVE_TOKEN);
    const crudo = localStorage.getItem(CLAVE_USUARIO);
    if (!token || !crudo) {
      return null;
    }
    try {
      return JSON.parse(crudo) as UsuarioEnSesion;
    } catch {
      return null;
    }
  }
}
