import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  template: `
    <aside class="flex w-60 shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-4">
      <!-- Logo / marca -->
      <div class="flex items-center gap-3 px-1">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 2v4" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <path d="M12 12 8 15" />
          </svg>
        </div>
        <div class="leading-tight">
          <div class="text-lg font-extrabold tracking-tight text-teal-400">CMMS</div>
          <div class="text-[10px] font-medium uppercase text-slate-400">Res. 3100 de 2019</div>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="flex flex-col gap-1">
        <span class="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Módulos</span>

        <a routerLink="/dashboard" routerLinkActive="nav-active" class="nav-link">
          <ng-container *ngTemplateOutlet="icon; context: { name: 'dashboard' }" />
          Dashboard
        </a>

        <a routerLink="/equipos" routerLinkActive="nav-active" class="nav-link">
          <ng-container *ngTemplateOutlet="icon; context: { name: 'equipos' }" />
          Equipos
        </a>

        <a routerLink="/planes" routerLinkActive="nav-active" class="nav-link">
          <ng-container *ngTemplateOutlet="icon; context: { name: 'planes' }" />
          Planes
        </a>

        <a routerLink="/ordenes" routerLinkActive="nav-active" class="nav-link">
          <ng-container *ngTemplateOutlet="icon; context: { name: 'ordenes' }" />
          Órdenes
        </a>

        <a routerLink="/reportes" routerLinkActive="nav-active" class="nav-link">
          <ng-container *ngTemplateOutlet="icon; context: { name: 'reportes' }" />
          Reportes
        </a>

        @if (rol === 'ADMIN' || rol === 'INGENIERO') {
          <a routerLink="/usuarios" routerLinkActive="nav-active" class="nav-link">
            <ng-container *ngTemplateOutlet="icon; context: { name: 'usuarios' }" />
            Usuarios
          </a>
        }
      </nav>

      <small class="mt-auto px-1 text-slate-400">Salud · Res. 3100</small>
    </aside>

    <!-- Set de iconos (outline, 18px, trazo 2) -->
    <ng-template #icon let-name="name">
      @switch (name) {
        @case ('dashboard') {
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        }
        @case ('equipos') {
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M12 11v4" /><path d="M10 13h4" />
          </svg>
        }
        @case ('planes') {
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            <path d="M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path d="M17.5 16.5V18l1 .6" />
          </svg>
        }
        @case ('ordenes') {
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 3h6v3H9z" />
            <path d="M9 11h6M9 15h6M9 19h3" />
          </svg>
        }
        @case ('reportes') {
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 20V10M11 20V4M18 20v-7" />
          </svg>
        }
        @case ('usuarios') {
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" />
            <path d="M21 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      }
    </ng-template>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      border-radius: 0.5rem;
      padding: 0.55rem 0.75rem;
      font-size: 0.9rem;
      color: #475569;
      transition: background-color .15s ease, color .15s ease;
    }
    .nav-link:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .nav-link.nav-active {
      background: #e0e7ff;
      color: #0f766e;
      font-weight: 600;
    }
  `],
})
export class Sidebar {
  @Input() rol: string | null = null;
}
