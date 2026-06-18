import type {
  FinancialSummary,
  RiskOutlook,
  SignificantEvent,
} from '../types/admin'

/**
 * Datos financieros ilustrativos — NO representan información real del centro.
 * Reemplazar por respuesta de API de facturación/contabilidad en producción.
 */
export const MOCK_FINANCIAL_SUMMARY: FinancialSummary = {
  ingresosPeriodo: 12_450_000,
  gastosPeriodo: 8_320_000,
  resultadoNeto: 4_130_000,
  ingresosPeriodoAnterior: 11_200_000,
  gastosPeriodoAnterior: 7_980_000,
  variacionPorcentaje: 11.2,
  comentarioEjecutivo:
    'Los ingresos del período muestran una tendencia positiva impulsada por el incremento en consultas especializadas y convenios con aseguradoras. Los gastos operativos crecieron de forma moderada, principalmente por reposición de inventario farmacéutico y mantenimiento de equipos. El resultado neto confirma sostenibilidad operativa, aunque se recomienda monitorear la presión de costos en insumos médicos.',
  moneda: 'COP',
  _isMock: true,
}

/**
 * Eventos significativos ilustrativos — preparados para reemplazo por API.
 */
export const MOCK_SIGNIFICANT_EVENTS: SignificantEvent[] = [
  {
    id: 'evt-1',
    fecha: '2025-05-15',
    titulo: 'Incorporación de especialista en cardiología',
    descripcion:
      'Se integró al equipo la Dra. Valentina Morales, ampliando la capacidad de atención cardiovascular y reduciendo tiempos de espera en consulta externa.',
    categoria: 'personal',
    _isMock: true,
  },
  {
    id: 'evt-2',
    fecha: '2025-05-02',
    titulo: 'Renovación de convenio con aseguradora regional',
    descripcion:
      'Se formalizó la extensión del acuerdo con Salud Total Regional, incorporando tres nuevos procedimientos ambulatorios al catálogo cubierto.',
    categoria: 'convenio',
    _isMock: true,
  },
  {
    id: 'evt-3',
    fecha: '2025-04-28',
    titulo: 'Ampliación del área de observación',
    descripcion:
      'Finalizó la habilitación de cuatro nuevas camillas en el módulo de observación de urgencias, mejorando la capacidad de respuesta en horarios pico.',
    categoria: 'infraestructura',
    _isMock: true,
  },
  {
    id: 'evt-4',
    fecha: '2025-04-10',
    titulo: 'Mantenimiento preventivo de equipos de imagenología',
    descripcion:
      'Se realizó calibración programada del equipo de rayos X, sin interrupción del servicio y con certificación del proveedor técnico.',
    categoria: 'operacion',
    _isMock: true,
  },
]

/**
 * Riesgos, incertidumbres y proyecciones ilustrativas — preparadas para API.
 */
export const MOCK_RISK_OUTLOOK: RiskOutlook = {
  items: [
    {
      id: 'risk-1',
      categoria: 'riesgo',
      titulo: 'Desabastecimiento de antibióticos de amplio espectro',
      descripcion:
        'La dependencia de un único proveedor para tres líneas críticas incrementa el riesgo de interrupción terapéutica ante retrasos logísticos.',
      _isMock: true,
    },
    {
      id: 'risk-2',
      categoria: 'incertidumbre',
      titulo: 'Regulación de tarifas en convenios EPS',
      descripcion:
        'Existe incertidumbre sobre los ajustes tarifarios del segundo semestre, lo que podría impactar el margen operativo de consultas externas.',
      _isMock: true,
    },
    {
      id: 'risk-3',
      categoria: 'proyeccion',
      titulo: 'Crecimiento proyectado del 8–12% en volumen de citas',
      descripcion:
        'La tendencia de registro de pacientes sugiere un incremento sostenido que requerirá refuerzo en agenda médica y personal de apoyo.',
      _isMock: true,
    },
    {
      id: 'risk-4',
      categoria: 'presion_costos',
      titulo: 'Incremento en costos de insumos descartables',
      descripcion:
        'Los precios de material de curación y reactivos de laboratorio registraron un alza del 6% respecto al trimestre anterior.',
      _isMock: true,
    },
    {
      id: 'risk-5',
      categoria: 'expansion',
      titulo: 'Plan de apertura de módulo de telemedicina',
      descripcion:
        'Se evalúa la habilitación de consultas virtuales para seguimiento de crónicos, con despliegue estimado en el próximo trimestre.',
      _isMock: true,
    },
  ],
}
