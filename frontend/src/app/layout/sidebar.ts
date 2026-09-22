import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  template: `
    <aside class="relative flex w-70 shrink-0 flex-col gap-6 overflow-hidden bg-[#044e46] p-4 text-white">
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0a645a]/40 to-transparent"></div>
      <div class="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-white/5"></div>
      <div class="pointer-events-none absolute right-6 top-24 h-40 w-40 rounded-full bg-white/[0.03]"></div>
      <!-- Logo / marca -->
      <div class="relative flex items-center gap-3 px-1">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#044e46]">
          <span class="material-symbols-outlined text-[20px]">medical_services</span>
        </div>
        <div class="leading-tight">
          <div class="text-sm font-bold tracking-tight" style="font-family:'Montserrat',sans-serif">BIOCMMS</div>
          <div class="text-[10px] tracking-widest uppercase opacity-60">Ingeniería Clínica</div>
        </div>
      </div>

      <!-- Navegación -->
      <nav class="relative flex flex-col gap-1">
        <span class="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/50">Módulos</span>

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

      <small class="relative mt-auto px-1 text-xs text-white/50">Salud · Res. 3100</small>
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
      color: rgba(255,255,255,0.7);
      transition: background-color .15s ease, color .15s ease;
    }
    .nav-link:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }
    .nav-link.nav-active {
      background: white;
      color: #044e46;
      font-weight: 600;
    }
  `],
})
export class Sidebar {
  @Input() rol: string | null = null;
}
