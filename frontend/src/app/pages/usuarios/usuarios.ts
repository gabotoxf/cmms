import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiAvatarDrop } from '../../shared/ui/avatar-drop';
import { UiBadge } from '../../shared/ui/badge';
import { UiButton } from '../../shared/ui/button';
import { UiCard } from '../../shared/ui/card';
import { UiInput, UiLabel } from '../../shared/ui/field';
import { ToastService } from '../../shared/ui/toast';
import { UsuariosService } from '../../core/api.services';
import { AuthService, type RolUsuario } from '../../core/auth.service';
import type { Usuario } from '../../core/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, UiAvatarDrop, UiBadge, UiButton, UiCard, UiInput, UiLabel],
  template: `
    <h2 class="mb-4 text-xl font-semibold">Usuarios</h2>
    <ui-card>
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Filtrar por rol<select ui-input [(ngModel)]="fRol"><option value="">Todos</option><option>ADMIN</option><option>INGENIERO</option><option>TECNICO</option><option>AUDITOR</option></select></label>
        <button ui-btn size="sm" (click)="cargar()">Filtrar</button>
      </div>
    </ui-card>
    <ui-card class="mt-3 block">
      <div class="overflow-x-auto rounded-md border border-border">
        <table class="w-full text-sm">
          <thead class="[&_tr]:border-b"><tr class="border-b"><th class="h-10 px-4 text-left font-medium text-muted-foreground">Nombre</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Celular</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Email</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Rol</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Estado</th>@if (esAdmin()) { <th class="h-10 px-4 text-left font-medium text-muted-foreground">Acciones</th> }</tr></thead>
          <tbody class="[&_tr:last-child]:border-0">
            @for (u of usuarios(); track u.id) {
              <tr class="border-b">
                <td class="p-2 px-4">{{ u.nombre }} {{ u.apellido }}</td>
                <td class="p-2 px-4">{{ u.celular ?? '—' }}</td>
                <td class="p-2 px-4">{{ u.email }}</td>
                <td class="p-2 px-4"><ui-badge>{{ u.rol }}</ui-badge></td>
                <td class="p-2 px-4"><ui-badge [variant]="u.activo ? 'success' : 'secondary'">{{ u.activo ? 'Activo' : 'Inactivo' }}</ui-badge></td>
                @if (esAdmin()) { <td class="p-2 px-4"><button ui-btn variant="secondary" size="sm" (click)="abrirEdicion(u)">Editar</button></td> }
              </tr>
            }
            @empty { <tr><td colspan="6" class="p-4 text-muted-foreground">Sin usuarios o sin permiso (solo ADMIN/INGENIERO).</td></tr> }
          </tbody>
        </table>
      </div>
    </ui-card>
    @if (esAdmin()) {
    <ui-card title="Registrar usuario (solo ADMIN)" class="mt-3 block">
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Nombre<input ui-input [(ngModel)]="nuevo.nombre" /></label>
        <label ui-label>Apellido<input ui-input [(ngModel)]="nuevo.apellido" /></label>
        <label ui-label>Celular<input ui-input [(ngModel)]="nuevo.celular" /></label>
        <label ui-label>Email<input ui-input [(ngModel)]="nuevo.email" /></label>
        <label ui-label>Contraseña<input ui-input type="password" [(ngModel)]="nuevo.password" /></label>
        <label ui-label>Rol<select ui-input [(ngModel)]="nuevo.rol"><option>ADMIN</option><option>INGENIERO</option><option>TECNICO</option><option>AUDITOR</option></select></label>
        <button ui-btn size="sm" (click)="registrar()">Registrar</button>
      </div>
    </ui-card>
    }

    <!-- Modal admin: edición total -->
    @if (editando(); as e) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" (click)="cerrarEdicion()">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between px-6 pt-5">
            <div>
              <h3 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Editar usuario</h3>
              <p class="mt-0.5 truncate text-xs text-slate-500">{{ e.email }}</p>
            </div>
            <button type="button" (click)="cerrarEdicion()" aria-label="Cerrar"
              class="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="flex flex-col items-center gap-1 px-6 pt-3">
            <ui-avatar-drop #dzEdit [actualUrl]="editAvatar()" [iniciales]="inicialesDe(editNombre, editApellido)" />
            <p class="text-[11px] text-slate-400">Clic en la cámara o arrastra una imagen · se optimiza si supera 2 MB</p>
            @if (dzEdit.vista()) {
              <button type="button" (click)="dzEdit.quitar()" class="text-[11px] font-medium text-rose-600 hover:underline">Quitar foto</button>
            }
            @if (dzEdit.errorMsg()) { <p class="text-xs text-rose-600">{{ dzEdit.errorMsg() }}</p> }
          </div>
          <div class="grid gap-4 px-6 py-4">
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Nombre*
                <input [(ngModel)]="editNombre" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
              </label>
              <label class="grid gap-1 text-xs font-medium text-slate-600">Apellido*
                <input [(ngModel)]="editApellido" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Celular
                <input [(ngModel)]="editCelular" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
              </label>
              <label class="grid gap-1 text-xs font-medium text-slate-600">Rol
                <select [(ngModel)]="editRol" class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700">
                  <option>ADMIN</option><option>INGENIERO</option><option>TECNICO</option><option>AUDITOR</option>
                </select>
              </label>
            </div>
            <div class="grid grid-cols-2 items-end gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Nueva contraseña <span class="font-normal text-slate-400">(opcional)</span>
                <input [(ngModel)]="editPassword" type="password" placeholder="Mín. 8 caracteres"
                  class="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-700" />
              </label>
              <label class="flex h-9 cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input type="checkbox" [(ngModel)]="editActivo" class="h-4 w-4 accent-teal-700" /> Usuario activo
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button type="button" (click)="cerrarEdicion()" class="rounded border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">Cancelar</button>
            <button type="button" (click)="guardarEdicion()" [disabled]="editGuardando()" class="rounded bg-[#044e46] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-900 disabled:opacity-50">
              {{ editGuardando() ? 'Guardando…' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class Usuarios {
  private readonly api = inject(UsuariosService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly dzEdit = viewChild(UiAvatarDrop);
  readonly usuarios = signal<Usuario[]>([]);
  fRol = '';
  nuevo: { nombre: string; apellido: string; celular: string; email: string; password: string; rol: RolUsuario } = { nombre: '', apellido: '', celular: '', email: '', password: '', rol: 'TECNICO' };

  readonly editando = signal<Usuario | null>(null);
  readonly editGuardando = signal(false);
  readonly editAvatar = signal<string | null>(null);
  editNombre = '';
  editApellido = '';
  editCelular = '';
  editRol: RolUsuario = 'TECNICO';
  editActivo = true;
  editPassword = '';

  constructor() { this.cargar(); }
  esAdmin(): boolean { return this.auth.rol() === 'ADMIN'; }
  msg(e: unknown): string {
    const x = e as { error?: { detail?: string; message?: string } };
    return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida';
  }
  cargar(): void {
    this.api.listar(this.fRol || undefined).subscribe({
      next: (u) => this.usuarios.set(u),
      error: (e) => this.toast.error('No se pudo cargar', this.msg(e)),
    });
  }
  registrar(): void {
    this.auth.registrar({ ...this.nuevo, celular: this.nuevo.celular || undefined }).subscribe({
      next: () => { this.toast.exito('Usuario registrado'); this.cargar(); },
      error: (e) => this.toast.error('No se pudo registrar', this.msg(e)),
    });
  }

  inicialesDe(n: string, a: string): string {
    return ((n.trim()[0] ?? '') + (a.trim()[0] ?? '')).toUpperCase() || '?';
  }

  abrirEdicion(u: Usuario): void {
    this.editando.set(u);
    this.editNombre = u.nombre;
    this.editApellido = u.apellido ?? '';
    this.editCelular = u.celular ?? '';
    this.editRol = u.rol;
    this.editActivo = u.activo;
    this.editPassword = '';
    this.dzEdit()?.reiniciar();
    this.fijarAvatarExistente(null);
    this.api.avatarDe(u.id).subscribe({
      next: (b) => { if (b && b.size > 0) this.fijarAvatarExistente(URL.createObjectURL(b)); },
    });
  }

  private fijarAvatarExistente(url: string | null): void {
    const actual = this.editAvatar();
    if (actual) URL.revokeObjectURL(actual);
    this.editAvatar.set(url);
  }

  cerrarEdicion(): void {
    this.fijarAvatarExistente(null);
    this.editando.set(null);
  }

  guardarEdicion(): void {
    const u = this.editando();
    if (!u) return;
    if (!this.editNombre.trim() || !this.editApellido.trim()) {
      this.toast.error('Faltan datos', 'El nombre y el apellido son obligatorios');
      return;
    }
    if (this.editPassword && this.editPassword.length < 8) {
      this.toast.error('Contraseña muy corta', 'Mínimo 8 caracteres');
      return;
    }
    const dz = this.dzEdit();
    if (dz?.errorMsg()) {
      this.toast.error('Revisa la foto', dz.errorMsg()!);
      return;
    }
    this.editGuardando.set(true);
    this.api.actualizar(u.id, {
      nombre: this.editNombre.trim(),
      apellido: this.editApellido.trim(),
      celular: this.editCelular.trim() || undefined,
      rol: this.editRol,
      activo: this.editActivo,
      passwordNueva: this.editPassword || undefined,
    }).subscribe({
      next: () => {
        const f = dz?.archivo() ?? null;
        if (f) {
          this.api.subirAvatarDe(u.id, f).subscribe({
            next: () => this.finEdicion(),
            error: (er) => { this.toast.error('Avatar no guardado', `El usuario se guardó, pero la foto falló${(er as { status?: number })?.status !== undefined ? ` (HTTP ${(er as { status?: number }).status})` : ''}`); this.editGuardando.set(false); },
          });
        } else {
          this.finEdicion();
        }
      },
      error: (e) => { this.toast.error('No se pudo guardar', this.msg(e)); this.editGuardando.set(false); },
    });
  }

  private finEdicion(): void {
    this.editGuardando.set(false);
    this.cerrarEdicion();
    this.toast.exito('Usuario actualizado');
    this.cargar();
  }
}
