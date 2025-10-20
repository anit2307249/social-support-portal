
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  isAllowed: boolean
  redirectPath?: string
  children: ReactNode
}

export default function ProtectedRoute({
  isAllowed,
  redirectPath = '/signin',
  children,
}: ProtectedRouteProps) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />
  }
  return <>{children}</>
}
