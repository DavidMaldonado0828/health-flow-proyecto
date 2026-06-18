import { useState } from 'react'
import { FormField, PageHeader } from '../../components/ui'
import { changePassword } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'

export function CambiarPassword() {
  const { session } = useAuth()
  const [current, setCurrent] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (newPass !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    const result = changePassword(session!.pacienteId, current, newPass)
    if (result.ok) {
      setMsg('Contraseña actualizada correctamente')
      setError('')
      setCurrent('')
      setNewPass('')
      setConfirm('')
    } else {
      setError(result.error)
      setMsg('')
    }
  }

  return (
    <div>
      <PageHeader title="Cambiar contraseña" description="Actualice su contraseña de acceso al portal" />
      <form onSubmit={submit} className="card max-w-md space-y-4">
        {msg && <div className="rounded-2xl bg-emerald-btn/10 px-4 py-3 text-sm text-emerald-btn-hover">{msg}</div>}
        {error && <div className="rounded-2xl bg-rose-soft px-4 py-3 text-sm text-rose-wine">{error}</div>}
        <FormField label="Contraseña actual" required>
          <input type="password" className="input-field" value={current} onChange={(ev) => setCurrent(ev.target.value)} required />
        </FormField>
        <FormField label="Nueva contraseña" required>
          <input type="password" className="input-field" value={newPass} onChange={(ev) => setNewPass(ev.target.value)} minLength={6} required />
        </FormField>
        <FormField label="Confirmar nueva contraseña" required>
          <input type="password" className="input-field" value={confirm} onChange={(ev) => setConfirm(ev.target.value)} required />
        </FormField>
        <button type="submit" className="btn btn-primary">Actualizar contraseña</button>
      </form>
    </div>
  )
}
