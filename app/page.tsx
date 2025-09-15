import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Building, TrendingUp, Shield, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-balance">
              Invierte en el futuro de los <span className="text-primary">bienes raíces</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              BrickChain Portal te permite invertir en proyectos inmobiliarios tokenizados con transparencia blockchain
              y seguimiento en tiempo real
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/marketplace">Explorar Proyectos</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/admin">Panel de Administración</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <Card>
              <CardContent className="p-6 text-center">
                <Building className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">12+</div>
                <div className="text-sm text-muted-foreground">Proyectos Activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold">$5.2M</div>
                <div className="text-sm text-muted-foreground">Invertido</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">850+</div>
                <div className="text-sm text-muted-foreground">Inversores</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-secondary mx-auto mb-2" />
                <div className="text-2xl font-bold">14.2%</div>
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
            <h2 className="text-3xl md:text-4xl font-bold">¿Por qué elegir BrickChain?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Combinamos la solidez de los bienes raíces con la transparencia de blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Transparencia Total</h3>
                <p className="text-muted-foreground">
                  Seguimiento en tiempo real de cada hito del proyecto con evidencias verificadas en blockchain
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Rentabilidad Atractiva</h3>
                <p className="text-muted-foreground">
                  Accede a proyectos inmobiliarios premium con tickets mínimos accesibles y retornos competitivos
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <Building className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Proyectos Verificados</h3>
                <p className="text-muted-foreground">
                  Todos los proyectos pasan por un riguroso proceso de due diligence y auditoría continua
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">
            Comienza a invertir en bienes raíces tokenizados
          </h2>
          <p className="text-xl text-muted-foreground text-balance">
            Únete a cientos de inversores que ya están construyendo su patrimonio inmobiliario
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/marketplace">Ver Proyectos Disponibles</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
