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
import type { ProjectCard as ProjectCardType } from "@/lib/types"

// Mock data - in real app this would come from API/contract
const mockProjects: ProjectCardType[] = [
  {
    projectId: "proj-001",
    name: "Complejo Residencial Palermo",
    coverUrl: "/modern-residential-building-palermo.jpg",
    city: "Buenos Aires",
    estado: "RECAUDACION",
    softCap: "500000",
    hardCap: "1000000",
    raised: "650000",
    minTicket: "1000",
    roiEst: "12-16%",
    chainId: 137,
    contractAddress: "0x1234567890123456789012345678901234567890",
  },
  {
    projectId: "proj-002",
    name: "Torre Corporativa Puerto Madero",
    coverUrl: "/corporate-tower-puerto-madero.jpg",
    city: "Buenos Aires",
    estado: "EN_EJECUCION",
    softCap: "400000",
    hardCap: "750000",
    raised: "750000",
    minTicket: "500",
    roiEst: "10-14%",
    chainId: 137,
    contractAddress: "0x2345678901234567890123456789012345678901",
  },
  {
    projectId: "proj-003",
    name: "Desarrollo Sustentable Nordelta",
    coverUrl: "/sustainable-residential-development.jpg",
    city: "Tigre",
    estado: "RECAUDACION",
    softCap: "300000",
    hardCap: "600000",
    raised: "180000",
    minTicket: "750",
    roiEst: "15-18%",
    chainId: 137,
    contractAddress: "0x3456789012345678901234567890123456789012",
  },
  {
    projectId: "proj-004",
    name: "Centro Comercial Rosario",
    coverUrl: "/shopping-center-rosario.jpg",
    city: "Rosario",
    estado: "FINALIZADO",
    softCap: "800000",
    hardCap: "1200000",
    raised: "1200000",
    minTicket: "2000",
    roiEst: "16%",
    chainId: 137,
    contractAddress: "0x4567890123456789012345678901234567890123",
  },
]

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

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEstado = selectedEstado === "all" || project.estado === selectedEstado
      const matchesCity = selectedCity === "all" || project.city === selectedCity
      const matchesMinTicket =
        !minTicketFilter || Number.parseFloat(project.minTicket) >= Number.parseFloat(minTicketFilter)

      return matchesSearch && matchesEstado && matchesCity && matchesMinTicket
    })
  }, [searchTerm, selectedEstado, selectedCity, minTicketFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedEstado("all")
    setSelectedCity("all")
    setMinTicketFilter("")
  }

  const hasActiveFilters = searchTerm || selectedEstado !== "all" || selectedCity !== "all" || minTicketFilter

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
                    Intenta ajustar los filtros para encontrar proyectos que coincidan con tus criterios
                  </p>
                  <Button onClick={clearFilters}>Limpiar filtros</Button>
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
