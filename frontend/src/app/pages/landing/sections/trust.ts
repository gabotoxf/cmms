import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-trust',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="max-w-7xl mx-auto px-6 -mt-6 relative z-10">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3 text-xs text-slate-500" style="font-family:'Roboto',sans-serif">
        <span class="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center"><span class="material-symbols-outlined text-[16px]">shield</span></span>
        Cumple <strong class="text-slate-900" style="font-family:'Montserrat',sans-serif">Res.3100</strong> · Dec.4725 · Ley 527
      </div>
      <div class="flex items-center gap-2 text-[11px] font-medium" style="font-family:'JetBrains Mono',monospace">
        <span class="px-2.5 py-1 rounded-full bg-slate-900 text-white">PDF SHA-256</span>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">ECDSA P-256</span>
        <span class="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">ONAC/NIST</span>
      </div>
      <a routerLink="/dashboard" class="text-xs font-semibold text-[#044e46] flex items-center gap-1" style="font-family:'Montserrat',sans-serif">Entrar y comprobar <span class="material-symbols-outlined text-[14px]">arrow_forward</span></a>
    </div>
  </section>
  `,
})
export class LandingTrust {}
