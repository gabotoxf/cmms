import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex w-[46%] bg-[#044e46] text-white flex-col justify-between p-10 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-[#0a645a]/40 to-transparent"></div>
        <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/5"></div>
        <div class="relative">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-white text-[#044e46] flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">medical_services</span>
            </div>
            <div>
              <div class="font-bold tracking-tight text-sm" style="font-family:'Montserrat',sans-serif">BIOCMMS</div>
              <div class="text-[10px] tracking-widest uppercase opacity-60">Ingeniería Clínica</div>
            </div>
          </div>
        </div>
        <div class="relative">
          <h1 class="text-3xl font-bold leading-tight tracking-tight" style="font-family:'Montserrat',sans-serif">Solicita acceso<br/>al parque biomédico</h1>
          <p class="mt-3 text-sm text-white/70 leading-relaxed max-w-md">El administrador validará tu Tarjeta Profesional y rol antes de habilitar tu firma digital.</p>
          <ul class="mt-6 space-y-2 text-sm text-white/80">
            <li class="flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">verified</span></span> Validación COPNIA / CONALTEL</li>
            <li class="flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">key</span></span> Certificado SHA-256 para actas</li>
            <li class="flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">shield</span></span> RBAC por rol (ADMIN/ING/TEC/AUD)</li>
          </ul>
        </div>
        <div class="relative text-xs text-white/50">© {{ year }} Clínica San Rafael • Solo personal autorizado</div>
      </div>

      <div class="flex-1 flex flex-col bg-slate-50">
        <div class="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div class="w-full max-w-lg">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
              <div class="mb-6">
                <h2 class="text-xl font-bold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Solicitar acceso</h2>
                <p class="mt-1 text-sm text-slate-500">Completa el formulario. Un ADMIN debe aprobar tu cuenta.</p>
                <p class="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">Nota: El registro directo requiere sesión ADMIN. Si no eres admin, contacta a <strong>admin@cmms.local</strong>.</p>
              </div>
              <div class="grid gap-4">
                <div class="grid grid-cols-2 gap-3">
                  <label class="grid gap-1.5 text-xs font-medium text-slate-700">Nombre* <input [(ngModel)]="nombre" placeholder="Nombre" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" /></label>
                  <label class="grid gap-1.5 text-xs font-medium text-slate-700">Apellido* <input [(ngModel)]="apellido" placeholder="Apellido" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" /></label>
                </div>
                <label class="grid gap-1.5 text-xs font-medium text-slate-700">Correo institucional* <input [(ngModel)]="email" type="email" placeholder="nombre@clinicasanrafael.com.co" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" /></label>
                <div class="grid grid-cols-2 gap-3">
                  <label class="grid gap-1.5 text-xs font-medium text-slate-700">Celular <input [(ngModel)]="celular" placeholder="300..." class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" /></label>
                  <label class="grid gap-1.5 text-xs font-medium text-slate-700">Rol solicitado* <select [(ngModel)]="rol" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46] cursor-pointer"><option>TECNICO</option><option>INGENIERO</option><option>AUDITOR</option><option>ADMIN</option></select></label>
                </div>
                <label class="grid gap-1.5 text-xs font-medium text-slate-700">Contraseña* <input [(ngModel)]="password" type="password" placeholder="Mín. 8 caracteres" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" /></label>
                <button (click)="registrar()" [disabled]="cargando()" class="mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[#044e46] hover:bg-[#033b35] text-white text-sm font-semibold shadow-sm disabled:opacity-50 cursor-pointer">
                  @if (cargando()) { <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Enviando… } @else { <span>Solicitar acceso</span> <span class="material-symbols-outlined text-[18px]">arrow_forward</span> }
                </button>
                <p class="text-center text-xs text-slate-500">¿Ya tienes cuenta? <a routerLink="/login" class="font-medium text-[#044e46] hover:text-[#033b35] cursor-pointer">Inicia sesión</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  nombre = ''; apellido = ''; email = ''; celular = ''; password = ''; rol: 'ADMIN' | 'INGENIERO' | 'TECNICO' | 'AUDITOR' = 'TECNICO';
  readonly cargando = signal(false);
  readonly year = new Date().getFullYear();

  registrar(): void {
    if (!this.nombre.trim() || !this.apellido.trim() || !this.email.trim() || !this.password.trim()) {
      this.toast.error('Faltan datos', 'Nombre, apellido, correo y contraseña son obligatorios');
      return;
    }
    if (this.password.length < 8) { this.toast.error('Contraseña muy corta', 'Mínimo 8 caracteres'); return; }
    if (!this.email.includes('@')) { this.toast.error('Correo inválido', 'Ingresa un correo válido'); return; }
    this.cargando.set(true);
    this.auth.registrar({ email: this.email.trim().toLowerCase(), password: this.password, nombre: this.nombre.trim(), apellido: this.apellido.trim(), celular: this.celular.trim() || undefined, rol: this.rol as any }).subscribe({
      next: () => { this.toast.exito('Solicitud enviada', 'Un ADMIN debe aprobar tu cuenta. Intenta iniciar sesión.'); this.router.navigate(['/login']); this.cargando.set(false); },
      error: (e: unknown) => { const x = e as { error?: { detail?: string; message?: string }; status?: number }; const msg = x?.error?.detail ?? x?.error?.message ?? (x?.status === 403 ? 'Solo un ADMIN puede registrar usuarios. Contacta a admin@cmms.local' : 'No se pudo registrar'); this.toast.error('No se pudo registrar', msg); this.cargando.set(false); },
    });
  }
}
