"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectBar } from "@/components/connect-bar";
import { FundingProgress } from "@/components/funding-progress";
import { MilestonesStepper } from "@/components/milestones-stepper";
import { InvestPanel } from "@/components/invest-panel";
import { OnChainTimeline } from "@/components/on-chain-timeline";
import { MyContributions } from "@/components/my-contributions";
import { EvidenceGallery } from "@/components/evidence-gallery";
import { useProject } from "@/lib/hooks/use-projects";
import { MapPin, Building, Calendar, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProjectDetailPageProps {
  params: { projectId: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = params;
  const { data: project, isLoading, error } = useProject(projectId);

  const addresses = {
    core: process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS as `0x${string}`,
    usdt: "0xe6a583AAcdDA1AD92F88C7fC564B6E594bf8c6F5" as `0x${string}`,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 bg-muted rounded" />
                <div className="h-96 bg-muted rounded" />
              </div>
              <div className="h-96 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-4xl">🏗️</div>
                <h3 className="text-xl font-semibold">
                  Proyecto no encontrado
                </h3>
                <p className="text-muted-foreground">
                  El proyecto que buscas no existe o no está disponible en este
                  momento
                </p>
                <Button asChild>
                  <Link href="/marketplace">Volver al Marketplace</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "RECAUDACION":
        return "bg-primary text-primary-foreground";
      case "EN_EJECUCION":
        return "bg-secondary text-secondary-foreground";
      case "FINALIZADO":
        return "bg-green-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "RECAUDACION":
        return "Recaudando Fondos";
      case "EN_EJECUCION":
        return "En Ejecución";
      case "FINALIZADO":
        return "Proyecto Completado";
      case "BORRADOR":
        return "En Borrador";
      default:
        return estado;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/marketplace" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al Marketplace
              </Link>
            </Button>
          </div>
          <ConnectBar />
        </div>

        {/* Hero Section */}
        <Card>
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={
                  project.coverUrl || "/placeholder.svg?height=400&width=800"
                }
                alt={project.name}
                className="w-full h-64 md:h-80 object-cover rounded-t-lg"
              />
              <Badge
                className={`absolute top-4 right-4 ${getStatusColor(
                  project.estado
                )}`}
              >
                {getStatusText(project.estado)}
              </Badge>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-balance">
                    {project.name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{project.descripcion.direccion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>
                      Desarrollado por {project.descripcion.organizador}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <TrendingUp className="h-3 w-3" />
                    ROI: {project.roiEst}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {project.descripcion.plazo_renta}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {project.descripcion.renta_garantizada}
                  </Badge>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ${Number.parseFloat(project.raised).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Recaudado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{project.investors}</div>
                  <div className="text-sm text-muted-foreground">
                    Inversores
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ${Number.parseFloat(project.minTicket).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ticket Mínimo
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {project.proyecto.cantidad_etapas}
                  </div>
                  <div className="text-sm text-muted-foreground">Etapas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Funding Progress */}
            <FundingProgress
              raised={project.raised}
              softCap={project.softCap}
              hardCap={project.hardCap}
              investors={project.investors}
              currency={project.proyecto.moneda}
            />

            {/* Project Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="milestones">Hitos</TabsTrigger>
                <TabsTrigger value="evidence">Evidencias</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Descripción del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {project.descripcion.descripcion}
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Detalles Financieros
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Rentabilidad Esperada:
                            </span>
                            <span className="font-medium">
                              {project.descripcion.rentabilidad_esperada}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Renta Garantizada:
                            </span>
                            <span className="font-medium">
                              {project.descripcion.renta_garantizada}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Plazo de Renta:
                            </span>
                            <span className="font-medium">
                              {project.descripcion.plazo_renta}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Estado de la Obra
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {project.descripcion.estado_actual_obra}
                        </p>

                        <h4 className="font-semibold mb-2 mt-4">
                          Actores del Proyecto
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Emisor:
                            </span>
                            <span className="font-medium">
                              {project.actores.emisor.nombre}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Desarrollador:
                            </span>
                            <span className="font-medium">
                              {project.actores.desarrollador.nombre}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Auditor:
                            </span>
                            <span className="font-medium">
                              {project.actores.auditor.nombre}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="milestones">
                <MilestonesStepper
                  hitos={project.hitos}
                  approvalPolicy={project.proyecto.approvalPolicy}
                  userRole="investor"
                />
              </TabsContent>

              <TabsContent value="evidence">
                <EvidenceGallery
                  projectId={project.projectId}
                  hitos={project.hitos}
                  userRole="investor"
                />
              </TabsContent>

              <TabsContent value="timeline">
                <OnChainTimeline events={project.events} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Panel */}
            <InvestPanel
              projectId={projectId}
              campaignId={project.campaignId}
              minTicket={String(project.minTicket)}
              currency="mUSDT"
              estado={project.estado} // debe ser "RECAUDACION" para habilitar el botón
              kycStatus="APROBADO" // mock; en real usar hook de KYC
              addresses={addresses}
            />

            {/* My Contributions */}
            <MyContributions
              projectId={project.projectId}
              userAddress="0xEA291d30d8CC9D9f113BA5bd99966228f7E8D556" // Mock user address
            />
          </div>
        </div>
      </div>
    </div>
  );
}
