import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiBadge } from '../../shared/ui/badge';
import { UiButton } from '../../shared/ui/button';
import { UiCard } from '../../shared/ui/card';
import { UiInput, UiLabel } from '../../shared/ui/field';
import { PlanesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import type { Plan, RegistroEjecucion, ResumenRevision } from '../../core/models';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [FormsModule, UiBadge, UiButton, UiCard, UiInput, UiLabel],
  template: `
    <h2 class="mb-4 text-xl font-semibold">Planes de mantenimiento</h2>
    @if (rev(); as r) { <p class="mb-3 text-sm text-muted-foreground">Vencidos: <b>{{ r.vencidos }}</b> · Próximos: <b>{{ r.proximos }}</b> @if (puedeGestionar()) { <button ui-btn variant="secondary" size="sm" (click)="ejecutarRevision()">Ejecutar revisión</button> } </p> }
    <ui-card>
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Estado<select ui-input [(ngModel)]="fEstado"><option value="">Todos</option><option>VENCIDO</option><option>PROXIMO</option><option>AL_DIA</option></select></label>
        <label ui-label>Equipo ID<input ui-input type="number" [(ngModel)]="fEquipo" placeholder="opcional" /></label>
        <button ui-btn size="sm" (click)="pagina.set(0); cargar()">Filtrar</button>
      </div>
    </ui-card>
    <ui-card class="mt-3 block">
      <div class="overflow-x-auto rounded-md border border-border">
        <table class="w-full text-sm">
          <thead class="[&_tr]:border-b"><tr class="border-b"><th class="h-10 px-4 text-left font-medium text-muted-foreground">Equipo</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Próxima</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Días</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Estado</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Frec.</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Acciones</th></tr></thead>
          <tbody class="[&_tr:last-child]:border-0">
            @for (p of planes(); track p.id) {
              <tr class="border-b">
                <td class="p-2 px-4">{{ p.equipoSerial }} — {{ p.equipoNombre }}</td><td class="p-2 px-4">{{ p.proximaFecha }}</td><td class="p-2 px-4">{{ p.diasRestantes }}</td>
                <td class="p-2 px-4"><ui-badge [variant]="sev(p.estado)">{{ p.estado }}</ui-badge></td>
                <td class="p-2 px-4">{{ p.frecuenciaDias }}d</td>
                <td class="p-2 px-4"><div class="flex flex-wrap gap-1">
                  <button ui-btn variant="secondary" size="sm" (click)="ver(p)">Ver</button>
                  <button ui-btn variant="secondary" size="sm" (click)="verHistorial(p)">Historial</button>
                  @if (puedeEjecutar()) { <button ui-btn size="sm" (click)="sel.set(p)">Ejecutar</button> }
                  @if (puedeGestionar()) { <button ui-btn variant="secondary" size="sm" (click)="nuevaFrecuencia(p)">Frec.</button> }
                </div></td>
              </tr>
            } @empty { <tr><td colspan="6" class="p-4 text-muted-foreground">Sin planes.</td></tr> }
          </tbody>
        </table>
      </div>
      <div class="mt-2 flex items-center gap-2">
        <button ui-btn variant="secondary" size="sm" (click)="prev()" [disabled]="pagina()===0">← Anterior</button>
        <span class="text-sm text-muted-foreground">Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</span>
        <button ui-btn variant="secondary" size="sm" (click)="next()" [disabled]="pagina()+1>=totalPaginas()">Siguiente →</button>
      </div>
    </ui-card>
    @if (sel(); as s) {
    <ui-card [title]="'Registrar ejecución — ' + s.equipoSerial" class="mt-3 block">
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Fecha*<input ui-input type="date" [(ngModel)]="ej.fechaEjecucion" /></label>
        <label ui-label>Técnico*<input ui-input [(ngModel)]="ej.tecnico" placeholder="Nombre técnico" /></label>
        <label ui-label>Descripción<input ui-input [(ngModel)]="ej.descripcion" placeholder="opcional" /></label>
        <button ui-btn size="sm" (click)="guardarEjecucion()">Guardar</button>
        <button ui-btn variant="secondary" size="sm" (click)="sel.set(null)">Cerrar</button>
      </div>
    </ui-card>
    }
    @if (hist(); as h) {
    <ui-card [title]="'Historial plan #' + h.planId" class="mt-3 block">
      <ul class="grid gap-1 text-sm">@for (r of h.items; track r.id) { <li>{{ r.fechaEjecucion }} — {{ r.tecnico }}: {{ r.descripcion ?? '—' }}</li> } @empty { <li class="text-muted-foreground">Sin ejecuciones.</li> }</ul>
      <button ui-btn variant="secondary" size="sm" class="mt-2" (click)="hist.set(null)">Cerrar</button>
    </ui-card>
    }
  `,
})
export class Planes {
  private readonly api = inject(PlanesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly planes = signal<Plan[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(1);
  readonly rev = signal<ResumenRevision | null>(null);
  readonly sel = signal<Plan | null>(null);
  readonly hist = signal<{ planId: number; items: RegistroEjecucion[] } | null>(null);
  fEstado = ''; fEquipo: number | null = null;
  ej = { fechaEjecucion: new Date().toISOString().slice(0, 10), tecnico: '', descripcion: '' };

  constructor() { this.cargar(); this.cargarRev(); }
  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  puedeEjecutar(): boolean { const r = this.auth.rol(); return r === 'ADMIN' || r === 'INGENIERO' || r === 'TECNICO'; }
  sev(e: string): 'success' | 'warn' | 'destructive' { return e === 'VENCIDO' ? 'destructive' : e === 'PROXIMO' ? 'warn' : 'success'; }
  msg(e: unknown): string { const x = e as { error?: { detail?: string; message?: string } }; return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida'; }
  cargar(): void {
    this.api.listar({ pagina: this.pagina(), tamano: 10, estado: this.fEstado || undefined, equipoId: this.fEquipo ?? undefined }).subscribe({
      next: (p) => { this.planes.set(p.contenido); this.totalPaginas.set(Math.max(1, p.totalPaginas)); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  cargarRev(): void { this.api.revision().subscribe({ next: (r) => this.rev.set(r) }); }
  ejecutarRevision(): void { this.api.ejecutarRevision().subscribe({ next: (r) => { this.rev.set(r); this.toast.exito(`Revisión: ${r.vencidos} vencidos, ${r.proximos} próximos`); this.cargar(); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) }); }
  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); this.cargar(); } }
  ver(p: Plan): void {
    this.api.obtenerPorId(p.id).subscribe({ next: (f) => this.sel.set(f), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  verHistorial(p: Plan): void {
    this.api.historial(p.id).subscribe({ next: (items) => this.hist.set({ planId: p.id, items }), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  guardarEjecucion(): void {
    const s = this.sel(); if (!s) return;
    this.api.registrarEjecucion(s.id, { ...this.ej }).subscribe({
      next: () => { this.toast.exito('Ejecución registrada'); this.sel.set(null); this.cargar(); this.cargarRev(); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  nuevaFrecuencia(p: Plan): void {
    const v = prompt(`Nueva frecuencia (días) para ${p.equipoSerial}:`, String(p.frecuenciaDias));
    if (!v) return;
    this.api.cambiarFrecuencia(p.id, Number(v)).subscribe({ next: () => { this.toast.exito('Frecuencia actualizada'); this.cargar(); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
}
