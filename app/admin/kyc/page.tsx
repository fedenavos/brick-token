"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConnectBar } from "@/components/connect-bar"
import { RoleGuard } from "@/components/role-guard"
import { DataTable } from "@/components/data-table"
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react"
import toast from "react-hot-toast"

// Mock KYC data
const mockKycData = [
  {
    id: "inv-001",
    address: "0x5555666677778888555566667777888855556666",
    nombre: "Juan Pérez",
    email: "juan.perez@email.com",
    kyc_status: "PENDIENTE" as const,
    fecha_solicitud: "2024-01-15T10:00:00Z",
    documentos: ["DNI", "Comprobante de ingresos"],
  },
  {
    id: "inv-002",
    address: "0x7777888899990000777788889999000077778888",
    nombre: "María González",
    email: "maria.gonzalez@email.com",
    kyc_status: "APROBADO" as const,
    fecha_solicitud: "2024-01-10T14:30:00Z",
    fecha_aprobacion: "2024-01-12T09:15:00Z",
    documentos: ["DNI", "Comprobante de ingresos", "Comprobante de domicilio"],
  },
  {
    id: "inv-003",
    address: "0x9999000011112222999900001111222299990000",
    nombre: "Carlos Rodríguez",
    email: "carlos.rodriguez@email.com",
    kyc_status: "RECHAZADO" as const,
    fecha_solicitud: "2024-01-08T16:45:00Z",
    fecha_rechazo: "2024-01-09T11:20:00Z",
    motivo_rechazo: "Documentación incompleta",
    documentos: ["DNI"],
  },
]

export default function AdminKycPage() {
  const [kycData, setKycData] = useState(mockKycData)

  const handleKycAction = async (investorId: string, action: "APROBADO" | "RECHAZADO") => {
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setKycData((prev) =>
        prev.map((investor) =>
          investor.id === investorId
            ? {
                ...investor,
                kyc_status: action,
                ...(action === "APROBADO"
                  ? { fecha_aprobacion: new Date().toISOString() }
                  : { fecha_rechazo: new Date().toISOString(), motivo_rechazo: "Revisión manual" }),
              }
            : investor,
        ),
      )

      toast.success(`KYC ${action.toLowerCase()} exitosamente`)
    } catch (error) {
      toast.error("Error al procesar KYC")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APROBADO":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "RECHAZADO":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-secondary" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APROBADO":
        return "bg-green-500 text-white"
      case "RECHAZADO":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const columns = [
    {
      header: "Inversor",
      accessorKey: "investor",
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.nombre}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {row.original.address.slice(0, 6)}...{row.original.address.slice(-4)}
          </div>
        </div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "kyc_status",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.kyc_status)}
          <Badge className={getStatusColor(row.original.kyc_status)}>{row.original.kyc_status}</Badge>
        </div>
      ),
    },
    {
      header: "Documentos",
      accessorKey: "documentos",
      cell: ({ row }: any) => (
        <div className="text-sm">
          {row.original.documentos.length} documento{row.original.documentos.length !== 1 ? "s" : ""}
          <div className="text-xs text-muted-foreground">{row.original.documentos.join(", ")}</div>
        </div>
      ),
    },
    {
      header: "Fecha Solicitud",
      accessorKey: "fecha_solicitud",
      cell: ({ row }: any) => (
        <div className="text-sm">{new Date(row.original.fecha_solicitud).toLocaleDateString()}</div>
      ),
    },
    {
      header: "Acciones",
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          {row.original.kyc_status === "PENDIENTE" && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => handleKycAction(row.original.id, "APROBADO")}
                className="gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Aprobar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleKycAction(row.original.id, "RECHAZADO")}
                className="gap-1"
              >
                <XCircle className="h-3 w-3" />
                Rechazar
              </Button>
            </>
          )}
          {row.original.kyc_status !== "PENDIENTE" && (
            <div className="text-sm text-muted-foreground">
              {row.original.kyc_status === "APROBADO" && row.original.fecha_aprobacion && (
                <div>Aprobado: {new Date(row.original.fecha_aprobacion).toLocaleDateString()}</div>
              )}
              {row.original.kyc_status === "RECHAZADO" && (
                <div>
                  <div>Rechazado: {new Date(row.original.fecha_rechazo).toLocaleDateString()}</div>
                  {row.original.motivo_rechazo && <div className="text-xs">Motivo: {row.original.motivo_rechazo}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
  ]

  const pendingCount = kycData.filter((investor) => investor.kyc_status === "PENDIENTE").length
  const approvedCount = kycData.filter((investor) => investor.kyc_status === "APROBADO").length
  const rejectedCount = kycData.filter((investor) => investor.kyc_status === "RECHAZADO").length

  return (
    <RoleGuard requiredRole="admin" userRole="admin">
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  Gestión de KYC
                </h1>
                <p className="text-muted-foreground">Administra las verificaciones de identidad de los inversores</p>
              </div>
              <ConnectBar />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                    <p className="text-2xl font-bold text-secondary">{pendingCount}</p>
                  </div>
                  <Clock className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aprobados</p>
                    <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rechazados</p>
                    <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* KYC Table */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de KYC ({kycData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={kycData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
