import { BadgeEstado, EmptyState, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getCitasByPaciente, getEspecialidades } from '../../services/store'

export function CitasProgramadas() {
  const { session } = useAuth()
  const citas = getCitasByPaciente(session!.pacienteId).filter(
    (c) => c.estado === 'programada' || c.estado === 'confirmada'
  )
  const esp = (id: string) => getEspecialidades().find((e) => e.id === id)?.nombre ?? '—'

  return (
    <div>
      <PageHeader title="Consultar citas programadas" description="Citas pendientes y confirmadas" />
      {citas.length === 0 ? (
        <EmptyState message="No tiene citas programadas" />
      ) : (
        <div className="space-y-3">
          {citas.map((c) => (
            <div key={c.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-stone-900">{esp(c.especialidadId)}</h3>
                <BadgeEstado estado={c.estado} />
              </div>
              <p className="mt-2 text-sm text-stone-600">{c.fecha} · {c.hora} · {c.medico}</p>
              <p className="mt-1 text-sm text-stone-500">{c.motivo}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
