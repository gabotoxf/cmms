import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DashboardService, EquiposService, ReportesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { UiPageHeader } from '../../shared/ui/page-header';
import { UiSkeleton } from '../../shared/ui/skeleton';
import type { Equipo } from '../../core/models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule, UiPageHeader, UiSkeleton],
  template: `
    <ui-page-header title="Reportes Regulatorios" subtitle="Generación de hojas de vida y certificados de cumplimiento para trazabilidad ante INVIMA y MinSalud.">
      <span class="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-sm px-3 py-1.5 shadow-sm">
        <span class="material-symbols-outlined text-[16px] text-[#044e46]">verified</span> Res. 3100 / 2019
      </span>
      <span class="inline-flex items-center gap-1.5 text-xs font-mono bg-slate-900 text-white px-2.5 py-1 rounded">PDF • SHA-256</span>
    </ui-page-header>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium uppercase tracking-wider">Equipos Activos</span>
          <span class="material-symbols-outlined text-[18px] text-slate-400">devices</span>
        </div>
        <div class="flex items-baseline gap-2">
          @if (kpiCargando()) { <ui-skeleton height="28px" width="60px" /> }
          @else { <span class="text-2xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiTotal() }}</span> }
          <span class="text-xs text-slate-500">inventariados</span>
        </div>
        <p class="mt-1 text-[11px] text-slate-400">Desde dashboard (excluye bajas)</p>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium uppercase tracking-wider">Hojas de Vida</span>
          <span class="material-symbols-outlined text-[18px] text-emerald-600">description</span>
        </div>
        <div class="flex items-baseline gap-2">
          @if (kpiCargando()) { <ui-skeleton height="28px" width="60px" /> }
          @else { <span class="text-2xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiTotal() }}</span> }
          <span class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">disponibles</span>
        </div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium uppercase tracking-wider">Certificados</span>
          <span class="material-symbols-outlined text-[18px] text-teal-600">workspace_premium</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900 tracking-tight">2</span>
          <span class="text-xs text-slate-500">tipos</span>
        </div>
        <div class="mt-2 text-[11px] text-slate-500">Parque completo y por equipo · vencidos/próximos al día</div>
      </div>
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <!-- Hoja de vida -->
      <section class="bg-white rounded-sm border border-slate-200/70 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-sm bg-emerald-50 border border-emerald-100 text-[#044e46] flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">clinical_notes</span>
            </div>
            <div>
              <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Hoja de Vida por Equipo</h3>
              <p class="text-xs text-slate-500">Historial completo (Res. 3100) con trazabilidad metrológica.</p>
            </div>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400 pointer-events-none">search</span>
            <input [ngModel]="busqueda" (ngModelChange)="onBusquedaChange($event)" placeholder="Buscar por serial, nombre o ubicación..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-sm text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#044e46]" />
          </div>
          @if (equiposCargando()) {
            <div class="space-y-2"><ui-skeleton height="44px" /><ui-skeleton height="44px" /><ui-skeleton height="44px" /></div>
          } @else if (equiposError()) {
            <div class="flex items-center justify-between rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              <span>{{ equiposError() }}</span><button (click)="cargarEquipos()" class="rounded bg-white border border-rose-200 px-2 py-1 cursor-pointer">Reintentar</button>
            </div>
          } @else {
            <div class="max-h-64 overflow-y-auto divide-y divide-slate-100 rounded-sm border border-slate-200">
              @for (e of equipos(); track e.id) {
                <label class="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer" [class.bg-emerald-50/50]="equipoId===e.id">
                  <input type="radio" name="equipo" [value]="e.id" [(ngModel)]="equipoId" (ngModelChange)="syncUrl()" class="accent-[#044e46]" />
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-semibold text-slate-900 truncate">{{ e.serial }} — {{ e.nombre }}</div>
                    <div class="text-[11px] text-slate-500 truncate">{{ e.ubicacion }} · {{ e.marca ?? '—' }} {{ e.modelo ?? '' }}</div>
                  </div>
                  <span class="text-[10px] font-mono px-1.5 py-0.5 rounded border" [class.bg-emerald-50]="e.estado==='OPERATIVO'" [class.text-emerald-700]="e.estado==='OPERATIVO'" [class.bg-slate-100]="e.estado!=='OPERATIVO'">{{ e.estado }}</span>
                </label>
              } @empty {
                <div class="p-4 text-center text-xs text-slate-400">Sin equipos. Ajusta la búsqueda.</div>
              }
            </div>
          }
          <button (click)="hoja()" [disabled]="!equipoId || hojaCargando()" class="w-full inline-flex items-center justify-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-4 py-2.5 rounded-sm shadow-sm disabled:opacity-40 cursor-pointer">
            @if (hojaCargando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> }
            <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span> Descargar Hoja de Vida PDF
          </button>
        </div>
      </section>

      <!-- Certificado -->
      <section class="bg-white rounded-sm border border-slate-200/70 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-sm bg-teal-50 border border-teal-100 text-[#0f766e] flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div>
              <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Certificado de Cumplimiento</h3>
              <p class="text-xs text-slate-500">Mantenimientos preventivos — cumplimiento Res. 3100.</p>
            </div>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div class="rounded-sm bg-slate-50 border border-slate-200 p-3 text-xs leading-relaxed">
            <p class="font-medium text-slate-800">¿Qué certifica este documento?</p>
            <p class="text-slate-500 mt-1">Acredita el cumplimiento del cronograma preventivo del parque o de un equipo, con firma digital lista para Secretaría de Salud. Incluye vencidos/próximos al día de emisión.</p>
          </div>
          <div class="grid gap-3">
            <button (click)="cert()" [disabled]="certCargando()" class="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium px-4 py-2.5 rounded-sm cursor-pointer disabled:opacity-50">
              @if (certCargando() && !equipoId) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"></span> }
              <span class="material-symbols-outlined text-[16px] text-slate-500">workspace_premium</span> Descargar Parque Completo PDF
            </button>
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-slate-200"></div>
              <span class="text-[11px] text-slate-400 uppercase tracking-wider">o por equipo</span>
              <div class="h-px flex-1 bg-slate-200"></div>
            </div>
            <div class="flex gap-2">
              <select [(ngModel)]="equipoId" (ngModelChange)="syncUrl()" class="flex-1 h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs cursor-pointer">
                @for (e of equipos(); track e.id) { <option [value]="e.id">{{ e.serial }} — {{ e.nombre }}</option> }
              </select>
              <button (click)="certEquipo()" [disabled]="!equipoId || certCargando()" class="inline-flex items-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-4 py-2 rounded-sm disabled:opacity-40 cursor-pointer">
                @if (certCargando() && equipoId) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> }
                <span class="material-symbols-outlined text-[16px]">download</span> Equipo
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50 border border-emerald-100 rounded-sm px-3 py-2">
            <span class="material-symbols-outlined text-[16px] text-emerald-700">info</span> PDFs con disposición attachment y foliados para auditoría.
          </div>
        </div>
      </section>
    </div>

    <!-- Recent docs -->
    <section class="bg-white rounded-sm border border-slate-200/70 shadow-sm p-6 mt-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Documentos Recientes</h3>
          <p class="text-xs text-slate-500 mt-0.5">Últimas descargas de esta sesión.</p>
        </div>
        @if (recientes().length) { <button (click)="recientes.set([])" class="text-xs text-slate-500 hover:text-slate-800 cursor-pointer">Limpiar</button> }
      </div>
      <div class="mt-4 grid gap-2 text-xs">
        @for (d of recientes(); track d.nombre) {
          <div class="flex items-center justify-between p-3 rounded-sm border border-slate-200 bg-slate-50">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-rose-600"><span class="material-symbols-outlined text-[16px]">picture_as_pdf</span></span>
              <div>
                <div class="font-medium text-slate-800">{{ d.nombre }}</div>
                <div class="text-[11px] text-slate-500 font-mono">{{ d.fecha }}</div>
              </div>
            </div>
            <span class="text-[11px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">{{ d.tipo }}</span>
          </div>
        } @empty {
          <p class="text-xs text-slate-400">Aún no has descargado documentos. Usa los botones de arriba.</p>
        }
      </div>
    </section>
  `,
})
export class Reportes {
  private readonly pdf = inject(ReportesService);
  private readonly eq = inject(EquiposService);
  private readonly dash = inject(DashboardService);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly equipos = signal<Equipo[]>([]);
  readonly equiposCargando = signal(false);
  readonly equiposError = signal<string | null>(null);
  readonly recientes = signal<{ nombre: string; fecha: string; tipo: string }[]>([]);
  readonly kpiTotal = signal(0);
  readonly kpiCargando = signal(true);
  readonly hojaCargando = signal(false);
  readonly certCargando = signal(false);
  equipoId: number | null = null;
  busqueda = '';
  private readonly busquedaSubject = new Subject<string>();

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    if (qp.get('equipoId')) this.equipoId = Number(qp.get('equipoId'));
    if (qp.get('q')) this.busqueda = qp.get('q')!;
    this.cargarKpis();
    this.cargarEquipos();
    this.busquedaSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(v => {
      this.busqueda = v; this.syncUrl(); this.cargarEquipos();
    });
  }

  cargarKpis(): void {
    this.kpiCargando.set(true);
    this.dash.resumen().subscribe({
      next: (r) => {
        const total = Object.values(r.equiposPorEstado ?? {}).reduce((a, b) => a + b, 0);
        // excluye bajas si el BE las cuenta, pero dashboard ya incluye; mostramos total activo aprox
        const bajas = r.equiposPorEstado?.['DADO_DE_BAJA'] ?? 0;
        this.kpiTotal.set(Math.max(0, total - bajas));
        this.kpiCargando.set(false);
      },
      error: () => { this.kpiTotal.set(this.equipos().length); this.kpiCargando.set(false); },
    });
  }

  cargarEquipos(): void {
    this.equiposCargando.set(true); this.equiposError.set(null);
    const q = this.busqueda.trim() || undefined;
    this.eq.listar({ pagina: 0, tamano: 20, q }).subscribe({
      next: (p) => {
        this.equipos.set(p.contenido);
        if (this.equipoId == null && p.contenido[0]) this.equipoId = p.contenido[0].id;
        else if (this.equipoId && !p.contenido.find(e => e.id === this.equipoId)) {
          // mantiene selección aunque no esté en página filtrada
        }
        this.equiposCargando.set(false);
      },
      error: (e) => {
        this.equiposError.set((e as { error?: { detail?: string } })?.error?.detail ?? 'No se pudo cargar equipos');
        this.equiposCargando.set(false);
      },
    });
  }

  onBusquedaChange(v: string): void { this.busquedaSubject.next(v); }
  syncUrl(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { equipoId: this.equipoId ?? null, q: this.busqueda || null }, queryParamsHandling: 'merge' });
  }

  hoja(): void {
    if (!this.equipoId || this.hojaCargando()) return;
    this.hojaCargando.set(true);
    const id = Number(this.equipoId);
    this.http.get(`/api/reportes/equipos/${id}/hoja-de-vida`, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (resp) => {
        const blob = resp.body!;
        const cd = resp.headers.get('content-disposition');
        const filename = this.pdf.extraerFilename(cd) ?? `hoja-de-vida-${id}.pdf`;
        this.pdf.descargar(blob, filename);
        this.toast.exito('PDF descargado');
        this.reciente(filename, 'Hoja de vida');
        this.hojaCargando.set(false);
      },
      error: (e) => {
        this.hojaCargando.set(false);
        const msg = (e as { error?: { detail?: string } })?.error?.detail ?? 'Intenta de nuevo';
        this.toast.error('No se pudo generar el PDF', msg);
      },
    });
  }

  cert(): void {
    if (this.certCargando()) return;
    this.certCargando.set(true);
    this.http.get('/api/reportes/certificado-cumplimiento', { responseType: 'blob', observe: 'response' }).subscribe({
      next: (resp) => {
        const blob = resp.body!;
        const cd = resp.headers.get('content-disposition');
        const filename = this.pdf.extraerFilename(cd) ?? 'certificado-cumplimiento-parque.pdf';
        this.pdf.descargar(blob, filename);
        this.toast.exito('PDF descargado');
        this.reciente(filename, 'Certificado parque');
        this.certCargando.set(false);
      },
      error: () => { this.certCargando.set(false); this.toast.error('No se pudo generar el PDF'); },
    });
  }

  certEquipo(): void {
    if (!this.equipoId || this.certCargando()) return;
    this.certCargando.set(true);
    const id = Number(this.equipoId);
    const params = new HttpParams().set('equipoId', id);
    this.http.get('/api/reportes/certificado-cumplimiento', { params, responseType: 'blob', observe: 'response' }).subscribe({
      next: (resp) => {
        const blob = resp.body!;
        const cd = resp.headers.get('content-disposition');
        const filename = this.pdf.extraerFilename(cd) ?? `certificado-equipo-${id}.pdf`;
        this.pdf.descargar(blob, filename);
        this.toast.exito('PDF descargado');
        this.reciente(filename, 'Certificado equipo');
        this.certCargando.set(false);
      },
      error: () => { this.certCargando.set(false); this.toast.error('No se pudo generar el PDF'); },
    });
  }

  private reciente(nombre: string, tipo: string): void {
    const fecha = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    this.recientes.update(l => [{ nombre, fecha, tipo }, ...l].slice(0, 5));
  }
}
