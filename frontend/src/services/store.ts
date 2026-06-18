import type {
  Cita,
  Diagnostico,
  Especialidad,
  FormulaMedica,
  HistorialEntry,
  Medicamento,
  Paciente,
  Prescripcion,
  ReporteResumen,
  ResultadoExamen,
  Tratamiento,
} from '../types'
import { buildAdminReportData } from '../utils/adminReport'
import type { AdminReportData } from '../types/admin'
import { logAudit } from './audit'

function key(name: string) {
  return `medcore_${name}`
}

function get<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key(name))
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set<T>(name: string, data: T) {
  localStorage.setItem(key(name), JSON.stringify(data))
}

const seedPacientes: Paciente[] = [
  { id: 'pac-1', documento: '12345678', nombre: 'María', apellido: 'López', fechaNacimiento: '1985-03-15', telefono: '3001234567', email: 'maria@email.com', direccion: 'Calle 10 #25-30', ciudad: 'Bogotá' },
  { id: 'pac-2', documento: '87654321', nombre: 'Carlos', apellido: 'Ruiz', fechaNacimiento: '1972-11-22', telefono: '3009876543', email: 'carlos@email.com', direccion: 'Av. 68 #45-12', ciudad: 'Medellín' },
  { id: 'pac-3', documento: '11223344', nombre: 'Laura', apellido: 'Martínez', fechaNacimiento: '1990-07-08', telefono: '3015554433', email: 'laura@email.com', direccion: 'Carrera 7 #80-15', ciudad: 'Cali' },
]

const seedFormulas: FormulaMedica[] = [
  {
    id: 'form-1',
    pacienteId: 'pac-1',
    medico: 'Dr. Ana García',
    fecha: '2025-05-10',
    medicamentos: 'Paracetamol 500mg — 1 tableta cada 8h · Omeprazol 20mg — 1 cápsula en ayunas',
    indicaciones: 'Tomar con alimentos. Evitar alcohol.',
    diagnosticoRef: 'J06.9',
  },
]

const seedExamenes: ResultadoExamen[] = [
  {
    id: 'exam-1',
    pacienteId: 'pac-1',
    nombre: 'Hemograma completo',
    tipo: 'Laboratorio',
    fecha: '2025-05-08',
    medico: 'Dr. Ana García',
    resumen: 'Valores dentro de rangos normales. Leve leucocitosis reactiva.',
    archivoNombre: 'hemograma_maria_lopez.pdf',
  },
  {
    id: 'exam-2',
    pacienteId: 'pac-1',
    nombre: 'Radiografía de tórax',
    tipo: 'Imagenología',
    fecha: '2025-04-20',
    medico: 'Dr. Pedro Soto',
    resumen: 'Campos pulmonares libres. Silueta cardíaca normal.',
    archivoNombre: 'rx_torax_maria_lopez.pdf',
  },
]

const seedEspecialidades: Especialidad[] = [
  { id: 'esp-1', nombre: 'Medicina General', descripcion: 'Atención primaria y consultas generales', activa: true, createdAt: '2025-01-01' },
  { id: 'esp-2', nombre: 'Cardiología', descripcion: 'Enfermedades del corazón y sistema circulatorio', activa: true, createdAt: '2025-01-01' },
  { id: 'esp-3', nombre: 'Pediatría', descripcion: 'Atención médica infantil', activa: true, createdAt: '2025-01-01' },
  { id: 'esp-4', nombre: 'Traumatología', descripcion: 'Lesiones musculoesqueléticas', activa: true, createdAt: '2025-01-01' },
]

const seedMedicamentos: Medicamento[] = [
  { id: 'med-1', nombre: 'Paracetamol 500mg', principioActivo: 'Paracetamol', presentacion: 'Tableta', stock: 500, stockMinimo: 100, unidad: 'tabletas', lote: 'L2025-01', vencimiento: '2026-12-31', activo: true },
  { id: 'med-2', nombre: 'Ibuprofeno 400mg', principioActivo: 'Ibuprofeno', presentacion: 'Tableta', stock: 80, stockMinimo: 100, unidad: 'tabletas', lote: 'L2025-02', vencimiento: '2026-06-30', activo: true },
  { id: 'med-3', nombre: 'Amoxicilina 500mg', principioActivo: 'Amoxicilina', presentacion: 'Cápsula', stock: 200, stockMinimo: 50, unidad: 'cápsulas', lote: 'L2025-03', vencimiento: '2025-09-15', activo: true },
  { id: 'med-4', nombre: 'Omeprazol 20mg', principioActivo: 'Omeprazol', presentacion: 'Cápsula', stock: 150, stockMinimo: 75, unidad: 'cápsulas', lote: 'L2025-04', vencimiento: '2027-03-01', activo: true },
]

function init() {
  if (!localStorage.getItem(key('initialized'))) {
    set('pacientes', seedPacientes)
    set('especialidades', seedEspecialidades)
    set('medicamentos', seedMedicamentos)
    set('citas', [] as Cita[])
    set('diagnosticos', [] as Diagnostico[])
    set('tratamientos', [] as Tratamiento[])
    set('prescripciones', [] as Prescripcion[])
    set('historial', [] as HistorialEntry[])
    set('formulas', seedFormulas)
    set('examenes', seedExamenes)
    localStorage.setItem(key('initialized'), 'true')
  }
}

function ensurePatientData() {
  if (!get<FormulaMedica[]>('formulas', []).length) set('formulas', seedFormulas)
  if (!get<ResultadoExamen[]>('examenes', []).length) set('examenes', seedExamenes)
}
ensurePatientData()

init()

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export function getPacientes() {
  return get<Paciente[]>('pacientes', seedPacientes)
}

export function getPaciente(id: string) {
  return getPacientes().find((p) => p.id === id)
}

export function updatePaciente(id: string, data: Partial<Paciente>) {
  const list = getPacientes().map((p) => (p.id === id ? { ...p, ...data } : p))
  set('pacientes', list)
  logAudit('UPDATE', 'usuario', id, 'Paciente actualizó datos personales/contacto')
  return list.find((p) => p.id === id)
}

export function getCitasByPaciente(pacienteId: string) {
  return getCitas()
    .filter((c) => c.pacienteId === pacienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))
}

export function getDiagnosticosByPaciente(pacienteId: string) {
  return getDiagnosticos().filter((d) => d.pacienteId === pacienteId)
}

export function getTratamientosByPaciente(pacienteId: string) {
  return getTratamientos().filter((t) => t.pacienteId === pacienteId)
}

export function getFormulasByPaciente(pacienteId: string) {
  return get<FormulaMedica[]>('formulas', seedFormulas).filter((f) => f.pacienteId === pacienteId)
}

export function getExamenesByPaciente(pacienteId: string) {
  return get<ResultadoExamen[]>('examenes', seedExamenes).filter((e) => e.pacienteId === pacienteId)
}

export function getEspecialidades() {
  return get<Especialidad[]>('especialidades', seedEspecialidades)
}

export function createEspecialidad(data: Omit<Especialidad, 'id' | 'createdAt'>) {
  const list = getEspecialidades()
  const item: Especialidad = { ...data, id: uid('esp'), createdAt: new Date().toISOString().split('T')[0] }
  set('especialidades', [...list, item])
  logAudit('CREATE', 'especialidad', item.id, `Creada especialidad: ${item.nombre}`)
  return item
}

export function updateEspecialidad(id: string, data: Partial<Especialidad>) {
  const list = getEspecialidades().map((e) => (e.id === id ? { ...e, ...data } : e))
  set('especialidades', list)
  logAudit('UPDATE', 'especialidad', id, `Actualizada especialidad: ${data.nombre ?? id}`)
  return list.find((e) => e.id === id)
}

export function deleteEspecialidad(id: string) {
  const item = getEspecialidades().find((e) => e.id === id)
  set('especialidades', getEspecialidades().filter((e) => e.id !== id))
  logAudit('DELETE', 'especialidad', id, `Eliminada especialidad: ${item?.nombre ?? id}`)
}

export function getCitas() {
  return get<Cita[]>('citas', [])
}

export function createCita(data: Omit<Cita, 'id' | 'createdAt' | 'estado'> & { estado?: Cita['estado'] }) {
  const item: Cita = {
    ...data,
    estado: data.estado ?? 'programada',
    id: uid('cit'),
    createdAt: new Date().toISOString(),
  }
  set('citas', [...getCitas(), item])
  addHistorial(item.pacienteId, 'cita', item.id, `Cita programada: ${item.fecha} ${item.hora}`, item.medico)
  logAudit('CREATE', 'cita', item.id, `Cita programada para paciente ${item.pacienteId}`)
  return item
}

export function updateCita(id: string, data: Partial<Cita>) {
  const list = getCitas().map((c) => (c.id === id ? { ...c, ...data } : c))
  set('citas', list)
  logAudit('UPDATE', 'cita', id, `Cita actualizada: estado ${data.estado ?? '—'}`)
  return list.find((c) => c.id === id)
}

export function deleteCita(id: string) {
  set('citas', getCitas().filter((c) => c.id !== id))
  logAudit('DELETE', 'cita', id, 'Cita eliminada')
}

export function getDiagnosticos() {
  return get<Diagnostico[]>('diagnosticos', [])
}

export function createDiagnostico(data: Omit<Diagnostico, 'id'>) {
  const item: Diagnostico = { ...data, id: uid('diag') }
  set('diagnosticos', [...getDiagnosticos(), item])
  addHistorial(item.pacienteId, 'diagnostico', item.id, `Diagnóstico: ${item.codigoCIE} - ${item.descripcion}`, item.medico)
  logAudit('CREATE', 'diagnostico', item.id, `Diagnóstico registrado: ${item.codigoCIE}`)
  return item
}

export function updateDiagnostico(id: string, data: Partial<Diagnostico>) {
  const list = getDiagnosticos().map((d) => (d.id === id ? { ...d, ...data } : d))
  set('diagnosticos', list)
  logAudit('UPDATE', 'diagnostico', id, 'Diagnóstico actualizado')
  return list.find((d) => d.id === id)
}

export function deleteDiagnostico(id: string) {
  set('diagnosticos', getDiagnosticos().filter((d) => d.id !== id))
  logAudit('DELETE', 'diagnostico', id, 'Diagnóstico eliminado')
}

export function getTratamientos() {
  return get<Tratamiento[]>('tratamientos', [])
}

export function createTratamiento(data: Omit<Tratamiento, 'id'>) {
  const item: Tratamiento = { ...data, id: uid('trat') }
  set('tratamientos', [...getTratamientos(), item])
  addHistorial(item.pacienteId, 'tratamiento', item.id, `Tratamiento: ${item.nombre}`, item.medico)
  logAudit('CREATE', 'tratamiento', item.id, `Tratamiento registrado: ${item.nombre}`)
  return item
}

export function updateTratamiento(id: string, data: Partial<Tratamiento>) {
  const list = getTratamientos().map((t) => (t.id === id ? { ...t, ...data } : t))
  set('tratamientos', list)
  logAudit('UPDATE', 'tratamiento', id, 'Tratamiento actualizado')
  return list.find((t) => t.id === id)
}

export function deleteTratamiento(id: string) {
  set('tratamientos', getTratamientos().filter((t) => t.id !== id))
  logAudit('DELETE', 'tratamiento', id, 'Tratamiento eliminado')
}

export function getMedicamentos() {
  return get<Medicamento[]>('medicamentos', seedMedicamentos)
}

export function createMedicamento(data: Omit<Medicamento, 'id'>) {
  const item: Medicamento = { ...data, id: uid('med') }
  set('medicamentos', [...getMedicamentos(), item])
  logAudit('CREATE', 'medicamento', item.id, `Medicamento creado: ${item.nombre}`)
  return item
}

export function updateMedicamento(id: string, data: Partial<Medicamento>) {
  const list = getMedicamentos().map((m) => (m.id === id ? { ...m, ...data } : m))
  set('medicamentos', list)
  logAudit('UPDATE', 'medicamento', id, `Medicamento actualizado: ${data.nombre ?? id}`)
  return list.find((m) => m.id === id)
}

export function deleteMedicamento(id: string) {
  const item = getMedicamentos().find((m) => m.id === id)
  set('medicamentos', getMedicamentos().filter((m) => m.id !== id))
  logAudit('DELETE', 'medicamento', id, `Medicamento eliminado: ${item?.nombre ?? id}`)
}

export function getHistorial(pacienteId?: string) {
  const all = get<HistorialEntry[]>('historial', [])
  if (pacienteId) return all.filter((h) => h.pacienteId === pacienteId).sort((a, b) => b.fecha.localeCompare(a.fecha))
  return all.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

function addHistorial(
  pacienteId: string,
  tipo: HistorialEntry['tipo'],
  referenciaId: string,
  resumen: string,
  medico: string
) {
  const entry: HistorialEntry = {
    id: uid('hist'),
    pacienteId,
    tipo,
    referenciaId,
    resumen,
    fecha: new Date().toISOString(),
    medico,
  }
  set('historial', [entry, ...getHistorial()])
  logAudit('CREATE', 'historial', entry.id, `Entrada historial: ${resumen}`)
}

export function consultarHistorial(pacienteId: string) {
  const entries = getHistorial(pacienteId)
  logAudit('READ', 'historial', pacienteId, `Consulta historial clínico paciente ${pacienteId}`)
  return entries
}

export function getReporteResumen(): ReporteResumen {
  const citas = getCitas()
  const diagnosticos = getDiagnosticos()
  const medicamentos = getMedicamentos()
  const tratamientos = getTratamientos()
  const now = new Date()
  const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const citasPorEstado = {
    programada: citas.filter((c) => c.estado === 'programada').length,
    confirmada: citas.filter((c) => c.estado === 'confirmada').length,
    completada: citas.filter((c) => c.estado === 'completada').length,
    cancelada: citas.filter((c) => c.estado === 'cancelada').length,
  }

  const resumen: ReporteResumen = {
    citasPorEstado,
    diagnosticosPorSeveridad: {
      leve: diagnosticos.filter((d) => d.severidad === 'leve').length,
      moderada: diagnosticos.filter((d) => d.severidad === 'moderada').length,
      grave: diagnosticos.filter((d) => d.severidad === 'grave').length,
    },
    medicamentosBajoStock: medicamentos.filter((m) => m.stock <= m.stockMinimo).length,
    tratamientosActivos: tratamientos.filter((t) => t.estado === 'activo').length,
    totalPacientes: getPacientes().length,
    citasMes: citas.filter((c) => c.fecha.startsWith(mes)).length,
    totalDiagnosticos: diagnosticos.length,
    citasCompletadas: citasPorEstado.completada,
  }

  logAudit('READ', 'reporte', 'resumen', 'Generación reporte resumen')
  return resumen
}

/** Reporte administrativo completo — KPIs locales + secciones mock en adminMocks.ts */
export function getAdminReportData(): AdminReportData {
  const data = buildAdminReportData(getReporteResumen())
  logAudit('READ', 'reporte', 'ejecutivo', 'Generación reporte ejecutivo')
  return data
}

