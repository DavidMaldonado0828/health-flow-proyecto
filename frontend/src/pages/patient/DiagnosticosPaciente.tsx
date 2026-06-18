import { BadgeEstado, EmptyState, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getDiagnosticosByPaciente } from '../../services/store'

export function DiagnosticosPaciente() {
  const { session } = useAuth()
  const list = getDiagnosticosByPaciente(session!.pacienteId)

  return (
    <div>
      <PageHeader title="Consultar diagnósticos" description="Diagnósticos registrados en su historial" />
      {list.length === 0 ? (
        <EmptyState message="No hay diagnósticos disponibles" />
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <div key={d.id} className="card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-emerald-btn">{d.codigoCIE}</span>
                <BadgeEstado estado={d.severidad} />
              </div>
              <p className="mt-2 font-medium">{d.descripcion}</p>
              <p className="mt-1 text-sm text-stone-500">{d.fecha} · {d.medico}</p>
              {d.notas && <p className="mt-2 text-sm text-stone-600">{d.notas}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
