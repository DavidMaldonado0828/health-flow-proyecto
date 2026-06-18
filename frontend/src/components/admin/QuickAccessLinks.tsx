import { Link } from 'react-router-dom'
import { AlertTriangle, Lock, ShieldCheck } from 'lucide-react'
import type { QuickAccessLink, QuickAccessVariant } from '../../types/admin'
import type { UserRole } from '../../types'
import { ADMIN_QUICK_ACCESS } from '../../data/adminQuickAccess'

const VARIANT_STYLES: Record<
  QuickAccessVariant,
  { iconBg: string; iconColor: string; hoverBorder: string }
> = {
  default: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    hoverBorder: 'hover:border-red-300',
  },
  inventory: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    hoverBorder: 'hover:border-amber-300',
  },
  audit: {
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-700',
    hoverBorder: 'hover:border-indigo-300',
  },
  reports: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    hoverBorder: 'hover:border-emerald-300',
  },
  clinical: {
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    hoverBorder: 'hover:border-slate-400',
  },
}

function canAccess(link: QuickAccessLink, role?: UserRole): boolean {
  if (!link.roles) return true
  if (!role) return false
  return link.roles.includes(role)
}

interface QuickAccessLinksProps {
  links?: QuickAccessLink[]
  userRole?: UserRole
  /** Alertas de stock para señal visual en Inventario */
  stockAlerts?: number
}

export function QuickAccessLinks({
  links = [],
  userRole,
  stockAlerts = 0,
}: QuickAccessLinksProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {links.map((link) => {
        const Icon = link.icon
        const variant = link.variant ?? 'default'
        const styles = VARIANT_STYLES[variant]
        const allowed = canAccess(link, userRole)
        const showStockAlert = link.id === 'inventario' && stockAlerts > 0

        const cardContent = (
          <>
            <div className="flex items-start justify-between gap-2">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-wrap justify-end gap-1.5">
                {link.variant === 'audit' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                    <ShieldCheck className="h-3 w-3" />
                    Trazabilidad
                  </span>
                )}
                {link.restricted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    <Lock className="h-3 w-3" />
                    Supervisado
                  </span>
                )}
                {showStockAlert && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                    <AlertTriangle className="h-3 w-3" />
                    {stockAlerts} alerta{stockAlerts !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold text-slate-900">{link.label}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{link.description}</p>
            </div>
            {!allowed && (
              <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-700">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Acceso restringido para su rol
              </p>
            )}
          </>
        )

        if (!allowed) {
          return (
            <div
              key={link.id}
              className="card cursor-not-allowed border-dashed border-slate-200 bg-slate-50/80 opacity-75"
              title="Acceso restringido para su rol"
            >
              {cardContent}
            </div>
          )
        }

        return (
          <Link
            key={link.id}
            to={link.to}
            className={`card group flex flex-col transition ${styles.hoverBorder} hover:shadow-lg`}
          >
            {cardContent}
            <span className="mt-4 text-xs font-semibold text-red-700 opacity-0 transition group-hover:opacity-100">
              Ir al módulo →
            </span>
          </Link>
        )
      })}
    </div>
  )
}
