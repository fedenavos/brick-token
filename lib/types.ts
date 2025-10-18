export type Address = `0x${string}`
export type ChainId = number

// Enums de estado
export type ProyectoEstado =
  | "BORRADOR"
  | "RECAUDACION"
  | "SOFTCAP_NO_ALCANZADO"
  | "EN_EJECUCION"
  | "FINALIZADO"
  | "CANCELADO"
  | "REEMBOLSANDO"

export type HitoEstado = "PENDIENTE" | "EN_REVISION" | "APROBADO" | "RECHAZADO" | "VENCIDO"
export type AporteEstado = "PENDIENTE" | "CONFIRMADO" | "REEMBOLSADO"
export type AprobacionResultado = "APROBADO" | "RECHAZADO" | "OBSERVADO"
export type KycStatus = "PENDIENTE" | "APROBADO" | "RECHAZADO"
export type Moneda = "USDC" | "DAI" | "ETH" | "MATIC" | string

// Política de aprobación configurable por proyecto
export type ApprovalPolicy = "EMISOR+AUDITOR" | "AUDITOR_SOLO" | "MAYORIA_2_DE_3"

export type UserRole = "user" | "manager" | "admin"

export interface ProyectoDescripcion {
  id: string
  descripcion: string
  direccion: string
  organizador?: string
  rentabilidad_esperada?: string
  renta_garantizada?: string
  plazo_renta?: string
  estado_actual_obra?: string
  mediaUrls?: string[]
}

export interface Emisor {
  id: string
  nombre: string
  descripcion?: string
  address: Address
}

export interface Desarrollador {
  id: string
  nombre: string
  descripcion?: string
  address: Address
}

export interface Auditor {
  id: string
  nombre: string
  descripcion?: string
  address: Address
}

export interface Inversor {
  id: string
  nombre?: string
  descripcion?: string
  address: Address
  kyc_status: KycStatus
}

export interface Proyecto {
  id: string
  proyecto_descripcion_id: string
  emisor_id: string
  desarrollador_id: string
  auditor_id: string
  chainId: ChainId
  contractAddress: Address
  moneda: Moneda
  monto_total: string
  monto_minimo: string
  ticket_minimo: string
  cantidad_etapas: number
  renta_garantizada?: string
  plazo_renta?: string
  estado: ProyectoEstado
  approvalPolicy: ApprovalPolicy
  createdAt?: string
}

export interface Hito {
  id: string
  proyecto_id: string
  nro_hito: number
  descripcion: string
  imagenes?: string[]
  evidencia_uri?: string
  fecha_limite?: string
  porcentaje_presupuesto?: number
  estado: HitoEstado
}

export interface Aprobacion {
  id: string
  hito_id: string
  id_auditor?: string
  id_desarrollador?: string
  id_emisor?: string
  resultado: AprobacionResultado
  comentario?: string
  tx_hash?: string
  fecha?: string
}

export interface DesembolsoHito {
  id: string
  hito_id: string
  monto: string
  moneda?: Moneda
  tx_release?: string
  fecha?: string
}

export interface Aporte {
  id: string
  inversor_id: string
  proyecto_id: string
  monto: string
  moneda: Moneda
  tx_hash?: string
  fecha: string
  estado: AporteEstado
}

// DTOs de UI para marketplace/detalle
export interface ProjectCard {
  projectId: string
  name: string
  coverUrl: string
  city?: string
  estado: ProyectoEstado
  softCap: string
  hardCap: string
  raised: string
  minTicket: string
  roiEst?: string
  chainId: ChainId
  contractAddress: Address
}

export interface ProjectDetail extends ProjectCard {
  descripcion: ProyectoDescripcion
  proyecto: Proyecto
  actores: { emisor: Emisor; desarrollador: Desarrollador; auditor: Auditor }
  investors: number
  hitos: (Hito & { aprobaciones: Aprobacion[]; desembolsos: DesembolsoHito[] })[]
  aportesPropios?: Aporte[]
  events: ChainEvent[]
}

export interface ChainEvent {
  txHash: string
  type:
    | "InvestmentMade"
    | "MilestoneApproved"
    | "MilestoneRejected"
    | "FundsReleased"
    | "RefundProcessed"
    | "EvidenceSubmitted"
  blockNumber?: number
  timestamp?: number
  payload?: Record<string, any>
}
