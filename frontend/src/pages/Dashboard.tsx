import { Link } from 'react-router-dom'
import { ADMIN_QUICK_ACCESS, MEDICO_QUICK_ACCESS } from '../data/adminQuickAccess'
import { FileBarChart } from 'lucide-react'
import { PageHeader } from '../components/ui'
import {
  KpiStatsGrid,
  AppointmentDistribution,
  SeverityDistribution,
  QuickAccessLinks,
  DashboardSection,
  RecentActivityPanel,
} from '../components/admin'
import { useAuth } from '../context/AuthContext'
import { getReporteResumen } from '../services/store'
import { buildAdminReportData } from '../utils/adminReport'

export function Dashboard() {
  const { session } = useAuth()
  const resumen = getReporteResumen()
  const { stats, appointmentDistribution, severityDistribution } = buildAdminReportData(resumen)
  const isAdmin = session?.rol === 'administrador'

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title={isAdmin ? 'Panel de gestión' : 'Dashboard'}
        description={
          isAdmin
            ? 'Centro de control operativo — indicadores, accesos y trazabilidad del sistema Health Flow'
            : 'Resumen operativo del sistema de gestión hospitalaria Health Flow'
        }
      />

      {/* 1. KPIs operativos */}
      <DashboardSection
        title="Indicadores operativos"
        description="Métricas clave del estado actual del centro asistencial"
      >
        <KpiStatsGrid stats={stats} />
      </DashboardSection>

      {/* 2. Accesos rápidos — sección central para administrador */}
      {(isAdmin || session?.rol === 'medico') && (
        <DashboardSection
          title="Accesos rápidos"
          description="Navegación directa a los módulos de gestión, control y supervisión"
          highlight
        >
          <QuickAccessLinks
            links={session?.rol === 'administrador' ? ADMIN_QUICK_ACCESS : MEDICO_QUICK_ACCESS}
            userRole={session?.rol}
            stockAlerts={stats.alertasStock}
          />
        </DashboardSection>
      )}

      {/* 3. Indicadores complementarios */}
      <DashboardSection
        title="Indicadores complementarios"
        description="Distribución operativa de citas y diagnósticos por severidad"
        action={
          <Link
            to="/reportes"
            className="btn-secondary btn-sm flex items-center gap-1.5"
          >
            <FileBarChart className="h-3.5 w-3.5" />
            Ver reporte completo
          </Link>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <AppointmentDistribution distribution={appointmentDistribution} variant="bars" />
          <SeverityDistribution distribution={severityDistribution} variant="cards" />
        </div>
      </DashboardSection>

      {/* 4. Actividad reciente / trazabilidad */}
      {isAdmin && (
        <DashboardSection
          title="Actividad reciente"
          description="Últimas operaciones registradas en el sistema para seguimiento administrativo"
        >
          <RecentActivityPanel limit={5} />
        </DashboardSection>
      )}
    </div>
  )
}
