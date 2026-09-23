import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardService, OrdenesService, PlanesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import { UiPageHeader } from '../../shared/ui/page-header';
import { UiSkeleton } from '../../shared/ui/skeleton';
import type { Plan, ResumenDashboard } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, UiPageHeader, UiSkeleton],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <ui-page-header title="Tablero de Control" subtitle="Monitoreo técnico y aseguramiento metrológico — Resolución 3100 de 2019">
        <div class="inline-flex cursor-default items-center gap-2 rounded border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm" style="font-family:'Roboto',sans-serif">
          <span class="material-symbols-outlined text-[17px] text-slate-400">calendar_today</span>
          <span class="capitalize">{{ mesActual() }}</span>
          <span class="text-slate-300">·</span>
          <span class="text-slate-500">Semana {{ semanaISO() }}</span>
        </div>
        <button type="button" (click)="cargar()" [disabled]="cargando()"
          class="inline-flex items-center gap-2 rounded border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer disabled:opacity-50">
          <span class="material-symbols-outlined text-[16px] text-slate-400" [class.animate-spin]="cargando()">sync</span>
          <span>Actualizar</span>
        </button>
      </ui-page-header>

      @if (cargando()) {
        <section class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          @for (_ of [1,2,3,4,5]; track $index) {
            <div class="rounded-xl border border-slate-200/70 bg-white p-5 space-y-3">
              <ui-skeleton height="12px" width="60%" />
              <ui-skeleton height="28px" width="40%" />
              <ui-skeleton height="10px" width="80%" />
            </div>
          }
        </section>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div class="rounded-xl border border-slate-200/70 bg-white p-6 lg:col-span-6 space-y-4">
            <ui-skeleton height="18px" width="50%" /><ui-skeleton height="10px" width="100%" /><ui-skeleton height="80px" width="100%" />
          </div>
          <div class="rounded-xl border border-slate-200/70 bg-white p-6 lg:col-span-6 space-y-4">
            <ui-skeleton height="18px" width="50%" /><ui-skeleton height="120px" width="100%" />
          </div>
        </div>
        <div class="rounded-xl border border-slate-200/70 bg-white p-6 space-y-3">
          <ui-skeleton height="18px" width="30%" /><ui-skeleton height="40px" width="100%" /><ui-skeleton height="40px" width="100%" />
        </div>
      } @else if (errorMsg()) {
        <div class="rounded-xl border border-rose-200 bg-rose-50 p-6 flex items-center justify-between">
          <div class="flex items-center gap-3 text-sm text-rose-800">
            <span class="material-symbols-outlined">error</span>
            <span>{{ errorMsg() }}</span>
          </div>
          <button type="button" (click)="cargar()" class="rounded bg-white border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 cursor-pointer">Reintentar</button>
        </div>
      } @else if (resumen(); as r) {
        <!-- KPIs: todos navegables -->
        <section aria-label="Indicadores Principales" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <a routerLink="/ordenes" [queryParams]="{estado: 'EN_PROCESO'}" class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300 hover:shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Órdenes Abiertas</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">assignment</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ r.ordenesAbiertas }}</span>
              <span class="text-xs font-medium text-slate-500">{{ estadoOrden(r, 'EN_PROCESO') }} en proceso</span>
            </div>
            <p class="text-xs font-normal text-slate-500" style="font-family:'Roboto',sans-serif">{{ estadoOrden(r, 'ASIGNADA') }} asignadas pendientes de inicio →</p>
          </a>
          <a [routerLink]="['/planes']" [queryParams]="{estado:'VENCIDO'}" class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-rose-200 hover:shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Planes Vencidos</span>
              <span class="material-symbols-outlined text-[18px] text-rose-400">event_busy</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-rose-600" style="font-family:'Montserrat',sans-serif">{{ r.planesVencidos }}</span>
              <span class="text-xs font-medium text-rose-600">requieren atención</span>
            </div>
            <p class="text-xs font-normal text-slate-500">Mantenimientos fuera de fecha programada →</p>
          </a>
          <a [routerLink]="['/planes']" [queryParams]="{estado:'PROXIMO'}" class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-amber-200 hover:shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Próximos a Vencer</span>
              <span class="material-symbols-outlined text-[18px] text-amber-500">event_upcoming</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-amber-600" style="font-family:'Montserrat',sans-serif">{{ r.planesProximos }}</span>
              <span class="text-xs font-medium text-slate-500">en ventana 15d</span>
            </div>
            <p class="text-xs font-normal text-slate-500" title="Ventana configurable app.mantenimiento.dias-alerta (def. 15 días)">{{ r.planesProximos }} mantenimientos en ventana de 15 días →</p>
          </a>
          <a routerLink="/ordenes" class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400">MTTR Promedio</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">timer</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ r.mttrHoras ?? '—' }}{{ r.mttrHoras != null ? 'h' : '' }}</span>
              <span class="text-xs font-medium text-emerald-700" title="Correctivas completadas últimos 30d, desde iniciada/asignada hasta completada">{{ estadoOrden(r, 'COMPLETADA') }} cerradas</span>
            </div>
            <p class="text-xs font-normal text-slate-500" title="Ventana 30 días">Promedio mensual de respuesta técnica</p>
          </a>
          <a routerLink="/ordenes" [queryParams]="{tipo:'PREVENTIVO'}" class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400">Cumplimiento Mensual</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">event_available</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ r.cumplimientoMesPct ?? '—' }}{{ r.cumplimientoMesPct != null ? '%' : '' }}</span>
            </div>
            <p class="text-xs font-normal text-slate-500" title="Preventivas completadas / programadas del mes (excluye canceladas)">Cumplimiento del periodo actual →</p>
          </a>
        </section>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:col-span-6">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 class="text-base font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Estado del Parque Tecnológico</h2>
                  <p class="mt-0.5 text-xs text-slate-500">Distribución censada bajo estándar de habilitación hospitalaria</p>
                </div>
                <span class="inline-flex items-baseline gap-1 whitespace-nowrap rounded border border-slate-200/60 bg-slate-50 px-2 py-1 font-mono text-xs font-medium text-slate-500"><strong class="text-base font-semibold text-slate-800">{{ totalEquipos(r) }}</strong> equipos</span>
              </div>
              <div class="mt-5 flex flex-col gap-2.5">
                <div class="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full bg-emerald-600 transition-all duration-500" [style.width.%]="pctEstado(r, 'OPERATIVO')" title="Operativo"></div>
                  <div class="h-full bg-teal-500 transition-all duration-500" [style.width.%]="pctEstado(r, 'EN_MANTENIMIENTO')" title="En Mantenimiento"></div>
                  <div class="h-full bg-rose-400 transition-all duration-500" [style.width.%]="pctEstado(r, 'FUERA_DE_SERVICIO')" title="Fuera de Servicio"></div>
                  <div class="h-full bg-slate-300 transition-all duration-500" [style.width.%]="pctEstado(r, 'DADO_DE_BAJA')" title="Baja Técnica"></div>
                </div>
              </div>
              <div class="mt-6 divide-y divide-slate-100 text-xs" style="font-family:'Roboto',sans-serif">
                <a routerLink="/equipos" [queryParams]="{estado:'OPERATIVO'}" class="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-emerald-600"></span><span class="font-medium text-slate-800">Operativo y Calibrado</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-slate-900">{{ estadoEquipo(r, 'OPERATIVO') }}</span><span class="w-12 text-right text-slate-400">{{ pctEstado(r, 'OPERATIVO') }}%</span></div>
                </a>
                <a routerLink="/equipos" [queryParams]="{estado:'EN_MANTENIMIENTO'}" class="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-teal-500"></span><span class="font-medium text-slate-800">En Mantenimiento Programado</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-slate-900">{{ estadoEquipo(r, 'EN_MANTENIMIENTO') }}</span><span class="w-12 text-right text-slate-400">{{ pctEstado(r, 'EN_MANTENIMIENTO') }}%</span></div>
                </a>
                <a routerLink="/equipos" [queryParams]="{estado:'FUERA_DE_SERVICIO'}" class="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-rose-400"></span><span class="font-medium text-slate-800">Fuera de Servicio (Inoperativo)</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-rose-600">{{ estadoEquipo(r, 'FUERA_DE_SERVICIO') }}</span><span class="w-12 text-right text-rose-500">{{ pctEstado(r, 'FUERA_DE_SERVICIO') }}%</span></div>
                </a>
                <a routerLink="/equipos" [queryParams]="{estado:'DADO_DE_BAJA'}" class="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-slate-300"></span><span class="font-medium text-slate-600">Dictamen de Baja Técnica</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-slate-700">{{ estadoEquipo(r, 'DADO_DE_BAJA') }}</span><span class="w-12 text-right text-slate-400">{{ pctEstado(r, 'DADO_DE_BAJA') }}%</span></div>
                </a>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
              <span>Cumplimiento: {{ r.cumplimientoMesPct ?? '—' }}{{ r.cumplimientoMesPct != null ? '%' : '' }} · MTTR: {{ r.mttrHoras ?? '—' }}{{ r.mttrHoras != null ? ' h' : '' }}</span>
              <span class="font-medium text-slate-600">Actualizado: {{ fmtFecha(r.generadoEn) }}</span>
            </div>
          </div>

          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:col-span-6">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 class="text-base font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Flujo de Órdenes de Mantenimiento</h2>
                  <p class="mt-0.5 text-xs text-slate-500">Balance operativo mensual y resolución técnica de tickets</p>
                </div>
                <span class="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{{ pctResueltas(r) }}% resueltos</span>
              </div>
              <div class="mt-8 grid h-36 grid-cols-4 items-end gap-2 px-4" style="font-family:'Montserrat',sans-serif">
                <a routerLink="/ordenes" [queryParams]="{estado:'PENDIENTE'}" class="flex h-full flex-col items-center justify-end gap-2 group">
                  <span class="font-mono text-xs font-medium text-slate-500 group-hover:text-slate-900">{{ estadoOrden(r, 'PENDIENTE') }}</span>
                  <div class="w-full bg-slate-100 group-hover:bg-slate-200 transition-colors" [style.height.%]="alturaOrden(r, 'PENDIENTE')"></div>
                  <span class="text-xs font-medium text-slate-500">Pendientes</span>
                </a>
                <a routerLink="/ordenes" [queryParams]="{estado:'ASIGNADA'}" class="flex h-full flex-col items-center justify-end gap-2 group">
                  <span class="font-mono text-xs font-medium text-slate-600 group-hover:text-slate-900">{{ estadoOrden(r, 'ASIGNADA') }}</span>
                  <div class="w-full bg-slate-200 group-hover:bg-slate-300 transition-colors" [style.height.%]="alturaOrden(r, 'ASIGNADA')"></div>
                  <span class="text-xs font-medium text-slate-500">Asignadas</span>
                </a>
                <a routerLink="/ordenes" [queryParams]="{estado:'EN_PROCESO'}" class="flex h-full flex-col items-center justify-end gap-2 group">
                  <span class="font-mono text-xs font-semibold text-teal-800">{{ estadoOrden(r, 'EN_PROCESO') }}</span>
                  <div class="w-full bg-teal-100 group-hover:bg-teal-200 transition-colors" [style.height.%]="alturaOrden(r, 'EN_PROCESO')"></div>
                  <span class="text-xs font-medium text-teal-800">En curso</span>
                </a>
                <a routerLink="/ordenes" [queryParams]="{estado:'COMPLETADA'}" class="flex h-full flex-col items-center justify-end gap-2 group">
                  <span class="font-mono text-xs font-semibold text-emerald-800">{{ estadoOrden(r, 'COMPLETADA') }}</span>
                  <div class="w-full bg-emerald-700/80 group-hover:bg-emerald-800 transition-colors" [style.height.%]="alturaOrden(r, 'COMPLETADA')"></div>
                  <span class="text-xs font-medium text-emerald-800">Cerradas</span>
                </a>
              </div>
            </div>
            <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>{{ r.ordenesAbiertas }} órdenes abiertas</span>
              <span class="font-mono text-slate-400">MTTR 30d: {{ r.mttrHoras ?? '—' }}{{ r.mttrHoras != null ? ' h' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Equipos con Atención Prioritaria -->
        <div class="flex flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div class="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-3">
                <h2 class="text-base font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Equipos con Atención Prioritaria</h2>
                <span class="rounded-full border px-2.5 py-0.5 text-xs font-medium" [class.bg-rose-50]="tabPrioritaria()==='VENCIDO'" [class.text-rose-700]="tabPrioritaria()==='VENCIDO'" [class.border-rose-100]="tabPrioritaria()==='VENCIDO'" [class.bg-amber-50]="tabPrioritaria()==='PROXIMO'" [class.text-amber-700]="tabPrioritaria()==='PROXIMO'" [class.border-amber-100]="tabPrioritaria()==='PROXIMO'">{{ listaPrioritaria().length }} {{ tabPrioritaria()==='VENCIDO' ? 'vencidos' : 'próximos (15d)' }}</span>
              </div>
              <p class="text-xs font-normal text-slate-500">Dispositivos médicos que requieren intervención o seguimiento preventivo inmediato.</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs">
                <button type="button" (click)="tabPrioritaria.set('VENCIDO')" class="rounded-full px-3 py-1 font-medium transition-colors cursor-pointer" [class.bg-white]="tabPrioritaria()==='VENCIDO'" [class.shadow-sm]="tabPrioritaria()==='VENCIDO'" [class.text-slate-900]="tabPrioritaria()==='VENCIDO'" [class.text-slate-500]="tabPrioritaria()!=='VENCIDO'">Vencidos</button>
                <button type="button" (click)="tabPrioritaria.set('PROXIMO')" class="rounded-full px-3 py-1 font-medium transition-colors cursor-pointer" [class.bg-white]="tabPrioritaria()==='PROXIMO'" [class.shadow-sm]="tabPrioritaria()==='PROXIMO'" [class.text-slate-900]="tabPrioritaria()==='PROXIMO'" [class.text-slate-500]="tabPrioritaria()!=='PROXIMO'">Próximos</button>
              </div>
              <a [routerLink]="['/planes']" [queryParams]="{estado: tabPrioritaria()}" class="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer">
                <span class="material-symbols-outlined text-[16px] text-slate-400">filter_list</span>
                <span>Ver todos</span>
              </a>
              <a routerLink="/ordenes" class="inline-flex items-center gap-1.5 rounded bg-[#044e46] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-900 cursor-pointer" style="font-family:'Montserrat',sans-serif">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>Nueva OT</span>
              </a>
            </div>
          </div>
          <div class="w-full overflow-x-auto">
            <table class="w-full border-collapse text-left" style="font-family:'Roboto',sans-serif">
              <thead>
                <tr class="border-b border-slate-100 text-xs font-medium text-slate-400">
                  <th class="px-6 py-3.5 font-medium">Equipo Biomédico</th>
                  <th class="px-6 py-3.5 font-medium">Ubicación</th>
                  <th class="px-6 py-3.5 font-medium">Riesgo</th>
                  <th class="px-6 py-3.5 font-medium">Estado / Vencimiento</th>
                  <th class="px-6 py-3.5 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                @for (p of listaPrioritaria().slice(0,5); track p.id) {
                  <tr class="transition-colors hover:bg-slate-50/60">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3.5">
                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-slate-600">
                          <span class="material-symbols-outlined text-[18px]">{{ iconoRiesgo(p.equipoClasificacionRiesgo) }}</span>
                        </div>
                        <div class="flex min-w-0 flex-col">
                          <span class="text-sm font-medium text-slate-900 truncate" style="font-family:'Montserrat',sans-serif" [title]="p.equipoNombre">{{ p.equipoNombre }}</span>
                          <span class="mt-0.5 font-mono text-xs text-slate-400 truncate">{{ p.equipoSerial }} · {{ p.equipoMarca ?? '—' }} {{ p.equipoModelo ?? '' }} · PL-{{ p.id }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px] text-slate-400">location_on</span><span class="font-medium text-slate-800">{{ p.equipoUbicacion ?? '—' }}</span></div>
                      <span class="text-xs text-slate-400">Plan #{{ p.id }} · {{ p.frecuenciaDias }}d</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
                        [class.bg-rose-50]="p.equipoClasificacionRiesgo==='III'" [class.text-rose-700]="p.equipoClasificacionRiesgo==='III'" [class.border-rose-100]="p.equipoClasificacionRiesgo==='III'"
                        [class.bg-amber-50]="p.equipoClasificacionRiesgo==='IIB'" [class.text-amber-700]="p.equipoClasificacionRiesgo==='IIB'" [class.border-amber-100]="p.equipoClasificacionRiesgo==='IIB'"
                        [class.bg-slate-50]="p.equipoClasificacionRiesgo!=='III' && p.equipoClasificacionRiesgo!=='IIB'" [class.text-slate-700]="p.equipoClasificacionRiesgo!=='III' && p.equipoClasificacionRiesgo!=='IIB'" [class.border-slate-200]="p.equipoClasificacionRiesgo!=='III' && p.equipoClasificacionRiesgo!=='IIB'">{{ p.equipoClasificacionRiesgo ?? '—' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="inline-flex items-center gap-1 font-medium" [class.text-rose-600]="p.estado==='VENCIDO'" [class.text-amber-700]="p.estado==='PROXIMO'"><span class="h-1.5 w-1.5 rounded-full" [class.bg-rose-600]="p.estado==='VENCIDO'" [class.bg-amber-500]="p.estado==='PROXIMO'"></span> {{ p.estado }}</span>
                        <span class="font-mono text-xs" [class.text-rose-500]="p.estado==='VENCIDO'" [class.text-amber-600]="p.estado==='PROXIMO'" [class.text-slate-400]="p.estado==='AL_DIA'">{{ p.diasRestantes }}d · {{ p.proximaFecha }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button type="button" (click)="generarOT(p)" [disabled]="generandoId()===p.id"
                          class="rounded bg-[#044e46] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-900 cursor-pointer disabled:opacity-50 inline-flex items-center gap-1">
                          @if (generandoId()===p.id) { <span class="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></span> }
                          Generar OT
                        </button>
                        <a [routerLink]="['/equipos']" [queryParams]="{ubicacion: p.equipoUbicacion}" class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer" title="Ver en inventario">
                          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="py-10 text-center text-sm text-slate-400">
                    @if (tabPrioritaria()==='VENCIDO') { Sin equipos vencidos — todo al día. }
                    @else { Sin equipos próximos a vencer en 15 días. }
                  </td></tr>
                }
              </tbody>
            </table>
          </div>
          <div class="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-400 sm:flex-row">
            <span>Trazabilidad metrológica auditable según Numeral 4.2 Res. 3100:2019 · Ventana próximos: 15 días</span>
            <a routerLink="/equipos" class="flex items-center gap-1 font-medium text-slate-600 transition-colors hover:text-slate-900 cursor-pointer">
              <span>Ver inventario completo</span>
              <span class="material-symbols-outlined text-[14px]">chevron_right</span>
            </a>
          </div>
        </div>
      }
    </div>
  `,
})
export class Dashboard {
  private readonly dash = inject(DashboardService);
  private readonly planesApi = inject(PlanesService);
  private readonly ordenesApi = inject(OrdenesService);
  private readonly toast = inject(ToastService);

  readonly resumen = signal<ResumenDashboard | null>(null);
  readonly planesPendientes = signal<Plan[]>([]);
  readonly tabPrioritaria = signal<'VENCIDO' | 'PROXIMO'>('VENCIDO');
  readonly listaPrioritaria = computed(() => this.planesPendientes().filter(p => p.estado === this.tabPrioritaria()));
  readonly cargando = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly generandoId = signal<number | null>(null);

  constructor() { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.errorMsg.set(null);
    forkJoin({
      resumen: this.dash.resumen().pipe(catchError(() => { this.errorMsg.set('No se pudo cargar el tablero. ¿Backend en :8080?'); return of(null as unknown as ResumenDashboard); })),
      planes: this.planesApi.pendientes().pipe(catchError(() => of([] as Plan[]))),
    }).subscribe(({ resumen, planes }) => {
      if (resumen) this.resumen.set(resumen);
      this.planesPendientes.set(planes);
      this.cargando.set(false);
      if (!resumen && !this.errorMsg()) this.errorMsg.set('No se pudo cargar el tablero');
    });
  }

  generarOT(p: Plan): void {
    if (this.generandoId() !== null) return;
    this.generandoId.set(p.id);
    this.ordenesApi.crear({
      equipoId: p.equipoId,
      tipo: 'CORRECTIVO',
      titulo: `Correctivo vencido — ${p.equipoNombre}`,
      descripcion: `Plan PL-${p.id} vencido el ${p.proximaFecha}. Generado desde Dashboard.`,
      fechaProgramada: new Date().toISOString().slice(0, 10),
    }).subscribe({
      next: () => { this.toast.exito('OT generada', `OT correctiva para ${p.equipoSerial} creada`); this.generandoId.set(null); this.cargar(); },
      error: (e) => { this.toast.error('No se pudo generar OT', (e as { error?: { detail?: string } })?.error?.detail ?? 'Intenta de nuevo'); this.generandoId.set(null); },
    });
  }

  iconoRiesgo(riesgo: string | null | undefined): string {
    switch (riesgo) {
      case 'III': return 'warning';
      case 'IIB': return 'biotech';
      case 'IIA': return 'monitor_heart';
      default: return 'medical_services';
    }
  }

  fmtFecha(iso: string): string {
    try { return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return iso; }
  }

  estadoEquipo(r: ResumenDashboard, k: string): number { return r.equiposPorEstado?.[k] ?? 0; }
  estadoOrden(r: ResumenDashboard, k: string): number { return r.ordenesPorEstado?.[k] ?? 0; }
  totalEquipos(r: ResumenDashboard): number { return Object.values(r.equiposPorEstado ?? {}).reduce((a, b) => a + b, 0); }
  pctEstado(r: ResumenDashboard, k: string): number {
    const t = this.totalEquipos(r);
    if (t === 0) return 0;
    const keys = ['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO', 'DADO_DE_BAJA'];
    const raw = keys.map(key => (this.estadoEquipo(r, key) / t) * 100);
    const rounded = raw.map(v => Math.round(v));
    const diff = 100 - rounded.reduce((a, b) => a + b, 0);
    if (diff !== 0) {
      let idx = raw.indexOf(Math.max(...raw));
      if (keys[idx] !== k) {
        const ownIdx = keys.indexOf(k);
        if (ownIdx === -1) return rounded[keys.indexOf(k)] ?? 0;
      }
      // adjust only the requested key if it's the max, else return its rounded
      const reqIdx = keys.indexOf(k);
      if (reqIdx === idx) return Math.max(0, rounded[reqIdx] + diff);
      return rounded[reqIdx] ?? 0;
    }
    const idx = keys.indexOf(k);
    return idx === -1 ? 0 : rounded[idx];
  }
  maxOrden(r: ResumenDashboard): number {
    return Math.max(1, this.estadoOrden(r, 'PENDIENTE'), this.estadoOrden(r, 'ASIGNADA'), this.estadoOrden(r, 'EN_PROCESO'), this.estadoOrden(r, 'COMPLETADA'));
  }
  alturaOrden(r: ResumenDashboard, k: string): number {
    const v = this.estadoOrden(r, k);
    if (v === 0) return 4;
    return Math.max(8, Math.round((v / this.maxOrden(r)) * 100));
  }
  pctResueltas(r: ResumenDashboard): number {
    const total = ['PENDIENTE', 'ASIGNADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'].reduce((a, k) => a + this.estadoOrden(r, k), 0);
    return total === 0 ? 0 : Math.round((this.estadoOrden(r, 'COMPLETADA') / total) * 100);
  }

  mesActual(): string {
    const s = new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  semanaISO(d = new Date()): number {
    const f = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    f.setUTCDate(f.getUTCDate() - ((f.getUTCDay() + 6) % 7) + 3);
    const primero = new Date(Date.UTC(f.getUTCFullYear(), 0, 4));
    return 1 + Math.round(((+f - +primero) / 864e5 - 3 + ((primero.getUTCDay() + 6) % 7)) / 7);
  }
}
