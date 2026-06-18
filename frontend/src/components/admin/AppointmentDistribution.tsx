import type { AppointmentDistribution as AppointmentDistributionType } from '../../types/admin'
import { getTotalAppointments } from '../../utils/adminReport'

interface AppointmentDistributionProps {
  distribution: AppointmentDistributionType
  variant?: 'bars' | 'table'
}

export function AppointmentDistribution({
  distribution,
  variant = 'bars',
}: AppointmentDistributionProps) {
  const total = getTotalAppointments(distribution)

  if (variant === 'table') {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
        <h4 className="mb-3 text-sm font-semibold text-slate-900">Distribución de citas</h4>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-400">
              <th className="pb-2 font-semibold">Estado de la cita</th>
              <th className="pb-2 text-right font-semibold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(distribution).map(([estado, count]) => (
              <tr key={estado} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 font-medium capitalize text-slate-700">{estado}</td>
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
      <h3 className="mb-4 font-semibold text-slate-900">Distribución de citas</h3>
      <div className="space-y-3">
        {Object.entries(distribution).map(([estado, count]) => (
          <div key={estado} className="flex items-center justify-between">
            <span className="text-sm capitalize text-slate-600">{estado}</span>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium">{count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
