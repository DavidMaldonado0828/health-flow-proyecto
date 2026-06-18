import { useState } from 'react'
import { FormField, PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getPaciente, updatePaciente } from '../../services/store'

export function DatosPersonales() {
  const { session } = useAuth()
  const p = getPaciente(session!.pacienteId)!
  const [ok, setOk] = useState(false)
  const [form, setForm] = useState({
    nombre: p.nombre,
    apellido: p.apellido,
    fechaNacimiento: p.fechaNacimiento,
    documento: p.documento,
  })

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    updatePaciente(session!.pacienteId, form)
    setOk(true)
    setTimeout(() => setOk(false), 3000)
  }

  return (
    <div>
      <PageHeader title="Actualizar datos personales" description="Modifique su información básica" />
      {ok && <div className="card mb-4 border-emerald-btn/30 bg-emerald-btn/5 text-sm">Datos guardados correctamente</div>}
      <form onSubmit={submit} className="card max-w-xl space-y-4">
        <FormField label="Nombres" required>
          <input className="input-field" value={form.nombre} onChange={(ev) => setForm({ ...form, nombre: ev.target.value })} required />
        </FormField>
        <FormField label="Apellidos" required>
          <input className="input-field" value={form.apellido} onChange={(ev) => setForm({ ...form, apellido: ev.target.value })} required />
        </FormField>
        <FormField label="Documento">
          <input className="input-field bg-beige-50" value={form.documento} disabled />
        </FormField>
        <FormField label="Fecha de nacimiento" required>
          <input type="date" className="input-field" value={form.fechaNacimiento} onChange={(ev) => setForm({ ...form, fechaNacimiento: ev.target.value })} required />
        </FormField>
        <button type="submit" className="btn btn-primary">Guardar cambios</button>
      </form>
    </div>
  )
}
