import type { AuditAction, AuditEntity, AuditLog } from '../types'
import { getActiveSession } from './auth'

const STORAGE_KEY = 'medcore_audit_logs'

function load(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuditLog[]) : []
  } catch {
    return []
  }
}

function save(logs: AuditLog[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 500)))
}

export function logAudit(
  action: AuditAction,
  entity: AuditEntity,
  entityId: string,
  details: string
) {
  const session = getActiveSession()
  const userId = session ? session.userId : 'usr-001'
  const userName = session ? session.nombre : 'Sistema'

  const entry: AuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    entity,
    entityId,
    details,
    ip: '127.0.0.1',
  }
  const logs = [entry, ...load()]
  save(logs)
  return entry
}

export function getAuditLogs(filters?: {
  entity?: AuditEntity
  action?: AuditAction
  from?: string
  to?: string
}): AuditLog[] {
  let logs = load()
  if (filters?.entity) logs = logs.filter((l) => l.entity === filters.entity)
  if (filters?.action) logs = logs.filter((l) => l.action === filters.action)
  if (filters?.from) logs = logs.filter((l) => l.timestamp >= filters.from!)
  if (filters?.to) logs = logs.filter((l) => l.timestamp <= filters.to!)
  return logs
}

export const currentUser = {
  get id() {
    const s = getActiveSession()
    return s ? s.userId : 'usr-001'
  },
  get name() {
    const s = getActiveSession()
    return s ? s.nombre : 'Dr. Ana García'
  }
}
