import { useState } from 'react'
import { Download, Eye, X } from 'lucide-react'
import { EmptyState, PageHeader } from '../../components/ui'
import type { FormulaMedica } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { getFormulasByPaciente, getPaciente } from '../../services/store'

interface ParsedMedication {
  generico: string
  concentracion: string
  forma: string
  dosis: string
  via: string
  frecuencia: string
  tiempo: string
  cantidad: string
  cantidadLetras: string
}

function parseMedicationString(raw: string): ParsedMedication[] {
  return raw.split('·').map((med) => {
    const parts = med.split('—')
    const fullMed = parts[0]?.trim() || ''
    const instruction = parts[1]?.trim() || ''

    // Extract concentration (e.g., "500mg")
    let concentracion = '—'
    const concMatch = fullMed.match(/\b\d+\s*(?:mg|g|ml|mcg)\b/i)
    if (concMatch) {
      concentracion = concMatch[0]
    }

    // Clean generic name
    let generico = fullMed
    if (concMatch) {
      generico = fullMed.replace(concMatch[0], '').trim()
    }

    // Guess forma farmacéutica
    let forma = 'Tableta'
    const genLower = generico.toLowerCase()
    if (genLower.includes('cápsula') || genLower.includes('capsula') || genLower.includes('omeprazol')) {
      forma = 'Cápsula'
    } else if (genLower.includes('jarabe') || genLower.includes('solución') || genLower.includes('solucion')) {
      forma = 'Solución Oral'
    } else if (genLower.includes('crema') || genLower.includes('pomada')) {
      forma = 'Crema Tópica'
    } else if (genLower.includes('inyección') || genLower.includes('inyeccion') || genLower.includes('ampolla')) {
      forma = 'Ampolla'
    }

    // Parse dosage & frequency
    let dosis = '1 unidad'
    let frecuencia = 'Cada 8 horas'
    const instLower = instruction.toLowerCase()
    if (instLower.includes('cada')) {
      const idx = instLower.indexOf('cada')
      dosis = instruction.substring(0, idx).trim()
      frecuencia = instruction.substring(idx).trim()
    } else {
      dosis = instruction
    }

    return {
      generico,
      concentracion,
      forma,
      dosis,
      via: 'Oral',
      frecuencia,
      tiempo: '7 días',
      cantidad: '10',
      cantidadLetras: 'DIEZ UNIDADES',
    }
  })
}

// Function to generate the prescription image using Canvas
function downloadPrescriptionImage(f: FormulaMedica, pacienteNombre: string, documento: string, telefono: string, direccion: string, ciudad: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 1100
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const mainColor = '#0f766e' // Smart Health Deep Teal
  const darkTextColor = '#1c1917' // Stone-900
  const lightBgColor = '#f0fdfa' // Light teal

  // 1. Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 800, 1100)

  // 2. Main Border
  ctx.strokeStyle = mainColor
  ctx.lineWidth = 2
  ctx.strokeRect(30, 30, 740, 1040)

  // --- HEADER GRID (Y: 40 to Y: 130) ---
  ctx.strokeStyle = mainColor
  ctx.lineWidth = 1.5
  ctx.strokeRect(40, 40, 720, 90)

  // Column separators
  ctx.beginPath()
  ctx.moveTo(220, 40)
  ctx.lineTo(220, 130)
  ctx.moveTo(520, 40)
  ctx.lineTo(520, 130)
  ctx.stroke()

  // Row separators in Col 2
  ctx.beginPath()
  ctx.moveTo(220, 70)
  ctx.lineTo(520, 70)
  ctx.moveTo(220, 100)
  ctx.lineTo(520, 100)
  ctx.stroke()

  // Row/Col separators in Col 3
  ctx.beginPath()
  ctx.moveTo(520, 70)
  ctx.lineTo(760, 70)
  ctx.moveTo(520, 100)
  ctx.lineTo(760, 100)
  // Split bottom of Col 3 in two cells
  ctx.moveTo(640, 100)
  ctx.lineTo(640, 130)
  ctx.stroke()

  // Draw Logo in Col 1 (Teal vector logo)
  ctx.beginPath()
  ctx.arc(80, 85, 22, 0, 2 * Math.PI)
  ctx.fillStyle = lightBgColor
  ctx.fill()
  ctx.strokeStyle = mainColor
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw Cross
  ctx.fillStyle = mainColor
  ctx.fillRect(72, 80, 16, 10)
  ctx.fillRect(75, 74, 10, 22)

  // Logo Text
  ctx.fillStyle = darkTextColor
  ctx.font = 'bold 16px Arial, Helvetica, sans-serif'
  ctx.fillText('HEALTH FLOW', 112, 80)
  ctx.fillStyle = mainColor
  ctx.font = 'italic 10px Arial, Helvetica, sans-serif'
  ctx.fillText('Hospital en Casa', 112, 95)

  // Col 2 Text
  ctx.fillStyle = darkTextColor
  ctx.font = 'bold 10px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('FORMATO', 370, 60)
  ctx.font = 'bold 13px Arial, sans-serif'
  ctx.fillText('Fórmula Médica', 370, 90)
  ctx.font = 'bold 9px Arial, sans-serif'
  ctx.fillText('MPSSR-PAAD-Atención Domiciliaria', 370, 118)

  // Col 3 Text
  ctx.textAlign = 'left'
  ctx.font = 'bold 8px Arial, sans-serif'
  ctx.fillText('Categoría de Seguridad: Uso Interno', 530, 58)
  ctx.fillText('Atención Médica Integral', 530, 88)
  ctx.fillText('Código: HF-FT-357', 530, 118)
  ctx.fillText('Versión: 001', 650, 118)

  // --- PATIENT METADATA GRID (Y: 145 to Y: 295) ---
  ctx.strokeStyle = mainColor
  ctx.lineWidth = 1
  ctx.strokeRect(40, 145, 720, 150)

  // Row divisions
  ctx.beginPath()
  for (let y = 170; y <= 270; y += 25) {
    ctx.moveTo(40, y)
    ctx.lineTo(760, y)
  }
  ctx.stroke()

  // Col divisions for fields
  ctx.beginPath()
  // Row 1 splits
  ctx.moveTo(260, 145)
  ctx.lineTo(260, 170)
  ctx.moveTo(480, 145)
  ctx.lineTo(480, 170)
  ctx.moveTo(630, 145)
  ctx.lineTo(630, 170)

  // Row 2 splits
  ctx.moveTo(480, 170)
  ctx.lineTo(480, 195)
  ctx.moveTo(630, 170)
  ctx.lineTo(630, 195)

  // Row 3 split
  ctx.moveTo(480, 195)
  ctx.lineTo(480, 220)

  // Row 4 split
  ctx.moveTo(480, 220)
  ctx.lineTo(480, 245)

  // Row 5 splits
  ctx.moveTo(320, 245)
  ctx.lineTo(320, 270)
  ctx.moveTo(560, 245)
  ctx.lineTo(560, 270)
  ctx.stroke()

  // Populate Patient Fields Label & Values
  ctx.font = 'bold 8px Arial, sans-serif'
  ctx.fillStyle = mainColor
  
  // Row 1
  ctx.fillText('Nº Historia Clínica:', 45, 160)
  ctx.fillText('Ciudad:', 265, 160)
  ctx.fillText('Fecha:', 485, 160)
  ctx.fillText('Hora:', 635, 160)
  // Row 2
  ctx.fillText('Paciente:', 45, 185)
  ctx.fillText('Sexo:', 485, 185)
  ctx.fillText('Teléfono:', 635, 185)
  // Row 3
  ctx.fillText('Identificación:', 45, 210)
  ctx.fillText('Tipo de Identificación:', 485, 210)
  // Row 4
  ctx.fillText('Dirección:', 45, 235)
  ctx.fillText('Barrio:', 485, 235)
  // Row 5
  ctx.fillText('Aseguradora:', 45, 260)
  ctx.fillText('Tipo de Afiliado:', 325, 260)
  ctx.fillText('Otro, Cual?:', 565, 260)
  // Row 6
  ctx.fillText('Diagnóstico:', 45, 285)

  // Fill Values (Black text)
  ctx.fillStyle = darkTextColor
  ctx.font = '9px Arial, sans-serif'
  // Row 1
  ctx.fillText(documento, 140, 160)
  ctx.fillText(ciudad || 'Medellín', 315, 160)
  ctx.fillText(f.fecha, 525, 160)
  ctx.fillText('08:00 AM', 675, 160)
  // Row 2
  ctx.fillText(pacienteNombre, 100, 185)
  const isFemale = pacienteNombre.toLowerCase().endsWith('a') || pacienteNombre.toLowerCase().includes('maría') || pacienteNombre.toLowerCase().includes('laura')
  ctx.fillText(isFemale ? 'Femenino' : 'Masculino', 525, 185)
  ctx.fillText(telefono, 685, 185)
  // Row 3
  ctx.fillText(documento, 115, 210)
  ctx.fillText('Cédula de Ciudadanía', 585, 210)
  // Row 4
  ctx.fillText(direccion || 'Calle 10 #25-30', 100, 235)
  ctx.fillText('El Poblado', 525, 235)
  // Row 5
  ctx.fillText('EPS Sura', 115, 260)
  ctx.fillText('Cotizante', 405, 260)
  ctx.fillText('Ninguno', 625, 260)
  // Row 6
  ctx.fillText(f.diagnosticoRef || 'J06.9 — Infección aguda de las vías respiratorias', 110, 285)

  // --- PRESCRIPTIONS TABLE (Y: 310 to Y: 850) ---
  ctx.strokeStyle = mainColor
  ctx.strokeRect(40, 310, 720, 540)

  // Draw header blocks background
  ctx.fillStyle = mainColor
  ctx.fillRect(40, 310, 720, 25)
  ctx.fillStyle = '#14b8a6' // Subheader accent color
  ctx.fillRect(40, 335, 720, 25)

  // Header Texts
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 9px Arial, sans-serif'
  ctx.fillText('Medicamento Genérico y Especificaciones', 50, 326)
  ctx.fillText('Cantidad Solicitada e Indicaciones del Paciente', 460, 326)

  // Subheader Texts
  ctx.font = 'bold 8px Arial, sans-serif'
  ctx.fillText('Medicamento Genérico', 50, 351)
  ctx.fillText('Conc.', 235, 351)
  ctx.fillText('Forma Farm.', 285, 351)
  ctx.fillText('Dosis', 365, 351)
  ctx.fillText('Vía', 425, 351)
  ctx.fillText('Frecuencia', 475, 351)
  ctx.fillText('Duración', 565, 351)
  ctx.fillText('Cant.', 625, 351)
  ctx.fillText('Indicaciones / Instrucciones', 665, 351)

  // Vertical lines in table headers and rows
  ctx.strokeStyle = mainColor
  ctx.beginPath()
  // Col split lines
  ctx.moveTo(225, 335)
  ctx.lineTo(225, 850)
  ctx.moveTo(275, 335)
  ctx.lineTo(275, 850)
  ctx.moveTo(355, 335)
  ctx.lineTo(355, 850)
  ctx.moveTo(415, 335)
  ctx.lineTo(415, 850)
  ctx.moveTo(465, 335)
  ctx.lineTo(465, 850)
  ctx.moveTo(555, 335)
  ctx.lineTo(555, 850)
  ctx.moveTo(615, 335)
  ctx.lineTo(615, 850)
  ctx.moveTo(655, 335)
  ctx.lineTo(655, 850)
  ctx.stroke()

  // Parse and draw medications
  const meds = parseMedicationString(f.medicamentos)
  let currentY = 360
  
  ctx.fillStyle = darkTextColor
  ctx.font = '8px Arial, sans-serif'

  meds.forEach((m) => {
    // Draw horizontal row separator
    ctx.beginPath()
    ctx.moveTo(40, currentY + 40)
    ctx.lineTo(760, currentY + 40)
    ctx.strokeStyle = '#ccd7d6'
    ctx.stroke()

    // Draw values
    ctx.font = 'bold 8.5px Arial, sans-serif'
    ctx.fillText(m.generico, 45, currentY + 22)
    ctx.font = '8px Arial, sans-serif'
    ctx.fillText(m.concentracion, 230, currentY + 22)
    ctx.fillText(m.forma, 280, currentY + 22)
    ctx.fillText(m.dosis, 360, currentY + 22)
    ctx.fillText(m.via, 420, currentY + 22)
    ctx.fillText(m.frecuencia, 470, currentY + 22)
    ctx.fillText(m.tiempo, 560, currentY + 22)
    ctx.fillText(m.cantidad, 620, currentY + 22)

    // Wrap indicators text on indications column
    const maxIndWidth = 95
    const words = f.indicaciones.split(' ')
    let line = ''
    let textY = currentY + 14
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxIndWidth && n > 0) {
        ctx.fillText(line, 660, textY)
        line = words[n] + ' '
        textY += 10
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 660, textY)

    currentY += 50
  })

  // --- FOOTER SECTION (Y: 870 to Y: 1060) ---
  ctx.strokeStyle = mainColor
  ctx.beginPath()
  ctx.moveTo(40, 870)
  ctx.lineTo(760, 870)
  ctx.stroke()

  // Signature Block Left
  ctx.font = 'bold 9px Arial, sans-serif'
  ctx.fillText(f.medico, 50, 930)
  ctx.fillStyle = mainColor
  ctx.font = 'bold 8px Arial, sans-serif'
  ctx.fillText('MEDICO TRATANTE', 50, 942)
  ctx.fillStyle = '#6b7280'
  ctx.font = '8px Arial, sans-serif'
  ctx.fillText('R.M. 1143374648 — Health Flow Domicilios', 50, 954)

  // Draw Signature line & mock vector signature
  ctx.strokeStyle = '#0284c7'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(50, 915)
  // Draw wavy line for signature
  ctx.bezierCurveTo(70, 905, 90, 925, 110, 910)
  ctx.bezierCurveTo(130, 895, 140, 930, 160, 915)
  ctx.stroke()

  ctx.strokeStyle = '#9ca3af'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.moveTo(45, 922)
  ctx.lineTo(190, 922)
  ctx.stroke()

  // Domiciliary Info Right
  ctx.textAlign = 'right'
  ctx.fillStyle = darkTextColor
  ctx.font = 'bold 8.5px Arial, sans-serif'
  ctx.fillText('Línea de Atención a Pacientes 24/7', 750, 915)
  ctx.fillStyle = mainColor
  ctx.font = 'bold 11px Arial, sans-serif'
  ctx.fillText('01800-934-301 · Opción 8', 750, 932)
  ctx.fillStyle = '#6b7280'
  ctx.font = 'italic 8px Arial, sans-serif'
  ctx.fillText('Health Flow — Cuidado Integral en Casa', 750, 946)

  // Trigger download
  const image = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = image
  a.download = `formula_${f.fecha.replace(/-/g, '')}.png`
  a.click()
}

export function FormulasPaciente() {
  const { session } = useAuth()
  const paciente = getPaciente(session!.pacienteId)
  const list = getFormulasByPaciente(session!.pacienteId)
  const nombre = paciente ? `${paciente.nombre} ${paciente.apellido}` : session!.nombre
  const doc = paciente?.documento || '12345678'
  const tel = paciente?.telefono || '3001234567'
  const dir = paciente?.direccion || 'Calle 10 #25-30'
  const ciudad = paciente?.ciudad || 'Bogotá'

  const [selectedFormula, setSelectedFormula] = useState<FormulaMedica | null>(null)

  return (
    <div>
      <PageHeader title="Descargar fórmulas médicas" description="Prescripciones y medicamentos indicados" />
      {list.length === 0 ? (
        <EmptyState message="No hay fórmulas disponibles para descargar" />
      ) : (
        <div className="space-y-3">
          {list.map((f) => (
            <div key={f.id} className="card flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-900">{f.fecha} — {f.medico}</p>
                <p className="mt-2 text-sm text-stone-600 whitespace-pre-line">{f.medicamentos}</p>
                <p className="mt-2 text-xs text-stone-500">{f.indicaciones}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedFormula(f)}
                >
                  <Eye className="h-4 w-4" /> Vista Previa
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => downloadPrescriptionImage(f, nombre, doc, tel, dir, ciudad)}
                >
                  <Download className="h-4 w-4" /> Imagen PNG
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High Fidelity Preview Modal */}
      {selectedFormula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl p-6 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Eye className="text-teal-600 h-5 w-5" /> Vista Previa de Fórmula Domiciliaria
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFormula(null)}
                className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Preview (HTML Representation) */}
            <div className="border border-teal-600 rounded-xl p-6 font-sans text-xs bg-white text-stone-800 shadow-inner max-w-3xl mx-auto overflow-x-auto">
              <div className="min-w-[650px]">
                {/* Header Grid */}
                <div className="grid grid-cols-12 border-2 border-teal-700 text-center items-center text-[10px]">
                  <div className="col-span-4 border-r-2 border-teal-700 p-3 flex items-center gap-2">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-600 text-teal-700">
                      <span className="font-bold text-xl">+</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-stone-900 leading-tight">HEALTH FLOW</p>
                      <p className="text-[9px] text-teal-700 font-semibold italic">Hospital en Casa</p>
                    </div>
                  </div>
                  <div className="col-span-5 border-r-2 border-teal-700 h-full flex flex-col justify-between">
                    <div className="p-1 border-b border-teal-700 font-bold text-stone-600">FORMATO</div>
                    <div className="p-1 border-b border-teal-700 font-bold text-sm text-stone-900">Fórmula Médica</div>
                    <div className="p-1 font-bold text-[8px] text-teal-700">MPSSR-PAAD-Atención Domiciliaria</div>
                  </div>
                  <div className="col-span-3 h-full flex flex-col justify-between text-left p-1 text-[8px] space-y-1">
                    <p className="font-bold border-b border-teal-700 pb-1">Seguridad: Uso Interno</p>
                    <p className="font-bold border-b border-teal-700 pb-1">Atención Médica Integral</p>
                    <div className="grid grid-cols-2 text-[7px] font-bold">
                      <p>Cod: HF-FT-357</p>
                      <p className="border-l border-teal-700 pl-1">Ver: 001</p>
                    </div>
                  </div>
                </div>

                {/* Patient Information Block */}
                <div className="grid grid-cols-4 border-2 border-teal-700 border-t-0 p-3 bg-stone-50 gap-y-2 gap-x-4">
                  <div>
                    <span className="font-bold text-teal-700 block">Nº HISTORIA CLÍNICA</span>
                    <span className="text-stone-900 font-medium">{doc}</span>
                  </div>
                  <div>
                    <span className="font-bold text-teal-700 block">CIUDAD</span>
                    <span className="text-stone-900 font-medium">{ciudad}</span>
                  </div>
                  <div>
                    <span className="font-bold text-teal-700 block">FECHA</span>
                    <span className="text-stone-900 font-medium">{selectedFormula.fecha}</span>
                  </div>
                  <div>
                    <span className="font-bold text-teal-700 block">HORA</span>
                    <span className="text-stone-900 font-medium">08:00 AM</span>
                  </div>

                  <div className="col-span-2">
                    <span className="font-bold text-teal-700 block">PACIENTE</span>
                    <span className="text-stone-900 font-medium">{nombre}</span>
                  </div>
                  <div>
                    <span className="font-bold text-teal-700 block">SEXO</span>
                    <span className="text-stone-900 font-medium">
                      {nombre.toLowerCase().endsWith('a') || nombre.toLowerCase().includes('maría') || nombre.toLowerCase().includes('laura') ? 'Femenino' : 'Masculino'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-teal-700 block">TELÉFONO</span>
                    <span className="text-stone-900 font-medium">{tel}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="font-bold text-teal-700 block">IDENTIFICACIÓN</span>
                    <span className="text-stone-900 font-medium">{doc} (C.C.)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-teal-700 block">DIRECCIÓN Y BARRIO</span>
                    <span className="text-stone-900 font-medium">{dir} — El Poblado</span>
                  </div>

                  <div>
                    <span className="font-bold text-teal-700 block">ASEGURADORA</span>
                    <span className="text-stone-900 font-medium">EPS Sura</span>
                  </div>
                  <div>
                    <span className="font-bold text-teal-700 block">TIPO AFILIADO</span>
                    <span className="text-stone-900 font-medium">Cotizante</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-teal-700 block">DIAGNÓSTICO</span>
                    <span className="text-stone-900 font-medium truncate">
                      {selectedFormula.diagnosticoRef || 'J06.9 — Infección respiratoria aguda de las vías aéreas'}
                    </span>
                  </div>
                </div>

                {/* Grid Table of Medications */}
                <div className="border-2 border-teal-700 border-t-0">
                  {/* Table headers */}
                  <div className="grid grid-cols-12 bg-teal-700 text-white font-bold py-1 px-2 text-[9px]">
                    <div className="col-span-7">Medicamento Genérico y Especificaciones</div>
                    <div className="col-span-5 border-l border-teal-600 pl-2">Cantidad Solicitada e Indicaciones</div>
                  </div>
                  {/* Table subheaders */}
                  <div className="grid grid-cols-12 bg-teal-600/90 text-white font-bold py-1 px-2 text-[8px] border-b border-teal-700 text-center">
                    <div className="col-span-3 text-left">Medicamento Genérico</div>
                    <div className="col-span-1">Conc.</div>
                    <div className="col-span-1">Forma</div>
                    <div className="col-span-1">Dosis</div>
                    <div className="col-span-1">Vía</div>
                    <div className="col-span-2 border-l border-teal-500 pl-1">Frecuencia</div>
                    <div className="col-span-1">Días</div>
                    <div className="col-span-1">Cant.</div>
                    <div className="col-span-1">Indicaciones</div>
                  </div>

                  {/* Medication rows */}
                  <div className="divide-y divide-teal-100">
                    {parseMedicationString(selectedFormula.medicamentos).map((m, idx) => (
                      <div key={idx} className="grid grid-cols-12 py-2 px-2 text-[8px] items-center text-center">
                        <div className="col-span-3 text-left font-bold text-stone-900">{m.generico}</div>
                        <div className="col-span-1">{m.concentracion}</div>
                        <div className="col-span-1">{m.forma}</div>
                        <div className="col-span-1">{m.dosis}</div>
                        <div className="col-span-1">{m.via}</div>
                        <div className="col-span-2 text-[7px]">{m.frecuencia}</div>
                        <div className="col-span-1">{m.tiempo}</div>
                        <div className="col-span-1 font-bold">{m.cantidad}</div>
                        <div className="col-span-1 text-left text-[7px] leading-tight col-start-12 pl-1 truncate" title={selectedFormula.indicaciones}>
                          {selectedFormula.indicaciones}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Signature and Contact */}
                <div className="grid grid-cols-2 border-2 border-teal-700 border-t-0 p-4 items-end">
                  <div className="text-left space-y-1">
                    <div className="h-10 w-32 border-b border-stone-400 relative">
                      {/* Mock Wavy Signature */}
                      <span className="absolute bottom-1 left-2 text-[10px] text-sky-600 font-serif italic select-none">
                        Dr. Ana García
                      </span>
                    </div>
                    <p className="font-bold text-stone-900">{selectedFormula.medico}</p>
                    <p className="text-[7px] text-teal-700 font-bold">MEDICO TRATANTE</p>
                    <p className="text-[7px] text-stone-400">RM-1143374648 — Health Flow Domicilios</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-stone-700 text-[8px]">Línea de Atención a Pacientes 24/7</p>
                    <p className="font-bold text-teal-700 text-sm">01800-934-301 · Opción 8</p>
                    <p className="text-[7px] text-stone-400 italic">Health Flow — Cuidado Integral en Casa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t pt-4 mt-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedFormula(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  downloadPrescriptionImage(selectedFormula, nombre, doc, tel, dir, ciudad)
                  setSelectedFormula(null)
                }}
              >
                <Download className="h-4 w-4" /> Descargar Imagen (.PNG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
