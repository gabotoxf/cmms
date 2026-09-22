import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-cta',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="max-w-7xl mx-auto px-6 pb-12">
    <div class="relative overflow-hidden bg-[#042B26] rounded-[1.5rem] p-8 lg:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6 border border-white/10">
      <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div class="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#00C9A7]/20 blur-3xl"></div>
      <div class="relative">
        <div class="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#7ff0e0]" style="font-family:'Roboto',sans-serif"><span class="w-2 h-2 rounded-full bg-[#7ff0e0] animate-pulse"></span> Respaldo inmediato</div>
        <h2 class="text-2xl lg:text-3xl font-bold tracking-tight mt-2" style="font-family:'Montserrat',sans-serif">Deja la auditoría lista en una tarde.</h2>
        <p class="text-sm text-white/70 mt-1" style="font-family:'Roboto',sans-serif">Migramos tu inventario. Entras al panel y sigues — sin maquetas.</p>
      </div>
      <div class="relative flex flex-col sm:flex-row gap-3 shrink-0">
        <a routerLink="/dashboard" class="inline-flex items-center justify-center gap-2 bg-white text-[#042B26] hover:bg-slate-50 text-sm font-bold px-7 py-3.5 rounded-full shadow-xl hover:scale-[1.02] transition-all" style="font-family:'Montserrat',sans-serif">Ir a la app <span class="material-symbols-outlined">arrow_forward</span></a>
        <a href="mailto:soporte@cmmsbiomedico.co" class="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-6 py-3.5 rounded-full backdrop-blur" style="font-family:'Roboto',sans-serif">soporte@cmmsbiomedico.co</a>
      </div>
    </div>
  </section>
  `,
})
export class LandingCta {}
