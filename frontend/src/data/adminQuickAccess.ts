import {
  Calendar,
  ClipboardList,
  FileBarChart,
  History,
  Pill,
  Shield,
  Stethoscope,
  Syringe,
} from 'lucide-react'
import type { QuickAccessLink } from '../types/admin'

/** Accesos rápidos del dashboard ejecutivo — rol administrador */
export const ADMIN_QUICK_ACCESS: QuickAccessLink[] = [
  {
    id: 'especialidades',
    to: '/especialidades',
    label: 'Especialidades',
    description: 'Gestione el catálogo de especialidades médicas y su disponibilidad operativa.',
    icon: Stethoscope,
    variant: 'default',
    roles: ['administrador'],
  },
  {
    id: 'inventario',
    to: '/medicamentos',
    label: 'Inventario',
    description: 'Controle stock, lotes y alertas de reabastecimiento de medicamentos.',
    icon: Pill,
    variant: 'inventory',
    roles: ['administrador', 'medico'],
  },
  {
    id: 'auditoria',
    to: '/auditoria',
    label: 'Auditoría',
    description: 'Revise el registro de operaciones, cambios y trazabilidad del sistema.',
    icon: Shield,
    variant: 'audit',
    roles: ['administrador'],
  },
  {
    id: 'reportes',
    to: '/reportes',
    label: 'Reportes',
    description: 'Consulte indicadores ejecutivos y exporte informes operativos.',
    icon: FileBarChart,
    variant: 'reports',
    roles: ['administrador', 'medico'],
  },
  {
    id: 'historial',
    to: '/historial',
    label: 'Historial clínico',
    description: 'Consulta supervisada de la línea de tiempo clínica por paciente.',
    icon: History,
    variant: 'clinical',
    roles: ['administrador', 'medico'],
    restricted: true,
  },
]

// Quick access links for role 'medico'
export const MEDICO_QUICK_ACCESS: QuickAccessLink[] = [
  {
    id: 'citas',
    to: '/citas',
    label: 'Citas',
    description: 'Gestión de citas médicas programadas y pendientes.',
    icon: Calendar,
    variant: 'default',
    roles: ['medico'],
  },
  {
    id: 'diagnosticos',
    to: '/diagnosticos',
    label: 'Diagnósticos',
    description: 'Acceso a diagnósticos y resultados clínicos.',
    icon: ClipboardList,
    variant: 'default',
    roles: ['medico'],
  },
  {
    id: 'tratamientos',
    to: '/tratamientos',
    label: 'Tratamientos',
    description: 'Control y seguimiento de tratamientos activos.',
    icon: Syringe,
    variant: 'default',
    roles: ['medico'],
  },
  {
    id: 'inventario',
    to: '/medicamentos',
    label: 'Inventario',
    description: 'Consulta y gestión de stock de medicamentos.',
    icon: Pill,
    variant: 'inventory',
    roles: ['medico'],
  },
];
