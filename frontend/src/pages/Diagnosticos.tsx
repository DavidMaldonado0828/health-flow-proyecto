import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BadgeEstado, EmptyState, FormField, Modal, PageHeader } from '../components/ui'
import type { Diagnostico } from '../types'
import {
  createDiagnostico,
  deleteDiagnostico,
  getCitas,
  getDiagnosticos,
  getPacientes,
} from '../services/store'

export function Diagnosticos() {
  const [list, setList] = useState(getDiagnosticos())
  const [modal, setModal] = useState(false)
  const pacientes = getPacientes()
  const citas = getCitas()
  const [form, setForm] = useState({
    pacienteId: '',
    citaId: '',
    codigoCIE: '',
    descripcion: '',
    severidad: 'leve' as Diagnostico['severidad'],
    fecha: new Date().toISOString().split('T')[0],
    medico: 'Dr. Ana García',
    notas: '',
  })

  const refresh = () => setList(getDiagnosticos())

  const pacienteNombre = (id: string) => {
    const p = pacientes.find((x) => x.id === id)
    return p ? `${p.nombre} ${p.apellido}` : id
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    createDiagnostico({
      ...form,
      citaId: form.citaId || undefined,
    })
    refresh()
    setModal(false)
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Registro de diagnósticos"
        description="Registre diagnósticos con código CIE-10 y nivel de severidad"
        action={
          <button type="button" className="btn-primary" onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Nuevo diagnóstico
          </button>
        }
      />
      {list.length === 0 ? (
        <EmptyState message="No hay diagnósticos registrados" />
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <div key={d.id} className="card flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-red-700">{d.codigoCIE}</span>
                  <BadgeEstado estado={d.severidad} />
                </div>
                <p className="mt-1 font-medium text-slate-900">{d.descripcion}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {pacienteNombre(d.pacienteId)} · {d.fecha} · {d.medico}
                </p>
                {d.notas && <p className="mt-2 text-sm text-slate-600">{d.notas}</p>}
              </div>
              <button
                type="button"
                className="btn-danger px-2 py-1.5"
                onClick={() => { if (confirm('¿Eliminar diagnóstico?')) { deleteDiagnostico(d.id); refresh() } }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar diagnóstico" wide>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Paciente" required>
            <select className="input-field" value={form.pacienteId} onChange={(ev) => setForm({ ...form, pacienteId: ev.target.value })} required>
              <option value="">Seleccionar...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Cita relacionada (opcional)">
            <select className="input-field" value={form.citaId} onChange={(ev) => setForm({ ...form, citaId: ev.target.value })}>
              <option value="">Ninguna</option>
              {citas.map((c) => (
                <option key={c.id} value={c.id}>{c.fecha} — {pacienteNombre(c.pacienteId)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Código CIE-10" required>
            <input className="input-field" placeholder="Ej. J06.9" value={form.codigoCIE} onChange={(ev) => setForm({ ...form, codigoCIE: ev.target.value })} required />
          </FormField>
          <FormField label="Severidad" required>
            <select className="input-field" value={form.severidad} onChange={(ev) => setForm({ ...form, severidad: ev.target.value as Diagnostico['severidad'] })}>
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave</option>
            </select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Descripción" required>
              <input className="input-field" value={form.descripcion} onChange={(ev) => setForm({ ...form, descripcion: ev.target.value })} required />
            </FormField>
          </div>
          <FormField label="Fecha" required>
            <input type="date" className="input-field" value={form.fecha} onChange={(ev) => setForm({ ...form, fecha: ev.target.value })} required />
          </FormField>
          <FormField label="Médico" required>
            <input className="input-field" value={form.medico} onChange={(ev) => setForm({ ...form, medico: ev.target.value })} required />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Notas clínicas">
              <textarea className="input-field min-h-[72px]" value={form.notas} onChange={(ev) => setForm({ ...form, notas: ev.target.value })} />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
