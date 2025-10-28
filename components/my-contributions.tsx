"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Wallet, TrendingUp } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";

interface MyContributionsProps {
  projectId: string;
  userAddress?: string;
}

// Mock contributions data
const mockContributions = [
  {
    id: "aporte-001",
    monto: "100",
    moneda: "mUSDT",
    tx_hash: "0x1111222233334444111122223333444411112222",
    fecha: "2024-02-01T12:00:00Z",
    estado: "CONFIRMADO" as const,
  },
  // {
  //   id: "aporte-002",
  //   monto: "2500",
  //   moneda: "mUSDT",
  //   tx_hash: "0x2222333344445555222233334444555522223333",
  //   fecha: "2024-02-15T15:30:00Z",
  //   estado: "CONFIRMADO" as const,
  // },
];

export function MyContributions({
  projectId,
  userAddress,
}: MyContributionsProps) {
  const account = useActiveAccount();
  const address = account?.address;
  const connectedAddress = address || userAddress;

  if (!connectedAddress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Mis Aportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Conecta tu wallet para ver tus aportes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalInvested = mockContributions.reduce(
    (sum, contrib) => sum + Number.parseFloat(contrib.monto),
    0
  );

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "CONFIRMADO":
        return "bg-green-500 text-white";
      case "PENDIENTE":
        return "bg-secondary text-secondary-foreground";
      case "REEMBOLSADO":
        return "bg-blue-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case "CONFIRMADO":
        return "Confirmado";
      case "PENDIENTE":
        return "Pendiente";
      case "REEMBOLSADO":
        return "Reembolsado";
      default:
        return estado;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Mis Aportes
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Total invertido:{" "}
          <span className="font-semibold text-primary">
            ${totalInvested.toLocaleString()} mUSDT
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockContributions.length === 0 ? (
          <div className="text-center py-6">
            <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Aún no has invertido en este proyecto
            </p>
            <Button size="sm">Realizar primera inversión</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {mockContributions.map((contribution) => (
              <div
                key={contribution.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      ${Number.parseFloat(contribution.monto).toLocaleString()}{" "}
                      {contribution.moneda}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(contribution.fecha).toLocaleDateString(
                        "es-AR",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(contribution.estado)}>
                    {getStatusText(contribution.estado)}
                  </Badge>
                </div>

                {contribution.tx_hash && (
                  <div className="flex items-center justify-between text-sm">
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {contribution.tx_hash.slice(0, 10)}...
                      {contribution.tx_hash.slice(-8)}
                    </code>
                    <a
                      href={`https://polygonscan.com/tx/${contribution.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      Ver TX
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}

            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total de aportes:</span>
                <span className="font-semibold">
                  {mockContributions.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto total:</span>
                <span className="font-semibold text-primary">
                  ${totalInvested.toLocaleString()} mUSDT
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
