import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FormField } from '../../components/ui'
import { requestPasswordReset, resetPassword } from '../../services/auth'

export function ForgotPassword() {
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [identifier, setIdentifier] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRequest = (ev: React.FormEvent) => {
    ev.preventDefault()
    const result = requestPasswordReset(identifier)
    if (result.ok) {
      setMessage(result.message)
      setStep('reset')
      setError('')
    } else setError(result.error)
  }

  const handleReset = (ev: React.FormEvent) => {
    ev.preventDefault()
    const result = resetPassword(token, newPassword)
    if (result.ok) {
      setMessage('Contraseña actualizada. Ya puede iniciar sesión.')
      setError('')
    } else setError(result.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="auth-card w-full max-w-md">
        <Link to="/login" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-rose-wine">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
        </Link>
        <h1 className="text-xl font-bold text-stone-900">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-stone-500">
          {step === 'request'
            ? 'Ingrese su documento o correo registrado'
            : 'Ingrese el token recibido y su nueva contraseña'}
        </p>

        {message && !error && (
          <div className="mt-4 rounded-2xl bg-emerald-btn/10 px-4 py-3 text-sm text-emerald-btn-hover">{message}</div>
        )}
        {error && (
          <div className="mt-4 rounded-2xl bg-rose-soft px-4 py-3 text-sm text-rose-wine">{error}</div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="mt-6 space-y-4">
            <FormField label="Documento o correo" required>
              <input className="input-field" value={identifier} onChange={(ev) => setIdentifier(ev.target.value)} required />
            </FormField>
            <button type="submit" className="btn btn-primary w-full">
              Enviar enlace de recuperación
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <FormField label="Token de recuperación" required>
              <input className="input-field font-mono text-xs" value={token} onChange={(ev) => setToken(ev.target.value)} required />
            </FormField>
            <FormField label="Nueva contraseña" required>
              <input type="password" className="input-field" value={newPassword} onChange={(ev) => setNewPassword(ev.target.value)} minLength={6} required />
            </FormField>
            <button type="submit" className="btn btn-primary w-full">
              Restablecer contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
