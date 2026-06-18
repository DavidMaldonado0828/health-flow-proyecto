interface ReportDocumentHeaderProps {
  generadoEn: string
}

export function ReportDocumentHeader({ generadoEn }: ReportDocumentHeaderProps) {
  return (
    <div className="border-b border-slate-200 pb-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            HEALTH FLOW — SISTEMA HOSPITALARIO
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-red-700">
            Informe corporativo de gestión operativa
          </p>
        </div>
        <div className="text-left text-xs text-slate-500 md:text-right">
          <p className="font-bold text-slate-700">Documento ejecutivo de control</p>
          <p className="mt-0.5">Fecha de emisión: {generadoEn}</p>
        </div>
      </div>
    </div>
  )
}
