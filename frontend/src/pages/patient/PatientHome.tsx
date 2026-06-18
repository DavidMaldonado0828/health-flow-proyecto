import { Calendar, ClipboardList, FileDown, FlaskConical, Pill } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import { getCitasByPaciente, getExamenesByPaciente, getTratamientosByPaciente } from '../../services/store'

const links = [
  { to: '/paciente/citas/solicitar', label: 'Solicitar cita médica', icon: Calendar, desc: 'Agende una nueva consulta' },
  { to: '/paciente/citas/programadas', label: 'Citas programadas', icon: Calendar, desc: 'Próximas citas confirmadas' },
  { to: '/paciente/medica/tratamientos', label: 'Tratamientos', icon: Pill, desc: 'Ver tratamientos asignados' },
  { to: '/paciente/medica/diagnosticos', label: 'Diagnósticos', icon: ClipboardList, desc: 'Consultar diagnósticos' },
  { to: '/paciente/medica/formulas', label: 'Fórmulas médicas', icon: FileDown, desc: 'Descargar prescripciones' },
  { to: '/paciente/medica/examenes', label: 'Resultados de exámenes', icon: FlaskConical, desc: 'Ver y descargar resultados' },
]

export function PatientHome() {
  const { session } = useAuth()
  const pid = session!.pacienteId
  const citasActivas = getCitasByPaciente(pid).filter((c) => c.estado === 'programada' || c.estado === 'confirmada').length

  return (
    <div>
      <PageHeader
        title={`Bienvenido/a, ${session!.nombre.split(' ')[0]}`}
        description="Gestione sus citas, información médica y datos de cuenta"
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card border-emerald-btn/20">
          <p className="text-sm text-stone-500">Citas activas</p>
          <p className="mt-1 text-3xl font-bold text-emerald-btn">{citasActivas}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-500">Tratamientos</p>
          <p className="mt-1 text-3xl font-bold text-rose-wine">{getTratamientosByPaciente(pid).length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-stone-500">Exámenes</p>
          <p className="mt-1 text-3xl font-bold text-stone-800">{getExamenesByPaciente(pid).length}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to} className="card transition hover:shadow-interactive-hover">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-btn/20 to-rose-soft text-emerald-btn-hover">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-semibold text-stone-900">{label}</h3>
            <p className="mt-1 text-sm text-stone-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
