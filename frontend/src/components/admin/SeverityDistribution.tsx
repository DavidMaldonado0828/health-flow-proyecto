import type { SeverityDistribution as SeverityDistributionType } from '../../types/admin'

interface SeverityDistributionProps {
  distribution: SeverityDistributionType
  variant?: 'cards' | 'table'
}

export function SeverityDistribution({
  distribution,
  variant = 'cards',
}: SeverityDistributionProps) {
  if (variant === 'table') {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
        <h4 className="mb-3 text-sm font-semibold text-slate-900">Diagnósticos por severidad</h4>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-400">
              <th className="pb-2 font-semibold">Nivel de severidad</th>
              <th className="pb-2 text-right font-semibold">Diagnósticos</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(distribution).map(([severidad, count]) => (
              <tr key={severidad} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 font-medium capitalize text-slate-700">{severidad}</td>
                <td className="py-2.5 text-right font-semibold text-slate-900">{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="mb-4 font-semibold text-slate-900">Diagnósticos por severidad</h3>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(distribution).map(([severidad, count]) => (
          <div key={severidad} className="rounded-lg bg-slate-50 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="mt-1 text-xs capitalize text-slate-500">{severidad}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
