import { BadgeEstado, EmptyState, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getCitasByPaciente, getEspecialidades } from '../../services/store'

export function HistorialCitas() {
  const { session } = useAuth()
  const citas = getCitasByPaciente(session!.pacienteId)
  const esp = (id: string) => getEspecialidades().find((e) => e.id === id)?.nombre ?? '—'

  return (
    <div>
      <PageHeader title="Historial de citas" description="Todas sus citas pasadas y actuales" />
      {citas.length === 0 ? (
        <EmptyState message="Sin historial de citas" />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-beige-100/80">
              <tr>
                <th className="px-4 py-3 font-medium">Especialidad</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-beige-200">
              {citas.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">{esp(c.especialidadId)}</td>
                  <td className="px-4 py-3">{c.fecha} {c.hora}</td>
                  <td className="px-4 py-3"><BadgeEstado estado={c.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
