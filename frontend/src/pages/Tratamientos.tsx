import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, FormField, Modal, PageHeader } from '../components/ui'
import type { Tratamiento } from '../types'
import {
  createTratamiento,
  deleteTratamiento,
  getDiagnosticos,
  getPacientes,
  getTratamientos,
  updateTratamiento,
} from '../services/store'

export function Tratamientos() {
  const [list, setList] = useState(getTratamientos())
  const [modal, setModal] = useState(false)
  const pacientes = getPacientes()
  const diagnosticos = getDiagnosticos()
  const [form, setForm] = useState({
    pacienteId: '',
    diagnosticoId: '',
    nombre: '',
    descripcion: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    estado: 'activo' as Tratamiento['estado'],
    medico: 'Dr. Ana García',
  })

  const refresh = () => setList(getTratamientos())

  const pacienteNombre = (id: string) => {
    const p = pacientes.find((x) => x.id === id)
    return p ? `${p.nombre} ${p.apellido}` : id
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    createTratamiento({
      ...form,
      fechaFin: form.fechaFin || undefined,
    })
    refresh()
    setModal(false)
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Tratamientos"
        description="Registre y haga seguimiento de tratamientos vinculados a diagnósticos"
        action={
          <button type="button" className="btn-primary" onClick={() => setModal(true)}>
            <Plus className="h-4 w-4" /> Nuevo tratamiento
          </button>
        }
      />
      {list.length === 0 ? (
        <EmptyState message="No hay tratamientos registrados" />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Tratamiento</th>
                <th className="px-6 py-3 font-medium text-slate-600">Paciente</th>
                <th className="px-6 py-3 font-medium text-slate-600">Periodo</th>
                <th className="px-6 py-3 font-medium text-slate-600">Estado</th>
                <th className="px-6 py-3 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-medium">{t.nombre}</p>
                    <p className="text-xs text-slate-500">{t.descripcion}</p>
                  </td>
                  <td className="px-6 py-4">{pacienteNombre(t.pacienteId)}</td>
                  <td className="px-6 py-4 text-slate-600">{t.fechaInicio}{t.fechaFin ? ` → ${t.fechaFin}` : ''}</td>
                  <td className="px-6 py-4">
                    <select
                      className="input-field py-1 text-xs"
                      value={t.estado}
                      onChange={(ev) => { updateTratamiento(t.id, { estado: ev.target.value as Tratamiento['estado'] }); refresh() }}
                    >
                      <option value="activo">activo</option>
                      <option value="completado">completado</option>
                      <option value="suspendido">suspendido</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button type="button" className="btn-danger px-2 py-1.5" onClick={() => { if (confirm('¿Eliminar?')) { deleteTratamiento(t.id); refresh() } }}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar tratamiento" wide>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Paciente" required>
            <select className="input-field" value={form.pacienteId} onChange={(ev) => setForm({ ...form, pacienteId: ev.target.value })} required>
              <option value="">Seleccionar...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Diagnóstico" required>
            <select className="input-field" value={form.diagnosticoId} onChange={(ev) => setForm({ ...form, diagnosticoId: ev.target.value })} required>
              <option value="">Seleccionar...</option>
              {diagnosticos.map((d) => (
                <option key={d.id} value={d.id}>{d.codigoCIE} — {d.descripcion.slice(0, 40)}</option>
              ))}
            </select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Nombre del tratamiento" required>
              <input className="input-field" value={form.nombre} onChange={(ev) => setForm({ ...form, nombre: ev.target.value })} required />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField label="Descripción" required>
              <textarea className="input-field" value={form.descripcion} onChange={(ev) => setForm({ ...form, descripcion: ev.target.value })} required />
            </FormField>
          </div>
          <FormField label="Inicio" required>
            <input type="date" className="input-field" value={form.fechaInicio} onChange={(ev) => setForm({ ...form, fechaInicio: ev.target.value })} required />
          </FormField>
          <FormField label="Fin (opcional)">
            <input type="date" className="input-field" value={form.fechaFin} onChange={(ev) => setForm({ ...form, fechaFin: ev.target.value })} />
          </FormField>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
