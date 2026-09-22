import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
  <footer class="border-t border-slate-200 bg-white">
    <div class="max-w-7xl mx-auto px-6 py-8 grid md:grid-cols-4 gap-8 text-xs" style="font-family:'Roboto',sans-serif">
      <div class="md:col-span-2">
        <div class="flex items-center gap-2"><div class="w-7 h-7 rounded-xl bg-[#044e46] flex items-center justify-center text-white"><span class="material-symbols-outlined text-[16px]">medical_services</span></div><span class="font-bold text-slate-900" style="font-family:'Montserrat',sans-serif">BIOCMMS</span><span class="text-slate-400">· Res.3100</span></div>
        <p class="text-slate-500 leading-relaxed mt-2 max-w-sm">Mismo sistema tipográfico del panel: Montserrat 600/700 para títulos, Roboto 400/500 para cuerpo, JetBrains Mono para códigos.</p>
      </div>
      <div>
        <div class="font-semibold text-slate-900 uppercase tracking-wider text-[11px]" style="font-family:'Montserrat',sans-serif">Plataforma</div>
        <div class="mt-2 grid gap-1.5 text-slate-500">
          <a href="#beneficios" class="hover:text-slate-700">Beneficios</a>
          <a href="#modulos" class="hover:text-slate-700">Módulos</a>
          <a routerLink="/dashboard" class="hover:text-slate-900 font-semibold">Ir a la app →</a>
        </div>
      </div>
      <div>
        <div class="font-semibold text-slate-900 uppercase tracking-wider text-[11px]" style="font-family:'Montserrat',sans-serif">Soporte</div>
        <div class="mt-2 grid gap-1.5 text-slate-500">
          <span>soporte@cmmsbiomedico.co</span>
          <span>+57 (601) 390-4420</span>
        </div>
      </div>
    </div>
    <div class="max-w-7xl mx-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500" style="font-family:'Roboto',sans-serif">
      <span>© 2025 BIOCMMS · Colombia</span>
      <span class="hidden sm:inline">Tipografía: Montserrat / Roboto / JetBrains Mono — como en el dash</span>
    </div>
  </footer>
  `,
})
export class LandingFooter {}
