import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <!-- Left branding -->
      <div class="hidden lg:flex w-[46%] bg-[#044e46] text-white flex-col justify-between p-10 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-[#0a645a]/40 to-transparent"></div>
        <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-white/5"></div>
        <div class="absolute right-10 top-32 w-64 h-64 rounded-full bg-white/[0.03]"></div>
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
          <div class="inline-flex items-center gap-2 text-[11px] tracking-wider uppercase bg-white/10 border border-white/20 rounded-full px-3 py-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-300"></span> Res. 3100 de 2019 • Habilitación
          </div>
          <h1 class="mt-4 text-3xl font-bold leading-tight tracking-tight" style="font-family:'Montserrat',sans-serif">
            Gestión biomédica<br/>con trazabilidad<br/>certificada
          </h1>
          <p class="mt-3 text-sm text-white/70 leading-relaxed max-w-md">
            Inventario, planes preventivos y órdenes con firma digital SHA-256. Auditoría lista para Secretaría de Salud e INVIMA.
          </p>
          <div class="mt-8 flex items-center gap-6 text-xs">
            <div class="flex items-center gap-2"><span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">verified</span></span> <span class="opacity-80">Habilitación<br/><strong class="text-white">Vigente</strong></span></div>
            <div class="w-px h-8 bg-white/20"></div>
            <div class="flex items-center gap-2"><span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">shield</span></span> <span class="opacity-80">Custodia<br/><strong class="text-white">ECDSA P-256</strong></span></div>
          </div>
        </div>
        <div class="relative text-xs text-white/50">© {{ year }} Clínica San Rafael • BIOCMMS Colombia</div>
      </div>

      <!-- Right form -->
      <div class="flex-1 flex flex-col bg-slate-50">
        <div class="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div class="w-full max-w-md">
            <div class="lg:hidden flex items-center gap-3 mb-6">
              <div class="w-9 h-9 rounded-lg bg-[#044e46] text-white flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">medical_services</span></div>
              <div>
                <div class="font-bold text-sm" style="font-family:'Montserrat',sans-serif">BIOCMMS</div>
                <div class="text-[11px] text-slate-500">Res. 3100 de 2019</div>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
              <div class="mb-6">
                <h2 class="text-xl font-bold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Iniciar sesión</h2>
                <p class="mt-1 text-sm text-slate-500">Ingresa con tu correo institucional para continuar.</p>
              </div>

              <div class="grid gap-4">
                <label class="grid gap-1.5 text-xs font-medium text-slate-700">Correo institucional
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">mail</span>
                    <input [(ngModel)]="email" type="email" autocomplete="off" placeholder="nombre@clinicasanrafael.com.co" class="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" />
                  </div>
                </label>
                <label class="grid gap-1.5 text-xs font-medium text-slate-700">Contraseña
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">lock</span>
                    <input [(ngModel)]="password" [type]="verClave() ? 'text' : 'password'" autocomplete="new-password" placeholder="••••••••" class="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" />
                    <button type="button" (click)="verClave.set(!verClave())" class="absolute right-2 top-2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer">
                      <span class="material-symbols-outlined text-[18px]">{{ verClave() ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                </label>

                <div class="flex items-center justify-between text-xs">
                  <label class="flex items-center gap-2.5 cursor-pointer text-slate-600">
                    <button type="button" (click)="recordarme.set(!recordarme())" class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#044e46]/20" [class.bg-[#044e46]]="recordarme()" [class.bg-slate-300]="!recordarme()" [attr.aria-pressed]="recordarme()" aria-label="Recordarme">
                      <span class="pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform" [class.translate-x-5]="recordarme()" [class.translate-x-1]="!recordarme()"></span>
                    </button>
                    <span class="font-medium" [class.text-slate-900]="recordarme()" [class.text-slate-600]="!recordarme()">Recordarme</span>
                  </label>
                  <a routerLink="/recuperar" class="font-medium text-[#044e46] hover:text-[#033b35] cursor-pointer">¿Olvidaste tu contraseña?</a>
                </div>

                <button (click)="entrar()" [disabled]="cargando()" class="mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[#044e46] hover:bg-[#033b35] text-white text-sm font-semibold shadow-sm disabled:opacity-50 cursor-pointer">
                  @if (cargando()) {
                    <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Ingresando…
                  } @else {
                    <span>Entrar</span>
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  }
                </button>

                <div class="relative py-2">
                  <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
                  <div class="relative flex justify-center"><span class="bg-white px-3 text-xs text-slate-400">Demo</span></div>
                </div>

                <div class="rounded-xl bg-gradient-to-r from-[#044e46]/5 to-teal-50 border border-[#044e46]/15 p-3.5 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-[#044e46] text-white flex items-center justify-center shadow-sm">
                      <span class="material-symbols-outlined text-[18px]">science</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold tracking-wide text-[#044e46]">DEMO</span>
                        <span class="text-[11px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded">demo@cmms.com / demo123</span>
                      </div>
                      <div class="text-[11px] text-slate-500">ADMIN • Acceso total para presentaciones</div>
                    </div>
                  </div>
                  <button (click)="usarDemo()" class="px-3.5 py-1.5 rounded-lg bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold shadow-sm cursor-pointer">Usar demo</button>
                </div>

                <p class="text-center text-xs text-slate-500">
                  ¿No tienes cuenta? <a routerLink="/registro" class="font-medium text-[#044e46] hover:text-[#033b35] cursor-pointer">Solicitar acceso</a>
                </p>
              </div>
            </div>

            <p class="mt-6 text-center text-[11px] text-slate-400">Protegido con firma ECDSA P-256 + SHA-256 • Auditoría Res. 3100</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  email = '';
  password = '';
  readonly cargando = signal(false);
  readonly verClave = signal(false);
  readonly recordarme = signal(false);
  readonly year = new Date().getFullYear();

  usarDemo(): void { this.email = 'demo@cmms.com'; this.password = 'demo123'; }

  entrar(): void {
    if (!this.email.trim() || !this.password.trim()) {
      this.toast.error('Faltan datos', 'Ingresa correo y contraseña');
      return;
    }
    this.cargando.set(true);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.toast.error('No se pudo entrar', 'Credenciales inválidas');
        this.cargando.set(false);
      },
    });
  }
}
