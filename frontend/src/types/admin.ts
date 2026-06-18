import type { EstadoCita, UserRole } from './index'
import type { LucideIcon } from 'lucide-react'

/** KPIs principales compartidos entre Dashboard y Reportes */
export interface DashboardStats {
  totalPacientes: number
  citasMes: number
  tratamientosActivos: number
  alertasStock: number
  totalDiagnosticos: number
  citasCompletadas: number
}

export type AppointmentDistribution = Record<EstadoCita, number>

export interface SeverityDistribution {
  leve: number
  moderada: number
  grave: number
}

/** Resumen ejecutivo — texto derivado de métricas locales + síntesis mock */
export interface ExecutiveSummary {
  periodo: string
  sintesis: string
  indicadoresDestacados: string[]
  /** Marca explícita de datos no provenientes de API financiera */
  _source: 'derived' | 'mock'
}

/**
 * Resumen financiero preparado para futura integración con ERP/facturación.
 * Los valores numéricos actuales provienen de MOCK_FINANCIAL_SUMMARY.
 */
export interface FinancialSummary {
  ingresosPeriodo: number
  gastosPeriodo: number
  resultadoNeto: number
  ingresosPeriodoAnterior: number
  gastosPeriodoAnterior: number
  variacionPorcentaje: number
  comentarioEjecutivo: string
  moneda: string
  /** Indica que los montos son ilustrativos hasta conectar backend */
  _isMock: true
}

export type SignificantEventCategory =
  | 'personal'
  | 'convenio'
  | 'infraestructura'
  | 'operacion'

export interface SignificantEvent {
  id: string
  fecha: string
  titulo: string
  descripcion: string
  categoria: SignificantEventCategory
  _isMock: true
}

export type RiskOutlookCategory =
  | 'riesgo'
  | 'incertidumbre'
  | 'proyeccion'
  | 'presion_costos'
  | 'expansion'

export interface RiskOutlookItem {
  id: string
  categoria: RiskOutlookCategory
  titulo: string
  descripcion: string
  _isMock: true
}

export interface RiskOutlook {
  items: RiskOutlookItem[]
}

/** Paquete completo del reporte ejecutivo administrativo */
export interface AdminReportData {
  stats: DashboardStats
  appointmentDistribution: AppointmentDistribution
  severityDistribution: SeverityDistribution
  executiveSummary: ExecutiveSummary
  financialSummary: FinancialSummary
  significantEvents: SignificantEvent[]
  riskOutlook: RiskOutlook
}

export type QuickAccessVariant = 'default' | 'audit' | 'inventory' | 'reports' | 'clinical'

export interface QuickAccessLink {
  id: string
  to: string
  label: string
  description: string
  icon: LucideIcon
  variant?: QuickAccessVariant
  /** Roles con acceso habilitado; si el rol actual no está incluido, se muestra restringido */
  roles?: UserRole[]
  /** Muestra indicador de acceso supervisado (datos sensibles) */
  restricted?: boolean
}
