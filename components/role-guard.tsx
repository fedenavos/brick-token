"use client"

import type React from "react"
import { useActiveAccount } from "thirdweb/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"
import { ConnectButton } from "thirdweb/react"
import { client } from "@/lib/web3"
import { polygon, polygonAmoy } from "@/lib/chains"
import { metamask, walletConnect } from "thirdweb/wallets"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: string
  userRole?: string
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRole, userRole, fallback }: RoleGuardProps) {
  const account = useActiveAccount()
  const address = account?.address

  // Mock role checking - in real implementation, this would check against contract or backend
  const hasRole = userRole === requiredRole || userRole === "admin"

  if (!address) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-4">
          <span>Conecta tu wallet para acceder a esta sección</span>
          <ConnectButton
            client={client}
            wallets={[metamask(), walletConnect()]}
            chains={[polygon, polygonAmoy]}
            connectButton={{
              label: "Conectar Wallet",
            }}
            connectModal={{
              size: "compact",
            }}
          />
        </AlertDescription>
      </Alert>
    )
  }

  if (!hasRole) {
    return (
      fallback || (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta sección. Rol requerido: {requiredRole}
          </AlertDescription>
        </Alert>
      )
    )
  }

  return <>{children}</>
}
