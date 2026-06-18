import { StatCard } from '../ui'
import type { DashboardStats } from '../../types/admin'

interface KpiStatsGridProps {
  stats: DashboardStats
  /** compact: 3 cols en lg; default: 3 cols en lg */
  layout?: 'default' | 'compact'
}

export function KpiStatsGrid({ stats, layout = 'default' }: KpiStatsGridProps) {
  const gridClass =
    layout === 'compact'
      ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
      : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={gridClass}>
      <StatCard label="Total pacientes" value={stats.totalPacientes} />
      <StatCard label="Citas del mes" value={stats.citasMes} accent="hospital" />
      <StatCard label="Tratamientos activos" value={stats.tratamientosActivos} accent="emerald" />
      <StatCard
        label="Alertas de stock"
        value={stats.alertasStock}
        accent={stats.alertasStock > 0 ? 'amber' : 'emerald'}
        sub={stats.alertasStock > 0 ? 'Requiere reabastecimiento' : 'Inventario OK'}
      />
      <StatCard label="Total diagnósticos" value={stats.totalDiagnosticos} />
      <StatCard label="Citas completadas" value={stats.citasCompletadas} accent="emerald" />
    </div>
  )
}
