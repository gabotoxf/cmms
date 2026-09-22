import { Component, Injectable, inject, signal } from '@angular/core';

export type ToastTipo = 'exito' | 'error' | 'aviso' | 'info';

export interface Toast {
  id: number;
  tipo: ToastTipo;
  titulo: string;
  detalle?: string;
  saliendo: boolean;
}

const ICONO: Record<ToastTipo, string> = {
  exito: 'check_circle',
  error: 'error',
  aviso: 'warning',
  info: 'info',
};

const ACENTO: Record<ToastTipo, string> = {
  exito: 'bg-emerald-100 text-emerald-700',
  error: 'bg-rose-100 text-rose-600',
  aviso: 'bg-amber-100 text-amber-700',
  info: 'bg-sky-100 text-sky-700',
};

const BARRA: Record<ToastTipo, string> = {
  exito: 'bg-emerald-500',
  error: 'bg-rose-500',
  aviso: 'bg-amber-500',
  info: 'bg-sky-500',
};

/** Notificaciones globales: toast.exito('Equipo guardado'). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly lista = signal<Toast[]>([]);
  private seq = 0;

  exito(titulo: string, detalle?: string): void { this.mostrar('exito', titulo, detalle); }
  error(titulo: string, detalle?: string): void { this.mostrar('error', titulo, detalle); }
  aviso(titulo: string, detalle?: string): void { this.mostrar('aviso', titulo, detalle); }
  info(titulo: string, detalle?: string): void { this.mostrar('info', titulo, detalle); }

  private mostrar(tipo: ToastTipo, titulo: string, detalle?: string): void {
    const id = ++this.seq;
    this.lista.update((l) => [...l.slice(-4), { id, tipo, titulo, detalle, saliendo: false }]);
    setTimeout(() => this.cerrar(id), tipo === 'error' ? 7000 : 5000);
  }

  cerrar(id: number): void {
    this.lista.update((l) => l.map((t) => (t.id === id ? { ...t, saliendo: true } : t)));
    setTimeout(() => this.lista.update((l) => l.filter((t) => t.id !== id)), 300);
  }
}

@Component({
  selector: 'app-toasts',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed right-4 z-[100] flex w-80 flex-col gap-2" style="top: calc(3.5rem + 0.75rem)" aria-live="polite">
      @for (t of toast.lista(); track t.id) {
        <div class="pointer-events-auto flex items-start gap-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white py-3 pl-3 pr-2 shadow-lg"
             [class.toast-in]="!t.saliendo" [class.toast-out]="t.saliendo">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full {{ acento(t.tipo) }}">
            <span class="material-symbols-outlined text-[18px]">{{ icono(t.tipo) }}</span>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800">{{ t.titulo }}</p>
            @if (t.detalle) { <p class="mt-0.5 break-words text-xs text-slate-500">{{ t.detalle }}</p> }
          </div>
          <button type="button" (click)="toast.cerrar(t.id)" aria-label="Cerrar"
            class="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
          <span class="absolute bottom-0 left-0 h-0.5 {{ barra(t.tipo) }}" [style.width.%]="100"></span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-in { position: relative; animation: toast-in .35s cubic-bezier(.21,1.02,.73,1) both; }
    .toast-out { position: relative; animation: toast-out .3s ease-in both; }
    @keyframes toast-in { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes toast-out { to { transform: translateX(110%); opacity: 0; } }
  `],
})
export class ToastsComponent {
  readonly toast = inject(ToastService);
  icono(t: ToastTipo): string { return ICONO[t]; }
  acento(t: ToastTipo): string { return ACENTO[t]; }
  barra(t: ToastTipo): string { return BARRA[t]; }
}
