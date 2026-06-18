import type { ReactNode } from 'react'

interface DashboardSectionProps {
  title: string
  description?: string
  children: ReactNode
  /** Destaca visualmente la sección (p. ej. accesos rápidos) */
  highlight?: boolean
  action?: ReactNode
}

export function DashboardSection({
  title,
  description,
  children,
  highlight = false,
  action,
}: DashboardSectionProps) {
  return (
    <section
      className={
        highlight
          ? 'rounded-2xl border border-red-200/80 bg-white/90 p-6 shadow-md backdrop-blur-sm'
          : ''
      }
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
