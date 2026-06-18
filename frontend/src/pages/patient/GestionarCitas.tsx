import { useState } from 'react'
import { BadgeEstado, EmptyState, FormField, Modal, PageHeader } from '../../components/ui'
import type { Cita } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { getCitasByPaciente, getEspecialidades, updateCita } from '../../services/store'

export function GestionarCitas() {
  const { session } = useAuth()
  const [refresh, setRefresh] = useState(0)
  const citas = getCitasByPaciente(session!.pacienteId).filter(
    (c) => c.estado === 'programada' || c.estado === 'confirmada'
  )
  const [reprogramar, setReprogramar] = useState<Cita | null>(null)
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')

  const esp = (id: string) => getEspecialidades().find((e) => e.id === id)?.nombre ?? '—'

  const cancelar = (id: string) => {
    if (confirm('¿Confirma que desea cancelar esta cita?')) {
      updateCita(id, { estado: 'cancelada' })
      setRefresh((n) => n + 1)
    }
  }

  const abrirReprogramar = (c: Cita) => {
    setReprogramar(c)
    setFecha(c.fecha)
    setHora(c.hora)
  }

  const guardarReprogramar = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (reprogramar) {
      updateCita(reprogramar.id, { fecha, hora, estado: 'programada' })
      setReprogramar(null)
      setRefresh((n) => n + 1)
    }
  }

  return (
    <div key={refresh}>
      <PageHeader title="Cancelar o reprogramar citas" description="Modifique citas activas" />
      {citas.length === 0 ? (
        <EmptyState message="No hay citas que pueda gestionar" />
      ) : (
        <div className="space-y-3">
          {citas.map((c) => (
            <div key={c.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">{esp(c.especialidadId)}</h3>
                <p className="text-sm text-stone-500">{c.fecha} · {c.hora}</p>
                <BadgeEstado estado={c.estado} />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => abrirReprogramar(c)}>
                  Reprogramar
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => cancelar(c.id)}>
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!reprogramar} onClose={() => setReprogramar(null)} title="Reprogramar cita">
        <form onSubmit={guardarReprogramar} className="space-y-4">
          <FormField label="Nueva fecha" required>
            <input type="date" className="input-field" value={fecha} onChange={(ev) => setFecha(ev.target.value)} required />
          </FormField>
          <FormField label="Nueva hora" required>
            <input type="time" className="input-field" value={hora} onChange={(ev) => setHora(ev.target.value)} required />
          </FormField>
          <button type="submit" className="btn btn-primary w-full">Guardar cambios</button>
        </form>
      </Modal>
    </div>
  )
}
