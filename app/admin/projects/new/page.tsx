"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectBar } from "@/components/connect-bar";
import { RoleGuard } from "@/components/role-guard";
import { useWeb3Integration } from "@/lib/hooks/use-web3-integration";
import { ArrowLeft, Building, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  getCoreContract,
  ipfsCidToBytes32,
  toTokenUnits,
} from "@/lib/eth/core";

type CatalogItem = {
  id: string;
  nombre: string;
};

async function saveToBackend(payload: any) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error || `Backend error (${res.status} ${res.statusText})`
    );
  }

  return res.json();
}

export default function NewProjectPage() {
  const { userRole } = useWeb3Integration();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Campos REALES para createCampaign en el contrato
    ipfs_hash: "", // _ipfsHash: documentación del proyecto
    monto_total: "", // _goal: objetivo de recaudación
    starts_at_days: "1", // _startsAt: días desde ahora
    duration_days: "30", // _endsAt: duración en días

    // Campo para AsignarCertificado (se llama después)
    certificate_id: "", // ID del certificado existente a asignar

    // Campos para backend/UI (no van al contrato en createCampaign)
    descripcion: "",
    direccion: "",
    organizador: "",
    rentabilidad_esperada: "",
    renta_garantizada: "",
    plazo_renta: "",
    estado_actual_obra: "",
    emisor_id: "",
    desarrollador_id: "",
    auditor_id: "",
    moneda: "USDC",
    monto_minimo: "",
    ticket_minimo: "",
    approvalPolicy: "",
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID || "11155111",
    contractAddress:
      process.env.NEXT_PUBLIC_CORE_CONTRACT_ADDRESS ||
      "0x8424f5bE942050Ce9cF9c0B00ED55B27e14F6874",
  });
  const [emisores, setEmisores] = useState<CatalogItem[]>([]);
  const [desarrolladores, setDesarrolladores] = useState<CatalogItem[]>([]);
  const [auditores, setAuditores] = useState<CatalogItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalogs() {
      try {
        const [emisorRes, desarrolladorRes, auditorRes] = await Promise.all([
          fetch("/api/catalog/emisores"),
          fetch("/api/catalog/desarrolladores"),
          fetch("/api/catalog/auditores"),
        ]);

        if (!emisorRes.ok || !desarrolladorRes.ok || !auditorRes.ok) {
          throw new Error("Catalogo no disponible");
        }

        const [emisoresData, desarrolladoresData, auditoresData] =
          await Promise.all([
            emisorRes.json(),
            desarrolladorRes.json(),
            auditorRes.json(),
          ]);

        if (!isMounted) return;

        setEmisores(Array.isArray(emisoresData) ? emisoresData : []);
        setDesarrolladores(
          Array.isArray(desarrolladoresData) ? desarrolladoresData : []
        );
        setAuditores(Array.isArray(auditoresData) ? auditoresData : []);
      } catch (err) {
        console.error("Error loading catalogs", err);
        if (!isMounted) return;
        toast.error("No se pudieron cargar los catalogos");
      }
    }

    loadCatalogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (
        !formData.emisor_id ||
        !formData.desarrollador_id ||
        !formData.auditor_id
      ) {
        toast.error("Debe seleccionar Emisor, Desarrollador y Auditor");
        setIsLoading(false);
        return;
      }

      const requiredBlockchainFields = [
        "ipfs_hash",
        "monto_total",
        "contractAddress",
      ];

      const missingFields = requiredBlockchainFields.filter(
        (field) => !formData[field as keyof typeof formData]
      );
      if (missingFields.length > 0) {
        toast.error(`Campos requeridos: ${missingFields.join(", ")}`);
        setIsLoading(false);
        return;
      }

      const montoTotal = Number(formData.monto_total);

      if (montoTotal <= 0) {
        toast.error("El monto total debe ser mayor a 0");
        setIsLoading(false);
        return;
      }

      toast.loading("Conectando al contrato...");
      const core = await getCoreContract(formData.contractAddress);

      const ipfsHashBytes32 = ipfsCidToBytes32(formData.ipfs_hash);
      const goalInTokenUnits = toTokenUnits(montoTotal, 6);

      const now = Math.floor(Date.now() / 1000);
      const parsedStartsAtDays = Number(formData.starts_at_days);
      const startsAtDays =
        Number.isFinite(parsedStartsAtDays) && parsedStartsAtDays >= 0
          ? parsedStartsAtDays
          : 1;
      const parsedDurationDays = Number(formData.duration_days);
      const durationDays =
        Number.isFinite(parsedDurationDays) && parsedDurationDays > 0
          ? parsedDurationDays
          : 30;
      const startsAt = now + startsAtDays * 24 * 60 * 60 + 5 * 60; // Added 5 minutes (5 * 60 seconds)
      const endsAt = startsAt + durationDays * 24 * 60 * 60;

      toast.dismiss();
      toast.loading("Creando campaña en blockchain...");

      const tx = await core.createCampaign(
        ipfsHashBytes32,
        goalInTokenUnits,
        startsAt,
        endsAt
      );

      const receipt = await tx.wait();

      const campaignCreatedEvent = receipt.events?.find(
        (e: any) => e.event === "CampaignCreated"
      );
      const campaignId =
        campaignCreatedEvent?.args?.campaignId?.toString?.() ??
        campaignCreatedEvent?.args?.campaignId ??
        null;

      console.log(receipt);

      toast.dismiss();
      toast.success(`Campaña ${campaignId} creada! Tx: ${receipt.transactionHash}
        `);

      if (formData.certificate_id && campaignId) {
        try {
          toast.loading("Asignando certificado...");
          const certificateId = Number(formData.certificate_id);
          const assignTx = await core.AsignarCertificado(
            certificateId,
            campaignId
          );
          await assignTx.wait();
          toast.dismiss();
          toast.success("Certificado asignado correctamente");
        } catch (certError: any) {
          console.error("Error asignando certificado:", certError);
          toast.error("Campaña creada pero error al asignar certificado");
        }
      }

      // ==== ACA GUARDAMOS EN DB ====
      try {
        toast.loading("Guardando proyecto en base de datos...");

        const payload = {
          descripcion: formData.descripcion,
          direccion: formData.direccion,
          organizador: formData.organizador,
          rentabilidad_esperada: formData.rentabilidad_esperada,
          renta_garantizada: formData.renta_garantizada,
          plazo_renta: formData.plazo_renta,
          estado_actual_obra: formData.estado_actual_obra,
          media_urls: [],

          emisor_id: formData.emisor_id || null,
          desarrollador_id: formData.desarrollador_id || null,
          auditor_id: formData.auditor_id || null,
          chain_id: Number(formData.chainId),
          contract_address: formData.contractAddress,
          moneda: formData.moneda,
          monto_total: Number(formData.monto_total),
          monto_minimo: Number(formData.monto_minimo || 0),
          ticket_minimo: Number(formData.ticket_minimo || 0),
          approval_policy: formData.approvalPolicy || "EMISOR+AUDITOR",
          raised: 0,
          name:
            formData.descripcion?.slice(0, 100) ||
            formData.organizador ||
            "Nuevo Proyecto",

          // Metadata que quizás quieras agregar a la tabla más adelante:
          // campaign_id_onchain: campaignId,
          // tx_hash: receipt.transactionHash,
          // ipfs_cid: formData.ipfs_hash,
        };

        const dbRes = await saveToBackend(payload);

        console.log("Proyecto guardado en DB:", dbRes);

        toast.dismiss();
        toast.success("Proyecto guardado en la base de datos");
      } catch (dbErr: any) {
        console.error("Error guardando en DB:", dbErr);
        toast.dismiss();
        toast.error("Se creó on-chain pero falló guardado en base de datos");
      }
      // ==== FIN GUARDADO DB ====

      router.push("/admin/projects");
    } catch (error: any) {
      console.error("Error:", error);
      toast.dismiss();

      if (error?.reason) {
        toast.error(`Error del contrato: ${error.reason}`);
      } else if (error?.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error al crear la campaña");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard requiredRole="admin" userRole={userRole}>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/admin/projects"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Proyectos
                </Link>
              </Button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Building className="h-8 w-8 text-primary" />
                  Nuevo Proyecto
                </h1>
                <p className="text-muted-foreground">
                  Configura un nuevo proyecto inmobiliario tokenizado
                </p>
              </div>
              <ConnectBar />
            </div>
          </div>

          {/* Alerta informativa */}
          <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold">Proceso de creación:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Se crea la campaña con estado PENDING</li>
                    <li>
                      Admin debe aprobar con approveCampaign() → estado APPROVED
                    </li>
                    <li>Se despliegan contratos Custody y TokenMinter</li>
                    <li>
                      Se configura con configureCampaign() → estado DEPLOYED
                    </li>
                    <li>
                      Se inicia recaudación con startCollecting() → estado
                      COLLECTING
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Configuración Blockchain - PARÁMETROS REALES */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>
                  ⛓️ Configuración Blockchain (createCampaign)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractAddress">
                      Dirección del Contrato Core *
                    </Label>
                    <Input
                      id="contractAddress"
                      value={formData.contractAddress}
                      onChange={(e) =>
                        handleInputChange("contractAddress", e.target.value)
                      }
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chainId">Chain ID</Label>
                    <Select
                      value={formData.chainId}
                      onValueChange={(value) =>
                        handleInputChange("chainId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11155111">
                          Sepolia (11155111)
                        </SelectItem>
                        <SelectItem value="1">Ethereum (1)</SelectItem>
                        <SelectItem value="137">Polygon (137)</SelectItem>
                        <SelectItem value="8453">Base (8453)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipfs_hash">
                    Hash IPFS de Documentación (_ipfsHash) *
                  </Label>
                  <Input
                    id="ipfs_hash"
                    value={formData.ipfs_hash}
                    onChange={(e) =>
                      handleInputChange("ipfs_hash", e.target.value)
                    }
                    placeholder="QmXxx... o bafyxxx..."
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    CID de IPFS con toda la documentación del proyecto
                    (parámetro 1)
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_total">
                      Monto Total - Goal (_goal) *
                    </Label>
                    <Input
                      id="monto_total"
                      type="number"
                      value={formData.monto_total}
                      onChange={(e) =>
                        handleInputChange("monto_total", e.target.value)
                      }
                      placeholder="1000000"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Objetivo de recaudación en {formData.moneda} (parámetro 2)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda (Token)</Label>
                    <Select
                      value={formData.moneda}
                      onValueChange={(value) =>
                        handleInputChange("moneda", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mUSDT">mUSDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starts_at_days">
                      Inicio (_startsAt) - días desde ahora
                    </Label>
                    <Input
                      id="starts_at_days"
                      type="number"
                      value={formData.starts_at_days}
                      onChange={(e) =>
                        handleInputChange("starts_at_days", e.target.value)
                      }
                      placeholder="1"
                      min="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Parámetro 3: timestamp inicio
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_days">
                      Duración (_endsAt) - días
                    </Label>
                    <Input
                      id="duration_days"
                      type="number"
                      value={formData.duration_days}
                      onChange={(e) =>
                        handleInputChange("duration_days", e.target.value)
                      }
                      placeholder="30"
                      min="1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Parámetro 4: timestamp fin
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificate_id">
                    ID del Certificado (opcional)
                  </Label>
                  <Input
                    id="certificate_id"
                    type="number"
                    value={formData.certificate_id}
                    onChange={(e) =>
                      handleInputChange("certificate_id", e.target.value)
                    }
                    placeholder="Ej: 1"
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se asignará después de crear la campaña con
                    AsignarCertificado()
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Descripción del Proyecto - Para Backend */}
            <Card>
              <CardHeader>
                <CardTitle>📄 Descripción del Proyecto (Backend/UI)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizador">
                      Organizador/Constructora
                    </Label>
                    <Input
                      id="organizador"
                      value={formData.organizador}
                      onChange={(e) =>
                        handleInputChange("organizador", e.target.value)
                      }
                      placeholder="Ej: Constructora Premium SA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) =>
                        handleInputChange("direccion", e.target.value)
                      }
                      placeholder="Ej: Av. Santa Fe 3500, Palermo, CABA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) =>
                      handleInputChange("descripcion", e.target.value)
                    }
                    placeholder="Descripción detallada del proyecto..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rentabilidad_esperada">
                      Rentabilidad Esperada
                    </Label>
                    <Input
                      id="rentabilidad_esperada"
                      value={formData.rentabilidad_esperada}
                      onChange={(e) =>
                        handleInputChange(
                          "rentabilidad_esperada",
                          e.target.value
                        )
                      }
                      placeholder="12-16%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renta_garantizada">Renta Garantizada</Label>
                    <Input
                      id="renta_garantizada"
                      value={formData.renta_garantizada}
                      onChange={(e) =>
                        handleInputChange("renta_garantizada", e.target.value)
                      }
                      placeholder="12% anual"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plazo_renta">Plazo de Renta</Label>
                    <Input
                      id="plazo_renta"
                      value={formData.plazo_renta}
                      onChange={(e) =>
                        handleInputChange("plazo_renta", e.target.value)
                      }
                      placeholder="24 meses"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado_actual_obra">Estado Actual</Label>
                  <Input
                    id="estado_actual_obra"
                    value={formData.estado_actual_obra}
                    onChange={(e) =>
                      handleInputChange("estado_actual_obra", e.target.value)
                    }
                    placeholder="Fase de construcción"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuración Adicional - Para Backend */}
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Configuración Adicional (Backend/UI)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emisor_id">Emisor</Label>
                    <Select
                      value={formData.emisor_id}
                      onValueChange={(value) =>
                        handleInputChange("emisor_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {emisores.length > 0 ? (
                          emisores.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-emisores" disabled>
                            No hay emisores disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desarrollador_id">Desarrollador</Label>
                    <Select
                      value={formData.desarrollador_id}
                      onValueChange={(value) =>
                        handleInputChange("desarrollador_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {desarrolladores.length > 0 ? (
                          desarrolladores.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-desarrolladores" disabled>
                            No hay desarrolladores disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditor_id">Auditor</Label>
                    <Select
                      value={formData.auditor_id}
                      onValueChange={(value) =>
                        handleInputChange("auditor_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {auditores.length > 0 ? (
                          auditores.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-auditores" disabled>
                            No hay auditores disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_minimo">Soft Cap</Label>
                    <Input
                      id="monto_minimo"
                      type="number"
                      value={formData.monto_minimo}
                      onChange={(e) =>
                        handleInputChange("monto_minimo", e.target.value)
                      }
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket_minimo">Ticket Mínimo</Label>
                    <Input
                      id="ticket_minimo"
                      type="number"
                      value={formData.ticket_minimo}
                      onChange={(e) =>
                        handleInputChange("ticket_minimo", e.target.value)
                      }
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="approvalPolicy">
                      Política de Aprobación
                    </Label>
                    <Select
                      value={formData.approvalPolicy}
                      onValueChange={(value) =>
                        handleInputChange("approvalPolicy", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMISOR+AUDITOR">
                          Emisor + Auditor
                        </SelectItem>
                        <SelectItem value="AUDITOR_SOLO">
                          Solo Auditor
                        </SelectItem>
                        <SelectItem value="MAYORIA_2_DE_3">
                          Mayoría 2 de 3
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isLoading}
              >
                <Link href="/admin/projects">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Creando en Blockchain..." : "Crear Campaña"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RoleGuard>
  );
}
