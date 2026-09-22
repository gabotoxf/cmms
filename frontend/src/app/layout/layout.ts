import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { EquiposService } from '../core/api.services';
import { AuthService } from '../core/auth.service';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Topbar],
  template: `
    <div class="flex h-screen overflow-hidden bg-background text-foreground">
      <app-sidebar [rol]="auth.rol()" class="h-screen shrink-0 [&>aside]:h-full" />
      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <app-topbar
          [seccion]="seccion()"
          [equiposActivos]="equiposActivos()"
          [usuario]="auth.nombreCompleto()"
          [email]="auth.usuario()?.email ?? ''"
          [nombre]="auth.usuario()?.nombre ?? ''"
          [apellido]="auth.usuario()?.apellido ?? ''"
          [celular]="auth.usuario()?.celular ?? null"
          [rol]="auth.rol() ?? ''"
          (salir)="salir()"
          class="shrink-0" />
        <main class="min-h-0 flex-1 overflow-y-auto p-6"><router-outlet /></main>
      </div>
    </div>
  `,
})
export class Layout {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly equipos = inject(EquiposService);

  readonly seccion = signal('Gestión Operativa');
  readonly equiposActivos = signal(0);

  constructor() {
    this.actualizarSeccion();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.actualizarSeccion());
    this.equipos.listar({ pagina: 0, tamano: 1 }).subscribe({ next: (p) => this.equiposActivos.set(p.totalElementos) });
  }

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private actualizarSeccion(): void {
    let r = this.router.routerState.snapshot.root;
    while (r.firstChild) r = r.firstChild;
    const t = (r as unknown as { title?: unknown }).title;
    if (typeof t === 'string') this.seccion.set(t.replace(' — CMMS', ''));
  }
}
