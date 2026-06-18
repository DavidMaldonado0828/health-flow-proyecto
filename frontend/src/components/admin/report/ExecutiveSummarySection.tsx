import { FileText } from 'lucide-react'
import type { ExecutiveSummary } from '../../../types/admin'
import { KpiStatsGrid } from '../KpiStatsGrid'
import type { DashboardStats } from '../../../types/admin'

interface ExecutiveSummarySectionProps {
  stats: DashboardStats
  summary: ExecutiveSummary
}

export function ExecutiveSummarySection({ stats, summary }: ExecutiveSummarySectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
        I. Resumen ejecutivo
      </h3>
      <KpiStatsGrid stats={stats} layout="compact" />
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <FileText className="h-4 w-4 text-red-700" />
          Síntesis del período — {summary.periodo}
        </h4>
        <div className="rounded-xl border-l-4 border-red-700 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 shadow-sm">
          {summary.sintesis}
        </div>
        <ul className="grid gap-2 sm:grid-cols-3">
          {summary.indicadoresDestacados.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
