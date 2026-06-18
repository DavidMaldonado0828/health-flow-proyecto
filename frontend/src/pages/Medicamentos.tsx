import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, FormField, Modal, PageHeader } from '../components/ui'
import type { Medicamento } from '../types'
import {
  createMedicamento,
  deleteMedicamento,
  getMedicamentos,
  updateMedicamento,
} from '../services/store'

export function Medicamentos() {
  const [list, setList] = useState(getMedicamentos())
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Medicamento | null>(null)
  const emptyForm = {
    nombre: '',
    principioActivo: '',
    presentacion: '',
    stock: 0,
    stockMinimo: 50,
    unidad: 'unidades',
    lote: '',
    vencimiento: '',
    activo: true,
  }
  const [form, setForm] = useState(emptyForm)

  const refresh = () => setList(getMedicamentos())

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModal(true)
  }

  const openEdit = (m: Medicamento) => {
    setEditing(m)
    setForm({
      nombre: m.nombre,
      principioActivo: m.principioActivo,
      presentacion: m.presentacion,
      stock: m.stock,
      stockMinimo: m.stockMinimo,
      unidad: m.unidad,
      lote: m.lote,
      vencimiento: m.vencimiento,
      activo: m.activo,
    })
    setModal(true)
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (editing) updateMedicamento(editing.id, form)
    else createMedicamento(form)
    refresh()
    setModal(false)
  }

  const bajoStock = (m: Medicamento) => m.stock <= m.stockMinimo

  return (
    <div className="p-8">
      <PageHeader
        title="Gestión de medicamentos"
        description="Inventario, lotes, vencimiento y alertas de stock mínimo"
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Agregar medicamento
          </button>
        }
      />
      {list.length === 0 ? (
        <EmptyState message="No hay medicamentos en inventario" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((m) => (
            <div
              key={m.id}
              className={`card ${bajoStock(m) ? 'border-amber-300 bg-amber-50/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{m.nombre}</h3>
                  <p className="text-sm text-slate-500">{m.principioActivo} · {m.presentacion}</p>
                </div>
                <div className="flex gap-1">
                  <button type="button" className="btn-secondary px-2 py-1.5" onClick={() => openEdit(m)}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" className="btn-danger px-2 py-1.5" onClick={() => { if (confirm('¿Eliminar?')) { deleteMedicamento(m.id); refresh() } }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Stock</span>
                  <p className={`font-bold ${bajoStock(m) ? 'text-amber-700' : 'text-slate-900'}`}>
                    {m.stock} {m.unidad}
                    {bajoStock(m) && <AlertTriangle className="ml-1 inline h-4 w-4 text-amber-600" />}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Mínimo</span>
                  <p className="font-medium">{m.stockMinimo}</p>
                </div>
                <div>
                  <span className="text-slate-500">Lote</span>
                  <p className="font-mono text-xs">{m.lote}</p>
                </div>
                <div>
                  <span className="text-slate-500">Vence</span>
                  <p>{m.vencimiento}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar medicamento' : 'Nuevo medicamento'} wide>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre comercial" required>
            <input className="input-field" value={form.nombre} onChange={(ev) => setForm({ ...form, nombre: ev.target.value })} required />
          </FormField>
          <FormField label="Principio activo" required>
            <input className="input-field" value={form.principioActivo} onChange={(ev) => setForm({ ...form, principioActivo: ev.target.value })} required />
          </FormField>
          <FormField label="Presentación" required>
            <input className="input-field" value={form.presentacion} onChange={(ev) => setForm({ ...form, presentacion: ev.target.value })} required />
          </FormField>
          <FormField label="Unidad" required>
            <input className="input-field" value={form.unidad} onChange={(ev) => setForm({ ...form, unidad: ev.target.value })} required />
          </FormField>
          <FormField label="Stock" required>
            <input type="number" min={0} className="input-field" value={form.stock} onChange={(ev) => setForm({ ...form, stock: Number(ev.target.value) })} required />
          </FormField>
          <FormField label="Stock mínimo" required>
            <input type="number" min={0} className="input-field" value={form.stockMinimo} onChange={(ev) => setForm({ ...form, stockMinimo: Number(ev.target.value) })} required />
          </FormField>
          <FormField label="Lote" required>
            <input className="input-field" value={form.lote} onChange={(ev) => setForm({ ...form, lote: ev.target.value })} required />
          </FormField>
          <FormField label="Vencimiento" required>
            <input type="date" className="input-field" value={form.vencimiento} onChange={(ev) => setForm({ ...form, vencimiento: ev.target.value })} required />
          </FormField>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
