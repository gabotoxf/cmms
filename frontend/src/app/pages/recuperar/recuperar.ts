import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-recuperar',
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
          <h1 class="text-3xl font-bold leading-tight tracking-tight" style="font-family:'Montserrat',sans-serif">Recupera tu<br/>acceso seguro</h1>
          <p class="mt-3 text-sm text-white/70 leading-relaxed max-w-md">Te enviaremos un enlace temporal a tu correo institucional para restablecer tu contraseña con firma auditada.</p>
          <div class="mt-6 flex items-center gap-3 text-xs text-white/80">
            <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">mail</span></span>
            <span>El enlace expira en 30 min y es de un solo uso.</span>
          </div>
        </div>
        <div class="relative text-xs text-white/50">© {{ year }} Clínica San Rafael • Soporte: soporte@clinicasanrafael.com.co</div>
      </div>

      <div class="flex-1 flex flex-col bg-slate-50">
        <div class="flex-1 flex items-center justify-center p-6 lg:p-10">
          <div class="w-full max-w-md">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
              <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-[20px]">lock_reset</span>
              </div>
              <h2 class="text-xl font-bold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Recuperar contraseña</h2>
              <p class="mt-1 text-sm text-slate-500">Ingresa tu correo institucional y te enviaremos un enlace para restablecerla.</p>

              @if (enviado()) {
                <div class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
                  <span class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[18px]">mark_email_read</span></span>
                  <div>
                    <div class="text-sm font-semibold text-emerald-900">Correo enviado</div>
                    <div class="text-xs text-emerald-800 mt-0.5">Si <strong>{{ email }}</strong> existe en el sistema, recibirás un enlace en los próximos minutos. Revisa spam si no lo ves.</div>
                    <button (click)="enviado.set(false)" class="mt-3 text-xs font-medium text-emerald-700 hover:text-emerald-900 underline cursor-pointer">Enviar a otro correo</button>
                  </div>
                </div>
                <div class="mt-6 text-center">
                  <a routerLink="/login" class="text-xs font-medium text-[#044e46] hover:text-[#033b35] cursor-pointer">← Volver a iniciar sesión</a>
                </div>
              } @else {
                <div class="mt-6 grid gap-4">
                  <label class="grid gap-1.5 text-xs font-medium text-slate-700">Correo institucional
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">mail</span>
                      <input [(ngModel)]="email" type="email" placeholder="nombre@clinicasanrafael.com.co" class="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#044e46]/20 focus:border-[#044e46]" />
                    </div>
                  </label>
                  <button (click)="enviar()" [disabled]="cargando()" class="inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[#044e46] hover:bg-[#033b35] text-white text-sm font-semibold shadow-sm disabled:opacity-50 cursor-pointer">
                    @if (cargando()) { <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Enviando… } @else { <span>Enviar enlace de recuperación</span> <span class="material-symbols-outlined text-[18px]">send</span> }
                  </button>
                  <p class="text-center text-xs text-slate-500">
                    ¿Recordaste tu contraseña? <a routerLink="/login" class="font-medium text-[#044e46] hover:text-[#033b35] cursor-pointer">Inicia sesión</a>
                  </p>
                </div>
              }
            </div>
            <p class="mt-4 text-center text-[11px] text-slate-400">El enlace es válido por 30 min y solo puede usarse una vez. Si no lo solicitaste, ignora el correo.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Recuperar {
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);
  email = '';
  readonly cargando = signal(false);
  readonly enviado = signal(false);
  readonly year = new Date().getFullYear();

  enviar(): void {
    if (!this.email.trim() || !this.email.includes('@')) {
      this.toast.error('Correo inválido', 'Ingresa un correo institucional válido');
      return;
    }
    this.cargando.set(true);
    this.auth.recuperar(this.email.trim().toLowerCase()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.enviado.set(true);
        this.toast.exito('Correo enviado', `Si ${this.email.trim().toLowerCase()} existe, recibirás un enlace`);
      },
      error: () => {
        this.cargando.set(false);
        this.enviado.set(true);
        this.toast.exito('Correo enviado', `Si ${this.email.trim().toLowerCase()} existe, recibirás un enlace`);
      },
    });
  }
}
