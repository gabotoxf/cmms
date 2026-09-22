import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiButton } from '../../shared/ui/button';
import { UiCard } from '../../shared/ui/card';
import { UiInput, UiLabel } from '../../shared/ui/field';
import { EquiposService, ReportesService } from '../../core/api.services';
import { ToastService } from '../../shared/ui/toast';
import type { Equipo } from '../../core/models';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule, UiButton, UiCard, UiInput, UiLabel],
  template: `
    <h2 class="mb-4 text-xl font-semibold">Reportes PDF</h2>
    <ui-card title="Hoja de vida por equipo" desc="Historial completo del equipo (Res. 3100)">
      <div class="flex flex-wrap items-end gap-2">
        <label ui-label>Equipo<select ui-input [(ngModel)]="equipoId">@for (e of equipos(); track e.id) { <option [value]="e.id">{{ e.serial }} — {{ e.nombre }}</option> }</select></label>
        <button ui-btn size="sm" (click)="hoja()">Descargar hoja de vida</button>
      </div>
    </ui-card>
    <ui-card title="Certificado de cumplimiento" desc="Mantenimientos preventivos" class="mt-3 block">
      <div class="flex flex-wrap gap-2">
        <button ui-btn size="sm" (click)="cert()">Descargar parque completo</button>
        <button ui-btn variant="secondary" size="sm" (click)="certEquipo()">Descargar del equipo elegido</button>
      </div>
    </ui-card>
  `,
})
export class Reportes {
  private readonly pdf = inject(ReportesService);
  private readonly eq = inject(EquiposService);
  private readonly toast = inject(ToastService);
  readonly equipos = signal<Equipo[]>([]);
  equipoId: number | null = null;

  constructor() {
    this.eq.listar({ pagina: 0, tamano: 100 }).subscribe({ next: (p) => { this.equipos.set(p.contenido); this.equipoId = p.contenido[0]?.id ?? null; } });
  }
  hoja(): void {
    if (!this.equipoId) return;
    this.pdf.hojaDeVida(Number(this.equipoId)).subscribe({ next: (b) => { this.pdf.descargar(b, `hoja-de-vida-${this.equipoId}.pdf`); this.toast.exito('PDF descargado'); }, error: () => this.toast.error('No se pudo generar el PDF') });
  }
  cert(): void {
    this.pdf.certificado().subscribe({ next: (b) => { this.pdf.descargar(b, 'certificado-cumplimiento-parque.pdf'); this.toast.exito('PDF descargado'); }, error: () => this.toast.error('No se pudo generar el PDF') });
  }
  certEquipo(): void {
    if (!this.equipoId) return;
    this.pdf.certificado(Number(this.equipoId)).subscribe({ next: (b) => { this.pdf.descargar(b, `certificado-equipo-${this.equipoId}.pdf`); this.toast.exito('PDF descargado'); }, error: () => this.toast.error('No se pudo generar el PDF') });
  }
}
