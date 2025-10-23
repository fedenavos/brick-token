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
import { getCoreContract, ipfsCidToBytes32, toTokenUnits } from "@/lib/eth/core"

export default function NewProjectPage() {
  const { userRole } = useWeb3Integration()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Campos necesarios para createCampaign
    ipfs_hash: "",              // _ipfsHash: documentación del proyecto
    monto_total: "",            // _goal: objetivo de recaudación
    starts_at_days: "1",        // _startsAt: días desde ahora
    duration_days: "30",        // _endsAt: duración en días
    cantidad_certificados: "",  // _certificates: número de certificados
    certificate_proof: "",      // _certificateProof: prueba IPFS
    
    // Campos para backend (mantener)
    descripcion: "",
    direccion: "",
    organizador: "",
    rentabilidad_esperada: "",
    renta_garantizada: "",
    plazo_renta: "",
    estado_actual_obra: "",
    emisor_id: "",
    desarrollador_id: "",
    auditor_id: "",
    moneda: "USDC",
    monto_minimo: "",
    ticket_minimo: "",
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
      // Validación de campos requeridos para createCampaign
      const requiredBlockchainFields = [
        "ipfs_hash",
        "monto_total",
        "cantidad_certificados",
        "contractAddress",
      ]
      
      const missingFields = requiredBlockchainFields.filter((field) => !formData[field as keyof typeof formData])
      if (missingFields.length > 0) {
        toast.error(`Campos blockchain requeridos: ${missingFields.join(", ")}`)
        setIsLoading(false)
        return
      }

      // Validaciones
      const montoTotal = Number(formData.monto_total)
      const cantidadCertificados = Number(formData.cantidad_certificados)
      
      if (montoTotal <= 0) {
        toast.error("El monto total debe ser mayor a 0")
        setIsLoading(false)
        return
      }

      if (cantidadCertificados <= 0) {
        toast.error("La cantidad de certificados debe ser mayor a 0")
        setIsLoading(false)
        return
      }

      // Conectar al contrato Core
      toast.loading("Conectando al contrato...")
      const core = await getCoreContract(formData.contractAddress)

      // Preparar parámetros para createCampaign
      const ipfsHashBytes32 = ipfsCidToBytes32(formData.ipfs_hash)
      const certificateProofBytes32 = formData.certificate_proof 
        ? ipfsCidToBytes32(formData.certificate_proof)
        : ipfsHashBytes32

      const goalInTokenUnits = toTokenUnits(montoTotal, 6) // 6 decimales para USDC/USDT

      // Calcular timestamps
      const now = Math.floor(Date.now() / 1000)
      const startsAtDays = Number(formData.starts_at_days) || 1
      const durationDays = Number(formData.duration_days) || 30
      const startsAt = now + (startsAtDays * 24 * 60 * 60)
      const endsAt = startsAt + (durationDays * 24 * 60 * 60)

      toast.dismiss()
      toast.loading("Creando campaña en blockchain...")

      // Llamar a createCampaign
      const tx = await core.createCampaign(
        ipfsHashBytes32,           // bytes32 _ipfsHash
        goalInTokenUnits,          // uint _goal
        startsAt,                  // uint _startsAt
        endsAt,                    // uint _endsAt
        cantidadCertificados,      // uint _certificates
        certificateProofBytes32    // bytes32 _certificateProof
      )

      const receipt = await tx.wait()
      
      toast.dismiss()
      toast.success(`Campaña creada! Tx: ${receipt.transactionHash.slice(0, 10)}...`)

      // Aquí podrías guardar los datos adicionales en tu backend si es necesario
      // await saveToBackend(formData, receipt.transactionHash)

      setTimeout(() => {
        router.push("/admin/projects")
      }, 2000)

    } catch (error: any) {
      console.error("Error:", error)
      toast.dismiss()
      
      if (error?.reason) {
        toast.error(`Error del contrato: ${error.reason}`)
      } else if (error?.message) {
        toast.error(`Error: ${error.message}`)
      } else {
        toast.error("Error al crear la campaña")
      }
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
            {/* Configuración Blockchain - REQUERIDO para createCampaign */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>⛓️ Configuración ONCHAIN</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractAddress">Dirección del Contrato Core *</Label>
                    <Input
                      id="contractAddress"
                      value={formData.contractAddress}
                      onChange={(e) => handleInputChange("contractAddress", e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipfs_hash">Hash IPFS de Documentación *</Label>
                  <Input
                    id="ipfs_hash"
                    value={formData.ipfs_hash}
                    onChange={(e) => handleInputChange("ipfs_hash", e.target.value)}
                    placeholder="QmXxx... o bafyxxx..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    CID de IPFS con toda la documentación del proyecto
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_total">Monto Total (Goal) *</Label>
                    <Input
                      id="monto_total"
                      type="number"
                      value={formData.monto_total}
                      onChange={(e) => handleInputChange("monto_total", e.target.value)}
                      placeholder="1000000"
                      required
                    />
                    <p className="text-xs text-muted-foreground">En {formData.moneda}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cantidad_certificados">Cantidad de Certificados *</Label>
                    <Input
                      id="cantidad_certificados"
                      type="number"
                      value={formData.cantidad_certificados}
                      onChange={(e) => handleInputChange("cantidad_certificados", e.target.value)}
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda</Label>
                    <Select value={formData.moneda} onValueChange={(value) => handleInputChange("moneda", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starts_at_days">Inicio (días desde ahora)</Label>
                    <Input
                      id="starts_at_days"
                      type="number"
                      value={formData.starts_at_days}
                      onChange={(e) => handleInputChange("starts_at_days", e.target.value)}
                      placeholder="1"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_days">Duración (días)</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) => handleInputChange("duration_days", e.target.value)}
                      placeholder="30"
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificate_proof">Hash IPFS Certificado</Label>
                    <Input
                      id="certificate_proof"
                      value={formData.certificate_proof}
                      onChange={(e) => handleInputChange("certificate_proof", e.target.value)}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Description - Para Backend */}
            <Card>
              <CardHeader>
                <CardTitle>Descripción del Proyecto general</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizador">Organizador/Constructora</Label>
                    <Input
                      id="organizador"
                      value={formData.organizador}
                      onChange={(e) => handleInputChange("organizador", e.target.value)}
                      placeholder="Ej: Constructora Premium SA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange("direccion", e.target.value)}
                      placeholder="Ej: Av. Santa Fe 3500, Palermo, CABA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Descripción detallada del proyecto..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentabilidad_esperada">Rentabilidad Esperada</Label>
                    <Input
                      id="rentabilidad_esperada"
                      value={formData.rentabilidad_esperada}
                      onChange={(e) => handleInputChange("rentabilidad_esperada", e.target.value)}
                      placeholder="12-16%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renta_garantizada">Renta Garantizada</Label>
                    <Input
                      id="renta_garantizada"
                      value={formData.renta_garantizada}
                      onChange={(e) => handleInputChange("renta_garantizada", e.target.value)}
                      placeholder="12% anual"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plazo_renta">Plazo de Renta</Label>
                    <Input
                      id="plazo_renta"
                      value={formData.plazo_renta}
                      onChange={(e) => handleInputChange("plazo_renta", e.target.value)}
                      placeholder="24 meses"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_actual_obra">Estado Actual</Label>
                  <Input
                    id="estado_actual_obra"
                    value={formData.estado_actual_obra}
                    onChange={(e) => handleInputChange("estado_actual_obra", e.target.value)}
                    placeholder="Fase de construcción"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Configuration - Para Backend */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración Adicional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emisor_id">Emisor</Label>
                    <Select value={formData.emisor_id} onValueChange={(value) => handleInputChange("emisor_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emisor-001">BrickChain Capital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desarrollador_id">Desarrollador</Label>
                    <Select
                      value={formData.desarrollador_id}
                      onValueChange={(value) => handleInputChange("desarrollador_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dev-001">Constructora Premium SA</SelectItem>
                        <SelectItem value="dev-002">Desarrollos Urbanos SRL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditor_id">Auditor</Label>
                    <Select
                      value={formData.auditor_id}
                      onValueChange={(value) => handleInputChange("auditor_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audit-001">PropTech Auditors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_minimo">Soft Cap</Label>
                    <Input
                      id="monto_minimo"
                      type="number"
                      value={formData.monto_minimo}
                      onChange={(e) => handleInputChange("monto_minimo", e.target.value)}
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket_minimo">Ticket Mínimo</Label>
                    <Input
                      id="ticket_minimo"
                      type="number"
                      value={formData.ticket_minimo}
                      onChange={(e) => handleInputChange("ticket_minimo", e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvalPolicy">Política de Aprobación</Label>
                    <Select
                      value={formData.approvalPolicy}
                      onValueChange={(value) => handleInputChange("approvalPolicy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMISOR+AUDITOR">Emisor + Auditor</SelectItem>
                        <SelectItem value="AUDITOR_SOLO">Solo Auditor</SelectItem>
                        <SelectItem value="MAYORIA_2_DE_3">Mayoría 2 de 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild disabled={isLoading}>
                <Link href="/admin/projects">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Creando en Blockchain..." : "Crear Proyecto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleGuard>
  )
}