import { Download, RefreshCw, FileImage, Loader2, AlertCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { PageHeader } from '../components/ui'
import { ReportPrintContainer, REPORT_EXPORT_CONTAINER_ID } from '../components/admin'
import { getReporteResumen } from '../services/store'
import { buildAdminReportData } from '../utils/adminReport'
import { exportElementToPng, formatReportPngFilename } from '../utils/exportReportPng'
import type { AdminReportData } from '../types/admin'

export function Reportes() {
  const [reportData, setReportData] = useState<AdminReportData>(() =>
    buildAdminReportData(getReporteResumen())
  )
  const [generado, setGenerado] = useState(() => new Date().toLocaleString('es-CO'))
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const refrescar = useCallback(() => {
    setReportData(buildAdminReportData(getReporteResumen()))
    setGenerado(new Date().toLocaleString('es-CO'))
    setExportError(null)
  }, [])

  const exportarJSON = () => {
    const payload = {
      generadoEn: generado,
      reporte: reportData,
      nota: 'Los bloques financialSummary, significantEvents y riskOutlook contienen datos mock (_isMock: true).',
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-health-flow-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportarPNG = async () => {
    const element = document.getElementById(REPORT_EXPORT_CONTAINER_ID)
    if (!element) {
      setExportError('No se encontró el contenedor del reporte para exportar.')
      return
    }

    setIsExporting(true)
    setExportError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 150))
      await exportElementToPng(element, formatReportPngFilename())
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ocurrió un error al generar la imagen PNG.'
      setExportError(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-8">
      <PageHeader
        title="Reporte Ejecutivo"
        description="Indicadores clave de rendimiento operativo y análisis cualitativo-económico"
        action={
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary flex items-center gap-1.5"
                onClick={refrescar}
                disabled={isExporting}
              >
                <RefreshCw className="h-4 w-4" /> Actualizar
              </button>
              <button
                type="button"
                className="btn-secondary flex items-center gap-1.5"
                onClick={exportarPNG}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileImage className="h-4 w-4 text-rose-800" />
                )}
                {isExporting ? 'Exportando…' : 'Exportar PNG'}
              </button>
              <button
                type="button"
                className="btn-primary flex items-center gap-1.5"
                onClick={exportarJSON}
                disabled={isExporting}
              >
                <Download className="h-4 w-4" /> Exportar JSON
              </button>
            </div>
            {exportError && (
              <p className="flex items-center gap-1.5 text-xs text-red-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {exportError}
              </p>
            )}
          </div>
        }
      />

      <ReportPrintContainer data={reportData} generadoEn={generado} />

      <div className="card mt-6 border-red-200 bg-red-50/50">
        <h3 className="text-sm font-semibold text-red-950">Nota de integración</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Los KPIs operativos se calculan desde el estado local (localStorage). Las secciones
          económicas, hechos significativos y riesgos usan datos mock marcados con{' '}
          <code className="rounded bg-white px-1 text-[10px]">_isMock: true</code> en{' '}
          <code className="rounded bg-white px-1 text-[10px]">src/data/adminMocks.ts</code>.
          En producción, conecte este módulo a APIs de facturación, BI o auditoría corporativa.
        </p>
      </div>
    </div>
  )
}
