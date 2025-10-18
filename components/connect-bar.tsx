"use client"

import { ConnectButton } from "thirdweb/react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { useWeb3Integration } from "@/lib/hooks/use-web3-integration"
import { client } from "@/lib/web3"
import { walletConnect, inAppWallet } from "thirdweb/wallets"
import { polygon, polygonAmoy } from "@/lib/chains"

export function ConnectBar() {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    networkName,
    targetNetworkName,
    userRole,
    canInvest,
    canApproveMilestones,
    canSubmitEvidence,
    canManageProjects,
  } = useWeb3Integration()

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "manager":
        return "Manager"
      case "user":
        return "Usuario"
      default:
        return role
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-primary" />
          <div className="flex flex-col mr-4">
            <div className="text-sm font-medium">
              {isConnected ? `${address!.slice(0, 6)}...${address!.slice(-4)}` : "Wallet no conectada"}
            </div>
            {networkName && <div className="text-xs text-muted-foreground">Red: {networkName}</div>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              {userRole && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {getRoleDisplayName(userRole)}
                </Badge>
              )}

              {!isCorrectNetwork && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Red incorrecta
                </Badge>
              )}

              {isCorrectNetwork && (
                <Badge variant="default" className="gap-1 bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3" />
                  Conectado
                </Badge>
              )}
            </>
          )}

          <ConnectButton
            client={client}
            wallets={[
              inAppWallet({
                auth: { options: ["email", "google", "discord", "telegram"] },
              }),
              walletConnect(),
            ]}
            chains={[polygon, polygonAmoy]}
            theme="light"
            connectButton={{ label: "Conectar Wallet" }}
            detailsButton={{
              displayBalanceToken: {
                137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
              },
            }}
          />
        </div>
      </div>

      {isConnected && !isCorrectNetwork && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Estás conectado a {networkName} pero necesitas estar en {targetNetworkName}. Por favor cambia de red en tu
            wallet.
          </AlertDescription>
        </Alert>
      )}

      {isConnected && isCorrectNetwork && userRole && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <div className="font-medium mb-1">Permisos disponibles:</div>
          <div className="flex flex-wrap gap-2">
            {canInvest && <span className="text-green-600">• Invertir</span>}
            {canApproveMilestones && <span className="text-blue-600">• Aprobar hitos</span>}
            {canSubmitEvidence && <span className="text-orange-600">• Enviar evidencias</span>}
            {canManageProjects && <span className="text-purple-600">• Gestionar proyectos</span>}
            {!canInvest && !canApproveMilestones && !canSubmitEvidence && !canManageProjects && (
              <span className="text-muted-foreground">Solo lectura</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
