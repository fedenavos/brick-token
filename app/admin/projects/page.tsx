"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConnectBar } from "@/components/connect-bar"
import { RoleGuard } from "@/components/role-guard"
import { DataTable } from "@/components/data-table"
import { Building, Plus, Search, Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

// Mock data
const mockProjects = [
  {
    id: "proj-001",
    proyecto_descripcion_id: "desc-001",
    emisor_id: "emisor-001",
    desarrollador_id: "dev-001",
    auditor_id: "audit-001",
    chainId: 137,
    contractAddress: "0x1234567890123456789012345678901234567890" as const,
    moneda: "USDC" as const,
    monto_total: "1000000",
    monto_minimo: "500000",
    ticket_minimo: "1000",
    cantidad_etapas: 4,
    renta_garantizada: "12-15%",
    plazo_renta: "24 meses",
    estado: "RECAUDACION" as const,
    approvalPolicy: "EMISOR+AUDITOR" as const,
    createdAt: "2024-01-15T10:00:00Z",
    name: "Complejo Residencial Palermo",
    raised: "650000",
  },
  {
    id: "proj-002",
    proyecto_descripcion_id: "desc-002",
    emisor_id: "emisor-001",
    desarrollador_id: "dev-002",
    auditor_id: "audit-001",
    chainId: 137,
    contractAddress: "0x2345678901234567890123456789012345678901" as const,
    moneda: "USDC" as const,
    monto_total: "750000",
    monto_minimo: "400000",
    ticket_minimo: "500",
    cantidad_etapas: 3,
    renta_garantizada: "10-14%",
    plazo_renta: "18 meses",
    estado: "EN_EJECUCION" as const,
    approvalPolicy: "AUDITOR_SOLO" as const,
    createdAt: "2024-01-10T10:00:00Z",
    name: "Torre Corporativa Puerto Madero",
    raised: "750000",
  },
]

export default function AdminProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "RECAUDACION":
        return "bg-primary text-primary-foreground"
      case "EN_EJECUCION":
        return "bg-secondary text-secondary-foreground"
      case "FINALIZADO":
        return "bg-green-500 text-white"
      case "BORRADOR":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const columns = [
    {
      header: "Proyecto",
      accessorKey: "name",
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">ID: {row.original.id}</div>
        </div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "estado",
      cell: ({ row }: any) => <Badge className={getStatusColor(row.original.estado)}>{row.original.estado}</Badge>,
    },
    {
      header: "Financiamiento",
      accessorKey: "funding",
      cell: ({ row }: any) => {
        const progress = (Number.parseFloat(row.original.raised) / Number.parseFloat(row.original.monto_total)) * 100
        return (
          <div>
            <div className="text-sm font-medium">
              ${Number.parseFloat(row.original.raised).toLocaleString()} / $
              {Number.parseFloat(row.original.monto_total).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">{progress.toFixed(1)}% completado</div>
          </div>
        )
      },
    },
    {
      header: "Política",
      accessorKey: "approvalPolicy",
      cell: ({ row }: any) => <Badge variant="outline">{row.original.approvalPolicy}</Badge>,
    },
    {
      header: "Creado",
      accessorKey: "createdAt",
      cell: ({ row }: any) => <div className="text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</div>,
    },
    {
      header: "Acciones",
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/projects/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/admin/projects/${row.original.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const filteredProjects = mockProjects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <RoleGuard requiredRole="admin" userRole="admin">
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Building className="h-8 w-8 text-primary" />
                  Gestión de Proyectos
                </h1>
                <p className="text-muted-foreground">Administra todos los proyectos inmobiliarios del portal</p>
              </div>
              <ConnectBar />
            </div>
          </div>

          {/* Actions Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar proyectos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button asChild>
                  <Link href="/admin/projects/new" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Proyecto
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle>Proyectos ({filteredProjects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={filteredProjects} />
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
