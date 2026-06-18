import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Activity,
  Calendar,
  ClipboardList,
  FileBarChart,
  History,
  LayoutDashboard,
  LogOut,
  Pill,
  Shield,
  Stethoscope,
  Syringe,
} from 'lucide-react'
import { currentUser } from '../services/audit'
import { MedicalAIChat } from './MedicalAIChat'

export function Layout() {
  const { logout, session } = useAuth()
  const navigate = useNavigate()

  const role = session?.rol

  type NavItem = { to: string; icon: typeof LayoutDashboard; label: string; end?: boolean }

  const adminNav: NavItem[] = [
    { to: '/especialidades', icon: Stethoscope, label: 'Especialidades' },
    { to: '/medicamentos', icon: Pill, label: 'Inventario' },
    { to: '/auditoria', icon: Shield, label: 'Auditoría' },
    { to: '/reportes', icon: FileBarChart, label: 'Reportes' },
    { to: '/historial', icon: History, label: 'Historial clínico' },
  ]

  const medicoNav: NavItem[] = [
    { to: '/citas', icon: Calendar, label: 'Citas' },
    { to: '/diagnosticos', icon: ClipboardList, label: 'Diagnósticos' },
    { to: '/tratamientos', icon: Syringe, label: 'Tratamientos' },
    { to: '/medicamentos', icon: Pill, label: 'Medicamentos' },
    { to: '/historial', icon: History, label: 'Historial' },

  ]

  const nav: NavItem[] = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ...(role === 'administrador' ? adminNav : medicoNav),
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = role === 'administrador' ? 'Administrador' : 'Médico'

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-red-200/80 bg-white/95 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-3 lg:px-6">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-btn">
              <Activity className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-red-950">Health Flow</h1>
              <p className="text-xs text-red-700/80">Gestión hospitalaria</p>
            </div>
          </div>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nav.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-top-item flex shrink-0 items-center gap-1.5 whitespace-nowrap ${
                    isActive ? 'nav-top-item-active' : ''
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{label.split(' ')[0]}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-2xl bg-red-50 px-2 py-1.5 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-semibold text-white">
                {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden max-w-[120px] lg:block">
                <p className="truncate text-xs font-medium text-red-950">{currentUser.name}</p>
                <p className="text-[10px] text-red-600/80">{roleLabel}</p>
              </div>
              <button type="button" onClick={handleLogout} className="rounded-xl p-1 text-red-400 hover:bg-red-100 hover:text-red-700" title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main flex-1 p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
      <MedicalAIChat userRole="doctor" userName={currentUser.name} />
    </div>
  )
}
