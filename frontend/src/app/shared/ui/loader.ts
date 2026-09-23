import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/loading.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  template: `
    @if (loading.visible()) {
      <div class="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent">
        <div class="h-full w-full animate-loader bg-[#044e46]"></div>
      </div>
      <div class="pointer-events-none fixed inset-0 z-[99] flex items-start justify-center pt-[64px]" aria-live="polite" aria-busy="true">
        <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-lg">
          <span class="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-[#044e46]"></span>
          Cargando…
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes loader-slide { 0% { transform: translateX(-100%); } 50% { transform: translateX(0); } 100% { transform: translateX(100%); } }
    .animate-loader { animation: loader-slide 1.2s ease-in-out infinite; }
  `]
})
export class Loader {
  readonly loading = inject(LoadingService);
}
