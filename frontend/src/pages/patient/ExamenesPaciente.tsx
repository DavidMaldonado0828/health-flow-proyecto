import { useState } from 'react'
import { Download, Eye, X } from 'lucide-react'
import { EmptyState, PageHeader } from '../../components/ui'
import type { ResultadoExamen } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { getExamenesByPaciente, getPaciente } from '../../services/store'

// Helper to determine the X-ray image path based on summary/resumen text
function getXrayImagePath(resumenText: string): string {
  const text = resumenText.toLowerCase()
  if (text.includes('normal') || text.includes('libres') || text.includes('limpio') || text.includes('sano')) {
    return '/rx_normal.jpg'
  }
  return '/rx_pneumonia.png'
}

// Function to generate the exam result image using Canvas
function downloadExamImage(e: ResultadoExamen, pacienteNombre: string, documento: string, telefono: string, direccion: string, ciudad: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 1100
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const mainColor = '#0f766e' // Smart Health Deep Teal
  const darkTextColor = '#1c1917' // Stone-900
  const lightBgColor = '#f0fdfa' // Light teal

  const isHemograma = e.nombre.toLowerCase().includes('hemograma')

  const triggerDownload = () => {
    const image = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = image
    a.download = `examen_${e.nombre.toLowerCase().replace(/\s+/g, '_')}.png`
    a.click()
  }

  if (isHemograma) {
    // 1. Draw Hemograma image template
    const img = new Image()
    img.src = '/hemograma.png'
    img.onload = () => {
      // Draw base template scaled
      ctx.drawImage(img, 0, 0, 800, 1100)

      // Mask/Cover the Clinica Alemana header and patient VERA OSCAR details
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(35, 35, 730, 175)

      // Draw the new custom header "Fundación Santa Fe de Bogotá"
      ctx.beginPath()
      ctx.arc(80, 95, 22, 0, 2 * Math.PI)
      ctx.fillStyle = lightBgColor
      ctx.fill()
      ctx.strokeStyle = mainColor
      ctx.lineWidth = 2
      ctx.stroke()

      // Vector Cross
      ctx.fillStyle = mainColor
      ctx.fillRect(72, 90, 16, 10)
      ctx.fillRect(75, 84, 10, 22)

      // Logo Text
      ctx.fillStyle = darkTextColor
      ctx.font = 'bold 16px Arial, Helvetica, sans-serif'
      ctx.fillText('FUNDACIÓN SANTA FE DE BOGOTÁ', 120, 90)
      ctx.fillStyle = mainColor
      ctx.font = 'bold 10px Arial, Helvetica, sans-serif'
      ctx.fillText('LABORATORIO DE ANÁLISIS CLÍNICOS', 120, 105)
      ctx.fillStyle = '#6b7280'
      ctx.font = '8px Arial, Helvetica, sans-serif'
      ctx.fillText('Dirección: Cra. 9 #116-20, Bogotá — Tel: (601) 603-0303', 120, 118)

      // Separating line
      ctx.strokeStyle = mainColor
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(35, 135)
      ctx.lineTo(765, 135)
      ctx.stroke()

      // Patient Info Labels
      ctx.fillStyle = mainColor
      ctx.font = 'bold 9px Arial, sans-serif'
      ctx.fillText('Nº Historia Clínica:', 45, 158)
      ctx.fillText('Paciente:', 45, 178)
      ctx.fillText('Identificación:', 45, 198)

      ctx.fillText('Fecha de Reporte:', 450, 158)
      ctx.fillText('Sexo:', 450, 178)
      ctx.fillText('Teléfono:', 450, 198)

      // Patient Info Values (Black)
      ctx.fillStyle = darkTextColor
      ctx.font = '10px Arial, sans-serif'
      ctx.fillText(documento, 145, 158)
      ctx.fillText(pacienteNombre.toUpperCase(), 100, 178)
      ctx.fillText(documento + ' (C.C.)', 118, 198)

      ctx.fillText(e.fecha + ' 10:30 AM', 545, 158)
      const isFemale = pacienteNombre.toLowerCase().endsWith('a') || pacienteNombre.toLowerCase().includes('maría') || pacienteNombre.toLowerCase().includes('laura')
      ctx.fillText(isFemale ? 'FEMENINO' : 'MASCULINO', 485, 178)
      ctx.fillText(telefono, 500, 198)

      triggerDownload()
    }
  } else {
    // 2. Draw Radiografía template (Christus Sinergia style grid with embedded X-ray image)
    const rxImg = new Image()
    rxImg.src = getXrayImagePath(e.resumen)
    rxImg.onload = () => {
      // Background & Border
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 800, 1100)
      ctx.strokeStyle = mainColor
      ctx.lineWidth = 2
      ctx.strokeRect(30, 30, 740, 1040)

      // Header Grid (Y: 40 to Y: 130)
      ctx.strokeRect(40, 40, 720, 90)
      ctx.beginPath()
      ctx.moveTo(220, 40)
      ctx.lineTo(220, 130)
      ctx.moveTo(520, 40)
      ctx.lineTo(520, 130)
      ctx.moveTo(220, 70)
      ctx.lineTo(520, 70)
      ctx.moveTo(220, 100)
      ctx.lineTo(520, 100)
      ctx.moveTo(520, 70)
      ctx.lineTo(760, 70)
      ctx.moveTo(520, 100)
      ctx.lineTo(760, 100)
      ctx.moveTo(640, 100)
      ctx.lineTo(640, 130)
      ctx.stroke()

      // Header Logo
      ctx.beginPath()
      ctx.arc(80, 85, 22, 0, 2 * Math.PI)
      ctx.fillStyle = lightBgColor
      ctx.fill()
      ctx.strokeStyle = mainColor
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.fillStyle = mainColor
      ctx.fillRect(72, 80, 16, 10)
      ctx.fillRect(75, 74, 10, 22)

      // Header Texts
      ctx.fillStyle = darkTextColor
      ctx.font = 'bold 13px Arial, sans-serif'
      ctx.fillText('FUNDACIÓN SANTA FE DE BOGOTÁ', 105, 80)
      ctx.fillStyle = mainColor
      ctx.font = 'italic 8px Arial, sans-serif'
      ctx.fillText('Servicio de Imagenología', 105, 95)
      
      ctx.textAlign = 'center'
      ctx.fillStyle = darkTextColor
      ctx.font = 'bold 10px Arial, sans-serif'
      ctx.fillText('FORMATO', 370, 60)
      ctx.font = 'bold 13px Arial, sans-serif'
      ctx.fillText('Reporte de Radiografía', 370, 90)
      ctx.font = 'bold 9px Arial, sans-serif'
      ctx.fillText('MPSSR-PAAD-Atención Domiciliaria', 370, 118)

      ctx.textAlign = 'left'
      ctx.font = 'bold 8px Arial, sans-serif'
      ctx.fillText('Categoría de Seguridad: Uso Interno', 530, 58)
      ctx.fillText('Diagnóstico por Imagen', 530, 88)
      ctx.fillText('Código: HF-RX-357', 530, 118)
      ctx.fillText('Versión: 001', 650, 118)

      // Patient Metadata Grid (Y: 145 to Y: 295)
      ctx.strokeRect(40, 145, 720, 150)
      ctx.beginPath()
      for (let y = 170; y <= 270; y += 25) {
        ctx.moveTo(40, y)
        ctx.lineTo(760, y)
      }
      ctx.moveTo(260, 145)
      ctx.lineTo(260, 170)
      ctx.moveTo(480, 145)
      ctx.lineTo(480, 170)
      ctx.moveTo(630, 145)
      ctx.lineTo(630, 170)
      ctx.moveTo(480, 170)
      ctx.lineTo(480, 195)
      ctx.moveTo(630, 170)
      ctx.lineTo(630, 195)
      ctx.moveTo(480, 195)
      ctx.lineTo(480, 220)
      ctx.moveTo(480, 220)
      ctx.lineTo(480, 245)
      ctx.moveTo(320, 245)
      ctx.lineTo(320, 270)
      ctx.moveTo(560, 245)
      ctx.lineTo(560, 270)
      ctx.stroke()

      // Patient Labels
      ctx.font = 'bold 8px Arial, sans-serif'
      ctx.fillStyle = mainColor
      ctx.fillText('Nº Historia Clínica:', 45, 160)
      ctx.fillText('Ciudad:', 265, 160)
      ctx.fillText('Fecha de Toma:', 485, 160)
      ctx.fillText('Hora:', 635, 160)
      ctx.fillText('Paciente:', 45, 185)
      ctx.fillText('Sexo:', 485, 185)
      ctx.fillText('Teléfono:', 635, 185)
      ctx.fillText('Identificación:', 45, 210)
      ctx.fillText('Tipo de Identificación:', 485, 210)
      ctx.fillText('Dirección:', 45, 235)
      ctx.fillText('Barrio:', 485, 235)
      ctx.fillText('Aseguradora:', 45, 260)
      ctx.fillText('Tipo de Afiliado:', 325, 260)
      ctx.fillText('Otro, Cual?:', 565, 260)
      ctx.fillText('Procedimiento:', 45, 285)

      // Patient Values
      ctx.fillStyle = darkTextColor
      ctx.font = '9px Arial, sans-serif'
      ctx.fillText(documento, 140, 160)
      ctx.fillText(ciudad, 315, 160)
      ctx.fillText(e.fecha, 565, 160)
      ctx.fillText('11:00 AM', 675, 160)
      ctx.fillText(pacienteNombre, 100, 185)
      const isFemale = pacienteNombre.toLowerCase().endsWith('a') || pacienteNombre.toLowerCase().includes('maría') || pacienteNombre.toLowerCase().includes('laura')
      ctx.fillText(isFemale ? 'Femenino' : 'Masculino', 525, 185)
      ctx.fillText(telefono, 685, 185)
      ctx.fillText(documento, 115, 210)
      ctx.fillText('Cédula de Ciudadanía', 585, 210)
      ctx.fillText(direccion, 100, 235)
      ctx.fillText('El Poblado', 525, 235)
      ctx.fillText('EPS Sura', 115, 260)
      ctx.fillText('Cotizante', 405, 260)
      ctx.fillText('Ninguno', 625, 260)
      ctx.fillText(e.nombre, 115, 285)

      // 5. Draw X-ray Image (Y: 310 to Y: 700)
      // Center width: 500, height: 375
      ctx.drawImage(rxImg, 150, 310, 500, 375)
      ctx.strokeRect(150, 310, 500, 375)

      // 6. Report Description Table (Y: 700 to Y: 850)
      ctx.fillStyle = mainColor
      ctx.fillRect(40, 700, 720, 25)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px Arial, sans-serif'
      ctx.fillText('Descripción del Diagnóstico e Interpretación Médica', 50, 716)

      ctx.strokeStyle = mainColor
      ctx.strokeRect(40, 700, 720, 140)

      ctx.fillStyle = darkTextColor
      ctx.font = 'bold 8.5px Arial, sans-serif'
      ctx.fillText('Interpretación / Hallazgos Clínicos:', 50, 745)
      ctx.font = '8px Arial, sans-serif'

      const maxResWidth = 600
      const words = e.resumen.split(' ')
      let line = ''
      let textY = 760
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxResWidth && n > 0) {
          ctx.fillText(line, 55, textY)
          line = words[n] + ' '
          textY += 12
        } else {
          line = testLine
        }
      }
      ctx.fillText(line, 55, textY)

      // 7. Footer & Signature
      ctx.beginPath()
      ctx.moveTo(40, 870)
      ctx.lineTo(760, 870)
      ctx.strokeStyle = mainColor
      ctx.stroke()

      ctx.font = 'bold 9px Arial, sans-serif'
      ctx.fillText(e.medico, 50, 930)
      ctx.fillStyle = mainColor
      ctx.font = 'bold 8px Arial, sans-serif'
      ctx.fillText('MÉDICO RADIÓLOGO TRATANTE', 50, 942)
      ctx.fillStyle = '#6b7280'
      ctx.font = '8px Arial, sans-serif'
      ctx.fillText('Fundación Santa Fe de Bogotá — Domiciliaria', 50, 954)

      // Blue Signature
      ctx.strokeStyle = '#0284c7'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(50, 915)
      ctx.bezierCurveTo(70, 908, 90, 920, 110, 912)
      ctx.bezierCurveTo(130, 900, 140, 928, 160, 915)
      ctx.stroke()

      ctx.strokeStyle = '#9ca3af'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(45, 922)
      ctx.lineTo(190, 922)
      ctx.stroke()

      // Contact
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

      triggerDownload()
    }
  }
}

export function ExamenesPaciente() {
  const { session } = useAuth()
  const paciente = getPaciente(session!.pacienteId)
  const list = getExamenesByPaciente(session!.pacienteId)
  const nombre = paciente ? `${paciente.nombre} ${paciente.apellido}` : session!.nombre
  const doc = paciente?.documento || '12345678'
  const tel = paciente?.telefono || '3001234567'
  const dir = paciente?.direccion || 'Calle 10 #25-30'
  const ciudad = paciente?.ciudad || 'Bogotá'

  const [selectedExamen, setSelectedExamen] = useState<ResultadoExamen | null>(null)

  return (
    <div>
      <PageHeader title="Resultados de exámenes" description="Consulte y descargue sus resultados" />
      {list.length === 0 ? (
        <EmptyState message="No hay resultados de exámenes" />
      ) : (
        <div className="space-y-3">
          {list.map((e) => (
            <div key={e.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{e.nombre}</h3>
                  <p className="text-sm text-stone-500">{e.tipo} · {e.fecha} · {e.medico}</p>
                  <p className="mt-2 text-sm text-stone-700">{e.resumen}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedExamen(e)}
                  >
                    <Eye className="h-4 w-4" /> Vista Previa
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadExamImage(e, nombre, doc, tel, dir, ciudad)}
                  >
                    <Download className="h-4 w-4" /> Imagen PNG
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High Fidelity Preview Modal */}
      {selectedExamen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-stone-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl p-6 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Eye className="text-teal-600 h-5 w-5" /> Vista Previa de Reporte Médico
              </h3>
              <button
                type="button"
                onClick={() => setSelectedExamen(null)}
                className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Document Preview (HTML Representation) */}
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 max-w-3xl mx-auto overflow-x-auto">
              {selectedExamen.nombre.toLowerCase().includes('hemograma') ? (
                /* 1. Hemograma Template Preview with CSS Overlay for dynamic patient details */
                <div className="relative border border-teal-600 rounded-xl overflow-hidden max-w-2xl mx-auto bg-white shadow-lg min-w-[650px]">
                  {/* Base Hemograma Image */}
                  <img src="/hemograma.png" alt="Hemograma" className="w-full h-auto block select-none pointer-events-none" />

                  {/* Absolute Header Overlay to replace Clínica Alemana with Fundación Santa Fe de Bogotá & patient details */}
                  <div className="absolute top-[3.5%] left-[4.8%] right-[4.8%] h-[15.8%] bg-white flex items-center justify-between px-5 py-2 font-sans border-b border-teal-600/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-600 text-teal-700 font-bold text-xl">+</div>
                      <div className="text-left">
                        <p className="font-extrabold text-xs text-stone-900 leading-tight">FUNDACIÓN SANTA FE DE BOGOTÁ</p>
                        <p className="text-[9px] text-teal-700 font-semibold italic">Laboratorio de Análisis Clínicos</p>
                        <p className="text-[7px] text-stone-400 leading-tight">Dirección: Cra. 9 #116-20, Bogotá — Tel: (601) 603-0303</p>
                      </div>
                    </div>
                    {/* Patient info replacement */}
                    <div className="text-right text-[7.5px] font-bold text-stone-600 space-y-0.5 leading-snug">
                      <p><span className="text-teal-700">PROTOCOLO:</span> {selectedExamen.id.slice(-6).toUpperCase()}</p>
                      <p><span className="text-teal-700">PACIENTE:</span> {nombre.toUpperCase()}</p>
                      <p><span className="text-teal-700">FECHA:</span> {selectedExamen.fecha} | <span className="text-teal-700">HORA:</span> 10:30 AM</p>
                      <p><span className="text-teal-700">IDENTIFICACIÓN:</span> {doc} | <span className="text-teal-700">SEXO:</span> {nombre.toLowerCase().endsWith('a') || nombre.toLowerCase().includes('maría') || nombre.toLowerCase().includes('laura') ? 'FEMENINO' : 'MASCULINO'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* 2. Radiografía Layout Preview with Embedded Chest X-ray */
                <div className="border border-teal-600 rounded-xl p-6 bg-white text-stone-800 shadow-lg max-w-3xl mx-auto min-w-[650px]">
                  {/* Header Grid */}
                  <div className="grid grid-cols-12 border-2 border-teal-700 text-center items-center text-[10px]">
                    <div className="col-span-4 border-r-2 border-teal-700 p-3 flex items-center gap-2">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-teal-50 border border-teal-600 text-teal-700">
                        <span className="font-bold text-xl">+</span>
                      </div>
                      <div className="text-left font-sans">
                        <p className="font-bold text-xs text-stone-900 leading-tight">FUNDACIÓN SANTA FE DE BOGOTÁ</p>
                        <p className="text-[9px] text-teal-700 font-semibold italic">Servicio de Imagenología</p>
                      </div>
                    </div>
                    <div className="col-span-5 border-r-2 border-teal-700 h-full flex flex-col justify-between">
                      <div className="p-1 border-b border-teal-700 font-bold text-stone-600">FORMATO</div>
                      <div className="p-1 border-b border-teal-700 font-bold text-sm text-stone-900">Reporte de Radiografía</div>
                      <div className="p-1 font-bold text-[8px] text-teal-700">MPSSR-PAAD-Atención Domiciliaria</div>
                    </div>
                    <div className="col-span-3 h-full flex flex-col justify-between text-left p-1 text-[8px] space-y-1">
                      <p className="font-bold border-b border-teal-700 pb-1">Seguridad: Uso Interno</p>
                      <p className="font-bold border-b border-teal-700 pb-1">Diagnóstico por Imagen</p>
                      <div className="grid grid-cols-2 text-[7px] font-bold">
                        <p>Cod: HF-RX-357</p>
                        <p className="border-l border-teal-700 pl-1">Ver: 001</p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Information Block */}
                  <div className="grid grid-cols-4 border-2 border-teal-700 border-t-0 p-3 bg-stone-50 gap-y-2 gap-x-4">
                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">Nº HISTORIA CLÍNICA</span>
                      <span className="text-stone-900 font-medium text-[9px]">{doc}</span>
                    </div>
                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">CIUDAD</span>
                      <span className="text-stone-900 font-medium text-[9px]">{ciudad}</span>
                    </div>
                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">FECHA DE TOMA</span>
                      <span className="text-stone-900 font-medium text-[9px]">{selectedExamen.fecha}</span>
                    </div>
                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">HORA</span>
                      <span className="text-stone-900 font-medium text-[9px]">11:00 AM</span>
                    </div>

                    <div className="col-span-2">
                      <span className="font-bold text-teal-700 block text-[8px]">PACIENTE</span>
                      <span className="text-stone-900 font-medium text-[9px]">{nombre}</span>
                    </div>
                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">SEXO</span>
                      <span className="text-stone-900 font-medium text-[9px]">
                        {nombre.toLowerCase().endsWith('a') || nombre.toLowerCase().includes('maría') || nombre.toLowerCase().includes('laura') ? 'Femenino' : 'Masculino'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">TELÉFONO</span>
                      <span className="text-stone-900 font-medium text-[9px]">{tel}</span>
                    </div>

                    <div className="col-span-2">
                      <span className="font-bold text-teal-700 block text-[8px]">IDENTIFICACIÓN</span>
                      <span className="text-stone-900 font-medium text-[9px]">{doc} (C.C.)</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-teal-700 block text-[8px]">DIRECCIÓN Y BARRIO</span>
                      <span className="text-stone-900 font-medium text-[9px]">{dir} — El Poblado</span>
                    </div>

                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">ASEGURADORA</span>
                      <span className="text-stone-900 font-medium text-[9px]">EPS Sura</span>
                    </div>
                    <div>
                      <span className="font-bold text-teal-700 block text-[8px]">TIPO AFILIADO</span>
                      <span className="text-stone-900 font-medium text-[9px]">Cotizante</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-bold text-teal-700 block text-[8px]">PROCEDIMIENTO</span>
                      <span className="text-stone-900 font-medium text-[9px]">{selectedExamen.nombre}</span>
                    </div>
                  </div>

                  {/* Embedded X-ray Image */}
                  <div className="my-4 flex justify-center border-2 border-teal-700/60 p-1 bg-stone-900 rounded-xl max-w-md mx-auto">
                    <img
                      src={getXrayImagePath(selectedExamen.resumen)}
                      alt="Radiografía"
                      className="w-full h-auto max-h-[300px] object-contain rounded-lg"
                    />
                  </div>

                  {/* Findings Description Block */}
                  <div className="border-2 border-teal-700">
                    <div className="bg-teal-700 text-white font-bold py-1 px-3 text-[9px]">
                      Descripción del Diagnóstico e Interpretación Médica
                    </div>
                    <div className="p-3 text-[9px] leading-relaxed space-y-1">
                      <p><strong className="text-teal-800">Procedimiento realizado:</strong> {selectedExamen.nombre} ({selectedExamen.tipo})</p>
                      <p><strong className="text-teal-800">Interpretación de Hallazgos:</strong> {selectedExamen.resumen}</p>
                    </div>
                  </div>

                  {/* Footer Signature and Contact */}
                  <div className="grid grid-cols-2 border-2 border-teal-700 border-t-0 p-4 items-end">
                    <div className="text-left space-y-1">
                      <div className="h-10 w-32 border-b border-stone-400 relative">
                        <span className="absolute bottom-1 left-2 text-[10px] text-sky-600 font-serif italic select-none">
                          {selectedExamen.medico}
                        </span>
                      </div>
                      <p className="font-bold text-stone-900">{selectedExamen.medico}</p>
                      <p className="text-[7px] text-teal-700 font-bold">MÉDICO RADIÓLOGO TRATANTE</p>
                      <p className="text-[7px] text-stone-400">Fundación Santa Fe de Bogotá — Domiciliaria</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-stone-700 text-[8px]">Línea de Atención a Pacientes 24/7</p>
                      <p className="font-bold text-teal-700 text-sm">01800-934-301 · Opción 8</p>
                      <p className="text-[7px] text-stone-400 italic">Health Flow — Cuidado Integral en Casa</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t pt-4 mt-6">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedExamen(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  downloadExamImage(selectedExamen, nombre, doc, tel, dir, ciudad)
                  setSelectedExamen(null)
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
