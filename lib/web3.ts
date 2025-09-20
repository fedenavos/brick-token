"use client"

import { getContract, readContract, prepareContractCall, sendTransaction } from "thirdweb"
import { createThirdwebClient } from "thirdweb"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useActiveWallet } from "thirdweb/react"
import { polygon } from "thirdweb/chains"
import toast from "react-hot-toast"
import type { ProjectDetail, ProjectCard } from "./types"

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your-client-id",
})

// Contract ABI interfaces (mock - replace with actual ABI when available)
const PROJECT_REGISTRY_ABI = [
  "function getProjects() view returns (tuple(uint256 id, string name, uint256 softCap, uint256 hardCap, uint256 raised, uint8 status)[])",
  "function getProject(uint256 projectId) view returns (tuple(uint256 id, string name, string description, uint256 softCap, uint256 hardCap, uint256 raised, uint8 status, address[] actors))",
  "function invest(uint256 projectId) payable",
  "function submitEvidence(uint256 projectId, uint256 milestoneId, string cid)",
  "function approveMilestone(uint256 projectId, uint256 milestoneId)",
  "function rejectMilestone(uint256 projectId, uint256 milestoneId, string reason)",
  "function releaseFunds(uint256 projectId, uint256 milestoneId)",
  "function refund(uint256 projectId)",
  "function roleOf(address user) view returns (uint8)",
] as const

// Environment configuration
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true"
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890"

const contract = getContract({
  client,
  chain: polygon,
  address: CONTRACT_ADDRESS,
})

// Web3 Service Class
export class Web3Service {
  private queryClient: any

  constructor(queryClient: any) {
    this.queryClient = queryClient
  }

  // Projects
  async getProjects(): Promise<ProjectCard[]> {
    if (USE_MOCKS) {
      // Return mock data
      return [
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
      ]
    }

    const projects = await readContract({
      contract,
      method: "getProjects",
      params: [],
    })

    return projects.map((p: any) => ({
      projectId: p.id.toString(),
      name: p.name,
      softCap: p.softCap.toString(),
      hardCap: p.hardCap.toString(),
      raised: p.raised.toString(),
      estado: this.mapContractStatus(p.status),
      chainId: 137,
      contractAddress: CONTRACT_ADDRESS,
    }))
  }

  async getProject(projectId: string): Promise<ProjectDetail | null> {
    if (USE_MOCKS) {
      // Return mock detailed project data
      const mockProject = {
        projectId,
        name: "Complejo Residencial Palermo",
        coverUrl: "/modern-residential-building-palermo.jpg",
        city: "Buenos Aires",
        estado: "RECAUDACION" as const,
        softCap: "500000",
        hardCap: "1000000",
        raised: "650000",
        minTicket: "1000",
        roiEst: "12-16%",
        chainId: 137,
        contractAddress: "0x1234567890123456789012345678901234567890" as const,
        descripcion: {
          id: "desc-001",
          descripcion: "Complejo residencial de 120 unidades en zona premium de Palermo",
          direccion: "Av. Santa Fe 3500, Palermo, CABA",
          organizador: "Constructora Premium SA",
          rentabilidad_esperada: "12-16%",
          renta_garantizada: "Sí, 12% anual mínimo",
          plazo_renta: "24 meses",
          estado_actual_obra: "Excavación completada, iniciando fundaciones",
        },
        proyecto: {
          id: projectId,
          proyecto_descripcion_id: "desc-001",
          emisor_id: "emisor-001",
          desarrollador_id: "dev-001",
          auditor_id: "audit-001",
          chainId: 137,
          contractAddress: "0x1234567890123456789012345678901234567890" as const,
          moneda: "USDC" as const,
          monto_total: "1000000",
          monto_minimo: "500000",
          ticket_minimo: "1000",
          cantidad_etapas: 4,
          estado: "RECAUDACION" as const,
          approvalPolicy: "EMISOR+AUDITOR" as const,
        },
        actores: {
          emisor: {
            id: "emisor-001",
            nombre: "BrickChain Capital",
            address: "0xabcd..." as const,
          },
          desarrollador: {
            id: "dev-001",
            nombre: "Constructora Premium SA",
            address: "0xefgh..." as const,
          },
          auditor: {
            id: "audit-001",
            nombre: "PropTech Auditors",
            address: "0xijkl..." as const,
          },
        },
        investors: 45,
        hitos: [],
        events: [],
      }
      return mockProject
    }

    const project = await readContract({
      contract,
      method: "getProject",
      params: [BigInt(projectId)],
    })
    // Transform contract data to ProjectDetail format
    return null // Implement transformation
  }

  // Investment functions
  async invest(projectId: string, amount: string, wallet: any): Promise<string> {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return "0xMOCKTXHASH"
    }

    const transaction = prepareContractCall({
      contract,
      method: "invest",
      params: [BigInt(projectId)],
      value: BigInt(amount),
    })

    const result = await sendTransaction({
      transaction,
      account: wallet,
    })

    return result.transactionHash
  }

  // Milestone functions
  async submitEvidence(projectId: string, milestoneId: string, evidenceUri: string, wallet: any): Promise<string> {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return "0xMOCKEVIDENCETX"
    }

    const transaction = prepareContractCall({
      contract,
      method: "submitEvidence",
      params: [BigInt(projectId), BigInt(milestoneId), evidenceUri],
    })

    const result = await sendTransaction({
      transaction,
      account: wallet,
    })

    return result.transactionHash
  }

  async approveMilestone(projectId: string, milestoneId: string, wallet: any): Promise<string> {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return "0xMOCKAPPROVETX"
    }

    const transaction = prepareContractCall({
      contract,
      method: "approveMilestone",
      params: [BigInt(projectId), BigInt(milestoneId)],
    })

    const result = await sendTransaction({
      transaction,
      account: wallet,
    })

    return result.transactionHash
  }

  async rejectMilestone(projectId: string, milestoneId: string, reason: string, wallet: any): Promise<string> {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return "0xMOCKREJECTTX"
    }

    const transaction = prepareContractCall({
      contract,
      method: "rejectMilestone",
      params: [BigInt(projectId), BigInt(milestoneId), reason],
    })

    const result = await sendTransaction({
      transaction,
      account: wallet,
    })

    return result.transactionHash
  }

  // Utility functions
  private mapContractStatus(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: "BORRADOR",
      1: "RECAUDACION",
      2: "EN_EJECUCION",
      3: "FINALIZADO",
      4: "CANCELADO",
    }
    return statusMap[status] || "BORRADOR"
  }

  // Invalidate queries after transactions
  invalidateQueries(keys: string[]) {
    keys.forEach((key) => {
      this.queryClient.invalidateQueries({ queryKey: [key] })
    })
  }
}

// React Hooks for Web3 Integration
export function useWeb3Service() {
  const queryClient = useQueryClient()
  return new Web3Service(queryClient)
}

export function useProjects() {
  const web3Service = useWeb3Service()

  return useQuery({
    queryKey: ["projects"],
    queryFn: () => web3Service.getProjects(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useProject(projectId: string) {
  const web3Service = useWeb3Service()

  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => web3Service.getProject(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// Investment Hook
export function useInvest() {
  const web3Service = useWeb3Service()
  const wallet = useActiveWallet()

  return useMutation({
    mutationFn: async ({
      projectId,
      amount,
    }: {
      projectId: string
      amount: string
    }) => {
      const txHash = await web3Service.invest(projectId, amount, wallet)
      return { txHash }
    },
    onSuccess: (data, variables) => {
      toast.success("Inversión enviada exitosamente")
      web3Service.invalidateQueries(["projects", "project"])
      console.log("[v0] Investment successful:", data.txHash)
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Error en la transacción")
      console.error("[v0] Investment failed:", error)
    },
  })
}

// Evidence Upload Hook - Simplified without storage upload for now
export function useSubmitEvidence() {
  const web3Service = useWeb3Service()
  const wallet = useActiveWallet()

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      files,
    }: {
      projectId: string
      milestoneId: string
      files: File[]
    }) => {
      const evidenceUri = "ipfs://QmMockHashForEvidence"

      // Submit evidence to contract
      const txHash = await web3Service.submitEvidence(projectId, milestoneId, evidenceUri, wallet)
      return { txHash, evidenceUri }
    },
    onSuccess: (data, variables) => {
      toast.success("Evidencia enviada exitosamente")
      web3Service.invalidateQueries(["project"])
      console.log("[v0] Evidence submitted:", data.txHash)
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Error al enviar evidencia")
      console.error("[v0] Evidence submission failed:", error)
    },
  })
}

// Milestone Approval Hook
export function useMilestoneApproval() {
  const web3Service = useWeb3Service()
  const wallet = useActiveWallet()

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      action,
      reason,
    }: {
      projectId: string
      milestoneId: string
      action: "approve" | "reject"
      reason?: string
    }) => {
      let txHash: string

      if (action === "approve") {
        txHash = await web3Service.approveMilestone(projectId, milestoneId, wallet)
      } else {
        txHash = await web3Service.rejectMilestone(projectId, milestoneId, reason || "", wallet)
      }

      return { txHash, action }
    },
    onSuccess: (data, variables) => {
      const actionText = data.action === "approve" ? "aprobado" : "rechazado"
      toast.success(`Hito ${actionText} exitosamente`)
      web3Service.invalidateQueries(["project"])
      console.log(`[v0] Milestone ${data.action}:`, data.txHash)
    },
    onError: (error: any) => {
      toast.error(error?.message ?? "Error al procesar hito")
      console.error("[v0] Milestone action failed:", error)
    },
  })
}

// Role Management Hook
export function useUserRole(address?: string) {
  return useQuery({
    queryKey: ["userRole", address],
    queryFn: async () => {
      if (USE_MOCKS) {
        // Mock role based on address
        if (address?.toLowerCase().includes("admin")) return "admin"
        if (address?.toLowerCase().includes("audit")) return "auditor"
        if (address?.toLowerCase().includes("dev")) return "desarrollador"
        return "investor"
      }

      if (!address) return null

      const role = await readContract({
        contract,
        method: "roleOf",
        params: [address],
      })

      const roleMap: { [key: number]: string } = {
        0: "investor",
        1: "emisor",
        2: "desarrollador",
        3: "auditor",
        4: "admin",
      }
      return roleMap[Number(role)] || "investor"
    },
    enabled: !!address,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

// Network Validation Hook
export function useNetworkValidation() {
  const targetChainId = Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "137")

  return {
    targetChainId,
    isCorrectNetwork: (currentChainId?: number) => currentChainId === targetChainId,
    getNetworkName: (chainId: number) => {
      const networks: { [key: number]: string } = {
        1: "Ethereum",
        137: "Polygon",
        8453: "Base",
        42161: "Arbitrum",
      }
      return networks[chainId] || `Chain ${chainId}`
    },
  }
}

// Transaction Status Hook
export function useTransactionStatus(txHash?: string) {
  return useQuery({
    queryKey: ["transaction", txHash],
    queryFn: async () => {
      if (!txHash || USE_MOCKS) {
        return { status: "confirmed", blockNumber: 12345678 }
      }

      // In real implementation, check transaction status
      // This would typically use ethers or web3 to check tx status
      return { status: "pending" }
    },
    enabled: !!txHash,
    refetchInterval: (data) => (data?.status === "pending" ? 3000 : false), // Poll every 3s if pending
  })
}
