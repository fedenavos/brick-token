"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConnectBar } from "@/components/connect-bar"
import { RoleGuard } from "@/components/role-guard"
import { useWeb3Integration } from "@/lib/hooks/use-web3-integration"
import { ArrowLeft, Building, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function NewProjectPage() {
  const { userRole } = useWeb3Integration()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Project Description
    descripcion: "",
    direccion: "",
    organizador: "",
    rentabilidad_esperada: "",
    renta_garantizada: "",
    plazo_renta: "",
    estado_actual_obra: "",
    // Project Config
    emisor_id: "",
    desarrollador_id: "",
    auditor_id: "",
    moneda: "USDC",
    monto_total: "",
    monto_minimo: "",
    ticket_minimo: "",
    cantidad_etapas: "",
    approvalPolicy: "",
    chainId: "137",
    contractAddress: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      const requiredFields = [
        "descripcion",
        "direccion",
        "organizador",
        "emisor_id",
        "desarrollador_id",
        "auditor_id",
        "monto_total",
        "monto_minimo",
        "ticket_minimo",
        "cantidad_etapas",
        "approvalPolicy",
        "contractAddress",
      ]

      const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

      if (missingFields.length > 0) {
        toast.error(`Campos requeridos faltantes: ${missingFields.join(", ")}`)
        return
      }

      // Validate amounts
      const montoTotal = Number.parseFloat(formData.monto_total)
      const montoMinimo = Number.parseFloat(formData.monto_minimo)
      const ticketMinimo = Number.parseFloat(formData.ticket_minimo)

      if (montoTotal <= montoMinimo) {
        toast.error("El monto total debe ser mayor al monto mínimo")
        return
      }

      if (ticketMinimo <= 0) {
        toast.error("El ticket mínimo debe ser mayor a 0")
        return
      }

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success("Proyecto creado exitosamente")
      router.push("/admin/projects")
    } catch (error) {
      toast.error("Error al crear el proyecto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RoleGuard requiredRole="admin" userRole={userRole}>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/projects" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Proyectos
                </Link>
              </Button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Building className="h-8 w-8 text-primary" />
                  Nuevo Proyecto
                </h1>
                <p className="text-muted-foreground">Configura un nuevo proyecto inmobiliario tokenizado</p>
              </div>
              <ConnectBar />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizador">Organizador/Constructora *</Label>
                    <Input
                      id="organizador"
                      value={formData.organizador}
                      onChange={(e) => handleInputChange("organizador", e.target.value)}
                      placeholder="Ej: Constructora Premium SA"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      placeholder="Ej: Av. Santa Fe 3500, Palermo, CABA"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Descripción detallada del proyecto inmobiliario..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentabilidad_esperada">Rentabilidad Esperada</Label>
                    <Input
                      id="rentabilidad_esperada"
                      value={formData.rentabilidad_esperada}
                      onChange={(e) => handleInputChange("rentabilidad_esperada", e.target.value)}
                      placeholder="Ej: 12-16%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renta_garantizada">Renta Garantizada</Label>
                    <Input
                      id="renta_garantizada"
                      value={formData.renta_garantizada}
                      onChange={(e) => handleInputChange("renta_garantizada", e.target.value)}
                      placeholder="Ej: Sí, 12% anual mínimo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plazo_renta">Plazo de Renta</Label>
                    <Input
                      id="plazo_renta"
                      value={formData.plazo_renta}
                      onChange={(e) => handleInputChange("plazo_renta", e.target.value)}
                      placeholder="Ej: 24 meses"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_actual_obra">Estado Actual de la Obra</Label>
                  <Input
                    id="estado_actual_obra"
                    value={formData.estado_actual_obra}
                    onChange={(e) => handleInputChange("estado_actual_obra", e.target.value)}
                    placeholder="Ej: Excavación completada, iniciando fundaciones"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emisor_id">Emisor *</Label>
                    <Select value={formData.emisor_id} onValueChange={(value) => handleInputChange("emisor_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar emisor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emisor-001">BrickChain Capital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desarrollador_id">Desarrollador *</Label>
                    <Select
                      value={formData.desarrollador_id}
                      onValueChange={(value) => handleInputChange("desarrollador_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar desarrollador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dev-001">Constructora Premium SA</SelectItem>
                        <SelectItem value="dev-002">Desarrollos Urbanos SRL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditor_id">Auditor *</Label>
                    <Select
                      value={formData.auditor_id}
                      onValueChange={(value) => handleInputChange("auditor_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar auditor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audit-001">PropTech Auditors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda *</Label>
                    <Select value={formData.moneda} onValueChange={(value) => handleInputChange("moneda", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto_total">Monto Total (Hard Cap) *</Label>
                    <Input
                      id="monto_total"
                      type="number"
                      value={formData.monto_total}
                      onChange={(e) => handleInputChange("monto_total", e.target.value)}
                      placeholder="1000000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto_minimo">Monto Mínimo (Soft Cap) *</Label>
                    <Input
                      id="monto_minimo"
                      type="number"
                      value={formData.monto_minimo}
                      onChange={(e) => handleInputChange("monto_minimo", e.target.value)}
                      placeholder="500000"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket_minimo">Ticket Mínimo *</Label>
                    <Input
                      id="ticket_minimo"
                      type="number"
                      value={formData.ticket_minimo}
                      onChange={(e) => handleInputChange("ticket_minimo", e.target.value)}
                      placeholder="1000"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cantidad_etapas">Cantidad de Etapas *</Label>
                    <Input
                      id="cantidad_etapas"
                      type="number"
                      value={formData.cantidad_etapas}
                      onChange={(e) => handleInputChange("cantidad_etapas", e.target.value)}
                      placeholder="4"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvalPolicy">Política de Aprobación *</Label>
                    <Select
                      value={formData.approvalPolicy}
                      onValueChange={(value) => handleInputChange("approvalPolicy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar política" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMISOR+AUDITOR">Emisor + Auditor</SelectItem>
                        <SelectItem value="AUDITOR_SOLO">Solo Auditor</SelectItem>
                        <SelectItem value="MAYORIA_2_DE_3">Mayoría 2 de 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chainId">Chain ID</Label>
                    <Select value={formData.chainId} onValueChange={(value) => handleInputChange("chainId", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="137">Polygon (137)</SelectItem>
                        <SelectItem value="1">Ethereum (1)</SelectItem>
                        <SelectItem value="8453">Base (8453)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contractAddress">Dirección del Contrato *</Label>
                    <Input
                      id="contractAddress"
                      value={formData.contractAddress}
                      onChange={(e) => handleInputChange("contractAddress", e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/projects">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Creando..." : "Crear Proyecto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleGuard>
  )
}
