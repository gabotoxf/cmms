import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlanesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import { UiPageHeader } from '../../shared/ui/page-header';
import type { Plan, RegistroEjecucion, ResumenRevision } from '../../core/models';

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [FormsModule, UiPageHeader],
  template: `
    <ui-page-header title="Cronograma y Planes de Mantenimiento" subtitle="Supervisión integral de periodicidad técnica y trazabilidad metrológica en parque activo hospitalario.">
      <button (click)="sincronizar()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 text-xs font-medium shadow-sm cursor-pointer">
        <span class="material-symbols-outlined text-[16px] text-slate-500">sync</span> Sincronizar Cronograma
      </button>
      <button (click)="exportar()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 text-xs font-medium shadow-sm cursor-pointer">
        <span class="material-symbols-outlined text-[16px] text-slate-500">ios_share</span> Exportar
      </button>
    </ui-page-header>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-slate-300 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Total Planes Programados</span>
          <span class="material-symbols-outlined text-lg text-slate-400">calendar_month</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ total() }}</span>
          <span class="text-xs text-slate-500">equipos activos</span>
        </div>
        <div class="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> 100% inventariado</div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-slate-300 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Al Día (Cumpliendo)</span>
          <span class="material-symbols-outlined text-lg text-teal-600">check_circle</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiAlDia() }}</span>
          <span class="text-xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{{ pctAlDia() }}%</span>
        </div>
        <div class="mt-3 text-[11px] text-slate-500 flex items-center justify-between"><span>Meta ≥ 95%</span><span class="text-emerald-700 font-medium">Óptimo</span></div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-slate-300 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Próximos a Vencer</span>
          <span class="material-symbols-outlined text-lg text-amber-600">history_toggle_off</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-amber-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiProximos() }}</span>
          <span class="text-xs text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200/50">≤ 15 días</span>
        </div>
        <div class="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Cuadrilla programada</div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-slate-300 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs">Vencidos / Prioritarios</span>
          <span class="material-symbols-outlined text-lg text-rose-600">notification_important</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-rose-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ kpiVencidos() }}</span>
          <span class="text-xs text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded font-medium border border-rose-200/60">Urgente</span>
        </div>
        <div class="mt-3 text-[11px] text-rose-700 flex items-center gap-1.5 font-medium"><span class="material-symbols-outlined text-[13px]">warning</span> Riesgo no conformidad</div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white p-3 rounded-sm border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-6">
      <div class="relative flex-1 min-w-[260px]">
        <span class="material-symbols-outlined text-slate-400 absolute left-3 top-2.5 text-[18px]">search</span>
        <input [(ngModel)]="busqueda" (ngModelChange)="filtrar()" class="w-full bg-transparent pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 border-none rounded-sm focus:ring-1 focus:ring-[#044e46] focus:bg-slate-50/50 transition" placeholder="Buscar por código, equipo, serie o servicio..." />
      </div>
      <div class="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <select [(ngModel)]="fFrecuencia" (ngModelChange)="filtrar()" class="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-sm py-1 px-2.5 cursor-pointer">
          <option value="">Todas las frecuencias</option><option value="30">Mensual (30d)</option><option value="90">Trimestral (90d)</option><option value="180">Semestral (180d)</option><option value="365">Anual (365d)</option>
        </select>
        <select [(ngModel)]="fEstado" (ngModelChange)="pagina.set(0); cargar()" class="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-sm py-1 px-2.5 cursor-pointer">
          <option value="">Todos los estados</option><option>VENCIDO</option><option>PROXIMO</option><option>AL_DIA</option>
        </select>
        <div class="flex items-center bg-slate-100 p-0.5 rounded-sm text-xs">
          <button (click)="setTab('')" class="px-3 py-1 rounded-sm font-medium cursor-pointer" [class.bg-white]="tab()===''" [class.shadow-sm]="tab()===''" [class.text-slate-900]="tab()===''" [class.text-slate-600]="tab()!==''">Todos</button>
          <button (click)="setTab('VENCIDO')" class="px-3 py-1 rounded-sm cursor-pointer" [class.bg-white]="tab()==='VENCIDO'" [class.shadow-sm]="tab()==='VENCIDO'" [class.text-slate-900]="tab()==='VENCIDO'" [class.text-slate-600]="tab()!=='VENCIDO'">Vencidos</button>
          <button (click)="setTab('PROXIMO')" class="px-3 py-1 rounded-sm cursor-pointer" [class.bg-white]="tab()==='PROXIMO'" [class.shadow-sm]="tab()==='PROXIMO'" [class.text-slate-900]="tab()==='PROXIMO'" [class.text-slate-600]="tab()!=='PROXIMO'">Próximos</button>
          <button (click)="setTab('AL_DIA')" class="px-3 py-1 rounded-sm cursor-pointer" [class.bg-white]="tab()==='AL_DIA'" [class.shadow-sm]="tab()==='AL_DIA'" [class.text-slate-900]="tab()==='AL_DIA'" [class.text-slate-600]="tab()!=='AL_DIA'">Al día</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-sm border border-slate-200/70 shadow-sm overflow-hidden mt-4">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Planes de Intervención Programados</h2>
          <p class="text-xs text-slate-500 mt-0.5">Cronograma técnico oficial sujeto a verificación Res. 3100.</p>
        </div>
        <span class="text-xs text-slate-400 font-mono">Mostrando {{ filtrados().length }} de {{ total() }} registros</span>
      </div>
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
            @for (p of paginados(); track p.id) {
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="py-4 px-6 font-mono font-medium whitespace-nowrap">
                  <span class="px-2 py-1 rounded text-[11px] border"
                    [class.bg-rose-50]="p.estado==='VENCIDO'" [class.text-rose-800]="p.estado==='VENCIDO'" [class.border-rose-200]="p.estado==='VENCIDO'"
                    [class.bg-amber-50]="p.estado==='PROXIMO'" [class.text-amber-800]="p.estado==='PROXIMO'"
                    [class.bg-slate-100]="p.estado==='AL_DIA'" [class.text-slate-700]="p.estado==='AL_DIA'">PL-{{ p.id }}</span>
                </td>
                <td class="py-4 px-6">
                  <div class="font-semibold text-slate-900 text-sm" style="font-family:'Montserrat',sans-serif">{{ p.equipoNombre }}</div>
                  <div class="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5"><span class="material-symbols-outlined text-[14px] text-slate-400">location_on</span> {{ p.equipoSerial }} • ID {{ p.id }}</div>
                </td>
                <td class="py-4 px-6 whitespace-nowrap"><span class="font-medium text-slate-800">{{ p.frecuenciaDias }}d</span><span class="block text-slate-400 text-[11px]">{{ freqLabel(p.frecuenciaDias) }}</span></td>
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
                  <button (click)="abrirEjecucion(p)" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium tracking-tight transition cursor-pointer"
                    [class.bg-[#044e46]]="p.estado==='VENCIDO'" [class.text-white]="p.estado==='VENCIDO'" [class.hover:bg-[#033b35]]="p.estado==='VENCIDO'"
                    [class.bg-white]="p.estado!=='VENCIDO'" [class.border]="p.estado!=='VENCIDO'" [class.border-slate-300]="p.estado!=='VENCIDO'" [class.hover:bg-slate-50]="p.estado!=='VENCIDO'">
                    <span class="material-symbols-outlined text-[15px]">assignment_turned_in</span> Registrar Ejecución
                  </button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="py-10 text-center text-sm text-slate-400">Sin planes.</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Mostrando {{ paginados().length }} de {{ filtrados().length }} filtrados ({{ total() }} totales)</span>
        <div class="flex items-center gap-1">
          <button (click)="prev()" [disabled]="pagina()===0" class="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer">Anterior</button>
          <span class="px-2.5 py-1 font-semibold text-slate-900">{{ pagina()+1 }}</span>
          <button (click)="next()" [disabled]="pagina()+1>=totalPaginas()" class="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer">Siguiente</button>
        </div>
      </div>
    </div>

    <!-- Historial -->
    @if (hist(); as h) {
      <div class="bg-white rounded-sm border border-slate-200/70 shadow-sm overflow-hidden mt-6">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Historial plan #{{ h.planId }}</h3>
          <button (click)="hist.set(null)" class="p-1 rounded hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[18px]">close</span></button>
        </div>
        <ul class="divide-y divide-slate-100">
          @for (r of h.items; track r.id) {
            <li class="px-6 py-3 flex items-center justify-between text-xs">
              <span>{{ r.fechaEjecucion }} — <strong>{{ r.tecnico }}</strong>: {{ r.descripcion ?? '—' }}</span>
              <button (click)="hist.set(null)" class="text-slate-400 hover:text-slate-600">×</button>
            </li>
          } @empty { <li class="px-6 py-4 text-sm text-slate-400">Sin ejecuciones.</li> }
        </ul>
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
              <p class="text-xs text-slate-500">{{ s.equipoNombre }} • {{ s.equipoSerial }}</p>
            </div>
            <button (click)="sel.set(null)" class="p-1 rounded-sm hover:bg-slate-100 text-slate-400 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="p-6 space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4">
              <label class="grid gap-1 font-semibold text-slate-700">Fecha* <input type="date" [(ngModel)]="ej.fechaEjecucion" class="h-9 rounded-sm border border-slate-200 bg-slate-50 px-3 text-xs focus:border-[#044e46] focus:ring-0" /></label>
              <label class="grid gap-1 font-semibold text-slate-700">Técnico* <input [(ngModel)]="ej.tecnico" placeholder="Nombre técnico" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" /></label>
            </div>
            <label class="grid gap-1 font-semibold text-slate-700">Descripción <input [(ngModel)]="ej.descripcion" placeholder="Opcional" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" /></label>
            <div class="p-3 rounded-sm bg-emerald-50/50 border border-[#044e46]/15 flex items-center gap-3">
              <span class="material-symbols-outlined text-[#044e46] text-[20px]">fingerprint</span>
              <span class="text-[11px] text-[#044e46]">Al registrar se emitirá acta foliada con sello SHA-256.</span>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 p-5 bg-slate-50/60">
            <button (click)="sel.set(null)" class="px-4 py-2 rounded-sm border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer">Cancelar</button>
            <button (click)="guardarEjecucion()" class="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold shadow-sm cursor-pointer"><span class="material-symbols-outlined text-[17px]">verified</span> Registrar y Actualizar</button>
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

  readonly planes = signal<Plan[]>([]);
  readonly pagina = signal(0);
  readonly total = signal(0);
  readonly totalPaginas = signal(1);
  readonly rev = signal<ResumenRevision | null>(null);
  readonly sel = signal<Plan | null>(null);
  readonly hist = signal<{ planId: number; items: RegistroEjecucion[] } | null>(null);

  fEstado = ''; fEquipo: number | null = null;
  busqueda = ''; fFrecuencia = '';
  readonly tab = signal('');
  ej = { fechaEjecucion: new Date().toISOString().slice(0, 10), tecnico: '', descripcion: '' };

  private todosPlanes: Plan[] = [];

  constructor() { this.cargar(); this.cargarRev(); }

  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  puedeEjecutar(): boolean { const r = this.auth.rol(); return r === 'ADMIN' || r === 'INGENIERO' || r === 'TECNICO'; }

  // KPIs
  kpiVencidos = computed(() => this.rev()?.vencidos ?? this.planes().filter(p => p.estado === 'VENCIDO').length);
  kpiProximos = computed(() => this.rev()?.proximos ?? this.planes().filter(p => p.estado === 'PROXIMO').length);
  kpiAlDia = computed(() => {
    const r = this.rev();
    if (r) return this.total() - r.vencidos - r.proximos;
    return this.planes().filter(p => p.estado === 'AL_DIA').length;
  });
  pctAlDia(): number { const t = this.total(); return t === 0 ? 0 : Math.round((this.kpiAlDia() / t) * 100); }

  filtrados = computed(() => {
    let list = this.planes();
    const q = this.busqueda.toLowerCase().trim();
    if (q) list = list.filter(p => (`PL-${p.id}`.toLowerCase().includes(q) || p.equipoNombre.toLowerCase().includes(q) || p.equipoSerial.toLowerCase().includes(q)));
    if (this.fFrecuencia) list = list.filter(p => String(p.frecuenciaDias) === this.fFrecuencia);
    if (this.tab() && this.tab() !== '') list = list.filter(p => p.estado === this.tab());
    return list;
  });

  paginados = computed(() => {
    const all = this.filtrados();
    const size = 10;
    const start = this.pagina() * size;
    return all.slice(start, start + size);
  });

  freqLabel(d: number): string { return d === 30 ? 'Mensual' : d === 90 ? 'Trimestral' : d === 180 ? 'Semestral' : d === 365 ? 'Anual' : d + 'd'; }

  setTab(k: string): void { this.tab.set(k); this.fEstado = k; this.pagina.set(0); this.cargar(); }

  filtrar(): void { this.pagina.set(0); }

  msg(e: unknown): string { const x = e as { error?: { detail?: string; message?: string } }; return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida'; }

  cargar(): void {
    this.api.listar({ pagina: this.pagina(), tamano: 50, estado: this.fEstado || undefined, equipoId: this.fEquipo ?? undefined }).subscribe({
      next: (p) => { this.planes.set(p.contenido); this.todosPlanes = p.contenido; this.total.set(p.totalElementos); this.totalPaginas.set(Math.max(1, Math.ceil(this.filtrados().length / 10))); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  cargarRev(): void { this.api.revision().subscribe({ next: (r) => this.rev.set(r) }); }

  sincronizar(): void { this.api.ejecutarRevision().subscribe({ next: (r) => { this.rev.set(r); this.toast.exito(`Sincronizado: ${r.vencidos} vencidos, ${r.proximos} próximos`); this.cargar(); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) }); }
  exportar(): void {
    const rows = this.filtrados();
    if (rows.length === 0) { this.toast.aviso('Nada para exportar', 'No hay planes filtrados'); return; }
    const csv = ['Codigo,Equipo,Serial,Frecuencia,Ultima,Proxima,Estado,DiasRestantes',
      ...rows.map(p => `PL-${p.id},"${p.equipoNombre}",${p.equipoSerial},${p.frecuenciaDias},${p.ultimaEjecucion ?? ''},${p.proximaFecha},${p.estado},${p.diasRestantes}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `planes-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    this.toast.exito('Exportado', `${rows.length} planes en CSV`);
  }

  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); } }

  abrirEjecucion(p: Plan): void { this.sel.set(p); this.ej = { fechaEjecucion: new Date().toISOString().slice(0, 10), tecnico: '', descripcion: '' }; }
  verHistorial(p: Plan): void { this.api.historial(p.id).subscribe({ next: (items) => this.hist.set({ planId: p.id, items }), error: (e) => this.toast.error('Operación fallida', this.msg(e)) }); }

  guardarEjecucion(): void {
    const s = this.sel(); if (!s) return;
    if (!this.ej.tecnico.trim()) { this.toast.error('Falta técnico', 'Ingresa el responsable'); return; }
    this.api.registrarEjecucion(s.id, { ...this.ej, tecnico: this.ej.tecnico.trim(), descripcion: this.ej.descripcion?.trim() || undefined }).subscribe({
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
