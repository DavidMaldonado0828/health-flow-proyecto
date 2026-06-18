import { Filter, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BadgeEstado, EmptyState, PageHeader } from '../components/ui'
import type { AuditAction, AuditEntity } from '../types'
import { getAuditLogs } from '../services/audit'

const entityLabels: Record<AuditEntity, string> = {
  especialidad: 'Especialidad',
  cita: 'Cita',
  diagnostico: 'Diagnóstico',
  tratamiento: 'Tratamiento',
  medicamento: 'Medicamento',
  historial: 'Historial clínico',
  reporte: 'Reporte',
  usuario: 'Usuario',
}

export function Auditoria() {
  const [entity, setEntity] = useState<AuditEntity | ''>('')
  const [action, setAction] = useState<AuditAction | ''>('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const logs = useMemo(
    () =>
      getAuditLogs({
        entity: entity || undefined,
        action: action || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to + 'T23:59:59').toISOString() : undefined,
      }),
    [entity, action, from, to]
  )

  return (
    <div className="p-8">
      <PageHeader
        title="Auditoría de operaciones"
        description="Registro de operaciones CRUD y consultas de historial clínico para trazabilidad y cumplimiento"
      />
      <div className="card mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4" /> Filtros
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select className="input-field" value={entity} onChange={(ev) => setEntity(ev.target.value as AuditEntity | '')}>
            <option value="">Todas las entidades</option>
            {Object.entries(entityLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="input-field" value={action} onChange={(ev) => setAction(ev.target.value as AuditAction | '')}>
            <option value="">Todas las acciones</option>
            <option value="CREATE">CREATE</option>
            <option value="READ">READ</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input type="date" className="input-field" value={from} onChange={(ev) => setFrom(ev.target.value)} placeholder="Desde" />
          <input type="date" className="input-field" value={to} onChange={(ev) => setTo(ev.target.value)} placeholder="Hasta" />
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <Shield className="h-5 w-5 shrink-0" />
        <span>
          <strong>{logs.length}</strong> eventos registrados · Usuario, IP, timestamp y entidad auditados en cada operación.
        </span>
      </div>
      {logs.length === 0 ? (
        <EmptyState message="No hay eventos de auditoría. Realice operaciones en el sistema para generar registros." />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-600">Fecha</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Usuario</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Acción</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Entidad</th>
                  <th className="px-4 py-3 font-medium text-slate-600">Detalle</th>
                  <th className="px-4 py-3 font-medium text-slate-600">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      {new Date(l.timestamp).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3">{l.userName}</td>
                    <td className="px-4 py-3"><BadgeEstado estado={l.action} /></td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{entityLabels[l.entity]}</span>
                      <span className="block font-mono text-xs text-slate-400">{l.entityId}</span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">{l.details}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
