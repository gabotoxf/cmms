import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiBadge } from '../../shared/ui/badge';
import { UiButton } from '../../shared/ui/button';
import { UiCard } from '../../shared/ui/card';
import { UiInput, UiLabel } from '../../shared/ui/field';
import { CargaMasivaService, EquiposService, PlanesService, ReportesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import type { ClasificacionRiesgo, Equipo, EquipoRequest, Plan, ResultadoCarga } from '../../core/models';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [FormsModule, UiBadge, UiButton, UiCard, UiInput, UiLabel],
  template: `
    <h2 class="mb-4 text-xl font-semibold">Equipos</h2>
    <ui-card>
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Ubicación<input ui-input [(ngModel)]="fUbicacion" placeholder="UCI…" /></label>
        <label ui-label>Riesgo<select ui-input [(ngModel)]="fRiesgo"><option value="">Todos</option><option>I</option><option>IIA</option><option>IIB</option><option>III</option></select></label>
        <label ui-label>Estado<select ui-input [(ngModel)]="fEstado"><option value="">Todos</option><option>OPERATIVO</option><option>EN_MANTENIMIENTO</option><option>FUERA_DE_SERVICIO</option><option>DADO_DE_BAJA</option></select></label>
        <button ui-btn size="sm" (click)="pagina.set(0); cargar()">Filtrar</button>
        @if (puedeGestionar()) { <button ui-btn variant="secondary" size="sm" (click)="nuevo()">{{ editando() ? 'Cancelar edición' : '+ Nuevo' }}</button> }
      </div>
    </ui-card>

    @if (formVisible() && puedeGestionar()) {
    <ui-card [title]="editando() ? 'Editar equipo' : 'Nuevo equipo'" class="mt-3 block">
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Serial*<input ui-input [(ngModel)]="form.serial" /></label>
        <label ui-label>Nombre*<input ui-input [(ngModel)]="form.nombre" /></label>
        <label ui-label>Marca<input ui-input [(ngModel)]="form.marca" /></label>
        <label ui-label>Modelo<input ui-input [(ngModel)]="form.modelo" /></label>
        <label ui-label>Ubicación*<input ui-input [(ngModel)]="form.ubicacion" /></label>
        <label ui-label>Riesgo*<select ui-input [(ngModel)]="form.clasificacionRiesgo"><option>I</option><option>IIA</option><option>IIB</option><option>III</option></select></label>
        <label ui-label>Adquisición<input ui-input type="date" [(ngModel)]="form.fechaAdquisicion" /></label>
        <label ui-label>Periodicidad (días)*<input ui-input type="number" min="1" [(ngModel)]="form.periodicidadMantenimientoDias" /></label>
        <button ui-btn size="sm" (click)="guardar()">Guardar</button>
      </div>
    </ui-card>
    }

    @if (detalle(); as d) {
    <ui-card [title]="'Detalle #' + d.id + ' — ' + d.serial" class="mt-3 block">
      <p class="text-sm">{{ d.nombre }} · {{ d.marca ?? '—' }} {{ d.modelo ?? '' }} · {{ d.ubicacion }} · Riesgo {{ d.clasificacionRiesgo }} · <ui-badge [variant]="sevEquipo(d.estado)">{{ d.estado }}</ui-badge> · Cada {{ d.periodicidadMantenimientoDias }} días</p>
      @if (planEquipo(); as p) { <p class="text-sm text-muted-foreground">Plan: próxima {{ p.proximaFecha }} ({{ p.diasRestantes }}d, {{ p.estado }})</p> }
      <button ui-btn variant="secondary" size="sm" class="mt-2" (click)="detalle.set(null)">Cerrar</button>
    </ui-card>
    }

    <ui-card class="mt-3 block">
      <div class="overflow-x-auto rounded-md border border-border">
        <table class="w-full text-sm">
          <thead class="[&_tr]:border-b"><tr class="border-b"><th class="h-10 px-4 text-left font-medium text-muted-foreground">Serial</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Nombre</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Ubicación</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Riesgo</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Estado</th><th class="h-10 px-4 text-left font-medium text-muted-foreground">Acciones</th></tr></thead>
          <tbody class="[&_tr:last-child]:border-0">
            @for (e of equipos(); track e.id) {
              <tr class="border-b">
                <td class="p-2 px-4">{{ e.serial }}</td><td class="p-2 px-4">{{ e.nombre }}</td><td class="p-2 px-4">{{ e.ubicacion }}</td>
                <td class="p-2 px-4"><ui-badge>{{ e.clasificacionRiesgo }}</ui-badge></td>
                <td class="p-2 px-4"><ui-badge [variant]="sevEquipo(e.estado)">{{ e.estado }}</ui-badge></td>
                <td class="p-2 px-4"><div class="flex flex-wrap items-center gap-1">
                  <button ui-btn variant="secondary" size="sm" (click)="ver(e)">Ver</button>
                  @if (puedeGestionar()) { <button ui-btn variant="secondary" size="sm" (click)="editar(e)">Editar</button> }
                  <select ui-input class="h-8 w-auto!" [(ngModel)]="e.estado" (ngModelChange)="cambiarEstado(e, $event)"><option>OPERATIVO</option><option>EN_MANTENIMIENTO</option><option>FUERA_DE_SERVICIO</option></select>
                  <button ui-btn variant="secondary" size="sm" (click)="hojaDeVida(e)">PDF</button>
                  @if (puedeGestionar()) { <button ui-btn variant="destructive" size="sm" (click)="baja(e)">Baja</button> }
                </div></td>
              </tr>
            } @empty { <tr><td colspan="6" class="p-4 text-muted-foreground">Sin equipos.</td></tr> }
          </tbody>
        </table>
      </div>
      <div class="mt-2 flex items-center gap-2">
        <button ui-btn variant="secondary" size="sm" (click)="prev()" [disabled]="pagina()===0">← Anterior</button>
        <span class="text-sm text-muted-foreground">Pág. {{ pagina()+1 }}/{{ totalPaginas() }} ({{ total() }})</span>
        <button ui-btn variant="secondary" size="sm" (click)="next()" [disabled]="pagina()+1>=totalPaginas()">Siguiente →</button>
      </div>
    </ui-card>

    @if (puedeGestionar()) {
    <ui-card title="Carga masiva (CSV / .xlsx)" class="mt-3 block">
      <div class="flex flex-wrap items-end gap-2">
        <input type="file" accept=".csv,.xlsx" (change)="elegir($event)" class="text-sm" />
        <button ui-btn size="sm" (click)="subir()" [disabled]="!archivo">Subir</button>
      </div>
      @if (resultado(); as r) {
        <p class="mt-2 text-sm">Filas: {{ r.filasLeidas }} · Creados: {{ r.equiposCreados }} · Errores: {{ r.errores.length }}</p>
        @for (e of r.errores; track e.fila) { <p class="text-sm text-destructive">Fila {{ e.fila }} ({{ e.serial }}): {{ e.motivo }}</p> }
      }
    </ui-card>
    }
  `,
})
export class Equipos {
  private readonly api = inject(EquiposService);
  private readonly planes = inject(PlanesService);
  private readonly carga = inject(CargaMasivaService);
  private readonly pdf = inject(ReportesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly equipos = signal<Equipo[]>([]);
  readonly pagina = signal(0);
  readonly total = signal(0);
  readonly totalPaginas = signal(1);
  readonly resultado = signal<ResultadoCarga | null>(null);
  readonly detalle = signal<Equipo | null>(null);
  readonly planEquipo = signal<Plan | null>(null);

  fUbicacion = ''; fRiesgo = ''; fEstado = '';
  formVisible = signal(false);
  editando = signal<number | null>(null);
  form: EquipoRequest & { marca?: string | null; modelo?: string | null; fechaAdquisicion?: string | null } = this.vacio();
  archivo: File | null = null;

  constructor() { this.cargar(); }

  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  sevEquipo(e: string): 'success' | 'secondary' | 'warn' | 'destructive' {
    return e === 'OPERATIVO' ? 'success' : e === 'EN_MANTENIMIENTO' ? 'warn' : e === 'DADO_DE_BAJA' ? 'secondary' : 'destructive';
  }
  vacio(): EquipoRequest {
    return { serial: '', nombre: '', marca: '', modelo: '', ubicacion: '', clasificacionRiesgo: 'I' as ClasificacionRiesgo, fechaAdquisicion: '', periodicidadMantenimientoDias: 90 };
  }
  msg(e: unknown): string {
    const e2 = e as { error?: { detail?: string; message?: string; title?: string } };
    return e2?.error?.detail ?? e2?.error?.message ?? e2?.error?.title ?? 'Operación fallida';
  }
  cargar(): void {
    this.api.listar({ pagina: this.pagina(), tamano: 10, ubicacion: this.fUbicacion || undefined, riesgo: this.fRiesgo || undefined, estado: this.fEstado || undefined }).subscribe({
      next: (p) => { this.equipos.set(p.contenido); this.total.set(p.totalElementos); this.totalPaginas.set(Math.max(1, p.totalPaginas)); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); this.cargar(); } }
  ver(e: Equipo): void {
    this.planEquipo.set(null);
    this.api.obtenerPorId(e.id).subscribe({ next: (d) => this.detalle.set(d), error: (er) => this.toast.error('Operación fallida', this.msg(er)) });
    this.planes.obtenerPorEquipo(e.id).subscribe({ next: (p) => this.planEquipo.set(p), error: () => this.planEquipo.set(null) });
  }
  nuevo(): void {
    if (this.editando()) { this.editando.set(null); this.formVisible.set(false); }
    else { this.form = this.vacio(); this.formVisible.set(true); }
  }
  editar(e: Equipo): void {
    this.api.obtenerPorId(e.id).subscribe({
      next: (f) => {
        this.editando.set(f.id);
        this.form = { serial: f.serial, nombre: f.nombre, marca: f.marca ?? '', modelo: f.modelo ?? '', ubicacion: f.ubicacion, clasificacionRiesgo: f.clasificacionRiesgo, fechaAdquisicion: f.fechaAdquisicion ?? '', periodicidadMantenimientoDias: f.periodicidadMantenimientoDias };
        this.formVisible.set(true);
      },
      error: (er) => this.toast.error('Operación fallida', this.msg(er)),
    });
  }
  guardar(): void {
    const req: EquipoRequest = { ...this.form, marca: this.form.marca || null, modelo: this.form.modelo || null, fechaAdquisicion: this.form.fechaAdquisicion || null };
    const id = this.editando();
    (id ? this.api.actualizar(id, req) : this.api.crear(req)).subscribe({
      next: () => { this.toast.exito('Equipo guardado'); this.formVisible.set(false); this.editando.set(null); this.cargar(); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  cambiarEstado(e: Equipo, estado: string): void {
    this.api.cambiarEstado(e.id, estado).subscribe({ next: () => this.cargar(), error: (er) => this.toast.error('Operación fallida', this.msg(er)) });
  }
  baja(e: Equipo): void {
    if (!confirm(`Dar de baja ${e.serial}?`)) return;
    this.api.darDeBaja(e.id).subscribe({ next: () => this.cargar(), error: (er) => this.toast.error('Operación fallida', this.msg(er)) });
  }
  hojaDeVida(e: Equipo): void {
    this.pdf.hojaDeVida(e.id).subscribe({ next: (b) => this.pdf.descargar(b, `hoja-de-vida-${e.id}.pdf`), error: (er) => this.toast.error('Operación fallida', this.msg(er)) });
  }
  elegir(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
  }
  subir(): void {
    if (!this.archivo) return;
    this.resultado.set(null);
    this.carga.importar(this.archivo).subscribe({
      next: (r) => { this.resultado.set(r); this.cargar(); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
}
