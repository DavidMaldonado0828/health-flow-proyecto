import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstado, EmptyState, FormField, Modal, PageHeader } from '../components/ui'
import type { EstadoCita } from '../types'
import {
  createCita,
  deleteCita,
  getCitas,
  getEspecialidades,
  getPacientes,
  updateCita,
} from '../services/store'

export function Citas() {
  const [list, setList] = useState(getCitas())
  const [modal, setModal] = useState(false)
  const pacientes = getPacientes()
  const especialidades = getEspecialidades().filter((e) => e.activa)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    pacienteId: '',
    especialidadId: '',
    medico: 'Dr. Ana García',
    fecha: '',
    hora: '',
    motivo: '',
  })

  const refresh = () => setList(getCitas())

  const pacienteNombre = (id: string) => {
    const p = pacientes.find((x) => x.id === id)
    return p ? `${p.nombre} ${p.apellido}` : id
  }

  const espNombre = (id: string) => especialidades.find((e) => e.id === id)?.nombre ?? id

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setError(null)

    // Calculate current local date YYYY-MM-DD
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // 1. Past date check
    if (form.fecha < todayStr) {
      setError('No se pueden agendar citas en fechas anteriores a la fecha actual.')
      return
    }

    // 2. Working hours and lunch break check (08:00 - 12:00, 14:00 - 18:00)
    const time = form.hora
    const isValidTime = (time >= '08:00' && time <= '12:00') || (time >= '14:00' && time <= '18:00')
    if (!isValidTime) {
      setError('no se puede autorizar la cita o atender la cita ya que no esta en el horario establecido')
      return
    }

    const existingCitas = getCitas()

    // 3. Patient conflict check
    const patientConflict = existingCitas.some(
      (c) =>
        c.pacienteId === form.pacienteId &&
        c.fecha === form.fecha &&
        c.hora === form.hora &&
        c.estado !== 'cancelada'
    )
    if (patientConflict) {
      setError('El paciente ya tiene una cita asignada en esta fecha y hora.')
      return
    }

    // 4. Doctor conflict check
    const doctorConflict = existingCitas.some(
      (c) =>
        c.medico.toLowerCase().trim() === form.medico.toLowerCase().trim() &&
        c.fecha === form.fecha &&
        c.hora === form.hora &&
        c.estado !== 'cancelada'
    )
    if (doctorConflict) {
      setError('El médico ya tiene una cita asignada en esta fecha y hora.')
      return
    }

    createCita(form)
    refresh()
    setModal(false)
    setForm({ pacienteId: '', especialidadId: '', medico: 'Dr. Ana García', fecha: '', hora: '', motivo: '' })
  }

  const cambiarEstado = (id: string, estado: EstadoCita) => {
    if (estado === 'confirmada' || estado === 'completada') {
      const cita = list.find((c) => c.id === id)
      if (cita) {
        const time = cita.hora
        const isValid = (time >= '08:00' && time <= '12:00') || (time >= '14:00' && time <= '18:00')
        if (!isValid) {
          alert('no se puede autorizar la cita o atender la cita ya que no esta en el horario establecido')
          return
        }
      }
    }
    updateCita(id, { estado })
    refresh()
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Programación de citas"
        description="Agende y gestione citas médicas por paciente y especialidad"
        action={
          <button type="button" className="btn-primary" onClick={() => { setError(null); setModal(true) }}>
            <Plus className="h-4 w-4" /> Programar cita
          </button>
        }
      />
      {list.length === 0 ? (
        <EmptyState message="No hay citas programadas. Cree la primera cita." />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Paciente</th>
                <th className="px-6 py-3 font-medium text-slate-600">Especialidad</th>
                <th className="px-6 py-3 font-medium text-slate-600">Fecha / Hora</th>
                <th className="px-6 py-3 font-medium text-slate-600">Médico</th>
                <th className="px-6 py-3 font-medium text-slate-600">Estado</th>
                <th className="px-6 py-3 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{pacienteNombre(c.pacienteId)}</td>
                  <td className="px-6 py-4">{espNombre(c.especialidadId)}</td>
                  <td className="px-6 py-4">{c.fecha} · {c.hora}</td>
                  <td className="px-6 py-4 text-slate-600">{c.medico}</td>
                  <td className="px-6 py-4"><BadgeEstado estado={c.estado} /></td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {c.estado !== 'cancelada' &&
                        (['confirmada', 'completada', 'cancelada'] as EstadoCita[])
                          .filter((st) => st !== c.estado)
                          .map((st) => (
                            <button
                              key={st}
                              type="button"
                              className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => cambiarEstado(c.id, st)}
                            >
                              {st}
                            </button>
                          ))}
                      <button type="button" className="text-red-600 hover:underline text-xs" onClick={() => { if (confirm('¿Eliminar cita?')) { deleteCita(c.id); refresh() } }}>
                        <Trash2 className="inline h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Programar cita" wide>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {error && (
            <div className="card sm:col-span-2 border-red-300 bg-red-50 text-sm text-red-800 p-3 rounded-xl">
              {error}
            </div>
          )}
          <FormField label="Paciente" required>
            <select className="input-field" value={form.pacienteId} onChange={(ev) => setForm({ ...form, pacienteId: ev.target.value })} required>
              <option value="">Seleccionar...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido} — {p.documento}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Especialidad" required>
            <select className="input-field" value={form.especialidadId} onChange={(ev) => setForm({ ...form, especialidadId: ev.target.value })} required>
              <option value="">Seleccionar...</option>
              {especialidades.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Fecha" required>
            <input type="date" className="input-field" value={form.fecha} onChange={(ev) => setForm({ ...form, fecha: ev.target.value })} required />
          </FormField>
          <FormField label="Hora" required>
            <input type="time" className="input-field" value={form.hora} onChange={(ev) => setForm({ ...form, hora: ev.target.value })} required />
          </FormField>
          <FormField label="Médico" required>
            <input className="input-field" value={form.medico} onChange={(ev) => setForm({ ...form, medico: ev.target.value })} required />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Motivo de consulta" required>
              <textarea className="input-field min-h-[72px]" value={form.motivo} onChange={(ev) => setForm({ ...form, motivo: ev.target.value })} required />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Programar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
