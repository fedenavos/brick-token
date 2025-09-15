"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, TrendingUp, DollarSign } from "lucide-react"
import type { ProjectCard as ProjectCardType } from "@/lib/types"
import Link from "next/link"

interface ProjectCardProps {
  project: ProjectCardType
}

export function ProjectCard({ project }: ProjectCardProps) {
  const fundingPercentage = (Number.parseFloat(project.raised) / Number.parseFloat(project.hardCap)) * 100

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "RECAUDACION":
        return "bg-primary text-primary-foreground"
      case "EN_EJECUCION":
        return "bg-secondary text-secondary-foreground"
      case "FINALIZADO":
        return "bg-green-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "RECAUDACION":
        return "Recaudando"
      case "EN_EJECUCION":
        return "En Ejecución"
      case "FINALIZADO":
        return "Completado"
      case "BORRADOR":
        return "Borrador"
      default:
        return estado
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative">
          <img
            src={project.coverUrl || "/placeholder.svg"}
            alt={project.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge className={`absolute top-3 right-3 ${getStatusColor(project.estado)}`}>
            {getStatusText(project.estado)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-balance group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          {project.city && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {project.city}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium">{fundingPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={fundingPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>${project.raised}</span>
            <span>${project.hardCap}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Ticket mín.</div>
              <div className="text-sm font-medium">${project.minTicket}</div>
            </div>
          </div>
          {project.roiEst && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <div>
                <div className="text-xs text-muted-foreground">ROI Est.</div>
                <div className="text-sm font-medium">{project.roiEst}</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/projects/${project.projectId}`}>Ver Proyecto</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
