import { ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BadgeEstado } from '../ui'
import { getAuditLogs } from '../../services/audit'
import type { AuditEntity } from '../../types'

const ENTITY_LABELS: Record<AuditEntity, string> = {
  especialidad: 'Especialidad',
  cita: 'Cita',
  diagnostico: 'Diagnóstico',
  tratamiento: 'Tratamiento',
  medicamento: 'Medicamento',
  historial: 'Historial clínico',
  reporte: 'Reporte',
  usuario: 'Usuario',
}

interface RecentActivityPanelProps {
  limit?: number
  showAuditLink?: boolean
}

export function RecentActivityPanel({ limit = 5, showAuditLink = true }: RecentActivityPanelProps) {
  const logs = getAuditLogs().slice(0, limit)

  if (logs.length === 0) {
    return (
      <div className="card border-dashed text-center">
        <p className="text-sm text-slate-500">Sin actividad registrada en el período actual.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden p-0">
      <ul className="divide-y divide-slate-100">
        {logs.map((log) => (
          <li key={log.id} className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50/80">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <BadgeEstado estado={log.action} />
                <span className="text-xs font-medium text-slate-500">
                  {ENTITY_LABELS[log.entity]}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-800">{log.details}</p>
              <p className="mt-1 text-xs text-slate-400">
                {log.userName} · {new Date(log.timestamp).toLocaleString('es-CO')}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {showAuditLink && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <Link
            to="/auditoria"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 transition hover:text-red-900"
          >
            Ver registro completo de auditoría
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
