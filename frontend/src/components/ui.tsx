import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-red-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-red-800/70">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  accent = 'hospital',
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'hospital' | 'amber' | 'emerald' | 'red'
}) {
  const colors = {
    hospital: 'bg-red-50 text-red-700 border-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  }
  return (
    <div className={`card border ${colors[accent].split(' ')[2]}`}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${colors[accent].split(' ')[1]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-card bg-white shadow-interactive ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="sticky top-0 flex items-center justify-between border-b border-beige-200 bg-white px-6 py-4">
          <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-2xl p-1.5 text-stone-400 hover:bg-beige-100 hover:text-stone-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-red-300 bg-red-50/60 px-6 py-12 text-center text-sm text-red-800/70">
      {message}
    </div>
  )
}

export function BadgeEstado({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    programada: 'bg-blue-100 text-blue-800',
    confirmada: 'bg-indigo-100 text-indigo-800',
    completada: 'bg-emerald-100 text-emerald-800',
    cancelada: 'bg-slate-100 text-slate-600',
    activo: 'bg-emerald-100 text-emerald-800',
    completado: 'bg-slate-100 text-slate-600',
    suspendido: 'bg-amber-100 text-amber-800',
    leve: 'bg-emerald-100 text-emerald-800',
    moderada: 'bg-amber-100 text-amber-800',
    grave: 'bg-red-100 text-red-800',
    CREATE: 'bg-emerald-100 text-emerald-800',
    READ: 'bg-blue-100 text-blue-800',
    UPDATE: 'bg-amber-100 text-amber-800',
    DELETE: 'bg-red-100 text-red-800',
  }
  return <span className={`badge ${styles[estado] ?? 'bg-slate-100 text-slate-700'}`}>{estado}</span>
}

export function FormField({
  label,
  children,
  required,
}: {
  label: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  )
}
