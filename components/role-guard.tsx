"use client"

import type React from "react"
import { useActiveAccount } from "thirdweb/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { ConnectBar } from "@/components/connect-bar"
import type { UserRole } from "@/lib/types"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: UserRole
  userRole?: UserRole
  fallback?: React.ReactNode
}

const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  user: 1,
}

export function RoleGuard({ children, requiredRole, userRole, fallback }: RoleGuardProps) {
  const account = useActiveAccount()
  const address = account?.address

  const hasRole = userRole && roleHierarchy[userRole] >= roleHierarchy[requiredRole]

  if (!address) {
    return (
      <div className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>Conecta tu wallet para acceder a esta sección.</AlertDescription>
        </Alert>
        <ConnectBar />
      </div>
    )
  }

  if (!hasRole) {
    return (
      fallback || (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta sección. Rol requerido: {requiredRole === "admin" && "Administrador"}
            {requiredRole === "manager" && "Manager (Auditor/Desarrollador/Emisor)"}
            {requiredRole === "user" && "Usuario"}
          </AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
