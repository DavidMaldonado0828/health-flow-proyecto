export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
export type AuditEntity =
  | 'especialidad'
  | 'cita'
  | 'diagnostico'
  | 'tratamiento'
  | 'medicamento'
  | 'historial'
  | 'reporte'
  | 'usuario'

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: AuditAction
  entity: AuditEntity
  entityId: string
  details: string
  ip?: string
}

export interface Especialidad {
  id: string
  nombre: string
  descripcion: string
  activa: boolean
  createdAt: string
}

export interface Paciente {
  id: string
  documento: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  telefono: string
  email: string
  direccion?: string
  ciudad?: string
}

export interface PacienteCuenta {
  pacienteId: string
  documento: string
  email: string
  password: string
}

export interface FormulaMedica {
  id: string
  pacienteId: string
  medico: string
  fecha: string
  medicamentos: string
  indicaciones: string
  diagnosticoRef?: string
}

export interface ResultadoExamen {
  id: string
  pacienteId: string
  nombre: string
  tipo: string
  fecha: string
  medico: string
  resumen: string
  archivoNombre: string
}

export type UserRole = 'paciente' | 'medico' | 'administrador'

export interface UserAccount {
  id: string
  email: string
  password: string
  nombre: string
  apellido: string
  documento: string
  rol: UserRole
  relacionadoId?: string
}

export interface AuthSession {
  userId: string
  nombre: string
  email: string
  rol: UserRole
  loginAt: string
  pacienteId: string
}

export type EstadoCita = 'programada' | 'confirmada' | 'completada' | 'cancelada'

export interface Cita {
  id: string
  pacienteId: string
  especialidadId: string
  medico: string
  fecha: string
  hora: string
  motivo: string
  estado: EstadoCita
  createdAt: string
}

export interface Diagnostico {
  id: string
  pacienteId: string
  citaId?: string
  codigoCIE: string
  descripcion: string
  severidad: 'leve' | 'moderada' | 'grave'
  fecha: string
  medico: string
  notas: string
}

export interface Tratamiento {
  id: string
  pacienteId: string
  diagnosticoId: string
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin?: string
  estado: 'activo' | 'completado' | 'suspendido'
  medico: string
}

export interface Medicamento {
  id: string
  nombre: string
  principioActivo: string
  presentacion: string
  stock: number
  stockMinimo: number
  unidad: string
  lote: string
  vencimiento: string
  activo: boolean
}

export interface Prescripcion {
  id: string
  tratamientoId: string
  medicamentoId: string
  dosis: string
  frecuencia: string
  duracionDias: number
}

export interface HistorialEntry {
  id: string
  pacienteId: string
  tipo: 'cita' | 'diagnostico' | 'tratamiento' | 'prescripcion'
  referenciaId: string
  resumen: string
  fecha: string
  medico: string
}

export interface ReporteResumen {
  citasPorEstado: Record<EstadoCita, number>
  diagnosticosPorSeveridad: Record<string, number>
  medicamentosBajoStock: number
  tratamientosActivos: number
  totalPacientes: number
  citasMes: number
  totalDiagnosticos: number
  citasCompletadas: number
}

export type {
  DashboardStats,
  AppointmentDistribution,
  SeverityDistribution,
  ExecutiveSummary,
  FinancialSummary,
  SignificantEvent,
  RiskOutlook,
  RiskOutlookItem,
  AdminReportData,
  QuickAccessLink,
} from './admin'
