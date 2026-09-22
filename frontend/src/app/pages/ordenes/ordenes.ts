import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiBadge } from '../../shared/ui/badge';
import { UiButton } from '../../shared/ui/button';
import { UiCard } from '../../shared/ui/card';
import { UiInput, UiLabel } from '../../shared/ui/field';
import { EquiposService, OrdenesService, UsuariosService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import type { CrearOrdenRequest, Equipo, Orden, TipoOrden, Usuario } from '../../core/models';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [FormsModule, UiBadge, UiButton, UiCard, UiInput, UiLabel],
  template: `
    <h2 class="mb-4 text-xl font-semibold">Órdenes de trabajo</h2>
    <ui-card>
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Estado<select ui-input [(ngModel)]="fEstado"><option value="">Todos</option><option>PENDIENTE</option><option>ASIGNADA</option><option>EN_PROCESO</option><option>COMPLETADA</option><option>CANCELADA</option></select></label>
        <label ui-label>Tipo<select ui-input [(ngModel)]="fTipo"><option value="">Todos</option><option>PREVENTIVO</option><option>CORRECTIVO</option></select></label>
        <button ui-btn size="sm" (click)="pagina.set(0); cargar()">Filtrar</button>
        @if (puedeGestionar()) { <button ui-btn variant="secondary" size="sm" (click)="formVisible.set(!formVisible())">{{ formVisible() ? 'Cerrar' : '+ Nueva orden' }}</button> }
        @if (puedeGestionar()) { <button ui-btn variant="secondary" size="sm" (click)="generar()">Generar preventivas</button> }
      </div>
    </ui-card>
    @if (formVisible() && puedeGestionar()) {
    <ui-card title="Nueva orden" class="mt-3 block">
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Equipo<select ui-input [(ngModel)]="nueva.equipoId">@for (e of equipos(); track e.id) { <option [value]="e.id">{{ e.serial }} — {{ e.nombre }}</option> }</select></label>
        <label ui-label>Tipo<select ui-input [(ngModel)]="nueva.tipo"><option>PREVENTIVO</option><option>CORRECTIVO</option></select></label>
        <label ui-label>Título<input ui-input [(ngModel)]="nueva.titulo" /></label>
        <label ui-label>Fecha programada<input ui-input type="date" [(ngModel)]="nueva.fechaProgramada" /></label>
        <label ui-label>Descripción<input ui-input [(ngModel)]="nueva.descripcion" /></label>
        <button ui-btn size="sm" (click)="crear()">Crear</button>
      </div>
    </ui-card>
    }
    <ui-card class="mt-3 block">
      <div class="overflow-x-auto rounded-md border border-border">
        <table class="w-full text-sm">
          <thead class="[&_tr]:border-b"><tr class="border-b"><th class="h-10 px-4 text-left font-medium text-muted-foreground">#</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Equipo</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Tipo</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Estado</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Título</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Técnico</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Acciones</th></tr></thead>
          <tbody class="[&_tr:last-child]:border-0">
            @for (o of ordenes(); track o.id) {
              <tr class="border-b">
                <td class="p-2 px-4">{{ o.id }}</td><td class="p-2 px-4">{{ o.equipoSerial }}</td><td class="p-2 px-4">{{ o.tipo }}</td>
                <td class="p-2 px-4"><ui-badge [variant]="sev(o.estado)">{{ o.estado }}</ui-badge></td><td class="p-2 px-4">{{ o.titulo }}</td><td class="p-2 px-4">{{ o.tecnicoNombre ?? '—' }}</td>
                <td class="p-2 px-4"><div class="flex flex-wrap items-center gap-1">
                  <button ui-btn variant="secondary" size="sm" (click)="ver(o)">Ver</button>
                  @if (o.estado === 'PENDIENTE' && puedeGestionar()) {
                    <select ui-input class="h-8 w-auto!" [(ngModel)]="tecSel">@for (t of tecnicos(); track t.id) { <option [value]="t.id">{{ t.nombre }} {{ t.apellido }}</option>}</select>
                    <button ui-btn size="sm" (click)="asignar(o)">Asignar</button>
                  }
                  @if (o.estado === 'ASIGNADA' && puedeTrabajar()) { <button ui-btn size="sm" (click)="iniciar(o)">Iniciar</button> }
                  @if (o.estado === 'EN_PROCESO' && puedeTrabajar()) { <button ui-btn size="sm" (click)="completar(o)">Completar</button> }
                  @if (o.estado !== 'COMPLETADA' && o.estado !== 'CANCELADA' && puedeGestionar()) { <button ui-btn variant="destructive" size="sm" (click)="cancelar(o)">Cancelar</button> }
                </div></td>
              </tr>
            } @empty { <tr><td colspan="7" class="p-4 text-muted-foreground">Sin órdenes.</td></tr> }
          </tbody>
        </table>
      </div>
      <div class="mt-2 flex items-center gap-2">
        <button ui-btn variant="secondary" size="sm" (click)="prev()" [disabled]="pagina()===0">← Anterior</button>
        <span class="text-sm text-muted-foreground">Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</span>
        <button ui-btn variant="secondary" size="sm" (click)="next()" [disabled]="pagina()+1>=totalPaginas()">Siguiente →</button>
      </div>
    </ui-card>
  `,
})
export class Ordenes {
  private readonly api = inject(OrdenesService);
  private readonly eq = inject(EquiposService);
  private readonly us = inject(UsuariosService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  readonly ordenes = signal<Orden[]>([]);
  readonly equipos = signal<Equipo[]>([]);
  readonly tecnicos = signal<Usuario[]>([]);
  readonly pagina = signal(0);
  readonly totalPaginas = signal(1);
  readonly formVisible = signal(false);
  tecSel: number | null = null;
  fEstado = ''; fTipo = '';
  nueva: CrearOrdenRequest & { tipo: TipoOrden } = { equipoId: 0, tipo: 'CORRECTIVO', titulo: '', descripcion: '', fechaProgramada: '' };

  constructor() { this.cargar(); this.cargarApoyos(); }
  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  puedeTrabajar(): boolean { const r = this.auth.rol(); return r === 'ADMIN' || r === 'INGENIERO' || r === 'TECNICO'; }
  sev(e: string): 'success' | 'secondary' | 'default' | 'warn' | 'destructive' {
    return e === 'COMPLETADA' ? 'success' : e === 'CANCELADA' ? 'secondary' : e === 'EN_PROCESO' ? 'default' : e === 'ASIGNADA' ? 'warn' : 'destructive';
  }
  msg(e: unknown): string { const x = e as { error?: { detail?: string; message?: string } }; return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida'; }
  cargar(): void {
    this.api.listar({ pagina: this.pagina(), tamano: 10, estado: this.fEstado || undefined, tipo: this.fTipo || undefined }).subscribe({
      next: (p) => { this.ordenes.set(p.contenido); this.totalPaginas.set(Math.max(1, p.totalPaginas)); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  cargarApoyos(): void {
    this.eq.listar({ pagina: 0, tamano: 100 }).subscribe({ next: (p) => { this.equipos.set(p.contenido); if (p.contenido[0]) this.nueva.equipoId = p.contenido[0].id; } });
    this.us.listar('TECNICO').subscribe({ next: (t) => { this.tecnicos.set(t); if (t[0]) this.tecSel = t[0].id; }, error: () => this.us.listar().subscribe({ next: (t) => this.tecnicos.set(t) }) });
  }
  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); this.cargar(); } }
  ver(o: Orden): void {
    this.api.obtenerPorId(o.id).subscribe({
      next: (f) => this.ordenes.update(list => list.map(x => x.id === f.id ? f : x)),
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  crear(): void {
    this.api.crear({ ...this.nueva, descripcion: this.nueva.descripcion || undefined, fechaProgramada: this.nueva.fechaProgramada || undefined }).subscribe({
      next: () => { this.toast.exito('Orden creada'); this.formVisible.set(false); this.cargar(); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  asignar(o: Orden): void {
    if (!this.tecSel) { this.toast.aviso('Falta el técnico', 'Elige un técnico'); return; }
    this.api.asignar(o.id, Number(this.tecSel)).subscribe({ next: () => this.cargar(), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  iniciar(o: Orden): void { this.api.iniciar(o.id).subscribe({ next: () => this.cargar(), error: (e) => this.toast.error('Operación fallida', this.msg(e)) }); }
  completar(o: Orden): void {
    const r = prompt('Resultado del trabajo (obligatorio):'); if (!r) return;
    this.api.completar(o.id, r).subscribe({ next: () => this.cargar(), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  cancelar(o: Orden): void {
    const m = prompt('Motivo de cancelación (opcional):') ?? undefined;
    this.api.cancelar(o.id, m || undefined).subscribe({ next: () => this.cargar(), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  generar(): void {
    this.api.generarPreventivas().subscribe({ next: (r) => { this.toast.exito(`Preventivas generadas: ${r.ordenesCreadas}`); this.cargar(); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
}
