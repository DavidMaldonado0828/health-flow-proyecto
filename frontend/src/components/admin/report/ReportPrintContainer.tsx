import type { AdminReportData } from '../../../types/admin'
import { AppointmentDistribution } from '../AppointmentDistribution'
import { SeverityDistribution } from '../SeverityDistribution'
import { ReportDocumentHeader } from './ReportDocumentHeader'
import { ExecutiveSummarySection } from './ExecutiveSummarySection'
import { FinancialSummarySection } from './FinancialSummarySection'
import { SignificantEventsSection } from './SignificantEventsSection'
import { RiskOutlookSection } from './RiskOutlookSection'

export const REPORT_EXPORT_CONTAINER_ID = 'reporte-health-flow-container'

interface ReportPrintContainerProps {
  data: AdminReportData
  generadoEn: string
}

export function ReportPrintContainer({ data, generadoEn }: ReportPrintContainerProps) {
  return (
    <div
      id={REPORT_EXPORT_CONTAINER_ID}
      className="mt-4 space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <ReportDocumentHeader generadoEn={generadoEn} />

      <ExecutiveSummarySection stats={data.stats} summary={data.executiveSummary} />

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
          Indicadores operativos detallados
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <AppointmentDistribution distribution={data.appointmentDistribution} variant="table" />
          <SeverityDistribution distribution={data.severityDistribution} variant="table" />
        </div>
      </div>

      <div className="space-y-6 border-t border-slate-200 pt-6">
        <FinancialSummarySection financial={data.financialSummary} />
        <SignificantEventsSection events={data.significantEvents} />
        <RiskOutlookSection outlook={data.riskOutlook} />
      </div>

      <div className="border-t border-slate-200 pt-4 text-center">
        <p className="text-[10px] text-slate-400">
          Health Flow — Consola administrativa. Generación y exportación local de datos.
        </p>
      </div>
    </div>
  )
}
