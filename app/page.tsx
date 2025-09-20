import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, TrendingUp, Shield, Users, Mail } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

async function getProjectStats() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/projects`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch")
    }

    const projects = await response.json()

    const totalProjects = projects.length
    const totalTokenized = projects.reduce((sum: number, p: any) => sum + Number.parseFloat(p.raised || "0"), 0)
    const activeInvestors = projects.reduce((sum: number, p: any) => sum + (p.investors || 0), 0)
    const averageROI =
      projects.length > 0
        ? projects.reduce((sum: number, p: any) => {
            const roi = p.descripcion?.rentabilidad_esperada || "0%"
            return sum + Number.parseFloat(roi.replace("%", ""))
          }, 0) / projects.length
        : 0

    return {
      totalProjects,
      totalTokenized,
      activeInvestors,
      averageROI,
    }
  } catch (error) {
    // Fallback to default values if API fails
    return {
      totalProjects: 0,
      totalTokenized: 0,
      activeInvestors: 0,
      averageROI: 0,
    }
  }
}

export default async function HomePage() {
  const stats = await getProjectStats()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">
              Lanza tu plataforma de <span className="text-primary">tokenización inmobiliaria</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              BrickForge te permite crear y gestionar tu propia plataforma de tokenización de bienes raíces con
              tecnología blockchain de última generación
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/marketplace">Ver Proyectos</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="#contacto">Solicitar Demo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <Card>
              <CardContent className="p-6 text-center">
                <Building className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalProjects}+</div>
                <div className="text-sm text-muted-foreground">Proyectos Activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                <div className="text-2xl font-bold">${(stats.totalTokenized / 1000000).toFixed(1)}M+</div>
                <div className="text-sm text-muted-foreground">Tokenizado</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.activeInvestors}+</div>
                <div className="text-sm text-muted-foreground">Inversores Activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.averageROI.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">ROI Promedio</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">¿Por qué elegir BrickForge?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              La plataforma más completa para crear tu ecosistema de tokenización inmobiliaria
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Tecnología Probada</h3>
                <p className="text-muted-foreground">
                  Smart contracts auditados y arquitectura escalable para manejar millones en tokenización
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <TrendingUp className="h-12 w-12 text-secondary-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Lanzamiento Rápido</h3>
                <p className="text-muted-foreground">
                  Desde concepto hasta plataforma funcionando en menos de 30 días con soporte completo
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Personalización Total</h3>
                <p className="text-muted-foreground">
                  Adapta cada aspecto de la plataforma a tu marca y necesidades específicas
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Lanza tu plataforma de tokenización hoy</h2>
            <p className="text-xl text-muted-foreground text-balance">
              Completa el formulario y nuestro equipo te contactará en menos de 24 horas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium mb-2">
                        Nombre *
                      </label>
                      <Input id="nombre" placeholder="Tu nombre" required />
                    </div>
                    <div>
                      <label htmlFor="apellido" className="block text-sm font-medium mb-2">
                        Apellido *
                      </label>
                      <Input id="apellido" placeholder="Tu apellido" required />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <Input id="email" type="email" placeholder="tu@email.com" required />
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-medium mb-2">
                      Empresa
                    </label>
                    <Input id="empresa" placeholder="Nombre de tu empresa" />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium mb-2">
                      Teléfono
                    </label>
                    <Input id="telefono" placeholder="+1 (555) 123-4567" />
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium mb-2">
                      Cuéntanos sobre tu proyecto *
                    </label>
                    <Textarea
                      id="mensaje"
                      placeholder="Describe tu visión, mercado objetivo, y cómo podemos ayudarte..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Solicitar Demo Personalizada
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Hablemos de tu proyecto</h3>
                <p className="text-muted-foreground mb-8">
                  Nuestro equipo de expertos está listo para ayudarte a crear la plataforma de tokenización perfecta
                  para tu negocio inmobiliario.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">hello@brickforge.io</div>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h4 className="font-semibold mb-2">¿Qué incluye la demo?</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Revisión de tu modelo de negocio</li>
                    <li>• Demo personalizada de la plataforma</li>
                    <li>• Roadmap de implementación</li>
                    <li>• Propuesta comercial detallada</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* grid col-2 */}
        </div>
        {/* max-w-4xl */}
      </section>
    </div>
  )
}
