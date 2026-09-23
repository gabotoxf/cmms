import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'landing-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header
      class="sticky top-0 z-50 rounded-b-4xl"
      [class]="
        scrolled()
          ? 'bg-[#052e2b]/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      "
    >
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <a routerLink="/" class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-white text-[#044e46] flex items-center justify-center shadow-sm"
          >
            <span class="material-symbols-outlined text-[20px]">medical_services</span>
          </div>
          <div class="leading-none">
            <div
              class="font-bold tracking-tight text-white text-sm"
              style="font-family:'Montserrat',sans-serif"
            >
              BIOCMMS
            </div>
            <div
              class="text-[10px] tracking-[0.14em] uppercase text-white/50 font-medium"
              style="font-family:'Roboto',sans-serif"
            >
              Ingeniería Clínica
            </div>
          </div>
        </a>
        <nav
          class="hidden lg:flex items-center gap-7 text-sm font-medium"
          style="font-family:'Roboto',sans-serif"
        >
          <a href="#beneficios" class="text-white/60 hover:text-white transition-colors"
            >Beneficios</a
          >
          <a href="#modulos" class="text-white/60 hover:text-white transition-colors">Módulos</a>
          <a href="#caso" class="text-white/60 hover:text-white transition-colors">Caso real</a>
          <a href="#planes" class="text-white/60 hover:text-white transition-colors">Planes</a>
        </nav>
        <div class="flex items-center gap-2">
          <a
            routerLink="/login"
            class="hidden sm:inline-flex text-sm font-medium text-white/70 hover:text-white px-4 py-2"
            style="font-family:'Roboto',sans-serif"
            >Ingresar</a
          >
          <a
            routerLink="/dashboard"
            class="inline-flex items-center gap-2 bg-white text-[#042B26] hover:bg-slate-50 text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-black/20 transition-all hover:scale-[1.02]"
            style="font-family:'Montserrat',sans-serif"
          >
            Ir a la app <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>
      </div>
    </header>
  `,
})
export class LandingHeader {
  scrolled = signal(false);
  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 12);
  }
}
