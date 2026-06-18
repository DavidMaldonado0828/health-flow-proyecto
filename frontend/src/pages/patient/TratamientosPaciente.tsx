import { BadgeEstado, EmptyState, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getTratamientosByPaciente } from '../../services/store'

export function TratamientosPaciente() {
  const { session } = useAuth()
  const list = getTratamientosByPaciente(session!.pacienteId)

  return (
    <div>
      <PageHeader title="Tratamientos asignados" description="Tratamientos activos y finalizados" />
      {list.length === 0 ? (
        <EmptyState message="No tiene tratamientos registrados" />
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-stone-900">{t.nombre}</h3>
                <BadgeEstado estado={t.estado} />
              </div>
              <p className="mt-2 text-sm text-stone-600">{t.descripcion}</p>
              <p className="mt-2 text-xs text-stone-500">
                {t.fechaInicio}{t.fechaFin ? ` → ${t.fechaFin}` : ''} · {t.medico}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
