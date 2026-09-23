import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  CrearOrdenRequest, EjecucionRequest, Equipo, EquipoRequest, Orden, Pagina, Plan,
  RegistroEjecucion, ResumenDashboard, ResumenRevision, ResultadoCarga, Usuario, UsuarioAdminRequest
} from './models';

/**
 * Servicios API 1:1 con los controllers del backend.
 */

// ===== Equipos =====

@Injectable({ providedIn: 'root' })
export class EquiposService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/equipos';

  listar(filtros: {
    pagina?: number; tamano?: number; orden?: string;
    ubicacion?: string; q?: string; riesgo?: string; estado?: string;
  }): Observable<Pagina<Equipo>> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina ?? 0)
      .set('tamano', filtros.tamano ?? 10);
    if (filtros.orden) params = params.set('orden', filtros.orden);
    if (filtros.q) params = params.set('q', filtros.q);
    else if (filtros.ubicacion) params = params.set('ubicacion', filtros.ubicacion);
    if (filtros.riesgo) params = params.set('riesgo', filtros.riesgo);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    return this.http.get<Pagina<Equipo>>(this.base, { params });
  }

  crear(request: EquipoRequest): Observable<Equipo> {
    return this.http.post<Equipo>(this.base, request);
  }

  obtenerPorId(id: number): Observable<Equipo> {
    return this.http.get<Equipo>(`${this.base}/${id}`);
  }

  actualizar(id: number, request: EquipoRequest): Observable<Equipo> {
    return this.http.put<Equipo>(`${this.base}/${id}`, request);
  }

  // El backend espera un JSON string: "OPERATIVO" (con comillas).
  cambiarEstado(id: number, estado: string): Observable<Equipo> {
    return this.http.patch<Equipo>(`${this.base}/${id}/estado`, JSON.stringify(estado),
      { headers: { 'Content-Type': 'application/json' } });
  }

  darDeBaja(id: number): Observable<Equipo> {
    return this.http.delete<Equipo>(`${this.base}/${id}`);
  }
}

// ===== Planes de mantenimiento =====

@Injectable({ providedIn: 'root' })
export class PlanesService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/planes-mantenimiento';

  listar(filtros: { pagina?: number; tamano?: number; orden?: string; estado?: string; equipoId?: number; q?: string; frecuenciaDias?: number }): Observable<Pagina<Plan>> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina ?? 0)
      .set('tamano', filtros.tamano ?? 10);
    if (filtros.orden) params = params.set('orden', filtros.orden);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.equipoId) params = params.set('equipoId', filtros.equipoId);
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.frecuenciaDias) params = params.set('frecuenciaDias', filtros.frecuenciaDias);
    return this.http.get<Pagina<Plan>>(this.base, { params });
  }

  pendientes(estado?: string): Observable<Plan[]> {
    const params = estado ? new HttpParams().set('estado', estado) : undefined;
    return this.http.get<Plan[]>(`${this.base}/pendientes`, { params });
  }

  obtenerPorId(id: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.base}/${id}`);
  }

  obtenerPorEquipo(equipoId: number): Observable<Plan> {
    return this.http.get<Plan>(`${this.base}/equipo/${equipoId}`);
  }

  vencidos(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.base}/vencidos`);
  }

  /** Compat: alias de pendientes filtrado, usa X-Skip-Loader opcional a nivel caller */
  pendientesFiltro(estado?: string): Observable<Plan[]> {
    return this.pendientes(estado);
  }

  revision(): Observable<ResumenRevision> {
    return this.http.get<ResumenRevision>(`${this.base}/revision`);
  }

  ejecutarRevision(): Observable<ResumenRevision> {
    return this.http.post<ResumenRevision>(`${this.base}/revision`, {});
  }

  cambiarFrecuencia(id: number, frecuencia: number): Observable<Plan> {
    return this.http.patch<Plan>(`${this.base}/${id}/frecuencia`, frecuencia,
      { headers: { 'Content-Type': 'application/json' } });
  }

  registrarEjecucion(id: number, req: EjecucionRequest): Observable<Plan> {
    return this.http.post<Plan>(`${this.base}/${id}/ejecuciones`, req);
  }

  historial(id: number): Observable<RegistroEjecucion[]> {
    return this.http.get<RegistroEjecucion[]>(`${this.base}/${id}/historial`);
  }
}

// ===== Órdenes de trabajo =====

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/ordenes-trabajo';

  listar(filtros: {
    pagina?: number; tamano?: number; orden?: string; estado?: string; tipo?: string;
    equipoId?: number; tecnicoId?: number; q?: string;
  }): Observable<Pagina<Orden>> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina ?? 0)
      .set('tamano', filtros.tamano ?? 10);
    if (filtros.orden) params = params.set('orden', filtros.orden);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.equipoId) params = params.set('equipoId', filtros.equipoId);
    if (filtros.tecnicoId) params = params.set('tecnicoId', filtros.tecnicoId);
    if (filtros.q) params = params.set('q', filtros.q);
    return this.http.get<Pagina<Orden>>(this.base, { params });
  }

  crear(request: CrearOrdenRequest): Observable<Orden> {
    return this.http.post<Orden>(this.base, request);
  }

  obtenerPorId(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.base}/${id}`);
  }

  asignar(id: number, tecnicoId: number): Observable<Orden> {
    return this.http.patch<Orden>(`${this.base}/${id}/asignar`, { tecnicoId });
  }

  iniciar(id: number): Observable<Orden> {
    return this.http.patch<Orden>(`${this.base}/${id}/iniciar`, {});
  }

  completar(id: number, resultado: string): Observable<Orden> {
    return this.http.patch<Orden>(`${this.base}/${id}/completar`, { resultado });
  }

  cancelar(id: number, motivo?: string): Observable<Orden> {
    const body = motivo ? JSON.stringify(motivo) : null;
    return this.http.patch<Orden>(`${this.base}/${id}/cancelar`, body,
      { headers: { 'Content-Type': 'application/json' } });
  }

  generarPreventivas(): Observable<{ ordenesCreadas: number }> {
    return this.http.post<{ ordenesCreadas: number }>(`${this.base}/generar-preventivas`, {});
  }
}

// ===== Usuarios =====

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);

  listar(rol?: string, activo?: boolean): Observable<Usuario[]> {
    let params = new HttpParams();
    if (rol) params = params.set('rol', rol);
    if (activo !== undefined) params = params.set('activo', String(activo));
    return this.http.get<Usuario[]>('/api/usuarios', { params: params.keys().length ? params : undefined });
  }

  /** Edición total por el ADMIN (el email no se toca). */
  actualizar(id: number, req: UsuarioAdminRequest): Observable<Usuario> {
    return this.http.patch<Usuario>(`/api/usuarios/${id}`, req);
  }

  avatarDe(id: number): Observable<Blob | null> {
    return this.http.get(`/api/usuarios/${id}/avatar`, { responseType: 'blob' });
  }

  subirAvatarDe(id: number, archivo: File): Observable<void> {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.put<void>(`/api/usuarios/${id}/avatar`, form);
  }
}

// ===== Dashboard =====

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  resumen(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>('/api/dashboard/resumen');
  }
}

// ===== Reportes (PDF binario) =====

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  hojaDeVida(equipoId: number): Observable<Blob> {
    return this.http.get(`/api/reportes/equipos/${equipoId}/hoja-de-vida`, { responseType: 'blob' });
  }

  certificado(equipoId?: number): Observable<Blob> {
    const params = equipoId ? new HttpParams().set('equipoId', equipoId) : undefined;
    return this.http.get('/api/reportes/certificado-cumplimiento', { params, responseType: 'blob' });
  }

  descargar(blob: Blob, nombre: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  }

  extraerFilename(contentDisposition: string | null): string | null {
    if (!contentDisposition) return null;
    const m = /filename\*?=(?:UTF-8''|")?([^";\n]+)/i.exec(contentDisposition);
    return m ? decodeURIComponent(m[1].replace(/"/g, '')) : null;
  }
}

// ===== Carga masiva =====

@Injectable({ providedIn: 'root' })
export class CargaMasivaService {
  private readonly http = inject(HttpClient);

  importar(archivo: File): Observable<ResultadoCarga> {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.post<ResultadoCarga>('/api/equipos/carga-masiva', form);
  }
}
