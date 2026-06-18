import { TrendingDown, TrendingUp } from 'lucide-react'
import type { FinancialSummary } from '../../../types/admin'

interface FinancialSummarySectionProps {
  financial: FinancialSummary
}

function formatCurrency(value: number, moneda: string) {
  return `$${value.toLocaleString('es-CO')} ${moneda}`
}

export function FinancialSummarySection({ financial }: FinancialSummarySectionProps) {
  const variacionPositiva = financial.variacionPorcentaje >= 0

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <TrendingUp className="h-4 w-4 text-emerald-700" />
          II. Análisis de situación económica
        </h4>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
          Datos ilustrativos (mock)
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Ingresos del período
          </p>
          <p className="mt-1 text-base font-bold text-emerald-700">
            {formatCurrency(financial.ingresosPeriodo, financial.moneda)}
          </p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Gastos del período
          </p>
          <p className="mt-1 text-base font-bold text-rose-700">
            {formatCurrency(financial.gastosPeriodo, financial.moneda)}
          </p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Resultado neto
          </p>
          <p className="mt-1 text-base font-bold text-blue-700">
            {formatCurrency(financial.resultadoNeto, financial.moneda)}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Período anterior
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Ingresos: {formatCurrency(financial.ingresosPeriodoAnterior, financial.moneda)}
          </p>
          <p className="text-xs text-slate-600">
            Gastos: {formatCurrency(financial.gastosPeriodoAnterior, financial.moneda)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Variación vs período anterior
          </p>
          <p
            className={`mt-1 flex items-center gap-1 text-base font-bold ${
              variacionPositiva ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {variacionPositiva ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {variacionPositiva ? '+' : ''}
            {financial.variacionPorcentaje}%
          </p>
        </div>
      </div>
      <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
        {financial.comentarioEjecutivo}
      </p>
    </div>
  )
}
