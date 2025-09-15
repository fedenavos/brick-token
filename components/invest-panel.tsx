"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Shield, AlertTriangle, DollarSign, Loader2 } from "lucide-react"
import { useWeb3Integration } from "@/lib/hooks/use-web3-integration"
import { useInvest } from "@/lib/web3"

interface InvestPanelProps {
  projectId: string
  minTicket: string
  currency: string
  estado: string
  kycStatus?: string
}

export function InvestPanel({ projectId, minTicket, currency, estado, kycStatus = "APROBADO" }: InvestPanelProps) {
  const [amount, setAmount] = useState("")
  const { isConnected, canInvest, userRole, isCorrectNetwork } = useWeb3Integration()
  const investMutation = useInvest()

  const minAmount = Number.parseFloat(minTicket)
  const currentAmount = Number.parseFloat(amount) || 0
  const canProceed =
    canInvest &&
    kycStatus === "APROBADO" &&
    estado === "RECAUDACION" &&
    currentAmount >= minAmount &&
    !investMutation.isPending

  const handleInvest = async () => {
    if (!canProceed) return

    try {
      await investMutation.mutateAsync({
        projectId,
        amount: (currentAmount * 1e6).toString(), // Convert to wei/smallest unit
      })
      setAmount("") // Clear form on success
    } catch (error) {
      // Error handling is done in the mutation
      console.error("[v0] Investment error:", error)
    }
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Invertir en este Proyecto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Alerts */}
        {!isConnected && (
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>Conecta tu wallet para poder invertir</AlertDescription>
          </Alert>
        )}

        {isConnected && !isCorrectNetwork && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Cambia a la red correcta para poder invertir</AlertDescription>
          </Alert>
        )}

        {isConnected && kycStatus !== "APROBADO" && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Tu KYC está pendiente de aprobación. No puedes invertir hasta completar la verificación.
            </AlertDescription>
          </Alert>
        )}

        {estado !== "RECAUDACION" && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Este proyecto no está en fase de recaudación</AlertDescription>
          </Alert>
        )}

        {isConnected && userRole && !canInvest && (
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>Tu rol ({userRole}) no tiene permisos para invertir</AlertDescription>
          </Alert>
        )}

        {/* Investment Form */}
        <div className="space-y-2">
          <Label htmlFor="amount">Monto a invertir</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder={`Mínimo ${minTicket}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
              disabled={!canProceed && !investMutation.isPending}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currency}</div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Ticket mínimo: ${minAmount.toLocaleString()}</span>
            {currentAmount > 0 && (
              <span className={currentAmount >= minAmount ? "text-green-600" : "text-destructive"}>
                {currentAmount >= minAmount ? "✓ Válido" : "✗ Muy bajo"}
              </span>
            )}
          </div>
        </div>

        {/* Investment Button */}
        <Button onClick={handleInvest} disabled={!canProceed} className="w-full" size="lg">
          {investMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            `Invertir ${amount ? `$${currentAmount.toLocaleString()}` : ""}`
          )}
        </Button>

        {/* Status Information */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>KYC Status:</span>
            <Badge variant={kycStatus === "APROBADO" ? "default" : "secondary"}>{kycStatus}</Badge>
          </div>
          {userRole && (
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              <span>Rol:</span>
              <Badge variant="outline">{userRole}</Badge>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            * Las inversiones conllevan riesgos. Lee los términos y condiciones antes de invertir.
          </p>
        </div>

        {/* Transaction Status */}
        {investMutation.isPending && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Procesando transacción... Por favor confirma en tu wallet y espera la confirmación en blockchain.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
