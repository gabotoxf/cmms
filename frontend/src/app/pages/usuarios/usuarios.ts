import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiAvatarDrop } from '../../shared/ui/avatar-drop';
import { ToastService } from '../../shared/ui/toast';
import { UiPageHeader } from '../../shared/ui/page-header';
import { UsuariosService } from '../../core/api.services';
import { AuthService, type RolUsuario } from '../../core/auth.service';
import type { Usuario } from '../../core/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, UiAvatarDrop, UiPageHeader],
  template: `
    <ui-page-header title="Usuarios y Control de Accesos" subtitle="Gestión de personal técnico, perfiles asistenciales y permisos de firma digital para habilitación (Res. 3100 de 2019).">
      <button (click)="exportar()" class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-md cursor-pointer">
        <span class="material-symbols-outlined text-[17px]">file_download</span> Exportar
      </button>
      @if (esAdmin()) {
        <button (click)="inviteVisible.set(true)" class="inline-flex items-center gap-2 bg-[#044e46] hover:bg-[#033b35] text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow-sm cursor-pointer">
          <span class="material-symbols-outlined text-[17px]">person_add</span> Invitar Colaborador
        </button>
      }
    </ui-page-header>

    <!-- KPIs -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Total Usuarios</span>
          <span class="material-symbols-outlined text-[19px] text-slate-400">group</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ total() }}</span>
          <span class="text-xs text-slate-400">activos</span>
        </div>
        <div class="mt-2 text-xs text-teal-700 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span> Ingeniería Biomédica</div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Técnicos en Turno</span>
          <span class="w-2 h-2 rounded-full bg-teal-500"></span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ kpiTecnicos() }}</span>
          <span class="text-xs text-slate-500">de {{ total() }} asignados</span>
        </div>
        <div class="mt-2 text-xs text-slate-500">Rondas en UCI y Quirófanos</div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Firmas Habilitadas</span>
          <span class="material-symbols-outlined text-[19px] text-slate-400">verified_user</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">{{ kpiActivos() }}</span>
          <span class="text-xs text-emerald-700 font-medium">validadas</span>
        </div>
        <div class="mt-2 text-xs text-amber-700 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 1 firma en renovación</div>
      </div>
      <div class="bg-white rounded-sm p-5 border border-slate-200/70 shadow-sm">
        <div class="flex items-center justify-between text-slate-500 mb-2">
          <span class="text-xs font-medium tracking-wide uppercase">Roles Configurados</span>
          <span class="material-symbols-outlined text-[19px] text-slate-400">shield</span>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-display font-bold text-2xl tracking-tight text-slate-900" style="font-family:'Montserrat',sans-serif">04</span>
          <span class="text-xs text-slate-500">perfiles</span>
        </div>
        <div class="mt-2 text-xs text-slate-500">Admin, Validador, Técnico, Auditor</div>
      </div>
    </section>

    <!-- Tabla -->
    <section class="bg-white border border-slate-200/70 rounded-xl shadow-sm overflow-hidden mt-6">
      <div class="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[19px] text-slate-400 pointer-events-none">search</span>
          <input [(ngModel)]="busqueda" (ngModelChange)="pagina.set(0)" class="w-full pl-10 pr-4 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-sm text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#044e46] transition-all" placeholder="Buscar por colaborador, documento o Tarjeta Profesional..." />
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <select [(ngModel)]="fRol" (ngModelChange)="pagina.set(0); cargar()" class="py-2 pl-3 pr-8 bg-slate-50/80 border border-slate-200 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#044e46] cursor-pointer">
            <option value="">Rol (todos)</option><option>ADMIN</option><option>INGENIERO</option><option>TECNICO</option><option>AUDITOR</option>
          </select>
          <select [(ngModel)]="fEstado" (ngModelChange)="pagina.set(0)" class="py-2 pl-3 pr-8 bg-slate-50/80 border border-slate-200 rounded-sm text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#044e46] cursor-pointer">
            <option value="">Estado (todos)</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option>
          </select>
          <button (click)="busqueda=''; fRol=''; fEstado=''; pagina.set(0); cargar()" class="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-sm cursor-pointer" title="Restablecer"><span class="material-symbols-outlined text-[16px]">restart_alt</span> Limpiar</button>
        </div>
      </div>
      <div class="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/30">
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-sm font-semibold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">Matriz de Personal Autorizado</h2>
            <span class="px-2 py-0.5 rounded border border-slate-200 bg-white text-[11px] font-medium text-slate-600">{{ filtrados().length }} registros</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Colaboradores registrados con competencia técnica para firma de actas.</p>
        </div>
        <span class="inline-flex items-center gap-1.5 text-xs text-slate-500"><span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span> Sede Central San Rafael</span>
      </div>
      <div class="w-full overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold tracking-tight uppercase text-[11px]" style="font-family:'Montserrat',sans-serif">
              <th class="py-3.5 px-6">Usuario &amp; Cargo</th>
              <th class="py-3.5 px-4">Celular</th>
              <th class="py-3.5 px-4">Rol y Alcance</th>
              <th class="py-3.5 px-4">Firma Digital</th>
              <th class="py-3.5 px-4">Estado</th>
              @if (esAdmin()) { <th class="py-3.5 px-6 text-right">Acción</th> }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            @for (u of paginados(); track u.id) {
              <tr class="hover:bg-slate-50/60 transition-colors group">
                <td class="py-3.5 px-6">
                  <div class="flex items-center gap-3">
                    @if (avatarUrl(u.id); as url) {
                      <img [src]="url" alt="Avatar" class="h-8 w-8 rounded object-cover border border-slate-200 shrink-0" />
                    } @else {
                      <div class="h-8 w-8 rounded border bg-slate-900 flex items-center justify-center text-white font-mono text-[11px] font-semibold shrink-0"
                        [class.bg-teal-50]="u.rol==='TECNICO'" [class.text-teal-800]="u.rol==='TECNICO'" [class.border-teal-200]="u.rol==='TECNICO'"
                        [class.bg-slate-900]="u.rol!=='TECNICO'" [class.text-white]="u.rol!=='TECNICO'">
                        {{ inicialesDe(u.nombre, u.apellido) }}
                      </div>
                    }
                    <div class="flex flex-col min-w-0">
                      <span class="font-semibold text-slate-900 truncate" style="font-family:'Montserrat',sans-serif">{{ u.nombre }} {{ u.apellido }}</span>
                      <span class="text-[11px] text-slate-600">{{ rolLabel(u.rol) }}</span>
                      <span class="text-[11px] text-slate-400 truncate">{{ u.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4 whitespace-nowrap text-xs text-slate-700">{{ u.celular ?? '—' }}</td>
                <td class="py-4 px-4">
                  <div class="flex flex-col">
                    <span class="inline-flex items-center gap-1.5 text-slate-900 font-medium text-xs"><span class="w-1.5 h-1.5 rounded-full" [class.bg-slate-900]="u.rol==='ADMIN'" [class.bg-teal-600]="u.rol==='INGENIERO'" [class.bg-teal-500]="u.rol==='TECNICO'" [class.bg-slate-400]="u.rol==='AUDITOR'"></span> {{ u.rol }}</span>
                    <span class="text-[11px] text-slate-500">{{ rolDesc(u.rol) }}</span>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-medium"
                    [class.text-teal-800]="u.activo" [class.text-slate-500]="!u.activo">
                    <span class="w-1.5 h-1.5 rounded-full" [class.bg-teal-600]="u.activo" [class.bg-slate-300]="!u.activo"></span>
                    {{ u.activo ? 'SHA-256 Vigente' : 'No Requerida' }}
                  </span>
                </td>
                <td class="py-4 px-4 whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-medium"
                    [class.bg-teal-50]="u.activo" [class.text-teal-800]="u.activo" [class.border-teal-200]="u.activo"
                    [class.bg-slate-100]="!u.activo" [class.text-slate-600]="!u.activo">{{ u.activo ? 'Activo' : 'Inactivo' }}</span>
                </td>
                @if (esAdmin()) {
                  <td class="py-3.5 px-6 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1">
                      <button (click)="abrirEdicion(u)" class="p-1 rounded border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 cursor-pointer" title="Editar"><span class="material-symbols-outlined text-[16px]">edit</span></button>
                      <button (click)="toast.info('RBAC', 'Gestión de permisos próximamente')" class="p-1 rounded border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-900 cursor-pointer" title="Permisos"><span class="material-symbols-outlined text-[16px]">key</span></button>
                    </div>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td colspan="6" class="py-10 text-center text-sm text-slate-400">Sin usuarios.</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>Mostrando <span class="font-medium text-slate-800">{{ paginados().length }}</span> de <span class="font-medium text-slate-800">{{ filtrados().length }}</span> colaboradores</div>
        <div class="flex items-center gap-1.5">
          <button (click)="prev()" [disabled]="pagina()===0" class="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Anterior</button>
          <span class="px-2">Pág. {{ pagina()+1 }}/{{ totalPaginas() }}</span>
          <button (click)="next()" [disabled]="pagina()+1>=totalPaginas()" class="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer">Siguiente</button>
        </div>
      </div>
    </section>

    <!-- Bottom grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      <div class="lg:col-span-7 bg-white border border-slate-200/70 rounded-xl p-5 flex flex-col justify-between shadow-sm">
        <div>
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-sm font-semibold text-slate-900 tracking-tight" style="font-family:'Montserrat',sans-serif">Trazabilidad de Firmas y Sesiones</h2>
              <p class="text-xs text-slate-500 mt-0.5">Registro inmutable de actos técnicos vinculantes (Dec. 4725).</p>
            </div>
            <span class="text-teal-700 text-xs font-medium">Cadena intacta</span>
          </div>
          <div class="mt-5 space-y-3">
            <div class="p-3 bg-slate-50 border border-slate-200/70 rounded-sm flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 rounded bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center"><span class="material-symbols-outlined text-[15px]">draw</span></span>
                <div>
                  <div class="text-xs font-medium text-slate-900">Firma electrónica de Acta Preventiva #OT-2025-0891</div>
                  <div class="text-[11px] text-slate-600">Ventilador Dräger · <strong>Ing. David Torres</strong></div>
                </div>
              </div>
              <span class="text-[11px] text-slate-500">Hoy, 10:14 COT</span>
            </div>
          </div>
        </div>
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
          <span>ECDSA P-256 + SHA-256</span>
          <span class="text-teal-700 font-medium">Custodia intacta</span>
        </div>
      </div>
      <div class="lg:col-span-5 bg-white border border-slate-200/70 rounded-xl p-5 flex flex-col justify-between shadow-sm">
        <div>
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-teal-700 text-[20px]">policy</span>
            <h3 class="text-sm font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Marco Normativo</h3>
          </div>
          <ul class="space-y-3 text-xs text-slate-700">
            <li class="flex items-start gap-2"><span class="material-symbols-outlined text-teal-700 text-[16px] mt-0.5">verified</span><span><strong>Res. 3100 de 2019:</strong> Registro TP vigente por equipo soporte vital.</span></li>
            <li class="flex items-start gap-2"><span class="material-symbols-outlined text-teal-700 text-[16px] mt-0.5">verified</span><span><strong>Decreto 4725:</strong> Trazabilidad con firma del responsable calificado.</span></li>
            <li class="flex items-start gap-2"><span class="material-symbols-outlined text-teal-700 text-[16px] mt-0.5">verified</span><span><strong>Ley 527 de 1999:</strong> Validez probatoria de firmas digitales.</span></li>
          </ul>
        </div>
        <div class="mt-6 p-3 bg-slate-50 border border-slate-200/70 rounded-sm">
          <div class="flex items-center justify-between text-[11px]">
            <span class="uppercase font-semibold text-slate-800">Certificado Institucional</span>
            <span class="text-teal-700 font-medium">Válido hasta 2027</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-1">GSE / Andes SCD · ID: CSR-BME-99124</p>
        </div>
      </div>
    </div>

    <!-- Modal: Invitar -->
    @if (inviteVisible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" (click)="inviteVisible.set(false)">
        <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl p-6" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Invitar Nuevo Colaborador</h3>
              <p class="text-xs text-slate-500">Vincular ingeniero o técnico al módulo de habilitación</p>
            </div>
            <button (click)="inviteVisible.set(false)" class="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="space-y-3.5">
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Nombre*<input [(ngModel)]="nuevo.nombre" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700 focus:outline-none" placeholder="Nombre" /></label>
              <label class="grid gap-1 text-xs font-medium text-slate-600">Apellido*<input [(ngModel)]="nuevo.apellido" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700 focus:outline-none" placeholder="Apellido" /></label>
            </div>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Correo Institucional*<input [(ngModel)]="nuevo.email" type="email" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700 focus:outline-none" placeholder="correo@..." /></label>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Celular<input [(ngModel)]="nuevo.celular" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700 focus:outline-none" placeholder="300..." /></label>
              <label class="grid gap-1 text-xs font-medium text-slate-600">Contraseña*<input [(ngModel)]="nuevo.password" type="password" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700 focus:outline-none" placeholder="Mín. 8 caracteres" /></label>
            </div>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Rol*<select [(ngModel)]="nuevo.rol" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700 cursor-pointer"><option>ADMIN</option><option>INGENIERO</option><option>TECNICO</option><option>AUDITOR</option></select></label>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-sm flex items-start gap-2.5">
              <input type="checkbox" checked class="mt-0.5 accent-[#044e46] rounded" />
              <span class="text-xs text-slate-600">Emitir certificado criptográfico de firma para actas (Res. 3100).</span>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-5 border-t border-slate-100 pt-4">
            <button (click)="inviteVisible.set(false)" class="rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button (click)="registrar()" class="rounded-sm bg-[#044e46] hover:bg-[#033b35] text-white px-4 py-2 text-xs font-medium shadow-sm cursor-pointer">Enviar Invitación y Token</button>
          </div>
        </div>
      </div>
    }

    <!-- Modal: Editar (existente clínico) -->
    @if (editando(); as e) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4" (click)="cerrarEdicion()">
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between px-6 pt-5">
            <div>
              <h3 class="text-base font-semibold text-slate-900" style="font-family:'Montserrat',sans-serif">Editar usuario</h3>
              <p class="mt-0.5 truncate text-xs text-slate-500">{{ e.email }}</p>
            </div>
            <button (click)="cerrarEdicion()" class="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"><span class="material-symbols-outlined text-[20px]">close</span></button>
          </div>
          <div class="flex flex-col items-center gap-1 px-6 pt-3">
            <ui-avatar-drop #dzEdit [actualUrl]="editAvatar()" [iniciales]="inicialesDe(editNombre, editApellido)" />
            <p class="text-[11px] text-slate-400">Clic en la cámara o arrastra una imagen · se optimiza si supera 2 MB</p>
            @if (dzEdit.vista()) { <button (click)="dzEdit.quitar()" class="text-[11px] font-medium text-rose-600 hover:underline cursor-pointer">Quitar foto</button> }
            @if (dzEdit.errorMsg()) { <p class="text-xs text-rose-600">{{ dzEdit.errorMsg() }}</p> }
          </div>
          <div class="grid gap-4 px-6 py-4">
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Nombre*<input [(ngModel)]="editNombre" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700" /></label>
              <label class="grid gap-1 text-xs font-medium text-slate-600">Apellido*<input [(ngModel)]="editApellido" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700" /></label>
            </div>
            <label class="grid gap-1 text-xs font-medium text-slate-600">Correo*<input [(ngModel)]="editEmail" type="email" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-teal-700" /></label>
            <div class="grid grid-cols-2 gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Celular<input [(ngModel)]="editCelular" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm" /></label>
              <label class="grid gap-1 text-xs font-medium text-slate-600">Rol<select [(ngModel)]="editRol" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm cursor-pointer"><option>ADMIN</option><option>INGENIERO</option><option>TECNICO</option><option>AUDITOR</option></select></label>
            </div>
            <div class="grid grid-cols-2 items-end gap-3">
              <label class="grid gap-1 text-xs font-medium text-slate-600">Nueva contraseña <span class="font-normal text-slate-400">(opcional)</span><input [(ngModel)]="editPassword" type="password" placeholder="Mín. 8 caracteres" class="h-9 rounded-sm border border-slate-300 bg-white px-3 text-sm" /></label>
              <label class="flex h-9 cursor-pointer items-center gap-3 text-xs font-medium text-slate-600">
                <button type="button" (click)="editActivo = !editActivo" class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-[#044e46]/20" [class.bg-[#044e46]]="editActivo" [class.bg-slate-300]="!editActivo" [attr.aria-pressed]="editActivo" [attr.aria-label]="editActivo ? 'Desactivar usuario' : 'Activar usuario'">
                  <span class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform" [class.translate-x-6]="editActivo" [class.translate-x-1]="!editActivo"></span>
                </button>
                <span [class.text-slate-900]="editActivo" [class.text-slate-500]="!editActivo">{{ editActivo ? 'Usuario activo' : 'Usuario inactivo' }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button (click)="cerrarEdicion()" class="rounded border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">Cancelar</button>
            <button (click)="guardarEdicion()" [disabled]="editGuardando()" class="rounded bg-[#044e46] px-4 py-2 text-xs font-medium text-white hover:bg-emerald-900 disabled:opacity-50 cursor-pointer">{{ editGuardando() ? 'Guardando…' : 'Guardar cambios' }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class Usuarios {
  private readonly api = inject(UsuariosService);
  private readonly auth = inject(AuthService);
  readonly toast = inject(ToastService);
  private readonly dzEdit = viewChild(UiAvatarDrop);

  readonly usuarios = signal<Usuario[]>([]);
  readonly pagina = signal(0);
  readonly inviteVisible = signal(false);
  readonly avatares = signal<Map<number, string>>(new Map());

  busqueda = '';
  fRol = '';
  fEstado = '';

  nuevo: { nombre: string; apellido: string; celular: string; email: string; password: string; rol: RolUsuario } = { nombre: '', apellido: '', celular: '', email: '', password: '', rol: 'TECNICO' };

  readonly editando = signal<Usuario | null>(null);
  readonly editGuardando = signal(false);
  readonly editAvatar = signal<string | null>(null);
  editNombre = ''; editApellido = ''; editCelular = ''; editRol: RolUsuario = 'TECNICO'; editActivo = true; editPassword = ''; editEmail = '';

  constructor() { this.cargar(); }

  esAdmin(): boolean { return this.auth.rol() === 'ADMIN'; }

  total = computed(() => this.usuarios().length);
  kpiTecnicos = computed(() => this.usuarios().filter(u => u.rol === 'TECNICO').length);
  kpiActivos = computed(() => this.usuarios().filter(u => u.activo).length);

  filtrados = computed(() => {
    let list = this.usuarios();
    const q = this.busqueda.toLowerCase().trim();
    if (q) list = list.filter(u => (`${u.nombre} ${u.apellido} ${u.email} ${u.celular ?? ''}`.toLowerCase().includes(q)));
    if (this.fRol) list = list.filter(u => u.rol === this.fRol);
    if (this.fEstado === 'activo') list = list.filter(u => u.activo);
    if (this.fEstado === 'inactivo') list = list.filter(u => !u.activo);
    return list;
  });

  paginados = computed(() => {
    const all = this.filtrados();
    const size = 10;
    const start = this.pagina() * size;
    return all.slice(start, start + size);
  });

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / 10)));

  msg(e: unknown): string { const x = e as { error?: { detail?: string; message?: string } }; return x?.error?.detail ?? x?.error?.message ?? 'Operación fallida'; }

  cargar(): void {
    this.api.listar(this.fRol || undefined).subscribe({
      next: (u) => { this.usuarios.set(u); this.cargarAvatares(u); },
      error: (e) => this.toast.error('No se pudo cargar', this.msg(e)),
    });
  }

  avatarUrl(id: number): string | null { return this.avatares().get(id) ?? null; }

  private cargarAvatares(usuarios: Usuario[]): void {
    // limpia anteriores
    for (const url of this.avatares().values()) URL.revokeObjectURL(url);
    const map = new Map<number, string>();
    for (const u of usuarios) {
      this.api.avatarDe(u.id).subscribe({
        next: (b) => {
          if (b && b.size > 0) {
            const url = URL.createObjectURL(b);
            map.set(u.id, url);
            this.avatares.set(new Map(map));
          }
        },
      });
    }
    this.avatares.set(map);
  }

  exportar(): void {
    const rows = this.filtrados();
    if (rows.length === 0) { this.toast.aviso('Nada para exportar', 'No hay usuarios filtrados'); return; }
    const csv = ['Nombre,Apellido,Email,Celular,Rol,Estado',
      ...rows.map(u => `"${u.nombre}","${u.apellido}",${u.email},${u.celular ?? ''},${u.rol},${u.activo ? 'Activo' : 'Inactivo'}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `usuarios-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
    this.toast.exito('Exportado', `${rows.length} usuarios en CSV`);
  }

  registrar(): void {
    if (!this.nuevo.nombre.trim() || !this.nuevo.apellido.trim() || !this.nuevo.email.trim() || !this.nuevo.password.trim()) {
      this.toast.error('Faltan datos', 'Nombre, apellido, email y contraseña son obligatorios');
      return;
    }
    if (this.nuevo.password.length < 8) { this.toast.error('Contraseña muy corta', 'Mínimo 8 caracteres'); return; }
    this.auth.registrar({ ...this.nuevo, celular: this.nuevo.celular || undefined }).subscribe({
      next: () => { this.toast.exito('Usuario invitado'); this.inviteVisible.set(false); this.nuevo = { nombre: '', apellido: '', celular: '', email: '', password: '', rol: 'TECNICO' }; this.cargar(); },
      error: (e) => this.toast.error('No se pudo invitar', this.msg(e)),
    });
  }

  inicialesDe(n: string, a: string): string { return ((n.trim()[0] ?? '') + (a.trim()[0] ?? '')).toUpperCase() || '?'; }
  rolLabel(r: string): string { return r === 'ADMIN' ? 'Administrador General' : r === 'INGENIERO' ? 'Ingeniero Validador' : r === 'TECNICO' ? 'Técnico de Campo' : 'Auditor Habilitación'; }
  rolDesc(r: string): string { return r === 'ADMIN' ? 'Control Total • Gestión Infraestructura' : r === 'INGENIERO' ? 'Soporte Vital • Certificación Técnica' : r === 'TECNICO' ? 'Mantenimiento Correctivo & Calibración' : 'Acceso Solo Lectura • Descarga de Actas'; }

  abrirEdicion(u: Usuario): void {
    this.editando.set(u);
    this.editNombre = u.nombre; this.editApellido = u.apellido ?? ''; this.editCelular = u.celular ?? ''; this.editRol = u.rol; this.editActivo = u.activo; this.editPassword = ''; this.editEmail = u.email;
    this.dzEdit()?.reiniciar(); this.fijarAvatarExistente(null);
    this.api.avatarDe(u.id).subscribe({ next: (b) => { if (b && b.size > 0) this.fijarAvatarExistente(URL.createObjectURL(b)); } });
  }
  private fijarAvatarExistente(url: string | null): void { const a = this.editAvatar(); if (a) URL.revokeObjectURL(a); this.editAvatar.set(url); }
  cerrarEdicion(): void { this.fijarAvatarExistente(null); this.editando.set(null); }
  guardarEdicion(): void {
    const u = this.editando(); if (!u) return;
    if (!this.editNombre.trim() || !this.editApellido.trim()) { this.toast.error('Faltan datos', 'Nombre y apellido obligatorios'); return; }
    if (!this.editEmail.trim() || !this.editEmail.includes('@')) { this.toast.error('Correo inválido', 'Ingresa un correo válido'); return; }
    if (this.editPassword && this.editPassword.length < 8) { this.toast.error('Contraseña muy corta', 'Mínimo 8'); return; }
    const dz = this.dzEdit(); if (dz?.errorMsg()) { this.toast.error('Revisa la foto', dz.errorMsg()!); return; }
    this.editGuardando.set(true);
    this.api.actualizar(u.id, { email: this.editEmail.trim().toLowerCase(), nombre: this.editNombre.trim(), apellido: this.editApellido.trim(), celular: this.editCelular.trim() || undefined, rol: this.editRol, activo: this.editActivo, passwordNueva: this.editPassword || undefined }).subscribe({
      next: () => {
        const f = dz?.archivo() ?? null;
        if (f) {
          this.api.subirAvatarDe(u.id, f).subscribe({ next: () => this.finEdicion(), error: (er) => { this.toast.error('Avatar no guardado', `Foto falló${(er as { status?: number })?.status !== undefined ? ` (HTTP ${(er as { status?: number }).status})` : ''}`); this.editGuardando.set(false); } });
        } else { this.finEdicion(); }
      },
      error: (e) => { this.toast.error('No se pudo guardar', this.msg(e)); this.editGuardando.set(false); },
    });
  }
  private finEdicion(): void { this.editGuardando.set(false); this.cerrarEdicion(); this.toast.exito('Usuario actualizado'); this.cargar(); }

  prev(): void { if (this.pagina() > 0) this.pagina.update(v => v - 1); }
  next(): void { if (this.pagina() + 1 < this.totalPaginas()) this.pagina.update(v => v + 1); }
}
