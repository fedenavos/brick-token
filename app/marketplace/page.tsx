"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProjectCard } from "@/components/project-card"
import { ConnectBar } from "@/components/connect-bar"
import { Search, Filter, X } from "lucide-react"
import { useProjects } from "@/lib/hooks/use-projects"
import type { ProjectCard as ProjectCardType } from "@/lib/types"

const estadoOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "RECAUDACION", label: "Recaudando" },
  { value: "EN_EJECUCION", label: "En Ejecución" },
  { value: "FINALIZADO", label: "Completado" },
]

const cityOptions = [
  { value: "all", label: "Todas las ciudades" },
  { value: "Buenos Aires", label: "Buenos Aires" },
  { value: "Rosario", label: "Rosario" },
  { value: "Córdoba", label: "Córdoba" },
  { value: "Tigre", label: "Tigre" },
]

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEstado, setSelectedEstado] = useState("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [minTicketFilter, setMinTicketFilter] = useState("")

  const { data: projects, isLoading, error } = useProjects()

  const filteredProjects = useMemo(() => {
    if (!projects) return []

    return projects.filter((project: any) => {
      const projectCard: ProjectCardType = {
        projectId: project.id,
        name: project.descripcion?.titulo || project.name || "Sin título",
        coverUrl: project.descripcion?.imagen_principal || "/placeholder.svg?height=300&width=400",
        city: project.descripcion?.direccion?.split(",")[0] || "Sin ciudad",
        estado: project.estado,
        softCap: project.monto_minimo,
        hardCap: project.monto_total,
        raised: project.raised || "0",
        minTicket: project.ticket_minimo,
        roiEst: project.descripcion?.rentabilidad_esperada || "0%",
        chainId: project.chainId,
        contractAddress: project.contractAddress,
      }

      const matchesSearch = projectCard.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEstado = selectedEstado === "all" || projectCard.estado === selectedEstado
      const matchesCity = selectedCity === "all" || projectCard.city.includes(selectedCity)
      const matchesMinTicket =
        !minTicketFilter || Number.parseFloat(projectCard.minTicket) >= Number.parseFloat(minTicketFilter)

      return matchesSearch && matchesEstado && matchesCity && matchesMinTicket
    })
  }, [projects, searchTerm, selectedEstado, selectedCity, minTicketFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedEstado("all")
    setSelectedCity("all")
    setMinTicketFilter("")
  }

  const hasActiveFilters = searchTerm || selectedEstado !== "all" || selectedCity !== "all" || minTicketFilter

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <ConnectBar />
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-48 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <ConnectBar />
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-4xl">⚠️</div>
                <h3 className="text-xl font-semibold">Error al cargar proyectos</h3>
                <p className="text-muted-foreground">
                  No se pudieron cargar los proyectos. Por favor, intenta nuevamente.
                </p>
                <Button onClick={() => window.location.reload()}>Reintentar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <ConnectBar />

        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Marketplace de Proyectos</h1>
            <p className="text-muted-foreground">Descubre y invierte en proyectos inmobiliarios tokenizados</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Estado Filter */}
              <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado del proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Min Ticket Filter */}
              <Input
                type="number"
                placeholder="Ticket mínimo ($)"
                value={minTicketFilter}
                onChange={(e) => setMinTicketFilter(e.target.value)}
              />
            </div>

            {/* Active Filters & Clear */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Búsqueda: {searchTerm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                  </Badge>
                )}
                {selectedEstado !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Estado: {estadoOptions.find((o) => o.value === selectedEstado)?.label}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedEstado("all")} />
                  </Badge>
                )}
                {selectedCity !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Ciudad: {selectedCity}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCity("all")} />
                  </Badge>
                )}
                {minTicketFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Min: ${minTicketFilter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setMinTicketFilter("")} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-2">
                  Limpiar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? "s" : ""} encontrado
              {filteredProjects.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="text-4xl">🏗️</div>
                  <h3 className="text-xl font-semibold">No se encontraron proyectos</h3>
                  <p className="text-muted-foreground">
                    {projects?.length === 0
                      ? "Aún no hay proyectos disponibles en la plataforma"
                      : "Intenta ajustar los filtros para encontrar proyectos que coincidan con tus criterios"}
                  </p>
                  {hasActiveFilters && <Button onClick={clearFilters}>Limpiar filtros</Button>}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.projectId} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
