import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CargaMasivaService, DashboardService, EquiposService, PlanesService, ReportesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { AuthService } from '../../core/auth.service';
import { UiPageHeader } from '../../shared/ui/page-header';
import { UiSkeleton } from '../../shared/ui/skeleton';
import type { ClasificacionRiesgo, Equipo, EquipoRequest, Plan, ResultadoCarga } from '../../core/models';

@Component({
  selector: 'app-equipos',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe, UiPageHeader, UiSkeleton],
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
        <button (click)="abrirCarga()" class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-md cursor-pointer">
          <span class="material-symbols-outlined text-[17px]">upload_file</span>
          <span>Carga masiva</span>
        </button>
      }
    </ui-page-header>

    <!-- KPIs: desde dashboard resumen (1 request), clicables -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <a (click)="filtrarEstado('')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-slate-300 transition-colors">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Total Equipos</span>
          <span class="material-symbols-outlined text-[19px] text-slate-400">devices</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ total() }}</span>
          <span class="text-xs text-slate-400">registrados →</span>
        </div>
      </a>
      <a (click)="filtrarEstado('OPERATIVO')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-emerald-200">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Operativos</span>
          <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ kpiOperativos() }}</span>
          <span class="text-xs text-emerald-700 font-medium">disponibles →</span>
        </div>
      </a>
      <a (click)="filtrarEstado('EN_MANTENIMIENTO')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-amber-200">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">En Mantenimiento</span>
          <span class="w-2 h-2 rounded-full bg-amber-500/80"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ kpiMantenimiento() }}</span>
          <span class="text-xs text-slate-500">en taller →</span>
        </div>
      </a>
      <a (click)="filtrarEstado('FUERA_DE_SERVICIO')" class="cursor-pointer bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm hover:border-rose-200">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Fuera de Servicio</span>
          <span class="w-2 h-2 rounded-full bg-rose-500/80"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900">{{ kpiFuera() }}</span>
          <span class="text-xs text-rose-700 font-medium">baja / repuesto →</span>
        </div>
      </a>
    </section>

    <!-- Main table -->
    <section class="bg-white border border-slate-200/70 rounded-xl shadow-sm overflow-hidden mt-6">
      <div class="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-slate-400 pointer-events-none">search</span>
          <input [(ngModel)]="fQ" (ngModelChange)="onQChange($event)" class="w-full pl-10 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-sm text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#044e46] transition-all" placeholder="Buscar por serie, nombre, marca o servicio..." />
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <select [(ngModel)]="fRiesgo" (change)="aplicarFiltros()" class="py-2 pl-3 pr-8 bg-slate-50/80 border border-slate-200 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#044e46] cursor-pointer">
            <option value="">Riesgo (todos)</option><option>I</option><option>IIA</option><option>IIB</option><option>III</option>
          </select>
          <select [(ngModel)]="fEstado" (change)="aplicarFiltros()" class="py-2 pl-3 pr-8 bg-slate-50/80 border border-slate-200 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#044e46] cursor-pointer">
            <option value="">Estado (todos)</option><option>OPERATIVO</option><option>EN_MANTENIMIENTO</option><option>FUERA_DE_SERVICIO</option><option>DADO_DE_BAJA</option>
          </select>
          <select [(ngModel)]="orden" (change)="aplicarFiltros()" class="py-2 pl-3 pr-8 bg-slate-50/80 border border-slate-200 rounded-sm text-xs text-slate-700 cursor-pointer" title="Ordenar">
            <option value="id">Más recientes</option><option value="serial">Serial</option><option value="nombre">Nombre</option><option value="ubicacion">Ubicación</option>
          </select>
          <button (click)="exportarCsv()" class="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-sm cursor-pointer" title="Exportar filtrados a CSV">
            <span class="material-symbols-outlined text-[16px]">ios_share</span> Exportar
          </button>
          <button (click)="cargar()" class="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-2 rounded-sm cursor-pointer"><span class="material-symbols-outlined text-[16px]">refresh</span></button>
        </div>
      </div>

      @if (cargando()) {
        <div class="p-6 space-y-3">
          @for (_ of [1,2,3,4,5]; track $index) { <ui-skeleton height="44px" /> }
        </div>
      } @else if (errorMsg()) {
        <div class="p-8 flex items-center justify-between bg-rose-50/50 border-y border-rose-100">
          <span class="text-sm text-rose-800 flex items-center gap-2"><span class="material-symbols-outlined">error</span> {{ errorMsg() }}</span>
          <button (click)="cargar()" class="rounded bg-white border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 cursor-pointer">Reintentar</button>
        </div>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold tracking-tight uppercase text-[11px]" style="font-family:'Montserrat',sans-serif">
                <th class="py-3.5 px-6">Código / Serie</th>
                <th class="py-3.5 px-6">Equipo y Marca/Modelo</th>
                <th class="py-3.5 px-6">Servicio Hospitalario</th>
                <th class="py-3.5 px-6">Riesgo INVIMA</th>
                <th class="py-3.5 px-6">Estado Operativo</th>
                <th class="py-3.5 px-6">Próx. Mant.</th>
                <th class="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (e of equipos(); track e.id) {
                <tr class="hover:bg-slate-50/70 transition-colors group" [class.opacity-60]="e.estado==='DADO_DE_BAJA'">
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
                  <td class="py-4 px-6 whitespace-nowrap text-[11px]">
                    @if (planPorEquipo()[e.id]; as pl) {
                      <span class="font-mono" [class.text-rose-600]="pl.estado==='VENCIDO'" [class.text-amber-600]="pl.estado==='PROXIMO'" [class.text-slate-500]="pl.estado==='AL_DIA'">{{ pl.proximaFecha }} · {{ pl.estado }}</span>
                      <span class="block text-slate-400">{{ pl.diasRestantes }}d</span>
                    } @else {
                      <span class="text-slate-400">—</span>
                    }
                  </td>
                  <td class="py-4 px-6 whitespace-nowrap text-right">
                    <div class="inline-flex items-center justify-end gap-1 text-slate-500">
                      <button (click)="ver(e)" class="p-1.5 hover:text-[#044e46] hover:bg-white rounded cursor-pointer" title="Ver"><span class="material-symbols-outlined text-[18px]">visibility</span></button>
                      @if (puedeGestionar() && e.estado!=='DADO_DE_BAJA') { <button (click)="editar(e)" class="p-1.5 hover:text-[#044e46] hover:bg-white rounded cursor-pointer" title="Editar"><span class="material-symbols-outlined text-[18px]">edit</span></button> }
                      <button (click)="hojaDeVida(e)" [disabled]="pdfCargandoId()===e.id" class="p-1.5 hover:text-[#044e46] hover:bg-white rounded cursor-pointer disabled:opacity-50" title="PDF"><span class="material-symbols-outlined text-[18px]">{{ pdfCargandoId()===e.id ? 'hourglass_top' : 'description' }}</span></button>
                      @if (puedeCambiarEstado() && e.estado!=='DADO_DE_BAJA') {
                        <select [ngModel]="e.estado" (ngModelChange)="cambiarEstado(e, $event)" [disabled]="cambiandoId()===e.id" class="h-7 text-[11px] rounded border border-slate-200 bg-white px-1 cursor-pointer disabled:opacity-50">
                          <option>OPERATIVO</option><option>EN_MANTENIMIENTO</option><option>FUERA_DE_SERVICIO</option>
                        </select>
                      }
                      @if (puedeGestionar() && e.estado!=='DADO_DE_BAJA') {
                        <button (click)="confirmarBaja.set(e)" class="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer" title="Dar de baja"><span class="material-symbols-outlined text-[18px]">delete</span></button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="py-12 text-center">
                  <div class="flex flex-col items-center gap-2 text-slate-400">
                    <span class="material-symbols-outlined text-[28px]">search_off</span>
                    <span class="text-sm">Sin equipos para los filtros actuales.</span>
                    <button (click)="limpiarFiltros()" class="text-xs text-[#044e46] font-medium hover:underline cursor-pointer">Limpiar filtros</button>
                  </div>
                </td></tr>
              }
            </tbody>
          </table>
        </div>

        <div class="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>Mostrando <span class="font-medium text-slate-800">{{ equipos().length }}</span> de <span class="font-medium text-slate-800">{{ total() }}</span> equipos · Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</div>
          <div class="flex items-center gap-1.5">
            <select [ngModel]="tamano" (ngModelChange)="tamano=$event; pagina.set(0); cargar()" class="rounded border border-slate-200 bg-white px-2 py-1 text-xs cursor-pointer">
              <option [value]="10">10 / pág</option><option [value]="20">20 / pág</option><option [value]="50">50 / pág</option>
            </select>
            <button (click)="prev()" [disabled]="pagina()===0" class="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Anterior</button>
            <button (click)="next()" [disabled]="pagina()+1>=totalPaginas()" class="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Siguiente</button>
          </div>
        </div>
      }
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
            <label class="grid gap-1 text-xs font-medium text-slate-600">Serial* 
              <input [(ngModel)]="form.serial" [class.border-rose-300]="formErrors()['serial']" class="h-9 rounded-sm border bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#044e46]" [class.border-slate-200]="!formErrors()['serial']" />
              @if (formErrors()['serial']) { <span class="text-[11px] text-rose-600">{{ formErrors()['serial'] }}</span> }
            </label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Nombre* 
              <input [(ngModel)]="form.nombre" [class.border-rose-300]="formErrors()['nombre']" class="h-9 rounded-sm border bg-white px-3 text-sm" [class.border-slate-200]="!formErrors()['nombre']" />
              @if (formErrors()['nombre']) { <span class="text-[11px] text-rose-600">{{ formErrors()['nombre'] }}</span> }
            </label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Marca <input [(ngModel)]="form.marca" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Modelo <input [(ngModel)]="form.modelo" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Ubicación* 
              <input [(ngModel)]="form.ubicacion" [class.border-rose-300]="formErrors()['ubicacion']" class="h-9 rounded-sm border bg-white px-3 text-sm" [class.border-slate-200]="!formErrors()['ubicacion']" />
              @if (formErrors()['ubicacion']) { <span class="text-[11px] text-rose-600">{{ formErrors()['ubicacion'] }}</span> }
            </label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Riesgo INVIMA* <select [(ngModel)]="form.clasificacionRiesgo" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm cursor-pointer"><option>I</option><option>IIA</option><option>IIB</option><option>III</option></select></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Adquisición <input type="date" [(ngModel)]="form.fechaAdquisicion" class="h-9 rounded-sm border border-slate-200 bg-white px-3 text-sm" /></label>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Periodicidad (días)* 
              <input type="number" min="1" [(ngModel)]="form.periodicidadMantenimientoDias" [class.border-rose-300]="formErrors()['periodicidad']" class="h-9 rounded-sm border bg-white px-3 text-sm" [class.border-slate-200]="!formErrors()['periodicidad']" />
              @if (formErrors()['periodicidad']) { <span class="text-[11px] text-rose-600">{{ formErrors()['periodicidad'] }}</span> }
            </label>
          </div>
          @if (formErrors()['general']) { <div class="mx-6 mb-3 rounded bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">{{ formErrors()['general'] }}</div> }
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button (click)="cerrarForm()" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button (click)="guardar()" [disabled]="guardando()" class="rounded-sm bg-[#044e46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#033b35] cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
              @if (guardando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Guardar
            </button>
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
            @if (planDetalle(); as p) { <p class="text-slate-500">Plan: próxima {{ p.proximaFecha }} ({{ p.diasRestantes }}d, {{ p.estado }})</p> }
          </div>
          <div class="flex justify-between border-t border-slate-100 px-6 py-4">
            <div class="flex gap-2">
              <a [routerLink]="['/planes']" [queryParams]="{equipoId: d.id}" (click)="detalle.set(null)" class="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer">Ver planes</a>
              <a [routerLink]="['/ordenes']" [queryParams]="{equipoId: d.id}" (click)="detalle.set(null)" class="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer">Ver órdenes</a>
            </div>
            <div class="flex gap-2">
              <button (click)="detalle.set(null)" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer">Cerrar</button>
              <button (click)="hojaDeVida(d)" class="rounded-sm bg-[#044e46] px-4 py-2 text-xs font-semibold text-white hover:bg-[#033b35] cursor-pointer">Hoja de vida PDF</button>
            </div>
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
              <p class="mt-0.5 text-xs text-slate-500">Importa hasta 2.000 equipos desde CSV o Excel (.xlsx). Plantilla: serial, nombre, ubicacion, riesgo, periodicidadDias.</p>
            </div>
            <button (click)="cargaVisible.set(false)" class="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <button (click)="descargarPlantilla()" class="text-xs text-[#044e46] font-medium hover:underline cursor-pointer inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">download</span> Descargar plantilla CSV</button>
            <div class="flex items-center gap-3 rounded-sm border border-dashed p-4" [class.border-slate-300]="!archivo" [class.bg-slate-50]="!archivo" [class.border-emerald-300]="!!archivo" [class.bg-emerald-50/50]="!!archivo">
              <span class="material-symbols-outlined" [class.text-slate-400]="!archivo" [class.text-emerald-600]="!!archivo">{{ archivo ? 'check_circle' : 'upload_file' }}</span>
              <div class="flex-1 min-w-0">
                <input type="file" accept=".csv,.xlsx" (change)="elegir($event)" class="text-sm w-full" />
                @if (archivo) { <p class="text-xs text-emerald-700 truncate">{{ archivo.name }} · {{ (archivo.size/1024) | number:'1.0-0' }} KB</p> }
              </div>
              @if (archivo) { <button (click)="archivo=null; resultado.set(null)" class="text-xs text-slate-500 hover:text-slate-800 cursor-pointer">Quitar</button> }
            </div>
            <button (click)="subir()" [disabled]="!archivo || subiendo()" class="w-full inline-flex items-center justify-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-4 py-2 rounded-sm disabled:opacity-40 cursor-pointer">
              @if (subiendo()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Subir archivo
            </button>
            @if (resultado(); as r) {
              <div class="rounded-sm bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                <p><span class="font-medium">Filas leídas:</span> {{ r.filasLeidas }} · <span class="font-medium">Creados:</span> {{ r.equiposCreados }} · <span class="font-medium">Errores:</span> {{ r.errores.length }}</p>
                @for (e of r.errores.slice(0,20); track e.fila) { <p class="text-rose-600">Fila {{ e.fila }} ({{ e.serial }}): {{ e.motivo }}</p> }
                @if (r.errores.length > 20) { <p class="text-slate-500">…y {{ r.errores.length - 20 }} más</p> }
                @if (r.errores.length) { <button (click)="descargarErrores()" class="text-[#044e46] font-medium hover:underline cursor-pointer">Descargar errores CSV</button> }
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
            <button (click)="ejecutarBaja()" [disabled]="bajaCargando()" class="rounded-sm bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1">
              @if (bajaCargando()) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> } Dar de baja
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class Equipos {
  private readonly api = inject(EquiposService);
  private readonly planes = inject(PlanesService);
  private readonly dash = inject(DashboardService);
  private readonly carga = inject(CargaMasivaService);
  private readonly pdf = inject(ReportesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly equipos = signal<Equipo[]>([]);
  readonly pagina = signal(0);
  tamano = 10;
  readonly total = signal(0);
  readonly totalPaginas = signal(1);
  readonly cargando = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly resultado = signal<ResultadoCarga | null>(null);
  readonly detalle = signal<Equipo | null>(null);
  readonly planDetalle = signal<Plan | null>(null);
  readonly planPorEquipo = signal<Record<number, Plan>>({});

  readonly kpiOperativos = signal(0);
  readonly kpiMantenimiento = signal(0);
  readonly kpiFuera = signal(0);

  fQ = ''; fRiesgo = ''; fEstado = ''; orden = 'id';
  readonly formVisible = signal(false);
  readonly cargaVisible = signal(false);
  readonly confirmarBaja = signal<Equipo | null>(null);
  readonly guardando = signal(false);
  readonly subiendo = signal(false);
  readonly bajaCargando = signal(false);
  readonly cambiandoId = signal<number | null>(null);
  readonly pdfCargandoId = signal<number | null>(null);
  readonly formErrors = signal<Record<string,string>>({});
  editando = signal<number | null>(null);
  form: EquipoRequest & { marca?: string | null; modelo?: string | null; fechaAdquisicion?: string | null } = this.vacio();
  archivo: File | null = null;
  private readonly qSubject = new Subject<string>();

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    if (qp.get('q')) this.fQ = qp.get('q')!;
    if (qp.get('ubicacion')) this.fQ = qp.get('ubicacion')!;
    if (qp.get('riesgo')) this.fRiesgo = qp.get('riesgo')!;
    if (qp.get('estado')) this.fEstado = qp.get('estado')!;
    this.cargar();
    this.cargarKpis();
    this.qSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(v => {
      this.fQ = v; this.pagina.set(0); this.cargar();
    });
  }

  puedeGestionar(): boolean { return this.auth.rol() === 'ADMIN' || this.auth.rol() === 'INGENIERO'; }
  puedeCambiarEstado(): boolean { const r=this.auth.rol(); return r==='ADMIN'||r==='INGENIERO'||r==='TECNICO'; }

  vacio(): EquipoRequest {
    return { serial: '', nombre: '', marca: '', modelo: '', ubicacion: '', clasificacionRiesgo: 'I' as ClasificacionRiesgo, fechaAdquisicion: '', periodicidadMantenimientoDias: 90 };
  }
  msg(e: unknown): string {
    const e2 = e as { error?: { detail?: string; message?: string; title?: string; errors?: Record<string,string> } };
    if (e2?.error?.errors) return Object.values(e2.error.errors).join(', ');
    return e2?.error?.detail ?? e2?.error?.message ?? e2?.error?.title ?? 'Operación fallida';
  }

  onQChange(v: string): void { this.qSubject.next(v); }
  aplicarFiltros(): void { this.pagina.set(0); this.syncUrl(); this.cargar(); }
  filtrarEstado(estado: string): void { this.fEstado = estado; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  limpiarFiltros(): void { this.fQ=''; this.fRiesgo=''; this.fEstado=''; this.orden='id'; this.pagina.set(0); this.syncUrl(); this.cargar(); }
  private syncUrl(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: this.fQ || null, riesgo: this.fRiesgo || null, estado: this.fEstado || null }, queryParamsHandling: 'merge' });
  }

  cargar(): void {
    this.cargando.set(true); this.errorMsg.set(null);
    this.api.listar({ pagina: this.pagina(), tamano: this.tamano, orden: this.orden, q: this.fQ || undefined, riesgo: this.fRiesgo || undefined, estado: this.fEstado || undefined }).subscribe({
      next: (p) => {
        this.equipos.set(p.contenido); this.total.set(p.totalElementos); this.totalPaginas.set(Math.max(1, p.totalPaginas));
        this.cargando.set(false); this.cargarPlanesPara(p.contenido);
      },
      error: (e) => { this.errorMsg.set(this.msg(e)); this.cargando.set(false); },
    });
  }
  private cargarPlanesPara(list: Equipo[]): void {
    if (!list.length) { this.planPorEquipo.set({}); return; }
    // Carga pendientes y mapea por equipoId para la columna sin N+1 por fila
    this.planes.pendientes().subscribe({
      next: (pendientes) => {
        const map: Record<number, Plan> = {};
        for (const pl of pendientes) map[pl.equipoId] = pl;
        // También podría hidratar AL_DIA con revision, pero pendientes cubre vencidos+próximos que son los relevantes para la columna
        // Para AL_DIA mostramos igual si ya está en pendientes, si no queda —
        this.planPorEquipo.set(map);
      },
      error: () => this.planPorEquipo.set({}),
    });
  }
  cargarKpis(): void {
    this.dash.resumen().subscribe({
      next: (r) => {
        this.kpiOperativos.set(r.equiposPorEstado?.['OPERATIVO'] ?? 0);
        this.kpiMantenimiento.set(r.equiposPorEstado?.['EN_MANTENIMIENTO'] ?? 0);
        this.kpiFuera.set(r.equiposPorEstado?.['FUERA_DE_SERVICIO'] ?? 0);
      },
      error: () => {
        // fallback silencioso
        this.api.listar({ pagina: 0, tamano: 1, estado: 'OPERATIVO' }).subscribe({ next: (p) => this.kpiOperativos.set(p.totalElementos) });
      }
    });
  }
  cerrarForm(): void { this.formVisible.set(false); this.editando.set(null); this.formErrors.set({}); }
  prev(): void { if (this.pagina() > 0) { this.pagina.update(v => v - 1); this.cargar(); } }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) { this.pagina.update(v => v + 1); this.cargar(); } }

  ver(e: Equipo): void {
    this.planDetalle.set(this.planPorEquipo()[e.id] ?? null);
    this.api.obtenerPorId(e.id).subscribe({
      next: (d) => this.detalle.set(d),
      error: (er) => this.toast.error('Operación fallida', this.msg(er)),
    });
    // Refuerza plan si no estaba en pendientes (AL_DIA)
    if (!this.planPorEquipo()[e.id]) {
      this.planes.obtenerPorEquipo(e.id).subscribe({ next: (p) => this.planDetalle.set(p), error: () => {} });
    }
  }
  nuevo(): void { this.form = this.vacio(); this.editando.set(null); this.formErrors.set({}); this.formVisible.set(true); }
  editar(e: Equipo): void {
    this.api.obtenerPorId(e.id).subscribe({
      next: (f) => {
        this.editando.set(f.id);
        this.form = { serial: f.serial, nombre: f.nombre, marca: f.marca ?? '', modelo: f.modelo ?? '', ubicacion: f.ubicacion, clasificacionRiesgo: f.clasificacionRiesgo, fechaAdquisicion: f.fechaAdquisicion ?? '', periodicidadMantenimientoDias: f.periodicidadMantenimientoDias };
        this.formErrors.set({}); this.formVisible.set(true);
      },
      error: (er) => this.toast.error('Operación fallida', this.msg(er)),
    });
  }
  private validar(): boolean {
    const e: Record<string,string> = {};
    if (!this.form.serial.trim()) e['serial']='Serial obligatorio';
    else if (this.form.serial.trim().length > 60) e['serial']='Máx 60 caracteres';
    if (!this.form.nombre.trim()) e['nombre']='Nombre obligatorio';
    if (!this.form.ubicacion.trim()) e['ubicacion']='Ubicación obligatoria';
    if (!this.form.periodicidadMantenimientoDias || this.form.periodicidadMantenimientoDias < 1) e['periodicidad']='Mín 1 día';
    this.formErrors.set(e);
    return Object.keys(e).length===0;
  }
  guardar(): void {
    if (!this.validar()) return;
    this.guardando.set(true);
    const req: EquipoRequest = { ...this.form, serial: this.form.serial.trim(), nombre: this.form.nombre.trim(), ubicacion: this.form.ubicacion.trim(), marca: this.form.marca?.trim() || null, modelo: this.form.modelo?.trim() || null, fechaAdquisicion: this.form.fechaAdquisicion || null };
    const id = this.editando();
    (id ? this.api.actualizar(id, req) : this.api.crear(req)).subscribe({
      next: () => { this.toast.exito('Equipo guardado'); this.guardando.set(false); this.cerrarForm(); this.cargar(); this.cargarKpis(); },
      error: (e) => {
        this.guardando.set(false);
        const m=this.msg(e);
        if (m.toLowerCase().includes('serial') || (e as {status?:number})?.status===409) this.formErrors.set({ ...this.formErrors(), serial: m });
        else this.formErrors.set({ ...this.formErrors(), general: m });
      },
    });
  }
  cambiarEstado(e: Equipo, estado: string): void {
    if (estado===e.estado || this.cambiandoId()!==null) return;
    const prev=e.estado;
    this.cambiandoId.set(e.id);
    // optimista
    this.equipos.update(list => list.map(x => x.id===e.id ? { ...x, estado: estado as Equipo['estado'] } : x));
    this.api.cambiarEstado(e.id, estado).subscribe({
      next: () => { this.cambiandoId.set(null); this.cargarKpis(); },
      error: (er) => {
        this.cambiandoId.set(null);
        this.equipos.update(list => list.map(x => x.id===e.id ? { ...x, estado: prev } : x));
        this.toast.error('No se pudo cambiar estado', this.msg(er));
      },
    });
  }
  ejecutarBaja(): void {
    const e = this.confirmarBaja(); if (!e || this.bajaCargando()) return;
    this.bajaCargando.set(true);
    this.api.darDeBaja(e.id).subscribe({
      next: () => { this.bajaCargando.set(false); this.confirmarBaja.set(null); this.cargar(); this.cargarKpis(); this.toast.exito('Equipo dado de baja'); },
      error: (er) => { this.bajaCargando.set(false); this.toast.error('Operación fallida', this.msg(er)); },
    });
  }
  hojaDeVida(e: Equipo): void {
    if (this.pdfCargandoId()!==null) return;
    this.pdfCargandoId.set(e.id);
    this.pdf.hojaDeVida(e.id).subscribe({
      next: (b) => { this.pdf.descargar(b, `hoja-de-vida-${e.id}.pdf`); this.pdfCargandoId.set(null); },
      error: (er) => { this.pdfCargandoId.set(null); this.toast.error('No se pudo generar PDF', this.msg(er)); },
    });
  }
  // Carga masiva
  abrirCarga(): void { this.resultado.set(null); this.cargaVisible.set(true); }
  elegir(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    this.archivo = input.files?.[0] ?? null;
    this.resultado.set(null);
    if (this.archivo && this.archivo.size > 10*1024*1024) { this.toast.aviso('Archivo muy grande', 'Máx 10 MB'); this.archivo=null; (input as HTMLInputElement).value=''; }
  }
  subir(): void {
    if (!this.archivo || this.subiendo()) return;
    this.subiendo.set(true); this.resultado.set(null);
    this.carga.importar(this.archivo).subscribe({
      next: (r) => { this.resultado.set(r); this.subiendo.set(false); this.cargar(); this.cargarKpis(); this.toast.exito(`Importados ${r.equiposCreados} de ${r.filasLeidas}`); },
      error: (e) => { this.subiendo.set(false); this.toast.error('Importación fallida', this.msg(e)); },
    });
  }
  descargarPlantilla(): void {
    const csv='serial,nombre,marca,modelo,ubicacion,riesgo,fechaAdquisicion,periodicidadDias,estado\nEQ-001,Ventilador Philips,Philips,Trilogy 100,UCI,I,2024-01-15,90,OPERATIVO\n';
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='plantilla-equipos.csv'; a.click(); URL.revokeObjectURL(url);
  }
  descargarErrores(): void {
    const r=this.resultado(); if (!r) return;
    const csv=['fila,serial,motivo', ...r.errores.map(e=>`${e.fila},"${e.serial}","${e.motivo.replace(/"/g,'""')}"`)].join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='errores-carga.csv'; a.click(); URL.revokeObjectURL(url);
  }
  exportarCsv(): void {
    const rows=this.equipos(); if (!rows.length) { this.toast.aviso('Nada para exportar', 'No hay equipos filtrados'); return; }
    const csv=['serial,nombre,marca,modelo,ubicacion,riesgo,estado,periodicidadDias',
      ...rows.map(e=>`"${e.serial}","${e.nombre}","${e.marca??''}","${e.modelo??''}","${e.ubicacion}",${e.clasificacionRiesgo},${e.estado},${e.periodicidadMantenimientoDias}`)].join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`equipos-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
}
