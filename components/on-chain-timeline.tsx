"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingUp, CheckCircle, XCircle, DollarSign, FileText } from "lucide-react"
import type { ChainEvent } from "@/lib/types"

interface OnChainTimelineProps {
  events: ChainEvent[]
}

export function OnChainTimeline({ events }: OnChainTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "InvestmentMade":
        return <TrendingUp className="h-4 w-4 text-primary" />
      case "MilestoneApproved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "MilestoneRejected":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "FundsReleased":
        return <DollarSign className="h-4 w-4 text-secondary" />
      case "EvidenceSubmitted":
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-muted" />
    }
  }

  const getEventTitle = (type: string) => {
    switch (type) {
      case "InvestmentMade":
        return "Nueva Inversión"
      case "MilestoneApproved":
        return "Hito Aprobado"
      case "MilestoneRejected":
        return "Hito Rechazado"
      case "FundsReleased":
        return "Fondos Liberados"
      case "RefundProcessed":
        return "Reembolso Procesado"
      case "EvidenceSubmitted":
        return "Evidencia Enviada"
      default:
        return type
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "InvestmentMade":
        return "bg-primary text-primary-foreground"
      case "MilestoneApproved":
        return "bg-green-500 text-white"
      case "MilestoneRejected":
        return "bg-destructive text-destructive-foreground"
      case "FundsReleased":
        return "bg-secondary text-secondary-foreground"
      case "EvidenceSubmitted":
        return "bg-blue-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "Fecha no disponible"
    return new Date(timestamp).toLocaleString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const sortedEvents = [...events].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Timeline On-Chain
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Historial de eventos registrados en blockchain para este proyecto
        </p>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⛓️</div>
            <h3 className="text-lg font-semibold mb-2">Sin eventos registrados</h3>
            <p className="text-muted-foreground">
              Los eventos on-chain aparecerán aquí cuando se registren transacciones
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div key={`${event.txHash}-${index}`} className="relative">
                {/* Connector line */}
                {index < sortedEvents.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />}

                <div className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-2 border-border bg-background">
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{getEventTitle(event.type)}</h4>
                        <p className="text-sm text-muted-foreground">{formatTimestamp(event.timestamp)}</p>
                      </div>
                      <Badge className={getEventColor(event.type)}>{event.type}</Badge>
                    </div>

                    {/* Event payload details */}
                    {event.payload && (
                      <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                        {Object.entries(event.payload).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key}:</span>
                            <span className="font-medium">
                              {typeof value === "string" && value.startsWith("0x")
                                ? `${value.slice(0, 6)}...${value.slice(-4)}`
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Transaction link */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">TX:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {event.txHash.slice(0, 10)}...{event.txHash.slice(-8)}
                      </code>
                      <a
                        href={`https://polygonscan.com/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        Ver en Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
