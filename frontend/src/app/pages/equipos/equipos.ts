import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CargaMasivaService, EquiposService, PlanesService, ReportesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import { UiPageHeader } from '../../shared/ui/page-header';
import type { ClasificacionRiesgo, Equipo, EquipoRequest, Plan, ResultadoCarga } from '../../core/models';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [FormsModule, UiPageHeader],
  template: `
    <ui-page-header title="Inventario de Equipos" subtitle="Gestión centralizada del estándar de dotación hospitalaria, hojas de vida técnica y trazabilidad ante INVIMA y MinSalud.">
      <div class="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-md px-3 py-1.5 shadow-sm">
        <span class="material-symbols-outlined text-[16px] text-[#044e46]">verified</span>
        <span>Estándar Dotación: <strong class="text-slate-700">Conforme</strong></span>
      </div>
      @if (puedeGestionar()) {
        <button (click)="nuevo()" class="inline-flex items-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm cursor-pointer">
          <span class="material-symbols-outlined text-[17px]">add</span>
          <span>Registrar Equipo</span>
        </button>
        <button (click)="cargaVisible.set(true)" class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-md cursor-pointer">
          <span class="material-symbols-outlined text-[17px]">upload_file</span>
          <span>Carga masiva</span>
        </button>
      }
    </ui-page-header>

    <!-- KPIs -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Total Equipos</span>
          <span class="material-symbols-outlined text-[19px] text-slate-400">devices</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ total() }}</span>
          <span class="text-xs text-slate-400">registrados</span>
        </div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Operativos</span>
          <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ kpiOperativos() }}</span>
          <span class="text-xs text-emerald-700 font-medium">disponibles</span>
        </div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">En Mantenimiento</span>
          <span class="w-2 h-2 rounded-full bg-amber-500/80"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ kpiMantenimiento() }}</span>
          <span class="text-xs text-slate-500">en taller</span>
        </div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Fuera de Servicio</span>
          <span class="w-2 h-2 rounded-full bg-rose-500/80"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ kpiFuera() }}</span>
          <span class="text-xs text-rose-700 font-medium">baja / repuesto</span>
        </div>
      </div>
    </section>

    <!-- Main table -->
    <section class="bg-white border border-slate-200/70 rounded-xl shadow-sm overflow-hidden mt-6">
      <div class="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-slate-400 pointer-events-none">search</span>
          <input [(ngModel)]="fUbicacion" (ngModelChange)="pagina.set(0); cargar()" class="w-full pl-10 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-sm text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#044e46] transition-all" placeholder="Buscar por serie, modelo o servicio..." />
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <select [(ngModel)]="fRiesgo" (ngModelChange)="pagina.set(0); cargar()" class="py-2 pl-3 pr-8 bg-slate-50/80 border border-slate-200 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#044e46] cursor-pointer">
            <option value="">Riesgo (todos)</option><option>I</option><option>IIA</option><option>IIB</option><option>III</option>
          </select>
          <select [(ngModel)]="fEstado" (ngModelChange)="pagina.set(0); cargar()" class="py-2 pl-3 pr-8 bg-slate-50/80 border border-slate-200 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#044e46] cursor-pointer">
            <option value="">Estado (todos)</option><option>OPERATIVO</option><option>EN_MANTENIMIENTO</option><option>FUERA_DE_SERVICIO</option><option>DADO_DE_BAJA</option>
          </select>
          <button (click)="pagina.set(0); cargar()" class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-sm cursor-pointer">Filtrar</button>
          <button (click)="cargar()" class="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-sm cursor-pointer"><span class="material-symbols-outlined text-[16px]">refresh</span></button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold tracking-tight uppercase text-[11px]" style="font-family:'Montserrat',sans-serif">
              <th class="py-3.5 px-6">Código / Serie</th>
              <th class="py-3.5 px-6">Equipo y Marca/Modelo</th>
              <th class="py-3.5 px-6">Servicio Hospitalario</th>
              <th class="py-3.5 px-6">Riesgo INVIMA</th>
              <th class="py-3.5 px-6">Estado Operativo</th>
              <th class="py-3.5 px-6">Próx. Calibración / Mant.</th>
              <th class="py-3.5 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            @for (e of equipos(); track e.id) {
              <tr class="hover:bg-slate-50/70 transition-colors group">
                <td class="py-4 px-6 whitespace-nowrap">
                  <div class="font-semibold text-slate-900 group-hover:text-[#044e46]" style="font-family:'Montserrat',sans-serif">{{ e.serial }}</div>
                  <div class="text-[11px] text-slate-400 font-mono">ID #{{ e.id }}</div>
                </td>
                <td class="py-4 px-6">
                  <div class="font-medium text-slate-900">{{ e.nombre }}</div>
                  <div class="text-[11px] text-slate-500">{{ e.marca ?? '—' }} {{ e.modelo ?? '' }}</div>
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px] text-slate-400">domain</span><span>{{ e.ubicacion }}</span></div>
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
                    [class.bg-rose-50]="e.clasificacionRiesgo==='III'" [class.text-rose-700]="e.clasificacionRiesgo==='III'" [class.border-rose-100]="e.clasificacionRiesgo==='III'"
                    [class.bg-slate-100]="e.clasificacionRiesgo!=='III'" [class.text-slate-700]="e.clasificacionRiesgo!=='III'" [class.border-slate-200]="e.clasificacionRiesgo!=='III'">{{ e.clasificacionRiesgo }}</span>
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border"
                    [class.bg-emerald-50]="e.estado==='OPERATIVO'" [class.text-emerald-700]="e.estado==='OPERATIVO'" [class.border-emerald-100]="e.estado==='OPERATIVO'"
                    [class.bg-amber-50]="e.estado==='EN_MANTENIMIENTO'" [class.text-amber-600]="e.estado==='EN_MANTENIMIENTO'" [class.border-amber-100]="e.estado==='EN_MANTENIMIENTO'"
                    [class.bg-rose-50]="e.estado==='FUERA_DE_SERVICIO'" [class.text-rose-700]="e.estado==='FUERA_DE_SERVICIO'" [class.border-rose-100]="e.estado==='FUERA_DE_SERVICIO'"
                    [class.bg-slate-100]="e.estado==='DADO_DE_BAJA'" [class.text-slate-600]="e.estado==='DADO_DE_BAJA'">
                    <span class="w-1.5 h-1.5 rounded-full" [class.bg-emerald-600]="e.estado==='OPERATIVO'" [class.bg-amber-500]="e.estado==='EN_MANTENIMIENTO'" [class.bg-rose-500]="e.estado==='FUERA_DE_SERVICIO'" [class.bg-slate-400]="e.estado==='DADO_DE_BAJA'"></span>
                    {{ e.estado }}
                  </span>
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  @if (planEquipo() && detalle()?.id===e.id) {
                    <div class="text-[11px] text-slate-500">{{ planEquipo()?.proximaFecha }}</div>
                  } @else {
                    <div class="text-[11px] text-slate-400">—</div>
                  }
                </td>
                <td class="py-4 px-6 whitespace-nowrap text-right">
                  <div class="inline-flex items-center justify-end gap-1 text-slate-500">
                    <button (click)="ver(e)" class="p-1.5 hover:text-[#044e46] hover:bg-white rounded cursor-pointer" title="Ver"><span class="material-symbols-outlined text-[18px]">visibility</span></button>
                    @if (puedeGestionar()) { <button (click)="editar(e)" class="p-1.5 hover:text-[#044e46] hover:bg-white rounded cursor-pointer" title="Editar"><span class="material-symbols-outlined text-[18px]">edit</span></button> }
                    <button (click)="hojaDeVida(e)" class="p-1.5 hover:text-[#044e46] hover:bg-white rounded cursor-pointer" title="PDF"><span class="material-symbols-outlined text-[18px]">description</span></button>
                    @if (puedeGestionar()) {
                      <select [ngModel]="e.estado" (ngModelChange)="cambiarEstado(e, $event)" class="h-7 text-[11px] rounded border border-slate-200 bg-white px-1 cursor-pointer">
                        <option>OPERATIVO</option><option>EN_MANTENIMIENTO</option><option>FUERA_DE_SERVICIO</option>
                      </select>
                      <button (click)="confirmarBaja.set(e)" class="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer" title="Dar de baja"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="py-10 text-center text-sm text-slate-400">Sin equipos.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <div class="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>Mostrando <span class="font-medium text-slate-800">{{ equipos().length }}</span> de <span class="font-medium text-slate-800">{{ total() }}</span> equipos</div>
        <div class="flex items-center gap-1.5">
          <button (click)="prev()" [disabled]="pagina()===0" class="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Anterior</button>
          <span class="px-2">Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</span>
          <button (click)="next()" [disabled]="pagina()+1>=totalPaginas()" class="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Siguiente</button>
        </div>
      </div>
    </section>

    <!-- Modal: Registrar/Editar -->
    @if (formVisible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" (click)="cerrarForm()">
        <div class="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">{{ editando() ? 'Editar equipo' : 'Registrar equipo' }}</h3>
              <p class="mt-0.5 text-xs text-slate-500">Completa los datos de la hoja de vida técnica (Res. 3100 de 2019).</p>
            </div>
            <button (click)="cerrarForm()" class="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="grid grid-cols-2 gap-4 px-6 py-5">
            <label class="grid gap-1 text-xs font-medium text-slate-600">Serial* <input [(ngModel)]="form.serial" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Nombre* <input [(ngModel)]="form.nombre" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Marca <input [(ngModel)]="form.marca" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Modelo <input [(ngModel)]="form.modelo" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Ubicación* <input [(ngModel)]="form.ubicacion" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Riesgo INVIMA* <select [(ngModel)]="form.clasificacionRiesgo" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm cursor-pointer"><option>I</option><option>IIA</option><option>IIB</option><option>III</option></select></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Adquisición <input type="date" [(ngModel)]="form.fechaAdquisicion" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Periodicidad (días)* <input type="number" min="1" [(ngModel)]="form.periodicidadMantenimientoDias" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" /></label>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button (click)="cerrarForm()" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button (click)="guardar()" class="rounded-sm bg-[#044e46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#033b35] cursor-pointer">Guardar</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Ver detalle -->
    @if (detalle(); as d) {
      <div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" (click)="detalle.set(null)">
        <div class="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-sm bg-emerald-50 text-[#044e46] flex items-center justify-center"><span class="material-symbols-outlined text-[22px]">vital_signs</span></div>
              <div>
                <h3 class="font-bold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Ficha técnica: {{ d.serial }}</h3>
                <p class="text-xs text-slate-400">ID #{{ d.id }} · {{ d.ubicacion }}</p>
              </div>
            </div>
            <button (click)="detalle.set(null)" class="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="px-6 py-4 space-y-3 text-sm">
            <p><span class="font-medium">Equipo:</span> {{ d.nombre }} · {{ d.marca ?? '—' }} {{ d.modelo ?? '' }}</p>
            <p><span class="font-medium">Riesgo:</span> {{ d.clasificacionRiesgo }} · <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border bg-slate-100">{{ d.estado }}</span> · Cada {{ d.periodicidadMantenimientoDias }} días</p>
            @if (planEquipo(); as p) { <p class="text-slate-500">Plan: próxima {{ p.proximaFecha }} ({{ p.diasRestantes }}d, {{ p.estado }})</p> }
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button (click)="detalle.set(null)" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer">Cerrar</button>
            <button (click)="hojaDeVida(d)" class="rounded-sm bg-[#044e46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#033b35] cursor-pointer">Hoja de vida PDF</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Carga masiva -->
    @if (cargaVisible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" (click)="cargaVisible.set(false)">
        <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div>
              <h3 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Carga masiva</h3>
              <p class="mt-0.5 text-xs text-slate-500">Importa hasta 2.000 equipos desde CSV o Excel (.xlsx). Plantilla con serial, nombre, ubicación, riesgo.</p>
            </div>
            <button (click)="cargaVisible.set(false)" class="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="flex items-center gap-3 rounded-sm border border-dashed border-slate-300 bg-slate-50 p-4">
              <span class="material-symbols-outlined text-slate-400">upload_file</span>
              <input type="file" accept=".csv,.xlsx" (change)="elegir($event)" class="text-sm flex-1" />
            </div>
            <button (click)="subir()" [disabled]="!archivo" class="w-full inline-flex items-center justify-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-4 py-2 rounded-sm disabled:opacity-40 cursor-pointer">Subir archivo</button>
            @if (resultado(); as r) {
              <div class="rounded-sm bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <p><span class="font-medium">Filas leídas:</span> {{ r.filasLeidas }} · <span class="font-medium">Creados:</span> {{ r.equiposCreados }} · <span class="font-medium">Errores:</span> {{ r.errores.length }}</p>
                @for (e of r.errores; track e.fila) { <p class="text-rose-600">Fila {{ e.fila }} ({{ e.serial }}): {{ e.motivo }}</p> }
              </div>
            }
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button (click)="cargaVisible.set(false)" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer">Cerrar</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Confirmar baja -->
    @if (confirmarBaja(); as e) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" (click)="confirmarBaja.set(null)">
        <div class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl" (click)="$event.stopPropagation()">
          <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600"><span class="material-symbols-outlined text-[20px]">warning</span></div>
          <h3 class="text-sm font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">¿Dar de baja el equipo?</h3>
          <p class="mt-1 text-xs text-slate-500">Se marcará <strong>{{ e.serial }}</strong> como <strong>DADO_DE_BAJA</strong>. Conservará trazabilidad pero no aparecerá como operativo.</p>
          <div class="mt-5 flex justify-center gap-2">
            <button (click)="confirmarBaja.set(null)" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs font-medium hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button (click)="ejecutarBaja()" class="rounded-sm bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer">Dar de baja</button>
          </div>
        </div>
      </div>
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

  readonly kpiOperativos = signal(0);
  readonly kpiMantenimiento = signal(0);
  readonly kpiFuera = signal(0);

  fUbicacion = ''; fRiesgo = ''; fEstado = '';
  readonly formVisible = signal(false);
  readonly cargaVisible = signal(false);
  readonly confirmarBaja = signal<Equipo | null>(null);
  editando = signal<number | null>(null);
  form: EquipoRequest & { marca?: string | null; modelo?: string | null; fechaAdquisicion?: string | null } = this.vacio();
  archivo: File | null = null;

  constructor() { this.cargar(); this.cargarKpis(); }

  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }

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
  cargarKpis(): void {
    this.api.listar({ pagina: 0, tamano: 1, estado: 'OPERATIVO' }).subscribe({ next: (p) => this.kpiOperativos.set(p.totalElementos) });
    this.api.listar({ pagina: 0, tamano: 1, estado: 'EN_MANTENIMIENTO' }).subscribe({ next: (p) => this.kpiMantenimiento.set(p.totalElementos) });
    this.api.listar({ pagina: 0, tamano: 1, estado: 'FUERA_DE_SERVICIO' }).subscribe({ next: (p) => this.kpiFuera.set(p.totalElementos) });
  }
  cerrarForm(): void { this.formVisible.set(false); this.editando.set(null); }
  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); this.cargar(); } }
  ver(e: Equipo): void {
    this.planEquipo.set(null);
    this.api.obtenerPorId(e.id).subscribe({ next: (d) => this.detalle.set(d), error: (er) => this.toast.error('Operación fallida', this.msg(er)) });
    this.planes.obtenerPorEquipo(e.id).subscribe({ next: (p) => this.planEquipo.set(p), error: () => this.planEquipo.set(null) });
  }
  nuevo(): void {
    this.form = this.vacio(); this.editando.set(null); this.formVisible.set(true);
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
      next: () => { this.toast.exito('Equipo guardado'); this.cerrarForm(); this.cargar(); this.cargarKpis(); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
  cambiarEstado(e: Equipo, estado: string): void {
    this.api.cambiarEstado(e.id, estado).subscribe({ next: () => { this.cargar(); this.cargarKpis(); }, error: (er) => this.toast.error('Operación fallida', this.msg(er)) });
  }
  baja(e: Equipo): void { this.confirmarBaja.set(e); }
  ejecutarBaja(): void {
    const e = this.confirmarBaja();
    if (!e) return;
    this.api.darDeBaja(e.id).subscribe({
      next: () => { this.confirmarBaja.set(null); this.cargar(); this.cargarKpis(); this.toast.exito('Equipo dado de baja'); },
      error: (er) => this.toast.error('Operación fallida', this.msg(er)),
    });
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
      next: (r) => { this.resultado.set(r); this.cargar(); this.cargarKpis(); },
      error: (e) => this.toast.error('Operación fallida', this.msg(e)),
    });
  }
}
