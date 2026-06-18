import type { ReporteResumen } from '../types'
import type {
  AdminReportData,
  AppointmentDistribution,
  DashboardStats,
  ExecutiveSummary,
  SeverityDistribution,
} from '../types/admin'
import {
  MOCK_FINANCIAL_SUMMARY,
  MOCK_RISK_OUTLOOK,
  MOCK_SIGNIFICANT_EVENTS,
} from '../data/adminMocks'

export function mapResumenToStats(resumen: ReporteResumen): DashboardStats {
  return {
    totalPacientes: resumen.totalPacientes,
    citasMes: resumen.citasMes,
    tratamientosActivos: resumen.tratamientosActivos,
    alertasStock: resumen.medicamentosBajoStock,
    totalDiagnosticos: resumen.totalDiagnosticos,
    citasCompletadas: resumen.citasCompletadas,
  }
}

export function mapResumenToAppointmentDistribution(
  resumen: ReporteResumen
): AppointmentDistribution {
  return { ...resumen.citasPorEstado }
}

export function mapResumenToSeverityDistribution(
  resumen: ReporteResumen
): SeverityDistribution {
  return {
    leve: resumen.diagnosticosPorSeveridad.leve ?? 0,
    moderada: resumen.diagnosticosPorSeveridad.moderada ?? 0,
    grave: resumen.diagnosticosPorSeveridad.grave ?? 0,
  }
}

/** Construye síntesis ejecutiva a partir de métricas locales reales */
export function buildExecutiveSummary(resumen: ReporteResumen): ExecutiveSummary {
  const now = new Date()
  const periodo = now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

  const sintesis = `Durante el período de ${periodo}, Health Flow mantiene operación estable con ${resumen.totalPacientes} pacientes registrados y ${resumen.citasMes} citas gestionadas en el mes. Se registran ${resumen.tratamientosActivos} tratamientos activos y ${resumen.totalDiagnosticos} diagnósticos documentados. El inventario farmacéutico reporta ${resumen.medicamentosBajoStock} alerta(s) de stock que requieren seguimiento administrativo.`

  const indicadoresDestacados = [
    `${resumen.citasCompletadas} citas completadas en el período`,
    `${resumen.medicamentosBajoStock} alerta(s) de reabastecimiento`,
    `${resumen.tratamientosActivos} tratamientos en curso`,
  ]

  return {
    periodo,
    sintesis,
    indicadoresDestacados,
    _source: 'derived',
  }
}

export function buildAdminReportData(resumen: ReporteResumen): AdminReportData {
  return {
    stats: mapResumenToStats(resumen),
    appointmentDistribution: mapResumenToAppointmentDistribution(resumen),
    severityDistribution: mapResumenToSeverityDistribution(resumen),
    executiveSummary: buildExecutiveSummary(resumen),
    financialSummary: MOCK_FINANCIAL_SUMMARY,
    significantEvents: MOCK_SIGNIFICANT_EVENTS,
    riskOutlook: MOCK_RISK_OUTLOOK,
  }
}

export function getTotalAppointments(distribution: AppointmentDistribution): number {
  return Object.values(distribution).reduce((sum, count) => sum + count, 0)
}
