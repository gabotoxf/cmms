import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EquiposService, ReportesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import type { Equipo } from '../../core/models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule],
  template: `
    <!-- Title -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
      <div class="min-w-0 flex-1 max-w-[50%]">
        <div class="flex items-center gap-2 text-[11px] font-mono font-medium tracking-wider uppercase text-teal-800">
          <span>DOCUMENTACIÓN REGULATORIA</span>
          <span class="text-slate-300">·</span>
          <span class="text-slate-500">HABILITACIÓN RES. 3100</span>
        </div>
        <h1 class="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 mt-1.5" style="font-family:'Montserrat',sans-serif">Reportes Regulatorios</h1>
        <p class="mt-1 text-sm text-slate-500 leading-relaxed">Generación de hojas de vida y certificados de cumplimiento para trazabilidad ante INVIMA y MinSalud.</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <span class="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-md px-3 py-1.5 shadow-sm">
          <span class="material-symbols-outlined text-[16px] text-[#044e46]">verified</span> Res. 3100 / 2019
        </span>
        <span class="inline-flex items-center gap-1.5 text-xs font-mono bg-slate-900 text-white px-2.5 py-1 rounded">PDF • SHA-256</span>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div class="bg-white rounded-xl p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium uppercase tracking-wider">Equipos Activos</span>
          <span class="material-symbols-outlined text-[18px] text-slate-400">devices</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ equipos().length }}</span>
          <span class="text-xs text-slate-500">inventariados</span>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium uppercase tracking-wider">Hojas de Vida</span>
          <span class="material-symbols-outlined text-[18px] text-emerald-600">description</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">{{ equipos().length }}</span>
          <span class="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">disponibles</span>
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium uppercase tracking-wider">Certificados</span>
          <span class="material-symbols-outlined text-[18px] text-teal-600">workspace_premium</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold text-slate-900 tracking-tight">2</span>
          <span class="text-xs text-slate-500">tipos</span>
        </div>
        <div class="mt-2 text-[11px] text-slate-500">Parque completo y por equipo</div>
      </div>
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <!-- Hoja de vida -->
      <section class="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 text-[#044e46] flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">clinical_notes</span>
            </div>
            <div>
              <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Hoja de Vida por Equipo</h3>
              <p class="text-xs text-slate-500">Historial completo del equipo (Res. 3100) con trazabilidad metrológica.</p>
            </div>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400 pointer-events-none">search</span>
            <input [(ngModel)]="busqueda" placeholder="Buscar equipo por serial o nombre..." class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#044e46]" />
          </div>
          <div class="max-h-64 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-200">
            @for (e of filtrados(); track e.id) {
              <label class="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer" [class.bg-emerald-50/50]="equipoId===e.id">
                <input type="radio" name="equipo" [value]="e.id" [(ngModel)]="equipoId" class="accent-[#044e46]" />
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
          <button (click)="hoja()" [disabled]="!equipoId" class="w-full inline-flex items-center justify-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-sm disabled:opacity-40 cursor-pointer">
            <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span> Descargar Hoja de Vida PDF
          </button>
        </div>
      </section>

      <!-- Certificado -->
      <section class="bg-white rounded-xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 text-[#0f766e] flex items-center justify-center">
              <span class="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div>
              <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Certificado de Cumplimiento</h3>
              <p class="text-xs text-slate-500">Mantenimientos preventivos — cumplimiento Res. 3100.</p>
            </div>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div class="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs leading-relaxed">
            <p class="font-medium text-slate-800">¿Qué certifica este documento?</p>
            <p class="text-slate-500 mt-1">Acredita el cumplimiento del cronograma preventivo del parque biomédico o de un equipo específico, con firma digital y sello SHA-256 auditable ante Secretaría de Salud.</p>
          </div>
          <div class="grid gap-3">
            <button (click)="cert()" class="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium px-4 py-2.5 rounded-md cursor-pointer">
              <span class="material-symbols-outlined text-[16px] text-slate-500">workspace_premium</span> Descargar Parque Completo PDF
            </button>
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-slate-200"></div>
              <span class="text-[11px] text-slate-400 uppercase tracking-wider">o por equipo</span>
              <div class="h-px flex-1 bg-slate-200"></div>
            </div>
            <div class="flex gap-2">
              <select [(ngModel)]="equipoId" class="flex-1 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs cursor-pointer">
                @for (e of equipos(); track e.id) { <option [value]="e.id">{{ e.serial }} — {{ e.nombre }}</option> }
              </select>
              <button (click)="certEquipo()" [disabled]="!equipoId" class="inline-flex items-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-40 cursor-pointer">
                <span class="material-symbols-outlined text-[16px]">download</span> Equipo
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-slate-500 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            <span class="material-symbols-outlined text-[16px] text-emerald-700">info</span> Los PDFs se firman con ECDSA P-256 y quedan foliados para auditoría.
          </div>
        </div>
      </section>
    </div>

    <!-- Recent docs -->
    <section class="bg-white rounded-xl border border-slate-200/70 shadow-sm p-6 mt-6">
      <h3 class="font-semibold text-sm text-slate-900" style="font-family:'Montserrat',sans-serif">Documentos Recientes</h3>
      <p class="text-xs text-slate-500 mt-0.5">Últimas descargas generadas en esta sesión (no se almacenan en servidor).</p>
      <div class="mt-4 grid gap-2 text-xs">
        @for (d of recientes(); track d.nombre) {
          <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
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
  private readonly toast = inject(ToastService);

  readonly equipos = signal<Equipo[]>([]);
  readonly recientes = signal<{ nombre: string; fecha: string; tipo: string }[]>([]);
  equipoId: number | null = null;
  busqueda = '';

  constructor() {
    this.eq.listar({ pagina: 0, tamano: 100 }).subscribe({ next: (p) => { this.equipos.set(p.contenido); this.equipoId = p.contenido[0]?.id ?? null; } });
  }

  filtrados(): Equipo[] {
    const q = this.busqueda.toLowerCase().trim();
    if (!q) return this.equipos();
    return this.equipos().filter(e => (`${e.serial} ${e.nombre} ${e.ubicacion} ${e.marca ?? ''}`.toLowerCase().includes(q)));
  }

  hoja(): void {
    if (!this.equipoId) { this.toast.aviso('Selecciona un equipo', 'Elige un equipo de la lista'); return; }
    this.pdf.hojaDeVida(Number(this.equipoId)).subscribe({
      next: (b) => { this.pdf.descargar(b, `hoja-de-vida-${this.equipoId}.pdf`); this.toast.exito('PDF descargado'); this.reciente(`hoja-de-vida-${this.equipoId}.pdf`, 'Hoja de vida'); },
      error: () => this.toast.error('No se pudo generar el PDF', 'Intenta de nuevo'),
    });
  }
  cert(): void {
    this.pdf.certificado().subscribe({
      next: (b) => { this.pdf.descargar(b, 'certificado-cumplimiento-parque.pdf'); this.toast.exito('PDF descargado'); this.reciente('certificado-parque.pdf', 'Certificado parque'); },
      error: () => this.toast.error('No se pudo generar el PDF'),
    });
  }
  certEquipo(): void {
    if (!this.equipoId) return;
    this.pdf.certificado(Number(this.equipoId)).subscribe({
      next: (b) => { this.pdf.descargar(b, `certificado-equipo-${this.equipoId}.pdf`); this.toast.exito('PDF descargado'); this.reciente(`certificado-equipo-${this.equipoId}.pdf`, 'Certificado equipo'); },
      error: () => this.toast.error('No se pudo generar el PDF'),
    });
  }
  private reciente(nombre: string, tipo: string): void {
    const fecha = new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
    this.recientes.update(l => [{ nombre, fecha, tipo }, ...l].slice(0, 5));
  }
}
