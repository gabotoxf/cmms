/**
 * Modelos que reflejan los DTOs del backend 1:1 (records de Java -> interfaces TS).
 */

// ===== Envolventes de paginación =====

export interface Pagina<T> {
  contenido: T[];
  totalElementos: number;
  totalPaginas: number;
  pagina: number;
  tamano: number;
}

// ===== Equipos =====

export type ClasificacionRiesgo = 'I' | 'IIA' | 'IIB' | 'III';
export type EstadoEquipo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO' | 'DADO_DE_BAJA';

export interface Equipo {
  id: number;
  serial: string;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  ubicacion: string;
  clasificacionRiesgo: ClasificacionRiesgo;
  fechaAdquisicion?: string | null;
  periodicidadMantenimientoDias: number;
  estado: EstadoEquipo;
  creadoEn: string;
  actualizadoEn: string;
}

export interface EquipoRequest {
  serial: string;
  nombre: string;
  marca?: string | null;
  modelo?: string | null;
  ubicacion: string;
  clasificacionRiesgo: ClasificacionRiesgo;
  fechaAdquisicion?: string | null;
  periodicidadMantenimientoDias: number;
}

// ===== Planes de mantenimiento =====

export type EstadoPlan = 'VENCIDO' | 'PROXIMO' | 'AL_DIA';

export interface Plan {
  id: number;
  equipoId: number;
  equipoSerial: string;
  equipoNombre: string;
  frecuenciaDias: number;
  ultimaEjecucion?: string | null;
  proximaFecha: string;
  diasRestantes: number;
  estado: EstadoPlan;
  creadoEn: string;
  actualizadoEn: string;
}

// ===== Órdenes de trabajo =====

export type TipoOrden = 'PREVENTIVO' | 'CORRECTIVO';
export type EstadoOrden = 'PENDIENTE' | 'ASIGNADA' | 'EN_PROCESO' | 'COMPLETADA' | 'CANCELADA';

export interface Orden {
  id: number;
  equipoId: number;
  equipoSerial: string;
  equipoNombre: string;
  tipo: TipoOrden;
  estado: EstadoOrden;
  titulo: string;
  descripcion?: string | null;
  tecnicoId?: number | null;
  tecnicoNombre?: string | null;
  resultado?: string | null;
  fechaProgramada: string;
  asignadaEn?: string | null;
  iniciadaEn?: string | null;
  completadaEn?: string | null;
  canceladaEn?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearOrdenRequest {
  equipoId: number;
  tipo: TipoOrden;
  titulo: string;
  descripcion?: string;
  fechaProgramada?: string;
}

// ===== Usuarios =====

export type Rol = 'ADMIN' | 'INGENIERO' | 'TECNICO' | 'AUDITOR';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  celular?: string | null;
  rol: Rol;
  activo: boolean;
}

// ===== Dashboard =====

export interface ResumenDashboard {
  equiposPorEstado: Record<string, number>;
  ordenesPorEstado: Record<string, number>;
  ordenesAbiertas: number;
  planesVencidos: number;
  planesProximos: number;
  mttrHoras: number | null;
  cumplimientoMesPct: number | null;
  generadoEn: string;
}

// ===== Ejecuciones / historial =====

export interface EjecucionRequest {
  fechaEjecucion: string;
  descripcion?: string;
  tecnico: string;
}

export interface RegistroEjecucion {
  id: number;
  planId: number;
  fechaEjecucion: string;
  descripcion?: string | null;
  tecnico: string;
  creadoEn: string;
}

export interface ResumenRevision {
  vencidos: number;
  proximos: number;
}

// ===== Carga masiva =====

export interface ErrorFila {
  fila: number;
  serial: string;
  motivo: string;
}

export interface ResultadoCarga {
  filasLeidas: number;
  equiposCreados: number;
  errores: ErrorFila[];
}

// ===== Registro de usuarios =====

export interface RegistroRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  celular?: string;
  rol: Rol;
}

export interface UsuarioAdminRequest {
  nombre: string;
  apellido: string;
  celular?: string;
  rol: Rol;
  activo: boolean;
  passwordNueva?: string;
}
