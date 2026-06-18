import { Activity } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { FormField } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { session, login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // If already logged in, redirect to the correct dashboard based on role
  if (session) {
    if (session.rol === 'paciente') {
      return <Navigate to="/paciente" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setError('')
    const result = login(identifier, password)
    if (result.ok && result.session) {
      // Redirect dynamically based on role after successful login
      if (result.session.rol === 'paciente') {
        navigate('/paciente', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } else {
      setError(result.error ?? 'Error al iniciar sesión')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="auth-card w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-btn">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Health Flow</h1>
          <p className="mt-1 text-sm text-stone-500">Portal de Acceso Unificado</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-2xl bg-rose-soft px-4 py-3 text-sm text-rose-wine">{error}</div>
          )}
          <FormField label="Documento o correo electrónico" required>
            <input
              className="input-field"
              value={identifier}
              onChange={(ev) => setIdentifier(ev.target.value)}
              placeholder="Ej. 12345678 o maria@email.com"
              required
            />
          </FormField>
          <FormField label="Contraseña" required>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
            />
          </FormField>
          <button type="submit" className="btn btn-primary w-full">
            Iniciar sesión
          </button>
        </form>
        <div className="mt-5 text-center text-sm space-y-2">
          <p>
            <Link to="/registro" className="font-semibold text-teal-600 hover:underline">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </p>
          <p>
            <Link to="/paciente/recuperar" className="text-stone-500 hover:underline text-xs">
              ¿Olvidó su contraseña?
            </Link>
          </p>
        </div>
        <div className="mt-6 rounded-2xl bg-teal-50/50 border border-teal-100 px-4 py-3 text-xs text-stone-600">
          <p className="font-bold text-teal-800 mb-1 text-center">Cuentas de demostración:</p>
          <ul className="space-y-1 pl-1 font-mono text-[10px]">
            <li>• Paciente: <strong className="text-teal-700">maria@email.com</strong> / paciente123</li>
            <li>• Médico: <strong className="text-teal-700">ana@healthflow.com</strong> / doctor123</li>
            <li>• Administrador: <strong className="text-teal-700">admin@healthflow.com</strong> / admin123</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
