"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RoleGuard } from "@/components/role-guard"
import { ConnectBar } from "@/components/connect-bar"
import { useWeb3Integration } from "@/lib/hooks/use-web3-integration"
import { Building, Users, FileText, CheckCircle, DollarSign, Shield } from "lucide-react"
import Link from "next/link"

const adminStats = [
  {
    title: "Proyectos Activos",
    value: "12",
    icon: Building,
    color: "text-primary",
    href: "/admin/projects",
  },
  {
    title: "Total Inversores",
    value: "850",
    icon: Users,
    color: "text-secondary",
    href: "/admin/kyc",
  },
  {
    title: "Hitos Pendientes",
    value: "8",
    icon: FileText,
    color: "text-orange-500",
    href: "/admin/milestones",
  },
  {
    title: "Aprobaciones Requeridas",
    value: "3",
    icon: CheckCircle,
    color: "text-green-500",
    href: "/admin/approvals",
  },
  {
    title: "Fondos Gestionados",
    value: "$5.2M",
    icon: DollarSign,
    color: "text-primary",
    href: "/admin/disbursements",
  },
  {
    title: "KYC Pendientes",
    value: "24",
    icon: Shield,
    color: "text-red-500",
    href: "/admin/kyc",
  },
]

const quickActions = [
  {
    title: "Crear Nuevo Proyecto",
    description: "Configurar un nuevo proyecto inmobiliario",
    href: "/admin/projects/new",
    icon: Building,
    color: "bg-primary text-primary-foreground",
  },
  {
    title: "Gestionar Actores",
    description: "Administrar emisores, desarrolladores y auditores",
    href: "/admin/actors",
    icon: Users,
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: "Revisar Hitos",
    description: "Aprobar o rechazar hitos de proyectos",
    href: "/admin/milestones",
    icon: CheckCircle,
    color: "bg-green-500 text-white",
  },
  {
    title: "Procesar KYC",
    description: "Revisar solicitudes de verificación",
    href: "/admin/kyc",
    icon: Shield,
    color: "bg-orange-500 text-white",
  },
]

export default function AdminDashboard() {
  const { userRole } = useWeb3Integration()

  return (
    <RoleGuard requiredRole="admin" userRole={userRole}>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* ConnectBar */}
          <ConnectBar />

          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">Gestiona proyectos, actores y aprobaciones del portal</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminStats.map((stat) => (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href={stat.href}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <p className="text-sm text-muted-foreground">Accede rápidamente a las funciones más utilizadas</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Card key={action.title} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <action.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{action.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                          <Button asChild size="sm">
                            <Link href={action.href}>Acceder</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Hito 2 del Proyecto Palermo aprobado</p>
                    <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nueva inversión de $5,000 USDC</p>
                    <p className="text-xs text-muted-foreground">Hace 4 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <Shield className="h-5 w-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">KYC aprobado para inversor 0x5555...6666</p>
                    <p className="text-xs text-muted-foreground">Hace 6 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}
