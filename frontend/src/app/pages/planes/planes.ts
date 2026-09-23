import { Component, computed, inject, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PlanesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import { UiPageHeader } from '../../shared/ui/page-header';
import { UiSkeleton } from '../../shared/ui/skeleton';
import type { Plan, RegistroEjecucion, ResumenRevision } from '../../core/models';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [FormsModule, SlicePipe, UiPageHeader, UiSkeleton],
  template: `
    <ui-page-header title="Cronograma y Planes de Mantenimiento" subtitle="Supervisión integral de periodicidad técnica y trazabilidad metrológica en parque activo hospitalario.">
      <button (click)="sincronizar()" [disabled]="syncCargando()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 text-xs font-medium shadow-sm cursor-pointer disabled:opacity-50">
        <span class="material-symbols-outlined text-[16px] text-slate-500" [class.animate-spin]="syncCargando()">sync</span> Sincronizar Cronograma
      </button>
      <button (click)="exportar()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 text-xs font-medium shadow-sm cursor-pointer">
        <span class="material-symbols-outlined text-[16px] text-slate-500">ios_share</span> Exportar
      </button>
    </ui-page-header>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
      <a (click)="setFiltroEstado('')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-slate-300 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Total Planes Programados</span>
          <span class="material-symbols-outlined text-lg text-slate-400">calendar_month</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ total() }}</span>
          <span class="text-xs text-slate-500">equipos activos →</span>
        </div>
        <div class="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 100% inventariado</div>
      </a>
      <a (click)="setFiltroEstado('AL_DIA')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-emerald-200 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Al Día (Cumpliendo)</span>
          <span class="material-symbols-outlined text-lg text-teal-600">check_circle</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiAlDia() }}</span>
          <span class="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{{ pctAlDia() }}%</span>
        </div>
        <div class="mt-3 text-[11px] text-slate-500 flex items-center justify-between"><span>Meta ≥ 95%</span><span class="text-emerald-700 font-medium">Óptimo →</span></div>
      </a>
      <a (click)="setFiltroEstado('PROXIMO')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-amber-200 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Próximos a Vencer</span>
          <span class="material-symbols-outlined text-lg text-amber-600">history_toggle_off</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-amber-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiProximos() }}</span>
          <span class="text-xs text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/50">≤ 15 días →</span>
        </div>
        <div class="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Cuadrilla programada</div>
      </a>
      <a (click)="setFiltroEstado('VENCIDO')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-rose-200 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Vencidos / Prioritarios</span>
          <span class="material-symbols-outlined text-lg text-rose-600">notification_important</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-rose-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiVencidos() }}</span>
          <span class="text-xs text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded font-medium border border-rose-200/60">Urgente →</span>
        </div>
        <div class="mt-3 text-[11px] text-rose-700 flex items-center gap-1.5 font-medium"><span class="material-symbols-outlined text-[13px]">warning</span> Riesgo no conformidad</div>
      </a>
    </div>

    <!-- Filter bar -->
    <div class="bg-white p-3 rounded-sm border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-6">
      <div class="relative flex-1 min-w-[260px]">
        <span class="material-symbols-outlined text-slate-400 absolute left-3 top-2.5 text-[18px]">search</span>
        <input [(ngModel)]="fQ" (ngModelChange)="onQChange($event)" class="w-full bg-transparent pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 border-none rounded-sm focus:ring-1 focus:ring-[#044e46] focus:bg-slate-50/50 transition" placeholder="Buscar por código, equipo, serie o servicio..." />
      </div>
      <div class="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <select [(ngModel)]="fFrecuencia" (change)="aplicarFiltros()" class="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-sm py-1 px-2.5 cursor-pointer">
          <option [value]="''">Todas las frecuencias</option><option value="30">Mensual (30d)</option><option value="90">Trimestral (90d)</option><option value="180">Semestral (180d)</option><option value="365">Anual (365d)</option>
        </select>
        <select [(ngModel)]="orden" (change)="aplicarFiltros()" class="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-sm py-1 px-2.5 cursor-pointer" title="Ordenar">
          <option value="proximaFecha">Próxima fecha</option><option value="frecuenciaDias">Frecuencia</option><option value="id">Código</option>
        </select>
        <div class="flex items-center bg-slate-100 p-0.5 rounded-sm text-xs">
          <button (click)="setFiltroEstado('')" class="px-3 py-1 rounded-sm font-medium cursor-pointer" [class.bg-white]="fEstado===''" [class.shadow-sm]="fEstado===''" [class.text-slate-900]="fEstado===''" [class.text-slate-600]="fEstado!==''">Todos</button>
          <button (click)="setFiltroEstado('VENCIDO')" class="px-3 py-1 rounded-sm cursor-pointer" [class.bg-white]="fEstado==='VENCIDO'" [class.shadow-sm]="fEstado==='VENCIDO'" [class.text-slate-900]="fEstado==='VENCIDO'" [class.text-slate-600]="fEstado!=='VENCIDO'">Vencidos</button>
          <button (click)="setFiltroEstado('PROXIMO')" class="px-3 py-1 rounded-sm cursor-pointer" [class.bg-white]="fEstado==='PROXIMO'" [class.shadow-sm]="fEstado==='PROXIMO'" [class.text-slate-900]="fEstado==='PROXIMO'" [class.text-slate-600]="fEstado!=='PROXIMO'">Próximos</button>
          <button (click)="setFiltroEstado('AL_DIA')" class="px-3 py-1 rounded-sm cursor-pointer" [class.bg-white]="fEstado==='AL_DIA'" [class.shadow-sm]="fEstado==='AL_DIA'" [class.text-slate-900]="fEstado==='AL_DIA'" [class.text-slate-600]="fEstado!=='AL_DIA'">Al día</button>
        </div>
        @if (fEquipo) { <button (click)="clearEquipo()" class="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-xs cursor-pointer">Equipo #{{ fEquipo }} <span class="material-symbols-outlined text-[14px]">close</span></button> }
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-sm border border-slate-200/70 shadow-sm overflow-hidden mt-4">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Planes de Intervención Programados</h2>
          <p class="text-xs text-slate-500 mt-0.5">Cronograma técnico oficial sujeto a verificación Res. 3100.</p>
        </div>
        <span class="text-xs text-slate-400 font-mono">Pág. {{ pagina()+1 }}/{{ totalPaginas() }} · {{ total() }} registros</span>
      </div>

      @if (cargando()) {
        <div class="p-6 space-y-3">@for (_ of [1,2,3,4,5]; track $index) { <ui-skeleton height="48px" /> }</div>
      } @else if (errorMsg()) {
        <div class="p-8 flex items-center justify-between bg-rose-50/40 border-y border-rose-100">
          <span class="text-sm text-rose-800 flex items-center gap-2"><span class="material-symbols-outlined">error</span> {{ errorMsg() }}</span>
          <button (click)="cargar()" class="rounded bg-white border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 cursor-pointer">Reintentar</button>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200/60" style="font-family:'Montserrat',sans-serif">
                <th class="py-3 px-6">Código</th>
                <th class="py-3 px-6">Equipo &amp; Ubicación</th>
                <th class="py-3 px-6">Frecuencia</th>
                <th class="py-3 px-6">Última Ejecución</th>
                <th class="py-3 px-6">Próxima Fecha</th>
                <th class="py-3 px-6">Estado de Vigencia</th>
                <th class="py-3 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (p of planes(); track p.id) {
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-4 px-6 font-mono font-medium whitespace-nowrap">
                    <span class="px-2 py-1 rounded text-[11px] border"
                      [class.bg-rose-50]="p.estado==='VENCIDO'" [class.text-rose-800]="p.estado==='VENCIDO'" [class.border-rose-200]="p.estado==='VENCIDO'"
                      [class.bg-amber-50]="p.estado==='PROXIMO'" [class.text-amber-800]="p.estado==='PROXIMO'"
                      [class.bg-slate-100]="p.estado==='AL_DIA'" [class.text-slate-700]="p.estado==='AL_DIA'">PL-{{ p.id }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <div class="font-semibold text-slate-900 text-sm" style="font-family:'Montserrat',sans-serif">{{ p.equipoNombre }}</div>
                    <div class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span class="material-symbols-outlined text-[14px] text-slate-400">location_on</span>
                      {{ p.equipoUbicacion ?? p.equipoSerial }} · {{ p.equipoSerial }}
                      @if (p.equipoMarca) { <span class="text-slate-400">· {{ p.equipoMarca }} {{ p.equipoModelo ?? '' }}</span> }
                    </div>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <span class="font-medium text-slate-800">{{ p.frecuenciaDias }}d</span>
                    <span class="block text-slate-400 text-[11px]">{{ freqLabel(p.frecuenciaDias) }}</span>
                    @if (puedeGestionar()) {
                      <button (click)="cambiarFrecuencia(p)" class="text-[11px] text-[#044e46] hover:underline cursor-pointer">Cambiar</button>
                    }
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap font-mono text-slate-600">{{ p.ultimaEjecucion ?? '—' }}</td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <div class="font-mono font-semibold" [class.text-rose-700]="p.estado==='VENCIDO'" [class.text-amber-800]="p.estado==='PROXIMO'" [class.text-slate-800]="p.estado==='AL_DIA'">{{ p.proximaFecha }}</div>
                    <div class="text-[11px]" [class.text-rose-600]="p.estado==='VENCIDO'" [class.text-amber-700]="p.estado==='PROXIMO'" [class.text-slate-500]="p.estado==='AL_DIA'">{{ p.diasRestantes }}d {{ p.estado==='VENCIDO' ? 'vencido' : p.estado==='PROXIMO' ? 'restantes' : 'al día' }}</div>
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border"
                      [class.bg-rose-50]="p.estado==='VENCIDO'" [class.text-rose-700]="p.estado==='VENCIDO'" [class.border-rose-200]="p.estado==='VENCIDO'"
                      [class.bg-amber-50]="p.estado==='PROXIMO'" [class.text-amber-800]="p.estado==='PROXIMO'"
                      [class.bg-emerald-50]="p.estado==='AL_DIA'" [class.text-emerald-800]="p.estado==='AL_DIA'">
                      <span class="w-1.5 h-1.5 rounded-full" [class.bg-rose-600]="p.estado==='VENCIDO'" [class.bg-amber-500]="p.estado==='PROXIMO'" [class.bg-emerald-600]="p.estado==='AL_DIA'"></span> {{ p.estado }}
                    </span>
                  </td>
                  <td class="py-4 px-6 text-right whitespace-nowrap">
                    <div class="inline-flex items-center gap-1">
                      <button (click)="verHistorial(p)" class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer" title="Historial"><span class="material-symbols-outlined text-[18px]">history</span></button>
                      @if (puedeEjecutar()) {
                        <button (click)="abrirEjecucion(p)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight transition cursor-pointer"
                          [class.bg-[#044e46]]="p.estado==='VENCIDO'" [class.text-white]="p.estado==='VENCIDO'" [class.hover:bg-[#033b35]]="p.estado==='VENCIDO'"
                          [class.bg-white]="p.estado!=='VENCIDO'" [class.border]="p.estado!=='VENCIDO'" [class.border-slate-300]="p.estado!=='VENCIDO'" [class.hover:bg-slate-50]="p.estado!=='VENCIDO'">
                          <span class="material-symbols-outlined text-[15px]">assignment_turned_in</span> Registrar
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="py-10 text-center">
                  <div class="flex flex-col items-center gap-2 text-slate-400">
                    <span class="material-symbols-outlined text-[28px]">search_off</span>
                    <span class="text-sm">Sin planes para los filtros actuales.</span>
                    <button (click)="limpiarFiltros()" class="text-xs text-[#044e46] font-medium hover:underline cursor-pointer">Limpiar filtros</button>
                  </div>
                </td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {{ planes().length }} de {{ total() }} · Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</span>
          <div class="flex items-center gap-1">
            <select [(ngModel)]="tamano" (change)="onTamanoChange()" class="rounded border border-slate-200 bg-white px-2 py-1 text-xs cursor-pointer">
              <option [value]="10">10 / pág</option><option [value]="20">20 / pág</option><option [value]="50">50 / pág</option>
            </select>
            <button (click)="prev()" [disabled]="pagina()===0" class="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer">Anterior</button>
            <span class="px-2.5 py-1 font-semibold text-slate-900">{{ pagina()+1 }}</span>
            <button (click)="next()" [disabled]="pagina()+1>=totalPaginas()" class="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer">Siguiente</button>
          </div>
        </div>
      }
    </div>

    <!-- Historial -->
    @if (hist(); as h) {
      <div class="bg-white rounded-sm border border-slate-200/70 shadow-sm overflow-hidden mt-6">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Historial plan #{{ h.planId }}</h3>
          <button (click)="hist.set(null)" class="p-1 rounded hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[18px]">close</span></button>
        </div>
        @if (histCargando()) { <div class="p-6 space-y-2"><ui-skeleton height="16px" /><ui-skeleton height="16px" /></div> }
        @else {
          <ul class="divide-y divide-slate-100">
            @for (r of h.items; track r.id) {
              <li class="px-6 py-3 flex items-center justify-between text-xs">
                <span>{{ r.fechaEjecucion }} — <strong>{{ r.tecnico }}</strong>: {{ r.descripcion ?? '—' }}</span>
                <span class="font-mono text-slate-400">{{ r.creadoEn | slice:0:10 }}</span>
              </li>
            } @empty { <li class="px-6 py-4 text-sm text-slate-400">Sin ejecuciones.</li> }
          </ul>
        }
      </div>
    }

    <!-- Modal: Registrar ejecución -->
    @if (sel(); as s) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" (click)="sel.set(null)">
        <div class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
          <div class="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#044e46] bg-emerald-50 px-2 py-0.5 rounded">Res. 3100</span>
                <span class="text-xs text-slate-400 font-mono">PL-{{ s.id }}</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">Registrar Ejecución</h3>
              <p class="text-xs text-slate-500">{{ s.equipoNombre }} · {{ s.equipoSerial }} · {{ s.equipoUbicacion ?? '' }}</p>
            </div>
            <button (click)="sel.set(null)" class="p-1 rounded-sm hover:bg-slate-100 text-slate-400 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="p-6 space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4">
              <label class="grid gap-1 font-semibold text-slate-700">Fecha* <input type="date" [(ngModel)]="ej.fechaEjecucion" [max]="hoyIso()" class="h-9 rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs focus:border-[#044e46] focus:ring-0" /></label>
              <label class="grid gap-1 font-semibold text-slate-700">Técnico* <input [(ngModel)]="ej.tecnico" placeholder="Nombre técnico" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" /></label>
            </div>
            <label class="grid gap-1 font-semibold text-slate-700">Descripción <input [(ngModel)]="ej.descripcion" placeholder="Opcional" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" /></label>
            @if (ejError()) { <p class="text-xs text-rose-600">{{ ejError() }}</p> }
            <div class="p-3 rounded-sm bg-emerald-50/50 border border-[#044e46]/15 flex items-center gap-3">
              <span class="material-symbols-outlined text-[#044e46] text-[20px]">fingerprint</span>
              <span class="text-[11px] text-[#044e46]">Al registrar se emitirá acta foliada con sello SHA-256.</span>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 p-5 bg-slate-50/60">
            <button (click)="sel.set(null)" class="px-4 py-2 rounded-sm border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer">Cancelar</button>
            <button (click)="guardarEjecucion()" [disabled]="ejGuardando()" class="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50">
              @if (ejGuardando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Registrar y Actualizar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class Planes {
  private readonly api = inject(PlanesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly planes = signal<Plan[]>([]);
  readonly pagina = signal(0);
  tamano = 10;
  readonly total = signal(0);
  readonly totalPaginas = signal(1);
  readonly cargando = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly rev = signal<ResumenRevision | null>(null);
  readonly sel = signal<Plan | null>(null);
  readonly hist = signal<{ planId: number; items: RegistroEjecucion[] } | null>(null);
  readonly histCargando = signal(false);
  readonly syncCargando = signal(false);
  readonly ejGuardando = signal(false);
  readonly ejError = signal<string | null>(null);

  fEstado = '';
  fEquipo: number | null = null;
  orden = 'proximaFecha';
  fQ = '';
  fFrecuencia = '';
  ej = { fechaEjecucion: new Date().toISOString().slice(0, 10), tecnico: '', descripcion: '' };

  private readonly qSubject = new Subject<string>();

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    if (qp.get('estado')) this.fEstado = qp.get('estado')!;
    if (qp.get('equipoId')) this.fEquipo = Number(qp.get('equipoId'));
    if (qp.get('q')) this.fQ = qp.get('q')!;
    this.cargar();
    this.cargarRev();
    this.qSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(v => {
      this.fQ = v; this.pagina.set(0); this.cargar();
    });
  }

  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  puedeEjecutar(): boolean { const r = this.auth.rol(); return r === 'ADMIN' || r === 'INGENIERO' || r === 'TECNICO'; }

  kpiVencidos = computed(() => this.rev()?.vencidos ?? this.planes().filter(p => p.estado === 'VENCIDO').length);
  kpiProximos = computed(() => this.rev()?.proximos ?? this.planes().filter(p => p.estado === 'PROXIMO').length);
  kpiAlDia = computed(() => {
    const r = this.rev();
    if (r) return Math.max(0, this.total() - r.vencidos - r.proximos);
    return this.planes().filter(p => p.estado === 'AL_DIA').length;
  });
  pctAlDia(): number { const t = this.total(); return t === 0 ? 0 : Math.round((this.kpiAlDia() / t) * 100); }

  freqLabel(d: number): string { return d === 30 ? 'Mensual' : d === 90 ? 'Trimestral' : d === 180 ? 'Semestral' : d === 365 ? 'Anual' : d + 'd'; }
  hoyIso(): string { return new Date().toISOString().slice(0, 10); }

  onQChange(v: string): void { this.qSubject.next(v); }
  aplicarFiltros(): void { this.pagina.set(0); this.syncUrl(); this.cargar(); }
  setFiltroEstado(k: string): void { this.fEstado = k; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  clearEquipo(): void { this.fEquipo = null; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  limpiarFiltros(): void { this.fQ=''; this.fFrecuencia=''; this.fEstado=''; this.fEquipo=null; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  private syncUrl(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { estado: this.fEstado || null, equipoId: this.fEquipo || null, q: this.fQ || null }, queryParamsHandling: 'merge' });
  }
  onTamanoChange(): void { this.pagina.set(0); this.cargar(); }

  msg(e: unknown): string { const x = e as { error?: { detail?: string; message?: string } }; return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida'; }

  cargar(): void {
    this.cargando.set(true); this.errorMsg.set(null);
    const freq = this.fFrecuencia ? Number(this.fFrecuencia) : undefined;
    this.api.listar({ pagina: this.pagina(), tamano: this.tamano, orden: this.orden, estado: this.fEstado || undefined, equipoId: this.fEquipo ?? undefined, q: this.fQ || undefined, frecuenciaDias: freq }).subscribe({
      next: (p) => { this.planes.set(p.contenido); this.total.set(p.totalElementos); this.totalPaginas.set(Math.max(1, p.totalPaginas)); this.cargando.set(false); },
      error: (e) => { this.errorMsg.set(this.msg(e)); this.cargando.set(false); },
    });
  }
  cargarRev(): void { this.api.revision().subscribe({ next: (r) => this.rev.set(r) }); }

  sincronizar(): void {
    if (this.syncCargando()) return;
    this.syncCargando.set(true);
    this.api.ejecutarRevision().subscribe({
      next: (r) => { this.rev.set(r); this.toast.exito(`Sincronizado: ${r.vencidos} vencidos, ${r.proximos} próximos`); this.syncCargando.set(false); this.cargar(); },
      error: (e) => { this.syncCargando.set(false); this.toast.error('Operación fallida', this.msg(e)); },
    });
  }
  exportar(): void {
    // Exporta página actual + intenta exportar filtrado completo si total <= 500
    const rows = this.planes();
    if (rows.length === 0) { this.toast.aviso('Nada para exportar', 'No hay planes filtrados'); return; }
    if (rows.length < this.total()) {
      // fetch all for full export
      const freq = this.fFrecuencia ? Number(this.fFrecuencia) : undefined;
      this.api.listar({ pagina: 0, tamano: Math.min(this.total(), 500), orden: this.orden, estado: this.fEstado || undefined, equipoId: this.fEquipo ?? undefined, q: this.fQ || undefined, frecuenciaDias: freq }).subscribe({
        next: (p) => this.descargarCsv(p.contenido),
        error: () => this.descargarCsv(rows),
      });
    } else this.descargarCsv(rows);
  }
  private descargarCsv(rows: Plan[]): void {
    const csv = ['Codigo,Equipo,Serial,Ubicacion,Frecuencia,Ultima,Proxima,Estado,DiasRestantes',
      ...rows.map(p => `PL-${p.id},"${p.equipoNombre}",${p.equipoSerial},"${p.equipoUbicacion ?? ''}",${p.frecuenciaDias},${p.ultimaEjecucion ?? ''},${p.proximaFecha},${p.estado},${p.diasRestantes}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `planes-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    this.toast.exito('Exportado', `${rows.length} planes en CSV`);
  }

  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); this.cargar(); } }

  abrirEjecucion(p: Plan): void { this.ejError.set(null); this.sel.set(p); this.ej = { fechaEjecucion: new Date().toISOString().slice(0, 10), tecnico: '', descripcion: '' }; }
  verHistorial(p: Plan): void {
    this.histCargando.set(true); this.hist.set({ planId: p.id, items: [] });
    this.api.historial(p.id).subscribe({
      next: (items) => { this.hist.set({ planId: p.id, items }); this.histCargando.set(false); },
      error: (e) => { this.histCargando.set(false); this.toast.error('Operación fallida', this.msg(e)); },
    });
  }

  guardarEjecucion(): void {
    const s = this.sel(); if (!s || this.ejGuardando()) return;
    if (!this.ej.tecnico.trim()) { this.ejError.set('Ingresa el responsable'); return; }
    if (!this.ej.fechaEjecucion) { this.ejError.set('Ingresa la fecha'); return; }
    if (this.ej.fechaEjecucion > this.hoyIso()) { this.ejError.set('No puedes registrar una fecha futura'); return; }
    this.ejError.set(null); this.ejGuardando.set(true);
    this.api.registrarEjecucion(s.id, { ...this.ej, tecnico: this.ej.tecnico.trim(), descripcion: this.ej.descripcion?.trim() || undefined }).subscribe({
      next: () => { this.toast.exito('Ejecución registrada'); this.ejGuardando.set(false); this.sel.set(null); this.cargar(); this.cargarRev(); },
      error: (e) => { this.ejGuardando.set(false); this.ejError.set(this.msg(e)); },
    });
  }
  cambiarFrecuencia(p: Plan): void {
    const v = prompt(`Nueva frecuencia (días) para ${p.equipoSerial}:`, String(p.frecuenciaDias));
    if (!v) return; const n=Number(v); if (!Number.isFinite(n) || n < 1) { this.toast.error('Frecuencia inválida', 'Mín 1 día'); return; }
    this.api.cambiarFrecuencia(p.id, n).subscribe({ next: () => { this.toast.exito('Frecuencia actualizada'); this.cargar(); this.cargarRev(); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
}
