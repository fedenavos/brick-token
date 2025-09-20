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
import { useProjects } from "@/lib/hooks/use-projects"

export default function AdminProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: projects, isLoading, error } = useProjects()

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
          <div className="font-medium">{row.original.descripcion?.titulo || row.original.name || "Sin título"}</div>
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
        const raised = Number.parseFloat(row.original.raised || "0")
        const total = Number.parseFloat(row.original.monto_total || "0")
        const progress = total > 0 ? (raised / total) * 100 : 0
        return (
          <div>
            <div className="text-sm font-medium">
              ${raised.toLocaleString()} / ${total.toLocaleString()}
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

  const filteredProjects = (projects || []).filter((project: any) =>
    (project.descripcion?.titulo || project.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <RoleGuard requiredRole="admin" userRole="admin">
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-48 bg-muted rounded" />
              <div className="h-96 bg-muted rounded" />
            </div>
          </div>
        </div>
      </RoleGuard>
    )
  }

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
              {error ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Error al cargar proyectos</p>
                  <Button onClick={() => window.location.reload()} className="mt-2">
                    Reintentar
                  </Button>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredProjects} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
