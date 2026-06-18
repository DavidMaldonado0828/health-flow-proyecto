import { CheckSquare } from 'lucide-react'
import type { SignificantEvent, SignificantEventCategory } from '../../../types/admin'

const CATEGORY_LABELS: Record<SignificantEventCategory, string> = {
  personal: 'Personal',
  convenio: 'Convenio',
  infraestructura: 'Infraestructura',
  operacion: 'Operación',
}

interface SignificantEventsSectionProps {
  events: SignificantEvent[]
}

export function SignificantEventsSection({ events }: SignificantEventsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <CheckSquare className="h-4 w-4 text-indigo-700" />
          III. Hechos significativos del período
        </h4>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          Datos ilustrativos (mock)
        </span>
      </div>
      <ul className="grid gap-3">
        {events.map((event, index) => (
          <li
            key={event.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{event.titulo}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {CATEGORY_LABELS[event.categoria]}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400">{event.fecha}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{event.descripcion}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
