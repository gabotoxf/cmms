import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import type { ResumenDashboard } from '../../core/models';

/** Tablero principal. Diseño del mockup trash.html con datos reales del backend. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <!-- Encabezado -->
      <header class="flex flex-col justify-between gap-6 pb-2 md:flex-row md:items-center">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2.5 text-xs font-medium text-slate-400">
            <span class="inline-flex items-center gap-1.5 rounded bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              Garantía de Calidad Técnica
            </span>
            <span>•</span>
            <span>Res. 3100 / 2019</span>
          </div>
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl" style="font-family:'Montserrat',sans-serif">
            Tablero de Control
          </h1>
          <p class="text-sm font-normal text-slate-500" style="font-family:'Roboto',sans-serif">
            Monitoreo técnico y aseguramiento metrológico — Resolución 3100 de 2019
          </p>
        </div>
        <div class="flex items-center gap-3 self-start md:self-center">
          <div class="inline-flex cursor-default items-center gap-2 rounded border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm" style="font-family:'Roboto',sans-serif">
            <span class="material-symbols-outlined text-[17px] text-slate-400">calendar_today</span>
            <span class="capitalize">{{ mesActual() }}</span>
            <span class="text-slate-300">·</span>
            <span class="text-slate-500">Semana {{ semanaISO() }}</span>
          </div>
          <button type="button" (click)="cargar()"
            class="inline-flex items-center gap-2 rounded border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900">
            <span class="material-symbols-outlined text-[16px] text-slate-400">sync</span>
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      @if (cargando()) {
        <p class="text-sm text-slate-500" style="font-family:'Roboto',sans-serif">Cargando tablero…</p>
      } @else if (resumen(); as r) {
        <!-- KPIs -->
        <section aria-label="Indicadores Principales" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Órdenes Abiertas</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">assignment</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ r.ordenesAbiertas }}</span>
              <span class="text-xs font-medium text-slate-500">{{ estadoOrden(r, 'EN_PROCESO') }} en proceso</span>
            </div>
            <p class="text-xs font-normal text-slate-500" style="font-family:'Roboto',sans-serif">{{ estadoOrden(r, 'ASIGNADA') }} asignadas pendientes de inicio</p>
          </div>
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Planes Vencidos</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">event_busy</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-rose-600" style="font-family:'Montserrat',sans-serif">{{ r.planesVencidos }}</span>
              <span class="text-xs font-medium text-rose-600">requieren atención</span>
            </div>
            <p class="text-xs font-normal text-slate-500" style="font-family:'Roboto',sans-serif">Mantenimientos fuera de fecha programada</p>
          </div>
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Próximos a Vencer</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">event_upcoming</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-amber-600" style="font-family:'Montserrat',sans-serif">{{ r.planesProximos }}</span>
              <span class="text-xs font-medium text-slate-500">en ventana</span>
            </div>
            <p class="text-xs font-normal text-slate-500" style="font-family:'Roboto',sans-serif">{{ r.planesProximos }} mantenimientos en ventana de 15 días</p>
          </div>
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">MTTR Promedio</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">timer</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ r.mttrHoras ?? '—' }}{{ r.mttrHoras != null ? 'h' : '' }}</span>
              <span class="text-xs font-medium text-emerald-700">{{ estadoOrden(r, 'COMPLETADA') }} cerradas</span>
            </div>
            <p class="text-xs font-normal text-slate-500" style="font-family:'Roboto',sans-serif">Promedio mensual de respuesta técnica</p>
          </div>
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wider text-slate-400" style="font-family:'Roboto',sans-serif">Cumplimiento Mensual</span>
              <span class="material-symbols-outlined text-[18px] text-slate-400">event_available</span>
            </div>
            <div class="my-3.5 flex items-baseline gap-2">
              <span class="text-3xl font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ r.cumplimientoMesPct ?? '—' }}{{ r.cumplimientoMesPct != null ? '%' : '' }}</span>
            </div>
            <p class="text-xs font-normal text-slate-500" style="font-family:'Roboto',sans-serif">Cumplimiento del periodo actual</p>
          </div>
        </section>

        <!-- Módulos analíticos -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:col-span-6">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 class="text-base font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Estado del Parque Tecnológico</h2>
                  <p class="mt-0.5 text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Distribución censada bajo estándar de habilitación hospitalaria</p>
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
                <div class="flex items-center justify-between py-3">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-emerald-600"></span><span class="font-medium text-slate-800">Operativo y Calibrado</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-slate-900">{{ estadoEquipo(r, 'OPERATIVO') }}</span><span class="w-12 text-right text-slate-400">{{ pctEstado(r, 'OPERATIVO') }}%</span></div>
                </div>
                <div class="flex items-center justify-between py-3">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-teal-500"></span><span class="font-medium text-slate-800">En Mantenimiento Programado</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-slate-900">{{ estadoEquipo(r, 'EN_MANTENIMIENTO') }}</span><span class="w-12 text-right text-slate-400">{{ pctEstado(r, 'EN_MANTENIMIENTO') }}%</span></div>
                </div>
                <div class="flex items-center justify-between py-3">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-rose-400"></span><span class="font-medium text-slate-800">Fuera de Servicio (Inoperativo)</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-rose-600">{{ estadoEquipo(r, 'FUERA_DE_SERVICIO') }}</span><span class="w-12 text-right text-rose-500">{{ pctEstado(r, 'FUERA_DE_SERVICIO') }}%</span></div>
                </div>
                <div class="flex items-center justify-between py-3">
                  <div class="flex items-center gap-2.5"><span class="h-2 w-2 rounded-full bg-slate-300"></span><span class="font-medium text-slate-600">Dictamen de Baja Técnica</span></div>
                  <div class="flex items-center gap-4 font-mono text-slate-600"><span class="font-semibold text-slate-700">{{ estadoEquipo(r, 'DADO_DE_BAJA') }}</span><span class="w-12 text-right text-slate-400">{{ pctEstado(r, 'DADO_DE_BAJA') }}%</span></div>
                </div>
              </div>
            </div>
            <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
              <span>Cumplimiento del mes: {{ r.cumplimientoMesPct ?? '—' }}{{ r.cumplimientoMesPct != null ? '%' : '' }}</span>
              <span class="font-medium text-slate-600">Actualizado: {{ r.generadoEn }}</span>
            </div>
          </div>

          <div class="flex flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:col-span-6">
            <div>
              <div class="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 class="text-base font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Flujo de Órdenes de Mantenimiento</h2>
                  <p class="mt-0.5 text-xs text-slate-500" style="font-family:'Roboto',sans-serif">Balance operativo mensual y resolución técnica de tickets</p>
                </div>
                <span class="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{{ pctResueltas(r) }}% resueltos</span>
              </div>
              <div class="mt-8 grid h-36 grid-cols-4 items-end gap-2 px-4" style="font-family:'Montserrat',sans-serif">
                <div class="flex h-full flex-col items-center justify-end gap-2">
                  <span class="font-mono text-xs font-medium text-slate-500">{{ estadoOrden(r, 'PENDIENTE') }}</span>
                  <div class="w-full bg-slate-100 transition-colors hover:bg-slate-200" [style.height.%]="alturaOrden(r, 'PENDIENTE')"></div>
                  <span class="text-xs font-medium text-slate-500">Pendientes</span>
                </div>
                <div class="flex h-full flex-col items-center justify-end gap-2">
                  <span class="font-mono text-xs font-medium text-slate-600">{{ estadoOrden(r, 'ASIGNADA') }}</span>
                  <div class="w-full bg-slate-200 transition-colors hover:bg-slate-300" [style.height.%]="alturaOrden(r, 'ASIGNADA')"></div>
                  <span class="text-xs font-medium text-slate-500">Asignadas</span>
                </div>
                <div class="flex h-full flex-col items-center justify-end gap-2">
                  <span class="font-mono text-xs font-semibold text-teal-800">{{ estadoOrden(r, 'EN_PROCESO') }}</span>
                  <div class="w-full bg-teal-100 transition-colors hover:bg-teal-200" [style.height.%]="alturaOrden(r, 'EN_PROCESO')"></div>
                  <span class="text-xs font-medium text-teal-800">En curso</span>
                </div>
                <div class="flex h-full flex-col items-center justify-end gap-2">
                  <span class="font-mono text-xs font-semibold text-emerald-800">{{ estadoOrden(r, 'COMPLETADA') }}</span>
                  <div class="w-full bg-emerald-700/80 transition-colors hover:bg-emerald-800" [style.height.%]="alturaOrden(r, 'COMPLETADA')"></div>
                  <span class="text-xs font-medium text-emerald-800">Cerradas</span>
                </div>
              </div>
            </div>
            <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span>{{ r.ordenesAbiertas }} órdenes abiertas en este momento</span>
              <span class="font-mono text-slate-400">MTTR: {{ r.mttrHoras ?? '—' }}{{ r.mttrHoras != null ? ' h' : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Tabla prioritaria (datos de muestra para revisión de diseño) -->
        <div class="flex flex-col overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div class="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-3">
                <h2 class="text-base font-semibold tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">Equipos con Atención Prioritaria</h2>
                <span class="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700">3 alertas activas</span>
              </div>
              <p class="text-xs font-normal text-slate-500" style="font-family:'Roboto',sans-serif">Dispositivos médicos que requieren intervención o seguimiento preventivo inmediato.</p>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" routerLink="/equipos" class="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                <span class="material-symbols-outlined text-[16px] text-slate-400">filter_list</span>
                <span>Filtrar</span>
              </button>
              <button type="button" routerLink="/ordenes" class="inline-flex items-center gap-1.5 rounded bg-[#044e46] px-2 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-900" style="font-family:'Montserrat',sans-serif">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>Nueva OT</span>
              </button>
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
                <tr class="transition-colors hover:bg-slate-50/60">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3.5">
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <span class="material-symbols-outlined text-[18px]">air</span>
                      </div>
                      <div class="flex min-w-0 flex-col">
                        <span class="text-sm font-medium text-slate-900" style="font-family:'Montserrat',sans-serif">Ventilador Mecánico Puritan Bennett 980</span>
                        <span class="mt-0.5 font-mono text-xs text-slate-400">ID: MED-VEN-004 · SN: 4200-9844-01</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-800">UCI Adultos</span>
                      <span class="text-xs text-slate-400">Cama 04 · Torre Norte</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">Clase III (Alto)</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-rose-600">Preventivo Vencido</span>
                      <span class="font-mono text-xs text-slate-400">Venció hace 3 días</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button type="button" class="rounded bg-[#044e46] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-900" style="font-family:'Montserrat',sans-serif">Generar OT</button>
                      <button type="button" routerLink="/equipos" title="Ver hoja de vida" class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="transition-colors hover:bg-slate-50/60">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3.5">
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <span class="material-symbols-outlined text-[18px]">monitor_heart</span>
                      </div>
                      <div class="flex min-w-0 flex-col">
                        <span class="text-sm font-medium text-slate-900" style="font-family:'Montserrat',sans-serif">Desfibrilador Bifásico Zoll R Series</span>
                        <span class="mt-0.5 font-mono text-xs text-slate-400">ID: MED-DES-012 · SN: ZR-199402</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-800">Urgencias Vitales</span>
                      <span class="text-xs text-slate-400">Carro de Paro 2</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">Clase III (Alto)</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-700">Correctivo en Curso</span>
                      <span class="font-mono text-xs text-slate-400">OT #2408-09</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button type="button" routerLink="/ordenes" class="rounded bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-200" style="font-family:'Montserrat',sans-serif">Revisar</button>
                      <button type="button" routerLink="/equipos" title="Ver hoja de vida" class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr class="transition-colors hover:bg-slate-50/60">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3.5">
                      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <span class="material-symbols-outlined text-[18px]">vaccines</span>
                      </div>
                      <div class="flex min-w-0 flex-col">
                        <span class="text-sm font-medium text-slate-900" style="font-family:'Montserrat',sans-serif">Bomba de Infusión Alaris GH Plus</span>
                        <span class="mt-0.5 font-mono text-xs text-slate-400">ID: MED-BOM-088 · SN: BD-849102</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-800">Cirugía Quirófano 3</span>
                      <span class="text-xs text-slate-400">Pabellón Central</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Clase IIb (Moderado)</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-600">Calibración Programada</span>
                      <span class="font-mono text-xs text-slate-400">Vence en 2 días</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button type="button" routerLink="/ordenes" class="rounded bg-slate-100 px-3.5 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-200" style="font-family:'Montserrat',sans-serif">Revisar</button>
                      <button type="button" routerLink="/equipos" title="Ver hoja de vida" class="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-400 sm:flex-row">
            <span>Trazabilidad metrológica auditable según Numeral 4.2 Res. 3100:2019</span>
            <a routerLink="/equipos" class="flex items-center gap-1 font-medium text-slate-600 transition-colors hover:text-slate-900">
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
  private readonly toast = inject(ToastService);

  readonly resumen = signal<ResumenDashboard | null>(null);
  readonly cargando = signal(true);

  constructor() { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.dash.resumen().subscribe({
      next: (r) => { this.resumen.set(r); this.cargando.set(false); },
      error: () => { this.toast.error('No se pudo cargar el tablero', '¿Backend en :8080?'); this.cargando.set(false); },
    });
  }

  estadoEquipo(r: ResumenDashboard, k: string): number { return r.equiposPorEstado?.[k] ?? 0; }
  estadoOrden(r: ResumenDashboard, k: string): number { return r.ordenesPorEstado?.[k] ?? 0; }
  totalEquipos(r: ResumenDashboard): number { return Object.values(r.equiposPorEstado ?? {}).reduce((a, b) => a + b, 0); }
  pctEstado(r: ResumenDashboard, k: string): number {
    const t = this.totalEquipos(r);
    return t === 0 ? 0 : Math.round((this.estadoEquipo(r, k) / t) * 100);
  }
  maxOrden(r: ResumenDashboard): number {
    return Math.max(1, this.estadoOrden(r, 'PENDIENTE'), this.estadoOrden(r, 'ASIGNADA'), this.estadoOrden(r, 'EN_PROCESO'), this.estadoOrden(r, 'COMPLETADA'));
  }
  alturaOrden(r: ResumenDashboard, k: string): number {
    return Math.max(6, Math.round((this.estadoOrden(r, k) / this.maxOrden(r)) * 100));
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
