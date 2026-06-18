import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, FormField, Modal, PageHeader } from '../components/ui'
import type { Especialidad } from '../types'
import {
  createEspecialidad,
  deleteEspecialidad,
  getEspecialidades,
  updateEspecialidad,
} from '../services/store'

export function Especialidades() {
  const [list, setList] = useState(getEspecialidades())
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Especialidad | null>(null)
  const [form, setForm] = useState({ nombre: '', descripcion: '', activa: true })

  const refresh = () => setList(getEspecialidades())

  const openCreate = () => {
    setEditing(null)
    setForm({ nombre: '', descripcion: '', activa: true })
    setModal(true)
  }

  const openEdit = (e: Especialidad) => {
    setEditing(e)
    setForm({ nombre: e.nombre, descripcion: e.descripcion, activa: e.activa })
    setModal(true)
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (editing) updateEspecialidad(editing.id, form)
    else createEspecialidad(form)
    refresh()
    setModal(false)
  }

  const remove = (id: string) => {
    if (confirm('¿Eliminar esta especialidad?')) {
      deleteEspecialidad(id)
      refresh()
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Especialidades médicas"
        description="Administre las especialidades disponibles en el hospital"
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nueva especialidad
          </button>
        }
      />
      {list.length === 0 ? (
        <EmptyState message="No hay especialidades registradas" />
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-medium text-slate-600">Nombre</th>
                <th className="px-6 py-3 font-medium text-slate-600">Descripción</th>
                <th className="px-6 py-3 font-medium text-slate-600">Estado</th>
                <th className="px-6 py-3 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{e.nombre}</td>
                  <td className="px-6 py-4 text-slate-600">{e.descripcion}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${e.activa ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {e.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary px-2 py-1.5" onClick={() => openEdit(e)}>
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" className="btn-danger px-2 py-1.5" onClick={() => remove(e.id)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar especialidad' : 'Nueva especialidad'}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nombre" required>
            <input className="input-field" value={form.nombre} onChange={(ev) => setForm({ ...form, nombre: ev.target.value })} required />
          </FormField>
          <FormField label="Descripción" required>
            <textarea className="input-field min-h-[80px]" value={form.descripcion} onChange={(ev) => setForm({ ...form, descripcion: ev.target.value })} required />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.activa} onChange={(ev) => setForm({ ...form, activa: ev.target.checked })} className="rounded border-slate-300" />
            Especialidad activa
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
