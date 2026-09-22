import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquiposService, OrdenesService, UsuariosService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import type { CrearOrdenRequest, Equipo, Orden, TipoOrden, Usuario } from '../../core/models';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Title & Action Bar -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
      <div class="min-w-0 flex-1 max-w-[50%]">
        <div class="flex items-center gap-2.5 mb-1.5">
          <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Órdenes de Trabajo Biomédicas</h1>
        </div>
        <p class="text-sm text-slate-500 leading-relaxed">
          Trazabilidad metrológica y operativa de intervenciones preventivas, correctivas y de calibración bajo Res. 3100 de 2019.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        @if (puedeGestionar()) {
          <button (click)="generar()" class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition shadow-sm cursor-pointer" style="font-family:'Montserrat',sans-serif">
            <span class="material-symbols-outlined text-[17px] text-slate-500">auto_schedule</span> Generar Preventivas del Mes
          </button>
          <button (click)="modalNueva.set(true)" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#044e46] hover:bg-[#033b35] rounded-md shadow-sm cursor-pointer" style="font-family:'Montserrat',sans-serif">
            <span class="material-symbols-outlined text-[17px]">add</span> Nueva Orden
          </button>
        }
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-3">
          <span class="text-xs font-medium uppercase tracking-wider">Total del Mes</span>
          <span class="material-symbols-outlined text-[19px] text-slate-400">receipt_long</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-heading font-bold text-2xl text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ total() }}</span>
          <span class="text-xs text-slate-500">órdenes</span>
        </div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-3">
          <span class="text-xs font-medium uppercase tracking-wider">Pendientes</span>
          <span class="material-symbols-outlined text-[19px] text-rose-500">error_outline</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-heading font-bold text-2xl text-slate-900 tracking-tight">{{ kpiPendientes() }}</span>
          <span class="text-xs text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">Prioridad</span>
        </div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-3">
          <span class="text-xs font-medium uppercase tracking-wider">En Ejecución</span>
          <span class="material-symbols-outlined text-[19px] text-amber-500">build</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-heading font-bold text-2xl text-slate-900 tracking-tight">{{ kpiEnProceso() }}</span>
          <span class="text-xs text-slate-500">en taller</span>
        </div>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-3">
          <span class="text-xs font-medium uppercase tracking-wider">Tasa Cumplimiento</span>
          <span class="material-symbols-outlined text-[19px] text-[#0f766e]">check_circle</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-heading font-bold text-2xl text-[#044e46] tracking-tight">{{ kpiCumplimiento() }}%</span>
          <span class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Meta &gt;90%</span>
        </div>
      </div>
    </div>

    <!-- Grid: Table + Sidebar -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start">
      <div class="xl:col-span-9 space-y-4">
        <!-- Filters -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
            @for (t of tabs; track t.key) {
              <button (click)="setTab(t.key)" class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap"
                [class.bg-slate-900]="fEstado===t.key" [class.text-white]="fEstado===t.key"
                [class.text-slate-600]="fEstado!==t.key" [class.hover:bg-slate-100]="fEstado!==t.key" style="font-family:'Montserrat',sans-serif">
                {{ t.label }} <span class="ml-1 opacity-70">{{ tabCount(t.key) }}</span>
              </button>
            }
            <button (click)="setTab('')" class="px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer" [class.bg-slate-900]="fEstado===''" [class.text-white]="fEstado===''" [class.text-slate-600]="fEstado!==''" [class.hover:bg-slate-100]="fEstado!==''">Todas</button>
          </div>
          <div class="w-full md:w-72 relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400 pointer-events-none">search</span>
            <input [(ngModel)]="busqueda" (ngModelChange)="filtrarBusqueda()" class="w-full pl-9 pr-3.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#044e46] focus:bg-white transition" placeholder="Buscar por # OT, equipo o técnico..." />
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-semibold text-[11px] uppercase tracking-wider" style="font-family:'Montserrat',sans-serif">
                  <th class="py-3 px-5">N° OT</th>
                  <th class="py-3 px-5">Equipo &amp; Ubicación</th>
                  <th class="py-3 px-4">Tipo</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-5">Protocolo / Falla</th>
                  <th class="py-3 px-5">Técnico</th>
                  <th class="py-3 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (o of filtradas(); track o.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors" [class.bg-[#044e46]/5]="o.estado==='EN_PROCESO'">
                    <td class="py-4 px-5 font-mono font-medium"><span class="bg-slate-100 px-2 py-1 rounded border border-slate-200/60 text-slate-800">OT-{{ o.id }}</span></td>
                    <td class="py-4 px-5">
                      <div class="font-semibold text-slate-900 text-sm" style="font-family:'Montserrat',sans-serif">{{ o.equipoNombre || o.equipoSerial }}</div>
                      <div class="text-[11px] text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">place</span> {{ o.equipoSerial }}</div>
                    </td>
                    <td class="py-4 px-4"><span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
                      [class.bg-emerald-50]="o.tipo==='PREVENTIVO'" [class.text-emerald-800]="o.tipo==='PREVENTIVO'" [class.border-emerald-200]="o.tipo==='PREVENTIVO'"
                      [class.bg-rose-50]="o.tipo==='CORRECTIVO'" [class.text-rose-800]="o.tipo==='CORRECTIVO'" [class.border-rose-200]="o.tipo==='CORRECTIVO'">{{ o.tipo }}</span></td>
                    <td class="py-4 px-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                      [class.bg-amber-50]="o.estado==='PENDIENTE'" [class.text-amber-800]="o.estado==='PENDIENTE'" [class.border-amber-200]="o.estado==='PENDIENTE'"
                      [class.bg-blue-50]="o.estado==='ASIGNADA'" [class.text-blue-800]="o.estado==='ASIGNADA'"
                      [class.bg-amber-50]="o.estado==='EN_PROCESO'" [class.text-amber-900]="o.estado==='EN_PROCESO'"
                      [class.bg-slate-100]="o.estado==='COMPLETADA' || o.estado==='CANCELADA'"><span class="w-1.5 h-1.5 rounded-full" [class.bg-amber-500]="o.estado==='PENDIENTE'" [class.bg-blue-500]="o.estado==='ASIGNADA'" [class.bg-amber-500]="o.estado==='EN_PROCESO'" [class.bg-slate-400]="o.estado==='COMPLETADA'"></span> {{ o.estado }}</span></td>
                    <td class="py-4 px-5 max-w-xs"><div class="truncate font-medium text-slate-800">{{ o.titulo }}</div><div class="text-[11px] text-slate-400 truncate">{{ o.descripcion ?? '—' }}</div></td>
                    <td class="py-4 px-5 whitespace-nowrap">
                      @if (o.tecnicoNombre) {
                        <div class="flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-semibold">{{ inicialesTecnico(o.tecnicoNombre) }}</span><span class="font-medium text-slate-800">{{ o.tecnicoNombre }}</span></div>
                      } @else { <span class="text-slate-400 italic">Sin asignar</span> }
                    </td>
                    <td class="py-4 px-5 text-right whitespace-nowrap">
                      <div class="inline-flex items-center gap-1">
                        <button (click)="ver(o)" class="px-2.5 py-1 text-slate-700 hover:text-[#044e46] hover:bg-slate-100 rounded text-xs font-medium cursor-pointer">Ver</button>
                        @if (o.estado==='PENDIENTE' && puedeGestionar()) {
                          <button (click)="abrirAsignar(o)" class="px-2.5 py-1 bg-[#044e46] text-white rounded text-xs font-semibold hover:bg-[#033b35] cursor-pointer">Asignar</button>
                        }
                        @if (o.estado==='ASIGNADA' && puedeTrabajar()) { <button (click)="iniciar(o)" class="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 cursor-pointer">Iniciar</button> }
                        @if (o.estado==='EN_PROCESO' && puedeTrabajar()) { <button (click)="abrirCerrar(o)" class="px-3 py-1 bg-[#044e46] text-white rounded text-xs font-semibold hover:bg-[#033b35] cursor-pointer">Cerrar OT</button> }
                        @if (o.estado!=='COMPLETADA' && o.estado!=='CANCELADA' && puedeGestionar()) { <button (click)="cancelar(o)" class="p-1 hover:text-rose-600 rounded cursor-pointer"><span class="material-symbols-outlined text-[16px]">cancel</span></button> }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="7" class="py-10 text-center text-sm text-slate-400">Sin órdenes.</td></tr>
                }
              </tbody>
            </table>
          </div>
          <div class="p-4 bg-slate-50/70 border-t border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[17px] text-[#044e46]">verified</span> Libro foliado auditable ante Secretaría y MinSalud.</div>
            <div class="flex items-center gap-2">
              <button (click)="prev()" [disabled]="pagina()===0" class="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
              <span>Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</span>
              <button (click)="next()" [disabled]="pagina()+1>=totalPaginas()" class="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="xl:col-span-3 space-y-5">
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Personal en Turno</h3>
              <p class="text-[11px] text-slate-400">Equipo técnico asistencial</p>
            </div>
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div class="space-y-3.5">
            @for (t of tecnicos(); track t.id) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold">{{ (t.nombre[0] || '') + (t.apellido[0] || '') }}</div>
                  <div>
                    <div class="text-xs font-semibold text-slate-900">{{ t.nombre }} {{ t.apellido }}</div>
                    <div class="text-[11px] text-slate-400">{{ t.rol }}</div>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">Disponible</span>
              </div>
            } @empty { <p class="text-xs text-slate-400">Sin técnicos registrados.</p> }
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 rounded-lg bg-[#044e46]/10 border border-[#044e46]/20 text-[#044e46] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[18px]">verified_user</span></div>
            <div>
              <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Patrón de Calibración</h3>
              <p class="text-[11px] text-slate-400">Trazabilidad ONAC</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed mb-4">Toda acta exige vinculación con equipo patrón vigente.</p>
          <div class="bg-slate-50 border border-slate-200/70 rounded-lg p-3 space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-400">Analizador:</span><span class="font-medium text-slate-800">Fluke ESA615</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Certificado:</span><span class="font-mono text-slate-700">CERT-2024-884</span></div>
            <div class="flex justify-between pt-1 border-t border-slate-200/60"><span class="text-slate-400">Vigencia:</span><span class="text-emerald-700 font-semibold">Abril 2025 (Al día)</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nueva OT -->
    @if (modalNueva()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" (click)="modalNueva.set(false)">
        <div class="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl" (click)="$event.stopPropagation()">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <h3 class="font-bold text-base text-slate-900" style="font-family:'Montserrat',sans-serif">Nueva Orden de Trabajo</h3>
              <p class="text-xs text-slate-500">Apertura en plan anual hospitalario</p>
            </div>
            <button (click)="modalNueva.set(false)" class="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="p-6 space-y-4 text-xs">
            <label class="grid gap-1 font-semibold text-slate-800">Equipo* <select [(ngModel)]="nueva.equipoId" class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs cursor-pointer">@for (e of equipos(); track e.id) { <option [value]="e.id">{{ e.serial }} — {{ e.nombre }}</option> }</select></label>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 font-semibold text-slate-800">Tipo* <select [(ngModel)]="nueva.tipo" class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs cursor-pointer"><option>PREVENTIVO</option><option>CORRECTIVO</option></select></label>
              <label class="grid gap-1 font-semibold text-slate-800">Fecha programada <input type="date" [(ngModel)]="nueva.fechaProgramada" class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs" /></label>
            </div>
            <label class="grid gap-1 font-semibold text-slate-800">Título* <input [(ngModel)]="nueva.titulo" class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs" placeholder="Ej: Fuga de presión..." /></label>
            <label class="grid gap-1 font-semibold text-slate-800">Descripción <input [(ngModel)]="nueva.descripcion" class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs" placeholder="Detalle..." /></label>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 p-5 bg-slate-50/60">
            <button (click)="modalNueva.set(false)" class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">Cancelar</button>
            <button (click)="crear()" class="px-4 py-2 text-xs font-semibold text-white bg-[#044e46] hover:bg-[#033b35] rounded-lg shadow-sm cursor-pointer">Crear Orden</button>
          </div>
        </div>
      </div>
    }

    <!-- Drawer: Asignar -->
    @if (asignarOrden(); as o) {
      <div class="fixed inset-0 z-50 flex justify-end bg-slate-900/30" (click)="asignarOrden.set(null)">
        <div class="w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-sm mb-4" style="font-family:'Montserrat',sans-serif">Asignar OT-{{ o.id }} — {{ o.equipoSerial }}</h3>
          <label class="grid gap-1 text-xs font-semibold">Técnico <select [(ngModel)]="tecSel" class="h-9 rounded-lg border border-slate-200 px-3 text-xs cursor-pointer">@for (t of tecnicos(); track t.id) { <option [value]="t.id">{{ t.nombre }} {{ t.apellido }}</option> }</select></label>
          <div class="mt-4 flex justify-end gap-2">
            <button (click)="asignarOrden.set(null)" class="px-3 py-1.5 rounded border border-slate-200 bg-white text-xs hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button (click)="confirmarAsignar()" class="px-4 py-1.5 rounded bg-[#044e46] text-white text-xs font-semibold hover:bg-[#033b35] cursor-pointer">Asignar</button>
          </div>
        </div>
      </div>
    }

    <!-- Drawer: Cerrar OT -->
    @if (cerrarOrden(); as o) {
      <div class="fixed inset-0 z-50 flex justify-end bg-slate-900/30" (click)="cerrarOrden.set(null)">
        <div class="w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
          <div class="p-6 border-b border-slate-100 bg-slate-50/60 flex items-start justify-between">
            <div>
              <span class="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200">OT-{{ o.id }}</span>
              <h3 class="font-bold text-base mt-1" style="font-family:'Montserrat',sans-serif">Cerrar OT — {{ o.equipoSerial }}</h3>
              <p class="text-xs text-slate-500">Protocolo Res. 3100</p>
            </div>
            <button (click)="cerrarOrden.set(null)" class="p-1 rounded-md hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
            <label class="grid gap-1 font-semibold">Resultado* <textarea [(ngModel)]="resultadoCierre" rows="3" class="rounded-lg border border-slate-200 p-2 text-xs" placeholder="Equipo en servicio / Operativo..."></textarea></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked class="rounded border-slate-300 text-[#044e46]" /> <span>Prueba de seguridad eléctrica</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked class="rounded border-slate-300 text-[#044e46]" /> <span>Calibración conforme</span></label>
          </div>
          <div class="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
            <button (click)="cerrarOrden.set(null)" class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">Cancelar</button>
            <button (click)="ejecutarCerrar()" class="px-4 py-2 text-xs font-semibold text-white bg-[#044e46] hover:bg-[#033b35] rounded-lg shadow-sm cursor-pointer">Guardar y Emitir Acta</button>
          </div>
        </div>
      </div>
    }
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
  readonly total = signal(0);
  readonly busqueda = signal('');
  readonly modalNueva = signal(false);
  readonly asignarOrden = signal<Orden | null>(null);
  readonly cerrarOrden = signal<Orden | null>(null);
  resultadoCierre = '';

  fEstado = '';
  fTipo = '';
  tecSel: number | null = null;
  nueva: CrearOrdenRequest & { tipo: TipoOrden } = { equipoId: 0, tipo: 'CORRECTIVO', titulo: '', descripcion: '', fechaProgramada: '' };

  readonly tabs = [
    { key: 'PENDIENTE', label: 'Pendientes' },
    { key: 'ASIGNADA', label: 'Asignadas' },
    { key: 'EN_PROCESO', label: 'En Proceso' },
    { key: 'COMPLETADA', label: 'Cerradas' },
  ];

  readonly filtradas = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    if (!q) return this.ordenes();
    return this.ordenes().filter(o => (`OT-${o.id}`.toLowerCase().includes(q) || o.equipoSerial.toLowerCase().includes(q) || (o.tecnicoNombre ?? '').toLowerCase().includes(q) || o.titulo.toLowerCase().includes(q)));
  });

  constructor() { this.cargar(); this.cargarApoyos(); }

  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  puedeTrabajar(): boolean { const r = this.auth.rol(); return r === 'ADMIN' || r === 'INGENIERO' || r === 'TECNICO'; }

  kpiPendientes = computed(() => this.ordenes().filter(o => o.estado === 'PENDIENTE').length);
  kpiEnProceso = computed(() => this.ordenes().filter(o => o.estado === 'EN_PROCESO').length);
  kpiCumplimiento = computed(() => {
    const t = this.total();
    const c = this.ordenes().filter(o => o.estado === 'COMPLETADA').length;
    return t === 0 ? 0 : Math.round((c / t) * 100);
  });

  tabCount(key: string): number { return this.ordenes().filter(o => o.estado === key).length; }

  inicialesTecnico(n: string): string { return n.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase(); }

  setTab(key: string): void { this.fEstado = key; this.pagina.set(0); this.cargar(); }

  filtrarBusqueda(): void { /* computed filtradas se encarga */ }

  msg(e: unknown): string { const x = e as { error?: { detail?: string; message?: string } }; return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida'; }

  cargar(): void {
    this.api.listar({ pagina: this.pagina(), tamano: 10, estado: this.fEstado || undefined, tipo: this.fTipo || undefined }).subscribe({
      next: (p) => { this.ordenes.set(p.contenido); this.total.set(p.totalElementos); this.totalPaginas.set(Math.max(1, p.totalPaginas)); },
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
    this.api.obtenerPorId(o.id).subscribe({ next: (f) => this.ordenes.update(list => list.map(x => x.id === f.id ? f : x)), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  crear(): void {
    this.api.crear({ ...this.nueva, descripcion: this.nueva.descripcion || undefined, fechaProgramada: this.nueva.fechaProgramada || undefined }).subscribe({
      next: () => { this.toast.exito('Orden creada'); this.modalNueva.set(false); this.cargar(); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  abrirAsignar(o: Orden): void { this.asignarOrden.set(o); }
  confirmarAsignar(): void {
    const o = this.asignarOrden(); if (!o || !this.tecSel) { this.toast.aviso('Falta el técnico', 'Elige un técnico'); return; }
    this.api.asignar(o.id, Number(this.tecSel)).subscribe({ next: () => { this.asignarOrden.set(null); this.cargar(); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  iniciar(o: Orden): void { this.api.iniciar(o.id).subscribe({ next: () => this.cargar(), error: (e) => this.toast.error('Operación fallida', this.msg(e)) }); }
  abrirCerrar(o: Orden): void { this.resultadoCierre = ''; this.cerrarOrden.set(o); }
  ejecutarCerrar(): void {
    const o = this.cerrarOrden(); if (!o || !this.resultadoCierre.trim()) { this.toast.error('Falta resultado', 'Describe el resultado'); return; }
    this.api.completar(o.id, this.resultadoCierre.trim()).subscribe({ next: () => { this.cerrarOrden.set(null); this.cargar(); this.toast.exito('OT cerrada'); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  cancelar(o: Orden): void {
    const m = prompt('Motivo de cancelación (opcional):') ?? undefined;
    this.api.cancelar(o.id, m || undefined).subscribe({ next: () => this.cargar(), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  generar(): void {
    this.api.generarPreventivas().subscribe({ next: (r) => { this.toast.exito(`Preventivas generadas: ${r.ordenesCreadas}`); this.cargar(); }, error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
}
