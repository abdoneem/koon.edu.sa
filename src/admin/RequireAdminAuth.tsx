import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { getAdminToken } from "./authToken"

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
