import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(session.rol)) {
    // Redirect unauthorized user to their default landing page
    if (session.rol === 'paciente') {
      return <Navigate to="/paciente" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
