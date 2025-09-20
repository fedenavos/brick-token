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
      const response = await fetch("/api/projects")
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
      return response.json()
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
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error("Failed to fetch project")
      }
      return response.json()
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
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

      // Record investment via API
      await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorAddress: wallet.address,
          projectId,
          amount,
          txHash,
        }),
      })

      // Simulate transaction confirmation after delay
      setTimeout(async () => {
        await fetch("/api/investments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            txHash,
            status: "CONFIRMADO",
          }),
        })
        this.invalidateQueries(["projects", "project"])
      }, 3000)

      return txHash
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

  async submitEvidence(projectId: string, milestoneId: string, evidenceUri: string, wallet: any): Promise<string> {
    if (USE_MOCKS) {
      await fetch("/api/milestones/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          milestoneId,
          evidenceUri,
        }),
      })
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`
      return txHash
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
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`
      await fetch("/api/milestones/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          milestoneId,
          approverAddress: wallet.address,
          txHash,
        }),
      })
      return txHash
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
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`
      await fetch("/api/milestones/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          milestoneId,
          reason,
          approverAddress: wallet.address,
          txHash,
        }),
      })
      return txHash
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
        if (!address) return null

        // Use API route for database access
        const response = await fetch(`/api/user/${address}/role`)
        if (!response.ok) {
          throw new Error("Failed to fetch user role")
        }
        const data = await response.json()
        return data.role
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
