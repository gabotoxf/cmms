import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DashboardService, EquiposService, OrdenesService, UsuariosService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import { UiPageHeader } from '../../shared/ui/page-header';
import { UiSkeleton } from '../../shared/ui/skeleton';
import type { CrearOrdenRequest, Equipo, Orden, TipoOrden, Usuario } from '../../core/models';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [FormsModule, UiPageHeader, UiSkeleton],
  template: `
    <ui-page-header title="Órdenes de Trabajo Biomédicas" subtitle="Trazabilidad metrológica y operativa de intervenciones preventivas, correctivas y de calibración bajo Res. 3100 de 2019.">
      @if (puedeGestionar()) {
        <button (click)="generar()" [disabled]="genCargando()" class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-sm hover:bg-slate-50 transition shadow-sm cursor-pointer disabled:opacity-50" style="font-family:'Montserrat',sans-serif">
          <span class="material-symbols-outlined text-[17px] text-slate-500" [class.animate-spin]="genCargando()">auto_schedule</span> Generar Preventivas del Mes
        </button>
        <button (click)="abrirNueva()" class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#044e46] hover:bg-[#033b35] rounded-sm shadow-sm cursor-pointer" style="font-family:'Montserrat',sans-serif">
          <span class="material-symbols-outlined text-[17px]">add</span> Nueva Orden
        </button>
      }
    </ui-page-header>

    <!-- KPIs server -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
      <div (click)="setTab('')" class="cursor-pointer bg-white p-5 rounded-sm border border-slate-200/80 shadow-sm hover:border-slate-300">
        <div class="flex items-center justify-between text-slate-500 mb-3">
          <span class="text-xs font-medium uppercase tracking-wider">Total</span>
          <span class="material-symbols-outlined text-[19px] text-slate-400">receipt_long</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-heading font-bold text-2xl text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ total() }}</span>
          <span class="text-xs text-slate-500">órdenes →</span>
        </div>
      </div>
      <div (click)="setTab('PENDIENTE')" class="cursor-pointer bg-white p-5 rounded-sm border border-slate-200/80 shadow-sm hover:border-rose-200">
        <div class="flex items-center justify-between text-slate-500 mb-3">
          <span class="text-xs font-medium uppercase tracking-wider">Pendientes</span>
          <span class="material-symbols-outlined text-[19px] text-rose-500">error_outline</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-heading font-bold text-2xl text-slate-900 tracking-tight">{{ kpiPendientes() }}</span>
          <span class="text-xs text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">Prioridad →</span>
        </div>
      </div>
      <div (click)="setTab('EN_PROCESO')" class="cursor-pointer bg-white p-5 rounded-sm border border-slate-200/80 shadow-sm hover:border-amber-200">
        <div class="flex items-center justify-between text-slate-500 mb-3">
          <span class="text-xs font-medium uppercase tracking-wider">En Ejecución</span>
          <span class="material-symbols-outlined text-[19px] text-amber-500">build</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-heading font-bold text-2xl text-slate-900 tracking-tight">{{ kpiEnProceso() }}</span>
          <span class="text-xs text-slate-500">en taller →</span>
        </div>
      </div>
      <div class="bg-white p-5 rounded-sm border border-slate-200/80 shadow-sm">
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

    <!-- Filters -->
    <div class="bg-white rounded-sm border border-slate-200/80 p-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm">
      <div class="flex items-center gap-1 overflow-x-auto">
        @for (t of tabs; track t.key) {
          <button (click)="setTab(t.key)" class="px-3 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer whitespace-nowrap"
            [class.bg-slate-900]="fEstado===t.key" [class.text-white]="fEstado===t.key"
            [class.text-slate-600]="fEstado!==t.key" [class.hover:bg-slate-100]="fEstado!==t.key" style="font-family:'Montserrat',sans-serif">
            {{ t.label }}
          </button>
        }
        <button (click)="setTab('')" class="px-3 py-1.5 rounded-sm text-xs font-medium transition cursor-pointer" [class.bg-slate-900]="fEstado===''" [class.text-white]="fEstado===''" [class.text-slate-600]="fEstado!==''" [class.hover:bg-slate-100]="fEstado!==''">Todas</button>
        <span class="w-px h-5 bg-slate-200 mx-1"></span>
        <select [(ngModel)]="fTipo" (change)="aplicarFiltros()" class="py-1.5 pl-2 pr-6 bg-slate-50 border border-slate-200 rounded-sm text-xs text-slate-700 cursor-pointer">
          <option value="">Tipo (todos)</option><option>PREVENTIVO</option><option>CORRECTIVO</option>
        </select>
        <select [(ngModel)]="orden" (change)="aplicarFiltros()" class="py-1.5 pl-2 pr-6 bg-slate-50 border border-slate-200 rounded-sm text-xs cursor-pointer">
          <option value="id">Más recientes</option><option value="fechaProgramada">Fecha prog.</option><option value="estado">Estado</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        @if (fEquipoId) { <button (click)="clearEquipo()" class="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-xs cursor-pointer">Equipo #{{ fEquipoId }} <span class="material-symbols-outlined text-[14px]">close</span></button> }
        <div class="relative w-64">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400 pointer-events-none">search</span>
          <input [ngModel]="fQ" (ngModelChange)="onQChange($event)" class="w-full pl-9 pr-3.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#044e46] focus:bg-white transition" placeholder="Buscar por # OT, equipo o título..." />
        </div>
        <button (click)="exportarCsv()" class="hidden sm:inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-sm cursor-pointer"><span class="material-symbols-outlined text-[16px]">ios_share</span> Exportar</button>
      </div>
    </div>

    <!-- Grid: Table + Sidebar -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-7 items-start mt-4">
      <div class="xl:col-span-9">
        <div class="bg-white rounded-sm border border-slate-200/80 shadow-sm overflow-hidden">
          @if (cargando()) {
            <div class="p-6 space-y-3">@for (_ of [1,2,3,4,5]; track $index) { <ui-skeleton height="52px" /> }</div>
          } @else if (errorMsg()) {
            <div class="p-6 flex items-center justify-between bg-rose-50/40 border-b border-rose-100">
              <span class="text-sm text-rose-800 flex items-center gap-2"><span class="material-symbols-outlined">error</span> {{ errorMsg() }}</span>
              <button (click)="cargar()" class="rounded bg-white border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 cursor-pointer">Reintentar</button>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-200/70 bg-slate-50/60 text-slate-500 font-semibold text-[11px] uppercase tracking-wider" style="font-family:'Montserrat',sans-serif">
                    <th class="py-3 px-5">N° OT</th>
                    <th class="py-3 px-5">Equipo</th>
                    <th class="py-3 px-4">Tipo</th>
                    <th class="py-3 px-4">Estado</th>
                    <th class="py-3 px-5">Protocolo / Falla</th>
                    <th class="py-3 px-5">Técnico</th>
                    <th class="py-3 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  @for (o of ordenes(); track o.id) {
                    <tr class="hover:bg-slate-50/70 transition-colors" [class.bg-[#044e46]/5]="o.estado==='EN_PROCESO'">
                      <td class="py-4 px-5 font-mono font-medium"><span class="bg-slate-100 px-2 py-1 rounded border border-slate-200/60 text-slate-800">OT-{{ o.id }}</span><div class="text-[11px] text-slate-400 font-normal mt-0.5">{{ o.fechaProgramada }}</div></td>
                      <td class="py-4 px-5">
                        <div class="font-semibold text-slate-900 text-sm" style="font-family:'Montserrat',sans-serif">{{ o.equipoNombre || o.equipoSerial }}</div>
                        <div class="text-[11px] text-slate-400 flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">place</span> {{ o.equipoSerial }}</div>
                      </td>
                      <td class="py-4 px-4"><span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
                        [class.bg-emerald-50]="o.tipo==='PREVENTIVO'" [class.text-emerald-800]="o.tipo==='PREVENTIVO'" [class.border-emerald-200]="o.tipo==='PREVENTIVO'"
                        [class.bg-rose-50]="o.tipo==='CORRECTIVO'" [class.text-rose-800]="o.tipo==='CORRECTIVO'" [class.border-rose-200]="o.tipo==='CORRECTIVO'">{{ o.tipo }}</span></td>
                      <td class="py-4 px-4"><span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                        [class.bg-amber-50]="o.estado==='PENDIENTE'" [class.text-amber-800]="o.estado==='PENDIENTE'" [class.border-amber-200]="o.estado==='PENDIENTE'"
                        [class.bg-blue-50]="o.estado==='ASIGNADA'" [class.text-blue-800]="o.estado==='ASIGNADA'" [class.border-blue-200]="o.estado==='ASIGNADA'"
                        [class.bg-teal-50]="o.estado==='EN_PROCESO'" [class.text-teal-800]="o.estado==='EN_PROCESO'" [class.border-teal-200]="o.estado==='EN_PROCESO'"
                        [class.bg-emerald-50]="o.estado==='COMPLETADA'" [class.text-emerald-800]="o.estado==='COMPLETADA'" [class.border-emerald-200]="o.estado==='COMPLETADA'"
                        [class.bg-slate-100]="o.estado==='CANCELADA'" [class.text-slate-600]="o.estado==='CANCELADA'"><span class="w-1.5 h-1.5 rounded-full" [class.bg-amber-500]="o.estado==='PENDIENTE'" [class.bg-blue-500]="o.estado==='ASIGNADA'" [class.bg-teal-500]="o.estado==='EN_PROCESO'" [class.bg-emerald-500]="o.estado==='COMPLETADA'" [class.bg-slate-400]="o.estado==='CANCELADA'"></span> {{ o.estado }}</span></td>
                      <td class="py-4 px-5 max-w-xs"><div class="truncate font-medium text-slate-800">{{ o.titulo }}</div><div class="text-[11px] text-slate-400 truncate">{{ o.descripcion ?? '—' }}</div></td>
                      <td class="py-4 px-5 whitespace-nowrap">
                        @if (o.tecnicoNombre) {
                          <div class="flex items-center gap-2">
                            @if (avatarTecnico(o.tecnicoId); as url) {
                              <img [src]="url" alt="Avatar" class="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0" />
                            } @else {
                              <span class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-semibold shrink-0">{{ inicialesTecnico(o.tecnicoNombre) }}</span>
                            }
                            <span class="font-medium text-slate-800">{{ o.tecnicoNombre }}</span>
                          </div>
                        } @else { <span class="text-slate-400 italic">Sin asignar</span> }
                      </td>
                      <td class="py-4 px-5 text-right whitespace-nowrap">
                        <div class="inline-flex items-center gap-1">
                          <button (click)="verDetalle(o)" class="px-2.5 py-1 text-slate-700 hover:text-[#044e46] hover:bg-slate-100 rounded text-xs font-medium cursor-pointer">Ver</button>
                          @if (o.estado==='PENDIENTE' && puedeGestionar()) {
                            <button (click)="abrirAsignar(o)" class="px-2.5 py-1 bg-[#044e46] text-white rounded text-xs font-semibold hover:bg-[#033b35] cursor-pointer">Asignar</button>
                          }
                          @if (o.estado==='ASIGNADA' && puedeTrabajar(o)) { <button (click)="iniciar(o)" [disabled]="accionId()===o.id" class="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs hover:bg-slate-50 cursor-pointer disabled:opacity-50">Iniciar</button> }
                          @if (o.estado==='EN_PROCESO' && puedeTrabajar(o)) { <button (click)="abrirCerrar(o)" class="px-3 py-1 bg-[#044e46] text-white rounded text-xs font-semibold hover:bg-[#033b35] cursor-pointer">Cerrar OT</button> }
                          @if (o.estado!=='COMPLETADA' && o.estado!=='CANCELADA' && puedeGestionar()) { <button (click)="abrirCancelar(o)" class="p-1 hover:text-rose-600 rounded cursor-pointer"><span class="material-symbols-outlined text-[16px]">cancel</span></button> }
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="7" class="py-12 text-center">
                      <div class="flex flex-col items-center gap-2 text-slate-400">
                        <span class="material-symbols-outlined text-[28px]">search_off</span>
                        <span class="text-sm">Sin órdenes para los filtros actuales.</span>
                        <button (click)="limpiarFiltros()" class="text-xs text-[#044e46] font-medium hover:underline cursor-pointer">Limpiar filtros</button>
                      </div>
                    </td></tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="p-4 bg-slate-50/70 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div class="flex items-center gap-2"><span class="material-symbols-outlined text-[17px] text-[#044e46]">verified</span> Libro foliado auditable.</div>
              <div class="flex items-center gap-2">
                <select [(ngModel)]="tamano" (change)="onTamanoChange()" class="rounded border border-slate-200 bg-white px-2 py-1 text-xs cursor-pointer">
                  <option [value]="10">10 / pág</option><option [value]="20">20 / pág</option><option [value]="50">50 / pág</option>
                </select>
                <button (click)="prev()" [disabled]="pagina()===0" class="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
                <span>Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</span>
                <button (click)="next()" [disabled]="pagina()+1>=totalPaginas()" class="w-7 h-7 flex items-center justify-center rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Sidebar -->
      <div class="xl:col-span-3 space-y-5">
        <div class="bg-white rounded-sm border border-slate-200/80 p-5 shadow-sm">
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
                  @if (avatarTecnico(t.id); as url) {
                    <img [src]="url" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                  } @else {
                    <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold shrink-0">{{ (t.nombre[0] || '') + (t.apellido[0] || '') }}</div>
                  }
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
        <div class="bg-white rounded-sm border border-slate-200/80 p-5 shadow-sm">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-8 h-8 rounded-sm bg-[#044e46]/10 border border-[#044e46]/20 text-[#044e46] flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-[18px]">verified_user</span></div>
            <div>
              <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Patrón de Calibración</h3>
              <p class="text-[11px] text-slate-400">Trazabilidad ONAC</p>
            </div>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed mb-4">Toda acta exige vinculación con equipo patrón vigente.</p>
          <div class="bg-slate-50 border border-slate-200/70 rounded-sm p-3 space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-slate-400">Analizador:</span><span class="font-medium text-slate-800">Fluke ESA615</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Certificado:</span><span class="font-mono text-slate-700">CERT-2024-884</span></div>
            <div class="flex justify-between pt-1 border-t border-slate-200/60"><span class="text-slate-400">Vigencia:</span><span class="text-emerald-700 font-semibold">Abril 2025 (Al día)</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Detalle -->
    @if (detalle(); as d) {
      <div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" (click)="detalle.set(null)">
        <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div>
              <span class="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">OT-{{ d.id }} · {{ d.tipo }}</span>
              <h3 class="font-bold text-sm mt-1" style="font-family:'Montserrat',sans-serif">{{ d.titulo }}</h3>
              <p class="text-xs text-slate-500">{{ d.equipoNombre }} ({{ d.equipoSerial }}) · {{ d.estado }}</p>
            </div>
            <button (click)="detalle.set(null)" class="p-1 rounded hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="px-6 py-4 space-y-2 text-xs">
            <p><span class="font-semibold">Descripción:</span> {{ d.descripcion ?? '—' }}</p>
            <p><span class="font-semibold">Programada:</span> {{ d.fechaProgramada }} · <span class="font-semibold">Técnico:</span> {{ d.tecnicoNombre ?? 'Sin asignar' }}</p>
            @if (d.resultado) { <p><span class="font-semibold">Resultado:</span> {{ d.resultado }}</p> }
            <div class="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-500">
              <span>Asignada: {{ d.asignadaEn ?? '—' }}</span><span>Iniciada: {{ d.iniciadaEn ?? '—' }}</span>
              <span>Completada: {{ d.completadaEn ?? '—' }}</span><span>Cancelada: {{ d.canceladaEn ?? '—' }}</span>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button (click)="detalle.set(null)" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer">Cerrar</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Nueva OT -->
    @if (modalNueva()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" (click)="modalNueva.set(false)">
        <div class="w-full max-w-lg rounded-sm border border-slate-200 bg-white shadow-2xl" (click)="$event.stopPropagation()">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div>
              <h3 class="font-bold text-base text-slate-900" style="font-family:'Montserrat',sans-serif">Nueva Orden de Trabajo</h3>
              <p class="text-xs text-slate-500">Apertura en plan anual hospitalario</p>
            </div>
            <button (click)="modalNueva.set(false)" class="p-1 rounded-sm text-slate-400 hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="p-6 space-y-4 text-xs">
            <label class="grid gap-1 font-semibold text-slate-800">Equipo* 
              <div class="relative">
                <input [(ngModel)]="equipoBusqueda" (ngModelChange)="buscarEquipo($event)" placeholder="Buscar serial o nombre..." class="w-full h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" />
              </div>
              <select [(ngModel)]="nueva.equipoId" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs cursor-pointer">
                @for (e of equiposFiltrados(); track e.id) { <option [value]="e.id">{{ e.serial }} — {{ e.nombre }}</option> }
              </select>
              @if (nuevaError()['equipoId']) { <span class="text-[11px] text-rose-600">{{ nuevaError()['equipoId'] }}</span> }
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 font-semibold text-slate-800">Tipo* <select [(ngModel)]="nueva.tipo" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs cursor-pointer"><option>PREVENTIVO</option><option>CORRECTIVO</option></select></label>
              <label class="grid gap-1 font-semibold text-slate-800">Fecha programada <input type="date" [(ngModel)]="nueva.fechaProgramada" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" /></label>
            </div>
            <label class="grid gap-1 font-semibold text-slate-800">Título* 
              <input [(ngModel)]="nueva.titulo" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" placeholder="Ej: Fuga de presión..." />
              @if (nuevaError()['titulo']) { <span class="text-[11px] text-rose-600">{{ nuevaError()['titulo'] }}</span> }
            </label>
            <label class="grid gap-1 font-semibold text-slate-800">Descripción <input [(ngModel)]="nueva.descripcion" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-xs" placeholder="Detalle..." /></label>
            @if (nuevaError()['general']) { <p class="text-xs text-rose-600">{{ nuevaError()['general'] }}</p> }
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 p-5 bg-slate-50/60">
            <button (click)="modalNueva.set(false)" class="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">Cancelar</button>
            <button (click)="crear()" [disabled]="creando()" class="px-4 py-2 text-xs font-semibold text-white bg-[#044e46] hover:bg-[#033b35] rounded-sm shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
              @if (creando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Crear Orden
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Drawer: Asignar -->
    @if (asignarOrden(); as o) {
      <div class="fixed inset-0 z-50 flex justify-end bg-slate-900/30" (click)="asignarOrden.set(null)">
        <div class="w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <h3 class="font-bold text-sm mb-4" style="font-family:'Montserrat',sans-serif">Asignar OT-{{ o.id }} — {{ o.equipoSerial }}</h3>
          <label class="grid gap-1 text-xs font-semibold">Técnico <select [(ngModel)]="tecSel" class="h-9 rounded-sm border border-slate-200 px-3 text-xs cursor-pointer">@for (t of tecnicos(); track t.id) { <option [value]="t.id">{{ t.nombre }} {{ t.apellido }}</option> }</select></label>
          <div class="mt-4 flex justify-end gap-2">
            <button (click)="asignarOrden.set(null)" class="px-3 py-1.5 rounded border border-slate-200 bg-white text-xs hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button (click)="confirmarAsignar()" [disabled]="asignando()" class="px-4 py-1.5 rounded bg-[#044e46] text-white text-xs font-semibold hover:bg-[#033b35] cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
              @if (asignando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Asignar
            </button>
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
            <button (click)="cerrarOrden.set(null)" class="p-1 rounded-sm hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
            <label class="grid gap-1 font-semibold">Resultado* <textarea [(ngModel)]="resultadoCierre" rows="3" class="rounded-sm border border-slate-200 p-2 text-xs" placeholder="Equipo en servicio / Operativo..."></textarea></label>
            @if (cerrarError()) { <p class="text-xs text-rose-600">{{ cerrarError() }}</p> }
          </div>
          <div class="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-end gap-3">
            <button (click)="cerrarOrden.set(null)" class="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">Cancelar</button>
            <button (click)="ejecutarCerrar()" [disabled]="cerrando()" class="px-4 py-2 text-xs font-semibold text-white bg-[#044e46] hover:bg-[#033b35] rounded-sm shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
              @if (cerrando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Guardar y Emitir Acta
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Dialog: Cancelar -->
    @if (cancelarOrden(); as o) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" (click)="cancelarOrden.set(null)">
        <div class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" (click)="$event.stopPropagation()">
          <h3 class="font-semibold text-sm" style="font-family:'Montserrat',sans-serif">Cancelar OT-{{ o.id }}</h3>
          <p class="text-xs text-slate-500 mt-1">Motivo opcional, quedará en auditoría.</p>
          <textarea [(ngModel)]="motivoCancel" rows="2" class="mt-3 w-full rounded-sm border border-slate-200 p-2 text-xs" placeholder="Motivo..."></textarea>
          <div class="mt-4 flex justify-end gap-2">
            <button (click)="cancelarOrden.set(null)" class="px-3 py-1.5 rounded border border-slate-200 bg-white text-xs cursor-pointer">Volver</button>
            <button (click)="confirmarCancelar()" [disabled]="cancelando()" class="px-4 py-1.5 rounded bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
              @if (cancelando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Confirmar cancelación
            </button>
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
  private readonly dash = inject(DashboardService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly ordenes = signal<Orden[]>([]);
  readonly equipos = signal<Equipo[]>([]);
  readonly equiposFiltrados = signal<Equipo[]>([]);
  readonly tecnicos = signal<Usuario[]>([]);
  readonly avatares = signal<Map<number, string>>(new Map());
  readonly pagina = signal(0);
  tamano = 10;
  readonly total = signal(0);
  readonly totalPaginas = signal(1);
  readonly cargando = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly detalle = signal<Orden | null>(null);
  readonly modalNueva = signal(false);
  readonly asignarOrden = signal<Orden | null>(null);
  readonly cerrarOrden = signal<Orden | null>(null);
  readonly cancelarOrden = signal<Orden | null>(null);
  readonly accionId = signal<number | null>(null);
  readonly creando = signal(false);
  readonly asignando = signal(false);
  readonly cerrando = signal(false);
  readonly cancelando = signal(false);
  readonly genCargando = signal(false);
  readonly cerrarError = signal<string | null>(null);
  readonly nuevaError = signal<Record<string,string>>({});
  motivoCancel = '';
  resultadoCierre = '';

  fEstado = ''; fTipo = ''; fEquipoId: number | null = null;
  fQ = ''; orden = 'id';
  equipoBusqueda = '';
  tecSel: number | null = null;
  nueva: CrearOrdenRequest & { tipo: TipoOrden } = { equipoId: 0, tipo: 'CORRECTIVO', titulo: '', descripcion: '', fechaProgramada: '' };

  readonly tabs = [
    { key: 'PENDIENTE', label: 'Pendientes' },
    { key: 'ASIGNADA', label: 'Asignadas' },
    { key: 'EN_PROCESO', label: 'En Proceso' },
    { key: 'COMPLETADA', label: 'Cerradas' },
  ];

  // KPIs desde dashboard (server)
  readonly kpiPendientes = signal(0);
  readonly kpiEnProceso = signal(0);
  readonly kpiCerradas = signal(0);
  kpiCumplimiento = computed(() => {
    const t = this.total();
    const c = this.kpiCerradas();
    return t === 0 ? 0 : Math.round((c / t) * 100);
  });

  private readonly qSubject = new Subject<string>();
  private readonly equipoQSubject = new Subject<string>();

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    if (qp.get('estado')) this.fEstado = qp.get('estado')!;
    if (qp.get('tipo')) this.fTipo = qp.get('tipo')!;
    if (qp.get('equipoId')) this.fEquipoId = Number(qp.get('equipoId'));
    if (qp.get('q')) this.fQ = qp.get('q')!;
    this.cargar();
    this.cargarKpis();
    this.cargarApoyos();
    this.qSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(v => {
      this.fQ = v; this.pagina.set(0); this.syncUrl(); this.cargar();
    });
    this.equipoQSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(v => this.filtrarEquipos(v));
  }

  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  puedeTrabajar(o?: Orden): boolean {
    const r = this.auth.rol();
    if (r === 'ADMIN' || r === 'INGENIERO') return true;
    if (r === 'TECNICO' && o) {
      const email = this.auth.usuario()?.email;
      return !!o.tecnicoNombre && !!email; // BE bloqueará si no es su orden, UI lo habilita para TECNICO
    }
    return r === 'TECNICO';
  }

  inicialesTecnico(n: string): string { return n.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase(); }
  avatarTecnico(id: number | null | undefined): string | null { return id == null ? null : this.avatares().get(id) ?? null; }

  onQChange(v: string): void { this.qSubject.next(v); }
  buscarEquipo(v: string): void { this.equipoQSubject.next(v); }
  private filtrarEquipos(q: string): void {
    const t=q.toLowerCase().trim();
    if (!t) { this.equiposFiltrados.set(this.equipos()); return; }
    this.equiposFiltrados.set(this.equipos().filter(e => (`${e.serial} ${e.nombre}`.toLowerCase().includes(t))));
    // Si hay pocos localmente y q tiene criterio, fetch remoto
    if (this.equiposFiltrados().length < 5 && t.length >= 2) {
      this.eq.listar({ pagina: 0, tamano: 20, q: t }).subscribe({ next: (p) => this.equiposFiltrados.set(p.contenido) });
    }
  }

  aplicarFiltros(): void { this.pagina.set(0); this.syncUrl(); this.cargar(); }
  setTab(key: string): void { this.fEstado = key; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  limpiarFiltros(): void { this.fQ=''; this.fTipo=''; this.fEstado=''; this.fEquipoId=null; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  clearEquipo(): void { this.fEquipoId=null; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  private syncUrl(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { estado: this.fEstado || null, tipo: this.fTipo || null, equipoId: this.fEquipoId || null, q: this.fQ || null }, queryParamsHandling: 'merge' });
  }
  onTamanoChange(): void { this.pagina.set(0); this.cargar(); }

  msg(e: unknown): string { const x = e as { error?: { detail?: string; message?: string } }; return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida'; }

  cargar(): void {
    this.cargando.set(true); this.errorMsg.set(null);
    this.api.listar({ pagina: this.pagina(), tamano: this.tamano, orden: this.orden, estado: this.fEstado || undefined, tipo: this.fTipo || undefined, equipoId: this.fEquipoId ?? undefined, q: this.fQ || undefined }).subscribe({
      next: (p) => { this.ordenes.set(p.contenido); this.total.set(p.totalElementos); this.totalPaginas.set(Math.max(1, p.totalPaginas)); this.cargando.set(false); },
      error: (e) => { this.errorMsg.set(this.msg(e)); this.cargando.set(false); },
    });
  }
  cargarKpis(): void {
    this.dash.resumen().subscribe({
      next: (r) => {
        this.kpiPendientes.set(r.ordenesPorEstado?.['PENDIENTE'] ?? 0);
        this.kpiEnProceso.set(r.ordenesPorEstado?.['EN_PROCESO'] ?? 0);
        this.kpiCerradas.set(r.ordenesPorEstado?.['COMPLETADA'] ?? 0);
      },
    });
  }
  cargarApoyos(): void {
    this.eq.listar({ pagina: 0, tamano: 100 }).subscribe({ next: (p) => { this.equipos.set(p.contenido); this.equiposFiltrados.set(p.contenido); if (p.contenido[0] && !this.nueva.equipoId) this.nueva.equipoId = p.contenido[0].id; } });
    this.us.listar('TECNICO').subscribe({
      next: (t) => { this.tecnicos.set(t); if (t[0]) this.tecSel = t[0].id; this.cargarAvataresTecnicos(t); },
      error: () => this.us.listar().subscribe({ next: (t) => { this.tecnicos.set(t); this.cargarAvataresTecnicos(t); } }),
    });
  }
  private cargarAvataresTecnicos(usuarios: Usuario[]): void {
    for (const u of usuarios) {
      this.us.avatarDe(u.id).subscribe({
        next: (b) => {
          if (b && b.size > 0) {
            const url = URL.createObjectURL(b);
            const m = new Map(this.avatares()); m.set(u.id, url); this.avatares.set(m);
          }
        },
      });
    }
  }
  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); this.cargar(); } }

  verDetalle(o: Orden): void {
    this.api.obtenerPorId(o.id).subscribe({ next: (f) => this.detalle.set(f), error: (e) => this.toast.error('Operación fallida', this.msg(e)) });
  }
  abrirNueva(): void { this.nuevaError.set({}); this.equipoBusqueda=''; this.modalNueva.set(true); }
  crear(): void {
    const err: Record<string,string> = {};
    if (!this.nueva.equipoId) err['equipoId']='Equipo obligatorio';
    if (!this.nueva.titulo.trim()) err['titulo']='Título obligatorio';
    else if (this.nueva.titulo.trim().length > 150) err['titulo']='Máx 150 caracteres';
    if (Object.keys(err).length) { this.nuevaError.set(err); return; }
    if (this.creando()) return;
    this.creando.set(true);
    this.api.crear({ ...this.nueva, titulo: this.nueva.titulo.trim(), descripcion: this.nueva.descripcion?.trim() || undefined, fechaProgramada: this.nueva.fechaProgramada || undefined }).subscribe({
      next: () => { this.toast.exito('Orden creada'); this.creando.set(false); this.modalNueva.set(false); this.nueva = { equipoId: this.nueva.equipoId, tipo: 'CORRECTIVO', titulo: '', descripcion: '', fechaProgramada: '' }; this.cargar(); this.cargarKpis(); },
      error: (e) => { this.creando.set(false); this.nuevaError.set({ general: this.msg(e) }); },
    });
  }
  abrirAsignar(o: Orden): void { this.asignarOrden.set(o); }
  confirmarAsignar(): void {
    const o = this.asignarOrden(); if (!o || !this.tecSel || this.asignando()) { this.toast.aviso('Falta el técnico', 'Elige un técnico'); return; }
    this.asignando.set(true);
    this.api.asignar(o.id, Number(this.tecSel)).subscribe({
      next: () => { this.asignando.set(false); this.asignarOrden.set(null); this.cargar(); this.cargarKpis(); this.toast.exito('Orden asignada'); },
      error: (e) => { this.asignando.set(false); this.toast.error('Operación fallida', this.msg(e)); },
    });
  }
  iniciar(o: Orden): void {
    if (this.accionId()) return;
    this.accionId.set(o.id);
    this.api.iniciar(o.id).subscribe({
      next: () => { this.accionId.set(null); this.cargar(); this.cargarKpis(); this.toast.exito('OT en proceso'); },
      error: (e) => { this.accionId.set(null); this.toast.error('No se pudo iniciar', this.msg(e)); },
    });
  }
  abrirCerrar(o: Orden): void { this.cerrarError.set(null); this.resultadoCierre = ''; this.cerrarOrden.set(o); }
  ejecutarCerrar(): void {
    const o = this.cerrarOrden(); if (!o || !this.resultadoCierre.trim()) { this.cerrarError.set('Describe el resultado'); return; }
    if (this.cerrando()) return;
    this.cerrando.set(true);
    this.api.completar(o.id, this.resultadoCierre.trim()).subscribe({
      next: () => { this.cerrando.set(false); this.cerrarOrden.set(null); this.cargar(); this.cargarKpis(); this.toast.exito('OT cerrada'); },
      error: (e) => { this.cerrando.set(false); this.cerrarError.set(this.msg(e)); },
    });
  }
  abrirCancelar(o: Orden): void { this.motivoCancel=''; this.cancelarOrden.set(o); }
  confirmarCancelar(): void {
    const o=this.cancelarOrden(); if (!o || this.cancelando()) return;
    this.cancelando.set(true);
    this.api.cancelar(o.id, this.motivoCancel.trim() || undefined).subscribe({
      next: () => { this.cancelando.set(false); this.cancelarOrden.set(null); this.cargar(); this.cargarKpis(); this.toast.exito('OT cancelada'); },
      error: (e) => { this.cancelando.set(false); this.toast.error('No se pudo cancelar', this.msg(e)); },
    });
  }
  generar(): void {
    if (this.genCargando()) return;
    this.genCargando.set(true);
    this.api.generarPreventivas().subscribe({
      next: (r) => { this.genCargando.set(false); this.toast.exito(`Preventivas generadas: ${r.ordenesCreadas}`); this.cargar(); this.cargarKpis(); },
      error: (e) => { this.genCargando.set(false); this.toast.error('Operación fallida', this.msg(e)); },
    });
  }
  exportarCsv(): void {
    const rows=this.ordenes(); if (!rows.length) { this.toast.aviso('Nada para exportar'); return; }
    const csv=['id,equipoSerial,equipoNombre,tipo,estado,titulo,tecnico,fechaProgramada',
      ...rows.map(o=>`${o.id},${o.equipoSerial},"${(o.equipoNombre??'').replace(/"/g,'""')}","${o.tipo}",${o.estado},"${o.titulo.replace(/"/g,'""')}","${(o.tecnicoNombre??'').replace(/"/g,'""')}",${o.fechaProgramada}`)].join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`ordenes-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
}
