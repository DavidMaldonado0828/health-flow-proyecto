import { useState } from 'react'
import { FormField, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { createCita, getCitas, getEspecialidades } from '../../services/store'

export function SolicitarCita() {
  const { session } = useAuth()
  const especialidades = getEspecialidades().filter((e) => e.activa)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    especialidadId: '',
    fecha: '',
    hora: '',
    motivo: '',
  })

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setError(null)
    setOk(false)

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

    // 3. Patient double booking conflict check
    const existingCitas = getCitas()
    const hasConflict = existingCitas.some(
      (c) =>
        c.pacienteId === session!.pacienteId &&
        c.fecha === form.fecha &&
        c.hora === form.hora &&
        c.estado !== 'cancelada'
    )
    if (hasConflict) {
      setError('Ya tienes una cita programada para esta fecha y hora.')
      return
    }

    createCita({
      pacienteId: session!.pacienteId,
      especialidadId: form.especialidadId,
      medico: 'Por asignar',
      fecha: form.fecha,
      hora: form.hora,
      motivo: form.motivo,
      estado: 'programada',
    })
    setOk(true)
    setForm({ especialidadId: '', fecha: '', hora: '', motivo: '' })
  }

  return (
    <div>
      <PageHeader title="Solicitar cita médica" description="Complete el formulario para agendar una nueva consulta" />
      {error && (
        <div className="card mb-6 border-red-300 bg-red-50 text-sm text-red-800">
          {error}
        </div>
      )}
      {ok && (
        <div className="card mb-6 border-emerald-btn/30 bg-emerald-btn/5 text-sm text-emerald-btn-hover">
          Su solicitud fue registrada. Puede verla en Citas programadas.
        </div>
      )}
      <form onSubmit={submit} className="card max-w-xl space-y-4">
        <FormField label="Especialidad" required>
          <select className="input-field" value={form.especialidadId} onChange={(ev) => setForm({ ...form, especialidadId: ev.target.value })} required>
            <option value="">Seleccionar...</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Fecha preferida" required>
          <input type="date" className="input-field" value={form.fecha} onChange={(ev) => setForm({ ...form, fecha: ev.target.value })} required />
        </FormField>
        <FormField label="Hora preferida" required>
          <input type="time" className="input-field" value={form.hora} onChange={(ev) => setForm({ ...form, hora: ev.target.value })} required />
        </FormField>
        <FormField label="Motivo de consulta" required>
          <textarea className="input-field min-h-[100px]" value={form.motivo} onChange={(ev) => setForm({ ...form, motivo: ev.target.value })} required />
        </FormField>
        <button type="submit" className="btn btn-primary">Enviar solicitud</button>
      </form>
    </div>
  )
}
