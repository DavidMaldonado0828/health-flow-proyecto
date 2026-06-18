import { AlertTriangle } from 'lucide-react'
import type { RiskOutlook, RiskOutlookCategory } from '../../../types/admin'

const CATEGORY_CONFIG: Record<
  RiskOutlookCategory,
  { label: string; badgeClass: string; iconClass: string }
> = {
  riesgo: {
    label: 'Riesgo',
    badgeClass: 'bg-red-50 text-red-700',
    iconClass: 'text-red-600',
  },
  incertidumbre: {
    label: 'Incertidumbre',
    badgeClass: 'bg-amber-50 text-amber-700',
    iconClass: 'text-amber-600',
  },
  proyeccion: {
    label: 'Proyección',
    badgeClass: 'bg-blue-50 text-blue-700',
    iconClass: 'text-blue-600',
  },
  presion_costos: {
    label: 'Presión de costos',
    badgeClass: 'bg-orange-50 text-orange-700',
    iconClass: 'text-orange-600',
  },
  expansion: {
    label: 'Plan de expansión',
    badgeClass: 'bg-emerald-50 text-emerald-700',
    iconClass: 'text-emerald-600',
  },
}

interface RiskOutlookSectionProps {
  outlook: RiskOutlook
}

export function RiskOutlookSection({ outlook }: RiskOutlookSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          IV. Riesgos, incertidumbres y evolución previsible
        </h4>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          Datos ilustrativos (mock)
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {outlook.items.map((item) => {
          const config = CATEGORY_CONFIG[item.categoria]
          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${config.iconClass}`} />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{item.titulo}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${config.badgeClass}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.descripcion}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
