import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AuthSession } from '../types'
import { getActiveSession, login as authLogin, logout as authLogout } from '../services/auth'

interface AuthContextValue {
  session: AuthSession | null
  login: (identifier: string, password: string) => { ok: boolean; error?: string; session?: AuthSession }
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getActiveSession())

  const refresh = useCallback(() => {
    setSession(getActiveSession())
  }, [])

  const login = useCallback((identifier: string, password: string) => {
    const result = authLogin(identifier, password)
    if (result.ok) {
      setSession(result.session)
      return { ok: true, session: result.session }
    } else {
      return { ok: false, error: result.error }
    }
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, login, logout, refresh }),
    [session, login, logout, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
