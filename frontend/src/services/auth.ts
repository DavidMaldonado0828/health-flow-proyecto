import type { UserAccount, AuthSession } from '../types'
import { getPaciente, getPacientes } from './store'

const SESSION_KEY = 'healthflow_active_session'
const USERS_KEY = 'healthflow_user_accounts'
const RESET_KEY = 'healthflow_password_reset'

const defaultAccounts: UserAccount[] = [
  // Patients (relacionados con store.ts seedPacientes)
  {
    id: 'usr-pac-1',
    email: 'maria@email.com',
    password: 'paciente123',
    nombre: 'María',
    apellido: 'López',
    documento: '12345678',
    rol: 'paciente',
    relacionadoId: 'pac-1',
  },
  {
    id: 'usr-pac-2',
    email: 'carlos@email.com',
    password: 'paciente123',
    nombre: 'Carlos',
    apellido: 'Ruiz',
    documento: '87654321',
    rol: 'paciente',
    relacionadoId: 'pac-2',
  },
  {
    id: 'usr-pac-3',
    email: 'laura@email.com',
    password: 'paciente123',
    nombre: 'Laura',
    apellido: 'Martínez',
    documento: '11223344',
    rol: 'paciente',
    relacionadoId: 'pac-3',
  },
  // Doctors
  {
    id: 'usr-doc-1',
    email: 'ana@healthflow.com',
    password: 'doctor123',
    nombre: 'Ana',
    apellido: 'García',
    documento: '99991111',
    rol: 'medico',
  },
  {
    id: 'usr-doc-2',
    email: 'pedro@healthflow.com',
    password: 'doctor123',
    nombre: 'Pedro',
    apellido: 'Soto',
    documento: '99992222',
    rol: 'medico',
  },
  // Administrator
  {
    id: 'usr-adm-1',
    email: 'admin@healthflow.com',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Principal',
    documento: '99990000',
    rol: 'administrador',
  },
]

export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) return JSON.parse(raw) as UserAccount[]
  } catch {
    /* ignore */
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(defaultAccounts))
  return defaultAccounts
}

export function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Ensure accounts exist on load
getUsers()

export function login(identifier: string, password: string): { ok: true; session: AuthSession } | { ok: false; error: string } {
  const id = identifier.trim().toLowerCase()
  const users = getUsers()

  // Match by email or document number
  const account = users.find(
    (u) =>
      u.email.toLowerCase() === id ||
      u.documento === identifier.trim()
  )

  if (!account || account.password !== password) {
    return { ok: false, error: 'Usuario (correo/documento) o contraseña incorrectos' }
  }

  let displayName = `${account.nombre} ${account.apellido}`
  let relacionadoId = account.relacionadoId

  // If it's a patient, get details from patient database
  if (account.rol === 'paciente' && relacionadoId) {
    const paciente = getPaciente(relacionadoId)
    if (paciente) {
      displayName = `${paciente.nombre} ${paciente.apellido}`
    }
  }

  const session: AuthSession = {
    userId: relacionadoId || account.id,
    nombre: displayName,
    email: account.email,
    rol: account.rol,
    loginAt: new Date().toISOString(),
    pacienteId: account.rol === 'paciente' ? (relacionadoId || account.id) : '',
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true, session }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getActiveSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

// Old function for backward compatibility
export function getPatientSession(): any | null {
  const session = getActiveSession()
  if (session && session.rol === 'paciente') {
    return {
      pacienteId: session.userId,
      nombre: session.nombre,
      email: session.email,
      loginAt: session.loginAt
    }
  }
  return null
}

export function registerUser(data: Omit<UserAccount, 'id'>): { ok: true; user: UserAccount } | { ok: false; error: string } {
  const users = getUsers()
  const emailLower = data.email.trim().toLowerCase()
  const docTrimmed = data.documento.trim()

  const conflict = users.some(
    (u) => u.email.toLowerCase() === emailLower || u.documento === docTrimmed
  )
  if (conflict) {
    return { ok: false, error: 'Ya existe un usuario registrado con ese correo o documento' }
  }

  const newId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  let relacionadoId = data.relacionadoId

  // If registering as a patient, we sync it or create a new patient profile
  if (data.rol === 'paciente' && !relacionadoId) {
    // Generate a new patient ID
    const patients = getPacientes()
    const newPacId = `pac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    
    // Add patient profile
    const newPatients = [
      ...patients,
      {
        id: newPacId,
        documento: data.documento,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: '3000000000',
        email: data.email,
        direccion: 'Calle 10 #25-30',
        ciudad: 'Bogotá',
      }
    ]
    localStorage.setItem('medcore_pacientes', JSON.stringify(newPatients))
    relacionadoId = newPacId
  }

  const newUser: UserAccount = {
    ...data,
    id: newId,
    email: emailLower,
    documento: docTrimmed,
    relacionadoId,
  }

  saveUsers([...users, newUser])
  return { ok: true, user: newUser }
}

export function requestPasswordReset(identifier: string): { ok: true; message: string } | { ok: false; error: string } {
  const account = getUsers().find(
    (u) =>
      u.email.toLowerCase() === identifier.trim().toLowerCase() ||
      u.documento === identifier.trim()
  )
  if (!account) {
    return { ok: false, error: 'No existe una cuenta con ese correo o documento' }
  }
  const token = `reset-${Date.now()}`
  localStorage.setItem(
    RESET_KEY,
    JSON.stringify({ token, userId: account.id, expires: Date.now() + 3600000 })
  )
  return {
    ok: true,
    message: `Enlace de recuperación generado (demo). Use el token en la misma pantalla: ${token}`,
  }
}

export function resetPassword(token: string, newPassword: string): { ok: true } | { ok: false; error: string } {
  if (newPassword.length < 6) {
    return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres' }
  }
  try {
    const raw = localStorage.getItem(RESET_KEY)
    if (!raw) return { ok: false, error: 'Token inválido o expirado' }
    const data = JSON.parse(raw) as { token: string; userId: string; expires: number }
    if (data.token !== token || Date.now() > data.expires) {
      return { ok: false, error: 'Token inválido o expirado' }
    }
    
    const users = getUsers().map((u) =>
      u.id === data.userId ? { ...u, password: newPassword } : u
    )
    saveUsers(users)
    localStorage.removeItem(RESET_KEY)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Error al restablecer contraseña' }
  }
}

export function changePassword(userId: string, current: string, newPassword: string): { ok: true } | { ok: false; error: string } {
  if (newPassword.length < 6) {
    return { ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' }
  }
  const users = getUsers()
  const account = users.find((u) => u.relacionadoId === userId || u.id === userId)
  if (!account || account.password !== current) {
    return { ok: false, error: 'Contraseña actual incorrecta' }
  }
  saveUsers(users.map((u) => (u.id === account.id ? { ...u, password: newPassword } : u)))
  return { ok: true }
}

export function syncAccountEmail(userId: string, email: string) {
  const users = getUsers().map((u) => (u.relacionadoId === userId || u.id === userId ? { ...u, email } : u))
  saveUsers(users)
}

export const DEMO_CREDENTIALS = 'Paciente: maria@email.com / paciente123 · Médico: ana@healthflow.com / doctor123 · Admin: admin@healthflow.com / admin123'
