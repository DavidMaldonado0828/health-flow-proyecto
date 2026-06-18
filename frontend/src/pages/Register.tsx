import { Activity } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FormField } from '../components/ui'
import { registerUser } from '../services/auth'
import type { UserRole } from '../types'

export function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    password: '',
    rol: 'paciente' as UserRole,
  })

  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    setError('')
    setOk(false)

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    const result = registerUser(form)
    if (result.ok) {
      setOk(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } else {
      setError(result.error ?? 'Error al registrar el usuario')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="auth-card w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-btn">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Registrarse en Health Flow</h1>
          <p className="mt-1 text-sm text-stone-500">Crea una cuenta para acceder al sistema</p>
        </div>

        {ok ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-8 text-center space-y-3">
            <div className="text-emerald-600 font-bold text-lg">¡Registro Exitoso!</div>
            <p className="text-sm text-stone-600">Tu cuenta ha sido creada correctamente. Redirigiéndote al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-2xl bg-rose-soft px-4 py-3 text-sm text-rose-wine">{error}</div>
            )}
            
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nombre" required>
                <input
                  className="input-field"
                  value={form.nombre}
                  onChange={(ev) => setForm({ ...form, nombre: ev.target.value })}
                  placeholder="Ej. Ana"
                  required
                />
              </FormField>
              <FormField label="Apellido" required>
                <input
                  className="input-field"
                  value={form.apellido}
                  onChange={(ev) => setForm({ ...form, apellido: ev.target.value })}
                  placeholder="Ej. García"
                  required
                />
              </FormField>
            </div>

            <FormField label="Correo electrónico" required>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(ev) => setForm({ ...form, email: ev.target.value })}
                placeholder="ana@email.com"
                required
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Documento de Identidad" required>
                <input
                  className="input-field"
                  value={form.documento}
                  onChange={(ev) => setForm({ ...form, documento: ev.target.value })}
                  placeholder="Ej. 12345678"
                  required
                />
              </FormField>
              <FormField label="Rol de Cuenta" required>
                <select
                  className="input-field"
                  value={form.rol}
                  onChange={(ev) => setForm({ ...form, rol: ev.target.value as UserRole })}
                  required
                >
                  <option value="paciente">Paciente</option>
                  <option value="medico">Médico / Doctor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </FormField>
            </div>

            <FormField label="Contraseña" required>
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={(ev) => setForm({ ...form, password: ev.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </FormField>

            <button type="submit" className="btn btn-primary w-full">
              Crear cuenta
            </button>
          </form>
        )}

        {!ok && (
          <p className="mt-5 text-center text-sm">
            <Link to="/login" className="font-semibold text-teal-600 hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
