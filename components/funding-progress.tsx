"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, Users } from "lucide-react"

interface FundingProgressProps {
  raised: string
  softCap: string
  hardCap: string
  investors: number
  currency?: string
}

export function FundingProgress({ raised, softCap, hardCap, investors, currency = "USDC" }: FundingProgressProps) {
  const raisedAmount = Number.parseFloat(raised)
  const softCapAmount = Number.parseFloat(softCap)
  const hardCapAmount = Number.parseFloat(hardCap)

  const progressPercentage = (raisedAmount / hardCapAmount) * 100
  const softCapPercentage = (softCapAmount / hardCapAmount) * 100
  const softCapReached = raisedAmount >= softCapAmount

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progreso de Financiamiento</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {investors} inversores
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-primary">
              ${raisedAmount.toLocaleString()} {currency}
            </span>
            <span className="text-lg font-medium text-muted-foreground">{progressPercentage.toFixed(1)}%</span>
          </div>

          <div className="relative">
            <Progress value={progressPercentage} className="h-3" />
            {/* Soft cap indicator */}
            <div className="absolute top-0 h-3 w-0.5 bg-secondary" style={{ left: `${softCapPercentage}%` }} />
          </div>

          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-secondary" />
              <span className="text-muted-foreground">Soft Cap:</span>
              <span className="font-medium">${softCapAmount.toLocaleString()}</span>
              {softCapReached && <span className="text-secondary font-medium">✓ Alcanzado</span>}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Hard Cap:</span>
              <span className="font-medium">${hardCapAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
