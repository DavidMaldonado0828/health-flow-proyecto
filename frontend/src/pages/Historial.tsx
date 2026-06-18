import { Lock, Search } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, PageHeader } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { consultarHistorial, getPacientes } from '../services/store'

const tipoLabels: Record<string, string> = {
  cita: 'Cita',
  diagnostico: 'Diagnóstico',
  tratamiento: 'Tratamiento',
  prescripcion: 'Prescripción',
}

const tipoColors: Record<string, string> = {
  cita: 'bg-blue-100 text-blue-800',
  diagnostico: 'bg-purple-100 text-purple-800',
  tratamiento: 'bg-emerald-100 text-emerald-800',
  prescripcion: 'bg-amber-100 text-amber-800',
}

export function Historial() {
  const { session } = useAuth()
  const isAdmin = session?.rol === 'administrador'
  const pacientes = getPacientes()
  const [pacienteId, setPacienteId] = useState('')
  const [entries, setEntries] = useState<ReturnType<typeof consultarHistorial>>([])

  const buscar = () => {
    if (!pacienteId) return
    setEntries(consultarHistorial(pacienteId))
  }

  const paciente = pacientes.find((p) => p.id === pacienteId)

  return (
    <div className="p-8">
      <PageHeader
        title="Historial clínico"
        description="Consulte la línea de tiempo clínica por paciente (citas, diagnósticos, tratamientos)"
      />
      {isAdmin && (
        <div className="card mb-6 flex items-start gap-3 border-amber-200 bg-amber-50/60">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Acceso supervisado — datos sensibles</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-800/90">
              Como administrador, puede consultar historiales clínicos con fines de supervisión y
              trazabilidad. Todas las consultas quedan registradas en el módulo de auditoría.
            </p>
          </div>
        </div>
      )}
      <div className="card mb-8">
        <div className="flex flex-wrap gap-3">
          <select
            className="input-field max-w-md flex-1"
            value={pacienteId}
            onChange={(ev) => setPacienteId(ev.target.value)}
          >
            <option value="">Seleccione un paciente...</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido} — Doc. {p.documento}
              </option>
            ))}
          </select>
          <button type="button" className="btn-primary" onClick={buscar} disabled={!pacienteId}>
            <Search className="h-4 w-4" /> Consultar historial
          </button>
        </div>
        {paciente && entries.length > 0 && (
          <div className="mt-4 rounded-lg bg-red-50 p-4">
            <p className="font-semibold text-red-950">
              {paciente.nombre} {paciente.apellido}
            </p>
            <p className="text-sm text-red-700">
              {paciente.documento} · Nac. {paciente.fechaNacimiento} · {paciente.telefono}
            </p>
          </div>
        )}
      </div>
      {!pacienteId ? (
        <EmptyState message="Seleccione un paciente para ver su historial clínico" />
      ) : entries.length === 0 ? (
        <EmptyState message="Sin registros en el historial para este paciente" />
      ) : (
        <div className="relative border-l-2 border-red-200 pl-8">
          {entries.map((e) => (
            <div key={e.id} className="relative mb-8 last:mb-0">
              <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full bg-red-600 ring-4 ring-white" />
              <div className="card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${tipoColors[e.tipo]}`}>{tipoLabels[e.tipo]}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(e.fecha).toLocaleString('es-CO')}
                  </span>
                </div>
                <p className="mt-2 font-medium text-slate-900">{e.resumen}</p>
                <p className="mt-1 text-sm text-slate-500">{e.medico}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
