import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Activity,
  Calendar,
  CalendarClock,
  CalendarPlus,
  ClipboardList,
  FileDown,
  FlaskConical,
  Home,
  Key,
  LogOut,
  Phone,
  Pill,
  User,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { MedicalAIChat } from './MedicalAIChat'

const navSections = [
  {
    title: 'Gestión de citas',
    items: [
      { to: '/paciente', icon: Home, label: 'Inicio', end: true },
      { to: '/paciente/citas/solicitar', icon: CalendarPlus, label: 'Solicitar cita' },
      { to: '/paciente/citas/programadas', icon: Calendar, label: 'Citas programadas' },
      { to: '/paciente/citas/gestionar', icon: XCircle, label: 'Cancelar / reprogramar' },
      { to: '/paciente/citas/historial', icon: CalendarClock, label: 'Historial de citas' },
    ],
  },
  {
    title: 'Información médica',
    items: [
      { to: '/paciente/medica/tratamientos', icon: Pill, label: 'Tratamientos' },
      { to: '/paciente/medica/diagnosticos', icon: ClipboardList, label: 'Diagnósticos' },
      { to: '/paciente/medica/formulas', icon: FileDown, label: 'Fórmulas médicas' },
      { to: '/paciente/medica/examenes', icon: FlaskConical, label: 'Resultados exámenes' },
    ],
  },
  {
    title: 'Mi cuenta',
    items: [
      { to: '/paciente/perfil/datos', icon: User, label: 'Datos personales' },
      { to: '/paciente/perfil/contacto', icon: Phone, label: 'Contacto' },
      { to: '/paciente/perfil/password', icon: Key, label: 'Cambiar contraseña' },
    ],
  },
]

export function PatientLayout() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-rose-muted/40 bg-white/92 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-beige-200 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-btn to-emerald-btn-hover text-white shadow-btn">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-900">Health Flow</h1>
            <p className="text-xs text-rose-wine/80">Portal del paciente</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {navSections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-rose-wine/70">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-btn/15 to-rose-soft text-emerald-btn-hover shadow-sm ring-1 ring-emerald-btn/20'
                          : 'text-stone-600 hover:bg-beige-100/80 hover:text-stone-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-beige-200 p-4">
          <div className="mb-3 rounded-2xl bg-gradient-to-r from-beige-100 to-rose-soft px-3 py-3">
            <p className="truncate text-sm font-semibold text-stone-900">{session?.nombre}</p>
            <p className="truncate text-xs text-stone-500">{session?.email}</p>
          </div>
          <button type="button" onClick={handleLogout} className="btn btn-secondary w-full">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
          <NavLink to="/" className="mt-2 block text-center text-xs text-stone-500 hover:text-rose-wine">
            Ir al panel administrativo
          </NavLink>
        </div>
      </aside>
      <main className="app-main ml-72 flex-1 p-6 md:p-8">
        <Outlet />
      </main>
      <MedicalAIChat userRole="patient" userName={session?.nombre || 'Paciente'} />
    </div>
  )
}
