"use client";

import type React from "react";
import { useActiveAccount } from "thirdweb/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { ConnectBar } from "@/components/connect-bar";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: string;
  userRole?: string;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRole,
  userRole,
  fallback,
}: RoleGuardProps) {
  const account = useActiveAccount();
  const address = account?.address;

  const hasRole = userRole === requiredRole || userRole === "admin";

  if (!address) {
    return (
      <div className="space-y-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Conecta tu wallet para acceder a esta seccion.
          </AlertDescription>
        </Alert>
        <ConnectBar />
      </div>
    );
  }

  if (!hasRole) {
    return (
      fallback || (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta seccion. Rol requerido: {" "}
            {requiredRole}
          </AlertDescription>
        </Alert>
      )
    );
  }

  return <>{children}</>;
}
