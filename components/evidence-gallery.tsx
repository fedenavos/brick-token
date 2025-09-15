"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileImage, Upload, Eye, Calendar } from "lucide-react"
import type { Hito } from "@/lib/types"

interface EvidenceGalleryProps {
  projectId: string
  hitos: Hito[]
  userRole?: string
}

export function EvidenceGallery({ projectId, hitos, userRole }: EvidenceGalleryProps) {
  const hitosWithEvidence = hitos.filter((hito) => hito.evidencia_uri || (hito.imagenes && hito.imagenes.length > 0))

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "APROBADO":
        return "bg-green-500 text-white"
      case "RECHAZADO":
        return "bg-destructive text-destructive-foreground"
      case "EN_REVISION":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Galería de Evidencias
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Evidencias fotográficas y documentales del progreso de cada hito
        </p>
      </CardHeader>
      <CardContent>
        {hitosWithEvidence.length === 0 ? (
          <div className="text-center py-8">
            <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin evidencias disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Las evidencias de progreso aparecerán aquí cuando sean cargadas por el desarrollador
            </p>
            {userRole === "desarrollador" && (
              <Button className="gap-2">
                <Upload className="h-4 w-4" />
                Subir Primera Evidencia
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {hitosWithEvidence.map((hito) => (
              <div key={hito.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      Hito {hito.nro_hito}: {hito.descripcion}
                    </h4>
                    {hito.fecha_limite && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(hito.fecha_limite).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusColor(hito.estado)}>{hito.estado}</Badge>
                </div>

                {/* Images Grid */}
                {hito.imagenes && hito.imagenes.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hito.imagenes.map((imagen, index) => (
                      <Dialog key={index}>
                        <DialogTrigger asChild>
                          <div className="relative group cursor-pointer">
                            <img
                              src={imagen || "/placeholder.svg"}
                              alt={`Evidencia ${hito.nro_hito}-${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              Evidencia - Hito {hito.nro_hito}: {hito.descripcion}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <img
                              src={imagen || "/placeholder.svg"}
                              alt={`Evidencia ${hito.nro_hito}-${index + 1}`}
                              className="w-full max-h-96 object-contain rounded-lg"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                )}

                {/* IPFS Evidence Link */}
                {hito.evidencia_uri && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Evidencia en IPFS</div>
                        <code className="text-xs text-muted-foreground">{hito.evidencia_uri}</code>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={hito.evidencia_uri} target="_blank" rel="noopener noreferrer" className="gap-2">
                          <Eye className="h-3 w-3" />
                          Ver
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload button for developers */}
                {userRole === "desarrollador" && hito.estado === "PENDIENTE" && (
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Upload className="h-4 w-4" />
                    Agregar Evidencia
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
