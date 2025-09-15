"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle, AlertCircle, Calendar, DollarSign } from "lucide-react"
import type { Hito, Aprobacion, DesembolsoHito } from "@/lib/types"

interface MilestonesStepperProps {
  hitos: (Hito & { aprobaciones: Aprobacion[]; desembolsos: DesembolsoHito[] })[]
  approvalPolicy: string
  userRole?: string
}

export function MilestonesStepper({ hitos, approvalPolicy, userRole }: MilestonesStepperProps) {
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "RECHAZADO":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "EN_REVISION":
        return <Clock className="h-5 w-5 text-secondary" />
      case "VENCIDO":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "bg-green-500 text-white"
      case "RECHAZADO":
        return "bg-destructive text-destructive-foreground"
      case "EN_REVISION":
        return "bg-secondary text-secondary-foreground"
      case "VENCIDO":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const checkApprovalPolicy = (aprobaciones: Aprobacion[]) => {
    const aprobados = aprobaciones.filter((a) => a.resultado === "APROBADO")
    const rechazados = aprobaciones.filter((a) => a.resultado === "RECHAZADO")

    if (rechazados.length > 0) return false

    switch (approvalPolicy) {
      case "EMISOR+AUDITOR":
        return aprobados.some((a) => a.id_emisor) && aprobados.some((a) => a.id_auditor)
      case "AUDITOR_SOLO":
        return aprobados.some((a) => a.id_auditor)
      case "MAYORIA_2_DE_3":
        return aprobados.length >= 2
      default:
        return false
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cronograma e Hitos</CardTitle>
        <p className="text-sm text-muted-foreground">Política de aprobación: {approvalPolicy}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {hitos.map((hito, index) => {
          const policyMet = checkApprovalPolicy(hito.aprobaciones)
          const totalDesembolsos = hito.desembolsos.reduce((sum, d) => sum + Number.parseFloat(d.monto), 0)

          return (
            <div key={hito.id} className="relative">
              {/* Connector line */}
              {index < hitos.length - 1 && <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />}

              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-2 border-border bg-background">
                  {getStatusIcon(hito.estado)}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">
                        Hito {hito.nro_hito}: {hito.descripcion}
                      </h4>
                      {hito.fecha_limite && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          Fecha límite: {new Date(hito.fecha_limite).toLocaleDateString()}
                        </div>
                      )}
                      {hito.porcentaje_presupuesto && (
                        <div className="text-sm text-muted-foreground">
                          {hito.porcentaje_presupuesto}% del presupuesto
                        </div>
                      )}
                    </div>

                    <Badge className={getStatusColor(hito.estado)}>{hito.estado}</Badge>
                  </div>

                  {/* Aprobaciones */}
                  {hito.aprobaciones.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Aprobaciones:</h5>
                      <div className="space-y-1">
                        {hito.aprobaciones.map((aprobacion) => (
                          <div
                            key={aprobacion.id}
                            className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                          >
                            <div>
                              <span className="font-medium">
                                {aprobacion.id_auditor ? "Auditor" : aprobacion.id_emisor ? "Emisor" : "Desarrollador"}
                              </span>
                              {aprobacion.comentario && (
                                <span className="text-muted-foreground ml-2">- {aprobacion.comentario}</span>
                              )}
                            </div>
                            <Badge variant={aprobacion.resultado === "APROBADO" ? "default" : "destructive"}>
                              {aprobacion.resultado}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {policyMet && (
                        <Badge variant="default" className="bg-green-500 text-white">
                          Política cumplida - Listo para desembolso
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Desembolsos */}
                  {hito.desembolsos.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Desembolsos:
                      </h5>
                      <div className="space-y-1">
                        {hito.desembolsos.map((desembolso) => (
                          <div
                            key={desembolso.id}
                            className="flex items-center justify-between text-sm p-2 bg-primary/5 rounded"
                          >
                            <span>
                              ${Number.parseFloat(desembolso.monto).toLocaleString()} {desembolso.moneda}
                            </span>
                            <span className="text-muted-foreground">
                              {desembolso.fecha && new Date(desembolso.fecha).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                        <div className="text-sm font-medium text-primary">
                          Total: ${totalDesembolsos.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions for different roles */}
                  {userRole && hito.estado === "EN_REVISION" && (
                    <div className="flex gap-2">
                      {(userRole === "auditor" || userRole === "emisor") && (
                        <>
                          <Button size="sm" variant="default">
                            Aprobar
                          </Button>
                          <Button size="sm" variant="destructive">
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
