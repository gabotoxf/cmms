import { Component, computed, inject, input, signal } from '@angular/core';
import { ToastService } from './toast';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const CALIDADES = [0.85, 0.7, 0.55, 0.4];
const LADO_MAX = [1280, 1024, 800, 640];

/**
 * Avatar con carga por clic o arrastrando la foto encima.
 * Si la imagen supera 2 MB se comprime sola en el navegador (JPEG).
 * Uso: <ui-avatar-drop #dz [actualUrl]="..." iniciales="CM" />
 * El padre lee dz.archivo() / dz.quitarMarcado() y llama dz.reiniciar().
 */
@Component({
  selector: 'ui-avatar-drop',
  standalone: true,
  template: `
    <div class="relative shrink-0 rounded-full transition-shadow"
         (dragover)="sobre($event)" (dragleave)="fuera()" (drop)="soltar($event)"
         [class.ring-4]="arrastrando()" [class.ring-teal-300]="arrastrando()">
      @if (vista(); as v) {
        <img [src]="v" alt="Avatar" class="h-20 w-20 rounded-full border-2 border-dashed border-slate-300 object-cover" />
      } @else {
        <div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-100 text-xl font-semibold text-slate-500" style="font-family:'Montserrat',sans-serif">
          {{ iniciales() }}
        </div>
      }
      <label title="Cambiar foto"
        class="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-teal-700 text-white shadow transition-colors hover:bg-teal-800">
        <span class="material-symbols-outlined text-[16px]">photo_camera</span>
        <input type="file" accept="image/*" class="hidden" (change)="elegir($event)" />
      </label>
      @if (arrastrando()) {
        <div class="absolute inset-0 flex items-center justify-center rounded-full bg-teal-700/60 text-center text-[10px] font-semibold text-white">
          Suelta<br />la foto
        </div>
      }
      @if (comprimiendo()) {
        <div class="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/50 text-[10px] font-semibold text-white">
          Optimizando…
        </div>
      }
    </div>
  `,
})
export class UiAvatarDrop {
  private readonly toast = inject(ToastService);
  readonly actualUrl = input<string | null>(null);
  readonly iniciales = input('?');
  readonly errorMsg = signal<string | null>(null);
  readonly archivo = signal<File | null>(null);
  readonly quitarMarcado = signal(false);
  readonly arrastrando = signal(false);
  readonly comprimiendo = signal(false);
  private readonly preview = signal<string | null>(null);

  readonly vista = computed(() => (this.quitarMarcado() ? null : (this.preview() ?? this.actualUrl())));

  reiniciar(): void {
    this.archivo.set(null);
    this.preview.set(null);
    this.quitarMarcado.set(false);
    this.errorMsg.set(null);
  }

  quitar(): void {
    this.archivo.set(null);
    this.preview.set(null);
    this.quitarMarcado.set(true);
  }

  sobre(ev: DragEvent): void {
    ev.preventDefault();
    this.arrastrando.set(true);
  }
  fuera(): void { this.arrastrando.set(false); }

  soltar(ev: DragEvent): void {
    ev.preventDefault();
    this.arrastrando.set(false);
    void this.procesar(ev.dataTransfer?.files?.[0] ?? null);
  }

  elegir(ev: Event): void {
    void this.procesar((ev.target as HTMLInputElement).files?.[0] ?? null);
  }

  private async procesar(f: File | null): Promise<void> {
    if (!f) return;
    const tipo = f.type || this.tipoPorExtension(f.name);
    if (!tipo.startsWith('image/')) {
      this.errorMsg.set('El archivo debe ser una imagen');
      return;
    }
    const normalizado = f.type ? f : new File([f], f.name, { type: tipo });
    this.errorMsg.set(null);
    if (normalizado.size <= MAX_AVATAR_BYTES) {
      this.fijar(normalizado);
      return;
    }
    this.comprimiendo.set(true);
    try {
      const comprimida = await this.comprimir(normalizado);
      this.fijar(comprimida);
      this.toast.info('Imagen optimizada', 'Se comprimió para cumplir el límite de 2 MB');
    } catch {
      this.errorMsg.set('No se pudo procesar la imagen, prueba con otra');
    } finally {
      this.comprimiendo.set(false);
    }
  }

  private tipoPorExtension(nombre: string): string {
    const ext = nombre.includes('.') ? nombre.slice(nombre.lastIndexOf('.') + 1).toLowerCase() : '';
    switch (ext) {
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      case 'gif': return 'image/gif';
      default: return '';
    }
  }

  private fijar(f: File): void {
    this.archivo.set(f);
    this.quitarMarcado.set(false);
    const lector = new FileReader();
    lector.onload = () => this.preview.set(String(lector.result));
    lector.readAsDataURL(f);
  }

  /** Baja peso reduciendo tamaño y calidad hasta entrar en el límite. */
  private async comprimir(f: File): Promise<File> {
    const mapa = await createImageBitmap(f);
    const nombre = f.name.replace(/\.[^.]+$/, '') + '.jpg';
    for (let i = 0; i < CALIDADES.length; i++) {
      const blob = await this.renderizar(mapa, LADO_MAX[i], CALIDADES[i]);
      if (blob && blob.size <= MAX_AVATAR_BYTES) {
        mapa.close();
        return new File([blob], nombre, { type: 'image/jpeg' });
      }
    }
    mapa.close();
    throw new Error('no comprime lo suficiente');
  }

  private renderizar(mapa: ImageBitmap, ladoMax: number, calidad: number): Promise<Blob | null> {
    const escala = Math.min(1, ladoMax / Math.max(mapa.width, mapa.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(mapa.width * escala));
    canvas.height = Math.max(1, Math.round(mapa.height * escala));
    const ctx = canvas.getContext('2d');
    if (!ctx) return Promise.resolve(null);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapa, 0, 0, canvas.width, canvas.height);
    return new Promise((res) => canvas.toBlob(res, 'image/jpeg', calidad));
  }
}
