import { Component, EventEmitter, Input, Output, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../shared/ui/toast';
import { UiAvatarDrop } from '../shared/ui/avatar-drop';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, UiAvatarDrop],
  template: `
    <header class="flex h-14 w-full items-center gap-3 border-b border-slate-200 bg-white px-4 text-sm">

      <!-- Marca / breadcrumb de módulo -->
      <div class="flex items-center gap-2 whitespace-nowrap">
        <span class="font-bold text-slate-900">CMMS</span>
        <span class="text-slate-300">/</span>
        <span class="text-slate-500">{{ seccion }}</span>
      </div>

      <span class="h-5 w-px bg-slate-200"></span>

      <!-- Sede activa -->
      <div class="flex items-center gap-2 whitespace-nowrap">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" class="text-slate-400">
          <rect x="4" y="3" width="16" height="18" rx="1" />
          <path d="M9 21v-4h6v4M9 9h1M14 9h1M9 13h1M14 13h1" />
        </svg>
        <span class="font-semibold text-slate-800">{{ sede }}</span>
        <span class="text-slate-300">•</span>
        <span class="text-slate-500">{{ subsede }}</span>
      </div>

      <!-- Badge de equipos activos -->
      <span class="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-slate-600">
        <span class="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
        {{ equiposActivos }} Equipos Activos
      </span>

      <!-- Usuario con menú desplegable -->
      <div class="relative ml-auto group">
        <button type="button" class="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-slate-50" aria-haspopup="menu">
          <div class="text-right leading-tight">
            <div class="font-semibold text-slate-800">{{ usuario }}</div>
            <div class="text-[11px] font-semibold uppercase tracking-wide text-teal-700">{{ rol }}</div>
          </div>
          @if (auth.avatarUrl(); as url) {
            <img [src]="url" alt="Avatar" class="h-9 w-9 rounded-full object-cover ring-2 ring-teal-100" />
          } @else {
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white" style="font-family:'Montserrat',sans-serif">
              {{ iniciales() }}
            </div>
          }
        </button>

        <div class="invisible absolute right-0 top-full z-50 w-60 translate-y-1 pt-1 opacity-0 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100" role="menu">
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <div class="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              @if (auth.avatarUrl(); as url) {
                <img [src]="url" alt="Avatar" class="h-10 w-10 shrink-0 rounded-full object-cover" />
              } @else {
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white" style="font-family:'Montserrat',sans-serif">
                  {{ iniciales() }}
                </div>
              }
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-slate-800">{{ usuario }}</div>
                <div class="truncate text-xs text-slate-500">{{ email }}</div>
                <div class="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-700">{{ rol }}</div>
              </div>
            </div>
            <button type="button" (click)="abrirPerfil()"
              class="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
              <span class="material-symbols-outlined text-[18px] text-slate-400">manage_accounts</span>
              Editar perfil
            </button>
            <button type="button" (click)="abrirSalir()"
              class="flex w-full items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Modal: editar perfil -->
    @if (perfilAbierto()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" (click)="cerrarPerfil()">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between px-6 pt-5">
            <div>
              <h3 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Editar perfil</h3>
              <p class="mt-0.5 text-xs text-slate-500">Tu foto y tus datos se ven en toda la app.</p>
            </div>
            <button type="button" (click)="cerrarPerfil()" aria-label="Cerrar"
              class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="flex flex-col items-center gap-1 px-6 pt-3">
            <ui-avatar-drop #dz [actualUrl]="auth.avatarUrl()" [iniciales]="iniciales()" />
            <p class="text-[11px] text-slate-400">Clic en la cámara o arrastra una imagen · se optimiza si supera 2 MB</p>
            <div class="flex items-center gap-2">
              @if (dz.vista()) {
                <button type="button" (click)="dz.quitar()" class="text-[11px] font-medium text-rose-600 hover:underline">Quitar foto</button>
              }
            </div>
            @if (dz.errorMsg()) { <p class="text-xs text-rose-600">{{ dz.errorMsg() }}</p> }
          </div>
          <div class="grid gap-4 px-6 py-4">
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Nombre *
                <input [(ngModel)]="formNombre" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
              </label>
              <label class="grid gap-1 text-xs font-medium text-slate-600">Apellido *
                <input [(ngModel)]="formApellido" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Celular
                <input [(ngModel)]="formCelular" inputmode="tel" placeholder="300 000 0000"
                  class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
              </label>
              <div class="grid gap-1 text-xs font-medium text-slate-600">Correo
                <div class="flex h-9 items-center gap-1.5 rounded-sm border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400">
                  <span class="material-symbols-outlined text-[15px]">lock</span>
                  <span class="truncate">{{ email }}</span>
                </div>
              </div>
            </div>
            <div class="rounded-lg bg-slate-50 p-3">
              <p class="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cambiar contraseña</p>
              <div class="grid grid-cols-2 gap-3">
                <label class="grid gap-1 text-xs font-medium text-slate-600">Actual
                  <input [(ngModel)]="formActual" type="password" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
                </label>
                <label class="grid gap-1 text-xs font-medium text-slate-600">Nueva
                  <input [(ngModel)]="formNueva" type="password" placeholder="Mín. 8 caracteres"
                    class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
                </label>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button type="button" (click)="cerrarPerfil()" class="rounded border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">Cancelar</button>
            <button type="button" (click)="guardarPerfil()" [disabled]="guardando()" class="rounded bg-[#044e46] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-900 disabled:opacity-50">
              {{ guardando() ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal: confirmar cierre de sesión -->
    @if (salirAbierto()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4" (click)="cerrarSalir()">
        <div class="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-6 text-center shadow-xl" (click)="$event.stopPropagation()">
          <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <span class="material-symbols-outlined text-[20px]">logout</span>
          </div>
          <h3 class="text-sm font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">¿Cerrar sesión?</h3>
          <p class="mb-4 mt-1 text-xs text-slate-500">Tendrás que volver a iniciar sesión para continuar.</p>
          <div class="flex justify-center gap-2">
            <button type="button" (click)="cerrarSalir()" class="rounded border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">Cancelar</button>
            <button type="button" (click)="confirmarSalir()" class="rounded bg-[#044e46] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-900">Cerrar sesión</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class Topbar {
  readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly dz = viewChild(UiAvatarDrop);

  @Input() seccion = 'Gestión Operativa';
  @Input() sede = 'Clínica San Rafael';
  @Input() subsede = 'Sede Principal';
  @Input() equiposActivos = 0;
  @Input() usuario = '';
  @Input() email = '';
  @Input() rol = '';
  @Input() nombre = '';
  @Input() apellido = '';
  @Input() celular: string | null = null;

  @Output() salir = new EventEmitter<void>();

  readonly perfilAbierto = signal(false);
  readonly salirAbierto = signal(false);
  readonly guardando = signal(false);
  formNombre = '';
  formApellido = '';
  formCelular = '';
  formActual = '';
  formNueva = '';

  constructor() {
    this.auth.cargarMiAvatar();
  }

  iniciales(): string {
    const n = (this.nombre || this.usuario).trim();
    const a = (this.apellido || this.usuario.split(' ').slice(1).join(' ')).trim();
    return ((n[0] ?? '') + (a ? a[0]! : '')).toUpperCase() || '?';
  }

  abrirPerfil(): void {
    this.formNombre = this.nombre || (this.usuario.split(' ')[0] ?? '');
    this.formApellido = this.apellido || this.usuario.split(' ').slice(1).join(' ');
    this.formCelular = this.celular ?? '';
    this.formActual = '';
    this.formNueva = '';
    this.dz()?.reiniciar();
    this.perfilAbierto.set(true);
  }
  cerrarPerfil(): void { this.perfilAbierto.set(false); }

  guardarPerfil(): void {
    if (!this.formNombre.trim() || !this.formApellido.trim()) {
      this.toast.error('Faltan datos', 'El nombre y el apellido son obligatorios');
      return;
    }
    if (this.formNueva && this.formNueva.length < 8) {
      this.toast.error('Contraseña muy corta', 'La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    const dz = this.dz();
    if (dz?.errorMsg()) {
      this.toast.error('Revisa la foto', dz.errorMsg()!);
      return;
    }
    this.guardando.set(true);
    this.auth.actualizarPerfil({
      nombre: this.formNombre.trim(),
      apellido: this.formApellido.trim(),
      celular: this.formCelular.trim() || undefined,
      passwordActual: this.formActual || undefined,
      passwordNueva: this.formNueva || undefined,
    }).subscribe({
      next: () => this.guardarAvatar(),
      error: (e: unknown) => {
        const x = e as { error?: { detail?: string; message?: string } };
        this.toast.error('No se pudo guardar', x?.error?.detail ?? x?.error?.message ?? 'Inténtalo de nuevo');
        this.guardando.set(false);
      },
    });
  }

  private guardarAvatar(): void {
    const dz = this.dz();
    const done = () => {
      this.guardando.set(false);
      this.cerrarPerfil();
      this.toast.exito('Perfil actualizado');
    };
    const f = dz?.archivo() ?? null;
    if (f) {
      this.auth.subirMiAvatar(f).subscribe({ next: done, error: (e) => this.avatarError(e) });
    } else if (dz?.quitarMarcado() && this.auth.avatarUrl()) {
      this.auth.quitarMiAvatar().subscribe({ next: done, error: (e) => this.avatarError(e) });
    } else {
      done();
    }
  }

  private avatarError(e?: unknown): void {
    const status = (e as { status?: number })?.status;
    this.toast.error('Foto no guardada', `El perfil se guardó, pero la foto falló${status !== undefined ? ` (HTTP ${status})` : ' (sin respuesta del servidor)'}`);
    this.guardando.set(false);
  }

  abrirSalir(): void { this.salirAbierto.set(true); }
  cerrarSalir(): void { this.salirAbierto.set(false); }
  confirmarSalir(): void {
    this.cerrarSalir();
    this.salir.emit();
  }
}
