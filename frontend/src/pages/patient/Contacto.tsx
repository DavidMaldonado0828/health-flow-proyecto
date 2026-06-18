import { useState } from 'react'
import { FormField, PageHeader } from '../../components/ui'
import { syncAccountEmail } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import { getPaciente, updatePaciente } from '../../services/store'

export function Contacto() {
  const { session } = useAuth()
  const p = getPaciente(session!.pacienteId)!
  const [ok, setOk] = useState(false)
  const [form, setForm] = useState({
    email: p.email,
    telefono: p.telefono,
    direccion: p.direccion ?? '',
    ciudad: p.ciudad ?? '',
  })

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    updatePaciente(session!.pacienteId, form)
    syncAccountEmail(session!.pacienteId, form.email)
    setOk(true)
    setTimeout(() => setOk(false), 3000)
  }

  return (
    <div>
      <PageHeader title="Información de contacto" description="Correo, teléfono y dirección" />
      {ok && <div className="card mb-4 border-emerald-btn/30 bg-emerald-btn/5 text-sm">Contacto actualizado</div>}
      <form onSubmit={submit} className="card max-w-xl space-y-4">
        <FormField label="Correo electrónico" required>
          <input type="email" className="input-field" value={form.email} onChange={(ev) => setForm({ ...form, email: ev.target.value })} required />
        </FormField>
        <FormField label="Teléfono" required>
          <input className="input-field" value={form.telefono} onChange={(ev) => setForm({ ...form, telefono: ev.target.value })} required />
        </FormField>
        <FormField label="Dirección">
          <input className="input-field" value={form.direccion} onChange={(ev) => setForm({ ...form, direccion: ev.target.value })} />
        </FormField>
        <FormField label="Ciudad">
          <input className="input-field" value={form.ciudad} onChange={(ev) => setForm({ ...form, ciudad: ev.target.value })} />
        </FormField>
        <button type="submit" className="btn btn-primary">Guardar contacto</button>
      </form>
    </div>
  )
}
