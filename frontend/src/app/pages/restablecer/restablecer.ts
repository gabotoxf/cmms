import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-restablecer',
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
          <h1 class="text-3xl font-bold leading-tight tracking-tight" style="font-family:'Montserrat',sans-serif">Restablece tu<br/>contraseña</h1>
          <p class="mt-3 text-sm text-white/70 leading-relaxed max-w-md">Elige una nueva contraseña segura. El enlace expira en 30 minutos y es de un solo uso.</p>
        </div>
        <div class="relative text-xs text-white/50">© {{ year }} Clínica San Rafael • Soporte seguro</div>
      </div>

      <div class="flex-1 flex flex-col bg-slate-50">
        <div class="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div class="w-full max-w-md">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
              <div class="w-10 h-10 rounded-xl bg-[#044e46]/10 border border-[#044e46]/20 text-[#044e46] flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-[20px]">key</span>
              </div>
              <h2 class="text-xl font-bold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Nueva contraseña</h2>
              <p class="mt-1 text-sm text-slate-500">Ingresa tu nueva contraseña para <strong>{{ emailFromToken() || 'tu cuenta' }}</strong>.</p>

              @if (!token()) {
                <div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
                  <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[18px]">warning</span></span>
                  <div class="text-sm">
                    <div class="font-semibold text-amber-900">Enlace inválido</div>
                    <div class="text-xs text-amber-800 mt-0.5">El enlace no contiene token. Solicita uno nuevo desde <a routerLink="/recuperar" class="underline">Recuperar contraseña</a>.</div>
                  </div>
                </div>
              } @else {
                <div class="mt-6 grid gap-4">
                  <label class="grid gap-1.5 text-xs font-medium text-slate-700">Nueva contraseña
                    <input [(ngModel)]="password" type="password" placeholder="Mín. 8 caracteres" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" />
                  </label>
                  <label class="grid gap-1.5 text-xs font-medium text-slate-700">Confirmar contraseña
                    <input [(ngModel)]="confirmar" type="password" placeholder="Repite la contraseña" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" />
                  </label>
                  <button (click)="restablecer()" [disabled]="cargando()" class="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[#044e46] hover:bg-[#033b35] text-white text-sm font-semibold shadow-sm disabled:opacity-50 cursor-pointer">
                    @if (cargando()) { <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Guardando… } @else { <span>Restablecer contraseña</span> <span class="material-symbols-outlined text-[18px]">verified</span> }
                  </button>
                  <p class="text-center text-xs text-slate-500">
                    ¿No pediste esto? <a routerLink="/login" class="font-medium text-[#044e46] hover:text-[#033b35] cursor-pointer">Volver a iniciar sesión</a>
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Restablecer {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  password = '';
  confirmar = '';
  readonly cargando = signal(false);
  readonly year = new Date().getFullYear();
  readonly token = signal<string | null>(null);

  constructor() {
    this.route.queryParams.subscribe(p => this.token.set(p['token'] ?? null));
  }

  emailFromToken(): string {
    try {
      const t = this.token();
      if (!t) return '';
      // El token es UUID, no contiene email; lo dejamos genérico
      return '';
    } catch { return ''; }
  }

  restablecer(): void {
    if (!this.token()) { this.toast.error('Enlace inválido', 'Solicita uno nuevo'); return; }
    if (!this.password.trim() || this.password.length < 8) { this.toast.error('Contraseña muy corta', 'Mínimo 8 caracteres'); return; }
    if (this.password !== this.confirmar) { this.toast.error('No coinciden', 'Las contraseñas no coinciden'); return; }
    this.cargando.set(true);
    this.auth.restablecer(this.token()!, this.password).subscribe({
      next: () => {
        this.toast.exito('Contraseña restablecida', 'Ya puedes iniciar sesión con tu nueva contraseña');
        this.router.navigate(['/login']);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        const x = e as { error?: { detail?: string; message?: string } };
        this.toast.error('No se pudo restablecer', x?.error?.detail ?? x?.error?.message ?? 'Enlace inválido o expirado');
        this.cargando.set(false);
      },
    });
  }
}
