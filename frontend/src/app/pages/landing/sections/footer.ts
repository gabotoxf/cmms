import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <footer class="relative overflow-hidden bg-[#052e2b] text-white border-t border-white/5">
    <!-- gradientes coherentes con hero -->
    <div class="absolute inset-0 bg-[radial-gradient(800px_400px_at_85%_0%,#0a645a_0%,transparent_60%),radial-gradient(600px_400px_at_0%_100%,#b08d57_0%,transparent_70%)] opacity-25 pointer-events-none"></div>
    <div class="absolute -left-32 -bottom-32 w-[520px] h-[520px] rounded-full border border-white/5 pointer-events-none"></div>
    <div class="absolute -left-32 -bottom-32 w-[380px] h-[380px] rounded-full border border-white/[0.03] translate-x-6 translate-y-6 pointer-events-none"></div>

    <div class="relative max-w-7xl mx-auto px-6 pt-12 pb-6">
      <!-- top grid -->
      <div class="grid lg:grid-cols-12 gap-10 pb-10 border-b border-white/5">
        <div class="lg:col-span-5">
          <a routerLink="/" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white text-[#052e2b] flex items-center justify-center shadow-lg">
              <span class="material-symbols-outlined text-[22px]">medical_services</span>
            </div>
            <div class="leading-none">
              <div class="font-bold tracking-tight text-white text-[15px]" style="font-family:'Montserrat',sans-serif">BIOCMMS</div>
              <div class="text-[10px] tracking-[0.14em] uppercase text-white/40 font-medium" style="font-family:'Roboto',sans-serif">Ingeniería Clínica · Res.3100</div>
            </div>
          </a>
          <p class="text-[13px] leading-relaxed text-white/60 mt-4 max-w-sm" style="font-family:'Roboto',sans-serif">
            No es otro inventario. Es custodia legal: cada equipo foliado, firmado y con SHA-256. INVIMA y Secretaría ven el libro, no tu Excel.
          </p>
          <div class="flex items-center gap-2 mt-5">
            <span class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70" style="font-family:'JetBrains Mono',monospace"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> PDF SHA-256</span>
            <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70" style="font-family:'JetBrains Mono',monospace">ONAC · ECDSA</span>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="text-[11px] font-bold tracking-[0.14em] uppercase text-white/90" style="font-family:'Montserrat',sans-serif">Plataforma</div>
          <div class="mt-4 grid gap-2.5 text-[13px] text-white/60" style="font-family:'Roboto',sans-serif">
            <a href="#beneficios" class="hover:text-white transition-colors">Beneficios</a>
            <a href="#modulos" class="hover:text-white transition-colors">Módulos</a>
            <a href="#caso" class="hover:text-white transition-colors">Caso San Rafael</a>
            <a href="#planes" class="hover:text-white transition-colors">Planes</a>
          </div>
        </div>

        <div class="lg:col-span-2">
          <div class="text-[11px] font-bold tracking-[0.14em] uppercase text-white/90" style="font-family:'Montserrat',sans-serif">Producto</div>
          <div class="mt-4 grid gap-2.5 text-[13px] text-white/60" style="font-family:'Roboto',sans-serif">
            <a routerLink="/dashboard" class="inline-flex items-center gap-1 text-white font-semibold hover:text-[#7ff0e0] transition-colors">Ir a la app <span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>
            <a routerLink="/login" class="hover:text-white transition-colors">Ingresar</a>
            <span class="text-white/30">Auditoría en 30s</span>
          </div>
        </div>

        <div class="lg:col-span-3">
          <div class="text-[11px] font-bold tracking-[0.14em] uppercase text-white/90" style="font-family:'Montserrat',sans-serif">Soporte</div>
          <div class="mt-4 grid gap-3 text-[13px]" style="font-family:'Roboto',sans-serif">
            <a href="mailto:soporte@cmmsbiomedico.co" class="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"><span class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">mail</span></span> soporte@cmmsbiomedico.co</a>
            <span class="inline-flex items-center gap-2 text-white/60"><span class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">call</span></span> +57 (601) 390-4420</span>
            <span class="inline-flex items-center gap-2 text-white/40 text-xs"><span class="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center"><span class="material-symbols-outlined text-[14px]">location_on</span></span> Bogotá · Colombia</span>
          </div>
        </div>
      </div>

      <!-- bottom bar -->
      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/35" style="font-family:'Roboto',sans-serif">
        <span>© 2026 BIOCMMS · Ingeniería Clínica · Colombia</span>
        <div class="flex items-center gap-3">
          <span class="hidden sm:inline">Montserrat / Roboto / JetBrains Mono</span>
          <span class="w-1 h-1 rounded-full bg-white/20 hidden sm:inline"></span>
          <span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> 99.8% aprobación</span>
        </div>
      </div>
    </div>
  </footer>
  `,
})
export class LandingFooter {}
